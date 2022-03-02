const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const expressValidator = require('express-validator');
//cosnt { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

//User Model
const User = require('../../models/User');




// @route       POST api/users
// @desc        Register User
// @access      Public
router.post('/', 
[
    //validate the input ( middleware )
    expressValidator.check('name', 'Name is required').not().isEmpty(),
    expressValidator.check('email', 'Please include a valid email').isEmail(),
    expressValidator.check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    expressValidator.check('role', 'Please choose a role').not().isEmpty(),
], 
async (req, res) => {
    //check for errors
    const errors = expressValidator.validationResult(req)

    if(!errors.isEmpty()){
        //ถ้ามี errors จาก validators
        return res.status(400).json({ errors: errors.array() })
    }

    
    const { name, email, password, role } = req.body;

    try {
    // if User Exist
        let user = await User.findOne({ email });

        if(user){
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
        }

    // Get User Gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

    // Create User (not save yet)
        user = new User({
            name,
            email,
            password,
            avatar,
            role
        });

    // Encrypt Password
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(password, salt);
    
    // Set role
        if(role === 'admin'){
            user.isAdmin = true;
        }

        await user.save();

    // Return JWT Token
        const payload = {
            user: {
                uid : user.id,
                uemail: user.email,
                urole: user.isAdmin
            }
        };

        jwt.sign(payload, config.get('JWTSECRET'), {
            expiresIn: 360000
        }, (err,token) => {
            if(err) throw err;
            res.json({ token });
        });


    
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }

}); 

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const expressValidator = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

// @route       GET api/auth
// @desc        Get user data
// @access      Public
router.get('/', auth, async (req, res) => {
    try {
        // ได้ req.user.id จาก middleware auth และไม่ return password
        const user = await User.findById(req.user.uid).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});


// @route       POST api/auth
// @desc        Authenticate User & get Token
// @access      Public
router.post('/', 
[
    //validate the input ( middleware )
    expressValidator.check('email', 'Please include a valid email').isEmail(),
    expressValidator.check('password', 'Password is require').exists(),
], 
async (req, res) => {
    //check for errors
    const errors = expressValidator.validationResult(req)

    if(!errors.isEmpty()){
        //ถ้ามี errors จาก validators
        return res.status(400).json({ errors: errors.array() })
    }
    
    const {  email, password } = req.body;

    try {
    // if User Exist
        let user = await User.findOne({ email });

        if(!user){
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }

    // Check Password ( password from req, user.password from db )
        const isMatch = await bcrypt.compare(password , user.password);

        if(!isMatch){
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }


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
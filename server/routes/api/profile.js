const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
//const { route } = require('./users');

const expressValidator = require('express-validator');

// @route       GET api/profile/me
// @desc        Get current user profile
// @access      Private
router.get('/me', auth, async (req, res) => {
    try {
        // ค้นหา profile โดย user uid ได้จาก token และ populate ชื่อกับรูป ที่อยู่ใน user model ด้วย
        const profile = await Profile.findOne({ user: req.user.uid }).populate('user', ['name', 'avatar']);

        if(!profile){
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
        
    }
);

// @route       GET api/profile/
// @desc        Create or update user profile
// @access      Private
router.post('/',[ auth, [
    expressValidator.check('status', 'Status is required').not().isEmpty(),
    expressValidator.check('skills', 'Skills is required').not().isEmpty(),  
]], async (req, res) => {

    const errors = expressValidator.validationResult(req);
    if(!errors.isEmpty()){
        //ถ้ามี errors จาก validators
        return res.status(400).json({ errors: errors.array() });
    }

    const{
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.uid; // from auth middleware ( req.user.uid )
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    //console.log(profileFields.skills)

    
    //Build Social Object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try{
        let profile = await Profile.findOne({ user: req.user.uid });

        if(profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.uid },
                { $set: profileFields},
                { new: true });

                return res.status(201).json(profile);
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();

        return res.status(201).json(profile);
    }catch(err){
        console.log(err.message)
        return res.status(500).send('Server Error');
    }
});

// @route       GET api/profile/
// @desc        Get All profiles
// @access      Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        return res.status(200).json(profiles);
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server Error');
    }
});

// @route       GET api/profile/user/:user_id
// @desc        Get profile by user ID
// @access      Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id}).populate('user', ['name', 'avatar']);

        if(!profile) {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        return res.status(200).json(profile);

    } catch (err) {
        //console.log(err.message)
        if(err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        return res.status(500).send('Server Error');
    }
});

// @route       DELETE api/profile/
// @desc        Delete profile, user and post
// @access      Private
router.delete('/',auth, async (req, res) => {
    try {
        // @TODO - remove users posts


        // Remove profile
        await Profile.findOneAndDelete({ user: req.user.uid }).populate('user', ['name', 'avatar']);

        // Remove user
        await User.findOneAndDelete({ _id: req.user.uid });
        return res.status(200).json({ msg: 'User has been deleted' });
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server Error');
    }
});




module.exports = router;
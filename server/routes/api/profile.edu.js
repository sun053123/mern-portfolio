const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const expressValidator = require('express-validator');

// @route       PUT api/profile/education
// @desc        Add profile education
// @access      Private
router.put('/education', [ auth, [
    expressValidator.check('school', 'School is required').not().isEmpty(),
    expressValidator.check('degree', 'Degree is required').not().isEmpty(),
    expressValidator.check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    expressValidator.check('from', 'From date is required').not().isEmpty(),]
], async (req, res) => {
    const errors = expressValidator.validationResult(req);
    if(!errors.isEmpty()){
        //ถ้ามี errors จาก validators
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school: school,
        degree: degree,
        fieldofstudy: fieldofstudy,
        from: from,
        to: to,
        current: current,
        description: description,
    }

    try {
        const profile = await Profile.findOne({ user: req.user.uid });

        // Add to exp array (unshift = push)
        profile.education.unshift(newEdu);

        await profile.save();
        return res.status(201).json(profile);
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server Error');
    }
        
});

router.patch('/education/:edu_id', [ auth, [
    expressValidator.check('school', 'School is required').not().isEmpty(),
    expressValidator.check('degree', 'Degree is required').not().isEmpty(),
    expressValidator.check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    expressValidator.check('from', 'From date is required').not().isEmpty(),]
], async (req, res) => {
    const errors = expressValidator.validationResult(req);
    if(!errors.isEmpty()){
        //ถ้ามี errors จาก validators
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school: school,
        degree: degree,
        fieldofstudy: fieldofstudy,
        from: from,
        to: to,
        current: current,
        description: description,
    }

    try {
        const profile = await Profile.findOne({ user: req.user.uid });

        if (profile){
            const eduIndex = profile.education.findIndex( item => item.id === req.params.edu_id); 

            try {
                profile.education[eduIndex] = newEdu;
                await profile.save();
                return res.status(201).json(profile);

            } catch (err) {
                return res.status(500).send('Server Error');
            }
        }
        return res.status(400).json('bad request');
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server Error');
    }
        
});
11
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.uid, });
        // Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        //console.log(removeIndex)
        profile.education.splice(removeIndex, 1);
        await profile.save();

        return res.status(200).json(profile);
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server Error');
    }
        
});

module.exports = router;
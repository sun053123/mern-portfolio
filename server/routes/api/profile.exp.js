const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const expressValidator = require('express-validator');

// @route       PUT api/profile/experience
// @desc        Add profile experience
// @access      Private
router.put('/experience', [ auth, [
    expressValidator.check('title', 'Title is required').not().isEmpty(),
    expressValidator.check('company', 'Company is required').not().isEmpty(),
    expressValidator.check('from', 'From date is required').not().isEmpty(),]
], async (req, res) => {
    const errors = expressValidator.validationResult(req);
    if(!errors.isEmpty()){
        //ถ้ามี errors จาก validators
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title: title,
        company: company,
        location: location,
        from: from,
        to: to,
        current: current,
        description: description,
    }

    try {
        const profile = await Profile.findOne({ user: req.user.uid });

        // Add to exp array (unshift = push)
        profile.experience.unshift(newExp);

        await profile.save();
        return res.status(201).json(profile);
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server Error');
    }
        
});

// @route       PATCH api/profile/experience/:exp_id
// @desc        Update profile experience
// @access      Private
router.patch('/experience/:exp_id', [ auth, [
    expressValidator.check('title', 'Title is required').not().isEmpty(),
    expressValidator.check('company', 'Company is required').not().isEmpty(),
    expressValidator.check('from', 'From date is required').not().isEmpty(),]
], async (req, res) => {
    const errors = expressValidator.validationResult(req);
    if(!errors.isEmpty()){
        //ถ้ามี errors จาก validators
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title: title,
        company: company,
        location: location,
        from: from,
        to: to,
        current: current,
        description: description,
    }

    try {
        const profile = await Profile.findOne({ user: req.user.uid });

        if (profile){
            const expIndex = profile.experience.findIndex( item => item.id === req.params.exp_id);

            try {
                profile.experience[expIndex] = newExp;
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

// @route       DELETE api/profile/experience/:exp_id
// @desc        delete profile experience
// @access      Private
// FIXME - ต้องทำการ update array ด้วย
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.uid, });
        // Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        //console.log(removeIndex)
        profile.experience.splice(removeIndex, 1);

        await profile.save();

        return res.status(200).json(profile);
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server Error');
    }
        
});

module.exports = router;
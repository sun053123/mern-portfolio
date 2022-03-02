const express = require('express');
const router = express.Router();
const expressValidator = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Post = require('../../models/Post'); 

// @route       GET api/posts
// @desc        Test Route
// @access      Private
router.post('/', [auth, [
    expressValidator.check('title', 'Title is required').not().isEmpty(),
    expressValidator.check('body', 'Body is required').not().isEmpty(),
]],  async (req, res) => {
    const errors = expressValidator.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.uid).select('-password');

            const newPost = new Post({
                title: req.body.title,
                body: req.body.body,
                name: user.name,
                avatar: user.avatar,
                user: req.user.uid,
                });
                const post = await newPost.save();
                res.status(200).json(post);
                } catch (err) {
                    console.error(err.message);
                    res.status(500).send('Server Error');
                    }
                });
                    

module.exports = router;
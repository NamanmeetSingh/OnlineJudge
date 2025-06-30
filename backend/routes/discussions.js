const express = require('express');
const router = express.Router();
const DiscussionController = require('../controllers/discussionController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', DiscussionController.getDiscussions);
router.get('/:id', DiscussionController.getDiscussion);

// Protected routes (require authentication)
router.post('/', auth, DiscussionController.createDiscussion);
router.put('/:id', auth, DiscussionController.updateDiscussion);
router.delete('/:id', auth, DiscussionController.deleteDiscussion);
router.post('/:id/reply', auth, DiscussionController.addReply);
router.post('/:id/vote', auth, DiscussionController.voteDiscussion);

module.exports = router;

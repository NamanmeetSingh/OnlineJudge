const express = require('express');
const router = express.Router();

// TODO: Implement discussion controllers and routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Discussions endpoint - Coming soon!',
    data: []
  });
});

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Get discussion by ID - Coming soon!',
    data: null
  });
});

module.exports = router;

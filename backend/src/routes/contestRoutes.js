const express = require('express');
const router = express.Router();

// TODO: Implement contest controllers and routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Contests endpoint - Coming soon!',
    data: []
  });
});

router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Get contest by ID - Coming soon!',
    data: null
  });
});

module.exports = router;

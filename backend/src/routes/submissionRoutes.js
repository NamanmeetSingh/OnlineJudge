const express = require('express');
const router = express.Router();

// TODO: Implement submission controllers and routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Submissions endpoint - Coming soon!',
    data: []
  });
});

router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Submit code - Coming soon!',
    data: null
  });
});

module.exports = router;

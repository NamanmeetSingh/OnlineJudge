// Admin middleware to check if user has admin privileges
const adminAuth = (req, res, next) => {
  try {
    // Check if user is authenticated (should be handled by auth middleware first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required. You do not have sufficient privileges.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization check'
    });
  }
};

module.exports = adminAuth;

/**
 * Simple authentication controller for TDD demonstration
 * Just enough code to make the test pass
 */

/**
 * Login controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const login = (req, res) => {
  // For simplicity in this TDD example, we're not checking credentials yet
  // We just return the minimum required to make the test pass
  res.status(200).json({
    token: 'sample-jwt-token',
    user: {
      id: 1,
      email: 'user@example.com',
      name: 'Test User'
    }
  });
};

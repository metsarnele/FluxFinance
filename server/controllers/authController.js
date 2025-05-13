import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// In a real application, this would be stored in a database
const users = [
  {
    id: 1,
    email: 'user@example.com',
    // This is a hashed version of 'correctpassword'
    password: '$2b$10$qlk74X6y7ILrtzkk0t3G/OojUrUkLVvU0dCWzkWjauMILTqWj0fty',
    name: 'Test User'
  }
];

// JWT secret key (in a real app, this would be in an environment variable)
const JWT_SECRET = 'your-secret-key';

/**
 * Login controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(u => u.email === email);
    
    // If user doesn't exist or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email or password is incorrect' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Return token and user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

/**
 * For testing purposes - generates a hash for a given password
 * This would not be in production code
 */
export const generateHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

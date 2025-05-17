const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      authProvider: 'local'
    });
    
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      badges: user.badges
    };
    
    res.status(201).json({ user: userData, token });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is using local auth
    if (user.authProvider !== 'local') {
      return res.status(400).json({ 
        error: `Please login using ${user.authProvider} authentication` 
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      badges: user.badges
    };
    
    res.json({ user: userData, token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Google OAuth login/register
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify the token with Firebase Admin SDK
    // This would be implemented with firebase-admin
    // For now, we'll assume we have the user data from the token
    const { name, email, picture, uid } = req.body; // This would come from Firebase verification
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user
      user.googleId = uid;
      user.authProvider = 'google';
      user.profilePicture = picture || user.profilePicture;
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId: uid,
        profilePicture: picture,
        authProvider: 'google'
      });
      await user.save();
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return user data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      badges: user.badges
    };
    
    res.json({ user: userData, token });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getProfile
}; 
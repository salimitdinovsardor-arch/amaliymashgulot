const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getClearCookieOptions,
} = require('../utils/cookieOptions');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user in MongoDB
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    const decodedRefresh = jwt.decode(refreshToken);
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(decodedRefresh.exp * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    });

    // Log registration activity
    await Activity.create({
      user: user._id,
      type: 'profile_updated',
      title: 'Joined EduHub',
      description: 'Account created and verified successfully.',
    });

    // Set secure HttpOnly cookies
    res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    // Clean user response object
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      headline: user.headline,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
      enrolledCourses: user.enrolledCourses,
      preferences: user.preferences,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to EduHub.',
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get tokens
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user (include password for verification)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token in DB
    const decodedRefresh = jwt.decode(refreshToken);
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(decodedRefresh.exp * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    });

    // Set secure HttpOnly cookies
    res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      headline: user.headline,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
      enrolledCourses: user.enrolledCourses,
      preferences: user.preferences,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Rotate and refresh access token using refresh token
 * @access  Public (Cookie-authenticated)
 */
const refresh = async (req, res, next) => {
  try {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found in cookies or request.',
        code: 'NO_REFRESH_TOKEN',
      });
    }

    // Verify token cryptographic signature
    let decoded;
    try {
      decoded = jwt.verify(
        incomingToken,
        process.env.JWT_REFRESH_SECRET || 'eduhub_refresh_fallback_secret_key_32chars!'
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token signature.',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    // Look up token in database
    const storedToken = await RefreshToken.findOne({ token: incomingToken });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token does not exist in active registry.',
        code: 'TOKEN_NOT_REGISTERED',
      });
    }

    // Detect Token Reuse (Security Violation)
    if (storedToken.revoked) {
      // Immediate security alert: Revoke all refresh tokens for this user!
      await RefreshToken.updateMany({ user: storedToken.user }, { revoked: true });

      // Clear cookies
      res.clearCookie('accessToken', getClearCookieOptions());
      res.clearCookie('refreshToken', getClearCookieOptions());

      return res.status(403).json({
        success: false,
        message: 'Security warning: Revoked token reuse detected. All active sessions invalidated.',
        code: 'TOKEN_REUSE_DETECTED',
      });
    }

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User for this token no longer exists.',
        code: 'USER_NOT_FOUND',
      });
    }

    // Token Rotation: Generate new token pair
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Invalidate the old refresh token and link to the new one
    storedToken.revoked = true;
    storedToken.replacedByToken = newRefreshToken;
    await storedToken.save();

    // Store the new refresh token in DB
    const decodedNew = jwt.decode(newRefreshToken);
    await RefreshToken.create({
      user: user._id,
      token: newRefreshToken,
      expiresAt: new Date(decodedNew.exp * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    });

    // Set renewed HttpOnly cookies
    res.cookie('accessToken', newAccessToken, getAccessTokenCookieOptions());
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Token successfully refreshed and rotated.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke refresh token & clear cookies
 * @access  Public
 */
const logout = async (req, res, next) => {
  try {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

    if (incomingToken) {
      // Revoke token in DB
      await RefreshToken.findOneAndUpdate(
        { token: incomingToken },
        { revoked: true }
      );
    }

    // Clear HttpOnly cookies
    res.clearCookie('accessToken', getClearCookieOptions());
    res.clearCookie('refreshToken', getClearCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Tokens cleared and revoked.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate({
      path: 'enrolledCourses.course',
      model: 'Course',
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const safeUser = user.toJSON ? user.toJSON() : { ...user._doc };
    delete safeUser.password;

    res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'headline', 'bio', 'phone', 'location', 'avatar', 'preferences'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: 'profile_updated',
      title: 'Profile Updated',
      description: 'Personal details and learning preferences saved.',
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match our records.',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Revoke all existing refresh tokens for security
    await RefreshToken.updateMany({ user: user._id }, { revoked: true });

    // Generate fresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const decodedRefresh = jwt.decode(refreshToken);
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(decodedRefresh.exp * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    });

    // Set updated cookies
    res.cookie('accessToken', accessToken, getAccessTokenCookieOptions());
    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Password changed successfully! All other sessions revoked.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  changePassword,
};

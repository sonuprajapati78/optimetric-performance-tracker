const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const logger = require('../utils/logger');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

/**
 * Register new employee
 * POST /api/v1/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;

  // ✅ PRODUCTION-LEVEL: Validate all inputs
  if (!name || !email || !password) {
    logger.warn('Registration attempt with missing fields');
    throw new ApiError(400, 'Name, email, and password required');
  }

  // ✅ Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  // ✅ Validate password strength
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  // ✅ Normalize email (lowercase, trim)
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();

  // Check if employee already exists
  const existingEmployee = await Employee.findOne({ 
    $or: [{ email: normalizedEmail }, { name: normalizedName }] 
  });
  
  if (existingEmployee) {
    logger.warn(`Registration failed: Duplicate email or name ${normalizedEmail}`);
    throw new ApiError(409, 'Email or name already registered. Please login or use different details.');
  }

  // ✅ Hash password with proper error handling
  let hashedPassword;
  try {
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  } catch (bcryptErr) {
    logger.error('Password hashing error:', bcryptErr.message);
    throw new ApiError(500, 'Registration error. Please try again.');
  }

  // Create employee with normalized data
  const employee = new Employee({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    department: department || 'Sales',
    role: 'employee',
    isActive: true,
  });

  await employee.save();
  logger.info(`New employee registered: ${normalizedName} (${normalizedEmail})`);

  // Generate token
  const token = jwt.sign({ id: employee._id, role: employee.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });

  res.status(201).json({
    message: 'Employee registered successfully',
    employee: {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
    },
    token,
  });
});

/**
 * Login employee
 * POST /api/v1/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ✅ PRODUCTION-LEVEL: Validate input
  if (!email || !password) {
    logger.warn('Login attempt with missing credentials');
    throw new ApiError(400, 'Email and password required');
  }

  // ✅ Normalize email (lowercase, trim)
  const normalizedEmail = email.trim().toLowerCase();
  
  logger.info(`Login attempt for email: ${normalizedEmail}`);

  // Find employee and include password field
  const employee = await Employee.findOne({ email: normalizedEmail }).select('+password');
  if (!employee) {
    logger.warn(`Login failed: Employee not found for email ${normalizedEmail}`);
    throw new ApiError(401, 'Invalid email or password');
  }

  // ✅ PRODUCTION-LEVEL: Validate password with detailed checks
  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, employee.password);
  } catch (bcryptErr) {
    logger.error(`Password comparison error for ${normalizedEmail}:`, bcryptErr.message);
    throw new ApiError(500, 'Authentication error. Please try again.');
  }

  if (!isPasswordValid) {
    logger.warn(`Login failed: Invalid password for email ${normalizedEmail}`);
    throw new ApiError(401, 'Invalid email or password');
  }

  // ✅ Check if employee is active
  if (!employee.isActive) {
    logger.warn(`Login failed: Inactive employee ${normalizedEmail}`);
    throw new ApiError(403, 'Your account is inactive. Contact admin.');
  }

  // Update last login
  employee.lastLogin = new Date();
  await employee.save();

  // Generate token
  const token = jwt.sign({ id: employee._id, role: employee.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });

  logger.info(`Employee logged in successfully: ${employee.name} (${normalizedEmail})`);

  res.json({
    message: 'Login successful',
    employee: {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
    },
    token,
  });
});

/**
 * Get current employee profile
 * GET /api/v1/auth/me
 */
exports.getMe = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.user.id);
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  res.json({
    employee: {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      joinDate: employee.joinDate,
      lastLogin: employee.lastLogin,
    },
  });
});

/**
 * Logout
 * POST /api/v1/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  logger.info(`Employee logged out: ${req.user.id}`);
  res.json({ message: 'Logout successful' });
});

/**
 * Verify token
 * GET /api/v1/auth/verify
 */
exports.verifyToken = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.user.id);
  if (!employee) {
    throw new ApiError(401, 'Unauthorized');
  }

  res.json({ valid: true, employee: req.user });
});

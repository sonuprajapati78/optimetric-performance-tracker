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

  // Validate input
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password required');
  }

  // Check if employee already exists
  const existingEmployee = await Employee.findOne({ $or: [{ email }, { name }] });
  if (existingEmployee) {
    throw new ApiError(409, 'Employee with this email or name already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create employee
  const employee = new Employee({
    name,
    email,
    password: hashedPassword,
    department: department || 'Sales',
    role: 'employee',
  });

  await employee.save();
  logger.info(`New employee registered: ${name}`);

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

  if (!email || !password) {
    throw new ApiError(400, 'Email and password required');
  }

  // Find employee and include password field
  const employee = await Employee.findOne({ email }).select('+password');
  if (!employee) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, employee.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Update last login
  employee.lastLogin = new Date();
  await employee.save();

  // Generate token
  const token = jwt.sign({ id: employee._id, role: employee.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });

  logger.info(`Employee logged in: ${employee.name}`);

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

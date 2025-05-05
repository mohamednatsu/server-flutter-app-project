const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../db');
const router = express.Router();

// Registration with improved validation
router.post("/register", [
       body('name').trim().notEmpty().withMessage('Name is required'),
       body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
       body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
       body('confirmPassword').custom((value, { req }) => {
              if (value !== req.body.password) throw new Error('Passwords do not match');
              return true;
       }),
       body('level').optional().isInt({ min: 1, max: 4 }).withMessage('Invalid level'),
       body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
], async (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

       const { name, email, password, gender, level } = req.body;

       try {
              const existingUser = await prisma.user.findUnique({ where: { email } });
              if (existingUser) return res.status(400).json({ error: 'Email already in use' });

              const hashedPassword = await bcrypt.hash(password, 10);
              const user = await prisma.user.create({
                     data: {
                            name,
                            email,
                            password: hashedPassword,
                            gender,
                            level: level || 1 // Default level
                     },
              });

              // Generate token for immediate login after registration
              const token = jwt.sign({ id: user.id }, "secret-key", { expiresIn: '1h' });
              res.status(201).json({ user, token });
       } catch (err) {
              console.error("Registration error:", err);
              res.status(500).json({ error: 'Server error' });
       }
});

// Login endpoint
router.post("/login", [
       body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
       body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

       const { email, password } = req.body;

       try {
              const user = await prisma.user.findUnique({ where: { email } });
              if (!user) return res.status(400).json({ error: 'Invalid credentials' });

              const isMatch = await bcrypt.compare(password, user.password);
              if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

              const token = jwt.sign({ id: user.id }, "secret-key", { expiresIn: '1h' });
              res.json({
                     token,
                     user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            level: user.level
                     }
              });
       } catch (err) {
              console.error("Login error:", err);
              res.status(500).json({ error: 'Server error' });
       }
});

module.exports = router;
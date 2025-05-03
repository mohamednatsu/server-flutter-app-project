// routes/user.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const prisma = require('../db');

router.post(
       '/register',
       [
              body('name').notEmpty().withMessage('Name is required'),
              body('email').isEmail().withMessage('Valid email is required'),
              body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
              body('confirmPassword').custom((value, { req }) => {
                     if (value !== req.body.password) throw new Error('Passwords do not match');
                     return true;
              }),
              body('level').optional().isIn([1, 2, 3, 4]).withMessage('Level must be 1, 2, 3, or 4'),
              body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
       ],
       async (req, res) => {
              const errors = validationResult(req);
              if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

              const { name, email, password, gender, level } = req.body;

              try {
                     const existingUser = await prisma.user.findUnique({ where: { email } });
                     if (existingUser) return res.status(400).json({ error: 'Email already in use' });

                     // Optionally hash the password here (e.g., with bcrypt)
                     const user = await prisma.user.create({
                            data: { name, email, password, gender, level },
                     });

                     res.status(201).json(user);
              } catch (err) {
                     res.status(500).json({ error: 'Server error' });
              }
       }
);

module.exports = router;

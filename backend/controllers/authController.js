const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set');

            return res.status(500).json({
                success: false,
                message: 'Server misconfiguration'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        return res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    studentID: user.studentID,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while logging in'
        });
    }
};


//Registration API

const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, studentId } = req.body;

        if (
            typeof fullName !== 'string' || !fullName.trim() ||
            typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password ||
            typeof studentId !== 'string' || !studentId.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, password, and student ID are all required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with that email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            studentID: studentId.trim()
        });

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set');

            return res.status(500).json({
                success: false,
                message: 'Server misconfiguration'
            });
        }

        const token = jwt.sign(
            {
                userId: newUser._id,
                role: newUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        return res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    studentID: newUser.studentID,
                    role: newUser.role
                }
            }
        });

    } catch (error) {
        console.error('Register error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while registering'
        });
    }
};

module.exports = {
    loginUser,
    registerUser
};
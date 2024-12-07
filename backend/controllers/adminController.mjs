import connectDB from '../config/db.mjs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from "cookie-parser"
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// In-memory store for OTPs
const otps = {};

dotenv.config();

// Register a New Admin
export const registerNewAdmin = async (req, res) => {
    const { email, dob, name, username, phone, password } = req.body;

    // Validate input fields
    if (!email || !dob || !name || !username || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const connection = await connectDB();
        const userId = uuidv4();

        // Check if admin already exists by email or username
        const [existingAdmins] = await connection.execute(
            `SELECT * FROM users WHERE email = ? OR username = ? AND role='admin'`,
            [email, username]
        );

        if (existingAdmins.length > 0) {
            return res.status(400).json({ message: 'Admin with this email or username already exists.' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const [result] = await connection.execute(
            `INSERT INTO users (id, name, dob, email, password, username, phone, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'admin')`,
            [userId, name, dob, email, hashedPassword, username, phone]
        );


        res.status(201).json({
            message: 'Admin registered successfully.',
            adminId: result.insertId,
        });
    } catch (error) {
        console.error('Error registering new admin:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const loginAndgenerateOtp = async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Username is required.' });
    }

    try {
        const connection = await connectDB();

        
        const [admins] = await connection.execute(`SELECT * FROM users WHERE username = ? AND role = 'admin'`, [username]);

        if (admins.length === 0) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const admin = admins[0];
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        otps[admin.email] = { otp, expiresAt: Date.now() + 300000 }; // Store OTP for 5 minutes

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ottaamaresh.2001@gmail.com',
                pass: 'sgzf umqq vajs cxrr',
            },
            debug: true,
        });

        transporter.sendMail({
            from: '"IRCTC Railway Management System" <ottaamaresh.2001@gmail.com>',
            to: admin.email,
            subject: 'Your OTP for Admin Login',
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
        }, (err, info) => {
            if (err) {
                console.error("Error sending email:", err);
            }
            console.log("Email sent:", info);
            res.status(200).json({ message: 'OTP sent to the registered email.' });

        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating OTP.' });
    }
};

export const verifyOtp = async (req, res) => {
    const { username, otp } = req.body;

    if (!username || !otp) {
        return res.status(400).json({ message: 'Username and OTP are required.' });
    }

    try {
        const connection = await connectDB();

        // Fetch admin by username
        const [admins] = await connection.execute(`SELECT * FROM users WHERE username = ? AND role = 'admin'`, [username]);

        if (admins.length === 0) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const admin = admins[0];

        // Validate OTP
        const storedOtp = otps[admin.email];
        if (!storedOtp || storedOtp.otp !== parseInt(otp) || storedOtp.expiresAt < Date.now()) {
            return res.status(401).json({ message: 'Invalid or expired OTP.' });
        }

        // Clear OTP after use
        delete otps[admin.email];

        // Generate JWT
        const token = jwt.sign(
            { userId: admin.id, role: admin.role },
            process.env.JWT_SECRET_KEY, // Replace with an environment variable in production
            { expiresIn: '1h' }
        );

        // Set token as a secure, HTTP-only cookie
        res.cookie('auth_token', token, {
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            maxAge: 3600000, // Cookie expiration (1 hour in milliseconds)
        });

        res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying OTP.' });
    }
};

//add new train via admin only
export const addNewTrain = async(req, res) => {
    const { trainNo, source, destination, totalSeats } = req.body;

    if (!source || !destination || !totalSeats) {
        return res.status(400).json({ message: 'Source, destination, and total seats are required' });
    }

    try {
        const db = await connectDB();
        const query = `
            INSERT INTO trains (trainNo, source, destination, total_seats, available_seats)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [trainNo, source, destination, totalSeats, totalSeats]);

        return res.status(201).json({ message: 'Train added successfully', trainId: result.trainNo });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating train', error });
    }
}



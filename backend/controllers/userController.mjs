import connectDB from '../config/db.mjs';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    const { name, dob, email, password, username, phone } = req.body;

    if (!name || !dob || !email || !password || !username || !phone) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        const role = 'user';
        const connection = await connectDB();

        const [result] = await connection.execute(
            `INSERT INTO users (id, name, dob, email, password, username, phone, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, name, dob, email, hashedPassword, username, phone, role]
        );

        await connection.end();
        res.status(201).json({ message: 'User registered successfully!', userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user.' });
    }
};


dotenv.config();

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const connection = await connectDB();

        // Fetch user by username
        const [users] = await connection.execute(`SELECT * FROM users WHERE username = ?`, [username]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT (only once)
        const tokenPayload = { userId: user.id, role: user.role }; // Payload for token
        const secretKey = process.env.JWT_SECRET_KEY; // Use a secure environment variable in production
        const tokenOptions = { expiresIn: '1h' }; // Token expiration

        const token = jwt.sign(tokenPayload, secretKey, tokenOptions); // Generate the token once

        // Debug to ensure token consistency
        console.log('Generated Token:', token);

        // Set the same token in the HTTP-only cookie
        res.cookie('auth_token', token, {
            httpOnly: true, // Prevents client-side JavaScript access
            secure: process.env.NODE_ENV === 'production', // Send cookie over HTTPS in production
            maxAge: 3600000, // Token validity: 1 hour
        });

        // Send the token in the response (optional for testing)
        res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


export const seatAvailable = async(req, res) => {
    const { source, destination } = req.body;

    if (!source || !destination) {
        return res.status(400).json({ message: 'Source and destination are required' });
    }

    try {
        const db = await connectDB();
        const query = `
            SELECT * FROM trains WHERE source = ? AND destination = ? 
        `;
        const [availableTrains] = await db.execute(query, [source, destination]);

        if (availableTrains.length === 0) {
            return res.status(404).json({ message: 'No trains found for the given route' });
        }

        return res.status(200).json({ trains: availableTrains });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching seat availability', error });
    }
};

export const bookSeat = async(req, res) => {
    const { trainNo, seatCount, source, destination } = req.body;

    if (!trainNo || !seatCount || !source || !destination) {
        return res.status(400).json({ message: 'Train Number, seat count, source and destination are required.' });
    }

    try {
        const connection = await connectDB();

        const [train] = await connection.execute(
            `SELECT * FROM trains WHERE trainNo = ? AND source = ? AND destination = ?`,
            [trainNo, source, destination]
        );

        if (train.length === 0) {
            return res.status(404).json({ message: 'Train not found.' });
        }

        const trainData = train[0];
        if (trainData.available_seats < seatCount) {
            return res.status(400).json({ message: 'Not enough seats available.' });
        }

        await connection.execute(
            `UPDATE trains SET available_seats = available_seats - ? WHERE trainNo = ?`,
            [seatCount, trainNo]
        );

        const [result] = await connection.execute(
            `INSERT INTO bookings (user_id, train_id, seat_count) VALUES (?, ?, ?)`,
            [req.user.userId, trainNo, seatCount]
        );

        res.status(201).json({ message: 'Seat booked successfully!', bookingId: result.insertId });
    } catch (error) {
        console.error('Error booking seat:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


export const specificBookingDetail = async(req, res) => {
    const { bookingId } = req.params;

    if (!bookingId) {
        return res.status(400).json({ message: 'Booking ID is required.' });
    }

    try {
        const connection = await connectDB();

        const [booking] = await connection.execute(
            `SELECT b.booking_id, b.seat_count, b.created_at, t.trainNo, t.source, t.destination 
             FROM bookings b 
             INNER JOIN trains t ON b.train_id = t.trainNo
             WHERE b.booking_id = ? AND b.user_id = ?`,
            [bookingId, req.user.userId]
        );

        if (booking.length === 0) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        res.status(200).json({ booking: booking[0] });
    } catch (error) {
        console.error('Error fetching booking details:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}
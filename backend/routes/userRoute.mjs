import express from 'express';
import { bookSeat, loginUser, registerUser, seatAvailable, specificBookingDetail } from '../controllers/userController.mjs';
import { checkAuth } from '../middlewares/checkAuth.mjs';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/seats', checkAuth('user'), seatAvailable);

router.post('/book-seat', checkAuth('user'), bookSeat);

router.get('/booking/:bookingId', checkAuth('user'), specificBookingDetail);

export default router;

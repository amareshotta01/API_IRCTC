import express from 'express';
import { addNewTrain, loginAndgenerateOtp, registerNewAdmin, verifyOtp } from '../controllers/adminController.mjs';
import { apiKeyMiddleware } from '../middlewares/adminApiKeyCheck.mjs';
import { checkAuth } from '../middlewares/checkAuth.mjs';
const router = express.Router();

//Register new admin
router.post('/new-admin-register', apiKeyMiddleware, checkAuth('admin'), registerNewAdmin);

// Generate OTP
router.post('/login-generate-otp',apiKeyMiddleware, loginAndgenerateOtp);

// Verify OTP
router.post('/verify-otp',apiKeyMiddleware, verifyOtp);

//adding new train
router.post('/train', apiKeyMiddleware, checkAuth('admin'), addNewTrain);

export default router;

// 路由
import express from 'express';
import { login, logout, register, sendVerifyOtp, verifyEamil } from '../controllers/authController.js';
// 中介軟體
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEamil);

export default authRouter;
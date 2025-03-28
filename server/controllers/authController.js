import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import handleSendMail from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE, REGISTER_TEMPLATE } from "../config/emailTemplates.js"

// 註冊
export const register = async (req, res) => {

    const { name, email, password } = req.body;

    // 信件設定
    const subject = "註冊 MERN-AUTH 成功";
    const html = REGISTER_TEMPLATE.replace("{{name}}", name).replace("{{email}}", email);

    if (!name || !email || !password) {
        return res.json({
            success: false,
            message: '註冊失敗，請填寫所有欄位'
        });
    }

    try {

        // 以 email 來判斷是否已註冊過，因為email是唯一值
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({
                success: false,
                message: '該使用者已註冊'
            });
        }

        // 密碼加密後並創建新使用者
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        // 當用戶登入時生成JWT令牌並返回給用戶，後續在請求中將這個令牌用作身分認證憑證
        const token = jwt.sign(
            { id: user._id }, // 這邊儲存的id是MONGODB中自動生成的_id
            process.env.JWT_SECRET, // 創建令牌所使用的密鑰
            { expiresIn: '7d' } // 令牌於7天後過期
        )

        // res.cookie(name, value [, options])
        res.cookie('token', token, {
            httpOnly: true, // 標記此cookie僅能通過http(s)訪問，無法通過JavaScript訪問，防止XSS攻擊
            secure: process.env.NODE_ENV === 'production', // cookie 是否只在https連線中使用
            sameSite: 'lax', // 根據環境變量來設置並只在生產環境中啟用
            maxAge: 7 * 24 * 60 * 60 * 1000 // cookie有效期限的設置
        });

        await handleSendMail(email, name, subject, html)
            .then(() => {
                return res.json({
                    success: true,
                    message: '用戶註冊成功，已寄發註冊信'
                });
            })
            .catch(() => {
                return res.json({
                    success: false,
                    message: '寄送失敗'
                });
            })



    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
}

// 登入
export const login = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({
            success: false,
            message: '登入失敗，請填寫所有欄位'
        });
    }

    try {

        // 使用 email 來取得資料庫用戶資料
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: '登入失敗，該用戶不存在'
            });
        }

        // 驗證用戶密碼，並返回布林值
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: '登入失敗，密碼輸入錯誤'
            });
        }

        // 當用戶登入時生成JWT令牌並返回給用戶，後續在請求中將這個令牌用作身分認證憑證
        const token = jwt.sign(
            { id: user._id }, // 這邊儲存的id是MONGODB中自動生成的_id
            process.env.JWT_SECRET, // 創建令牌所使用的密鑰
            { expiresIn: '7d' } // 令牌於7天後過期
        )

        // res.cookie(name, value [, options])
        res.cookie('token', token, {
            httpOnly: true, // 標記此cookie僅能通過http(s)訪問，無法通過JavaScript訪問，防止XSS攻擊
            secure: process.env.NODE_ENV === 'production', // cookie 是否只在https連線中使用
            sameSite: 'lax', // 根據環境變量來設置並只在生產環境中啟用
            maxAge: 7 * 24 * 60 * 60 * 1000 // cookie有效期限的設置
        });

        return res.json({
            success: true,
            message: '登入成功'
        });

    } catch (error) {
        return res.json({
            success: false,
            message: '登入失敗，請填寫所有欄位'
        });
    }
}

// 登出
export const logout = async (req, res) => {

    try {
        res.clearCookie('token', {
            httpOnly: true, // 標記此cookie僅能通過http(s)訪問，無法通過JavaScript訪問，防止XSS攻擊
            secure: process.env.NODE_ENV === 'production', // cookie 是否只在https連線中使用
            sameSite: 'lax' // 根據環境變量來設置並只在生產環境中啟用
        })

        return res.json({
            success: true,
            message: "已登出"
        });

    } catch (error) {
        return res.json({
            success: false,
            message: '發生錯誤，請再操作一次'
        });
    }
}

// 針對使用者 寄送 OTP 驗證碼
export const sendVerifyOtp = async (req, res) => {

    // 取得要寄送信件的使用者id
    const { userId } = req.body;

    try {

        // 這裡取得的是對應id的資料庫中用戶資料
        const user = await userModel.findById(userId);

        // 確認用戶是否已驗證 使用者註冊時 驗證狀態預設是 false
        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: '該用戶已通過驗證'
            });
        }

        // 生成隨機 6碼 OTP
        const otp = Math.floor(100000 + Math.random() * 900000)

        // 以下為未驗證用戶的處理邏輯
        user.verifyOtp = otp; // 將隨機生成的 OTP 更新至用戶資料
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 1d

        // 驗證信件的內容預設
        const subject = 'OTP 驗證碼';
        // const text = `Your Verifiaction OTP is ${otp}`;
        const html = EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email);
        await user.save();
        await handleSendMail(user.email, user.name, subject, html);

        return res.json({
            success: true,
            message: "已寄送OTP驗證碼"
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
}

// 輸入信件取得的 OTP 驗證碼 驗證用戶
export const verifyEamil = async (req, res) => {

    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({
            success: false,
            message: "發生錯誤，請確認用戶及驗證碼"
        });
    };

    try {

        // 取得使用者資料
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "該用戶不存在"
            });
        };

        // 判斷用戶是否經過驗證
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({
                success: false,
                message: "驗證碼輸入錯誤"
            });
        };

        // 驗證碼期限
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({
                success: false,
                message: "驗證碼已過期"
            });
        };

        // 通過以上判斷則執行以下邏輯
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({
            success: true,
            message: "信箱驗證成功"
        });


    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
}

// 確認使用者是否已驗證
export const isAuthenticated = async (req, res) => {
    try {
        // req.user 在中間件中設定
        const userId = req.user?.id;

        if (!userId) {
            return res.json({
                success: false,
                message: "使用者未授權"
            });
        }

        // 查詢用戶數據
        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.json({
                success: false,
                message: "未取得用戶數據"
            });
        }

        return res.json({
            success: true,
            message: "用戶已登入",
            userData: user
        });

    } catch (error) {
        console.error("認證錯誤: ", error);
        return res.json({
            success: false,
            message: error.message
        });
    }
}

// 寄送 變更密碼 OTP 驗證碼
export const sendResetOtp = async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: "請提供電子郵件"
        });
    }

    try {

        // 取得資料庫用戶資料
        const user = await userModel.findOne({ email })

        if (!user) {
            // 安全考量：即使用戶不存在也返回一個成功消息
            // 這樣攻擊者無法通過嘗試不同的郵箱來確定哪些郵箱已註冊
            return res.json({
                success: false,
                message: "如果此信箱已註冊，我們已發送重設密碼的郵件"
            });
        }

        // 生成隨機 6碼 OTP 用來驗證
        const otp = Math.floor(100000 + Math.random() * 900000)

        user.resetOtp = otp; // 將隨機生成的 OTP 更新至用戶資料
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15m

        // 驗證信件的內容預設
        const subject = 'Password Reset OTP';
        // const text = `You can use this otp to Reset Password. Your reset otp is ${otp}`;
        const html = PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email);
        await user.save();
        await handleSendMail(user.email, user.name, subject, html);

        return res.json({
            success: true,
            message: "驗證碼已發送至您的電子郵件"
        });


    } catch (error) {
        console.error("發送重設密碼 OTP 錯誤:", error);
        return res.json({
            success: false,
            message: "發送失敗，請稍後再試"
        });
    }
}

// 重置密碼
export const resetPassword = async (req, res) => {

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({
            success: false,
            message: "請填寫 email, otp, newPassword"
        });
    }

    try {

        // 取得資料庫使用者資料
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "無效或過期的驗證碼"
            });
        }

        // 確認 OTP
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({
                success: false,
                message: "驗證碼輸入錯誤，請再試一次"
            });
        }

        // 驗證碼期限
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({
                success: false,
                message: "驗證碼已過期"
            });
        };

        // 密碼加密
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = ''
        user.resetOtpExpireAt = 0;

        await user.save();
        return res.json({
            success: true,
            message: "密碼修改成功，請使用新密碼登入"
        });

    } catch (error) {
        console.error("重設密碼錯誤:", error);
        return res.json({
            success: false,
            message: "重設密碼失敗，請稍後再視" || error.message
        });
    }
}
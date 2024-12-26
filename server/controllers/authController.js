import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import handleSendMail from "../config/nodemailer.js";

// 註冊
export const register = async (req, res) => {

    const { name, email, password } = req.body;

    // 信件設定
    const subject = "Welcome to MERN-AUTH";
    const text = `Welcome, ${name}. have fun.`

    if (!name || !email || !password) {
        return res.json({ success: false, message: '註冊失敗，請填寫所有欄位' });
    }

    try {

        // 以 email 來判斷是否已註冊過，因為email是唯一值
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: '該使用者已註冊' });
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
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 根據環境變量來設置並只在生產環境中啟用
            maxAge: 7 * 24 * 60 * 60 * 1000 // cookie有效期限的設置
        });

        await handleSendMail(email, name, subject, text)
            .then(() => {
                res.json({ success: true, message: '用戶註冊成功，已寄發註冊信' });
            })
            .catch(() => {
                res.json({ success: false, message: '寄送失敗' });
            })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// 登入
export const login = async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: '登入失敗，請填寫所有欄位' })
    }

    try {

        // 使用email找出是否有此用戶，返回布林值
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: '登入失敗，該用戶不存在' })
        }

        // 驗證用戶密碼，並返回布林值
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: '登入失敗，密碼輸入錯誤' })
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
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 根據環境變量來設置並只在生產環境中啟用
            maxAge: 7 * 24 * 60 * 60 * 1000 // cookie有效期限的設置
        });

        res.json({ success: true, message: '登入成功' })

    } catch (error) {
        return res.json({ success: false, message: '登入失敗，請填寫所有欄位' })
    }
}

// 登出
export const logout = async (req, res) => {

    try {
        res.clearCookie('token', {
            httpOnly: true, // 標記此cookie僅能通過http(s)訪問，無法通過JavaScript訪問，防止XSS攻擊
            secure: process.env.NODE_ENV === 'production', // cookie 是否只在https連線中使用
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 根據環境變量來設置並只在生產環境中啟用
        })

        res.json({ success: true, message: "已登出" })

    } catch (error) {
        return res.json({ success: false, message: '發生錯誤，請再操作一次' })
    }
}
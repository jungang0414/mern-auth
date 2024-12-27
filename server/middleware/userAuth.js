import jwt from 'jsonwebtoken';

// 處理HTTP請求
const userAuth = async (req, res, next) => {

    // 取得用戶生成的 token
    const { token } = req.cookies;

    // 當 token 不存在
    if (!token) {
        return res.json({ success: false, message: "Token 不存在" });
    }

    try {

        // 驗證用戶
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET); // 這裡取得的是用戶當初註冊時所獲得的JWT令牌, 以及生成時使用的密鑰

        // 有找到 token id 則在 req.body 新增額外屬性 userId 讓 authController 的 sendVerifyOtp 和 verifyEamil 使用
        if (tokenDecode.id) {
            req.body.userId = tokenDecode.id;
        } else {
            return res.json({ success: false, message: "未認證用戶" });
        }

        // 交棒給下一個 middleware 或 路由處理器
        next();

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export default userAuth;
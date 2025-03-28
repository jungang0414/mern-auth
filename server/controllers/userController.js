import userModel from "../models/userModel.js";

// 取得用戶資料
export const getUserData = async (req, res) => {

    try {
        // 取得用戶 唯一id
        const { userId } = req.body;

        const user = await userModel.findById(userId);

        // 檢查使用者
        if (!user) {
            return res.json({
                success: false,
                message: "查無此用戶"
            });
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        })

    } catch (error) {
        console.error("取得用戶資料失敗:", error);
        return res.json({
            success: false,
            message: error.message
        });
    }
}
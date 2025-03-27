# Routes

此資料夾主要用來設定當使用者輸入不同網址時，伺服器應該要處理的程式碼邏輯。

## authRoutes.js 主要路由

- **/register**: 處理用戶註冊請求。
- **/login**: 處理用戶登入請求。
- **/logout**: 處理用戶登出請求。
- **/send-verify-otp**: 寄送信箱認證 OTP
- **/verify-account**: 輸入 OTP 驗證用戶
- **/is-auth**: 確認用戶是否已驗證信箱
- **/send-reset-otp**: 寄送重設密碼 OTP
- **/reset-password**: 重設新密碼

## userRoutes.js 主要路由

- **/data**: 取得資料庫用戶資料
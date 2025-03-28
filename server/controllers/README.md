# Controller

此資料夾主要用來存放 不同**處理HTTP請求的邏輯**。

## authController.js 主要邏輯

- **register**: 處理用戶註冊，包括驗證、密碼加密和 JWT 令牌生成。
- **login**: 管理用戶登入，包括驗證、密碼比對和 JWT 令牌生成。
- **logout**: 處理用戶登出，清除認證 cookie。
- **sendVerifyOtp**: 依照取得的 userId 來對應資料庫中的 _id 來取得用戶資料，寄送OTP驗證碼到用戶信箱中。
- **verifyEamil**: 取得用戶的資料以及輸入的OTP驗證碼，來驗證用戶。
- **isAuthenticated**: 驗證用戶是否已經通過驗證。
- **sendResetOtp**: 用戶輸入要變更密碼的信箱，從資料庫中尋找符合條件的用戶Email資料，並寄送重設密碼的OTP驗證碼。
- **resetPassword**: 用戶填寫取得的重設密碼的OTP驗證碼以及要重設的密碼。

## userController.js 主要邏輯

- **getUserData**: 取得用戶資料，會根據 userId 來對應資料庫中的 _id 來取得用戶資料。
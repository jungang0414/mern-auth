# Controller

此資料夾主要用來存放 不同**處理HTTP請求的邏輯**。

## authController.js 主要邏輯

- **register**: 處理用戶註冊，包括驗證、密碼加密和 JWT 令牌生成。
- **login**: 管理用戶登入，包括驗證、密碼比對和 JWT 令牌生成。
- **logout**: 處理用戶登出，清除認證 cookie。
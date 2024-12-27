# 中介軟體

當收到HTTP請求時，會先經過 middleware ，每個 middleware 都可以做以下選擇:

1. 修改 req, 如新增額外屬性。
2. 修改 res, 如設置狀態碼。
3. 將請求傳遞給下一個 middleware 或 路由處理器。

## userAuth 

透過請求，來驗證使用者。


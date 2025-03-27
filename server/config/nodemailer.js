import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Gmail API
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// 創建 OAuth2 client
const handleSendMail = async (email, name, subject, html) => {
    return await new Promise((resolve, reject) => {

        const oauth2Client = new OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );

        // OAuth2 refresh token
        oauth2Client.setCredentials({
            refresh_token: REFRESH_TOKEN
        });

        // 取得存取權
        oauth2Client
            .getAccessToken()
            .then((res) => {
                const accessToken = res.token;
                if (!accessToken) {
                    reject(new Error('取得 Access Token 失敗'));
                }

                // 寄送信件
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: process.env.SENDER_EMAIL,
                        clientId: CLIENT_ID,
                        clientSecret: CLIENT_SECRET,
                        accessToken: accessToken ?? ''
                    }
                });

                // 信件內容設定
                const mailOptions = {
                    form: process.env.SENDER_EMAIL,
                    to: email,
                    subject: subject,
                    html: html
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        reject(error);
                    }
                    resolve({ message: 'Email寄送成功' });
                });
            })
            .catch(() => {
                reject(new Error('取得 Access Token 失敗'));
            });
    });
}



export default handleSendMail;
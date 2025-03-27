import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  // 表單狀態
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 新增確認密碼
  const [passwordsMatch, setPasswordsMatch] = useState(true); // 新增密碼匹配狀態
  const [hasNumber, setHasNumber] = useState(false);
  const [hasLetter, setHasLetter] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);

  // 流程控制狀態
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmited, setIsOtpSubmited] = useState(false);

  const inputRefs = React.useRef([]);

  // 密碼強度檢查
  const [passwordStrength, setPasswordStrength] = useState("");

  // 處理函數
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus(); // 透過 focus 鎖定下一個輸入框
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // 複製貼上處理函數
  const handlePaste = (e) => {
    e.preventDefault(); // 防止默認貼上行為
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");

    // 只處理數字
    const filteredArray = pasteArray
      .filter((char) => /\d/.test(char))
      .slice(0, 6);

    filteredArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
        // 手動觸發 input 事件以確保自動跳到下一個輸入框
        handleInput({ target: { value: char } }, index);
      }
    });

    // 如果貼上的內容正好6位數字，自動聚焦到最後一個並準備提交
    if (filteredArray.length === 6) {
      inputRefs.current[5].focus();
    }
  };

  // 檢查密碼是否匹配
  const checkPasswordsMatch = () => {
    setPasswordsMatch(newPassword === confirmPassword);
    return newPassword === confirmPassword;
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios({
        method: "post",
        url: backendUrl + "/api/auth/send-reset-otp",
        data: { email },
        withCredentials: false, // 確保不發送 cookies
      });

      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((input) => input?.value || "");
    const otpValue = otpArray.join("");

    // 確保 OTP 長度為 6
    if (otpValue.length !== 6) {
      toast.error("請輸入完整的 6 位驗證碼");
      return;
    }

    setOtp(otpValue);
    setIsOtpSubmited(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();

    // 驗證密碼強度
    if (passwordStrength === "弱") {
      toast.error("密碼強度不足，請使用更強的密碼");
      return;
    }

    // 確認密碼是否匹配
    if (!checkPasswordsMatch()) {
      toast.error("兩次輸入的密碼不一致");
      return;
    }

    try {
      const { data } = await axios({
        method: "post",
        url: backendUrl + "/api/auth/reset-password",
        data: { email, otp, newPassword },
        withCredentials: false, // 確保不發送 cookies
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const checkPasswordStrength = (password) => {
    if (!password || password.length < 8) {
      setPasswordStrength("弱");
      return false;
    }

    // 檢查密碼是否包含英數
    setHasNumber(/\d/.test(password));
    setHasLetter(/[a-zA-Z]/.test(password));
    setHasSpecial(/[!@#$%^&*(),.?":{}|<>]/.test(password));

    // 修正比較運算符，應使用大於等於而不是賦值運算符
    if (hasNumber && hasLetter && hasSpecial && password.length >= 10) {
      setPasswordStrength("強");
      return true;
    }

    setPasswordStrength("中");
    return true;
  };

  const handlePasswordChange = (e) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    checkPasswordStrength(newPass);

    // 如果已經輸入了確認密碼，則檢查密碼是否匹配
    if (confirmPassword) {
      setPasswordsMatch(newPass === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    setPasswordsMatch(newPassword === confirmPass);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {/* 第一步：輸入郵箱 */}
      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            重設密碼
          </h1>
          <p className="text-center mb-6 text-indigo-300">輸入您註冊的信箱</p>

          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" className="w-3 h-3" />
            <input
              type="email"
              placeholder="信箱"
              className="bg-transparent outline-none text-white w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 cursor-pointer"
          >
            提交
          </button>
        </form>
      )}

      {/* 第二步：輸入 OTP */}
      {isEmailSent && !isOtpSubmited && (
        <form
          onSubmit={onSubmitOTP}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            重設密碼 OTP
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            輸入傳送到您信箱中的6位數代碼
          </p>

          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  maxLength="1"
                  key={index}
                  required
                  pattern="[0-9]"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setIsEmailSent(false)}
              className="text-indigo-300 text-sm hover:underline"
            >
              返回修改郵箱
            </button>
            <button
              type="button"
              onClick={onSubmitEmail}
              className="text-indigo-300 text-sm hover:underline"
            >
              重新發送驗證碼
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer"
          >
            提交
          </button>
        </form>
      )}

      {/* 第三步：輸入新密碼 */}
      {isEmailSent && isOtpSubmited && (
        <form
          onSubmit={onSubmitNewPassword}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            新密碼
          </h1>
          <p className="text-center mb-6 text-indigo-300">請在以下輸入新密碼</p>

          {/* 密碼輸入 */}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" className="w-3 h-3" />
            <input
              type="password"
              placeholder="密碼"
              className="bg-transparent outline-none text-white w-full"
              value={newPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              required
            />
          </div>

          {/* 確認密碼輸入 */}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" className="w-3 h-3" />
            <input
              type="password"
              placeholder="確認密碼"
              className="bg-transparent outline-none text-white w-full"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={checkPasswordsMatch}
              autoComplete="new-password"
              required
            />
          </div>

          {/* 顯示密碼不匹配錯誤 */}
          {!passwordsMatch && confirmPassword && (
            <p className="text-red-500 text-xs mb-2">兩次輸入的密碼不一致</p>
          )}

          {/* 顯示密碼強度 */}
          <div className="mb-4 mt-2">
            {newPassword && (
              <div className="flex items-center">
                <span className="text-xs mr-2 text-white">密碼強度:</span>
                <span
                  className={`text-xs ${
                    passwordStrength === "弱"
                      ? "text-red-500"
                      : passwordStrength === "中"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {passwordStrength}
                </span>
                {passwordStrength === "弱" && (
                  <span className="text-xs text-red-500 ml-2">
                    (至少8個字符)
                  </span>
                )}
              </div>
            )}

            {/* 密碼強度提示 */}
            {newPassword && (
              <ul className="text-xs text-gray-400 mt-2 list-disc pl-5">
                <li className={hasLetter ? "text-green-500" : ""}>
                  至少包含一個字母
                </li>
                <li className={hasNumber ? "text-green-500" : ""}>
                  至少包含一個數字
                </li>
                <li className={hasSpecial ? "text-green-500" : ""}>
                  至少包含一個特殊字符（如 !@#$%^&*）
                </li>
                <li
                  className={newPassword.length >= 10 ? "text-green-500" : ""}
                >
                  長度至少為10個字符
                </li>
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 cursor-pointer"
            disabled={passwordStrength === "弱" || !passwordsMatch}
          >
            提交
          </button>

          {/* 返回按鈕 */}
          <button
            type="button"
            onClick={() => setIsOtpSubmited(false)}
            className="w-full text-center mt-4 text-indigo-300 text-sm hover:underline"
          >
            返回輸入驗證碼
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;

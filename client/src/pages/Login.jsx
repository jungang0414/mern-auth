import { useState, useContext } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const Login = () => {
  // 登入&註冊頁面狀態
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // 密碼驗證&強度驗證
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasLetter, setHasLetter] = useState(false);
  const [hasSpecial, setHasSpecial] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  // 頁面路由
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  // 驗證密碼是否匹配
  const checkPasswordsMatch = () => {
    setPasswordsMatch(password === confirmPassword);
    return password === confirmPassword;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (state === "Sign Up") {
        // 只在註冊模式底下檢查密碼強度和密碼匹配

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
        
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          toast.success("註冊成功!");
          // 設置登入狀態
          setIsLoggedin(true);
          // 獲取用戶資料
          await getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });

        if (data.success) {
          toast.success("登入成功");
          // 設置登入狀態
          setIsLoggedin(true);
          // 獲取用戶資料
          await getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      const errorMessage = error.message?.data?.message || error.message;
      toast.error("操作失敗:" + errorMessage);
      console.error("登入/註冊失敗:", error);
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
    setPassword(newPass);
    checkPasswordStrength(newPass);

    // 如果已經輸入了確認密碼，則檢查密碼是否匹配
    if (confirmPassword) {
      setPasswordsMatch(newPass === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    setPasswordsMatch(password === confirmPass);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "建立帳戶" : "登入"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign Up" ? "建立你的帳戶" : "登入你的帳戶!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input
                className="bg-transparent outline-none"
                type="text"
                placeholder="姓名"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" className="w-3" />
            <input
              className="bg-transparent outline-none"
              type="email"
              placeholder="信箱"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" />
            <input
              className="bg-transparent outline-none"
              type="password"
              placeholder="密碼"
              onChange={handlePasswordChange}
              value={password}
              required
              autoComplete={
                state === "Sign Up" ? "new-password" : "current-password"
              }
            />
          </div>

          {state === "Sign Up" && (
            <>
              <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                <img src={assets.lock_icon} alt="" className="w-3 h-3" />
                <input
                  type="password"
                  placeholder="確認密碼"
                  className="bg-transparent outline-none"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={checkPasswordsMatch}
                  autoComplete="new-password"
                  required
                />
              </div>

              {/* 顯示密碼不匹配錯誤 */}
              {!passwordsMatch && confirmPassword && (
                <p className="text-red-500 text-xs mb-2">
                  兩次輸入的密碼不一致
                </p>
              )}
            </>
          )}

          {/* 顯示密碼強度 */}
          <div className="mb-4 mt-2">
            {password && state === "Sign Up" && (
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
            {password && state === "Sign Up" && (
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
                <li className={password.length >= 10 ? "text-green-500" : ""}>
                  長度至少為10個字符
                </li>
              </ul>
            )}
          </div>

          {state === "Login" && (
            <p
              onClick={() => navigate("/reset-password")}
              className="mb-4 text-indigo-500 cursor-pointer"
            >
              忘記密碼?
            </p>
          )}

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer">
            {state === "Sign Up" ? "註冊" : "登入"}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            已經有帳戶了?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              登入
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            還沒有帳戶?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-400 cursor-pointer underline"
            >
              註冊
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;

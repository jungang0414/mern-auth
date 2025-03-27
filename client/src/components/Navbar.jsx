import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const {
    userData,
    isLoggedin,
    backendUrl,
    setUserData,
    setIsLoggedin,
    getUserData,
  } = useContext(AppContent);

  // 如果用戶已登入但沒有數據，嘗試獲取
  useEffect(() => {
    if (isLoggedin === true && !userData) {
      console.log("用戶已登入但數據缺失，嘗試獲取...");
      getUserData();
    }
  }, [isLoggedin, userData, getUserData]);

  const sendVerificationOtp = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );

      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/auth/logout");

      if (data.success) {
        // 使用 null 而不是 false
        setIsLoggedin(false);
        setUserData(null); // 改為 null
        toast.success("成功登出");
        navigate("/");
      } else {
        toast.error(data.message || "登出失敗");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("登出時發生錯誤: " + errorMessage);
      console.error("登出錯誤:", error);
    }
  };

  // 安全地渲染用戶名稱首字母
  const renderUserInitial = () => {
    if (userData && userData.name && userData.name[0]) {
      return userData.name[0].toUpperCase();
    }
    return "?";
  };

  // 添加加載狀態
  const renderAuthContent = () => {
    if (isLoggedin === null) {
      return (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-gray-300 animate-pulse">
          <span className="text-sm">...</span>
        </div>
      );
    }

    if (isLoggedin === true && userData) {
      return (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
          {renderUserInitial()}
          <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {userData.isAccountVerified === false && (
                <li
                  onClick={sendVerificationOtp}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer w-20"
                >
                  驗證信箱
                </li>
              )}
              <li
                onClick={logout}
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
              >
                登出
              </li>
            </ul>
          </div>
        </div>
      );
    }
    return (
      <button
        onClick={() => navigate("/login")}
        className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
      >
        登入
        <img src={assets.arrow_icon} alt="" />
      </button>
    );
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img
        src={assets.logo}
        alt="Logo"
        className="w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {renderAuthContent()}
    </div>
  );
};

export default Navbar;

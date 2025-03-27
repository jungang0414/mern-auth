import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContent = createContext();

export const AppContextProvider = (props) => {
  // 全局設置 axios
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(null);
  const [userData, setUserData] = useState(null);

  // 取得使用者資料
  const getUserData = async () => {
    try {
      console.log("開始獲取用戶數據...");
      const { data } = await axios.get(backendUrl + "/api/user/data", {
        withCredentials: true,
      });

      if (data.success && data.userData) {
        console.log("成功獲取用戶數據:", data.userData);
        setUserData(data.userData);
        return true;
      } else {
        console.error("無法獲取用戶數據:", data.message);
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("獲取用戶數據錯誤:", error);

      // 避免顯示 401 錯誤的彈窗，因為這可能只是表示用戶未登入
      if (error.response?.status !== 401) {
        toast.error(
          "獲取用戶資料失敗: " +
            (error.response?.data?.message || error.message)
        );
      }
      return false;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("檢查認證狀態...");

        // 添加超時控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超時

        try {
          const { data } = await axios.get(backendUrl + "/api/auth/is-auth", {
            withCredentials: true,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          if (!data.success) {
            console.log("token 認證錯誤");
          } else {
            console.log(
              `認證檢查結果\n 使用者名稱: ${data.userData.name} \n 使用者信箱: ${data.userData.email}`
            );
          }

          if (data.success) {
            if (data.userData) {
              setIsLoggedin(true);
              setUserData(data.userData);
            } else {
              console.log("認證成功但缺少用戶數據，嘗試獲取...");
              setIsLoggedin(true); // 設置為已登入
              getUserData(); // 嘗試獲取用戶數據
            }
          } else {
            console.log("使用者未登入");
            setIsLoggedin(false);
            setUserData(null);
          }
        } catch (axiosError) {
          clearTimeout(timeoutId);

          if (axiosError.name === "AbortError") {
            console.error("認證檢查超時");
            // 超時後，嘗試替代方案
            fallbackAuthCheck();
          } else {
            throw axiosError; // 拋出以便外層 catch 捕獲
          }
        }
      } catch (error) {
        console.error("驗證 Token 錯誤:", error);

        // 即使出錯也要設置登入狀態，避免留在 null 狀態
        setIsLoggedin(false);
        setUserData(null);

        // 可選：嘗試通過 cookie 存在性判斷
        if (document.cookie.includes("token=")) {
          console.log("發現 token cookie，嘗試替代驗證方式...");
          fallbackAuthCheck();
        }
      }
    };

    // 如果主要認證方法失敗，嘗試直接獲取用戶數據作為替代
    const fallbackAuthCheck = async () => {
      console.log("使用替代方法檢查認證狀態...");
      const success = await getUserData();

      if (success) {
        console.log("替代認證成功");
        setIsLoggedin(true);
      } else {
        console.log("替代認證失敗");
        setIsLoggedin(false);
      }
    };

    checkAuthStatus();
  }, [backendUrl]);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContent.Provider value={value}>{props.children}</AppContent.Provider>
  );
};

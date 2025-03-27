import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContent } from "../context/AppContext";

const Header = () => {
  const { userData } = useContext(AppContent);

  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center text-gray-800">
      <img
        src={assets.header_img}
        alt=""
        className="w-36 h-36 rounded-full mb-6"
      />
      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        您好 {userData ? userData.name : ""}!
        <img src={assets.hand_wave} alt="" className="w-8 aspect-square" />
      </h1>
      <h2 className="text-3xl sm:text-5xl font-semibold mb-4">
        歡迎使用此應用程式
      </h2>
      <p className="mb-8 max-w-md">
        從快速的產品導覽開始，我們將讓您立即開始使用！
      </p>
      <button className="border border-gray-500 rounded-full px-8 py-2.5 hover:bg-blue-500 hover:text-white transition-all cursor-pointer">
        開始
      </button>
    </div>
  );
};

export default Header;

import React from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-white border border-[#e3e8f0] border-solid content-stretch flex items-center justify-between overflow-clip px-[32px] py-[16px] relative shrink-0 w-full">
      <div className="[word-break:break-word] content-stretch flex gap-[24px] items-center leading-[normal] not-italic overflow-clip relative shrink-0 whitespace-nowrap">
        <Link
          to="/"
          className="font-bold relative shrink-0 text-[#2663eb] text-[18px] hover:opacity-80"
        >
          CulinaryShare
        </Link>
        <div className="content-stretch flex font-medium gap-[24px] items-center overflow-clip relative shrink-0 text-[#707a8c] text-[14px]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-[#2663eb] font-semibold" : "hover:text-[#2663eb]"
            }
          >
            Recipes
          </NavLink>
          <NavLink
            to="/add-recipe"
            className={({ isActive }) =>
              isActive ? "text-[#2663eb] font-semibold" : "hover:text-[#2663eb]"
            }
          >
            Add Recipe
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "text-[#2663eb] font-semibold" : "hover:text-[#2663eb]"
            }
          >
            About
          </NavLink>
        </div>
      </div>
      <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0">
        <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[16px] whitespace-nowrap">
          🔔
        </p>
        <div className="bg-[#2663eb] content-stretch flex items-center justify-center overflow-clip relative rounded-[999px] shrink-0 size-[32px]">
          <p className="[word-break:break-word] font-bold leading-[normal] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">
            AJ
          </p>
        </div>
      </div>
    </div>
  );
}

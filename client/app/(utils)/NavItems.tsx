import Link from "next/link";
import React, { FC } from "react";

interface NavItemsProps {
  activeItem: number;
  isMobile: boolean;
}

export const navItemsData = [
  { name: "Home", url: "/" },
  { name: "Courses", url: "/courses" },
  { name: "About", url: "/about" },
  { name: "Policy", url: "/policy" },
  { name: "FAQ", url: "/faq" },
];

export const NavItems: FC<NavItemsProps> = ({ activeItem, isMobile }) => {
  return (
    <>
      <div className="hidden 800px:flex">
        {navItemsData &&
          navItemsData.map((item, index) => (
            <Link href={item.url} key={item.url} passHref>
              <span
                className={`${
                  activeItem === index
                    ? "dark:text-[#37a391] text-[crimson]"
                    : "dark:text-white text-black"
                } text-[18px] px-6 font-Poppins font-[400]`}
              >
                {item.name}
              </span>
            </Link>
          ))}
      </div>

      {isMobile && (
        <div className="800px:hidden mt-5">
          {navItemsData &&
            navItemsData.map((item, index) => (
              <Link href={"/"} key={item.url} passHref>
                <span
                  className={`${
                    activeItem === index
                      ? "dark:text-[#37a391] text-[crimson]"
                      : "dark:text-white text-black"
                  } block py-5 text-[18px] px-6 font-Poppins font-[400]`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
        </div>
      )}
    </>
  );
};

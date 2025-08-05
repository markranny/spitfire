"use client";
// import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
// import { dark } from "@clerk/themes";
import { BellIcon, BookOpen } from "lucide-react";
import Link from "next/link";
import React from "react";

const NonDashboardNavbar = () => {
  // const { user } = useUser();
  // const userRole = user?.publicMetadata?.userType as "student" | "teacher";
  return (
    <nav className="nondashboard-navbar">
      <div className="nondashboard-navbar__container">
        <div className="nondashboard-navbar__search">
          <Link href="/" className="nondashboard-navbar__brand" scroll={false}>
            Zernie
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Link href="/search" className="nondashboard-navbar__search-input" scroll={false}>
                <span className="hidden sm:inline">Search Courses</span>
                <span className="sm:hidden">Search</span>
              </Link>
              <BookOpen className="nondashboard-navbar__search-icon" size={18} />
            </div>
          </div>
        </div>
        <div className="nondashboard-navbar__actions">
          <button className="nondashboard-navbar__notification-button">
            <span className="nondashboard-navbar__notification-indicator" />
            <BellIcon className="nondashboard-navbar__notification-icon" size={18} />
          </button>
          {/* Sign In Button */}
          {/* <SignedIn> */}
            {/* <UserButton
              appearance={{
                baseTheme: dark,
                elements: {
                  userButtonOuterIdentifier: " text-customgreys-dirtyGrey hover:text-white-50",
                  userButtonBox: "scale-90 sm:scale-100",
                },
              }}
              showName={true}
              userProfileMode="navigation"
              userProfileUrl={userRole === "teacher" ? "/teacher/profile" : "/user/profile"}
            /> */}
          {/* </SignedIn> */}
          {/* <SignedOut> */}
            <Link href="/signin" className="nondashboard-navbar__sign-in" scroll={false}>
              Log In
            </Link>
            <Link href="/signup" className="nondashboard-navbar__sign-up" scroll={false}>
              Sign Up
            </Link>
          {/* </SignedOut> */}
        </div>
      </div>
    </nav>
  );
};

export default NonDashboardNavbar;

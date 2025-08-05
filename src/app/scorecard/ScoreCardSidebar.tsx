"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/state/redux"; // Adjust path to your store
import { setActivePage } from "@/state/reducers/ScoreCardReducer"; // Adjust path to your slice

const NonDashboardSidebar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activePage = useAppSelector((state) => state.scorecard.activePage); // Get active page from Redux
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Define the pages with label and value
  const pages = [
    { label: "Add Digital Flight Logs", value: "addDigitalFlightLogs" },
    { label: "Add Manual Flight Logs", value: "addManualFlightLogs" },
    { label: "All Flights", value: "allFlights" },
    { label: "Military", value: "military" },
    { label: "Civilian", value: "civilian" },
    { label: "Scorecard", value: "scorecard" },
  ];

  // Handle page click: update Redux state with the value
  const handlePageClick = (pageValue: string) => {
    dispatch(setActivePage(pageValue)); // Set the active page in Redux using the value
  };

  return (
    <nav className="w-1/5 bg-customgreys-primarybg h-full flex-shrink-0">
      <div className="w-full flex flex-col pb-10 h-full justify-between">
        <div className="flex flex-col">
          <div className="w-full flex items-center justify-center py-5">
            <div className="relative flex items-center justify-center">
              {!isImageLoaded && <Skeleton className="absolute inset-0" />}
              <Image
                src="/logo.png"
                alt="logo"
                width={250}
                height={50}
                className={`app-sidebar__logo transition-opacity duration-600 ${
                  isImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                priority={true}
                onLoad={() => setIsImageLoaded(true)}
              />
            </div>
          </div>
          <div className="w-full pt-5">
            <ul className="flex flex-col gap-2">
              {pages.map((page) => (
                <li
                  key={page.value}
                  onClick={() => handlePageClick(page.value)}
                  className={`cursor-pointer px-4 py-2  text-sm font-medium transition-all ${
                    activePage === page.value
                      ? "bg-gray-500 text-white text-base border-b-2 border-white" // Active: whitish-gray bg, white text, larger, white border
                      : "text-white hover:bg-gray-500" // Non-active: white text, gray hover
                  }`}
                >
                  {page.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-center w-full">
          <button
            className="w-fit rounded-full items-center flex gap-2 justify-center min-w-32 px-3 my-6 py-3 bg-white-100 hover:bg-orange-300 text-orange-500 border border-orange-500 shadow text-sm font-semibold"
            onClick={() => router.push("/")}
          >
            Exit
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NonDashboardSidebar;

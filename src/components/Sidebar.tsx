"use client";
import { useCheckoutNavigation } from "@/hooks/useCheckoutNavigation";
import Image from "next/image";
import React, { useState } from "react";
import VerticalWizard from "./VerticalWizardStepper";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";

const NonDashboardSidebar = () => {
  const router = useRouter();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { navigationStep } = useCheckoutNavigation();

  return (
    <nav className="w-1/4 bg-customgreys-primarybg h-full">
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
          <div className="w-full pt-5 px-2">
            <VerticalWizard currentStep={navigationStep} />
          </div>
        </div>
        <div className="flex items-center justify-center w-full">
          <button className="w-fit rounded-full items-center flex gap-2 justify-center min-w-32 px-3 my-6 py-3 bg-white-100 hover:bg-orange-300 text-orange-500 border border-orange-500 shadow text-sm font-semibold" onClick={() => router.push("/")}>
            Exit
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NonDashboardSidebar;

"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { setActiveSession, setFormData } from "@/state";
import { useAppDispatch } from "@/state/redux";

const SubmissionsSidebar = () => {
  const router = useRouter();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const dispatch = useAppDispatch()

  const handleStartNew = () => {
      localStorage.removeItem("formData");
      dispatch(setFormData([{ step: 0 , data: {}, completed: false }]));
      localStorage.removeItem("activeSession");
      dispatch(setActiveSession(null));
      router.push("/resume");
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
              <li
                key={'submissions'}
                onClick={() => router.push('/submissions')}
                className={'cursor-pointer px-4 py-2 text-sm font-medium transition-all bg-gray-500 text-white text-base border-b-2 border-white'}
              >
                My Submissions
              </li>
              <li
                key={'add-resume'}
                onClick={handleStartNew}
                className={'cursor-pointer px-4 py-2  text-sm font-medium transition-all text-white hover:bg-gray-500'}
              >
                Add Resume
              </li>
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

export default SubmissionsSidebar;

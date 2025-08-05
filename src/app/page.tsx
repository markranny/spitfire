"use client";
import { User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserQuery } from "@/state/api";
import { MembershipLevel } from "@/lib/getUser";

export default function Home() {
  const router = useRouter();
  const { data, isLoading, error } = useGetUserQuery();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const fullName = useMemo(() => {
    if (!data?.success) {
      return "";
    }
    return data.user.name;
  }, [data]);

  const showResumeTool = useMemo(() => {
    if (!data?.success) {
      return false;
    }

    if (
      data.user.level === MembershipLevel.Level1 ||
      data.user.level === MembershipLevel.Level3 ||
      data.user.level === MembershipLevel.Admin
    ) {
      return true;
    }
    return false;
  }, [data]);

  const showScorecardTool = useMemo(() => {
    if (!data?.success) {
      return false;
    }

    if (
      data.user.level === MembershipLevel.Level2 ||
      data.user.level === MembershipLevel.Level3 ||
      data.user.level === MembershipLevel.Admin
    ) {
      return true;
    }
    return false;
  }, [data]);

  const showResumeRequests = useMemo(() => {
    if (!data?.success) {
      return false;
    }

    if (data.user.level === MembershipLevel.Admin) {
      return true;
    }
    return false;
  }, [data]);

  return (
    <div className="w-full min-h-screen bg-customgreys-primarybg p-4 md:p-10">
      <div className="flex w-full justify-end">
        {!isLoading && fullName && (
          <div
            className="flex items-center text-sm md:text-lg text-black-100 font-semibold mr-2 cursor-pointer"
            onClick={() => {
              router.push("/account");
            }}
          >
            {`Welcome, ${fullName}`}
          </div>
        )}
        <div
          className="flex rounded-full bg-white-100 p-2 md:p-4 cursor-pointer"
          onClick={() => {
            router.push("/account");
          }}
        >
          <User color="black" size={32} className="md:w-10 md:h-10" />
        </div>
      </div>

      <div className="p-4 md:p-10 flex w-full min-h-[calc(100vh-5rem)] items-center justify-center">
        <div className="flex flex-col w-full items-center justify-center gap-8 md:gap-20">
          {/* Logo Section */}
          <div className="relative w-40 h-40 md:w-60 md:h-60 mb-8">
            {!isImageLoaded && <Skeleton className="w-full h-full =" />}
            <Image
              src="/logo.png" // Replace with your logo path
              alt="Logo"
              fill
              className="object-contain"
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(true)} // Fallback if image fails
            />
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col md:flex-row w-full items-center justify-center gap-4 md:gap-20">
            {showResumeRequests && (
              <Button
                type="button"
                className="w-full md:w-fit text-lg md:text-xl min-w-[18rem] px-6 md:px-8 my-2 md:my-6 py-5 md:py-6 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow font-semibold"
                onClick={() => router.push("/resume-requests")}
              >
                Resume Requests
              </Button>
            )}
            {showResumeTool && (
              <Button
                type="button"
                className="w-full md:w-fit text-lg md:text-xl min-w-[18rem] px-6 md:px-8 my-2 md:my-6 py-5 md:py-6 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow font-semibold"
                onClick={() => router.push("/landing")}
              >
                Resume Builder
              </Button>
            )}
            {showScorecardTool && (
              <Button
                type="button"
                className="w-full md:w-fit text-lg md:text-xl min-w-[18rem] px-6 md:px-8 my-2 md:my-6 py-5 md:py-6 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow font-semibold"
                onClick={() => router.push("/scorecard")}
              >
                Score Card
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

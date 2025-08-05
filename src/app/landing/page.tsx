"use client";
import { User } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { setActiveSession } from "@/state";
import { useAppDispatch } from "@/state/redux";
import { setFormData } from "@/state";

const LandingPage = () => {
  const router = useRouter();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasPreviousData, setHasPreviousData] = useState(false);
  const dispatch = useAppDispatch()

  useEffect(() => {
    const storedData = localStorage.getItem("formData");
    const activeSession = localStorage.getItem("activeSession");
    setHasPreviousData(!!storedData);

    if (activeSession) {
      dispatch(setActiveSession(activeSession));
    }
  }, [router]);

  const handleViewSubmissions = () => {
    router.push("/submissions");
  };

  const handleContinue = () => {
    router.push("/resume");
  };

  const handleStartNew = () => {
    localStorage.removeItem("formData");
    dispatch(setFormData([{ step: 0 , data: {}, completed: false }]));
    localStorage.removeItem("activeSession");
    dispatch(setActiveSession(null));
    router.push("/resume");
  };

  return (
    <div className="w-full min-h-screen bg-customgreys-primarybg p-4 md:p-10">
      <div className="flex w-full justify-end">
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
          <div className="flex flex-col md:flex-row w-full items-center justify-center gap-4 md:gap-20">
            <Button
              type="button"
              className="w-full md:w-fit text-lg md:text-xl min-w-[18rem] px-6 md:px-8 my-2 md:my-6 py-5 md:py-6 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow font-semibold"
              onClick={handleViewSubmissions}
            >
              View My Submissions
            </Button>
            <Button
              type="button"
              className="w-full md:w-fit text-lg md:text-xl min-w-[18rem] px-6 md:px-8 my-2 md:my-6 py-5 md:py-6 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow font-semibold"
              onClick={handleContinue}
              style={!hasPreviousData ? { display: 'none' } : {}}
            >
              Continue Previous Session
            </Button>
            <Button
              type="button"
              className="w-full md:w-fit text-lg md:text-xl min-w-[18rem] px-6 md:px-8 my-2 md:my-6 py-5 md:py-6 bg-orange-500 hover:bg-orange-300 text-white-100 rounded-full shadow font-semibold"
              onClick={handleStartNew}
            >
              Start New
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

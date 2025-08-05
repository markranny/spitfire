"use client";

import { useGetUserQuery } from "@/state/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const useUser = (token : string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // const { data: course, ...rest } = useGetUserQuery(token);

  useEffect(() => {
    //
  }, []);

  return { isLoaded, isSignedIn };
};

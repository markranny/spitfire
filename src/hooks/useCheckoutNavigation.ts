"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export const useCheckoutNavigation = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigationStep = parseInt(searchParams.get("step") ?? "1", 10);

  const navigateToStep = useCallback(
    (step: number) => {;
      router.push(`/resume?step=${step}`, {
        scroll: false,
      });
    },
    [router]
  );

  useEffect(() => {
    navigateToStep(navigationStep);
  }, [navigationStep, navigateToStep]);

  return { navigationStep, navigateToStep };
};

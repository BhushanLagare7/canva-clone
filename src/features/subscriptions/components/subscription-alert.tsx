"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useFailModal } from "@/features/subscriptions/store/use-fail-modal";
import { useSuccessModal } from "@/features/subscriptions/store/use-success-modal";

export const SubscriptionAlert = () => {
  const params = useSearchParams();

  const { onOpen: onOpenFail } = useFailModal();
  const { onOpen: onOpenSuccess } = useSuccessModal();

  const canceled = params.get("canceled");
  const success = params.get("success");

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (canceled) {
      onOpenFail();
      router.replace(pathname, { scroll: false });
    }

    if (success) {
      onOpenSuccess();
      router.replace(pathname, { scroll: false });
    }
  }, [canceled, onOpenFail, success, onOpenSuccess, router, pathname]);

  return null;
};

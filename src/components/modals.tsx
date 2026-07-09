"use client";

import { useEffect, useState } from "react";

import { FailModal } from "@/features/subscriptions/components/fail-modal";
import { SubscriptionModal } from "@/features/subscriptions/components/subscription-modal";
import { SuccessModal } from "@/features/subscriptions/components/success-modal";

export const Modals = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <SuccessModal />
      <FailModal />
      <SubscriptionModal />
    </>
  );
};

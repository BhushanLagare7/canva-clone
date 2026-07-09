"use client";

import { FailModal } from "@/features/subscriptions/components/fail-modal";
import { SubscriptionModal } from "@/features/subscriptions/components/subscription-modal";
import { SuccessModal } from "@/features/subscriptions/components/success-modal";

export const Modals = () => {
  return (
    <>
      <SuccessModal />
      <FailModal />
      <SubscriptionModal />
    </>
  );
};

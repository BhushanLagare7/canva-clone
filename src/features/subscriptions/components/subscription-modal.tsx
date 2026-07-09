"use client";

import Image from "next/image";

import { CheckCircle2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCheckout } from "@/features/subscriptions/api/use-checkout";
import { useSubscriptionModal } from "@/features/subscriptions/store/use-subscription-modal";

export const SubscriptionModal = () => {
  const mutation = useCheckout();
  const { isOpen, onClose } = useSubscriptionModal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="flex items-center space-y-4">
          <Image alt="Logo" height={36} src="/logo.svg" width={36} />
          <DialogTitle className="text-center">
            Upgrade to a paid plan
          </DialogTitle>
          <DialogDescription className="text-center">
            Upgrade to a paid plan to unlock more features
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <ul className="space-y-2">
          <li className="flex items-center">
            <CheckCircle2Icon className="mr-2 size-5 fill-blue-500 text-white" />
            <p className="text-muted-foreground text-sm">Unlimited projects</p>
          </li>
          <li className="flex items-center">
            <CheckCircle2Icon className="mr-2 size-5 fill-blue-500 text-white" />
            <p className="text-muted-foreground text-sm">Unlimited templates</p>
          </li>
          <li className="flex items-center">
            <CheckCircle2Icon className="mr-2 size-5 fill-blue-500 text-white" />
            <p className="text-muted-foreground text-sm">
              AI Background removal
            </p>
          </li>
          <li className="flex items-center">
            <CheckCircle2Icon className="mr-2 size-5 fill-blue-500 text-white" />
            <p className="text-muted-foreground text-sm">AI Image generation</p>
          </li>
        </ul>
        <DialogFooter className="mt-4 gap-y-2 pt-2">
          <Button
            className="w-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Upgrade
          </Button>
          {mutation.isError && (
            <p className="text-center text-sm text-destructive mt-2">
              {mutation.error?.message || "Failed to initiate checkout"}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

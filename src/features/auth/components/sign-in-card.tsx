"use client";

import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export const SignInCard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const params = useSearchParams();
  const error = params.get("error");

  const onCredentialSignIn = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    try {
      await signIn("credentials", {
        email: email,
        password: password,
        callbackUrl: "/",
      });
    } finally {
      setIsPending(false);
    }
  };

  const onProviderSignIn = (provider: "github" | "google") => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <Card className="h-full w-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Login to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {!!error && (
        <div className="bg-destructive/15 text-destructive mb-6 flex items-center gap-x-2 rounded-md p-3 text-sm">
          <TriangleAlertIcon className="size-4" />
          <p>Invalid email or password</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form className="space-y-2.5" onSubmit={onCredentialSignIn}>
          <Input
            disabled={isPending}
            placeholder="Email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            disabled={isPending}
            placeholder="Password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full" disabled={isPending} size="lg" type="submit">
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            className="relative w-full"
            disabled={isPending}
            size="lg"
            variant="outline"
            onClick={() => onProviderSignIn("google")}
          >
            <FcGoogle className="absolute top-2.5 left-2.5 mr-2 size-5" />
            Continue with Google
          </Button>
          <Button
            className="relative w-full"
            disabled={isPending}
            size="lg"
            variant="outline"
            onClick={() => onProviderSignIn("github")}
          >
            <FaGithub className="absolute top-2.5 left-2.5 mr-2 size-5" />
            Continue with Github
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up">
            <span className="text-sky-700 hover:underline">Sign up</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

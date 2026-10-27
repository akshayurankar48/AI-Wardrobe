import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense>
      <div className="flex min-h-screen items-center justify-center">
        <SignIn />
      </div>
    </Suspense>
  );
}

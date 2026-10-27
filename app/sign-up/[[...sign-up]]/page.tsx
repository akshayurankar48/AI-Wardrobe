import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense>
      <div className="flex min-h-screen items-center justify-center">
        <SignUp />
      </div>
    </Suspense>
  );
}

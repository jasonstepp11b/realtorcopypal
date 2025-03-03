"use client";

import { useRouter } from "next/navigation";

export default function SignInButton() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/auth/sign-in");
  };

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out"
    >
      Sign in with Email
    </button>
  );
}

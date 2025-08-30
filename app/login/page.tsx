"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/public/images/Logo.png";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid credentials");
    } else {
      setError("");
      router.push("/"); // redirect after login
    }
  }

  return (
    <div className="w-full flex items-center justify-center h-screen">
      <div className="p-4 border flex flex-col items-center w-lg rounded shadow-[0px_0px_23px_2px_rgba(0,_0,_0,_0.1)] dark:bg-primary-foreground">
        {/* <Image src={Logo} alt="logo" className="mb-10 h-auto w-1/3" /> */}
        <div className="w-full flex flex-col gap-2 justify-center mb-4">
          <h1 className="text-3xl font-semibold text-center">Welcome Back</h1>
          <p className="text-sm text-gray-500 text-center">
            Enter your email and password to access your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="w-full flex flex-col gap-2">
            <label className="font-medium">Email Address</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border p-2 rounded"
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <label className="font-medium">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border p-2 rounded"
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            className="bg-gradient-to-b from-[#4d6dff] to-[#0066ff] text-white font-medium p-2 rounded shadow-[inset_0px_0px_6px_5px_rgba(0,_0,_0,_0.1)]"
          >
            Log In
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 font-medium">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}


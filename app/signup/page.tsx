"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/public/images/Logo.png";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    // Call your API to create user (for demo, we fake this)
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to signup");
        return;
      }

      setError("");
      router.push("/login"); // redirect to login after signup
    } catch {
      setError("Failed to signup");
    }
  }

  return (
    <div className="w-full flex items-center justify-center h-screen">
      <div className="p-4 border flex flex-col items-center w-lg rounded shadow-[0px_0px_23px_2px_rgba(0,_0,_0,_0.1)]">
        {/* <Image src={Logo} alt="logo" className="mb-10 h-auto w-1/3" /> */}
        <div className="w-full flex flex-col gap-2 justify-center mb-4">
          <h1 className="text-3xl font-semibold text-center">
            Create Your Account
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Fill in the details below to get started
          </p>
        </div>
        <form onSubmit={handleSignup} className="flex flex-col gap-4 w-full">
          <div className="w-full flex flex-col gap-2">
            <label className="font-medium">Name</label>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border p-2 rounded"
            />
          </div>
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
            className="bg-gradient-to-b from-[#4d6dff] to-[#0066ff] text-white font-medium p-2 rounded shadow-[0_4px_0_#003bb3] hover:shadow-[0_2px_0_#003bb3] active:translate-y-[2px] transition-all duration-150"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-gray-500 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-medium">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}

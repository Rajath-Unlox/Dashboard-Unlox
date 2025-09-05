"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

async function handleSubmit(e: any) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ org_email: email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      router.push("/");
    } else {
      let errorMessage = "An unknown error occurred. Please try again.";
      try {
        const errorData = await res.json();
        errorMessage =
          errorData.message || "Invalid credentials. Please try again.";
      } catch (jsonError) {
        const textResponse = await res.text();
        errorMessage = textResponse || "An unexpected error occurred.";
      }
      setError(errorMessage);
    }
  } catch (err) {
    console.error("Login failed:", err);
    setError("An unexpected error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="w-full flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-sm rounded-xl border border-gray-300 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and password to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div
              className="rounded-lg bg-red-100 p-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-3 text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl disabled:bg-gray-400 disabled:shadow-none"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a
            href="/forgotPassword"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Forgot Password?
          </a>
        </div>
        <div className="mt-4 text-center">
          <a
            href="/resetPassword"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Reset Password
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

"use client";
import { useState } from "react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e:any) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ org_email:email }),
      });

      if (res.ok) {
        // Successful response, inform the user
        setMessage("If an account with that email exists, a password reset link has been sent.");
      } else {
        // Handle API errors gracefully
        let errorMessage = "An unknown error occurred. Please try again.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || "Something went wrong. Please try again.";
        } catch (jsonError) {
          const textResponse = await res.text();
          errorMessage = textResponse || "An unexpected error occurred.";
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex min-h-screen items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-sm rounded-xl border border-gray-300 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">Forgot Password?</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {message && (
            <div className="rounded-lg bg-green-100 p-3 text-sm text-green-700" role="alert">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-3 text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl disabled:bg-gray-400 disabled:shadow-none"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm font-medium text-blue-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

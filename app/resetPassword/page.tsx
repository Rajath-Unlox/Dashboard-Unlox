"use client";
import { useState } from "react";

const ResetPasswordPage = () => {
  // State to manage the current step of the process
  // 1: Enter email, 2: Enter OTP and new password
  const [step, setStep] = useState(1);

  // State for form inputs
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for UI feedback
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handles the first step: submitting the email to request an OTP.
   * @param {React.FormEvent} e The form event.
   */

  async function handleOtpSubmit(e: any) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ OTP:otp }),
      });

      if (res.ok) {
        setMessage("OTP verified successfully! You can now reset your password.");
        setError("");
        setStep(3); // Move to the new password step
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

    /**
   * Handles the second step: submitting the email to request an OTP.
   * @param {React.FormEvent} e The form event.
   */

  async function handleEmailSubmit(e:any) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        }
      );

      if (res.ok) {
        setMessage("A password reset OTP has been sent to your email.");
        setError("");
        setStep(2); // Move to the next step
      } else {
        const errorData =
          (await res.status) === 429
            ? { message: "Too many requests. Please try again later." }
            : await res.json();
        setError(
          errorData.message || "Something went wrong. Please try again."
        );
      }
    } catch (err) {
      console.error("Email submission failed:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handles the third step: submitting the OTP and new password to reset the password.
   * @param {React.FormEvent} e The form event.
   */
async function handlePasswordResetSubmit(e: any) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp ,newPassword }),
      });

      if (res.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setError("");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Password reset failed:", err);
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
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {step === 1
              ? "Enter your email to receive an OTP."
              : "Enter the OTP and your new password."}
          </p>
        </div>

        {/* --- Step 1: Email Form --- */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
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

            {message && (
              <div
                className="rounded-lg bg-green-100 p-3 text-sm text-green-700"
                role="alert"
              >
                {message}
              </div>
            )}

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
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </form>
        )}

        {/* --- Step 2: OTP Form --- */}
        {step === 2 && (
          <form
            onSubmit={handleOtpSubmit}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                OTP
              </label>
              <input
                type="text"
                placeholder="Enter your OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {message && (
              <div
                className="rounded-lg bg-green-100 p-3 text-sm text-green-700"
                role="alert"
              >
                {message}
              </div>
            )}

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
              {loading ? "Verifying Otp..." : "Verify OTP"}
            </button>
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Go back
              </button>
            </div>
          </form>
        )}

                {step === 3 && (
          <form
            onSubmit={handlePasswordResetSubmit}
            className="flex flex-col gap-5"
          >
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {message && (
              <div
                className="rounded-lg bg-green-100 p-3 text-sm text-green-700"
                role="alert"
              >
                {message}
              </div>
            )}

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
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Go back
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

"use client";

import React, { useState } from "react";
import { ArrowRight, User, Lock, MapPin, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Just console log for now
    console.log("Login attempt:", formData);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // For demo, show success then redirect
      router.push("/");
    }, 1500);
  };

  return (
    <section className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden px-4 md:px-6">
      {/* Curved dashed grid background */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M0,0 C30,10 70,10 100,0 L100,100 C70,90 30,90 0,100 Z' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M0,50 C30,40 70,60 100,50' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M0,0 Q25,25 50,50 Q75,75 100,100' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3Cpath d='M100,0 Q75,25 50,50 Q25,75 0,100' stroke='%23000000' fill='none' stroke-width='0.5' stroke-dasharray='4 3' /%3E%3C/svg%3E")`,
          backgroundSize: "300px 300px",
          backgroundPosition: "center",
          transform: "rotate(5deg) scale(1.5)",
        }}
      ></div>

      {/* Decorative elements - similar to Hero */}
      {/* Circular Image 1 - Left Side */}
      <div className="absolute left-[15%] top-[8%] -translate-x-1/4 hidden sm:block z-10">
        <div className="relative w-32 h-32 md:w-48 md:h-48 lg:w-[500px] lg:h-[500px]">
          <div
            className="absolute inset-[-8px] rounded-full border-2 border-dashed border-black"
            style={{ animation: "spin 35s linear infinite" }}
          ></div>
          <div className="rounded-full overflow-hidden h-full w-full">
            <Image
              src="/kandy_perehera_artwork.jpg"
              alt="Scenic landmark"
              className="object-cover w-full h-full"
              width={200}
              height={200}
            />
          </div>
        </div>
      </div>
      {/* Circular Image 3 - Right Side */}
      <div className="absolute right-[5%] top-[8%] -translate-x-1/4 hidden sm:block z-10">
        <div className="relative w-32 h-32 md:w-48 md:h-48 lg:w-[400px] lg:h-[400px]">
          <div
            className="absolute inset-[-8px] rounded-full border-2 border-dashed border-black"
            style={{ animation: "spin 35s linear infinite" }}
          ></div>
          <div className="rounded-full overflow-hidden h-full w-full">
            <Image
              src="/mirissa.jpg"
              alt="Scenic landmark"
              className="object-cover w-full h-full"
              width={200}
              height={200}
            />
          </div>
        </div>
      </div>

      {/* Circular Image 2 - Right Side */}
      <div className="absolute right-[28%] bottom-[1%] translate-x-1/4 hidden sm:block z-10">
        <div className="relative w-24 h-24 md:w-36 md:h-36 lg:w-[200px] lg:h-[200px]">
          <div
            className="absolute inset-[-8px] rounded-full border-2 border-dashed border-black"
            style={{ animation: "spin-reverse 30s linear infinite" }}
          ></div>
          <div className="rounded-full overflow-hidden h-full w-full">
            <Image
              src="/tea_farm.jpeg"
              alt="Cultural landmark"
              className="object-cover w-full h-full"
              width={150}
              height={150}
            />
          </div>
        </div>
      </div>

      {/* Main login card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 md:p-8 w-full max-w-md z-20 animate-fade-in-up">
        {/* Branding header */}
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-block group">
            <div className="mb-3 md:mb-4 flex items-center justify-center">
              <MapPin
                size={28}
                className="text-black group-hover:scale-110 transition-transform"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-black">
              Travelon
            </h1>
          </Link>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Welcome back! Please login to your account
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username field */}
          <div className="group">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User
                  size={18}
                  className="text-gray-400 group-focus-within:text-black transition-colors"
                />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="group">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock
                  size={18}
                  className="text-gray-400 group-focus-within:text-black transition-colors"
                />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Additional form elements */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-black hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
              <span className="block sm:inline">{error}</span>
              <button
                type="button"
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={() => setError("")}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full group bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 text-base font-medium"
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <>
                Login
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-black hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Responsive decorative elements - kept from original design */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-2 h-2 bg-black rounded-full animate-pulse z-20"></div>
      <div className="absolute bottom-16 sm:bottom-32 right-8 sm:right-32 w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-700 z-20"></div>
      <div className="absolute top-1/2 right-4 sm:right-16 w-1 h-1 bg-black rounded-full animate-pulse delay-1000 z-20"></div>
    </section>
  );
};

export default LoginPage;

"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Lock,
  MapPin,
  Building2,
  Map,
  Home,
  X,
  Phone,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Add Firebase imports
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/db/firebaseClient";

const SignupPage = () => {
  const router = useRouter();
  const [phase, setPhase] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);

  const [formData, setFormData] = useState({
    // Phase 1: User Details
    firstName: "",
    lastName: "",
    username: "",

    // Phase 2: Account Security
    email: "",
    password: "",
    confirmPassword: "",

    // Phase 3: Organization Details
    orgName: "",
    phoneNumber: "",
    address: "",
    district: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password match when either password or confirmPassword changes
    if (name === "password" || name === "confirmPassword") {
      const otherField = name === "password" ? "confirmPassword" : "password";
      setPasswordMatch(
        value === "" || formData[otherField] === "" || value === formData[otherField]
      );
    }
  };

  const handleNextPhase = (e: React.FormEvent) => {
    e.preventDefault();

    if (phase === 2 && formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      return;
    }

    setPhase(phase + 1);
  };

  const handlePrevPhase = () => {
    setPhase(phase - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // 2. Get the user ID
      const user = userCredential.user;
      const uid = user.uid;
      
      // 3. Prepare profile data
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        orgName: formData.orgName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        district: formData.district,
        email: formData.email, // Include email as it's useful for profile
      };
      
      // 4. Store profile data in the database via API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          profileData,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to complete signup process');
      }
      
      // 5. Redirect to login page with success message
      router.push('/auth/login?registered=success');
      
    } catch (error: any) {
      console.log('Signup error:', error);
      
      // Handle specific Firebase Auth errors with detailed messages
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please use a different email or login instead.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address. Please check your email and try again.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use at least 6 characters.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          default:
            errorMessage = `Error: ${error.message || 'Unknown error occurred'}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get phase title
  const getPhaseTitle = () => {
    switch (phase) {
      case 1:
        return "Personal Details";
      case 2:
        return "Account Security";
      case 3:
        return "Organization Details";
      default:
        return "Sign Up";
    }
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

      {/* Decorative elements - keeping the same */}
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

      {/* Main signup card */}
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
            Join as an Event Organizer
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-black">
              {getPhaseTitle()}
            </span>
            <span className="text-xs text-gray-500">Step {phase} of 3</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-black h-2.5 rounded-full transition-all duration-500"
              style={{
                width:
                  phase === 1
                    ? "33%"
                    : phase === 2
                    ? "66%"
                    : "100%",
              }}
            ></div>
          </div>
        </div>

        {/* Phase 1: Personal Details */}
        {phase === 1 && (
          <form onSubmit={handleNextPhase} className="space-y-4">
            {/* First Name field */}
            <div className="group">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User
                    size={18}
                    className="text-gray-400 group-focus-within:text-black transition-colors"
                  />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter your first name"
                />
              </div>
            </div>

            {/* Last Name field */}
            <div className="group">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User
                    size={18}
                    className="text-gray-400 group-focus-within:text-black transition-colors"
                  />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

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
                  placeholder="Choose a username"
                />
              </div>
            </div>

            {/* Next button */}
            <button
              type="submit"
              className="w-full group bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 text-base font-medium mt-6"
            >
              Continue to Account Security
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>
        )}

        {/* Phase 2: Account Security */}
        {phase === 2 && (
          <form onSubmit={handleNextPhase} className="space-y-4">
            {/* Email field */}
            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail
                    size={18}
                    className="text-gray-400 group-focus-within:text-black transition-colors"
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter your email address"
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
                  placeholder="Create a strong password"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters
              </p>
            </div>

            {/* Confirm Password field */}
            <div className="group">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck
                    size={18}
                    className="text-gray-400 group-focus-within:text-black transition-colors"
                  />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-black transition-all duration-200 outline-none ${
                    passwordMatch
                      ? "border-gray-300 focus:border-black"
                      : "border-red-500 focus:border-red-500 focus:ring-red-500"
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {!passwordMatch && (
                <p className="mt-1 text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
            </div>

                        {/* Navigation buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handlePrevPhase}
                className="w-1/3 group border-2 border-black text-black px-3 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-1 text-xs sm:text-sm font-medium"
              >
                <ArrowLeft
                  size={14}
                  className="group-hover:-translate-x-1 transition-transform sm:h-5 sm:w-5"
                />
                <span className="text-xs sm:text-sm">Back</span>
              </button>
            
              <button
                type="submit"
                disabled={!passwordMatch}
                className={`w-2/3 group px-3 py-2.5 rounded-full flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  !passwordMatch
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                <span className="text-xs sm:text-sm">Continue to Org. Details</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform sm:h-5 sm:w-5"
                />
              </button>
            </div>
          </form>
        )}

        {/* Phase 3: Organization Details */}
        {phase === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Name field */}
            <div className="group">
              <label
                htmlFor="orgName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Organization Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2
                    size={18}
                    className="text-gray-400 group-focus-within:text-black transition-colors"
                  />
                </div>
                <input
                  id="orgName"
                  name="orgName"
                  type="text"
                  required
                  value={formData.orgName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter your organization name"
                />
              </div>
            </div>

            {/* Phone Number field */}
            <div className="group">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone
                    size={18}
                    className="text-gray-400 group-focus-within:text-black transition-colors"
                  />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter your contact number"
                />
              </div>
            </div>

            {/* Address field */}
            <div className="group">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home
                    size={18}
                    className="text-gray-400 group-focus-within:text-black transition-colors"
                  />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter your full address"
                />
              </div>
            </div>

            {/* District field */}
            <div className="group">
              <label
                htmlFor="district"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                District
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Map
                    size={18}
                    className="text-gray-400 group-focus-within:text-black transition-colors"
                  />
                </div>
                <input
                  id="district"
                  name="district"
                  type="text"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter your district"
                />
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

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handlePrevPhase}
                className="w-1/3 group border-2 border-black text-black px-4 py-3 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-1 text-base font-medium"
              >
                <ArrowLeft
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 group bg-black text-white px-4 py-3 rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 text-base font-medium"
              >
                {isLoading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Already have an account link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-black hover:underline font-medium"
            >
              Login
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

export default SignupPage;

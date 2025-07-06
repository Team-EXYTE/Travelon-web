"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Send,
  AlertTriangle,
  CheckCircle,
  Loader,
} from "lucide-react";

const SUPPORT_CATEGORIES = [
  { id: "technical", name: "Technical Issue" },
  { id: "account", name: "Account Problem" },
  { id: "billing", name: "Billing Question" },
  { id: "feature", name: "Feature Request" },
  { id: "complaint", name: "Complaint" },
  { id: "other", name: "Other" },
];

const Support = () => {
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 20) {
      newErrors.message = "Message should be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus("idle");

    try {
      // Create form data to send files
      const supportData = new FormData();
      supportData.append("subject", formData.subject);
      supportData.append("category", formData.category);
      supportData.append("message", formData.message);

      // Send support request to API
      const response = await fetch("/api/organizer/support", {
        method: "POST",
        body: supportData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send support request");
      }

      // Reset form on success
      setFormData({
        subject: "",
        category: "",
        message: "",
      });
      setSubmitStatus("success");
      setStatusMessage(
        "Your support request has been submitted successfully. We will get back to you soon."
      );
    } catch (error: any) {
      console.error("Error submitting support request:", error);
      setSubmitStatus("error");
      setStatusMessage(
        error.message ||
          "Failed to send support request. Please try again later."
      );
    } finally {
      setLoading(false);

      // Reset status after 5 seconds
      if (submitStatus === "success") {
        setTimeout(() => {
          setSubmitStatus("idle");
          setStatusMessage("");
        }, 5000);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <HelpCircle className="h-6 w-6 mr-2 text-gray-700" />
        <h1 className="text-2xl font-bold">Help & Support</h1>
      </div>

      {/* Status messages */}
      {submitStatus === "success" && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-800">Request Submitted</h3>
            <p className="text-green-700 text-sm mt-1">{statusMessage}</p>
          </div>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Submission Failed</h3>
            <p className="text-red-700 text-sm mt-1">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Support form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Submit a Support Request
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Our team will respond to your request as soon as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Subject field */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief description of your issue"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errors.subject ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
            )}
          </div>

          {/* Category dropdown */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a category</option>
              {SUPPORT_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Message textarea */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              placeholder="Describe your issue or request in detail..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errors.message ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Submit Support Request
                </>
              )}
            </button>
          </div>
        </form>

        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">
            Need urgent help?
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            For urgent matters, please contact our support team directly at{" "}
            <a
              href="mailto:support@travelon.com"
              className="text-black font-medium hover:underline"
            >
              support@travelon.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;

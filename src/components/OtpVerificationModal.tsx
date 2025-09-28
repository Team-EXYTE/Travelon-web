import { useState, useRef, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Send, Loader } from "lucide-react";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  isOrganizer?: boolean; // Add this prop with default value
  onVerificationSuccess: (data: {
    subscriberId: string;
    subscriptionStatus: string;
    token: string;
  }) => void;
}

const OtpVerificationModal = ({
  isOpen,
  onClose,
  phoneNumber,
  isOrganizer = true, // Default to organizer
  onVerificationSuccess,
}: OtpVerificationModalProps) => {
  const [step, setStep] = useState<"send" | "verify" | "success" | "error">(
    "send"
  );
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("send");
      setOtp(["", "", "", "", "", ""]);
      setError(null);
      setSessionId(null);
      setRemainingAttempts(null);
    }
  }, [isOpen]);

  // Handle countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    // Allow only digits
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down events for backspace and navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP request
  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      // Send request to generate OTP using the mSpace API route
      const response = await fetch("/api/mspace/otp/request", {
      // const response = await fetch('/api/organizer/verify-phone/send-otp', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          phone: phoneNumber,
          isOrganizer // Pass the flag to the API
        }),
      //body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // Store session ID for verification step
      setSessionId(data.sessionId);

      // Move to verification step
      setStep("verify");
      setCountdown(30); // 2 minute countdown for resend
      console.log("OTP sent successfully");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    if (!sessionId) {
      setError("Session expired. Please request a new OTP.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send verification request to mSpace verify API
      const response = await fetch("/api/mspace/otp/verify", {
      // const response = await fetch('/api/organizer/verify-phone/verify-otp', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otpValue,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for remaining attempts
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }

        throw new Error(data.error || "Invalid OTP");
      }

      // Show success and update UI
      setStep("success");

      setTimeout(() => {
        // Pass important data back to the parent component
        onVerificationSuccess({
          subscriberId: data.subscriberId,
          subscriptionStatus: data.subscriptionStatus,
          token: data.token,
        });
        onClose();
      }, 2000); // Close after showing success message
    } catch (err: any) {
      setError(err.message);
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 md:p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full relative animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 p-1 rounded-full hover:bg-gray-100"
          disabled={loading}
        >
          <X size={18} className="md:w-5 md:h-5" />
        </button>

        <div className="p-4 md:p-6">
          {step === "send" && (
            <>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">
                Verify Your Phone Number
              </h3>
              <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
                We&apos;ll send a 6-digit code to{" "}
                <span className="font-semibold">{phoneNumber}</span> to verify
                your phone number.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-lg mb-3 md:mb-4 text-sm">
                  <div className="flex items-center">
                    <AlertTriangle
                      size={14}
                      className="mr-1.5 md:mr-2 md:w-4 md:h-4"
                    />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-black text-white py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-1.5 md:gap-2 hover:bg-gray-800 transition-colors text-sm md:text-base"
              >
                {loading ? (
                  <Loader size={14} className="animate-spin md:w-4 md:h-4" />
                ) : (
                  <Send size={14} className="md:w-4 md:h-4" />
                )}
                Send Verification Code
              </button>
            </>
          )}

          {step === "verify" && (
            <>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center">
                Enter Verification Code
              </h3>
              <p className="text-sm md:text-base text-gray-600 text-center mb-4 md:mb-6">
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold">{phoneNumber}</span>
              </p>

              {/* OTP Input Grid - Responsive version */}
              <div className="flex justify-center space-x-1.5 xs:space-x-2 sm:space-x-3 mb-5 md:mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-9 h-10 xs:w-10 xs:h-11 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all"
                    autoFocus={index === 0}
                    inputMode="numeric"
                  />
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-lg mb-3 md:mb-4 text-sm">
                  <div className="flex items-center">
                    <AlertTriangle
                      size={14}
                      className="mr-1.5 md:mr-2 md:w-4 md:h-4"
                    />
                    <span>
                      {error}
                      {remainingAttempts !== null &&
                        ` (${remainingAttempts} attempts remaining)`}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length !== 6}
                className="w-full bg-black text-white py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-1.5 md:gap-2 hover:bg-gray-800 transition-colors mb-2 md:mb-3 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? (
                  <Loader size={14} className="animate-spin md:w-4 md:h-4" />
                ) : (
                  <CheckCircle size={14} className="md:w-4 md:h-4" />
                )}
                Verify Code
              </button>

              <div className="text-center text-xs md:text-sm text-gray-500">
                {countdown > 0 ? (
                  <p>Resend code in {countdown}s</p>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-black hover:underline"
                  >
                    Resend code
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">
                The code is valid for 60 minutes
              </div>
            </>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-5 md:py-8">
              <div className="bg-green-100 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                <CheckCircle
                  size={24}
                  className="text-green-600 md:w-8 md:h-8"
                />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-center">
                Verification Successful
              </h3>
              <p className="text-sm md:text-base text-gray-600 text-center">
                Your phone number has been verified successfully!
              </p>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center py-5 md:py-8">
              <div className="bg-red-100 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                <AlertTriangle
                  size={24}
                  className="text-red-600 md:w-8 md:h-8"
                />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-center">
                Verification Failed
              </h3>
              <p className="text-red-600 text-center mb-3 md:mb-4 text-sm md:text-base">
                {error || "Failed to verify phone number. Please try again."}
              </p>
              <button
                onClick={() => setStep("send")}
                className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm md:text-base"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;

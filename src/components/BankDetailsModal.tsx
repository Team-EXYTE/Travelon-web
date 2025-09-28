import React, { useState, useEffect } from "react";
import { X, Save, ExternalLink } from "lucide-react";

interface BankDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bankDetails: BankDetails) => void;
  initialDetails?: BankDetails;
}

export interface BankDetails {
  bankName: string;
  bankCode: string;
  branchName: string;
  branchCode: string;
  accountNumber: string;
}

const BankDetailsModal = ({
  isOpen,
  onClose,
  onSave,
  initialDetails,
}: BankDetailsProps) => {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: "",
    bankCode: "",
    branchName: "",
    branchCode: "",
    accountNumber: "",
  });
  const [errors, setErrors] = useState<Partial<BankDetails>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with existing details if available
  useEffect(() => {
    if (initialDetails) {
      setBankDetails(initialDetails);
    }
  }, [initialDetails, isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear error when field is edited
    if (errors[name as keyof BankDetails]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankDetails> = {};

    if (!bankDetails.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!bankDetails.bankCode.trim()) {
      newErrors.bankCode = "Bank code is required";
    } else if (!/^\d+$/.test(bankDetails.bankCode)) {
      newErrors.bankCode = "Bank code must contain only numbers";
    }

    if (!bankDetails.branchName.trim()) {
      newErrors.branchName = "Branch name is required";
    }

    if (!bankDetails.branchCode.trim()) {
      newErrors.branchCode = "Branch code is required";
    } else if (!/^\d+$/.test(bankDetails.branchCode)) {
      newErrors.branchCode = "Branch code must contain only numbers";
    }

    if (!bankDetails.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(bankDetails.accountNumber)) {
      newErrors.accountNumber = "Account number must contain only numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSave(bankDetails);
      onClose();
    } catch (err) {
      console.error("Error saving bank details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md relative animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Bank Account Details</h3>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 mb-5">
            <div className="flex items-start">
              <p className="text-sm">
                Don&apos;t know your bank codes?
                <a
                  href="https://ceylonexchange.com.au/bank-codes-for-sri-lankan-banks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center text-blue-600 hover:underline font-medium"
                >
                  Find bank info
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Bank Name */}
              <div>
                <label
                  htmlFor="bankName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={bankDetails.bankName}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.bankName ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm p-2.5 focus:outline-none focus:ring-black focus:border-black`}
                  placeholder="e.g. Bank of Ceylon"
                  disabled={isLoading}
                />
                {errors.bankName && (
                  <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
                )}
              </div>

              {/* Bank Code */}
              <div>
                <label
                  htmlFor="bankCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bank Code
                </label>
                <input
                  type="text"
                  id="bankCode"
                  name="bankCode"
                  value={bankDetails.bankCode}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.bankCode ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm p-2.5 focus:outline-none focus:ring-black focus:border-black`}
                  placeholder="e.g. 7010"
                  disabled={isLoading}
                />
                {errors.bankCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.bankCode}</p>
                )}
              </div>

              {/* Branch Name */}
              <div>
                <label
                  htmlFor="branchName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Branch Name
                </label>
                <input
                  type="text"
                  id="branchName"
                  name="branchName"
                  value={bankDetails.branchName}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.branchName ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm p-2.5 focus:outline-none focus:ring-black focus:border-black`}
                  placeholder="e.g. Colombo Main Branch"
                  disabled={isLoading}
                />
                {errors.branchName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.branchName}
                  </p>
                )}
              </div>

              {/* Branch Code */}
              <div>
                <label
                  htmlFor="branchCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Branch Code
                </label>
                <input
                  type="text"
                  id="branchCode"
                  name="branchCode"
                  value={bankDetails.branchCode}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.branchCode ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm p-2.5 focus:outline-none focus:ring-black focus:border-black`}
                  placeholder="e.g. 701"
                  disabled={isLoading}
                />
                {errors.branchCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.branchCode}
                  </p>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label
                  htmlFor="accountNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={bankDetails.accountNumber}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${
                    errors.accountNumber ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm p-2.5 focus:outline-none focus:ring-black focus:border-black`}
                  placeholder="e.g. 1234567890"
                  disabled={isLoading}
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.accountNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-black text-white py-2.5 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Bank Details
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsModal;

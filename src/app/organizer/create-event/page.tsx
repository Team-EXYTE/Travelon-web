"use client";
import dynamic from "next/dynamic";
import React, { useState, useRef } from "react";
import {
  Calendar,
  Clock,
  Image as ImageIcon,
  MapPin,
  Tag,
  Type,
  DollarSign,
  FileText,
  Save,
  X,
  Upload,
  Loader,
  AlertTriangle,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/db/firebaseClient";

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EVENT_CATEGORIES = [
  { name: "Music", color: "#FF5A5F" },
  { name: "Sports", color: "#3498DB" },
  { name: "Food & Drink", color: "#F1C40F" },
  { name: "Arts & Culture", color: "#9B59B6" },
  { name: "Outdoor", color: "#2ECC71" },
  { name: "Nightlife", color: "#34495E" },
  { name: "Technology", color: "#E74C3C" },
  { name: "Business", color: "#1ABC9C" },
  { name: "Wellness", color: "#D35400" },
  { name: "Education", color: "#27AE60" },
];

interface FormData {
  title: string;
  price: string;
  category: string;
  description: string;
  location: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  images: File[];
  maxParticipants: string; // Using string for form handling, will convert to number when needed
}

interface ImagePreview {
  file: File;
  preview: string;
}

const CreateEventPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    price: "",
    category: "",
    description: "",
    location: "",
    date: "",
    time: "",
    latitude: 0,
    longitude: 0,
    images: [],
    maxParticipants: "", // Empty string means open to everyone
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic import with no SSR for the map component (to avoid SSR issues with Leaflet)
  const LocationMap = dynamic(() => import("@/components/LocationMap"), {
    ssr: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);

    if (!e.target.files?.length) return;

    const selectedFiles = Array.from(e.target.files);

    // Check if adding these files would exceed MAX_IMAGES
    if (imagePreviews.length + selectedFiles.length > MAX_IMAGES) {
      setImageError(`You can upload a maximum of ${MAX_IMAGES} images`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    selectedFiles.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name}: Invalid file type`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name}: File too large (max 5MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length) {
      setImageError(invalidFiles.join(", "));
      return;
    }

    // Create previews for valid files
    const newPreviews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Title is required";
      }

      if (!formData.category) {
        newErrors.category = "Category is required";
      }

      if (!formData.price.trim()) {
        newErrors.price = "Price is required";
      } else if (isNaN(parseFloat(formData.price))) {
        newErrors.price = "Price must be a valid number";
      }

      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      } else if (formData.description.length < 50) {
        newErrors.description = "Description should be at least 50 characters";
      }

      if (formData.maxParticipants) {
        // Only validate if something is entered (empty is valid for unlimited)
        if (isNaN(parseInt(formData.maxParticipants))) {
          newErrors.maxParticipants =
            "Maximum participants must be a valid number";
        } else if (parseInt(formData.maxParticipants) <= 0) {
          newErrors.maxParticipants =
            "Maximum participants must be greater than 0";
        }
      }
    } else if (currentStep === 2) {
      if (!formData.location.trim()) {
        newErrors.location = "Location is required";
      }

      if (!formData.date) {
        newErrors.date = "Date is required";
      } else {
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          newErrors.date = "Date cannot be in the past";
        }
      }

      if (!formData.time) {
        newErrors.time = "Time is required";
      }

      if (formData.latitude === 0 && formData.longitude === 0) {
        newErrors.location = "Please select a location on the map";
      }
    } else if (currentStep === 3) {
      if (formData.images.length === 0) {
        newErrors.images = "At least one image is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  // Simulate getting map coordinates
  // In a real app, you'd integrate with a map API like Google Maps
  // const handleLocationSelect = useCallback(() => {
  //   // Simulate selecting Colombo, Sri Lanka coordinates
  //   setFormData((prev) => ({
  //     ...prev,
  //     latitude: 6.9271,
  //     longitude: 79.8612,
  //   }));
  // }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(step)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First get the authenticated user ID from our secure API
      const authResponse = await fetch("/api/auth/me");
      if (!authResponse.ok) {
        throw new Error("Authentication failed. Please log in again.");
      }

      const authData = await authResponse.json();
      const userId = authData.user?.uid;

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      // Upload images with proper error handling
      const imageUrls = await Promise.all(
        formData.images.map(async (file) => {
          const filename = `${Date.now()}_${file.name}`;
          const storageRef = ref(storage, `events/${filename}`);

          try {
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Monitor upload with better progress tracking
            await new Promise((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  // You can add upload progress here if you want
                  const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  console.log(`Upload progress: ${progress.toFixed(2)}%`);
                },
                (error) => {
                  console.error("Upload error:", error);
                  reject(error);
                },
                () => resolve(undefined)
              );
            });

            return await getDownloadURL(storageRef);
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            throw error;
          }
        })
      );

      // Create event document in Firestore with the securely verified user ID
      const eventDate = new Date(`${formData.date}T${formData.time}`);

      const eventData = {
        title: formData.title,
        price: formData.price,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        date: eventDate,
        isEnded: false,
        latitude: formData.latitude,
        longitude: formData.longitude,
        images: imageUrls,
        createdAt: serverTimestamp(),
        organizerId: userId, // Using the securely verified user ID
        maxParticipants: formData.maxParticipants
          ? parseInt(formData.maxParticipants)
          : null,
      };

      await addDoc(collection(db, "events"), eventData);

      setSuccess(true);
      setTimeout(() => {
        router.push("/organizer/events");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create event");
      console.error("Error creating event:", err);
    } finally {
      setLoading(false);
    }
  };

  // Render different form steps
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">
              Event Details
            </h2>

            {/* Title */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="title"
              >
                Event Title
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Type className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter event title"
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="category"
              >
                Event Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="category"
                  name="category"
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {EVENT_CATEGORIES.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="price"
              >
                Event Price (LKR)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="price"
                  name="price"
                  placeholder="Enter ticket price"
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter 0 for free events
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="description"
              >
                Event Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Describe your event in detail..."
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum 50 characters
              </p>
            </div>

            {/* Max Participants */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="maxParticipants"
              >
                Max Participants
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  placeholder="Enter max participants"
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.maxParticipants
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={formData.maxParticipants}
                  onChange={handleChange}
                />
              </div>
              {errors.maxParticipants && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.maxParticipants}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Leave blank for no limit
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">
              Location & Date
            </h2>

            {/* Location */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="location"
              >
                Event Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Enter venue address"
                  className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Map Component */}
            <div className="rounded-lg overflow-hidden border border-gray-300 ">
              <div className="h-64 w-full mb-5">
                <LocationMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={(lat, lng) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }));
                  }}
                />
              </div>
              <div className="py-2 px-3 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                {formData.latitude !== 0 && formData.longitude !== 0 ? (
                  <p>
                    Selected coordinates: {formData.latitude.toFixed(6)},{" "}
                    {formData.longitude.toFixed(6)}
                  </p>
                ) : (
                  <p>
                    Click on the map or drag the marker to select the exact
                    location
                  </p>
                )}
                <button
                  type="button"
                  className="px-2 py-2 text-xs bg-black text-white rounded hover:bg-gray-300 hover:text-black "
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        setFormData((prev) => ({
                          ...prev,
                          latitude,
                          longitude,
                        }));
                      },
                      (error) => {
                        console.error("Error getting user location:", error);
                        // Fallback to default location
                        setFormData((prev) => ({
                          ...prev,
                          latitude: 6.9271,
                          longitude: 79.8612,
                        }));
                      }
                    );
                  }}
                >
                  Use My Location
                </button>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="date"
                >
                  Event Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                      errors.date ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="time"
                >
                  Event Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                      errors.time ? "border-red-500" : "border-gray-300"
                    }`}
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">
              Event Images
            </h2>

            <div>
              <p className="text-sm text-gray-700 mb-2">
                Upload up to {MAX_IMAGES} images for your event (max 5MB each,
                JPEG/PNG)
              </p>

              {imageError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <p>{imageError}</p>
                  </div>
                </div>
              )}

              {errors.images && !imagePreviews.length && (
                <p className="mb-3 text-sm text-red-600">{errors.images}</p>
              )}

              {/* Image upload area */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {imagePreviews.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <Image
                      src={image.preview}
                      alt={`Event image ${index + 1}`}
                      fill
                      className="rounded-md object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  </div>
                ))}

                {/* Add image button (if less than MAX_IMAGES) */}
                {imagePreviews.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center aspect-square hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <Upload size={24} className="text-gray-400 mx-auto" />
                      <span className="text-sm text-gray-500 mt-1 block">
                        Add Image
                      </span>
                    </div>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                multiple
              />

              <p className="text-xs text-gray-500">
                First image will be used as the cover photo for your event.
              </p>
            </div>

            {/* Preview */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Event Preview</h3>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="relative h-48 bg-gray-200">
                  {imagePreviews[0] ? (
                    <Image
                      src={imagePreviews[0].preview}
                      alt="Event cover"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-lg">
                    {formData.title || "Event Title"}
                  </h4>

                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {formData.date
                        ? new Date(formData.date).toLocaleDateString()
                        : "Event Date"}
                    </span>
                    <span className="mx-2">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formData.time || "Event Time"}</span>
                  </div>

                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{formData.location || "Event Location"}</span>
                  </div>

                  <div className="flex items-center mt-2">
                    <Tag className="h-4 w-4 mr-1 text-gray-600" />
                    {formData.category ? (
                      <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded-full">
                        {formData.category}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">Category</span>
                    )}

                    <span className="ml-auto font-semibold">
                      {formData.price ? `LKR ${formData.price}` : "Price"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show success message
  if (success) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Event Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your event has been successfully created and will be visible to
            users soon.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your events page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Progress steps */}
        <div className="flex items-center mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div
                className={`flex flex-col items-center ${
                  stepNumber < 3 ? "flex-grow" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    stepNumber === step
                      ? "bg-black text-white"
                      : stepNumber < step
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stepNumber < step ? <CheckCircle size={18} /> : stepNumber}
                </div>
                <span className="text-xs mt-1.5 font-medium">
                  {stepNumber === 1
                    ? "Details"
                    : stepNumber === 2
                    ? "Location"
                    : "Images"}
                </span>
              </div>

              {stepNumber < 3 && (
                <div
                  className={`h-1 flex-grow mx-2 transition-colors ${
                    stepNumber < step ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {renderStep()}

          {/* Navigation buttons */}
          <div className="border-t border-gray-200 mt-8 pt-6 flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            ) : (
              <div /> // Empty div for spacing
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Create Event
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;

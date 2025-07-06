"use client";

import React, { useState, useEffect, useRef, use } from "react"; // Add use import
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  ArrowLeft,
} from "lucide-react";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/db/firebaseClient";
import dynamic from "next/dynamic";

// Dynamic import for the map component (no SSR)
const LocationMap = dynamic(
  () => import("@/components/LocationMap"),
  { ssr: false }
);

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
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
  isEnded: boolean;
  images: string[]; // URLs of existing images
  newImages: File[]; // New images to upload
  imagesToDelete: string[]; // URLs of images to delete
}

interface ImagePreview {
  file?: File;
  preview: string;
  isExisting: boolean;
  url?: string;
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalData, setOriginalData] = useState<any>(null);

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
    isEnded: false,
    images: [],
    newImages: [],
    imagesToDelete: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use React.use() to unwrap params - future-proof approach
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/organizer/events/${eventId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch event: ${response.statusText}`);
        }
        const data = await response.json();
        const event = data.event;

        // Keep original data for comparison
        setOriginalData(event);

        // Extract date and time from ISO string
        const eventDate = new Date(event.date);
        const dateString = eventDate.toISOString().split("T")[0];
        const timeString = eventDate.toTimeString().slice(0, 5);

        setFormData({
          title: event.title || "",
          price: event.price || "",
          category: event.category || "",
          description: event.description || "",
          location: event.location || "",
          date: dateString,
          time: timeString,
          latitude: event.latitude || 0,
          longitude: event.longitude || 0,
          isEnded: event.isEnded || false,
          images: event.images || [],
          newImages: [],
          imagesToDelete: [],
        });

        // Create previews for existing images
        const previews = (event.images || []).map((url: string) => ({
          preview: url,
          isExisting: true,
          url,
        }));
        setImagePreviews(previews);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]); // Use eventId instead of params.id

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
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
      isExisting: false,
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({
      ...prev,
      newImages: [...prev.newImages, ...validFiles],
    }));
  };

  const removeImage = (index: number) => {
    const imageToRemove = imagePreviews[index];

    if (imageToRemove.isExisting && imageToRemove.url) {
      // Mark existing image for deletion
      setFormData((prev) => ({
        ...prev,
        imagesToDelete: [...prev.imagesToDelete, imageToRemove.url!],
        images: prev.images.filter((url) => url !== imageToRemove.url),
      }));
    } else {
      // Remove newly added image
      const newFileIndex = formData.newImages.findIndex(
        (file) => URL.createObjectURL(file) === imageToRemove.preview
      );

      if (newFileIndex !== -1) {
        setFormData((prev) => ({
          ...prev,
          newImages: prev.newImages.filter((_, i) => i !== newFileIndex),
        }));
      }
    }

    // Remove from previews
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    // Check if there would be at least one image after changes
    if (
      formData.images.length -
        formData.imagesToDelete.length +
        formData.newImages.length ===
      0
    ) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

//   // Handle location selection
//   const handleLocationSelect = () => {
//     // Simulate selecting a location - in a real app you'd integrate with a map
//     setFormData((prev) => ({
//       ...prev,
//       latitude: 6.9271,
//       longitude: 79.8612,
//     }));
//   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
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

      // 1. Upload new images
      const newImageUrls = await Promise.all(
        formData.newImages.map(async (file) => {
          const filename = `${Date.now()}_${file.name}`;
          const storageRef = ref(storage, `events/${filename}`);

          try {
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Wait for upload
            await new Promise((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  console.log(`Upload progress: ${progress.toFixed(2)}%`);
                },
                reject,
                resolve
              );
            });

            // Get URL
            return await getDownloadURL(storageRef);
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            throw error;
          }
        })
      );

      // 2. Delete images marked for deletion
      await Promise.all(
        formData.imagesToDelete.map(async (url) => {
          try {
            // Extract the path from the URL
            const urlPath = decodeURIComponent(
              url.split("/o/")[1].split("?")[0]
            );
            const storageRef = ref(storage, urlPath);
            await deleteObject(storageRef);
          } catch (error) {
            console.error(`Failed to delete image: ${url}`, error);
            // Continue with other operations even if deletion fails
          }
        })
      );

      // 3. Prepare updated event data
      const eventDate = new Date(`${formData.date}T${formData.time}`);

      const eventData = {
        title: formData.title,
        price: formData.price,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        date: eventDate,
        isEnded: formData.isEnded,
        latitude: formData.latitude,
        longitude: formData.longitude,
        images: [
          ...formData.images.filter(
            (url) => !formData.imagesToDelete.includes(url)
          ),
          ...newImageUrls,
        ],
        updatedAt: serverTimestamp(),
      };

      // 4. Update the document
      await updateDoc(doc(db, "events", params.id), eventData);

      setSuccess(true);
      setTimeout(() => {
        router.push("/organizer/events");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update event");
      console.error("Error updating event:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Show error if event couldn't be loaded
  if (error && !originalData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertTriangle className="text-red-500 h-5 w-5 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <div className="mt-3">
              <button
                onClick={() => router.back()}
                className="text-sm font-medium text-red-800 hover:underline"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Event Updated Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your event has been successfully updated.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your events page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Event</h1>
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          <div className="space-y-6">
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

            {/* Map Placeholder */}
            <div className="rounded-lg overflow-hidden border border-gray-300">
              <div className="h-64 w-full">
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

            {/* Event Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isEnded"
                name="isEnded"
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                checked={formData.isEnded}
                onChange={handleCheckboxChange}
              />
              <label
                htmlFor="isEnded"
                className="ml-2 block text-sm text-gray-700"
              >
                Mark event as ended
              </label>
            </div>

            {/* Image upload */}
            <div>
              <p className="text-sm text-gray-700 mb-2">
                Event Images ({imagePreviews.length}/{MAX_IMAGES})
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

              {/* Image grid */}
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
          </div>

          {/* Form actions */}
          <div className="border-t border-gray-200 mt-8 pt-6 flex justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

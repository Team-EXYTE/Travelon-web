"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Camera,
  Calendar,
  Loader2,
  AlertCircle,
  X,
  CheckCheck,
  Info,
} from "lucide-react";
import Image from "next/image";

interface AdminProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  phoneNumberVerified: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

const AdminProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchProfileData();
  }, []);
  
  // Notification system
  const showNotification = (message: string, type: 'success' | 'error' | 'info', duration = 4000) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    
    // Force a browser reflow to ensure the notification appears with the animation
    setTimeout(() => {
      const notificationElement = document.getElementById(`notification-${id}`);
      if (notificationElement) {
        notificationElement.classList.remove('opacity-0', '-translate-y-4');
      }
    }, 10);
    
    // Auto-dismiss after duration
    setTimeout(() => {
      dismissNotification(id);
    }, duration);
  };
  
  const dismissNotification = (id: string) => {
    // Find the notification element
    const notificationElement = document.getElementById(`notification-${id}`);
    
    if (notificationElement) {
      // Add slide out animation with Tailwind classes
      notificationElement.classList.add('opacity-0', 'translate-x-full');
      
      // Remove after transition completes
      setTimeout(() => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
      }, 300); // Match transition duration
    } else {
      // Fall back to immediate removal if element not found
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Get all profile details from a single endpoint
      const profileResponse = await fetch('/api/admin/profile');
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const profileData = await profileResponse.json();
    //   console.log('Fetched profile data:', profileData);
      // The profile object from API already contains all needed data
      // including uid, firstName, lastName, email, etc.
      setProfile(profileData.profile);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.includes('image')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await fetch('/api/admin/profile/image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      setProfile(prev => prev ? {...prev, profileImage: result.imageUrl} : null);
      showNotification('Profile image updated successfully', 'success');
    } catch (err: any) {
      console.error('Error uploading image:', err);
      showNotification(err.message || 'Failed to upload image', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<AdminProfile>) => {
    try {
      setSaveLoading(true);
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const result = await response.json();
      setProfile(prev => prev ? {...prev, ...updatedData} : null);
      setShowEditModal(false);
      showNotification('Profile updated successfully', 'success');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      showNotification(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleVerifyPhone = async (otp: string) => {
    try {
      setSaveLoading(true);
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify phone number');
      }
      
      const result = await response.json();
      setProfile(prev => prev ? {...prev, phoneNumberVerified: true} : null);
      setShowVerifyModal(false);
      showNotification('Phone number verified successfully', 'success');
    } catch (err: any) {
      console.error('Error verifying phone:', err);
      showNotification(err.message || 'Failed to verify phone number', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!profile?.phoneNumber) {
      showNotification('Please add a phone number first', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: profile.phoneNumber 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }
      
      setShowVerifyModal(true);
      showNotification('Verification code sent to your phone', 'success');
    } catch (err: any) {
      console.error('Error sending verification code:', err);
      showNotification(err.message || 'Failed to send verification code', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 size={24} className="animate-spin text-gray-500 mb-2" />
          <div className="text-gray-500">Loading profile data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <AlertCircle size={24} className="text-red-500 mb-2" />
          <div className="text-red-500 mb-2">Error: {error}</div>
          <button 
            onClick={fetchProfileData} 
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No profile data found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            id={`notification-${notification.id}`}
            className={`flex items-center p-4 rounded-md shadow-md transform transition-all duration-300 ease-out opacity-0 -translate-y-4 ${
              notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 
              notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' : 
              'bg-blue-50 border-l-4 border-blue-500'
            }`}
          >
            <div className="mr-3">
              {notification.type === 'success' && (
                <CheckCheck className="h-5 w-5 text-green-500" />
              )}
              {notification.type === 'error' && (
                <X className="h-5 w-5 text-red-500" />
              )}
              {notification.type === 'info' && (
                <Info className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1 text-sm">
              <p className={`font-medium ${notification.type === 'success' ? 'text-green-800' : notification.type === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
                {notification.message}
              </p>
            </div>
            <button 
              onClick={() => dismissNotification(notification.id)}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <h1 className="text-3xl font-bold text-black mb-2">My Profile</h1>
      <p className="text-gray-600 mb-8">Manage your admin account details and settings</p>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {profile.profileImage ? (
                  <Image 
                    src={profile.profileImage}
                    alt="Profile" 
                    className="object-cover" 
                    fill 
                    sizes="96px"
                  />
                ) : (
                  <User size={32} className="text-gray-400" />
                )}
                {imageUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <label htmlFor="profileImage" className="absolute bottom-0 right-0 h-8 w-8 bg-black rounded-full flex items-center justify-center cursor-pointer">
                <Camera size={16} className="text-white" />
                <input 
                  type="file" 
                  id="profileImage" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                  disabled={imageUploading}
                />
              </label>
            </div>

            {/* Profile Overview */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">
                  {profile.role || 'Admin'}
                </span>
              </div>
              <div className="flex items-center mt-2 text-gray-600">
                <Mail size={16} className="mr-2" />
                {profile.email}
              </div>
              <div className="flex items-center mt-1 text-gray-600">
                <Phone size={16} className="mr-2" />
                {profile.phoneNumber || 'No phone number added'}
                {/* {profile.phoneNumber && (
                  <span className="ml-2">
                    {profile.phoneNumberVerified ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <button 
                        onClick={handleSendVerificationCode}
                        className="text-blue-600 text-sm ml-2 underline"
                      >
                        Verify
                      </button>
                    )}
                  </span>
                )} */}
              </div>
            </div>

            {/* Edit Button */}
            <button 
              onClick={() => setShowEditModal(true)}
              className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Edit size={16} className="mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Body */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">User ID</div>
                <div className="text-sm font-medium mt-1">{profile.uid}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">First Name</div>
                <div className="text-sm font-medium mt-1">{profile.firstName}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Last Name</div>
                <div className="text-sm font-medium mt-1">{profile.lastName}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-sm font-medium mt-1">{profile.email}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Role</div>
                <div className="text-sm font-medium mt-1 flex items-center">
                  <Shield size={16} className="mr-2 text-blue-500" />
                  {profile.role || 'Admin'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Phone Number</div>
                <div className="text-sm font-medium mt-1 flex items-center">
                  {profile.phoneNumber || 'Not provided'}
                  {profile.phoneNumber && profile.phoneNumberVerified && (
                    <span className="ml-2 flex items-center text-green-600 text-xs">
                      <CheckCircle size={14} className="mr-1" />
                      Verified
                    </span>
                  )}
                  {profile.phoneNumber && !profile.phoneNumberVerified && (
                    <span className="ml-2 flex items-center text-orange-600 text-xs">
                      <XCircle size={14} className="mr-1" />
                      Not verified
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Account Created</div>
                <div className="text-sm font-medium mt-1 flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-sm font-medium mt-1">
                  {new Date(profile.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Edit Profile</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updatedData = {
                firstName: formData.get('firstName') as string,
                lastName: formData.get('lastName') as string,
                phoneNumber: formData.get('phoneNumber') as string,
              };
              handleUpdateProfile(updatedData);
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    defaultValue={profile.firstName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    defaultValue={profile.lastName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    defaultValue={profile.email}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    defaultValue={profile.phoneNumber}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                    placeholder="+94XXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter phone number with country code</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
                  disabled={saveLoading}
                >
                  {saveLoading && <Loader2 size={18} className="animate-spin mr-2" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Verify Phone Number</h3>
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Enter the verification code sent to {profile.phoneNumber}
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const otp = formData.get('otp') as string;
              handleVerifyPhone(otp);
            }}>
              <div className="mb-4">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
                  disabled={saveLoading}
                >
                  {saveLoading && <Loader2 size={18} className="animate-spin mr-2" />}
                  Verify
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;

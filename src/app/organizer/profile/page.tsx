"use client";

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Calendar, 
  Shield, 
  CheckCircle,
  XCircle
} from 'lucide-react';
import OtpVerificationModal from '@/components/OtpVerificationModal';
import ProfileEditModal from '@/components/ProfileEditModal';

interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  orgName: string;
  phoneNumber: string;
  address: string;
  district: string;
  role: string;
  phoneNumberVerified: boolean;
  updatedAt: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/organizer/profile');
      
      if (!response.ok) {
        throw new Error('Failed to load profile data');
      }
      
      const data = await response.json();
      setProfile(data.user);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle successful verification
  const handleVerificationSuccess = async () => {
    // Refresh the profile data to get updated verification status
    await fetchProfile();
  };

  // Handle successful profile update
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              No profile data found. Please complete your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        phoneNumber={profile?.phoneNumber || ''}
        onVerificationSuccess={handleVerificationSuccess}
      />

      {/* Profile Edit Modal */}
      {profile && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onUpdateSuccess={handleProfileUpdate}
        />
      )}

      {/* Organization Edit Modal */}
      {profile && (
        <ProfileEditModal
          isOpen={showOrgModal}
          onClose={() => setShowOrgModal(false)}
          profile={profile}
          onUpdateSuccess={handleProfileUpdate}
          isOrgUpdate={true}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <button 
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => setShowEditModal(true)}
        >
          <Edit size={16} />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24 rounded-full bg-gray-100 mb-4 flex items-center justify-center">
                <User size={40} className="text-gray-400" />
              </div>
              
              <h2 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h2>
              <p className="text-gray-500 mb-2">@{profile.username}</p>
              
              <div className="flex items-center text-sm bg-gray-100 px-3 py-1 rounded-full">
                <Shield size={14} className="mr-1" />
                <span className="capitalize">{profile.role}</span>
              </div>
              
              <div className="border-t border-gray-200 w-full my-4"></div>
              
              <div className="w-full">
                <div className="flex items-center mb-3">
                  <Building2 size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-800">{profile.orgName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-600 text-sm">
                    Updated: {new Date(profile.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500 mr-2">Phone Number</p>
                        {profile.phoneNumberVerified ? (
                          <span className="inline-flex items-center bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            <CheckCircle size={12} className="mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                            <XCircle size={12} className="mr-1" />
                            Not Verified
                          </span>
                        )}
                      </div>
                      
                      {!profile.phoneNumberVerified && (
                        <button 
                          onClick={() => setShowVerifyModal(true)}
                          className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                        >
                          Verify Now
                        </button>
                      )}
                    </div>
                    <p className="text-gray-800">{profile.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
                Location Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-800">{profile.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="text-gray-800">{profile.district}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!profile.phoneNumberVerified && (
            <button 
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <Phone size={16} />
              Verify Phone Number
            </button>
          )}
          
          <button 
            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            onClick={() => setShowEditModal(true)}
          >
            <Shield size={16} />
            Security Settings
          </button>
          
          <button 
            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            onClick={() => setShowOrgModal(true)}
          >
            <Building2 size={16} />
            Update Organization
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
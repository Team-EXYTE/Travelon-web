"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, MoreHorizontal, AlertTriangle, X, Check, Mail, Calendar, UserCircle } from "lucide-react";
import Image from "next/image";

interface AdminData {
  id: string;
  name: string; // Full name (firstName + lastName)
  email: string;
  avatar: string;
  joinDate: string;
  status: string;
  phoneNumber: string;
  district: string;
  username: string;
  phoneNumberVerified: boolean;
  firstName?: string;
  lastName?: string;
  address?: string;
  orgName?: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/admins');
        if (!response.ok) {
          throw new Error('Failed to fetch admin data');
        }
        const data = await response.json();
        setAdmins(data.admins);
        setError(null);
      } catch (error) {
        console.error('Error fetching admins:', error);
        setError('Failed to load administrators. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdmins();
  }, []);

  // State for delete confirmation modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    adminId: string | null;
    adminName: string;
  }>({
    isOpen: false,
    adminId: null,
    adminName: ""
  });

  // State to track which dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // State for add/edit admin modal
  const [adminModal, setAdminModal] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    admin: {
      id: string | null;
      firstName: string;
      lastName: string;
      email: string;
      status: string;
      password: string;
      address: string;
      district: string;
      phoneNumber: string;
      username: string;
      orgName: string;
    }
  }>({
    isOpen: false,
    isEdit: false,
    admin: {
      id: null,
      firstName: "",
      lastName: "",
      email: "",
      status: "Active",
      password: "",
      address: "",
      district: "Colombo", // Default district
      phoneNumber: "",
      username: "",
      orgName: "Admin" // Default organization name
    }
  });

  // Toggle dropdown visibility
  const toggleDropdown = (adminId: string) => {
    if (openDropdownId === adminId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(adminId);
    }
  };

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  // Open delete confirmation
  const openDeleteConfirmation = (adminId: string, adminName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      adminId,
      adminName
    });
  };

  // Close delete confirmation
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      adminId: null,
      adminName: ""
    });
  };

  // Delete admin
  const deleteAdmin = async () => {
    if (deleteConfirmation.adminId) {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/admins/${deleteConfirmation.adminId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete admin');
        }
        
        // Update the UI after successful deletion
        setAdmins(admins.filter(admin => admin.id !== deleteConfirmation.adminId));
        closeDeleteConfirmation();
      } catch (error: any) {
        console.error('Error deleting admin:', error);
        setError(error.message || 'Failed to delete admin. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Update admin status
  const updateAdminStatus = async (adminId: string, newStatus: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update admin status');
      }
      
      // Update the UI after successful update
      setAdmins(admins.map(admin => 
        admin.id === adminId ? {...admin, status: newStatus} : admin
      ));
      setOpenDropdownId(null);
    } catch (error: any) {
      console.error('Error updating admin status:', error);
      setError(error.message || 'Failed to update admin status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open add admin modal
  const openAddAdminModal = () => {
    setAdminModal({
      isOpen: true,
      isEdit: false,
      admin: {
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        status: "Active",
        password: "",
        address: "",
        district: "Colombo", // Default district
        phoneNumber: "",
        username: "",
        orgName: "Admin" // Default organization name
      }
    });
  };

  // Open edit admin modal
  const openEditAdminModal = (admin: AdminData) => {
    // Split name into firstName and lastName if needed
    const nameParts = admin.name.split(' ');
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(' ') || "";
    
    setAdminModal({
      isOpen: true,
      isEdit: true,
      admin: {
        id: admin.id,
        firstName: firstName,
        lastName: lastName,
        email: admin.email,
        status: admin.status || "Active",
        password: "", // Empty for edit mode since we don't want to display the current password
        address: admin.address || "",
        district: admin.district || "Colombo",
        phoneNumber: admin.phoneNumber || "",
        username: admin.username || "",
        orgName: "Admin"
      }
    });
  };

  // Close admin modal
  const closeAdminModal = () => {
    setAdminModal({
      ...adminModal,
      isOpen: false
    });
  };

  // Handle admin modal input changes
  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdminModal({
      ...adminModal,
      admin: {
        ...adminModal.admin,
        [name]: value
      }
    });
  };

  // Save admin (add or edit)
  const saveAdmin = async () => {
    const { admin, isEdit } = adminModal;
    const fullName = `${admin.firstName} ${admin.lastName}`.trim();
    
    try {
      if (isEdit && admin.id) {
        // Update existing admin
        const response = await fetch(`/api/admin/admins/${admin.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            status: admin.status,
            address: admin.address,
            district: admin.district,
            phoneNumber: admin.phoneNumber,
            username: admin.username,
            orgName: admin.orgName,
            ...(admin.password ? { password: admin.password } : {})
          }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update admin');
        }
        
        // Update the UI after successful update
        setAdmins(admins.map(a => 
          a.id === admin.id ? { 
            ...a, 
            name: fullName,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            status: admin.status,
            address: admin.address,
            district: admin.district,
            phoneNumber: admin.phoneNumber,
            username: admin.username
          } : a
        ));
      } else {
        // Add new admin
        setLoading(true);
        const response = await fetch(`/api/admin/admins`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            status: admin.status,
            password: admin.password,
            address: admin.address,
            district: admin.district,
            phoneNumber: admin.phoneNumber,
            username: admin.username || admin.email.split('@')[0],
            orgName: admin.orgName,
            role: "Admin", // Default role for new admin
            phoneNumberVerified: false // Default value
          }),
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create admin');
        }
        
        // Get the newly created admin data
        const newAdminData = await response.json();
        
        // Add to UI
        const newAdmin: AdminData = {
          id: newAdminData.uid, // API returns uid property
          name: fullName,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          avatar: "/Travelon Logo Black.png", // Default avatar
          joinDate: new Date().toISOString().split('T')[0],
          status: admin.status,
          phoneNumber: admin.phoneNumber,
          district: admin.district,
          username: admin.username || admin.email.split('@')[0],
          phoneNumberVerified: false,
          address: admin.address,
          orgName: admin.orgName
        };
        
        setAdmins([...admins, newAdmin]);
      }
      
      closeAdminModal();
    } catch (error: any) {
      console.error('Error saving admin:', error);
      setError(error.message || 'Failed to save admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={closeDropdown}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Administrators</h1>
          <p className="text-gray-600 mt-1">Manage administrator accounts and permissions</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          onClick={openAddAdminModal}
        >
          <Plus size={18} />
          <span>Add Admin</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search administrators..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading administrators...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && admins.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <UserCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Administrators Found</h3>
          <p className="text-gray-600 mb-4">There are no administrators in the system yet.</p>
          <button 
            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={openAddAdminModal}
          >
            <Plus size={18} />
            <span>Add First Admin</span>
          </button>
        </div>
      )}

      {/* Admins table */}
      {!loading && !error && admins.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Administrator
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {admin.avatar ? (
                          <Image 
                            src={admin.avatar} 
                            alt={admin.name} 
                            width={40} 
                            height={40} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserCircle size={24} className="text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        {admin.username && (
                          <div className="text-xs text-gray-500">@{admin.username}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail size={14} className="mr-1" /> {admin.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar size={14} className="mr-1" /> {new Date(admin.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {admin.status || "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-1 text-gray-500 hover:text-black"
                        onClick={() => openEditAdminModal(admin)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="p-1 text-gray-500 hover:text-red-500"
                        onClick={() => openDeleteConfirmation(admin.id, admin.name)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="relative">
                        <button 
                          className="p-1 text-gray-500 hover:text-black"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(admin.id);
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        
                        {/* Dropdown menu */}
                        {openDropdownId === admin.id && (
                          <div 
                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="py-1">
                              {admin.status === 'Active' && (
                                <button
                                  onClick={() => updateAdminStatus(admin.id, 'Inactive')}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <X size={16} className="mr-2 text-red-500" />
                                  Deactivate
                                </button>
                              )}
                              {admin.status === 'Inactive' && (
                                <button
                                  onClick={() => updateAdminStatus(admin.id, 'Active')}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Check size={16} className="mr-2 text-green-500" />
                                  Activate
                                </button>
                              )}
                              <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Reset Password
                              </button>
                              <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                View Activity Log
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{admins.length}</span> of <span className="font-medium">{admins.length}</span> results
            </div>
            <div className="flex gap-1">
              <button className="bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 px-4 py-2 text-sm font-medium rounded-md">
                Previous
              </button>
              <button className="bg-black border border-black text-white hover:bg-gray-800 px-4 py-2 text-sm font-medium rounded-md">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-center text-gray-500 mb-6">
              Are you sure you want to delete administrator <span className="font-medium">{deleteConfirmation.adminName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={deleteAdmin}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Admin Modal */}
      {adminModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {adminModal.isEdit ? 'Edit Administrator' : 'Add New Administrator'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={adminModal.admin.firstName}
                    onChange={handleAdminInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                    placeholder="Enter first name"
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
                    value={adminModal.admin.lastName}
                    onChange={handleAdminInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={adminModal.admin.email}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={adminModal.admin.username}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={adminModal.admin.phoneNumber}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={adminModal.admin.address}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter address"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={adminModal.admin.district}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter district"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  id="orgName"
                  name="orgName"
                  value={adminModal.admin.orgName}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter organization name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={adminModal.admin.status}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password {!adminModal.isEdit && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={adminModal.admin.password}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder={adminModal.isEdit ? "Leave blank to keep current password" : "Enter password"}
                  required={!adminModal.isEdit}
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={closeAdminModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={saveAdmin}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none"
              >
                {adminModal.isEdit ? 'Save Changes' : 'Add Administrator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
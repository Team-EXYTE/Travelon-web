"use client";

import React, { useState } from "react";
import { Search, Plus, Edit, Trash2, MoreHorizontal, AlertTriangle, X, Check, Mail, Calendar, UserCircle } from "lucide-react";
// import Image from "next/image";

export default function AdminsPage() {
  // Sample admin data - removed role field
const [admins, setAdmins] = useState([
    { 
        id: 1, 
        name: "John Smith", 
        email: "john.admin@travelon.com",
        avatar: "/avatars/admin1.jpg", 
        joinDate: "2025-01-15", 
        status: "Active" 
    },
    { 
        id: 2, 
        name: "Sarah Johnson", 
        email: "sarah.manager@travelon.com",
        avatar: "/avatars/admin2.jpg", 
        joinDate: "2025-02-20", 
        status: "Active" 
    },
    { 
        id: 3, 
        name: "Michael Williams", 
        email: "michael.support@travelon.com",
        avatar: "/avatars/admin3.jpg", 
        joinDate: "2025-03-10", 
        status: "Active" 
    },
    { 
        id: 4, 
        name: "Emily Davis", 
        email: "emily.analytics@travelon.com",
        avatar: "/avatars/admin4.jpg", 
        joinDate: "2025-04-05", 
        status: "Inactive" 
    },
]);

  // State for delete confirmation modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    adminId: number | null;
    adminName: string;
  }>({
    isOpen: false,
    adminId: null,
    adminName: ""
  });

  // State to track which dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // State for add/edit admin modal - removed role field
    const [adminModal, setAdminModal] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    admin: {
        id: number | null;
        name: string;
        email: string;
        status: string;
        password: string;
    }
    }>({
    isOpen: false,
    isEdit: false,
    admin: {
        id: null,
        name: "",
        email: "",
        status: "Active",
        password: ""
    }
    });

  // Toggle dropdown visibility
  const toggleDropdown = (adminId: number) => {
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
  const openDeleteConfirmation = (adminId: number, adminName: string) => {
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
  const deleteAdmin = () => {
    if (deleteConfirmation.adminId) {
      setAdmins(admins.filter(admin => admin.id !== deleteConfirmation.adminId));
      closeDeleteConfirmation();
    }
  };

  // Update admin status
  const updateAdminStatus = (adminId: number, newStatus: string) => {
    setAdmins(admins.map(admin => 
      admin.id === adminId ? {...admin, status: newStatus} : admin
    ));
    setOpenDropdownId(null);
  };

  // Open add admin modal
    const openAddAdminModal = () => {
    setAdminModal({
        isOpen: true,
        isEdit: false,
        admin: {
        id: null,
        name: "",
        email: "",
        status: "Active",
        password: ""
        }
    });
    };

  // Open edit admin modal

    const openEditAdminModal = (admin: any) => {
    setAdminModal({
        isOpen: true,
        isEdit: true,
        admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        status: admin.status,
        password: "" // Empty for edit mode since we don't want to display the current password
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
    const saveAdmin = () => {
    const { admin, isEdit } = adminModal;
    
    if (isEdit && admin.id) {
        // Update existing admin - don't update password if it's empty
        setAdmins(admins.map(a => 
        a.id === admin.id ? { 
            ...a, 
            name: admin.name,
            email: admin.email,
            status: admin.status,
            ...(admin.password ? { password: admin.password } : {}) // Only update password if provided
        } : a
        ));
    } else {
        // Add new admin
        const newAdmin = {
        ...admin,
        id: Math.max(...admins.map(a => a.id)) + 1,
        joinDate: new Date().toISOString().split('T')[0],
        avatar: "/avatars/default.jpg" // Default avatar
        };
        setAdmins([...admins, newAdmin as any]);
    }
    
    closeAdminModal();
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

      {/* Search and filters - removed role filter */}
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

      {/* Admins table - removed role column */}
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
                      <UserCircle size={24} className="text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{admin.name}</div>
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
                    {admin.status}
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

      {/* Add/Edit Admin Modal - removed role field */}
      {adminModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {adminModal.isEdit ? 'Edit Administrator' : 'Add New Administrator'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={adminModal.admin.name}
                  onChange={handleAdminInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                  placeholder="Enter administrator name"
                  required
                />
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
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={adminModal.admin.password}
                    onChange={handleAdminInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
                    placeholder="Enter password"
                    required={!adminModal.isEdit}
                />
            </div>
              
              {/* {!adminModal.isEdit && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    An email will be sent to the administrator with instructions to set their password.
                  </p>
                </div>
              )} */}
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
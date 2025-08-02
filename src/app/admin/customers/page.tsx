"use client";

import React, { useState } from "react";
import { UserCircle, Search,  MoreHorizontal, Edit, Trash2, Mail, Calendar, Check, X, AlertTriangle } from "lucide-react";
// Plus,
export default function CustomersPage() {
  // Sample customer data
  const [customers, setCustomers] = useState([
    { 
      id: 1, 
      name: "John Smith", 
      email: "john.smith@example.com", 
      joinDate: "2025-05-15", 
      eventsAttended: 4, 
      status: "Active" 
    },
    { 
      id: 2, 
      name: "Emma Watson", 
      email: "emma.watson@example.com", 
      joinDate: "2025-06-02", 
      eventsAttended: 2, 
      status: "Active" 
    },
    { 
      id: 3, 
      name: "Michael Brown", 
      email: "michael.brown@example.com", 
      joinDate: "2025-06-10", 
      eventsAttended: 1, 
      status: "Active" 
    },
    { 
      id: 4, 
      name: "Sophia Garcia", 
      email: "sophia.garcia@example.com", 
      joinDate: "2025-06-22", 
      eventsAttended: 0, 
      status: "New" 
    },
    { 
      id: 5, 
      name: "David Lee", 
      email: "david.lee@example.com", 
      joinDate: "2025-04-18", 
      eventsAttended: 3, 
      status: "Inactive" 
    },
  ]);

  // State to track which dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  
  // State for delete confirmation modal
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    customerId: number | null;
    customerName: string;
  }>({
    isOpen: false,
    customerId: null,
    customerName: ""
  });

  // Toggle dropdown visibility
  const toggleDropdown = (customerId: number) => {
    if (openDropdownId === customerId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(customerId);
    }
  };

  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  // Open delete confirmation
  const openDeleteConfirmation = (customerId: number, customerName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      customerId,
      customerName
    });
  };

  // Close delete confirmation
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      isOpen: false,
      customerId: null,
      customerName: ""
    });
  };

  // Delete customer
  const deleteCustomer = () => {
    if (deleteConfirmation.customerId) {
      setCustomers(customers.filter(customer => customer.id !== deleteConfirmation.customerId));
      closeDeleteConfirmation();
    }
  };

  // Update customer status
  const updateCustomerStatus = (customerId: number, newStatus: string) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId ? {...customer, status: newStatus} : customer
    ));
    setOpenDropdownId(null);
  };

  return (
    <div onClick={closeDropdown}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Travellers</h1>
          <p className="text-gray-600 mt-1">Manage travellers registered on the platform</p>
        </div>
        {/* <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={18} />
          <span>Add Customer</span>
        </button> */}
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search customers..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>New</option>
            <option>Inactive</option>
          </select>
          <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Filter
          </button>
        </div>
      </div>

      {/* Customers table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Traveller
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Events Attended
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
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserCircle size={16} className="text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Mail size={14} className="mr-1" /> {customer.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center">
                    <Calendar size={14} className="mr-1" /> {new Date(customer.joinDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.eventsAttended}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${customer.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    customer.status === 'New' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1 text-gray-500 hover:text-black">
                      <Edit size={16} />
                    </button>
                    <button 
                      className="p-1 text-gray-500 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirmation(customer.id, customer.name);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="relative">
                      <button 
                        className="p-1 text-gray-500 hover:text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown(customer.id);
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      
                      {/* Dropdown menu */}
                      {openDropdownId === customer.id && (
                        <div 
                          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-1">
                            {(customer.status === 'Active' || customer.status === 'New') && (
                              <button
                                onClick={() => updateCustomerStatus(customer.id, 'Inactive')}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <X size={16} className="mr-2 text-red-500" />
                                Mark as Inactive
                              </button>
                            )}
                            {customer.status === 'Inactive' && (
                              <button
                                onClick={() => updateCustomerStatus(customer.id, 'Active')}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Check size={16} className="mr-2 text-green-500" />
                                Mark as Active
                              </button>
                            )}
                            <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              View Details
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
            Showing <span className="font-medium">1</span> to <span className="font-medium">{customers.length}</span> of <span className="font-medium">{customers.length}</span> results
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
              Are you sure you want to delete <span className="font-medium">{deleteConfirmation.customerName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={deleteCustomer}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
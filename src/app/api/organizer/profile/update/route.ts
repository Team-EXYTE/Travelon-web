import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin, getAdminAuth, getAdminDB } from '@/db/firebaseAdmin';

export async function PUT(request: Request) {
  try {
    await initAdmin();
    const sessionCookie = (await cookies()).get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Verify the session cookie
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    
    // Parse the request body
    const requestData = await request.json();
    
    // Validate input
    const { firstName, lastName, orgName, address, district } = requestData;
    
    // Create an object with only allowed fields
    const updateData: Record<string, any> = {};
    
    // Validation and sanitization
    if (firstName !== undefined) {
      if (!firstName.trim()) {
        return NextResponse.json({ error: "First name is required" }, { status: 400 });
      }
      if (firstName.length > 50) {
        return NextResponse.json({ error: "First name cannot exceed 50 characters" }, { status: 400 });
      }
      updateData.firstName = firstName.trim();
    }
    
    if (lastName !== undefined) {
      if (!lastName.trim()) {
        return NextResponse.json({ error: "Last name is required" }, { status: 400 });
      }
      if (lastName.length > 50) {
        return NextResponse.json({ error: "Last name cannot exceed 50 characters" }, { status: 400 });
      }
      updateData.lastName = lastName.trim();
    }
    
    if (orgName !== undefined) {
      if (!orgName.trim()) {
        return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
      }
      if (orgName.length > 100) {
        return NextResponse.json({ error: "Organization name cannot exceed 100 characters" }, { status: 400 });
      }
      updateData.orgName = orgName.trim();
    }
    
    if (address !== undefined) {
      if (!address.trim()) {
        return NextResponse.json({ error: "Address is required" }, { status: 400 });
      }
      if (address.length > 200) {
        return NextResponse.json({ error: "Address cannot exceed 200 characters" }, { status: 400 });
      }
      updateData.address = address.trim();
    }
    
    if (district !== undefined) {
      const validDistricts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
        'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
        'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
        'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
        'Moneragala', 'Ratnapura', 'Kegalle'];
      
      if (!district.trim() || !validDistricts.includes(district.trim())) {
        return NextResponse.json({ error: "Valid district is required" }, { status: 400 });
      }
      
      updateData.district = district.trim();
    }
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date().toISOString();
    
    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    
    // Update the user document in Firestore
    const adminDB = getAdminDB();
    await adminDB.collection('users').doc(uid).update(updateData);
    
    return NextResponse.json({ 
      success: true,
      message: "Profile updated successfully" 
    });
    
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" }, 
      { status: 500 }
    );
  }
}
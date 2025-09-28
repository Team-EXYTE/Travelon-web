import { NextRequest, NextResponse } from 'next/server';
import { initAdmin, getAdminAuth, getAdminDB, getAdminStorage } from '@/db/firebaseAdmin';
import { cookies } from 'next/headers';

// POST /api/admin/profile/image - Upload profile image
export async function POST(request: NextRequest) {
  await initAdmin();
  const db = getAdminDB();
  
  try {
    // Authenticate admin via session cookie
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    
    // Get admin user
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const userData = userDoc.data();
    
    // Verify user is an admin
    if (userData?.role !== "Admin") {
      return NextResponse.json({ error: "Not authorized - Admin access required" }, { status: 403 });
    }

    // Parse the form data to get the image file
    const formData = await request.formData();
    const file = formData.get('profileImage') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Check file type (only allow images)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Upload to Firebase Storage
    const storage = getAdminStorage();
    const fileBuffer = Buffer.from(buffer);
    
    // Create a reference to the file in Firebase Storage
    const fileRef = `users-admin/${uid}.${file.type.split('/')[1]}`;
    
    // Upload the file
    const bucket = storage;
    const fileUpload = bucket.file(fileRef);
    
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file publicly accessible
    await fileUpload.makePublic();
    
    // Get the public URL
    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileRef)}?alt=media`;
    
    // Update the user document with the profile image URL
    await db.collection("users").doc(uid).update({
      profileImage: imageUrl,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true,
      imageUrl,
      message: 'Profile image updated successfully'
    });
  } catch (error: any) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload profile image' }, { status: 500 });
  }
}
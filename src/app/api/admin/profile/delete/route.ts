import { NextRequest, NextResponse } from 'next/server';
import { initAdmin, getAdminAuth, getAdminDB, getAdminStorage } from '@/db/firebaseAdmin';
import { cookies } from 'next/headers';

// DELETE /api/admin/profile/delete - Delete admin profile
export async function DELETE(request: NextRequest) {
  await initAdmin();
  const db = getAdminDB();
  const adminAuth = getAdminAuth();
  
  try {
    // Authenticate admin via session cookie
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
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

    // Delete profile image from storage if it exists
    if (userData?.profileImage) {
      try {
        // Extract file path from the URL
        const urlPath = new URL(userData.profileImage).pathname;
        const filePath = decodeURIComponent(urlPath.split('/o/')[1]?.split('?')[0]);
        
        if (filePath) {
          const storage = getAdminStorage();
          await storage.file(filePath).delete().catch(e => console.warn('File may not exist:', e));
        }
      } catch (error) {
        console.warn('Failed to delete profile image from storage:', error);
        // Continue with account deletion even if image deletion fails
      }
    }

    // Delete the user document from Firestore
    await db.collection("users").doc(uid).delete();
    
    // Delete the user from Firebase Authentication
    await adminAuth.deleteUser(uid);
    
    // Clear the session cookie
    (await cookies()).delete('session');
    
    return NextResponse.json({ 
      success: true,
      message: 'Admin profile successfully deleted'
    });
  } catch (error: any) {
    console.error('Error deleting admin profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete admin profile' }, { status: 500 });
  }
}
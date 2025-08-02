import { NextResponse } from 'next/server';
import { initAdmin, getAdminDB } from '@/db/firebaseAdmin';

export async function GET() {
  try {
    console.log("Initializing admin SDK...");
    await initAdmin();
    
    console.log("Fetching organizers data...");
    const adminDB = getAdminDB();
    
    // Get all organizers
    const organizersSnapshot = await adminDB
      .collection('users')
      .where('role', '==', 'organizer')
      .get();
    
    const organizers = [];
    
    for (const doc of organizersSnapshot.docs) {
      const organizerData = doc.data();
      
      // Get event count for this organizer
      const eventsSnapshot = await adminDB
        .collection('events')
        .where('organizerId', '==', doc.id)
        .get();
      
      const eventCount = eventsSnapshot.size;
      
      organizers.push({
        id: doc.id,
        firstName: organizerData.firstName,
        lastName: organizerData.lastName,
        email: organizerData.email,
        orgName: organizerData.orgName,
        address: organizerData.address,
        district: organizerData.district,
        phoneNumber: organizerData.phoneNumber,
        phoneNumberVerified: organizerData.phoneNumberVerified,
        username: organizerData.username,
        updatedAt: organizerData.updatedAt,
        eventCount: eventCount,
        status: organizerData.phoneNumberVerified ? 'Active' : 'Pending'
      });
    }
    
    // Sort by updatedAt (most recent first)
    organizers.sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log(`Found ${organizers.length} organizers`);
    
    return NextResponse.json({
      organizers,
      total: organizers.length
    });
    
  } catch (error: any) {
    console.error("Error fetching organizers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch organizers" }, 
      { status: 500 }
    );
  }
}

// Update organizer status
export async function PATCH(request: Request) {
  try {
    await initAdmin();
    
    const body = await request.json();
    const { organizerId, phoneNumberVerified } = body;
    
    if (!organizerId) {
      return NextResponse.json({ error: "Organizer ID is required" }, { status: 400 });
    }
    
    const adminDB = getAdminDB();
    
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (phoneNumberVerified !== undefined) {
      updateData.phoneNumberVerified = phoneNumberVerified;
    }
    
    await adminDB
      .collection('users')
      .doc(organizerId)
      .update(updateData);
    
    return NextResponse.json({ 
      success: true, 
      message: "Organizer updated successfully" 
    });
    
  } catch (error: any) {
    console.error("Error updating organizer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update organizer" }, 
      { status: 500 }
    );
  }
}

// Delete organizer
export async function DELETE(request: Request) {
  try {
    await initAdmin();
    
    const body = await request.json();
    const { organizerId } = body;
    
    if (!organizerId) {
      return NextResponse.json({ error: "Organizer ID is required" }, { status: 400 });
    }
    
    const adminDB = getAdminDB();
    
    // Check if organizer has active events
    const eventsSnapshot = await adminDB
      .collection('events')
      .where('organizerId', '==', organizerId)
      .where('isEnded', '==', false)
      .get();
    
    if (!eventsSnapshot.empty) {
      return NextResponse.json({ 
        error: "Cannot delete organizer with active events" 
      }, { status: 400 });
    }
    
    // Delete the organizer
    await adminDB
      .collection('users')
      .doc(organizerId)
      .delete();
    
    return NextResponse.json({ 
      success: true, 
      message: "Organizer deleted successfully" 
    });
    
  } catch (error: any) {
    console.error("Error deleting organizer:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete organizer" }, 
      { status: 500 }
    );
  }
}

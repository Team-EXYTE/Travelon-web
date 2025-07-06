import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin, getAdminAuth, getAdminDB, getAdminStorage } from '@/db/firebaseAdmin';

// GET a single event by ID
export async function GET(
  request: Request,
  context: { params: { eventId: string } }
) {
  try {
    await initAdmin();
    const { eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }
    
    const sessionCookie = (await cookies()).get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Verify the session cookie
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    
    // Get the event
    const adminDB = getAdminDB();
    const eventRef = adminDB.collection('events').doc(eventId);
    const event = await eventRef.get();
    
    if (!event.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    const eventData = event.data();
    
    // Check if the user is the owner of the event
    if (eventData?.organizerId !== uid) {
      return NextResponse.json({ error: "Unauthorized: You can only access your own events" }, { status: 403 });
    }
    
    // Return event data with date conversion
    return NextResponse.json({ 
      event: {
        id: event.id,
        ...eventData,
        date: eventData?.date?.toDate().toISOString(),
        createdAt: eventData?.createdAt?.toDate().toISOString(),
      }
    });
    
  } catch (error: any) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch event" }, 
      { status: 500 }
    );
  }
}

// DELETE an event
export async function DELETE(request: Request,
  context: { params: { eventId: string } }
) {
  try {
    await initAdmin();
    const { eventId } = await context.params;
    
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const sessionCookie = (await cookies()).get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Verify the session cookie
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;
    
    // Get the event to check ownership and retrieve image URLs
    const adminDB = getAdminDB();
    const eventRef = adminDB.collection('events').doc(eventId);
    const event = await eventRef.get();
    
    if (!event.exists) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    
    const eventData = event.data();
    
    // Check if the user is the owner of the event
    if (eventData?.organizerId !== uid) {
      return NextResponse.json({ error: "Unauthorized: You can only delete your own events" }, { status: 403 });
    }
    
    // Get images to delete
    const imageUrls = eventData?.images || [];
    
    // Delete images from Firebase Storage
    if (imageUrls.length > 0) {
      const bucket = getAdminStorage();
      
      // Delete each image
      await Promise.all(imageUrls.map(async (imageUrl: string) => {
        try {
          // Extract file path from URL
          // Format: https://firebasestorage.googleapis.com/v0/b/[BUCKET]/o/[FILE_PATH]?alt=media&token=[TOKEN]
          const filePathEncoded = imageUrl.split('/o/')[1]?.split('?')[0];
          
          if (!filePathEncoded) {
            console.warn(`Could not extract file path from URL: ${imageUrl}`);
            return;
          }
          
          // Decode the URL-encoded file path
          const filePath = decodeURIComponent(filePathEncoded);
          
          // Delete the file
          await bucket.file(filePath).delete();
          console.log(`Successfully deleted image: ${filePath}`);
        } catch (error) {
          // Log error but continue deleting other images and the event
          console.error(`Failed to delete image: ${imageUrl}`, error);
        }
      }));
    }
    
    // Delete the event document
    await eventRef.delete();
    
    return NextResponse.json({ 
      success: true, 
      message: "Event and associated images deleted successfully" 
    });
    
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event" }, 
      { status: 500 }
    );
  }
}
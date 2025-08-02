import { NextResponse } from 'next/server';
import { initAdmin, getAdminDB } from '@/db/firebaseAdmin';

export async function GET() {
  try {
    console.log("Initializing admin SDK...");
    await initAdmin();
    
    console.log("Fetching events data...");
    const adminDB = getAdminDB();
    
    // Get all events
    const eventsSnapshot = await adminDB
      .collection('events')
      .orderBy('createdAt', 'desc')
      .get();
    
    const events = [];
    
    for (const doc of eventsSnapshot.docs) {
      const eventData = doc.data();
      
      // Get organizer information
      let organizerName = 'Unknown Organizer';
      if (eventData.organizerId) {
        try {
          const organizerDoc = await adminDB
            .collection('users')
            .doc(eventData.organizerId)
            .get();
          
          if (organizerDoc.exists) {
            const organizerData = organizerDoc.data();
            organizerName = organizerData?.orgName || `${organizerData?.firstName} ${organizerData?.lastName}` || 'Unknown Organizer';
          }
        } catch (error) {
          console.warn(`Failed to fetch organizer for event ${doc.id}:`, error);
        }
      }
      
      // Get participants count (assuming you have a participants collection or field)
      // For now, we'll use a placeholder since the structure isn't specified
      const participantsCount = 0; // You can implement this based on your data structure
      
      events.push({
        id: doc.id,
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        location: eventData.location,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        price: eventData.price,
        date: eventData.date?.toDate().toISOString(),
        createdAt: eventData.createdAt?.toDate().toISOString(),
        updatedAt: eventData.updatedAt?.toDate().toISOString(),
        images: eventData.images || [],
        organizerId: eventData.organizerId,
        organizerName: organizerName,
        isEnded: eventData.isEnded,
        participantsCount: participantsCount,
        status: eventData.isEnded ? 'Completed' : new Date(eventData.date?.toDate()) > new Date() ? 'Upcoming' : 'Active'
      });
    }
    
    console.log(`Found ${events.length} events`);
    
    return NextResponse.json({
      events,
      total: events.length
    });
    
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" }, 
      { status: 500 }
    );
  }
}

// Update event status
export async function PATCH(request: Request) {
  try {
    await initAdmin();
    
    const body = await request.json();
    const { eventId, isEnded } = body;
    
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }
    
    const adminDB = getAdminDB();
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (isEnded !== undefined) {
      updateData.isEnded = isEnded;
    }
    
    await adminDB
      .collection('events')
      .doc(eventId)
      .update(updateData);
    
    return NextResponse.json({ 
      success: true, 
      message: "Event updated successfully" 
    });
    
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update event" }, 
      { status: 500 }
    );
  }
}

// Delete event
export async function DELETE(request: Request) {
  try {
    await initAdmin();
    
    const body = await request.json();
    const { eventId } = body;
    
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }
    
    const adminDB = getAdminDB();
    
    // Delete the event
    await adminDB
      .collection('events')
      .doc(eventId)
      .delete();
    
    return NextResponse.json({ 
      success: true, 
      message: "Event deleted successfully" 
    });
    
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event" }, 
      { status: 500 }
    );
  }
}

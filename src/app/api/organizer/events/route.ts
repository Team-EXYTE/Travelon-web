import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin, getAdminAuth, getAdminDB } from '@/db/firebaseAdmin';

export async function GET() {
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
    
    // Query events for this organizer
    const adminDB = getAdminDB();
    const eventsSnapshot = await adminDB
      .collection('events')
      .where('organizerId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate().toISOString(), // Convert Timestamp to ISO string
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));
    
    return NextResponse.json({ events });
    
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" }, 
      { status: 500 }
    );
  }
}
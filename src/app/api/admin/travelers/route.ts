import { NextResponse } from 'next/server';
import { initAdmin, getAdminDB } from '@/db/firebaseAdmin';

// GET: Fetch all travelers
export async function GET() {
  try {
    await initAdmin();
    const adminDB = getAdminDB();
    // Get all travelers (role: 'traveler')
    const travelersSnapshot = await adminDB
      .collection('users')
      .where('role', '==', 'traveler')
      .get();

    const travelers = travelersSnapshot.docs.map(doc => {
      const t = doc.data();
      return {
        id: doc.id,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        joinDate: t.createdAt ? t.createdAt.toDate().toISOString().slice(0, 10) : '',
        eventCount: t.eventCount || 0,
        status: t.status || (t.isActive ? 'Active' : t.isNew ? 'New' : 'Inactive'),
      };
    });

    return NextResponse.json({ travelers, total: travelers.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch travelers' }, { status: 500 });
  }
}

// DELETE: Remove a traveler
export async function DELETE(request: Request) {
  try {
    await initAdmin();
    const adminDB = getAdminDB();
    const body = await request.json();
    const { travelerId } = body;
    if (!travelerId) {
      return NextResponse.json({ error: 'Traveler ID is required' }, { status: 400 });
    }
    await adminDB.collection('users').doc(travelerId).delete();
    return NextResponse.json({ success: true, message: 'Traveler deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete traveler' }, { status: 500 });
  }
}

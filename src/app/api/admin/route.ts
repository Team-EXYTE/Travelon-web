import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin, getAdminAuth, getAdminDB } from '@/db/firebaseAdmin';
import { join } from 'path';


export async function GET() {
  try {
    // console.log("Initializing admin SDK...");
    await initAdmin();
    // console.log("Admin SDK initialized");
    const sessionCookie = (await cookies()).get('session')?.value;
    // console.log("Session cookie:", sessionCookie);
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Verify the session cookie (you might want to add admin role verification here)
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    // const decodedClaims = true; // For testing purposes, assume session is valid
    // If session verification is not successful, return error to redirect to sign-in page
    if (!decodedClaims) {
      return NextResponse.json({ error: "Session expired or invalid", redirect: "/signin" }, { status: 401 });
    }
    
    
    console.log("Admin session verified:");
    const adminDB = getAdminDB();
    
    // Get total active events count
    const activeEventsSnapshot = await adminDB
      .collection('events')
      .where('isEnded', '==', false)
      .get();
    const totalActiveEvents = activeEventsSnapshot.size;
    
    // Get total organizers count
    const organizersSnapshot = await adminDB
      .collection('users')
      .where('role', '==', 'organizer')
      .get();
    const totalOrganizers = organizersSnapshot.size;
    
    // Get total travelers count (assuming role 'traveler' or users without organizer role)
    const travelersSnapshot = await adminDB
      .collection('users-travellers')
      .get();
    const totalTravelers = travelersSnapshot.size;
    
    // Get recent 3 events (ordered by createdAt)
    const recentEventsSnapshot = await adminDB
      .collection('events')
      .orderBy('createdAt', 'desc')
      .limit(3)
      .get();
    
    const recentEvents = recentEventsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        location: data.location,
        category: data.category,
        date: data.date?.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString(),
        images: data.images || [],
        organizerId: data.organizerId,
        isEnded: data.isEnded,
        price: data.price
      };
    });
    
    // Get recent 3 travelers that joined (get all travelers first, then sort in memory)
    const allTravelersSnapshot = await adminDB
      .collection('users-travellers')
      .get();
    
    // Sort by updatedAt in memory and take first 3
    const sortedTravelers = allTravelersSnapshot.docs
      .map(doc => ({ doc, data: doc.data() }))
      .sort((a, b) => {
        const aDate = new Date(a.data.updatedAt);
        const bDate = new Date(b.data.updatedAt);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 3);
    
    const recentTravelers = sortedTravelers.map(({ doc }) => {
      const data = doc.data();
      return {
        id: doc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.firstName,
        phoneNumber: data.phoneNumber,
        phoneNumberVerified: data.phoneNumberVerified,
        joinDate: data.joinDate,
        profileImage: data.profileImage || '',
      };
    });
    
    // Calculate some additional metrics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    // Monthly events count
    const monthlyEventsSnapshot = await adminDB
      .collection('events')
      .where('createdAt', '>=', currentMonth)
      .get();
    const monthlyEventsCount = monthlyEventsSnapshot.size;
    
    // Monthly new users count - get all users and filter in memory
    const allUsersSnapshot = await adminDB
      .collection('users')
      .get();
    
    const monthlyUsersCount = allUsersSnapshot.docs.filter(doc => {
      const data = doc.data();
      const userDate = new Date(data.updatedAt);
      return userDate >= currentMonth;
    }).length;
    
    const dashboardData = {
      stats: {
        totalActiveEvents,
        totalOrganizers,
        totalTravelers,
        monthlyEventsCount,
        monthlyUsersCount
      },
      recentEvents,
      recentTravelers
    };
    
    return NextResponse.json(dashboardData);
    
  } catch (error: any) {
    console.error("Error fetching admin dashboard data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" }, 
      { status: 500 }
    );
  }
}

// // Additional endpoint for getting more detailed statistics
// export async function POST(request: Request) {
//   try {
//     await initAdmin();
//     const sessionCookie = (await cookies()).get('session')?.value;
    
//     if (!sessionCookie) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }
    
//     const body = await request.json();
//     const { startDate, endDate, type } = body;
    
//     // Verify the session cookie
//     const adminAuth = getAdminAuth();
//     const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
//     const adminDB = getAdminDB();
    
//     let query = adminDB.collection('events');
    
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       query = query.where('createdAt', '>=', start).where('createdAt', '<=', end);
//     }
    
//     if (type && type !== 'all') {
//       query = query.where('category', '==', type);
//     }
    
//     const snapshot = await query.get();
//     const events = snapshot.docs.map(doc => {
//       const data = doc.data();
//       return {
//         id: doc.id,
//         title: data.title,
//         location: data.location,
//         category: data.category,
//         date: data.date?.toDate().toISOString(),
//         createdAt: data.createdAt?.toDate().toISOString(),
//         organizerId: data.organizerId,
//         isEnded: data.isEnded,
//         price: data.price
//       };
//     });
    
//     return NextResponse.json({ events, count: events.length });
    
//   } catch (error: any) {
//     console.error("Error fetching filtered events:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to fetch filtered events" }, 
//       { status: 500 }
//     );
//   }
// }
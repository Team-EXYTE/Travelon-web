import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initAdmin, getAdminAuth, getAdminDB } from '@/db/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    await initAdmin();

    // Verify authentication
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify the session cookie
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;
    const userEmail = decodedClaims.email || 'Unknown Email';

    // Get form data
    const formData = await req.formData();
    const subject = formData.get('subject') as string;
    const category = formData.get('category') as string;
    const message = formData.get('message') as string;

    // Validate inputs
    if (!subject || !category || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get category name for better readability
    const categoryMap: Record<string, string> = {
      technical: 'Technical Issue',
      account: 'Account Problem',
      billing: 'Billing Question',
      feature: 'Feature Request',
      complaint: 'Complaint',
      other: 'Other',
    };

    const categoryName = categoryMap[category] || category;

    // Store support request in database
    const adminDB = getAdminDB();
    await adminDB.collection('supportRequests').add({
      userId,
      userEmail,
      subject,
      categoryName,
      message,
      createdAt: new Date(),
      status: 'pending',
    });

    return NextResponse.json({ 
      success: true, 
      message: "Support request submitted successfully" 
    });

  } catch (error: any) {
    console.error('Error submitting support request:', error);
    return NextResponse.json(
      { error: error.message || "Failed to submit support request" },
      { status: 500 }
    );
  }
}
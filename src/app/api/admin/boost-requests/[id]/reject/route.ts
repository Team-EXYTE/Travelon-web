import { NextResponse } from "next/server";
import { initAdmin, getAdminDB } from "@/db/firebaseAdmin";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;

    if (!requestId) {
      return NextResponse.json(
        { message: "Request ID is required" },
        { status: 400 }
      );
    }

    await initAdmin();
    const adminDB = getAdminDB();

    // Get the boost request
    const requestDoc = await adminDB
      .collection("boostRequests")
      .doc(requestId)
      .get();

    if (!requestDoc.exists) {
      return NextResponse.json(
        { message: "Boost request not found" },
        { status: 404 }
      );
    }

    const requestData = requestDoc.data();

    if (requestData?.status === "rejected") {
      return NextResponse.json(
        { message: "Request already rejected" },
        { status: 400 }
      );
    }

    // Update the request status
    await adminDB.collection("boostRequests").doc(requestId).update({
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      rejectedBy: "admin", // Ideally this would be the actual admin ID
    });

    // If this request has a payment, update the payment record too
    if (requestData?.paymentId) {
      try {
        await adminDB
          .collection("eventBoostPayments")
          .doc(requestData.paymentId)
          .update({
            boostRequestStatus: "rejected",
            boostRejectedAt: new Date().toISOString(),
          });
      } catch (error) {
        console.error("Error updating payment record:", error);
      }
    }

    return NextResponse.json({
      message: "Boost request rejected successfully",
    });
  } catch (error: any) {
    console.error("Error rejecting boost request:", error);
    return NextResponse.json(
      { message: "Failed to reject boost request" },
      { status: 500 }
    );
  }
}

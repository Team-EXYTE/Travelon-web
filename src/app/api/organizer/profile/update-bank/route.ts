import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initAdmin, getAdminAuth, getAdminDB } from "@/db/firebaseAdmin";

export async function POST(request: Request) {
  try {
    await initAdmin();
    const sessionCookie = (await cookies()).get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify the session cookie
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );
    const uid = decodedClaims.uid;

    // Parse the request body
    const bankDetails = await request.json();

    // Validate required fields
    const requiredFields = [
      "bankName",
      "bankCode",
      "branchName",
      "branchCode",
      "accountNumber",
    ];
    for (const field of requiredFields) {
      if (!bankDetails[field] || !bankDetails[field].trim()) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    const numericFields = ["bankCode", "branchCode", "accountNumber"];
    for (const field of numericFields) {
      if (!/^\d+$/.test(bankDetails[field])) {
        return NextResponse.json(
          { error: `${field} must contain only numbers` },
          { status: 400 }
        );
      }
    }

    // Create the bank details object to store
    const bankDetailsToStore = {
      bankName: bankDetails.bankName.trim(),
      bankCode: bankDetails.bankCode.trim(),
      branchName: bankDetails.branchName.trim(),
      branchCode: bankDetails.branchCode.trim(),
      accountNumber: bankDetails.accountNumber.trim(),
      updatedAt: new Date().toISOString(),
    };

    // Update the user document in Firestore
    const adminDB = getAdminDB();
    await adminDB.collection("users").doc(uid).update({
      bankDetails: bankDetailsToStore,
      updatedAt: new Date().toISOString(),
    });

    // Get updated user document
    const userDoc = await adminDB.collection("users").doc(uid).get();

    return NextResponse.json({
      success: true,
      message: "Bank details updated successfully",
      user: userDoc.data(),
    });
  } catch (error: any) {
    console.error("Bank details update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update bank details" },
      { status: 500 }
    );
  }
}

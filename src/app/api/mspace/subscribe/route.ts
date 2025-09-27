import { NextResponse } from 'next/server';
import { initAdmin, getAdminDB } from '@/db/firebaseAdmin';

/**
 * @swagger
 * /api/mspace/subscribe:
 *   post:
 *     summary: Handle subscription notifications from mSpace
 *     description: Webhook endpoint for mSpace to send subscription status notifications
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Notification received
 */
export async function POST(request: Request) {
  try {
    const notification = await request.json();
    console.log('[mSpace Subscription Notification]:', JSON.stringify(notification, null, 2));
    
    const { 
      applicationId, 
      subscriberId, // This is the MASKED ID
      status, 
      frequency, 
      timeStamp 
    } = notification;
    
    // Validation: Ensure the masked subscriberId exists
    if (!subscriberId || !subscriberId.startsWith('tel:')) {
      console.warn('Received subscription notification with invalid subscriberId', subscriberId);
      return NextResponse.json({
        statusCode: 'E1302',
        statusDetail: 'Invalid or missing subscriberId'
      }, { status: 400 });
    }
    
    try {
      await initAdmin();
      const adminDB = getAdminDB();
      
      // Store the raw notification for auditing purposes
      await adminDB.collection('subscriptionNotifications').add({
        subscriberId, // Store the masked ID
        status,
        frequency,
        timeStamp: timeStamp || new Date().toISOString(),
        receivedAt: new Date().toISOString(),
        rawData: notification
      });
      
      // --- CORE LOGIC CHANGE ---
      // Find the subscription/user using the MASKED subscriberId
      const subscriptionQuery = await adminDB
        .collection('subscriptions')
        .where('maskedSubscriberId', '==', subscriberId) // LOOKUP BY MASKED ID
        .limit(1)
        .get();
      
      if (!subscriptionQuery.empty) {
        const subscriptionDoc = subscriptionQuery.docs[0];
        const newStatus = status === 'REGISTERED' ? 'subscribed' : 'unsubscribed';

        await subscriptionDoc.ref.update({
          status: newStatus,
          updatedAt: new Date().toISOString(),
          notification: notification
        });

        const userQuery = await adminDB
                .collection('users')
                .where('maskedSubscriberId', '==', subscriberId) // LOOKUP BY MASKED ID
                .limit(1)
                .get();

        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({
            subscriptionStatus: newStatus,
            subscriptionUpdatedAt: new Date().toISOString()
          });
        }
        
        console.log(`Subscription status updated to "${newStatus}" for subscriberId: ${subscriberId}`);

      } else {
        console.warn(`Received notification for an unknown subscriberId: ${subscriberId}`);
        await adminDB.collection('orphanNotifications').add(notification);
      }
      
    } catch (dbError) {
      console.error('Error updating subscription in database:', dbError);
    }

    return NextResponse.json({
      statusCode: 'S1000',
      statusDetail: 'Subscription notification received successfully'
    });

  } catch (error: any) {
    console.error('Fatal error processing subscription notification:', error);
    
    return NextResponse.json({
      statusCode: 'S1000',
      statusDetail: 'Notification received but failed to process internally.'
    });
  }
}
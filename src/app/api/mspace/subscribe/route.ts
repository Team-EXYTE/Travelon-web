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
        const subscriptionData = subscriptionDoc.data();
        const newStatus = status === 'REGISTERED' ? 'subscribed' : 'unsubscribed';

        await subscriptionDoc.ref.update({
          status: newStatus,
          updatedAt: new Date().toISOString(),
          notification: notification
        });
        
        // Check if we have user type information in the subscription document
        const userType = subscriptionData.userType || 'organizer'; // Default to organizer
        
        // Determine which collection to query based on user type
        const userCollection = userType === 'organizer' ? 'users' : 'users-travellers';
        
        console.log(`Looking for user in ${userCollection} with maskedSubscriberId: ${subscriberId}`);
        
        // Try to find user by maskedSubscriberId in the appropriate collection
        const userQuery = await adminDB
                .collection(userCollection)
                .where('maskedSubscriberId', '==', subscriberId)
                .limit(1)
                .get();

        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({
            subscriptionStatus: newStatus,
            subscriptionUpdatedAt: new Date().toISOString()
          });
          console.log(`Updated ${userType} user with subscription status: ${newStatus}`);
        } else {
          console.log(`No user found in ${userCollection} with maskedSubscriberId: ${subscriberId}, checking other collection`);
          
          // If not found in the expected collection, try the other collection as fallback
          const fallbackCollection = userType === 'organizer' ? 'users-travellers' : 'users';
          const fallbackQuery = await adminDB
                .collection(fallbackCollection)
                .where('maskedSubscriberId', '==', subscriberId)
                .limit(1)
                .get();
                
          if (!fallbackQuery.empty) {
            const fallbackUserDoc = fallbackQuery.docs[0];
            await fallbackUserDoc.ref.update({
              subscriptionStatus: newStatus,
              subscriptionUpdatedAt: new Date().toISOString()
            });
            console.log(`Updated user in fallback collection (${fallbackCollection}) with subscription status: ${newStatus}`);
          } else {
            console.warn(`No user found in any collection with maskedSubscriberId: ${subscriberId}`);
          }
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
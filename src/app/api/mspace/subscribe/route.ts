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
      subscriberId, // This is the ID without "tel:" prefix
      status, 
      frequency, 
      timeStamp 
    } = notification;
    
    // Validation: Ensure the subscriberId exists
    if (!subscriberId) {
      console.warn('Received subscription notification with missing subscriberId');
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
        subscriberId,
        status,
        frequency,
        timeStamp: timeStamp || new Date().toISOString(),
        receivedAt: new Date().toISOString(),
        rawData: notification
      });
      
      // Format the subscriberId to match both possible formats in the database
      const formattedSubscriberId = `tel:${subscriberId}`;
      
      // --- CORE LOGIC CHANGE ---
      // Find the subscription/user using EITHER format of the subscriberId
      const subscriptionQuery = await adminDB
        .collection('subscriptions')
        .where('maskedSubscriberId', 'in', [subscriberId, formattedSubscriberId])
        .limit(1)
        .get();
      
      if (!subscriptionQuery.empty) {
        const subscriptionDoc = subscriptionQuery.docs[0];
        const subscriptionData = subscriptionDoc.data();
        const newStatus = status === 'REGISTERED' ? 'subscribed' : 'unsubscribed';

        // Update the subscription document and standardize the subscriberId format
        await subscriptionDoc.ref.update({
          status: newStatus,
          updatedAt: new Date().toISOString(),
          notification: notification,
          // Standardize the maskedSubscriberId format for future lookups
          maskedSubscriberId: formattedSubscriberId
        });
        
        // Check if we have user type information in the subscription document
        const userType = subscriptionData.userType || 'organizer'; // Default to organizer
        
        // Determine which collection to query based on user type
        const userCollection = userType === 'organizer' ? 'users' : 'users-travellers';
        
        console.log(`Looking for user in ${userCollection} with maskedSubscriberId formats: "${subscriberId}" or "${formattedSubscriberId}"`);
        
        // Try to find user by maskedSubscriberId in the appropriate collection
        // Search for both formats of the subscriberId
        const userQuery = await adminDB
                .collection(userCollection)
                .where('maskedSubscriberId', 'in', [subscriberId, formattedSubscriberId])
                .limit(1)
                .get();

        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({
            subscriptionStatus: newStatus,
            subscriptionUpdatedAt: new Date().toISOString(),
            // Standardize the maskedSubscriberId format for future lookups
            maskedSubscriberId: formattedSubscriberId
          });
          console.log(`Updated ${userType} user with subscription status: ${newStatus}`);
        } else {
          console.log(`No user found in ${userCollection} with maskedSubscriberId formats: "${subscriberId}" or "${formattedSubscriberId}", checking other collection`);
          
          // If not found in the expected collection, try the other collection as fallback
          const fallbackCollection = userType === 'organizer' ? 'users-travellers' : 'users';
          const fallbackQuery = await adminDB
                .collection(fallbackCollection)
                .where('maskedSubscriberId', 'in', [subscriberId, formattedSubscriberId])
                .limit(1)
                .get();
                
          if (!fallbackQuery.empty) {
            const fallbackUserDoc = fallbackQuery.docs[0];
            await fallbackUserDoc.ref.update({
              subscriptionStatus: newStatus,
              subscriptionUpdatedAt: new Date().toISOString(),
              // Standardize the maskedSubscriberId format for future lookups
              maskedSubscriberId: formattedSubscriberId
            });
            console.log(`Updated user in fallback collection (${fallbackCollection}) with subscription status: ${newStatus}`);
          } else {
            console.warn(`No user found in any collection with either subscriberId format`);
            
            // Last resort: Try phone search if available in subscription data
            if (subscriptionData.phone) {
              console.log(`Attempting to find user by phone number: ${subscriptionData.phone}`);
              
              // Try both collections with phone number lookup
              const phoneUserQuery = await adminDB
                .collection(userCollection)
                .where('phoneNumber', '==', subscriptionData.phone)
                .limit(1)
                .get();
                
              if (!phoneUserQuery.empty) {
                const userDoc = phoneUserQuery.docs[0];
                await userDoc.ref.update({
                  subscriptionStatus: newStatus,
                  subscriptionUpdatedAt: new Date().toISOString(),
                  maskedSubscriberId: formattedSubscriberId // Store the standardized format
                });
                console.log(`Updated user by phone number in ${userCollection}`);
              } else {
                // Check fallback collection
                const fallbackPhoneQuery = await adminDB
                  .collection(fallbackCollection)
                  .where('phoneNumber', '==', subscriptionData.phone)
                  .limit(1)
                  .get();
                
                if (!fallbackPhoneQuery.empty) {
                  const userDoc = fallbackPhoneQuery.docs[0];
                  await userDoc.ref.update({
                    subscriptionStatus: newStatus,
                    subscriptionUpdatedAt: new Date().toISOString(),
                    maskedSubscriberId: formattedSubscriberId // Store the standardized format
                  });
                  console.log(`Updated user by phone number in ${fallbackCollection}`);
                } else {
                  console.warn(`No user found by phone number: ${subscriptionData.phone}`);
                }
              }
            }
          }
        }
        
        console.log(`Subscription status updated to "${newStatus}" for subscriberId: ${formattedSubscriberId}`);

      } else {
        // If subscription not found, try a direct lookup in user collections
        console.warn(`No subscription found with maskedSubscriberId formats: "${subscriberId}" or "${formattedSubscriberId}", checking users directly`);
        
        // Try to find the user directly in either collection
        const organizerQuery = await adminDB
          .collection('users')
          .where('maskedSubscriberId', 'in', [subscriberId, formattedSubscriberId])
          .limit(1)
          .get();
          
        let userFound = false;
          
        if (!organizerQuery.empty) {
          const userDoc = organizerQuery.docs[0];
          const newStatus = status === 'REGISTERED' ? 'subscribed' : 'unsubscribed';
          
          await userDoc.ref.update({
            subscriptionStatus: newStatus,
            subscriptionUpdatedAt: new Date().toISOString(),
            maskedSubscriberId: formattedSubscriberId // Standardize
          });
          
          console.log(`Updated organizer user directly with subscription status: ${newStatus}`);
          userFound = true;
        }
        
        if (!userFound) {
          const travellerQuery = await adminDB
            .collection('users-travellers')
            .where('maskedSubscriberId', 'in', [subscriberId, formattedSubscriberId])
            .limit(1)
            .get();
            
          if (!travellerQuery.empty) {
            const userDoc = travellerQuery.docs[0];
            const newStatus = status === 'REGISTERED' ? 'subscribed' : 'unsubscribed';
            
            await userDoc.ref.update({
              subscriptionStatus: newStatus,
              subscriptionUpdatedAt: new Date().toISOString(),
              maskedSubscriberId: formattedSubscriberId // Standardize
            });
            
            console.log(`Updated traveller user directly with subscription status: ${newStatus}`);
            userFound = true;
          }
        }
        
        if (!userFound) {
          console.warn(`Received notification for an unknown subscriberId: ${subscriberId}`);
          await adminDB.collection('orphanNotifications').add({
            ...notification,
            receivedAt: new Date().toISOString(),
            formattedSubscriberId
          });
        }
      }
      
    } catch (dbError) {
      console.error('Error updating subscription in database:', dbError);
    }

    // Always return success to mSpace
    return NextResponse.json({
      statusCode: 'S1000',
      statusDetail: 'Subscription notification received successfully'
    });

  } catch (error: any) {
    console.error('Fatal error processing subscription notification:', error);
    
    // Always return success to mSpace
    return NextResponse.json({
      statusCode: 'S1000',
      statusDetail: 'Notification received but failed to process internally.'
    });
  }
}
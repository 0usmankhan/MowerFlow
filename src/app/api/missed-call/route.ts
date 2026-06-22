
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

/**
 * Handles incoming webhooks for missed calls.
 */
export async function POST(req: NextRequest) {
  const { firestore } = initializeFirebase();
  if (!firestore) {
    return new NextResponse('Firestore not initialized', { status: 500 });
  }

  try {
    const body = await req.json();
    const fromNumber = body.from;

    if (!fromNumber) {
      return new NextResponse('"from" phone number is required.', { status: 400 });
    }

    const autoReplyMessage = `Hi there! Sorry we missed your call. A member of the MowerFlow team will get back to you shortly.`;
    console.log(`--- SIMULATING SENDING SMS ---`);
    console.log(`TO: ${fromNumber}`);
    console.log(`MESSAGE: ${autoReplyMessage}`);
    console.log(`-----------------------------`);

    // Check for existing lead or customer
    const leadsRef = collection(firestore, 'leads');
    const customersRef = collection(firestore, 'customers');
    
    const leadQuery = query(leadsRef, where('phone', '==', fromNumber));
    const customerQuery = query(customersRef, where('phone', '==', fromNumber));

    const [leadSnapshot, customerSnapshot] = await Promise.all([
      getDocs(leadQuery),
      getDocs(customerQuery)
    ]);

    if (leadSnapshot.empty && customerSnapshot.empty) {
        const newLead = {
            name: `Missed Call From ${fromNumber}`,
            phone: fromNumber,
            email: '',
            initialMessage: `Missed call at ${new Date().toLocaleString()}`,
            status: 'New' as const,
            createdAt: serverTimestamp(),
            urgency: 'High' as const,
            source: 'Missed Call' as const,
        };
        const docRef = await addDoc(collection(firestore, 'leads'), newLead);
        console.log('New lead created from missed call:', docRef.id);
    } else {
        console.log(`Duplicate lead/customer detected for phone number: ${fromNumber}. No new lead created.`);
    }

    return new NextResponse('Webhook received.', { status: 200 });
  } catch (error) {
    console.error('Error processing missed-call webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

    
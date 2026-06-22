
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'your-super-secret-verify-token';

/**
 * Handles GET requests for webhook verification with Meta.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('Webhook verification failed.');
    return new NextResponse('Forbidden', { status: 403 });
  }
}

/**
 * Handles POST requests with new lead data from Meta.
 */
export async function POST(req: NextRequest) {
  const { firestore } = initializeFirebase();
  if (!firestore) {
    return new NextResponse('Firestore not initialized', { status: 500 });
  }

  try {
    const body = await req.json();
    console.log('Received Facebook lead webhook:', JSON.stringify(body, null, 2));

    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'leadgen') {
            const leadData = change.value;
            const newLead = {
              name: leadData.field_data.find((f: any) => f.name === 'full_name')?.values[0] || 'N/A',
              phone: leadData.field_data.find((f: any) => f.name === 'phone_number')?.values[0] || 'N/A',
              email: leadData.field_data.find((f: any) => f.name === 'email')?.values[0] || 'N/A',
              initialMessage: `New lead from form ${leadData.form_id} on Facebook/Instagram.`,
              status: 'New' as const,
              createdAt: serverTimestamp(),
              urgency: 'Unknown' as const,
              source: 'Facebook' as const,
            };

            const docRef = await addDoc(collection(firestore, 'leads'), newLead);
            console.log('New lead created from Facebook:', docRef.id);
          }
        }
      }
    }
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing Facebook webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

    
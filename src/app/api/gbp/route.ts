
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CLIENT_TOKEN = process.env.GBP_VERIFY_TOKEN || 'your-google-verify-token';

/**
 * Handles GET requests for webhook verification with Google Business Messages.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientToken = searchParams.get('clientToken');
  const challenge = searchParams.get('challenge');

  if (clientToken === CLIENT_TOKEN && challenge) {
    console.log('Google Business Messages webhook verified successfully!');
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } else {
    console.error('Google Business Messages webhook verification failed.');
    return new NextResponse('Forbidden', { status: 403 });
  }
}

/**
 * Handles POST requests with new message data from Google Business Messages.
 */
export async function POST(req: NextRequest) {
  const { firestore } = initializeFirebase();
  if (!firestore) {
    return new NextResponse('Firestore not initialized', { status: 500 });
  }
  
  try {
    const body = await req.json();
    console.log('Received Google Business Message webhook:', JSON.stringify(body, null, 2));

    const message = body.message;
    const context = body.context;
    
    if (message && context?.userInfo) {
      const newLead = {
        name: context.userInfo.displayName || `GBP User ${body.conversationId}`,
        phone: '', // GBP doesn't provide a phone number directly
        email: '',
        initialMessage: `New message from Google Business Profile: "${message.text}"`,
        status: 'New' as const,
        createdAt: serverTimestamp(),
        urgency: 'Unknown' as const,
        source: 'Google Business' as const,
      };

      const docRef = await addDoc(collection(firestore, 'leads'), newLead);
      console.log('New lead created from Google Business Message:', docRef.id);
    } else if (body.secret) {
        // This is a health check from Google
        console.log('Received Google Business Messages health check.');
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing Google Business Messages webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

    
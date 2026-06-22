

'use server';

import { qualifyLead, type Lead as AilLead, type LeadQualificationResult } from '@/ai/flows/ai-powered-lead-qualification';
import { transcribeAudio, type TranscribeAudioResult } from '@/ai/flows/transcribe-audio-flow';
import { continueChat } from '@/ai/flows/chat-flow';
import type { ChatMessage } from '@/ai/flows/chat-types';
import { generateEstimateEmail, type GenerateEstimateInput, type GenerateEstimateOutput } from '@/ai/flows/generate-estimate-email-flow';
import { collection, addDoc, doc, updateDoc, serverTimestamp, runTransaction, deleteDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeServerApp } from '@/firebase/server';
import type { Job, Lead } from '@/lib/types';


export async function qualifyLeadAction(leadData: Pick<Lead, 'initialMessage' | 'phone'>): Promise<LeadQualificationResult> {
  try {
    const result = await qualifyLead({
      initialMessage: leadData.initialMessage,
      phoneNumber: leadData.phone,
    });
    return result;
  } catch (error) {
    console.error('Error qualifying lead:', error);
    throw new Error('Failed to qualify lead due to an AI processing error.');
  }
}

export async function transcribeAudioAction(audioDataUri: string): Promise<TranscribeAudioResult> {
    try {
        const result = await transcribeAudio({ audioDataUri });
        return result;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw new Error('Failed to transcribe audio due to an AI processing error.');
    }
}

export async function chatAction(history: ChatMessage[]): Promise<string> {
    try {
        const result = await continueChat(history);
        return result;
    } catch (error) {
        console.error('Error in chat action:', error);
        throw new Error('Failed to get chat response due to an AI processing error.');
    }
}

export async function generateEstimateEmailAction(input: GenerateEstimateInput): Promise<GenerateEstimateOutput> {
    try {
        const result = await generateEstimateEmail(input);
        return result;
    } catch (error) {
        console.error('Error generating estimate email:', error);
        throw new Error('Failed to generate estimate email due to an AI processing error.');
    }
}

export async function convertLeadToCustomerAction(lead: Pick<Lead, 'id' | 'name' | 'phone' | 'email' | 'address' | 'status'>): Promise<string> {
    await initializeServerApp();
    const firestore = getFirestore();

    try {
        const newCustomerId = await runTransaction(firestore, async (transaction) => {
            const customerData = {
                name: lead.name,
                phone: lead.phone,
                email: lead.email,
                address: lead.address || '',
                createdAt: serverTimestamp(),
            };
            
            const customersCollection = collection(firestore, 'customers');
            const newCustomerRef = doc(customersCollection); // Create a new document reference with an auto-generated ID
            transaction.set(newCustomerRef, customerData);

            if (lead.status !== 'Converted') {
                const leadRef = doc(firestore, 'leads', lead.id);
                transaction.update(leadRef, { status: 'Converted' });
            }
            
            return newCustomerRef.id;
        });
        
        console.log(`Lead ${lead.id} converted to customer ${newCustomerId}`);
        return newCustomerId;

    } catch (error) {
        console.error("Error converting lead to customer: ", error);
        throw new Error("Failed to save new customer to the database.");
    }
}

export async function createManualLeadAction(leadData: {
    name: string;
    phone: string;
    email?: string;
    initialMessage: string;
}) {
    await initializeServerApp();
    const firestore = getFirestore();
    const leadsCollection = collection(firestore, 'leads');
    
    const newLead = {
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email || '',
        initialMessage: leadData.initialMessage,
        address: '',
        status: 'New' as const,
        source: 'Manual' as const,
        createdAt: serverTimestamp(),
        urgency: 'Unknown',
        assignee: 'Unassigned',
    };
    
    try {
        const docRef = await addDoc(leadsCollection, newLead);
        console.log("New manual lead created with ID: ", docRef.id);
        return docRef.id;
    } catch(e) {
        console.error("Error creating manual lead: ", e);
        throw new Error("Failed to create lead in the database.");
    }
}

export async function createJobAction(jobData: Omit<Job, 'id' | 'status'> & { customerId: string }) {
    await initializeServerApp();
    const firestore = getFirestore();
    
    const ticketsCollection = collection(firestore, 'customers', jobData.customerId, 'tickets');

    const newTicket = {
        ...jobData,
        status: 'Scheduled',
        createdAt: serverTimestamp(),
    };

    try {
        const docRef = await addDoc(ticketsCollection, newTicket);
        console.log("New job created with ID: ", docRef.id);
        return docRef.id;
    } catch(e) {
        console.error("Error creating job: ", e);
        throw new Error("Failed to create job in the database.");
    }
}


export async function createLeadFromWebformAction(leadData: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    message: string;
    referralCode?: string;
}) {
    await initializeServerApp();
    const firestore = getFirestore();
    const leadsCollection = collection(firestore, 'leads');

    const newLead = {
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email || '',
        address: leadData.address || '',
        initialMessage: leadData.message,
        referralCode: leadData.referralCode || '',
        status: 'New' as const,
        source: 'Website' as const,
        createdAt: serverTimestamp(),
        urgency: 'Unknown',
        assignee: 'Unassigned',
    };

    try {
        const docRef = await addDoc(leadsCollection, newLead);
        console.log("New webform lead created with ID: ", docRef.id);
        return docRef.id;
    } catch(e) {
        console.error("Error creating webform lead: ", e);
        throw new Error("Failed to create webform lead in the database.");
    }
}


export async function deleteLeadAction(leadId: string) {
    await initializeServerApp();
    const firestore = getFirestore();
    const leadRef = doc(firestore, 'leads', leadId);
    try {
        await deleteDoc(leadRef);
        console.log(`Lead ${leadId} deleted successfully.`);
    } catch (e) {
        console.error(`Error deleting lead ${leadId}:`, e);
        throw new Error('Failed to delete lead from the database.');
    }
}

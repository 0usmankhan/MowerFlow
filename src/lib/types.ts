
import type { Timestamp } from 'firebase/firestore';

export type ServiceType = 'Lawn Mowing' | 'Golf Cart Repair' | 'Tune-up' | 'Winterization';
export type Urgency = 'Low' | 'Medium' | 'High' | 'Unknown';
export type JobStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Invoiced' | 'Paid';
export type LeadStatus = 'New' | 'Qualified' | 'Contacted' | 'Converted' | 'Archived';
export type LeadSource = 'Website' | 'Facebook' | 'Missed Call' | 'Google Business' | 'Manual';
export type Frequency = 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Annually';
export type TeamRole = 'Admin' | 'Technician';

export type Equipment = {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  imageUrl: string;
  imageHint: string;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  initialMessage: string;
  status: LeadStatus;
  source?: LeadSource;
  serviceType?: ServiceType | string;
  urgency?: Urgency;
  qualificationQuestions?: string;
  createdAt: Timestamp;
  address?: string;
  assignee?: string;
  referralCode?: string;
};

export type Job = {
  id: string;
  customerId: string;
  serviceType: string; // Allow more flexible service types from input
  status: JobStatus;
  scheduledDate: string;
  technicianId: string;
  description?: string;
  invoiceAmount?: number;
};

export type RecurringJob = {
    id: string;
    customerId: string;
    serviceType: ServiceType;
    frequency: Frequency;
    startDate: string;
    endDate?: string;
    technicianId: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatarUrl?: string;
  avatarHint?: string;
};

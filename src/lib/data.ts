

import type { Lead, Job, Customer, RecurringJob, TeamMember } from '@/lib/types';
import { getPlaceholderImage } from './placeholder-images';

export const teamMembers: TeamMember[] = [
    {
        id: 'tech-1',
        name: 'Dan',
        email: 'dan@mowerflow.com',
        role: 'Technician',
    },
    {
        id: 'tech-2',
        name: 'Chris',
        email: 'chris@mowerflow.com',
        role: 'Technician',
    },
    {
        id: 'admin-1',
        name: 'John Doe',
        email: 'john.doe@mowerflow.com',
        role: 'Admin',
    }
];

export const recurringJobs: RecurringJob[] = [
    {
        id: 'rec-job-1',
        customerId: 'cust-1',
        serviceType: 'Lawn Mowing',
        frequency: 'Weekly',
        startDate: '2024-05-01T09:00:00Z',
        technicianId: 'tech-1',
    }
];

export const customers: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Doe',
    phone: '555-123-4567',
    email: 'john.doe@example.com',
    address: '123 Main St, Anytown, USA',
    referralCode: 'JOHN-D-543',
    equipment: [
      {
        id: 'equip-1',
        name: 'Riding Mower',
        model: 'ZT1 50',
        serialNumber: 'SN-MOWER-12345',
        imageUrl: getPlaceholderImage('mower1')?.imageUrl || '',
        imageHint: getPlaceholderImage('mower1')?.imageHint || ''
      },
    ],
    jobIds: ['job-1', 'job-3'],
    recurringJobIds: ['rec-job-1'],
  },
  {
    id: 'cust-2',
    name: 'Jane Smith',
    phone: '555-987-6543',
    email: 'jane.smith@example.com',
    address: '456 Oak Ave, Anytown, USA',
    referralCode: 'JANE-S-987',
    equipment: [
      {
        id: 'equip-2',
        name: 'Golf Cart',
        model: 'EZ-GO RXV',
        serialNumber: 'SN-GOLFCART-67890',
        imageUrl: getPlaceholderImage('golfcart1')?.imageUrl || '',
        imageHint: getPlaceholderImage('golfcart1')?.imageHint || ''
      },
    ],
    jobIds: ['job-2'],
  },
  {
    id: 'cust-3',
    name: 'Robert Johnson',
    phone: '555-555-5555',
    email: 'robert.j@email.com',
    address: '789 Pine Ln, Sometown, USA',
    referralCode: 'ROBERT-J-111',
    equipment: [],
    jobIds: ['job-4'],
  },
];

export const leads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Mike Williams',
    phone: '555-234-5678',
    email: 'mike.w@email.com',
    initialMessage: 'My lawnmower won\'t start. I think the battery is dead. Can you help?',
    status: 'New',
    createdAt: '2024-07-20T10:00:00Z',
    urgency: 'Unknown',
    assignee: 'Dan',
    source: 'Website',
  },
  {
    id: 'lead-2',
    name: 'Sarah Brown',
    phone: '555-345-6789',
    email: 'sarah.b@email.com',
    initialMessage: 'Need a quote for weekly lawn mowing for my 1/2 acre property.',
    status: 'Qualified',
    serviceType: 'Lawn Mowing',
    urgency: 'Medium',
    qualificationQuestions: 'Q: What is your address?\nA: 789 Maple Drive.\nQ: Any pets or obstacles in the yard?\nA: No pets, but there is a swing set.',
    createdAt: '2024-07-19T14:30:00Z',
    assignee: 'Chris',
    source: 'Facebook',
  },
  {
    id: 'lead-3',
    name: 'David Garcia',
    phone: '555-456-7890',
    email: 'david.g@email.com',
    initialMessage: 'My golf cart is making a weird noise. It sounds like it\'s coming from the wheels. Need it fixed ASAP for a tournament this weekend.',
    status: 'Qualified',
    serviceType: 'Golf Cart Repair',
    urgency: 'High',
    qualificationQuestions: 'Q: What is the make and model of the cart?\nA: It\'s a 2021 Club Car Onward.\nQ: Can you describe the noise?\nA: A high-pitched squeal when I accelerate.',
    createdAt: '2024-07-18T09:00:00Z',
    assignee: 'Dan',
    source: 'Missed Call',
  },
  {
    id: 'lead-4',
    name: 'Emily Chen',
    phone: '555-876-5432',
    email: 'emily.c@email.com',
    initialMessage: 'Interested in getting my mower ready for the winter.',
    status: 'Contacted',
    serviceType: 'Winterization',
    urgency: 'Low',
    createdAt: '2024-07-17T11:00:00Z',
    assignee: 'Unassigned',
    source: 'Google Business',
    referralCode: 'JANE-S-987'
  }
];

export const jobs: Job[] = [
  {
    id: 'job-1',
    customerId: 'cust-1',
    serviceType: 'Tune-up',
    status: 'Scheduled',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    technicianId: 'tech-1',
  },
  {
    id: 'job-2',
    customerId: 'cust-2',
    serviceType: 'Golf Cart Repair',
    status: 'Completed',
    scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    technicianId: 'tech-2',
    invoiceAmount: 450,
  },
  {
    id: 'job-3',
    customerId: 'cust-1',
    serviceType: 'Lawn Mowing',
    status: 'Invoiced',
    scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    technicianId: 'tech-1',
    invoiceAmount: 75,
  },
    {
    id: 'job-4',
    customerId: 'cust-3',
    serviceType: 'Golf Cart Repair',
    status: 'In Progress',
    scheduledDate: new Date().toISOString(),
    technicianId: 'tech-2',
  },
];

export const getCustomer = (id: string) => customers.find(c => c.id === id);
export const getJob = (id: string) => jobs.find(j => j.id === id);
export const getLead = (id: string) => leads.find(l => l.id === id);
export const getJobsForCustomer = (customerId: string) => jobs.filter(j => j.customerId === customerId);
export const getRecurringJobsForCustomer = (customerId: string) => recurringJobs.filter(j => j.customerId === customerId);
export const getTeamMember = (id: string) => teamMembers.find(t => t.id === id);

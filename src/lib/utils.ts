import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Timestamp } from 'firebase/firestore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | Timestamp) {
  let dateObj: Date;

  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else if (date && typeof date.toDate === 'function') {
    dateObj = date.toDate();
  } else {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(dateObj);
}

    
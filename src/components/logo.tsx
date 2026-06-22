import { Tractor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-lg font-bold tracking-tighter', className)}>
      <div className="bg-primary text-primary-foreground p-2 rounded-md">
        <Tractor className="h-5 w-5" />
      </div>
      <span className="font-headline">MowerFlow</span>
    </div>
  );
}

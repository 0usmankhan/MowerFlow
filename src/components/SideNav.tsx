'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Users, Calendar } from 'lucide-react';
import { MowerIcon } from '@/components/MowerIcon';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
];

export function SideNav() {
  const pathname = usePathname();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50">
      <div className="p-4">
        <div className="flex items-center gap-2 text-2xl font-bold mb-8">
          {isClient && <MowerIcon className="w-8 h-8" />}
          <span>MowerFlow</span>
        </div>
        <nav>
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-200',
                    pathname === link.href && 'bg-gray-200 font-semibold'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

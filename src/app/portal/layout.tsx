
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900/50">
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <Logo />
        <Button asChild variant="outline">
            <Link href="/portal/login">Logout</Link>
        </Button>
      </header>
      <main className="flex-grow">{children}</main>
    </div>
  );
}

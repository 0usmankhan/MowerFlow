

'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, PhoneMissed, MessageSquare, Facebook, UserPlus, MoreHorizontal } from 'lucide-react';
import { teamMembers, type TeamMember } from '@/lib/data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function TeamMembersTable({ members }: { members: TeamMember[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                 <div className="flex justify-between items-center">
                    <CardDescription>Invite and manage your team members.</CardDescription>
                    <Button><UserPlus className="mr-2 h-4 w-4" /> Invite Member</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map(member => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{member.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{member.email}</TableCell>
                                <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>Deactivate</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [missedCallWebhookUrl, setMissedCallWebhookUrl] = React.useState('');
  const [gbpWebhookUrl, setGbpWebhookUrl] = React.useState('');
  const gbpVerifyToken = 'your-google-verify-token';
  const [facebookWebhookUrl, setFacebookWebhookUrl] = React.useState('');
  const facebookVerifyToken = 'your-super-secret-verify-token';


   React.useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setMissedCallWebhookUrl(`${origin}/api/missed-call`);
    setGbpWebhookUrl(`${origin}/api/gbp`);
    setFacebookWebhookUrl(`${origin}/api/leads/facebook`);
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: 'Copied to Clipboard',
        description: `${fieldName} has been copied.`,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        description="Manage your account, billing, and integrations."
      />
      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@mowerflow.com" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Manage your subscription and payment methods.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Your current plan: <span className="font-semibold">Crew (3 Techs)</span></p>
              <Button className="mt-4">Manage Subscription</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
           <TeamMembersTable members={teamMembers} />
        </TabsContent>
         <TabsContent value="integrations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PhoneMissed className="h-5 w-5" /> Missed-Call Auto-Text-Back
                </CardTitle>
                <CardDescription>
                  Instantly text leads back when you miss a call. Configure your telephony provider (e.g., Twilio) to send a POST request to this webhook URL.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="missed-call-webhook-url">Webhook URL</Label>
                  <div className="flex items-center gap-2">
                    <Input id="missed-call-webhook-url" readOnly value={missedCallWebhookUrl} />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(missedCallWebhookUrl, 'Webhook URL')}>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground pt-2 border-t mt-4">
                    <h4 className="font-semibold text-foreground mb-2">Setup Instructions:</h4>
                    <p>
                        In your phone service provider's dashboard, find the webhook settings for missed or unanswered calls. Paste the URL above into the webhook field and set the request method to POST. The webhook should send a JSON payload with a `from` key containing the caller's phone number.
                    </p>
                </div>
              </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" /> Google Business Messages
                    </CardTitle>
                    <CardDescription>Receive messages from your Google Business Profile directly as new leads.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div>
                        <Label htmlFor="gbp-webhook-url">Webhook URL</Label>
                        <div className="flex items-center gap-2">
                            <Input id="gbp-webhook-url" readOnly value={gbpWebhookUrl} />
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(gbpWebhookUrl, 'Webhook URL')}>
                                <Copy className="mr-2 h-4 w-4" /> Copy
                            </Button>
                        </div>
                   </div>
                   <div>
                        <Label htmlFor="gbp-verify-token">Client Token</Label>
                         <div className="flex items-center gap-2">
                            <Input id="gbp-verify-token" readOnly value={gbpVerifyToken} />
                             <Button variant="outline" size="sm" onClick={() => copyToClipboard(gbpVerifyToken, 'Client Token')}>
                                <Copy className="mr-2 h-4 w-4" /> Copy
                            </Button>
                        </div>
                   </div>
                   <div className="text-sm text-muted-foreground pt-2 border-t mt-4">
                        <h4 className="font-semibold text-foreground mb-2">Setup Instructions:</h4>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Go to the <span className="font-semibold">Business Communications Developer Console</span>.</li>
                            <li>Select your agent and navigate to the <span className="font-semibold">Integrations</span> page.</li>
                            <li>Set the primary webhook with the <span className="font-semibold">Webhook URL</span> and <span className="font-semibold">Client Token</span> from above.</li>
                            <li>Your agent must send a valid response to webhook health checks.</li>
                        </ol>
                   </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Facebook className="h-5 w-5 text-blue-600" /> Facebook & Instagram Lead Ads
                    </CardTitle>
                    <CardDescription>Instantly receive leads from your Meta ad campaigns by setting up a webhook.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div>
                        <Label htmlFor="facebook-webhook-url">Webhook URL</Label>
                        <div className="flex items-center gap-2">
                            <Input id="facebook-webhook-url" readOnly value={facebookWebhookUrl} />
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(facebookWebhookUrl, 'Webhook URL')}>
                                <Copy className="mr-2 h-4 w-4" /> Copy
                            </Button>
                        </div>
                   </div>
                   <div>
                        <Label htmlFor="facebook-verify-token">Verify Token</Label>
                         <div className="flex items-center gap-2">
                            <Input id="facebook-verify-token" readOnly value={facebookVerifyToken} />
                             <Button variant="outline" size="sm" onClick={() => copyToClipboard(facebookVerifyToken, 'Verify Token')}>
                                <Copy className="mr-2 h-4 w-4" /> Copy
                            </Button>
                        </div>
                   </div>
                   <div className="text-sm text-muted-foreground pt-2 border-t mt-4">
                        <h4 className="font-semibold text-foreground mb-2">Setup Instructions:</h4>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Go to the <span className="font-semibold">Meta App Dashboard</span> for your app.</li>
                            <li>In the sidebar, find and add the <span className="font-semibold">Webhooks</span> product.</li>
                            <li>Select <span className="font-semibold">Page</span> from the dropdown and click <span className="font-semibold">Subscribe to this object</span>.</li>
                            <li>Paste the <span className="font-semibold">Webhook URL</span> and <span className="font-semibold">Verify Token</span> from above.</li>
                            <li>After subscribing, edit the subscription and subscribe to the <span className="font-semibold">leadgen</span> field.</li>
                        </ol>
                   </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

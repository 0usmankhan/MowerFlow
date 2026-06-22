import { PageHeader } from '@/components/page-header';
import { AIChatWidget } from '@/components/chat/ai-chat-widget';

export default function ChatPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="AI Chat Widget"
        description="Interact with the AI assistant. You can embed this on your website."
      />
      <div className="flex justify-center">
        <AIChatWidget />
      </div>
    </div>
  );
}

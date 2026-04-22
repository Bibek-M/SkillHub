import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

interface ChatWindowProps {
  receiverId: string;
  receiverName: string;
  onClose: () => void;
}

export default function ChatWindow({ receiverId, receiverName, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      const { messages } = await api.listMessages(receiverId);
      setMessages(messages);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [user, receiverId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return;
    setSending(true);
    try {
      const { message } = await api.sendMessage({
        receiver_id: receiverId,
        message: newMessage.trim(),
      });
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col rounded-xl border border-border bg-card shadow-elevated sm:w-96">
      <div className="flex items-center justify-between gradient-ocean rounded-t-xl px-4 py-3">
        <span className="font-heading text-sm font-semibold text-primary-foreground">{receiverName}</span>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-6 w-6 text-primary-foreground hover:bg-primary/20">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-72 px-4 py-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
              msg.sender_id === user?.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </ScrollArea>
      <div className="flex gap-2 border-t border-border p-3">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="text-sm"
        />
        <Button size="icon" onClick={handleSend} disabled={sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

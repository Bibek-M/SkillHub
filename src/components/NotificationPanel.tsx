import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  message: string;
  created_at: string;
}

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { notifications: data } = await api.listNotifications();
      if (data) {
        setUnread(data.length);
        setNotifications(data);
      }
    };
    fetch();
    const interval = setInterval(async () => {
      const { notifications: latest } = await api.listNotifications();
      setNotifications(prev => {
        const prevTopId = prev[0]?.id;
        const nextTopId = latest[0]?.id;
        if (nextTopId && prevTopId && nextTopId !== prevTopId) {
          setUnread(count => count + 1);
        }
        return latest;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setUnread(0); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center">
              {unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b border-border px-4 py-3">
          <h4 className="font-heading text-sm font-semibold">Notifications</h4>
        </div>
        <ScrollArea className="h-64">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="border-b border-border px-4 py-3 last:border-0">
                <p className="text-sm">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

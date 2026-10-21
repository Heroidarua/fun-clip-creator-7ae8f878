import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useUserStats } from '@/hooks/useUserStats';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationItem = ({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) => {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div
      className={`p-3 border-b border-border last:border-b-0 transition-colors ${
        notification.read ? 'bg-transparent' : 'bg-primary/5'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-medium text-sm text-foreground">{notification.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{timeAgo}</p>
        </div>
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={() => onMarkAsRead(notification.id)}
          >
            <Check className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

const NotificationBell = () => {
  const { isAuthenticated } = useUserStats();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [lastUnreadCount, setLastUnreadCount] = useState(0);

  // Show toast when new notification arrives
  useEffect(() => {
    if (unreadCount > lastUnreadCount && lastUnreadCount > 0) {
      const newestNotification = notifications.find(n => !n.read);
      if (newestNotification) {
        toast.success(newestNotification.title, {
          description: newestNotification.message,
        });
      }
    }
    setLastUnreadCount(unreadCount);
  }, [unreadCount, lastUnreadCount, notifications]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-pixel text-xs text-foreground">NOTIFICAÇÕES</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-3 h-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;

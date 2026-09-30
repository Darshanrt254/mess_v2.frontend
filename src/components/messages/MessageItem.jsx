import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Clock } from 'lucide-react';

export function MessageItem({ message, action }) {
  if (!message) return null;

  return (
    <Card className="hover:border-brand-darkGreen transition-colors">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Avatar name={message.customer} size="sm" />
          <div>
            <span className="text-xs font-black text-brand-darkGreen block">{message.customer}</span>
            <span className="text-[10px] font-bold text-brand-green">{message.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-brand-green flex items-center gap-1">
            <Clock className="w-3 h-3" /> {message.time}
          </span>
          <Badge variant={message.status === 'Unread' ? 'danger' : 'success'} size="sm">
            {message.status}
          </Badge>
        </div>
      </div>
      <p className="text-xs font-bold text-brand-darkGreen/90">{message.text}</p>
      {action && <div className="mt-3 flex justify-end">{action}</div>}
    </Card>
  );
}

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { MessageSquare, Clock, CheckCheck, Eye } from 'lucide-react';
import { useOwnerMessages, useUpdateOwnerMessage } from '@/hooks/useOwner';

export function MessagesPage() {
  const { data: messages = [], isLoading, error } = useOwnerMessages();
  const updateMessageMutation = useUpdateOwnerMessage();

  const [actionError, setActionError] = useState(null);

  const unreadCount = messages.filter((m) => m.status === 'UNREAD').length;

  const handleUpdateStatus = async (messageId, newStatus) => {
    setActionError(null);
    try {
      await updateMessageMutation.mutateAsync({ messageId, status: newStatus });
    } catch (err) {
      setActionError(err.message || 'Failed to update message status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge variant="success" size="sm">Resolved</Badge>;
      case 'READ':
        return <Badge variant="brand" size="sm">Read</Badge>;
      default:
        return <Badge variant="danger" size="sm">Unread</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Kitchen Inquiries"
        subtitle="Incoming customer dietary notes, requests, and meal preferences."
        badge={<Badge variant="brand" size="sm">{unreadCount} Unread</Badge>}
      />

      {actionError && (
        <Alert variant="danger" title="Message Error">
          {actionError}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" title="Error Loading Inquiries">
          {error.message}
        </Alert>
      )}

      {isLoading ? (
        <div className="py-8">
          <LoadingState message="Loading inquiries..." />
        </div>
      ) : messages.length === 0 ? (
        <Card title="No Inquiries" icon={<MessageSquare className="w-5 h-5 text-brand-orange" />}>
          <div className="py-8 text-center text-xs font-bold text-brand-green font-nunito">
            No customer inquiries or notes have been submitted yet.
          </div>
        </Card>
      ) : (
        <div className="space-y-3 font-nunito">
          {messages.map((msg) => (
            <Card key={msg.id} className="transition-all hover:border-brand-darkGreen">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 pb-2 border-b border-brand-orange/20">
                <div className="flex items-center gap-2.5">
                  <Avatar name={msg.customerProfile?.name || 'Customer'} size="sm" />
                  <div>
                    <span className="text-sm font-black text-brand-darkGreen block leading-tight">
                      {msg.customerProfile?.name || 'Customer'}
                    </span>
                    <span className="text-xs font-bold text-brand-green">
                      {msg.customerProfile?.phone || ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-green flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(msg.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {getStatusBadge(msg.status)}
                </div>
              </div>

              <p className="text-sm font-bold text-brand-darkGreen/90 py-1">
                &quot;{msg.content}&quot;
              </p>

              <div className="flex justify-end gap-2 mt-3">
                {msg.status === 'UNREAD' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(msg.id, 'READ')}
                    disabled={updateMessageMutation.isPending}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Mark as Read
                  </Button>
                )}
                {msg.status !== 'RESOLVED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(msg.id, 'RESOLVED')}
                    disabled={updateMessageMutation.isPending}
                    leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { MessageSquare, Send, Clock, User, CheckCircle2 } from 'lucide-react';
import { useCustomerMessages, useSendCustomerMessage } from '@/hooks/useCustomer';

export function MessagesPage() {
  const { data: messages = [], isLoading, error } = useCustomerMessages();
  const sendMessageMutation = useSendCustomerMessage();

  const [note, setNote] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitError(null);

    try {
      await sendMessageMutation.mutateAsync({ content: note.trim() });
      setNote('');
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 4000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit message');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge variant="success" size="sm">Resolved</Badge>;
      case 'READ':
        return <Badge variant="brand" size="sm">Read by Staff</Badge>;
      default:
        return <Badge variant="warning" size="sm">Unread</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages & Requests"
        subtitle="Direct channel to Swayamsiddha kitchen management."
        badge={<Badge variant="brand" size="sm">Kitchen Support</Badge>}
      />

      {submitError && (
        <Alert variant="danger" title="Message Error">
          {submitError}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" title="Error Loading Messages">
          {error.message}
        </Alert>
      )}

      {/* Send Message Card */}
      <Card
        title="Send a Note to Kitchen"
        subtitle="Special dietary requests, delay notifications, or general feedback"
        icon={<MessageSquare className="w-5 h-5 text-brand-orange" />}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {successNotice && (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-brand-sm text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your message has been sent to kitchen staff.</span>
            </div>
          )}
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your message here (e.g. Please pack less spice in today's sabzi)..."
            className="w-full bg-brand-cream border-2.5 border-brand-orange rounded-brand-sm p-3.5 text-sm font-bold text-brand-darkGreen placeholder:text-brand-darkGreen/40 outline-none focus:ring-2 focus:ring-brand-orange/30 font-nunito"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={sendMessageMutation.isPending || !note.trim()}
              rightIcon={<Send className="w-4 h-4" />}
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Submit Note'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Conversation Thread / History */}
      <Card
        title="Message History"
        subtitle="Previous communication with the mess team"
        icon={<Clock className="w-5 h-5 text-brand-orange" />}
      >
        {isLoading ? (
          <div className="py-6">
            <LoadingState message="Loading your message history..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-brand-green font-nunito">
            No messages sent yet. Submit your first note above!
          </div>
        ) : (
          <div className="space-y-3 font-nunito">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-brand-sm bg-brand-creamLight border border-brand-orange/30"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-brand-darkGreen flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-green" /> You
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-green">
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
                <div className="mt-2 py-2 px-3 bg-white/70 rounded-brand-sm border border-brand-orange/20">
                  <p className="text-xs font-bold text-brand-darkGreen leading-relaxed whitespace-pre-wrap">
                    &ldquo;{msg.message || msg.content || ''}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

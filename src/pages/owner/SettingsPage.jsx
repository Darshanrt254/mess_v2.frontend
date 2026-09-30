import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import { Settings, Clock, Shield, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { useOwnerAutomationStatus } from '@/hooks/useOwner';

export function SettingsPage() {
  const { data: automationData, isLoading, error } = useOwnerAutomationStatus();

  const jobs = automationData?.jobs || [];
  const isConfigured = automationData?.configured || false;
  const isActive = automationData?.active || false;

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState message="Loading scheduler status..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Settings & Automation"
        subtitle="Backend scheduler status, automation configuration, and system health."
        badge={
          <Badge variant={isActive ? 'success' : 'warning'} size="sm">
            {isActive ? 'Scheduler Active' : 'Scheduler Inactive'}
          </Badge>
        }
      />

      {error && (
        <Alert variant="danger" title="Error Loading Scheduler Status">
          {error.message}
        </Alert>
      )}

      {/* Scheduler Status Card */}
      <Card
        title="Daily Automation Scheduler"
        subtitle="Asia/Kolkata timezone • 4:00 PM Lunch Finalization • 11:00 PM Dinner Finalization"
        icon={<Activity className="w-5 h-5 text-brand-orange" />}
        action={
          <Badge variant={isActive ? 'success' : 'danger'} size="sm">
            {isActive ? 'Running' : 'Stopped'}
          </Badge>
        }
      >
        <div className="space-y-4 font-nunito">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-brand-creamLight rounded-brand-sm border border-brand-orange/30">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-green flex items-center gap-1">
                <Shield className="w-3 h-3" /> Configured
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {isConfigured
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  : <XCircle className="w-4 h-4 text-red-500" />
                }
                <span className={`text-sm font-black ${isConfigured ? 'text-emerald-700' : 'text-red-600'}`}>
                  {isConfigured ? 'Fully Configured' : 'Not Configured'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-brand-creamLight rounded-brand-sm border border-brand-orange/30">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-green flex items-center gap-1">
                <Clock className="w-3 h-3" /> Status
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {isActive
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  : <XCircle className="w-4 h-4 text-red-500" />
                }
                <span className={`text-sm font-black ${isActive ? 'text-emerald-700' : 'text-red-600'}`}>
                  {isActive ? 'Active & Running' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Job Details */}
          {jobs.length > 0 && (
            <div>
              <h4 className="text-xs font-black text-brand-green uppercase tracking-wider mb-2">
                Scheduled Jobs
              </h4>
              <div className="space-y-2">
                {jobs.map((job, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-brand-sm border border-brand-orange/30 bg-white flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-black text-brand-darkGreen block">{job.name}</span>
                      <span className="text-[11px] font-bold text-brand-green">
                        Schedule: {job.cronExpression || job.schedule || 'N/A'}
                      </span>
                      {job.nextRun && (
                        <span className="text-[10px] text-brand-green block">
                          Next run: {new Date(job.nextRun).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <Badge variant={job.running ? 'success' : 'neutral'} size="sm">
                      {job.running ? 'Active' : 'Idle'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {jobs.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-brand-sm text-sm font-bold text-amber-900 font-nunito">
              No scheduled jobs are currently registered. The scheduler may not be running in development mode.
            </div>
          )}
        </div>
      </Card>

      {/* Operational Settings Info Card */}
      <Card
        title="Business Rules & Configuration"
        subtitle="These values are enforced server-side in Asia/Kolkata timezone"
        icon={<Settings className="w-5 h-5 text-brand-orange" />}
      >
        <div className="space-y-3 font-nunito">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
            {[
              { label: 'Lunch Attendance Cutoff', value: '10:30 AM IST', icon: <Clock className="w-3.5 h-3.5" /> },
              { label: 'Dinner Attendance Cutoff', value: '05:30 PM IST', icon: <Clock className="w-3.5 h-3.5" /> },
              { label: 'Lunch Finalization (Auto)', value: '4:00 PM IST', icon: <Activity className="w-3.5 h-3.5" /> },
              { label: 'Dinner Finalization (Auto)', value: '11:00 PM IST', icon: <Activity className="w-3.5 h-3.5" /> },
              { label: 'Saturday Schedule', value: 'Lunch only, Restaurant', icon: <Settings className="w-3.5 h-3.5" /> },
              { label: 'Sunday Schedule', value: 'Lunch only, no dinner', icon: <Settings className="w-3.5 h-3.5" /> },
              { label: 'Low Balance Threshold', value: '≤ 5 Tiffins', icon: <Shield className="w-3.5 h-3.5" /> },
              { label: 'Auto-Suspend on 0 Balance', value: 'PAYMENT_SUSPENDED', icon: <Shield className="w-3.5 h-3.5" /> },
            ].map((item, i) => (
              <div
                key={i}
                className="p-3 bg-brand-creamLight rounded-brand-sm border border-brand-orange/30 flex items-start gap-2"
              >
                <span className="text-brand-orange mt-0.5 shrink-0">{item.icon}</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-green block">{item.label}</span>
                  <span className="text-brand-darkGreen font-black">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-brand-green font-bold">
            These rules are hardcoded in the backend service layer. Contact the development team to change operational parameters.
          </p>
        </div>
      </Card>
    </div>
  );
}

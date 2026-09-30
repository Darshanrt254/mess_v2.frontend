import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  CalendarCheck,
  Search,
  Check,
  X,
  Ticket,
} from 'lucide-react';
import {
  useOwnerAttendance,
  useUpdateOwnerAttendance,
  useGenerateMealToken,
} from '@/hooks/useOwner';

export function AttendancePage() {
  const [selectedMeal, setSelectedMeal] = useState('LUNCH'); // 'LUNCH' | 'DINNER'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const { data: attendanceList = [], isLoading, error } = useOwnerAttendance({ mealType: selectedMeal });

  const updateAttendanceMutation = useUpdateOwnerAttendance();
  const generateTokenMutation = useGenerateMealToken();

  const filtered = attendanceList.filter((r) => {
    const custName = r.customer?.name || '';
    const custPhone = r.customer?.phone || '';
    return custName.toLowerCase().includes(searchTerm.toLowerCase()) || custPhone.includes(searchTerm);
  });

  const totalCount = attendanceList.length;
  const presentCount = attendanceList.filter((r) => r.status === 'PRESENT').length;
  const absentCount = attendanceList.filter((r) => r.status === 'ABSENT').length;
  const unmarkedCount = attendanceList.filter((r) => r.status === 'UNMARKED').length;

  const handleQuickMark = async (attendanceId, status) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await updateAttendanceMutation.mutateAsync({
        attendanceId,
        status,
        location: status === 'PRESENT' && selectedMeal === 'LUNCH' ? 'RESTAURANT' : undefined,
      });
      setActionSuccess(`Attendance updated to ${status}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to update attendance');
    }
  };

  const handleGenerateToken = async (attendanceId) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await generateTokenMutation.mutateAsync(attendanceId);
      const tokenStr = res?.mealToken?.tokenString || res?.tokenString || 'Generated';
      setActionSuccess(`Meal token created: ${tokenStr}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to generate token');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meal Attendance Management"
        subtitle="Daily meal verification, present/absent counters, and manual overrides."
      />

      {actionError && (
        <Alert variant="danger" title="Attendance Error">
          {actionError}
        </Alert>
      )}

      {actionSuccess && (
        <Alert variant="success" title="Success">
          {actionSuccess}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" title="Error Loading Attendance">
          {error.message}
        </Alert>
      )}

      {/* Meal Selection Tabs */}
      <div className="flex gap-2">
        <Button
          variant={selectedMeal === 'LUNCH' ? 'yellow' : 'outline'}
          size="sm"
          onClick={() => setSelectedMeal('LUNCH')}
        >
          Lunch Attendance (10:30 AM Cutoff)
        </Button>
        <Button
          variant={selectedMeal === 'DINNER' ? 'yellow' : 'outline'}
          size="sm"
          onClick={() => setSelectedMeal('DINNER')}
        >
          Dinner Attendance (05:30 PM Cutoff)
        </Button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Expected" value={totalCount} variant="default" />
        <StatCard label="Present" value={presentCount} variant="green" />
        <StatCard label="Absent" value={absentCount} variant="yellow" />
        <StatCard label="Unmarked" value={unmarkedCount} variant="default" />
      </div>

      {/* Attendance Roster Table */}
      <Card
        title={`${selectedMeal} Attendance Roster`}
        icon={<CalendarCheck className="w-5 h-5 text-brand-orange" />}
        action={
          <div className="w-64">
            <Input
              placeholder="Search customer by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="py-1.5 text-xs"
            />
          </div>
        }
      >
        {isLoading ? (
          <div className="py-8">
            <LoadingState message="Loading attendance records..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-brand-green font-nunito">
            No attendance records found for {selectedMeal}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-nunito border-collapse">
              <thead>
                <tr className="border-b-2 border-brand-orange/30 text-xs font-black uppercase text-brand-green tracking-wider">
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Token</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-orange/20 text-sm font-bold">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-brand-yellow/10 transition-colors">
                    <td className="py-3 px-3">
                      <span className="block font-black text-brand-darkGreen">{row.customer?.name || 'Customer'}</span>
                      <span className="text-xs text-brand-green">{row.customer?.phone || ''} • Bal: {row.customer?.remainingTiffins ?? 0}</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          row.status === 'PRESENT'
                            ? 'success'
                            : row.status === 'ABSENT'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-xs text-brand-green">
                      {row.location || (row.status === 'PRESENT' ? 'Pending Vote' : '—')}
                    </td>
                    <td className="py-3 px-3">
                      {row.mealToken ? (
                        <span className="font-mono text-xs font-black text-brand-darkGreen bg-brand-yellow/30 px-2 py-0.5 rounded border border-brand-orange/40">
                          {row.mealToken.tokenString || `#${row.mealToken.counterNumber}`}
                        </span>
                      ) : row.status === 'PRESENT' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateToken(row.id)}
                          disabled={generateTokenMutation.isPending}
                          leftIcon={<Ticket className="w-3.5 h-3.5" />}
                        >
                          Generate Token
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleQuickMark(row.id, 'PRESENT')}
                          disabled={updateAttendanceMutation.isPending || row.mealToken !== null}
                          title="Mark Present"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleQuickMark(row.id, 'ABSENT')}
                          disabled={updateAttendanceMutation.isPending || row.mealToken !== null}
                          title="Mark Absent"
                        >
                          <X className="w-3.5 h-3.5 text-rose-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

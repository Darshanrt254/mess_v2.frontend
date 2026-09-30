import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

/**
 * Owner Customers list
 */
export function useOwnerCustomers(params = {}) {
  const queryStr = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ).toString();

  const endpoint = `/owner/customers${queryStr ? `?${queryStr}` : ''}`;

  return useQuery({
    queryKey: ['ownerCustomers', params],
    queryFn: async () => {
      const data = await api.get(endpoint);
      return data;
    },
  });
}

/**
 * Owner single customer details
 */
export function useOwnerCustomerDetail(customerId) {
  return useQuery({
    queryKey: ['ownerCustomer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const data = await api.get(`/owner/customers/${customerId}`);
      return data?.customer || null;
    },
    enabled: Boolean(customerId),
  });
}

/**
 * Create customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      return await api.post('/owner/customers', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Update customer details
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, ...payload }) => {
      return await api.patch(`/owner/customers/${customerId}`, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ownerCustomer', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['ownerCustomers'] });
    },
  });
}

/**
 * Owner Attendance List
 */
export function useOwnerAttendance(params = {}) {
  const queryStr = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ).toString();

  const endpoint = `/owner/attendance${queryStr ? `?${queryStr}` : ''}`;

  return useQuery({
    queryKey: ['ownerAttendance', params],
    queryFn: async () => {
      const data = await api.get(endpoint);
      return data?.attendance || data?.attendances || [];
    },
  });
}

/**
 * Update attendance record (status, location, notes)
 */
export function useUpdateOwnerAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attendanceId, ...payload }) => {
      return await api.patch(`/owner/attendance/${attendanceId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Generate meal token for attendance record
 */
export function useGenerateMealToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendanceId) => {
      return await api.post(`/owner/meal-tokens/${attendanceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['ownerCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Create service suspension
 */
export function useCreateSuspension() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, ...payload }) => {
      return await api.post(`/owner/customers/${customerId}/suspension`, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ownerCustomer', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['ownerCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Fetch customer suspensions
 */
export function useCustomerSuspensions(customerId) {
  return useQuery({
    queryKey: ['ownerCustomerSuspensions', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const data = await api.get(`/owner/customers/${customerId}/suspension`);
      return data?.suspensions || [];
    },
    enabled: Boolean(customerId),
  });
}

/**
 * Unsuspend customer early
 */
export function useUnsuspendCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, suspensionId }) => {
      return await api.patch(`/owner/customers/${customerId}/suspension/${suspensionId}/unsuspend`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ownerCustomer', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['ownerCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Cash recharge for customer
 */
export function useRechargeCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, amount }) => {
      return await api.post(`/owner/customers/${customerId}/recharge`, { amount });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ownerCustomer', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['ownerCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Owner messages list
 */
export function useOwnerMessages() {
  return useQuery({
    queryKey: ['ownerMessages'],
    queryFn: async () => {
      const data = await api.get('/owner/messages');
      return data?.messages || [];
    },
  });
}

/**
 * Update message status (READ or RESOLVED)
 */
export function useUpdateOwnerMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, status }) => {
      return await api.patch(`/owner/messages/${messageId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerMessages'] });
    },
  });
}

/**
 * Owner automation scheduler status
 */
export function useOwnerAutomationStatus() {
  return useQuery({
    queryKey: ['automationStatus'],
    queryFn: async () => {
      return await api.get('/owner/automation/status');
    },
  });
}

/**
 * Finalize lunch manually
 */
export function useFinalizeLunch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await api.post('/owner/automation/finalize-lunch');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['automationStatus'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Finalize dinner manually
 */
export function useFinalizeDinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await api.post('/owner/automation/finalize-dinner');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['automationStatus'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

/**
 * Analytics endpoints
 */
function buildAnalyticsQuery(endpoint, params = {}) {
  const queryStr = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  return `/owner/analytics/${endpoint}${queryStr ? `?${queryStr}` : ''}`;
}

export function useOwnerAnalyticsOverview(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'overview', params],
    queryFn: async () => api.get(buildAnalyticsQuery('overview', params)),
  });
}

export function useOwnerAnalyticsAttendance(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'attendance', params],
    queryFn: async () => api.get(buildAnalyticsQuery('attendance', params)),
  });
}

export function useOwnerAnalyticsLocations(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'locations', params],
    queryFn: async () => api.get(buildAnalyticsQuery('locations', params)),
  });
}

export function useOwnerAnalyticsMeals(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'meals', params],
    queryFn: async () => api.get(buildAnalyticsQuery('meals', params)),
  });
}

export function useOwnerAnalyticsTiffins(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'tiffins', params],
    queryFn: async () => api.get(buildAnalyticsQuery('tiffins', params)),
  });
}

export function useOwnerAnalyticsBalances() {
  return useQuery({
    queryKey: ['analytics', 'balances'],
    queryFn: async () => api.get('/owner/analytics/balances'),
  });
}

export function useOwnerAnalyticsCustomerStatus() {
  return useQuery({
    queryKey: ['analytics', 'customerStatus'],
    queryFn: async () => api.get('/owner/analytics/customer-status'),
  });
}

export function useOwnerAnalyticsSuspensions(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'suspensions', params],
    queryFn: async () => api.get(buildAnalyticsQuery('suspensions', params)),
  });
}

export function useOwnerAnalyticsPolls(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'polls', params],
    queryFn: async () => api.get(buildAnalyticsQuery('polls', params)),
  });
}

export function useOwnerAnalyticsMessages(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'messages', params],
    queryFn: async () => api.get(buildAnalyticsQuery('messages', params)),
  });
}

export function useOwnerAnalyticsTokens(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'tokens', params],
    queryFn: async () => api.get(buildAnalyticsQuery('tokens', params)),
  });
}

export function useOwnerAnalyticsDaily(params = {}) {
  return useQuery({
    queryKey: ['analytics', 'daily', params],
    queryFn: async () => api.get(buildAnalyticsQuery('daily', params)),
  });
}

/**
 * Trigger XLSX file download from server
 */
export async function downloadOwnerExportXlsx({ from, to } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const queryStr = new URLSearchParams(params).toString();
  const endpoint = `/owner/exports/xlsx${queryStr ? `?${queryStr}` : ''}`;

  const { blob, filename } = await api.download(endpoint);
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename || 'swayamsiddha-operational-report.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

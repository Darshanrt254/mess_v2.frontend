import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

/**
 * Hook to fetch current customer profile
 */
export function useCustomerProfile() {
  return useQuery({
    queryKey: ['customer'],
    queryFn: async () => {
      const data = await api.get('/customer/me');
      return data?.customer || null;
    },
  });
}

/**
 * Hook to fetch customer's today meal state
 */
export function useCustomerMealsToday() {
  return useQuery({
    queryKey: ['customerMeals'],
    queryFn: async () => {
      return await api.get('/customer/meals/today');
    },
  });
}

/**
 * Hook to fetch customer's today poll state
 */
export function useCustomerPollToday() {
  return useQuery({
    queryKey: ['customerPoll'],
    queryFn: async () => {
      return await api.get('/customer/poll/today');
    },
  });
}

/**
 * Hook to fetch customer messages
 */
export function useCustomerMessages() {
  return useQuery({
    queryKey: ['customerMessages'],
    queryFn: async () => {
      const data = await api.get('/customer/messages');
      return data?.messages || [];
    },
  });
}

/**
 * Hook to fetch customer attendance history for date range
 */
export function useCustomerAttendanceHistory(params = {}) {
  const queryStr = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ).toString();

  const endpoint = `/customer/attendance/history${queryStr ? `?${queryStr}` : ''}`;

  return useQuery({
    queryKey: ['customerAttendanceHistory', params],
    queryFn: async () => {
      return await api.get(endpoint);
    },
    enabled: Boolean(params.from && params.to),
  });
}

/**
 * Mutation to mark attendance (Lunch or Dinner)
 */
export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mealType, status }) => {
      return await api.post('/customer/attendance', { mealType, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerMeals'] });
      queryClient.invalidateQueries({ queryKey: ['customerPoll'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      queryClient.invalidateQueries({ queryKey: ['customerAttendanceHistory'] });
    },
  });
}

/**
 * Mutation to vote on today's lunch poll
 */
export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ location }) => {
      return await api.post('/customer/poll/vote', { location });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerPoll'] });
      queryClient.invalidateQueries({ queryKey: ['customerMeals'] });
      queryClient.invalidateQueries({ queryKey: ['customerAttendanceHistory'] });
    },
  });
}

/**
 * Mutation to send a customer message
 */
export function useSendCustomerMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const text = typeof payload === 'string' ? payload : (payload?.message || payload?.content || '');
      return await api.post('/customer/messages', { message: text, content: text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerMessages'] });
    },
  });
}


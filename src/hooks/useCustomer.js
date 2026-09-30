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
    },
  });
}

/**
 * Mutation to send a customer message
 */
export function useSendCustomerMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content }) => {
      return await api.post('/customer/messages', { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerMessages'] });
    },
  });
}

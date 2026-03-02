import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

export const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Only retry on network errors, not on 4xx/5xx
        if (error.status >= 400 && error.status < 600) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
};

export const queryClient = new QueryClient(queryConfig);

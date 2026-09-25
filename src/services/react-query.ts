import { QueryClient, focusManager } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';

// React Query tracks focus through a browser API, so on device every `refetchOnWindowFocus`
// is silently inert until AppState is bridged in.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (status: AppStateStatus) =>
    handleFocus(status === 'active'),
  );
  return () => subscription.remove();
});

const queryClient = new QueryClient({
  defaultOptions: {
    // Bridging focus above would otherwise refetch every screen's data on each return to
    // the app — a real cost on venue wifi. Queries that want it opt in individually.
    queries: { refetchOnWindowFocus: false },
  },
});

export { queryClient };

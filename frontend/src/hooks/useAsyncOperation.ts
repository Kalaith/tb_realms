import { useState, useCallback } from 'react';

interface AsyncOperationState {
  loading: boolean;
  error: string | null;
}

interface UseAsyncOperationResult<T> extends AsyncOperationState {
  execute: (operation: () => Promise<T>) => Promise<T>;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for managing async operations with consistent loading and error states
 * Provides a unified pattern for handling loading states across the application
 *
 * @example
 * const { loading, error, execute } = useAsyncOperation();
 *
 * const handleSubmit = async () => {
 *   try {
 *     const result = await execute(() => apiClient.post('/data', formData));
 *     // Handle success
 *   } catch (err) {
 *     // Error is already set in the hook
 *   }
 * };
 */
export const useAsyncOperation = <T = unknown>(): UseAsyncOperationResult<T> => {
  const [state, setState] = useState<AsyncOperationState>({
    loading: false,
    error: null,
  });

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T> => {
    setState({ loading: true, error: null });

    try {
      const result = await operation();
      setState({ loading: false, error: null });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setState({ loading: false, error: errorMessage });
      throw err; // Re-throw to allow caller to handle if needed
    }
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null });
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    execute,
    setError,
    clearError,
    reset,
  };
};

/**
 * Hook for managing multiple async operations independently
 * Useful when you need to track loading states for different operations separately
 *
 * @example
 * const operations = useMultipleAsyncOperations(['save', 'delete', 'fetch']);
 *
 * const handleSave = async () => {
 *   await operations.save.execute(() => saveData());
 * };
 */
export const useMultipleAsyncOperations = <K extends string>(
  keys: readonly K[]
): Record<K, UseAsyncOperationResult<unknown>> => {
  const operations = {} as Record<K, UseAsyncOperationResult<unknown>>;

  keys.forEach(key => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    operations[key] = useAsyncOperation<unknown>();
  });

  return operations;
};

export default useAsyncOperation;

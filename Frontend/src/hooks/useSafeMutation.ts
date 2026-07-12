import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

// Implements optimistic updates and rollback (PRD §12.1)
export function useSafeMutation<TData, TError, TVariables, TContext>(
  queryKey: string[],
  mutationFn: (vars: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (newVar) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      
      // Fallback optimistic update applied in component options if provided
      if (options?.onMutate) {
        return options.onMutate(newVar);
      }
      return { previousData } as any;
    },
    onError: (err, newVar, context: any) => {
      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      console.error('Mutation failed, rolled back changes:', err);
      // Note: Actual toast notification to be implemented in the UI layer
      
      if (options?.onError) options.onError(err, newVar, context);
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey });
      if (options?.onSettled) options.onSettled(data, error, variables, context);
    },
  });
}

import { useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { apiService } from "@/services/api";

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, "queryFn"> {
  endpoint: string;
  dependencies?: Record<string, unknown>;
  autoRefetch?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export function useOptimizedQuery<T = unknown>({
  queryKey,
  endpoint,
  dependencies = {},
  autoRefetch = false,
  staleTime = 5 * 60 * 1000, // 5 minutes par défaut
  cacheTime = 10 * 60 * 1000, // 10 minutes par défaut
  ...options
}: OptimizedQueryOptions<T>) {
  const queryClient = useQueryClient();

  // Créer une clé de requête stable basée sur l'endpoint et les dépendances
  const stableQueryKey = useMemo(() => [
    ...(Array.isArray(queryKey) ? queryKey : [queryKey]),
    endpoint,
    dependencies,
  ], [queryKey, endpoint, dependencies]);

  const queryResult = useQuery({
    queryKey: stableQueryKey,
    queryFn: () => apiService.get<T>(endpoint),
    staleTime,
    gcTime: cacheTime,
    refetchOnWindowFocus: autoRefetch,
    refetchOnMount: autoRefetch,
    ...options,
  });

  // Invalidation intelligente
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: stableQueryKey });
  }, [queryClient, stableQueryKey]);

  // Mise à jour optimiste
  const optimisticUpdate = useCallback(
    (updater: (oldData: T | undefined) => T) => {
      queryClient.setQueryData(stableQueryKey, updater);
    },
    [queryClient, stableQueryKey]
  );

  // Préchargement de données liées
  const prefetchRelated = useCallback(
    (relatedEndpoint: string, relatedKey: unknown[]) => {
      queryClient.prefetchQuery({
        queryKey: relatedKey,
        queryFn: () => apiService.get(relatedEndpoint),
        staleTime,
      });
    },
    [queryClient, staleTime]
  );

  return {
    ...queryResult,
    invalidate,
    optimisticUpdate,
    prefetchRelated,
  };
}
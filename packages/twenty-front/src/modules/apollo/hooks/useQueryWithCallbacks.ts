import {
  NetworkStatus,
  type OperationVariables,
  type TypedDocumentNode,
} from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type UseQueryWithCallbacksOptions<
  TData,
  TVariables extends OperationVariables,
> = useQuery.Options<TData, TVariables> & {
  onFirstLoad?: (data: TData) => void;
  onSubsequentLoad?: (data: TData) => void;
  onDataLoaded?: (data: TData) => void;
  onLoadingChange?: (loading: boolean) => void;
};

export const useQueryWithCallbacks = <
  TData,
  TVariables extends OperationVariables,
>(
  document: TypedDocumentNode<TData, TVariables>,
  options: UseQueryWithCallbacksOptions<TData, TVariables>,
) => {
  const {
    onFirstLoad,
    onSubsequentLoad,
    onDataLoaded,
    onLoadingChange,
    ...queryOptions
  } = options;

  const { networkStatus, data, loading, refetch } = useQuery(document, {
    ...queryOptions,
    notifyOnNetworkStatusChange: true,
  } as useQuery.Options<TData, TVariables>);

  const [hasProcessedCurrentFetchCycle, setHasProcessedCurrentFetchCycle] =
    useState(false);

  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  useEffect(() => {
    if (networkStatus !== NetworkStatus.ready) {
      setHasProcessedCurrentFetchCycle(false);
      return;
    }

    if (!isDefined(data)) {
      return;
    }

    if (hasProcessedCurrentFetchCycle) {
      return;
    }

    setHasProcessedCurrentFetchCycle(true);

    const isFirstLoad = !hasEverLoaded;

    setHasEverLoaded(true);

    const typedData = data as TData;

    onDataLoaded?.(typedData);

    if (isFirstLoad) {
      onFirstLoad?.(typedData);
    } else {
      onSubsequentLoad?.(typedData);
    }
  }, [
    networkStatus,
    data,
    hasProcessedCurrentFetchCycle,
    hasEverLoaded,
    onFirstLoad,
    onSubsequentLoad,
    onDataLoaded,
  ]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  return { refetch };
};

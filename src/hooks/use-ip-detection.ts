/**
 * Custom hook for client-side IP detection with retry logic
 *
 * Features:
 * - Exponential backoff retry (1s, 2s, 4s delays, max 3 retries)
 * - Timeout handling (5 seconds per request)
 * - State management for loading/success/error/retrying
 * - Integration with /api/detect-ip endpoint
 *
 * Based on: specs/001-auto-ip-detection/tasks.md (T033, T034, T037, T038)
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { IPDetectionResult, APIError } from '@/types/ip';

/**
 * Detection state for the hook
 */
export interface UseIPDetectionState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'retrying';
  data: IPDetectionResult | null;
  error: string | null;
  retryCount: number;
  isTimedOut: boolean;
}

/**
 * Return type for useIPDetection hook
 */
export interface UseIPDetectionReturn extends UseIPDetectionState {
  detect: () => Promise<void>;
  retry: () => Promise<void>;
  canRetry: boolean;
}

/**
 * Configuration for retry logic
 */
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000, // 1 second
  REQUEST_TIMEOUT: 5000, // 5 seconds
};

/**
 * Calculates exponential backoff delay
 * @param retryCount - Current retry attempt (0-indexed)
 * @returns Delay in milliseconds
 */
function getRetryDelay(retryCount: number): number {
  // Exponential backoff: 1s, 2s, 4s
  return RETRY_CONFIG.BASE_DELAY * Math.pow(2, retryCount);
}

/**
 * Fetches IP detection result from API with timeout
 */
async function fetchIPDetection(
  signal: AbortSignal
): Promise<IPDetectionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.REQUEST_TIMEOUT);

  try {
    // Create a combined signal that aborts on either timeout or external abort
    const combinedSignal = signal.aborted ? signal : controller.signal;

    const response = await fetch('/api/detect-ip', {
      method: 'GET',
      signal: combinedSignal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Parse error response
      const error: APIError = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data: IPDetectionResult = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Check if request was aborted
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out after 5 seconds');
    }

    throw error;
  }
}

/**
 * Custom hook for IP detection with retry logic
 *
 * @returns Hook state and functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { status, data, error, detect, retry, canRetry } = useIPDetection();
 *
 *   useEffect(() => {
 *     detect();
 *   }, [detect]);
 *
 *   if (status === 'loading') return <div>Detecting...</div>;
 *   if (status === 'error') return <button onClick={retry}>Retry</button>;
 *   if (data) return <div>{data.ip}</div>;
 * }
 * ```
 */
export function useIPDetection(): UseIPDetectionReturn {
  const [state, setState] = useState<UseIPDetectionState>({
    status: 'idle',
    data: null,
    error: null,
    retryCount: 0,
    isTimedOut: false,
  });

  // Abort controller ref to cancel pending requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Performs IP detection with retry logic
   */
  const performDetection = useCallback(
    async (isRetry: boolean = false): Promise<void> => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Update state based on whether this is a retry
        setState((prev) => ({
          ...prev,
          status: isRetry ? 'retrying' : 'loading',
          error: null,
          isTimedOut: false,
        }));

        // Wait for exponential backoff delay if retrying
        if (isRetry && state.retryCount > 0) {
          const delay = getRetryDelay(state.retryCount - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Check if aborted during delay
          if (abortController.signal.aborted) {
            return;
          }
        }

        // Fetch IP detection result
        const data = await fetchIPDetection(abortController.signal);

        // Success!
        setState({
          status: 'success',
          data,
          error: null,
          retryCount: 0,
          isTimedOut: false,
        });
      } catch (error) {
        // Check if request was aborted (component unmounted)
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        const errorMessage = error instanceof Error
          ? error.message
          : 'Unknown error occurred';

        const isTimeout = errorMessage.includes('timed out');

        // Determine if we can auto-retry
        const currentRetryCount = state.retryCount + 1;
        const canAutoRetry = currentRetryCount < RETRY_CONFIG.MAX_RETRIES;

        setState((prev) => ({
          ...prev,
          status: canAutoRetry ? 'retrying' : 'error',
          error: errorMessage,
          retryCount: currentRetryCount,
          isTimedOut: isTimeout,
        }));

        // Auto-retry if we haven't exceeded max retries
        if (canAutoRetry) {
          console.log(
            `[IP Detection] Retry ${currentRetryCount}/${RETRY_CONFIG.MAX_RETRIES} after ${getRetryDelay(currentRetryCount - 1)}ms`
          );
          await performDetection(true);
        } else {
          console.error(
            `[IP Detection] Max retries (${RETRY_CONFIG.MAX_RETRIES}) exceeded`
          );
        }
      }
    },
    [state.retryCount]
  );

  /**
   * Initiates IP detection (resets retry count)
   */
  const detect = useCallback(async (): Promise<void> => {
    setState((prev) => ({
      ...prev,
      retryCount: 0,
    }));
    await performDetection(false);
  }, [performDetection]);

  /**
   * Manually retries IP detection (preserves retry count)
   */
  const retry = useCallback(async (): Promise<void> => {
    await performDetection(true);
  }, [performDetection]);

  /**
   * Determines if manual retry is available
   */
  const canRetry = state.status === 'error' && state.retryCount >= RETRY_CONFIG.MAX_RETRIES;

  return {
    ...state,
    detect,
    retry,
    canRetry,
  };
}

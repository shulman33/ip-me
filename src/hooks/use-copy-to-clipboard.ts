'use client';

/**
 * Custom hook for clipboard copy operations
 * Provides modern Clipboard API with fallback to execCommand for older browsers
 */

import { useState, useCallback } from 'react';

interface UseCopyToClipboardReturn {
  copy: (text: string) => Promise<void>;
  copied: boolean;
  error: string | null;
}

/**
 * Hook for copying text to clipboard with automatic state management
 *
 * Features:
 * - Modern Navigator Clipboard API (Chrome 63+, Firefox 53+, Safari 13.1+)
 * - Fallback to document.execCommand for older browsers
 * - Automatic 2-second reset after successful copy
 * - Clear error messaging when clipboard unavailable
 *
 * @returns Object with copy function, copied state, and error state
 *
 * @example
 * function CopyButton({ text }: { text: string }) {
 *   const { copy, copied, error } = useCopyToClipboard();
 *
 *   return (
 *     <button onClick={() => copy(text)}>
 *       {copied ? 'Copied!' : 'Copy'}
 *       {error && <span>{error}</span>}
 *     </button>
 *   );
 * }
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);
      } else {
        // Fallback to execCommand for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;

        // Make textarea invisible and off-screen
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (!successful) {
            throw new Error('execCommand failed');
          }

          setCopied(true);
          setError(null);
        } finally {
          document.body.removeChild(textArea);
        }
      }

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      setError('Failed to copy. Please copy manually.');
      setCopied(false);
    }
  }, []);

  return { copy, copied, error };
}

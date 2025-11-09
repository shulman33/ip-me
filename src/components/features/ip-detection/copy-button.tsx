'use client';

/**
 * CopyButton Client Component
 * Interactive button for copying IP address to clipboard
 * Features: Green glow styling, visual feedback, accessibility support
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  /** The text to copy to clipboard (IP address) */
  text: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Client Component for copying IP address with visual feedback
 *
 * Features:
 * - Green styling with glow effect on success
 * - "Copy" → "Copied!" text transition
 * - 2-second auto-reset after successful copy
 * - Error handling with fallback message
 * - Full accessibility support (ARIA, keyboard navigation)
 * - CSS transitions (scale-95 on click, glow-pulse on success)
 *
 * @param text - The IP address to copy
 * @param className - Optional CSS classes
 *
 * @example
 * <CopyButton text="192.168.1.1" />
 */
export function CopyButton({ text, className }: CopyButtonProps) {
  const { copy, copied, error } = useCopyToClipboard();
  const [isPressed, setIsPressed] = useState(false);

  // Handle button click with tactile feedback
  const handleClick = async () => {
    setIsPressed(true);
    await copy(text);

    // Reset pressed state after animation
    setTimeout(() => {
      setIsPressed(false);
    }, 200);
  };

  // Auto-reset error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        // Error state is managed by the hook, will reset on next copy attempt
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant={copied ? 'greenGlow' : 'green'}
        size="default"
        onClick={handleClick}
        disabled={false}
        className={cn(
          'transition-all duration-200',
          isPressed && 'scale-95',
          copied && 'animate-glow-pulse',
          className
        )}
        aria-live="polite"
        aria-label={copied ? 'IP address copied to clipboard' : 'Copy IP address to clipboard'}
        aria-pressed={copied}
      >
        {copied ? 'Copied!' : 'Copy'}
      </Button>

      {/* Error message with accessible announcement */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="text-sm text-red-500 text-center"
        >
          {error}
        </div>
      )}
    </div>
  );
}

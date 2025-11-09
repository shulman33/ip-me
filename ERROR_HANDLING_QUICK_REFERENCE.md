# Error Handling Quick Reference for Phase 5 Implementation

## 1. When Creating New API Routes

Follow the pattern from `src/app/api/detect-ip/route.ts`:

```typescript
/**
 * Error creation helper - ALWAYS USE THIS
 */
function createErrorResponse(
  error: string,                           // User-friendly message
  code: string,                            // Machine-readable code
  status: number,                          // HTTP status (400/429/500)
  details?: Record<string, unknown>        // Optional debug info
): NextResponse<APIError> {
  const errorBody: APIError = {
    error,
    code,
    ...(details && { details }),
  };

  const validated = apiErrorSchema.parse(errorBody);
  return NextResponse.json(validated, { status });
}

// Usage:
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Validation errors (early)
    if (invalid) {
      return createErrorResponse(
        'User message here',
        ERROR_CODES.SOME_CODE,
        400,
        { context: 'details' }
      );
    }

    // Process
    const result = await someOperation();

    // Validate response
    const validated = yourSchema.parse(result);
    return NextResponse.json(validated, { status: 200 });
  } catch (error) {
    console.error('[GET /api/your-route] Error:', error);
    
    // Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return createErrorResponse(
        'Failed to validate response',
        'validation_failed',
        500,
        { zodError: error }
      );
    }

    // Generic error
    return createErrorResponse(
      'Service temporarily unavailable',
      'service_unavailable',
      500
    );
  }
}
```

### HTTP Status Codes
- **400**: Invalid input, missing data, validation failures
- **429**: Rate limiting
- **500**: Server errors, API failures, response validation failures

### Error Code Naming
- Use SCREAMING_SNAKE_CASE
- Must be in `ERROR_CODES` constant in `src/types/ip.ts`
- Examples: `INVALID_IP`, `SERVICE_UNAVAILABLE`, `VALIDATION_FAILED`

---

## 2. When Creating New Service/Utility Functions

Follow the pattern from `src/lib/services/geolocation.ts`:

### Pattern A: Graceful Degradation (Preferred for external APIs)
```typescript
async function fetchFromExternalAPI(input: string): Promise<Result> {
  const apiKey = process.env.EXTERNAL_API_KEY;

  // Handle missing optional API key
  if (!apiKey) {
    console.warn('[fetchFromExternalAPI] API key not configured, returning partial data');
    return createPartialResult(input);
  }

  try {
    // Make API call
    const response = await fetch(`https://api.example.com/endpoint?key=${apiKey}`);

    // Check HTTP status
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    // Parse and validate
    const data = await response.json();
    
    // Check API-specific error response
    if (data.error) {
      console.error('[External API Error]', data.error);
      throw new Error(data.error.message || 'API error');
    }

    return transformData(data);
  } catch (error) {
    console.error('[fetchFromExternalAPI] Error:', error);
    // Return partial data instead of throwing
    return createPartialResult(input);
  }
}

// Always return data (partial if errors)
export async function getFullResult(input: string): Promise<Result> {
  try {
    const result = await fetchFromExternalAPI(input);
    return result;
  } catch (error) {
    // Log but don't throw - application should work with partial data
    console.error('[getFullResult] Error:', error);
    return createPartialResult(input);
  }
}
```

### Pattern B: Throw on Error (For critical operations)
```typescript
async function criticalOperation(input: string): Promise<Result> {
  try {
    // Validation
    if (!isValid(input)) {
      throw new Error('Invalid input');
    }

    // Operation
    const result = await perform(input);
    return result;
  } catch (error) {
    console.error('[criticalOperation] Error:', error);
    throw error;  // Let caller handle
  }
}
```

### Cache Error Handling
```typescript
if (redis) {
  try {
    const cached = await redis.get<T>(cacheKey);
    if (cached) {
      console.log(`[Cache HIT] ${key}`);
      return cached;
    }
  } catch (error) {
    console.error('[Cache Error]', error);
    // Continue without cache - don't throw
  }
}

// Fetch fresh data...

if (redis) {
  try {
    await redis.set(cacheKey, result, { ex: TTL });
    console.log(`[Cache SET] ${key}`);
  } catch (error) {
    console.error('[Cache Set Error]', error);
    // Continue without caching - don't throw
  }
}
```

---

## 3. When Creating New Client Hooks

Follow the pattern from `src/hooks/use-ip-detection.ts`:

```typescript
export interface UseMyOperationState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'retrying';
  data: T | null;
  error: string | null;
  retryCount: number;
  isTimedOut: boolean;
}

const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,        // 1 second
  REQUEST_TIMEOUT: 5000,   // 5 seconds
};

function getRetryDelay(retryCount: number): number {
  return RETRY_CONFIG.BASE_DELAY * Math.pow(2, retryCount);
}

async function fetchData(signal: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.REQUEST_TIMEOUT);

  try {
    const response = await fetch('/api/your-endpoint', {
      signal: signal.aborted ? signal : controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error: APIError = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Distinguish timeout from other errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out after 5 seconds');
    }

    throw error;
  }
}

export function useMyOperation(): UseMyOperationReturn {
  const [state, setState] = useState<UseMyOperationState>({
    status: 'idle',
    data: null,
    error: null,
    retryCount: 0,
    isTimedOut: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const performOperation = useCallback(
    async (isRetry: boolean = false): Promise<void> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setState((prev) => ({
          ...prev,
          status: isRetry ? 'retrying' : 'loading',
          error: null,
          isTimedOut: false,
        }));

        // Wait for backoff delay if retrying
        if (isRetry && state.retryCount > 0) {
          const delay = getRetryDelay(state.retryCount - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));

          if (abortController.signal.aborted) {
            return;
          }
        }

        // Fetch data
        const data = await fetchData(abortController.signal);

        setState({
          status: 'success',
          data,
          error: null,
          retryCount: 0,
          isTimedOut: false,
        });
      } catch (error) {
        // Component unmounted
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        const errorMessage = error instanceof Error
          ? error.message
          : 'Unknown error occurred';

        const isTimeout = errorMessage.includes('timed out');
        const currentRetryCount = state.retryCount + 1;
        const canAutoRetry = currentRetryCount < RETRY_CONFIG.MAX_RETRIES;

        setState((prev) => ({
          ...prev,
          status: canAutoRetry ? 'retrying' : 'error',
          error: errorMessage,
          retryCount: currentRetryCount,
          isTimedOut: isTimeout,
        }));

        // Auto-retry if possible
        if (canAutoRetry) {
          console.log(
            `[Operation] Retry ${currentRetryCount}/${RETRY_CONFIG.MAX_RETRIES} after ${getRetryDelay(currentRetryCount - 1)}ms`
          );
          await performOperation(true);
        } else {
          console.error(
            `[Operation] Max retries (${RETRY_CONFIG.MAX_RETRIES}) exceeded`
          );
        }
      }
    },
    [state.retryCount]
  );

  const perform = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, retryCount: 0 }));
    await performOperation(false);
  }, [performOperation]);

  const retry = useCallback(async (): Promise<void> => {
    await performOperation(true);
  }, [performOperation]);

  const canRetry = state.status === 'error' && state.retryCount >= RETRY_CONFIG.MAX_RETRIES;

  return { ...state, perform, retry, canRetry };
}
```

### Key Hook Principles
- Use state machine: `idle` → `loading` → `success/error/retrying`
- Separate concerns: `status`, `data`, `error`, `retryCount`, `isTimedOut`
- Auto-retry with exponential backoff (max 3 times)
- Distinguish timeouts from other errors with separate flag
- Cleanup pending requests on unmount
- Manual retry after auto-retries exhausted
- Log retry attempts with timing info

---

## 4. When Creating New UI Components

Follow patterns from `src/components/features/ip-detection/ip-detection-client.tsx`:

### Error State UI
```typescript
if (status === 'error') {
  return (
    <div className="rounded-lg border border-red-500/20 px-8 py-6">
      {/* Error icon + heading */}
      <div className="flex items-center gap-2">
        <svg className="h-6 w-6 text-red-500">
          {/* Error icon SVG */}
        </svg>
        <p className="text-lg text-red-500 font-medium">Detection Failed</p>
      </div>

      {/* User message */}
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {isTimedOut
          ? 'Detection timed out after 5 seconds. Check your network.'
          : error || 'Unable to detect IP'}
      </p>

      {/* Retry button - only if can retry */}
      {canRetry && (
        <Button onClick={() => retry()} variant="outline">
          Try Again
        </Button>
      )}

      {/* Error indicator */}
      {retryCount >= 3 && (
        <p className="text-xs text-red-500/70">
          Maximum retry attempts (3) exceeded
        </p>
      )}
    </div>
  );
}
```

### Retrying State UI
```typescript
if (status === 'retrying') {
  const retryDelay = retryCount > 0 ? Math.pow(2, retryCount - 1) : 1;

  return (
    <div className="rounded-lg border border-yellow-500/20 px-8 py-6">
      {/* Retrying indicator - use yellow not red */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-yellow-500 rounded-full animate-pulse" />
        <p className="text-lg text-yellow-500 font-medium">Retrying...</p>
      </div>

      {/* Retry information */}
      <p className="text-sm text-muted-foreground">
        {isTimedOut
          ? 'Detection in progress... (Previous attempt timed out)'
          : `Attempt ${retryCount} of 3`}
      </p>

      {/* Show delay if applicable */}
      {retryCount > 1 && (
        <p className="text-xs text-muted-foreground">
          Waiting {retryDelay}s before next attempt
        </p>
      )}
    </div>
  );
}
```

### Loading State UI
```typescript
if (status === 'loading' || status === 'idle') {
  return (
    <div className="rounded-lg bg-background border border-border px-8 py-6">
      {/* Loading skeleton */}
      <div className="h-12 w-48 bg-muted animate-pulse rounded" />
      <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
      <p className="text-sm text-muted-foreground">
        Detecting your data...
      </p>
    </div>
  );
}
```

### Color Scheme
- **Loading**: Gray/muted with pulsing animation
- **Retrying**: Yellow (warning, not critical)
- **Error**: Red (destructive)
- **Success**: Green accents

---

## 5. When Writing Zod Schemas

Follow the pattern from `src/lib/validations/ip-schema.ts`:

```typescript
import { z } from 'zod';

// Simple validation helpers
export const ipSchema = z.string().ip();

export const ipAddressSchema = z.object({
  value: ipSchema,
  version: z.enum(['IPv4', 'IPv6']),
  isValid: z.boolean(),
});

// Complex validation
export const detectionStateSchema = z.object({
  status: z.enum(['idle', 'loading', 'success', 'error', 'retrying']),
  error: z.string().nullable(),
  retryCount: z.number().int().min(0).max(3),
  lastAttempt: z.date().nullable(),
});

// API response validation
export const apiResponseSchema = z.object({
  data: z.unknown(),
  success: z.boolean(),
  message: z.string().optional(),
});

// Error response validation
export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
});

// Safe validation helpers
export function validateIP(ip: string): boolean {
  return ipSchema.safeParse(ip).success;
}

// Type inference
export type IPAddress = z.infer<typeof ipAddressSchema>;
export type APIError = z.infer<typeof apiErrorSchema>;
```

### When to Use parse() vs safeParse()
- **parse()**: Use in API routes where validation errors should throw (caught by error handler)
- **safeParse()**: Use in validation functions that return boolean/result

---

## 6. Error Code Management

### Adding New Error Codes

Update `src/types/ip.ts`:
```typescript
export const ERROR_CODES = {
  // Existing codes...
  INVALID_IP: 'invalid_ip',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  
  // New codes - follow pattern
  GEOLOCATION_FAILED: 'geolocation_failed',
  CACHE_ERROR: 'cache_error',
  EXTERNAL_API_ERROR: 'external_api_error',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
```

### Using Error Codes
```typescript
// API route
return createErrorResponse(
  'Geolocation lookup failed',
  ERROR_CODES.GEOLOCATION_FAILED,
  500
);
```

---

## 7. Logging Best Practices

### Server-Side
```typescript
// Info logs with context
console.log('[GET /api/detect-ip] Cache HIT for IP:', ip);

// Error logs with details
console.error('[IPstack API] Error:', error);
console.error('[Redis Error] Failed to get cache key:', cacheKey, error);

// Pattern: [CONTEXT] Message: data
```

### Client-Side
```typescript
// Retry attempts with timing
console.log(`[IP Detection] Retry 2/3 after 2000ms`);

// Errors
console.error('[IP Detection] Max retries exceeded:', error);
```

---

## 8. Type Safety Checklist

When implementing Phase 5, ensure:

- [ ] All API errors use standardized `APIError` type
- [ ] All hooks return `UseYourStateReturn` interface
- [ ] All state managed with clear `status` values: `idle | loading | success | error | retrying`
- [ ] Validation with Zod for all inputs and outputs
- [ ] Timeout detection with `isTimedOut` flag
- [ ] Retry count tracking
- [ ] HTTP status codes match error type
- [ ] Error codes defined in `ERROR_CODES` constant
- [ ] Graceful degradation for external APIs
- [ ] Cleanup on component unmount (AbortController)

---

## Files to Reference

1. **Error Boundary Template**: `src/app/error.tsx`
2. **API Route Template**: `src/app/api/detect-ip/route.ts`
3. **Service Template**: `src/lib/services/geolocation.ts`
4. **Hook Template**: `src/hooks/use-ip-detection.ts`
5. **Component Template**: `src/components/features/ip-detection/ip-detection-client.tsx`
6. **Types/Codes**: `src/types/ip.ts`
7. **Validation**: `src/lib/validations/ip-schema.ts`

For complete details, see: `ERROR_HANDLING_PATTERNS.md`

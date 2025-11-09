# Error Handling Documentation Index

This directory contains comprehensive documentation of the error handling patterns used throughout the ip-me codebase. Use these guides to ensure Phase 5 implementation remains consistent with existing patterns.

## Documents Overview

### 1. PHASE_5_ERROR_HANDLING_GUIDELINES.md (Start Here)
**Best for:** Quick orientation and implementation checklist
**Contains:**
- Key architectural principles for Phase 5
- Implementation checklists for different component types
- Common mistakes to avoid
- Testing scenarios
- Quick copy-paste patterns

**Read this first if:** You're starting Phase 5 implementation
**Time to read:** 10-15 minutes

### 2. ERROR_HANDLING_QUICK_REFERENCE.md (During Implementation)
**Best for:** Quick lookups while coding
**Contains:**
- When creating new API routes
- When creating new service functions
- When creating new client hooks
- When creating new UI components
- When writing Zod schemas
- Error code management
- Logging best practices
- Type safety checklist

**Read this when:** You're actively implementing a specific component type
**Time to read:** 5 minutes per section

### 3. ERROR_HANDLING_PATTERNS.md (Deep Dive)
**Best for:** Understanding the complete error handling architecture
**Contains:**
- Detailed analysis of 9 error handling layers
- Error boundary architecture
- API route error handling patterns
- Service layer error handling
- Client-side hook error handling
- UI component error display patterns
- Error codes and categorization
- Validation with Zod patterns
- Logging patterns
- Complete error flow diagram

**Read this when:** You need to understand why patterns exist or design new error scenarios
**Time to read:** 30-45 minutes

## Document Relationship

```
PHASE_5_ERROR_HANDLING_GUIDELINES.md (Orientation)
    ↓
    ├─→ Need quick code patterns?
    │   └─→ ERROR_HANDLING_QUICK_REFERENCE.md
    │
    └─→ Need to understand architecture?
        └─→ ERROR_HANDLING_PATTERNS.md (Full analysis)
```

## Quick Navigation

### By Component Type

**Creating an API Route:**
1. Read: PHASE_5_ERROR_HANDLING_GUIDELINES.md → "For New API Routes"
2. Reference: ERROR_HANDLING_QUICK_REFERENCE.md → "When Creating New API Routes"
3. Example: src/app/api/detect-ip/route.ts

**Creating a Service Function:**
1. Read: PHASE_5_ERROR_HANDLING_GUIDELINES.md → "For New Service Functions"
2. Reference: ERROR_HANDLING_QUICK_REFERENCE.md → "When Creating New Service Functions"
3. Example: src/lib/services/geolocation.ts

**Creating a Client Hook:**
1. Read: PHASE_5_ERROR_HANDLING_GUIDELINES.md → "For New Client Hooks"
2. Reference: ERROR_HANDLING_QUICK_REFERENCE.md → "When Creating New Client Hooks"
3. Example: src/hooks/use-ip-detection.ts

**Creating a UI Component:**
1. Read: PHASE_5_ERROR_HANDLING_GUIDELINES.md → "For New UI Components"
2. Reference: ERROR_HANDLING_QUICK_REFERENCE.md → "When Creating New UI Components"
3. Example: src/components/features/ip-detection/ip-detection-client.tsx

**Writing Validation Schemas:**
1. Read: PHASE_5_ERROR_HANDLING_GUIDELINES.md → "For New Validation Schemas"
2. Reference: ERROR_HANDLING_QUICK_REFERENCE.md → "When Writing Zod Schemas"
3. Example: src/lib/validations/ip-schema.ts

### By Problem

**"I don't know how to start implementing Phase 5"**
→ Read: PHASE_5_ERROR_HANDLING_GUIDELINES.md (Executive Summary + Key Principles)

**"I need code to copy"**
→ Read: PHASE_5_ERROR_HANDLING_GUIDELINES.md (Specific Patterns to Copy)
→ Use: ERROR_HANDLING_QUICK_REFERENCE.md (for your component type)

**"I want to understand why patterns exist"**
→ Read: ERROR_HANDLING_PATTERNS.md (Full analysis of each layer)

**"I made a mistake, what should I avoid?"**
→ Read: PHASE_5_ERROR_HANDLING_GUIDELINES.md (Common Mistakes section)

**"I need logging format"**
→ Read: ERROR_HANDLING_QUICK_REFERENCE.md → "Logging best practices"
→ Or: ERROR_HANDLING_PATTERNS.md → Section 9 (Logging Patterns)

**"I need to test error scenarios"**
→ Read: PHASE_5_ERROR_HANDLING_GUIDELINES.md → "Testing Error Scenarios"

**"I'm unsure about error codes"**
→ Read: ERROR_HANDLING_QUICK_REFERENCE.md → "Error Code Management"
→ Or: ERROR_HANDLING_PATTERNS.md → Section 7 (Error Codes & Categorization)

**"I need validation schema help"**
→ Read: ERROR_HANDLING_QUICK_REFERENCE.md → "When Writing Zod Schemas"
→ Or: ERROR_HANDLING_PATTERNS.md → Section 8 (Validation with Zod)

## Key Concepts Reference

### State Machine
Every async operation must use:
```
idle → loading → success
       ↓
       retrying → (success or error)
       ↓
       error (after max retries)
```

### HTTP Status Codes
- **400**: Invalid input, missing data
- **429**: Rate limiting
- **500**: Server errors, API failures

### Error Response Format
```typescript
{
  error: string,                      // User message
  code: string,                       // Error code
  details?: Record<string, unknown>   // Debug info
}
```

### Retry Configuration
- **Max Retries**: 3
- **Base Delay**: 1 second
- **Backoff**: Exponential (1s, 2s, 4s)
- **Request Timeout**: 5 seconds per attempt

### UI State Colors
- **Loading**: Gray with pulsing animation
- **Retrying**: Yellow warning
- **Error**: Red destructive
- **Success**: Green accents

## File References

All examples in these documents reference actual codebase files:

- **Error Boundary**: `/Users/samshulman/Coding/My-Software-Projects/ip-me/src/app/error.tsx`
- **API Route**: `/Users/samshulman/Coding/My-Software-Projects/ip-me/src/app/api/detect-ip/route.ts`
- **Service**: `/Users/samshulman/Coding/My-Software-Projects/ip-me/src/lib/services/geolocation.ts`
- **Hook**: `/Users/samshulman/Coding/My-Software-Projects/ip-me/src/hooks/use-ip-detection.ts`
- **UI Component**: `/Users/samshulman/Coding/My-Software-Projects/ip-me/src/components/features/ip-detection/ip-detection-client.tsx`
- **Error UI**: `/Users/samshulman/Coding/My-Software-Projects/ip-me/src/components/features/geolocation/geolocation-error.tsx`
- **Types**: `/Users/samshulman/Coding/My-Software-Projects/ip-me/src/types/ip.ts`
- **Validation**: `/Users/samshulman/Coding/My-Software-Projects/ip-me/src/lib/validations/ip-schema.ts`

## Implementation Checklist

Before starting Phase 5, ensure you've:

- [ ] Read PHASE_5_ERROR_HANDLING_GUIDELINES.md
- [ ] Understood the state machine concept
- [ ] Identified which component types Phase 5 will need
- [ ] Bookmarked the appropriate sections in ERROR_HANDLING_QUICK_REFERENCE.md
- [ ] Reviewed example files in codebase
- [ ] Understood HTTP status code requirements
- [ ] Planned error codes for Phase 5 features

## Important Principles (Remember These!)

1. **Graceful Degradation** - External APIs should never crash the app
2. **User-Friendly Messages** - No technical jargon for users
3. **Clear State Management** - Use state machine with separate state concerns
4. **Automatic Retry** - 3 retries with exponential backoff
5. **Type Safety** - Validate all inputs and outputs with Zod
6. **Contextual Logging** - Include module/function name in all logs
7. **Consistency** - Copy existing patterns, don't invent new ones

## Getting Help

If you're stuck:
1. Check "Quick Navigation → By Problem" above
2. Search documents for keywords (error, timeout, retry, state)
3. Look at referenced example files in codebase
4. Review "Common Mistakes to Avoid" section
5. Check existing Phase 1-2 implementation for similar patterns

Remember: **When in doubt, look at existing code first!**


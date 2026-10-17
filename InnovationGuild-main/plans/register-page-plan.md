# Plan: Refine Register Page for API Integration

## Overview
Prepare the Register page for production-ready API integration by adding validation, error handling, loading states, accessibility improvements, and service layer structure. This sets up the foundation so that when the backend is ready, we only need to swap mock responses with real API calls.

## Current State Analysis

### Existing Files
- [src/pages/common/Register/RegisterPage.jsx](src/pages/common/Register/RegisterPage.jsx) - Main registration flow (3 steps)
- [src/pages/common/Register/_components/RegistrationForm.jsx](src/pages/common/Register/_components/RegistrationForm.jsx) - Email/OTP form
- [src/pages/common/Register/_components/GeneralUserProfileForm.jsx](src/pages/common/Register/_components/GeneralUserProfileForm.jsx) - Profile form
- Similar profile forms for VLE, Innovator, AO, NO roles

### Critical Issues Identified
1. ❌ No form validation (accepts any input)
2. ❌ No error handling or error states
3. ❌ No loading states during operations
4. ❌ No API integration (just UI flow)
5. ❌ Poor input types (text instead of tel/email/number)
6. ❌ No accessibility (missing ARIA labels)
7. ❌ No state persistence (data lost on refresh)
8. ❌ File upload not validated (size/type)
9. ❌ Form data not submitted anywhere
10. ❌ No service layer structure

### What Works Well
- ✅ Clean UI/UX design
- ✅ Responsive layout
- ✅ Multi-step flow structure
- ✅ Role-based form separation
- ✅ OTP input auto-focus logic

---

## Implementation Plan

### Phase 1: Setup Core Dependencies

#### 1.1 Verify Installed Packages
Check that these are already installed:
- react-hook-form: ^7.69.0
- zod: ^4.2.1
- @hookform/resolvers: May need to install

#### 1.2 Install New Packages
Install react-hot-toast for toast notifications:
```bash
npm install react-hot-toast
```

If @hookform/resolvers is missing, install it:
```bash
npm install @hookform/resolvers
```

---

### Phase 2: Create Reusable UI Components

#### 2.1 Loading Spinner Component
**File: `src/components/ui/LoadingSpinner.jsx`**
- Create reusable spinner with size variants (sm, md, lg)
- Support color variants (primary, white, accent)
- Use Tailwind animations for spin effect

#### 2.2 Toast Notification System (Using react-hot-toast)

**Setup in `src/main.jsx`:**
- Import Toaster component from react-hot-toast
- Add `<Toaster />` component at root level (after App component)
- Configure default options: position, duration, styling

**Usage Pattern:**
- Import `toast` from 'react-hot-toast'
- Use `toast.success(message)` for success notifications
- Use `toast.error(message)` for error notifications
- Use `toast.loading(message)` for loading states
- Use `toast.promise()` for async operations with automatic success/error handling
- Customizable position (top-right default)
- Auto-dismiss after 3 seconds (configurable)
- Built-in animations and styling
- No custom Toast component needed

**Configuration:**
- Custom styles to match project theme (green accent colors)
- Icon customization for success/error
- Duration: 3000ms default
- Position: top-right

#### 2.3 Error Boundary Component
**File: `src/components/common/ErrorBoundary.jsx`**
- Catch React component errors
- Show fallback UI with error message
- "Try Again" and "Go Home" buttons
- Show error details in development mode only
- Log errors to console

#### 2.4 Form Error Message Component
**File: `src/components/ui/FormError.jsx`**
- Display validation error messages
- Include warning icon
- Red text styling
- role="alert" for accessibility

#### 2.5 Button with Loading State
**File: `src/components/ui/Button.jsx`**
- Support variants: primary, secondary, outline
- Show loading spinner when loading prop is true
- Disable button when loading or disabled
- Consistent sizing and spacing
- Accessible disabled state

---

### Phase 3: Create Service Layer Structure (with Mocks)

#### 3.1 Auth Service
**File: `src/services/authService.js`**

Functions to create:
- `sendOTP(data)` - Send OTP to email/phone (mock delay 1s)
- `verifyOTP(data)` - Verify OTP code (mock delay 1s, accept "123456" as valid)
- `resendOTP(data)` - Resend OTP (mock delay 1s)
- `googleAuth(data)` - Google OAuth login (mock delay 1.5s)

All functions:
- Use mock delays to simulate network requests
- Return Promise-based responses
- Include JSDoc comments with expected API contract
- Add TODO comments for real API implementation
- Throw errors for validation failures

#### 3.2 User Service
**File: `src/services/userService.js`**

Functions to create:
- `createProfile(data)` - Create user profile after registration
- `uploadProfilePicture(file)` - Upload profile picture

All functions:
- Mock delays to simulate network
- Validate required fields
- Return mock success responses
- JSDoc comments for API contracts
- Ready to swap with real API calls

---

### Phase 4: Add Validation with React Hook Form + Zod

#### 4.1 Create Validation Schemas
**File: `src/schemas/registrationSchemas.js`**

Schemas to create:
1. **emailOrPhoneSchema**
   - Required field
   - Must be valid email OR 10-digit Indian mobile (starts with 6-9)

2. **otpSchema**
   - Exactly 6 digits
   - Numbers only

3. **generalUserProfileSchema**
   - fullName: 2-100 chars, letters and spaces only
   - age: 1-120
   - gender: required
   - state: required
   - district: required
   - village: 2-100 chars
   - mobile: 10 digits starting with 6-9
   - profilePic: optional

4. **validateFile helper**
   - Max size: 5MB
   - Allowed types: JPEG, JPG, PNG, WebP
   - Return validation result with errors array

Similar schemas needed for:
- VLE profile form
- Innovator profile form
- AO profile form
- NO profile form

#### 4.2 Refactor RegistrationForm with Validation
**File: `src/pages/common/Register/_components/RegistrationForm.jsx`**

Updates:
- Import useForm from react-hook-form
- Import zodResolver from @hookform/resolvers/zod
- Import toast from 'react-hot-toast'
- Create separate forms for email/phone and OTP steps
- Add loading state management
- Integrate authService for API calls
- Use toast.success() and toast.error() for user feedback
- Replace plain buttons with Button component
- Add FormError for validation errors
- Update JSX with register() and error display
- Add proper ARIA attributes

#### 4.3 Refactor GeneralUserProfileForm with Validation
**File: `src/pages/common/Register/_components/GeneralUserProfileForm.jsx`**

Updates:
- Use useForm with zodResolver
- Add loading state
- Integrate userService
- Import toast from 'react-hot-toast'
- Use toast.success() and toast.error() for feedback
- File upload validation with validateFile
- Replace buttons with Button component
- Add FormError components
- Update all inputs with register()
- Display validation errors
- Handle profile picture upload separately

#### 4.4 Refactor Other Profile Forms
Apply same pattern to:
- VleProfileForm.jsx
- InnovatorProfileForm.jsx
- AffiliatedOrgProfileForm.jsx
- NodalOrgProfileForm.jsx

---

### Phase 5: Fix Input Types and Attributes

#### 5.1 Email/Phone Input
- Keep type="text" but add inputMode="email"
- Add autoComplete="username email tel"
- Add ARIA labels, required, invalid, describedby

#### 5.2 Mobile Number Input
- Change to type="tel"
- Add inputMode="numeric"
- Add pattern="[0-9]{10}"
- Add maxLength="10"
- Add autoComplete="tel"

#### 5.3 Age Input
- Change to type="number"
- Add inputMode="numeric"
- Add min="1" max="120"
- Add ARIA label

#### 5.4 File Input
- Wrap in label with htmlFor
- Add id to input
- Add accept attribute with specific MIME types
- Add ARIA label
- Make visually accessible

#### 5.5 All Inputs
- Add proper aria-label
- Add aria-required for required fields
- Add aria-invalid when errors exist
- Add aria-describedby linking to error message

---

### Phase 6: Add State Persistence

#### 6.1 Session Storage Hook
**File: `src/hooks/useSessionStorage.js`**

Features:
- useState-like API
- Reads from sessionStorage on mount
- Writes to sessionStorage on update
- JSON serialization/deserialization
- Error handling for quota exceeded
- Remove method for cleanup

#### 6.2 Update RegisterPage to Persist State
**File: `src/pages/common/Register/RegisterPage.jsx`**

Changes:
- Use useSessionStorage for currentStep
- Use useSessionStorage for selectedType
- Use useSessionStorage for registrationData
- Clear session storage on successful completion
- Restore state on page refresh

---

### Phase 7: Add OTP Resend Cooldown

#### 7.1 OTP Resend Logic
Add to RegistrationForm:
- State for canResend (boolean)
- State for resendCountdown (number, starts at 60)
- useEffect to start countdown when OTP screen shows
- Timer decrements every second
- Enable resend button when countdown reaches 0
- handleResendOtp function calls authService.resendOTP
- Reset countdown to 60 after resend
- Show "Resend in Xs" or "Resend" button text
- Disable button during loading and countdown

---

### Phase 8: Wrap with Error Boundary

#### 8.1 Update RegisterPage
Wrap entire RegisterPage content with ErrorBoundary component to catch any React errors

---

## Directory Structure After Implementation

```
src/
├── main.jsx                           (UPDATED - add Toaster)
├── components/
│   ├── common/
│   │   └── ErrorBoundary.jsx          (NEW)
│   └── ui/
│       ├── Button.jsx                 (NEW)
│       ├── FormError.jsx              (NEW)
│       └── LoadingSpinner.jsx         (NEW)
├── hooks/
│   └── useSessionStorage.js           (NEW)
├── schemas/
│   └── registrationSchemas.js         (NEW)
├── services/
│   ├── authService.js                 (NEW)
│   └── userService.js                 (NEW)
└── pages/common/Register/
    ├── RegisterPage.jsx               (UPDATED)
    └── _components/
        ├── RegistrationForm.jsx       (UPDATED)
        ├── GeneralUserProfileForm.jsx (UPDATED)
        ├── VleProfileForm.jsx         (UPDATED)
        ├── InnovatorProfileForm.jsx   (UPDATED)
        ├── AffiliatedOrgProfileForm.jsx (UPDATED)
        └── NodalOrgProfileForm.jsx    (UPDATED)
```

---

## Files to Create

### New Files (8 files):
1. `src/components/ui/LoadingSpinner.jsx`
2. `src/components/ui/Button.jsx`
3. `src/components/ui/FormError.jsx`
4. `src/components/common/ErrorBoundary.jsx`
5. `src/hooks/useSessionStorage.js`
6. `src/schemas/registrationSchemas.js`
7. `src/services/authService.js`
8. `src/services/userService.js`

### Files to Update (8 files):
1. `src/main.jsx` - Add Toaster component
2. `src/pages/common/Register/RegisterPage.jsx`
3. `src/pages/common/Register/_components/RegistrationForm.jsx`
4. `src/pages/common/Register/_components/GeneralUserProfileForm.jsx`
5. `src/pages/common/Register/_components/VleProfileForm.jsx`
6. `src/pages/common/Register/_components/InnovatorProfileForm.jsx`
7. `src/pages/common/Register/_components/AffiliatedOrgProfileForm.jsx`
8. `src/pages/common/Register/_components/NodalOrgProfileForm.jsx`

---

## Verification Checklist

### Phase 1: Components
- [ ] LoadingSpinner renders correctly in all sizes
- [ ] Toast notifications appear and auto-dismiss
- [ ] ErrorBoundary catches errors and shows fallback UI
- [ ] FormError displays validation errors
- [ ] Button shows loading state correctly

### Phase 2: Validation
- [ ] Email/phone validation works (test invalid formats)
- [ ] OTP validation requires 6 digits
- [ ] Profile form validates all required fields
- [ ] Age validation accepts 1-120 only
- [ ] Mobile number validation requires 10 digits starting with 6-9
- [ ] File upload rejects large files (>5MB)
- [ ] File upload rejects invalid formats

### Phase 3: Service Layer
- [ ] authService.sendOTP returns mock response after delay
- [ ] authService.verifyOTP validates OTP correctly
- [ ] userService.createProfile validates required fields
- [ ] Error handling works in all service methods

### Phase 4: State & Persistence
- [ ] Registration progress persists on page refresh
- [ ] Can go back without losing data
- [ ] Session storage clears on successful registration

### Phase 5: User Experience
- [ ] Loading states show during all async operations
- [ ] Error messages are clear and actionable
- [ ] Success toasts appear for completed actions
- [ ] OTP resend has 60 second cooldown
- [ ] Form is keyboard navigable
- [ ] Screen readers can access all form elements

### Phase 6: Accessibility
- [ ] All inputs have proper aria-labels
- [ ] Error messages have role="alert"
- [ ] Focus management works in OTP inputs
- [ ] Keyboard navigation works throughout
- [ ] Color contrast meets WCAG AA standards

---

## API Integration Readiness

When backend is ready, you only need to:

1. Update `src/services/authService.js` - Replace mock delays with real axios calls
2. Update `src/services/userService.js` - Replace mock responses with real API calls
3. Import apiClient from config/apiClient (from overall API plan)

**Everything else stays the same** - validation, error handling, loading states, UI components all work as-is!

---

## Implementation Strategy

### Recommended Order:
1. **Phase 2 first** - Create all reusable UI components (can be tested in isolation)
2. **Phase 3** - Create service layer with mocks (can test async flows)
3. **Phase 4** - Add validation to forms (most time-consuming)
4. **Phase 6** - Add state persistence (quick win)
5. **Phase 5** - Fix input types (cleanup)
6. **Phase 7** - Add OTP cooldown (polish)
7. **Phase 8** - Wrap with error boundary (final safety net)

### Can Be Done Incrementally:
- Update one form at a time in Phase 4
- Test each form independently
- No breaking changes to existing functionality
- Can deploy partially completed work

---

## Notes

- **No Breaking Changes**: All improvements are additive
- **Gradual Migration**: Can update one form at a time
- **Mock API**: Service layer uses mocks, easy to test without backend
- **Production Ready**: When backend is ready, swap mocks for real calls
- **Best Practices**: Follows React Hook Form, Zod, and accessibility standards
- **Type Safety**: JSDoc comments provide type hints
- **Error Handling**: Comprehensive error handling at all levels
- **User Feedback**: Toast notifications for all user actions

---

## Estimated Implementation Time

- Phase 1: Setup - 15 minutes (install react-hot-toast + resolvers)
- Phase 2: UI Components - 45 minutes (reduced from 1 hour - no custom toast)
- Phase 3: Service Layer - 30 minutes
- Phase 4: Add Validation - 2 hours (can be split across multiple forms)
- Phase 5: Fix Input Types - 30 minutes
- Phase 6: State Persistence - 30 minutes
- Phase 7: OTP Resend - 30 minutes
- Phase 8: Error Boundary - 15 minutes

**Total: ~5 hours** for complete implementation (reduced from 5-6 hours)

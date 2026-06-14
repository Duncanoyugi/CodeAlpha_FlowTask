# TaskFlow Auth UI Redesign - TODO

## Blocked / Dependencies
- [ ] Confirm how VerifyOTP should resend verification:
  - Need backend/API method for `resendVerification` (authService currently only has login/register/forgotPassword/resetPassword/verifyEmail).
  - Need source of email when link has no email parameter.

## Implementation (presentation only)
- [ ] Add shared design system typography + palette usage across auth pages (no shadcn default button styling, use slate/sky only).
- [ ] LoginPage redesign
  - [ ] Two-column layout with left slate-900 panel + tilted mini-kanban preview + quote attribution.
  - [ ] Right card with heading/subcopy + RHF form presentation.
  - [ ] Password show/hide toggle (lucide Eye/EyeOff).
  - [ ] Button loading text + Loader2.
- [ ] RegisterPage redesign
  - [ ] Two-column layout; left panel matches LoginPage.
  - [ ] Replace inline validation rendering with rose/rose-600 errors under fields (presentation only).
  - [ ] Add password strength meter + 1..8+ checklist with icons.
  - [ ] Consent line + footer links.
- [ ] ForgottenPasswordPage (forgot password utility flow) redesign
  - [ ] Single-column centered shell.
  - [ ] Success state with emerald styling.
  - [ ] Add 30s resend countdown + resend UX.
- [ ] VerifyOTP redesign
  - [ ] Single card shell.
  - [ ] Three states (verifying/success/invalid) with lucide icons.
  - [ ] Success countdown pill + continue button.
  - [ ] Invalid state: primary resend button + secondary back to sign in.
  - [ ] Add resend email input inline form if no email in URL.

## After code changes
- [ ] Run frontend typecheck/build (vite/tsc) to ensure no TS errors.
- [ ] Sanity check routes: /login, /register, /forgot-password, /verify-email(VerifyOTP), any verify-token query params.


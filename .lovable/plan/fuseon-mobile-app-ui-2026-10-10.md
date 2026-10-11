# Fuseon mobile app UI

## Goal
Create a polished, clickable phone-first Fuseon experience based on the existing SYNAPSE mobile interface. The preview will behave like a real app flow and remain practical to translate into Expo for Android and iOS later.

## Experience
- Add a short animated Fuseon launch screen before authentication, using restrained logo motion and respecting reduced-motion settings.
- Redesign sign-in as a native-feeling mobile screen while preserving email/password, password visibility, forgot password, Google sign-in, and sign-up entry points.
- Add a first-login preference flow where users select event interests such as hackathons, workshops, tech talks, competitions, college fests, and internships.
- Include a lightweight skills/team-role step so future event and teammate recommendations feel personalized.
- End onboarding with a personalized transition into the app.

## Clickable app screens
- Home feed with stories, event recommendations, community posts, and quick actions.
- Events discovery with category chips, search/filter controls, event cards, event detail, and registration feedback.
- Teams discovery with open roles, match indicators, and team detail interactions.
- Chat list and an example conversation.
- Profile/settings view with interests and skills visible.
- A compact five-item bottom navigation designed for thumb reach; secondary destinations remain available from profile/settings.

## Visual direction
- Keep the existing clean blue Fuseon identity, light surfaces, rounded mobile controls, and familiar content hierarchy.
- Make it more engaging through purposeful page transitions, press feedback, progressive onboarding, skeleton/loading moments, and polished empty/success states—not decorative effects that would be difficult to reproduce in Expo.
- Use a constrained phone canvas on larger screens and edge-to-edge app layout on phones, including safe-area spacing and touch targets suitable for Android and iOS.
- Use bundled/generated visual assets only where they help users inspect real events or profiles; avoid stock-like decoration.

## Prototype behavior
- Use realistic demo content and local in-preview state so the complete journey is testable without changing or recreating the existing SYNAPSE backend.
- Allow the demo login to continue into preferences, save selections for the current preview session, and personalize the visible event recommendations.
- Make primary controls and navigation functional; clearly present validation, selected, loading, success, and error states.

## Technical details
- Build within the current TanStack Start project using its file-based routes and shared UI pieces.
- Keep data and screen models separated from presentation so the interface can later map cleanly to Expo components and the existing API.
- Use semantic design tokens in the global theme, accessible labels, keyboard support for the web preview, and reduced-motion fallbacks.
- Give each content route unique Fuseon metadata and verify the main flow at phone and desktop viewport sizes.

## Scope boundary
This phase delivers the clickable app UI prototype only. It will not create an Expo repository, connect authentication, migrate the MongoDB/Firebase data, or replace the existing SYNAPSE backend.

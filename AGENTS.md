<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Fuseon prototype data and cross-screen state separate from route components so the UI can later map cleanly to Expo and a production API.
- App screens stay under `src/fuseon-web/`; preserve original mobile styling except explicitly requested screen redesigns, so unrelated screens remain exact copies of the website.
- All data comes through `src/fuseon-web/api/axios.js` with a mock adapter backed by `src/fuseon-web/mock/` (one handler file per section, shapes match the original backend); swapping to the real API means removing the adapter.
- `react-router-dom`, socket.io and Firebase are replaced by shims in `src/fuseon-web/shims/`; route files in `src/routes/` only mount components and set head metadata.
- The app tree renders inside `<ClientOnly>` in `__root.tsx` because the original screens read browser storage at render time.
- Tailwind v3-parity overrides (radius-sm, shadow-sm, ring width, border color, flex-shrink) live in `src/styles.css`; keep them so ported sizes match the original.
- Email signup and Google onboarding reuse AccountQuestions with shared option data, keeping screen transitions separate from the mock API so the flow can later map to Expo.
- Comments sheet motion uses Framer Motion with a spring transition and header-only drag dismissal, keeping list scrolling separate from dragging.

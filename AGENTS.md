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

# Architecture decisions
- Certificate editor uses Fabric.js (v7) loaded only in the browser via React.lazy; SSR must never import it. Why: canvas/DOM-only library.
- Template backgrounds are painted with plain Canvas 2D (src/lib/certificate/renderer.ts + backgrounds.ts) and set as the Fabric background image; text, seals, lines are separate editable Fabric objects tagged with `data.role`. Why: rich decorative art stays portable while content stays editable.
- Fabric v7 defaults origin to center — always set originX/originY explicitly on new objects.
- Designs persist in localStorage only (autosave + "My templates"). Why: no backend in this project.
- Extra templates live in src/lib/certificate/templates-extra.ts (side-effect import registers into RENDERERS/TEMPLATE_LIST); template cards use full offscreen StaticCanvas previews (preview.ts). Why: keep backgrounds.ts manageable and show true previews.

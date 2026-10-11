# Fuseon: exact mobile copy of the original website

## Goal
Replace the simplified screens with a one-to-one copy of the original website's mobile view. Every screen, card, sheet and pop-up keeps the original layout, sizes, spacing, colors, icons and text. It all works with demo data, so every button does something. This is still UI only, with no real backend.

## Approach
The original site is built with React and the same styling system as this app. So instead of redrawing screens by eye, I will port the original components file by file and keep their styling exactly. Only three things change:
- Page links switch to this app's navigation.
- Server calls switch to a local demo data layer that returns the same data shapes.
- Firebase, sockets and toasts switch to local stand-ins.

Because the styling is copied as-is, sizes and spacing match the original.

## Screens and components to port

Shell
- Navbar (logo, search, bell with red dot and notification dropdown, avatar) and BottomNav with the same six items, including Forums.

Home
- Feed, FeedHeader tabs, CreatePost (image, team and event attach, rich text), PostCard (like, comment, share, three-dot menu, request-to-join), AttachedTeamCard, AttachedEventCard, CommentItem, MobileCommentsSheet (full comment thread with replies and input), ProfileCard, Recommendations.

Teams
- Teams page, SearchBar, QuickActions, TeamCard, OpenTeamCard, CircularProgress, MemberCard, PendingInvites, Recommended, CreateTeamModal, FindMembersModal, TeamDetails, ManageTeam.

Events
- Events page with category sliders and expandable grids, cards, Slider, MobileFilterModal (search, categories, date, upcoming/all), EventDetails, TeamList, AutoTeamModal, MatchFoundModal, EventPassModal, EventQRModal, USNPromptModal.

Chat
- Chat page, ChatSearch, Stories (notes), Tabs, ChatList, ChatListItem, GroupChatModal, and the full conversation view: ChatHeader, MessageList, MessageBubble, ReactionPicker, TypingIndicator, MessageInput.

Profile (currently missing)
- Profile, ProfileHero, ProfileHeader, ProfileScore, AboutSection, ProjectsSection, PostsSection, AchievementsSection, EventsSection, TeamsSection, GithubStatsCard, SuggestedConnections, ProfileEditModal, ImageUpload, InviteToTeamModal, GithubImportModal, VerificationModal, RequestCollegeModal, ProfileSkeleton. Overview and tab switching work, and own-profile vs public view both work.

Settings
- Settings menu with all 9 sections. Each one opens its real content: Account, Profile, Privacy, Notifications, Auto-Team, Interface, Security, Legal, Danger Zone.

Forums
- ForumHome, ForumLayout, ForumHeader, ForumSidebar (mobile behavior), ForumThreadCard, ForumPostCard, ThreadPage, ForumReplyList, ForumReplyItem, CreateForumModal, CreatePostModal.

Common
- Avatar, VerifiedBadge, FollowButton, Skeleton, Toast/NotificationToast, InAppNotification, RichTextEditor.

The existing launch animation, login and interest onboarding stay. Login and Signup are restyled to match the original Login.jsx and Signup.jsx.

Not included: Admin, Moderator and Organizer dashboards. Those are staff tools, not the student app.

## Verification
- At 390x844, compare screenshots of every screen and sheet side by side with the original site running locally from its source, and fix any visual differences.
- Click through every button, tab, sheet and modal on each screen. Check that there are zero console errors.

## Technical details
- Ported components go in `src/components/fuseon/original/<Section>/` and are converted to TSX with loose prop types. The JSX and Tailwind classes stay verbatim.
- The original `tailwind.config` theme (colors, fonts, shadows, animations) and the custom classes in `index.css` move into `src/styles.css` as Tailwind v4 tokens and utilities.
- `src/lib/fuseon-api.ts` is a mock module that mirrors the original `api/axios` endpoints and returns demo data from `src/lib/fuseon-data.ts`. It is used through TanStack Query, the same way the original does. This keeps data separate from the screens so it can map to the real API in Expo later.
- `react-router-dom` hooks (`useNavigate`, `useParams`, `Link`) are replaced with `@tanstack/react-router`. Auth context becomes the existing app-context. `react-hot-toast` becomes sonner. Sockets and Firebase become local simulated events (typing, new messages).
- `framer-motion`, `lucide-react`, `react-icons` and `date-fns` are installed if they are missing, so the animations and icons stay identical.
- New routes: `/profile/$username`, `/teams/$teamId`, `/forums`, `/forums/$forumId`, `/forums/thread/$threadId`, `/settings/$section`. Each route gets its own page title and description.
- The current hand-made `screens.tsx` is removed once every route uses the ported components.
- The work is done in parallel per section (Home, Teams, Events, Chat, Profile, Settings, Forums), then checked visually as a whole.

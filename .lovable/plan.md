# Plan: Redesign the Home Page and Sidebar Navigation

Organize all specialized tools, games, and comics into their respective sidebar categories, cleaning up the home page to focus on core functionality.

## Proposed Changes

### 1. Home Page Clean-up (`src/pages/Index.tsx`)
- Remove the `UtilityToolsSection` component from the main layout.
- Remove the `GamesCarousel` and `RandomGamePicker` components.
- Remove the `ComicsSection` component.
- The home page will now focus on the `HeroSection` (Downloader), `AdvantagesSection`, and trust/educational content.

### 2. Sidebar Navigation Enhancement (`src/components/Navigation.tsx`)
- Update the `ITEMS` array to include specialized sub-items for Tools, Games, and Space/TV categories.
- Ensure all previously home-page sections are accessible via the sidebar links.

### 3. Header Synchronization (`src/components/Header.tsx`)
- Align the top navigation links with the new categorized structure if necessary.

## Technical Details
- **Component Removal**: Components will remain in the codebase but will no longer be rendered in `Index.tsx`.
- **Route Integrity**: Ensure that `/ferramentas`, `/jogos`, and other routes correctly render their respective sections as full-page experiences (most of these already exist as separate routes).
- **Responsiveness**: The mobile floating menu will also reflect these changes.

## User Impact
- The home page becomes significantly cleaner and faster to load.
- Users can find specific categories easily via the sidebar, which is always accessible.
- Better organization of the 2700+ games and numerous utility tools.

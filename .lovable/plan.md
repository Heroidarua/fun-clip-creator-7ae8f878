# Plan - Fix database connection and download functions

Investigate and fix the database connection issues that are causing download functions to fail following the Supabase integration.

## Proposed Changes

### Database connection and status tracking

- Update `src/hooks/useDownloaderStatus.ts` to improve error handling and provide meaningful feedback when the database is unreachable.
- Verify `downloader_status` table content and add a fallback mechanism in `isActive` to return `true` (active) if the database check fails, ensuring tools remain functional even if status tracking is down.
- Update `src/lib/downloader-status.server.ts` to use a more robust update logic and verify if `supabaseAdmin` is correctly initialized.

### API route stabilization

- Ensure all downloader API routes (`/api/download-*`) correctly handle Supabase connection failures without crashing the entire request.
- Add try-catch blocks around `reportDownloaderResult` calls in all relevant API handlers.

### Environment and host detection

- Refine `src/lib/api-base.ts` to ensure it accurately detects all platform host variations (preview and production) to avoid CORS issues.

## Technical Details

- **Database**: Use the service role client (`supabaseAdmin`) for status updates and public client (`supabase`) for reads.
- **Resilience**: Tools will default to "active" if status cannot be fetched.
- **Logging**: Add specific server-side logs to trace connection failures to the backend.

## User Review Required

- No immediate action required from the user. I will proceed with fixing the connection and ensuring the tools work.

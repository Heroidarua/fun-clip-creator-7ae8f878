// Helper to bypass strict typing when tables aren't yet in the generated types.
// Once tables are created and types regenerated, these can be replaced with direct calls.
import { supabase } from './client';

/**
 * Wrapper around supabase.from() that bypasses strict table name typing.
 * Use this when the table exists in the database but hasn't been added to types.ts yet.
 */
export function fromTable(table: string) {
  return (supabase as any).from(table);
}

/**
 * Wrapper around supabase.rpc() that bypasses strict function name typing.
 */
export function rpcCall(fn: string, params?: Record<string, unknown>) {
  return (supabase as any).rpc(fn, params);
}

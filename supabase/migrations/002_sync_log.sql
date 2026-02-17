-- Sync log for attribution tracking: records who changed what and when.
-- This is NOT an offline write queue. The app is read-only when offline (per user decision).
-- Conflict resolution (REQ-SYNC-04): Supabase handles this natively via last-write-wins
-- timestamp ordering on the server. No client-side conflict resolution is needed.
CREATE TABLE IF NOT EXISTS public.sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB
);

ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- Both users can see all sync logs (shared care team)
CREATE POLICY "Care team can view sync logs"
  ON public.sync_log FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert sync logs
CREATE POLICY "Authenticated users can insert sync logs"
  ON public.sync_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX idx_sync_log_table ON public.sync_log(table_name);
CREATE INDEX idx_sync_log_changed_at ON public.sync_log(changed_at);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_log;

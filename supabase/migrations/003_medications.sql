-- Medications table: pre-loaded with Harris's 3 medications
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  generic_name TEXT,
  purpose TEXT NOT NULL,
  schedule_times TEXT[] NOT NULL DEFAULT '{}',
  is_prn BOOLEAN NOT NULL DEFAULT false,
  take_with_food BOOLEAN NOT NULL DEFAULT false,
  key_notes TEXT[] NOT NULL DEFAULT '{}',
  interactions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Care team can view medications"
  ON public.medications FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Medication logs: records when a med was taken/skipped
CREATE TABLE IF NOT EXISTS public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  scheduled_time TEXT,
  status TEXT NOT NULL CHECK (status IN ('taken', 'skipped')),
  logged_by UUID NOT NULL REFERENCES auth.users(id),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT
);

ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Care team can view medication logs"
  ON public.medication_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert medication logs"
  ON public.medication_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own logs"
  ON public.medication_logs FOR UPDATE
  USING (auth.uid() = logged_by);

CREATE POLICY "Users can delete their own logs"
  ON public.medication_logs FOR DELETE
  USING (auth.uid() = logged_by);

CREATE INDEX idx_medication_logs_date ON public.medication_logs(log_date);
CREATE INDEX idx_medication_logs_medication ON public.medication_logs(medication_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.medications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medication_logs;

-- Seed the 3 medications
INSERT INTO public.medications (name, generic_name, purpose, schedule_times, is_prn, take_with_food, key_notes, interactions) VALUES
(
  'Hydrocodone/Acetaminophen',
  'Hydrocodone/Acetaminophen',
  'Pain management',
  ARRAY['08:00', '12:00', '16:00', '20:00'],
  false,
  true,
  ARRAY['Take with food', 'NO grapefruit', 'NO alcohol', 'Causes drowsiness/dizziness'],
  ARRAY['Zofran: increased risk of serotonin syndrome']
),
(
  'Cefdinir',
  'Cefdinir',
  'Antibiotic (infection prevention)',
  ARRAY['08:00', '20:00'],
  false,
  false,
  ARRAY['Take probiotics 2hrs apart', 'NO antacids at same time', 'NO iron supplements (2hr gap)'],
  ARRAY[]::TEXT[]
),
(
  'Zofran',
  'Ondansetron',
  'Anti-nausea',
  ARRAY[]::TEXT[],
  true,
  false,
  ARRAY['Take as needed for nausea', 'Space apart from Hydrocodone when possible'],
  ARRAY['Hydrocodone: increased risk of serotonin syndrome']
);

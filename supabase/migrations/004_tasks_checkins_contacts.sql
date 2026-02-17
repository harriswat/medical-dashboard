-- Tasks table: assign tasks between Harris and Kent
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES auth.users(id),
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Care team can view all tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Assignee or creator can update tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = assigned_to OR auth.uid() = assigned_by);

CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Feeling check-ins table: 3x daily (morning, afternoon, evening)
CREATE TABLE IF NOT EXISTS public.feeling_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  period TEXT NOT NULL CHECK (period IN ('morning', 'afternoon', 'evening')),
  pain_level INTEGER NOT NULL CHECK (pain_level BETWEEN 1 AND 10),
  mood_level INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 10),
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
  notes TEXT,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.feeling_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Care team can view all check-ins"
  ON public.feeling_checkins FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own check-ins"
  ON public.feeling_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
  ON public.feeling_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_checkins_date ON public.feeling_checkins(checkin_date);
CREATE UNIQUE INDEX idx_checkins_unique ON public.feeling_checkins(user_id, period, checkin_date);

ALTER PUBLICATION supabase_realtime ADD TABLE public.feeling_checkins;

-- Care activities table: wound care, gauze changes, exercises, etc.
CREATE TABLE IF NOT EXISTS public.care_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('wound_care', 'exercise', 'hygiene', 'nutrition', 'other')),
  description TEXT NOT NULL,
  logged_by UUID NOT NULL REFERENCES auth.users(id),
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.care_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Care team can view all activities"
  ON public.care_activities FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can log activities"
  ON public.care_activities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX idx_activities_date ON public.care_activities(activity_date);

ALTER PUBLICATION supabase_realtime ADD TABLE public.care_activities;

-- Doctor contacts table
CREATE TABLE IF NOT EXISTS public.doctor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT NOT NULL,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.doctor_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Care team can view contacts"
  ON public.doctor_contacts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage contacts"
  ON public.doctor_contacts FOR ALL
  USING (auth.uid() IS NOT NULL);

ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_contacts;

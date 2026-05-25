-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_snapshots ENABLE ROW LEVEL SECURITY;

-- PROFILES: dentists can only see/edit their own profile
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- PATIENTS: dentists can only access their own patients
CREATE POLICY "patients_own_dentist" ON public.patients
  FOR ALL USING (dentist_id = auth.uid());

-- CONSULTATIONS: dentists access their own
CREATE POLICY "consultations_own_dentist" ON public.consultations
  FOR ALL USING (dentist_id = auth.uid());

-- CHAT MESSAGES: access via consultation ownership
CREATE POLICY "chat_messages_via_consultation" ON public.chat_messages
  FOR ALL USING (
    consultation_id IN (
      SELECT id FROM public.consultations WHERE dentist_id = auth.uid()
    )
  );

-- DIAGNOSES: dentists access their own
CREATE POLICY "diagnoses_own_dentist" ON public.diagnoses
  FOR ALL USING (dentist_id = auth.uid());

-- IMAGES: dentists access their own
CREATE POLICY "images_own_dentist" ON public.images
  FOR ALL USING (dentist_id = auth.uid());

-- RESEARCH: dentists access their own snapshots
CREATE POLICY "research_own_dentist" ON public.research_snapshots
  FOR ALL USING (dentist_id = auth.uid());

-- ============================================================
-- updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_diagnoses_updated_at
  BEFORE UPDATE ON public.diagnoses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Get dentist stats for dashboard
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_dentist_stats(p_dentist_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_patients', (
      SELECT COUNT(*) FROM patients
      WHERE dentist_id = p_dentist_id AND is_active = TRUE
    ),
    'total_consultations', (
      SELECT COUNT(*) FROM consultations
      WHERE dentist_id = p_dentist_id
    ),
    'consultations_this_month', (
      SELECT COUNT(*) FROM consultations
      WHERE dentist_id = p_dentist_id
        AND created_at >= date_trunc('month', NOW())
    ),
    'pending_followups', (
      SELECT COUNT(*) FROM consultations
      WHERE dentist_id = p_dentist_id
        AND follow_up_date <= NOW() + INTERVAL '7 days'
        AND follow_up_date >= NOW()
        AND status = 'completed'
    ),
    'unconfirmed_diagnoses', (
      SELECT COUNT(*) FROM diagnoses
      WHERE dentist_id = p_dentist_id
        AND dentist_confirmed = FALSE
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Get top diagnoses for research
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_top_diagnoses(
  p_dentist_id UUID,
  p_limit INT DEFAULT 10,
  p_start_date DATE DEFAULT NULL
)
RETURNS TABLE(condition_name TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (c->>'name')::TEXT AS condition_name,
    COUNT(*)           AS count
  FROM public.diagnoses d,
       jsonb_array_elements(d.conditions) c
  WHERE d.dentist_id = p_dentist_id
    AND (p_start_date IS NULL OR d.created_at::DATE >= p_start_date)
  GROUP BY condition_name
  ORDER BY count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Get monthly consultation trend
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_monthly_trends(
  p_dentist_id UUID,
  p_months INT DEFAULT 12
)
RETURNS TABLE(month TEXT, consultations BIGINT, patients BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('month', c.created_at), 'Mon YY') AS month,
    COUNT(DISTINCT c.id)                                  AS consultations,
    COUNT(DISTINCT c.patient_id)                          AS patients
  FROM public.consultations c
  WHERE c.dentist_id = p_dentist_id
    AND c.created_at >= NOW() - (p_months || ' months')::INTERVAL
  GROUP BY DATE_TRUNC('month', c.created_at)
  ORDER BY DATE_TRUNC('month', c.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

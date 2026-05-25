-- ============================================================
-- Enable extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- PROFILES (dentists) - extends Supabase auth.users
-- ============================================================
CREATE TABLE public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  license_number TEXT,
  specialty      TEXT,
  clinic_name    TEXT,
  clinic_address TEXT,
  avatar_url     TEXT,
  settings       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TABLE public.patients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dentist_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  date_of_birth     DATE,
  gender            TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  email             TEXT,
  phone             TEXT,
  address           TEXT,
  emergency_contact JSONB,
  medical_history   JSONB DEFAULT '{}',
  blood_type        TEXT,
  dental_history    JSONB DEFAULT '{}',
  odontogram        JSONB DEFAULT '{}',
  is_active         BOOLEAN DEFAULT TRUE,
  notes             TEXT,
  tags              TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_dentist_id ON public.patients(dentist_id);
CREATE INDEX idx_patients_name_search ON public.patients
  USING gin((first_name || ' ' || last_name) gin_trgm_ops);

-- ============================================================
-- CONSULTATIONS
-- ============================================================
CREATE TABLE public.consultations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id       UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  dentist_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT,
  chief_complaint  TEXT,
  status           TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active', 'completed', 'archived')),
  subjective_notes TEXT,
  objective_notes  TEXT,
  assessment_notes TEXT,
  plan_notes       TEXT,
  vitals           JSONB DEFAULT '{}',
  ai_model_used    TEXT DEFAULT 'claude-opus-4-6',
  ai_token_count   INTEGER DEFAULT 0,
  follow_up_date   DATE,
  follow_up_notes  TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX idx_consultations_dentist_id ON public.consultations(dentist_id);
CREATE INDEX idx_consultations_created_at ON public.consultations(created_at DESC);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE public.chat_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  has_images      BOOLEAN DEFAULT FALSE,
  image_ids       UUID[] DEFAULT '{}',
  input_tokens    INTEGER,
  output_tokens   INTEGER,
  is_pinned       BOOLEAN DEFAULT FALSE,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_consultation_id ON public.chat_messages(consultation_id);

-- ============================================================
-- DIAGNOSES
-- ============================================================
CREATE TABLE public.diagnoses (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id        UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id             UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  dentist_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conditions             JSONB NOT NULL DEFAULT '[]',
  recommended_treatments JSONB DEFAULT '[]',
  differential_diagnosis JSONB DEFAULT '[]',
  follow_up_recommendations TEXT,
  red_flags              TEXT[],
  dentist_confirmed      BOOLEAN DEFAULT FALSE,
  dentist_notes          TEXT,
  final_diagnosis        TEXT,
  included_in_research   BOOLEAN DEFAULT TRUE,
  raw_ai_response        TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diagnoses_consultation_id ON public.diagnoses(consultation_id);
CREATE INDEX idx_diagnoses_patient_id ON public.diagnoses(patient_id);
CREATE INDEX idx_diagnoses_dentist_id ON public.diagnoses(dentist_id);
CREATE INDEX idx_diagnoses_created_at ON public.diagnoses(created_at DESC);
CREATE INDEX idx_diagnoses_conditions ON public.diagnoses USING gin(conditions);

-- ============================================================
-- IMAGES
-- ============================================================
CREATE TABLE public.images (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  dentist_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path    TEXT NOT NULL,
  storage_bucket  TEXT DEFAULT 'dental-images',
  public_url      TEXT,
  thumbnail_url   TEXT,
  image_type      TEXT NOT NULL CHECK (image_type IN (
    'periapical', 'panoramic', 'bitewing', 'occlusal',
    'cephalometric', 'cbct', 'intraoral_photo', 'extraoral_photo', 'other'
  )),
  affected_teeth  TEXT[],
  ai_analyzed     BOOLEAN DEFAULT FALSE,
  ai_analysis     JSONB DEFAULT '{}',
  ai_analyzed_at  TIMESTAMPTZ,
  file_name       TEXT NOT NULL,
  file_size       INTEGER,
  mime_type       TEXT,
  width           INTEGER,
  height          INTEGER,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_consultation_id ON public.images(consultation_id);
CREATE INDEX idx_images_patient_id ON public.images(patient_id);

-- ============================================================
-- RESEARCH SNAPSHOTS
-- ============================================================
CREATE TABLE public.research_snapshots (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dentist_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_start         DATE NOT NULL,
  period_end           DATE NOT NULL,
  total_consultations  INTEGER DEFAULT 0,
  total_patients       INTEGER DEFAULT 0,
  diagnosis_counts     JSONB DEFAULT '{}',
  treatment_counts     JSONB DEFAULT '{}',
  age_distribution     JSONB DEFAULT '{}',
  gender_distribution  JSONB DEFAULT '{}',
  ai_accuracy_feedback JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

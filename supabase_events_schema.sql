-- =============================================
-- TEL-U VERSE: Temporary Events Schema
-- Jalankan SQL ini di Supabase SQL Editor
-- =============================================

-- 1. TABEL temporary_events
CREATE TABLE public.temporary_events (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  quiz JSONB NOT NULL DEFAULT '{"quests":[]}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROW LEVEL SECURITY
ALTER TABLE public.temporary_events ENABLE ROW LEVEL SECURITY;

-- Mitra hanya bisa melihat event miliknya sendiri
CREATE POLICY "Mitra can view own events"
  ON public.temporary_events FOR SELECT
  USING (auth.uid() = user_id);

-- Mitra hanya bisa membuat event untuk dirinya sendiri
CREATE POLICY "Mitra can create own events"
  ON public.temporary_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Mitra hanya bisa menghapus event miliknya sendiri
CREATE POLICY "Mitra can delete own events"
  ON public.temporary_events FOR DELETE
  USING (auth.uid() = user_id);

-- Mitra hanya bisa update event miliknya sendiri
CREATE POLICY "Mitra can update own events"
  ON public.temporary_events FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin bisa melihat semua event (untuk monitoring)
CREATE POLICY "Admin can view all events"
  ON public.temporary_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =============================================
-- 3. STORAGE BUCKET untuk poster event
-- =============================================

-- Buat bucket (jika belum ada, bisa juga buat manual via Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-posters', 'event-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated user bisa upload ke bucket ini
CREATE POLICY "Authenticated users can upload posters"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-posters');

-- Policy: Public bisa melihat/download gambar poster
CREATE POLICY "Public can view posters"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'event-posters');

-- Policy: Authenticated user bisa hapus file dari bucket ini
CREATE POLICY "Authenticated users can delete posters"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-posters');

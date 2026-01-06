-- Rename description to label_text
ALTER TABLE public.boards 
RENAME COLUMN description TO label_text;

-- Add label_color column
ALTER TABLE public.boards 
ADD COLUMN IF NOT EXISTS label_color TEXT DEFAULT 'bg-gray-500';

-- Add started_date column
ALTER TABLE public.boards 
ADD COLUMN IF NOT EXISTS started_date DATE;

-- Rename retainer_y to annual
ALTER TABLE public.boards 
RENAME COLUMN retainer_y TO annual;

-- Note: Tasks, updated_at, and created_at columns are kept in the database
-- but will be hidden from the UI. We don't drop them to preserve data.


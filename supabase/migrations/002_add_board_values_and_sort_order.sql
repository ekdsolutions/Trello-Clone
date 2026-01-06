-- Add total_value, upcoming_value, and sort_order columns to boards table
ALTER TABLE public.boards 
ADD COLUMN IF NOT EXISTS total_value NUMERIC(12, 2) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS upcoming_value NUMERIC(12, 2) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0 NOT NULL;

-- Create index for sort_order to improve query performance
CREATE INDEX IF NOT EXISTS idx_boards_sort_order ON public.boards(user_id, sort_order);

-- Update existing boards to have sort_order based on created_at
-- This ensures existing boards have a proper sort order
UPDATE public.boards
SET sort_order = subquery.row_number
FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_number
    FROM public.boards
) AS subquery
WHERE public.boards.id = subquery.id;


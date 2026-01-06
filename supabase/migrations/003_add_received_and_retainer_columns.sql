-- Add received_value and retainer_y columns to boards table
ALTER TABLE public.boards 
ADD COLUMN IF NOT EXISTS received_value NUMERIC(12, 2) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS retainer_y NUMERIC(12, 2) DEFAULT 0 NOT NULL;


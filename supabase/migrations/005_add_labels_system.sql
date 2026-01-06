-- Create labels table
CREATE TABLE IF NOT EXISTS public.labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'bg-gray-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, text, color)
);

-- Create board_labels junction table
CREATE TABLE IF NOT EXISTS public.board_labels (
    board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
    PRIMARY KEY (board_id, label_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_labels_user_id ON public.labels(user_id);
CREATE INDEX IF NOT EXISTS idx_board_labels_board_id ON public.board_labels(board_id);
CREATE INDEX IF NOT EXISTS idx_board_labels_label_id ON public.board_labels(label_id);

-- Migrate existing label_text and label_color to labels table (if columns exist)
-- First, create labels from existing boards
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'boards' AND column_name = 'label_text'
    ) THEN
        INSERT INTO public.labels (user_id, text, color)
        SELECT DISTINCT user_id, label_text, COALESCE(label_color, 'bg-gray-500')
        FROM public.boards
        WHERE label_text IS NOT NULL AND label_text != ''
        ON CONFLICT (user_id, text, color) DO NOTHING;

        -- Then, link boards to their labels
        INSERT INTO public.board_labels (board_id, label_id)
        SELECT b.id, l.id
        FROM public.boards b
        INNER JOIN public.labels l ON b.user_id = l.user_id 
            AND b.label_text = l.text 
            AND COALESCE(b.label_color, 'bg-gray-500') = l.color
        WHERE b.label_text IS NOT NULL AND b.label_text != ''
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Note: We keep label_text and label_color columns for now to avoid breaking existing code
-- They can be dropped later if needed


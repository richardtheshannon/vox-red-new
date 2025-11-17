-- Migration: Make slide title optional
-- Date: 2025-01-17
-- Description: Allow slides to be created without titles (for image-only slides)

ALTER TABLE slides ALTER COLUMN title DROP NOT NULL;

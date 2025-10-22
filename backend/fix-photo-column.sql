-- Fix Course Photo column size to support larger images
-- This script changes the Photo column from varbinary(1000) to varbinary(max)

USE [db_abea46_ersatraining];
GO

-- Alter the Photo column to support larger binary data
ALTER TABLE [dbo].[Courses] 
ALTER COLUMN [Photo] varbinary(max);
GO

-- Verify the change
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Courses' AND COLUMN_NAME = 'Photo';
GO

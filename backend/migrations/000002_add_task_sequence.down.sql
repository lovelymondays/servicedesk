-- Remove the default value from the id column
ALTER TABLE tasks ALTER COLUMN id DROP DEFAULT;

-- Drop the sequence
DROP SEQUENCE IF EXISTS tasks_id_seq; 
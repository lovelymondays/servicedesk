-- Create sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS tasks_id_seq;

-- Set the sequence to be owned by the tasks table id column
ALTER TABLE tasks ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq');
ALTER SEQUENCE tasks_id_seq OWNED BY tasks.id;

-- Reset sequence to the max id + 1
SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 0) + 1, false); 
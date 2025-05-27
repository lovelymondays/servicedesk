-- Auto-generated seed file
-- Last updated: 2025-05-28 05:13:23

-- Clear existing tasks
DELETE FROM tasks;

-- Reset tasks id sequence
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;

-- Insert current tasks

-- Faq Tasks
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('kambing', 'kambing', '# kambing

Last Updated: 5/28/2025

## Question
[Question details will be added here]

## Answer
[Detailed answer will be provided here]

## Additional Resources
- [Add relevant links]
- [Add documentation references]', 'Q&A', 'faq', 'approved', 0.000000, ARRAY['kambinggg']::text[], 2, NOW(), NOW());

-- User-Guidance Tasks
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('kambing', 'kambing', '# kambing

Reported on: 5/28/2025

## Issue Description
[Detailed issue description]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior
[What should happen]

## Current Behavior
[What is happening]

## Possible Solution
[If you have any suggestions]', 'Issue', 'user-guidance', 'pending', 0.000000, ARRAY['kambing']::text[], 2, NOW(), NOW());

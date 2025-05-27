-- Auto-generated seed file
-- Last updated: 2025-05-24 04:33:51

-- Clear existing tasks
DELETE FROM tasks;

-- Reset tasks id sequence
ALTER SEQUENCE tasks_id_seq RESTART WITH 1;

-- Insert current tasks

-- Faq Tasks
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('Common Issues FAQ', 'Frequently asked questions about common issues', 'Answers to common system issues...', 'faq', 'faq', 'active', 0.000000, NULL, 6, NOW(), NOW());
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('System Updates FAQ', 'FAQ about system updates', 'Information about system updates and maintenance...', 'faq', 'faq', 'active', 0.000000, NULL, 6, NOW(), NOW());

-- Sla-Monitoring Tasks
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('SLA Guidelines', 'Service Level Agreement guidelines', 'Overview of SLA requirements and metrics...', 'guide', 'sla-monitoring', 'active', 0.000000, NULL, 6, NOW(), NOW());
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('Response Time Standards', 'Standards for response times', 'Expected response times for different request types...', 'standard', 'sla-monitoring', 'active', 0.000000, NULL, 6, NOW(), NOW());

-- User-Guidance Tasks
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('System Navigation Guide', 'Guide for navigating the system interface', 'Detailed steps for using the system navigation...', 'guide', 'user-guidance', 'active', 0.000000, NULL, 6, NOW(), NOW());
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('Feature Overview', 'Overview of system features', 'Comprehensive overview of available features...', 'overview', 'user-guidance', 'active', 0.000000, NULL, 6, NOW(), NOW());

-- Password-Reset Tasks
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('Password Reset Process', 'Guide for password reset procedure', 'Step-by-step guide for resetting passwords...', 'guide', 'password-reset', 'active', 0.000000, NULL, 6, NOW(), NOW());
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('Security Questions Setup', 'Setting up security questions', 'Instructions for setting up security questions...', 'setup', 'password-reset', 'active', 0.000000, NULL, 6, NOW(), NOW());

-- Incident-Solving Tasks
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('Critical Incident Response', 'Handling critical system incidents', 'Protocol for responding to critical incidents...', 'protocol', 'incident-solving', 'active', 0.000000, NULL, 6, NOW(), NOW());
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('Incident Escalation Guide', 'Guidelines for incident escalation', 'When and how to escalate incidents...', 'guide', 'incident-solving', 'active', 0.000000, NULL, 6, NOW(), NOW());

-- Request-Solving Tasks
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('Service Request Process', 'Process for handling service requests', 'Steps for processing service requests...', 'process', 'request-solving', 'active', 0.000000, NULL, 6, NOW(), NOW());
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('Request Prioritization', 'Guidelines for request prioritization', 'How to prioritize incoming requests...', 'guide', 'request-solving', 'active', 0.000000, NULL, 6, NOW(), NOW());
INSERT INTO tasks (title, description, content, type, category, status, rating, keywords, user_id, created_at, updated_at)
VALUES 
('yes', 'yes', '# yes

Last Updated: 5/24/2025

## Question
[Question details will be added here]

## Answer
[Detailed answer will be provided here]

## Additional Resources
- [Add relevant links]
- [Add documentation references]', 'Q&A', 'request-solving', 'pending', 0.000000, ARRAY['yes']::text[], 6, NOW(), NOW());

-- Fix User Roles to Lowercase
-- This SQL script converts all UPPERCASE roles to lowercase

-- Show current roles before update
SELECT 'BEFORE UPDATE:' as status;
SELECT id, name, email, role FROM users ORDER BY created_at;

-- Update all roles to lowercase
UPDATE users SET role = LOWER(role);

-- Show roles after update
SELECT 'AFTER UPDATE:' as status;
SELECT id, name, email, role FROM users ORDER BY created_at;

-- Verify admin users
SELECT 'ADMIN USERS:' as status;
SELECT id, name, email, role FROM users WHERE role = 'admin';

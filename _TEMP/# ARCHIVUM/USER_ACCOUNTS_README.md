# User Accounts & Authentication Guide

**Project**: Spiritual Content Platform - User Management System
**Date**: November 16, 2025
**Version**: 1.0
**Status**: Production Ready

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [First-Time Setup](#first-time-setup)
3. [Login & Authentication](#login--authentication)
4. [User Management](#user-management)
5. [Security Features](#security-features)
6. [Troubleshooting](#troubleshooting)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)

---

## Quick Start

### For New Installations

1. **Access Setup Page**: Visit `http://localhost:3000/setup`
2. **Create First Admin**: Fill out the form with your details
3. **Auto-Login**: You'll be automatically logged in and redirected to `/admin`
4. **Start Managing**: Begin managing your spiritual content platform

### For Existing Installations

1. **Login**: Visit `http://localhost:3000/login`
2. **Enter Credentials**: Use your email and password
3. **Access Admin Panel**: Click the settings icon or navigate to `/admin`

---

## First-Time Setup

When your database has **zero users**, you'll need to create the first admin account.

### Setup Process

1. **Navigate to Setup Page**
   ```
   http://localhost:3000/setup
   ```

2. **Fill Out the Form**
   - **Name**: Your full name (e.g., "John Doe")
   - **Email**: Your email address (used for login)
   - **Password**: Minimum 8 characters
   - **Confirm Password**: Must match password field

3. **Submit Form**
   - Click "Create Admin Account"
   - System creates your admin user with bcrypt-hashed password
   - You're automatically logged in
   - Redirected to `/admin` dashboard

4. **Setup Page Behavior**
   - Only accessible when database has **zero users**
   - Once first admin exists, setup page redirects to `/login`
   - Cannot be used to bypass authentication

### What Happens Behind the Scenes

- Password is hashed with bcrypt (SALT_ROUNDS=10)
- User created with role: `'admin'`
- Email normalized (lowercase, trimmed)
- NextAuth session created automatically
- Redirected to admin panel

---

## Login & Authentication

### Login Page

**URL**: `http://localhost:3000/login`

**Features**:
- Email and password credentials
- Client-side validation (email format, required fields)
- Server-side authentication via NextAuth.js
- Error messages for invalid credentials
- Loading states during submission
- Auto-redirect to `/admin` on success

### Login Process

1. **Visit Login Page**: Navigate to `/login` or click settings icon from main app
2. **Enter Credentials**:
   - Email: Your registered email address
   - Password: Your account password
3. **Submit**: Click "Sign In" button
4. **Success**: Redirected to `/admin` dashboard
5. **Failure**: Error message displayed (check email/password)

### Logout

**Location**: Admin top icon bar (logout icon, far right)

**Process**:
1. Click logout icon in admin panel
2. Session cleared automatically
3. Redirected to home page (`/`)
4. All admin routes now require re-authentication

### Session Management

- **Duration**: 30 days (configurable in NextAuth config)
- **Type**: JWT-based (stateless, no database session storage)
- **Storage**: HttpOnly cookies (secure, not accessible via JavaScript)
- **Auto-Refresh**: Sessions refresh automatically when active
- **Persistence**: Remains valid across browser restarts (until expiration)

---

## User Management

### Accessing User Management

**URL**: `http://localhost:3000/admin/users`

**Requirements**: Must be logged in as admin

**Navigation**:
- Click "group" icon in admin top icon bar
- Or navigate directly to `/admin/users`

### User List Page

**Features**:
- View all users in system
- User cards display: Name, Email, Role badge, Created date
- Action buttons: Edit, Delete
- "Add New User" button
- User count display
- Loading and error states

**User Cards**:
- **Admin Badge**: Red (#dc2626)
- **User Badge**: Green (#16a34a)
- **Created Date**: Formatted as "MMM DD, YYYY"

### Creating a New User

1. **Navigate to Create Page**
   - Click "+ Add New User" button from user list
   - Or navigate to `/admin/users/new`

2. **Fill Out Form**
   - **Name**: Full name (required)
   - **Email**: Valid email format (required, must be unique)
   - **Password**: Minimum 8 characters (required)
   - **Confirm Password**: Must match password (required)
   - **Role**: Select 'user' or 'admin' from dropdown (required)

3. **Submit**
   - Click "Create User" button
   - Password automatically hashed with bcrypt
   - Email normalized (lowercase, trimmed)
   - Success: Redirected to user list
   - Error: Red error message displayed

4. **Validation**
   - Email format: Must be valid (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
   - Email uniqueness: Cannot use existing email
   - Password length: Minimum 8 characters
   - Password match: Confirm password must match
   - Role: Must be 'admin' or 'user'

### Editing a User

1. **Navigate to Edit Page**
   - Click "Edit" button on user card
   - Or navigate to `/admin/users/[user-id]`

2. **Edit User Details (Left Column)**
   - **Name**: Update full name
   - **Email**: Update email (must remain unique)
   - **Role**: Change between 'user' and 'admin'
   - Click "Save Changes" to update

3. **Change Password (Right Column)**
   - **New Password**: Minimum 8 characters
   - **Confirm New Password**: Must match new password
   - Click "Change Password" to update
   - **Note**: User will need to use new password on next login

4. **Back Button**: Returns to user list without saving

5. **Separate Forms**: User details and password are updated independently

### Deleting a User

1. **Click Delete Button**: On user card in user list
2. **Confirmation Modal Appears**:
   - Shows user name and email
   - "Are you sure?" message
   - Cancel or Delete Permanently buttons
3. **Confirm Deletion**: Click "Delete Permanently"
4. **User Removed**: User list refreshes automatically

**Important**: Deletion is permanent and cannot be undone.

---

## Security Features

### Password Security

- **Hashing**: All passwords hashed with bcrypt (SALT_ROUNDS=10)
- **Never Stored**: Plain-text passwords never stored in database
- **Minimum Length**: 8 characters required
- **Validation**: Client-side and server-side validation
- **API Security**: Password hash excluded from all GET responses

### Authentication Security

- **JWT Strategy**: Stateless authentication via JSON Web Tokens
- **HttpOnly Cookies**: Session tokens not accessible via JavaScript (XSS protection)
- **Session Timeout**: 30-day expiration (configurable)
- **Secure Transmission**: All passwords sent over HTTPS in production
- **CSRF Protection**: NextAuth.js handles automatically

### Role-Based Access Control

- **Admin Role**: Full access to all features, user management
- **User Role**: Reserved for future expansion (currently no access)
- **Route Protection**: All `/admin/*` routes require authentication
- **API Protection**: All user management endpoints require admin role

### Self-Protection

**Admins Cannot**:
- Delete their own account
- Change their own role to 'user'

**System Prevents**:
- Deleting the last admin user
- Demoting the last admin to user role

**Why**: Ensures at least one admin always has access to the system.

### Server-Side Validation

All critical operations validated on server:
- Email format validation (regex)
- Email uniqueness checks
- Password strength requirements
- Role validation ('admin' or 'user' only)
- User existence checks
- Self-protection checks
- Last admin protection checks

### SQL Injection Prevention

- **Parameterized Queries**: All database queries use parameterized SQL
- **No String Concatenation**: User input never concatenated into SQL
- **Type Safety**: TypeScript interfaces enforce correct data types

---

## Troubleshooting

### Cannot Access Setup Page

**Symptom**: Setup page redirects to `/login`

**Cause**: Database already has users

**Solution**: This is expected behavior. Use `/login` instead. Setup page only works when database has zero users.

---

### Login Fails with Correct Credentials

**Symptom**: "Invalid email or password" error

**Possible Causes**:
1. Email case mismatch (emails are stored lowercase)
2. Wrong password
3. User doesn't exist in database
4. NEXTAUTH_SECRET not set in `.env`

**Solutions**:
1. **Check Email**: Ensure email is lowercase (auto-normalized on create)
2. **Reset Password**: Have another admin reset your password via `/admin/users/[id]`
3. **Check Database**: Verify user exists: `SELECT * FROM users WHERE email = 'your@email.com';`
4. **Check Environment**: Ensure `.env` has `NEXTAUTH_SECRET` set
5. **Restart Server**: After changing `.env`, restart `npm run dev`

---

### Cannot Access Admin Panel

**Symptom**: Redirected to `/login` when visiting `/admin`

**Cause**: Not authenticated or not admin role

**Solutions**:
1. **Login First**: Visit `/login` and enter credentials
2. **Check Role**: Verify you're an admin (not user role)
3. **Check Session**: Visit `/api/auth/session` to see current session
4. **Clear Cookies**: Clear browser cookies and login again

---

### Cannot Delete User

**Symptom**: Error message when clicking Delete

**Possible Messages**:
- "Cannot delete your own account"
- "Cannot delete the last admin user"
- "User not found"

**Solutions**:
- **Self-Deletion**: Cannot delete yourself (security feature)
- **Last Admin**: Create another admin first, then delete
- **User Not Found**: Refresh page and try again

---

### Cannot Change User Role

**Symptom**: Error when trying to demote admin to user

**Possible Messages**:
- "Cannot change your own role"
- "Cannot change role of last admin user"

**Solutions**:
- **Self-Demotion**: Cannot change your own role (security feature)
- **Last Admin**: Create another admin first, then demote

---

### NEXTAUTH_SECRET Error

**Symptom**: Server logs show NextAuth errors

**Cause**: Missing or invalid `NEXTAUTH_SECRET` in `.env`

**Solution**:
1. **Generate Secret**: Run `openssl rand -base64 32`
2. **Add to .env**: `NEXTAUTH_SECRET=your_generated_secret_here`
3. **Restart Server**: Stop and restart `npm run dev`

---

### Email Already Exists

**Symptom**: Error when creating user: "Email already exists"

**Cause**: Another user already registered with that email

**Solutions**:
1. **Use Different Email**: Choose a unique email address
2. **Update Existing User**: Edit the existing user instead of creating new
3. **Check Database**: `SELECT * FROM users WHERE email = 'email@example.com';`

---

### Password Too Short

**Symptom**: Error: "Password must be at least 8 characters"

**Cause**: Password doesn't meet minimum length requirement

**Solution**: Use a password with at least 8 characters (letters, numbers, symbols)

---

## API Reference

### Authentication Endpoints

#### POST /api/auth/signin
**Purpose**: Authenticate user with credentials

**Method**: Handled by NextAuth.js (use `signIn()` client-side)

**Client Example**:
```typescript
import { signIn } from 'next-auth/react'

const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'password123',
  redirect: false
})

if (result?.error) {
  console.error('Login failed:', result.error)
} else {
  console.log('Login successful')
}
```

---

#### GET /api/auth/signout
**Purpose**: Sign out current user

**Method**: Handled by NextAuth.js (use `signOut()` client-side)

**Client Example**:
```typescript
import { signOut } from 'next-auth/react'

await signOut({ callbackUrl: '/' })
```

---

#### GET /api/auth/session
**Purpose**: Get current session

**Response**:
```json
{
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  },
  "expires": "2025-12-16T00:00:00.000Z"
}
```

---

### Setup Endpoint

#### GET /api/setup
**Purpose**: Check if setup is needed

**Auth**: None required

**Response**:
```json
{
  "status": "success",
  "hasUsers": false
}
```

---

#### POST /api/setup
**Purpose**: Create first admin user

**Auth**: None required (only works when zero users exist)

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "status": "success",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "created_at": "2025-11-16T00:00:00.000Z",
    "updated_at": "2025-11-16T00:00:00.000Z"
  }
}
```

**Errors**:
- 403: Users already exist (setup already complete)
- 400: Validation errors (email format, password length)

---

### User Management Endpoints

#### GET /api/users
**Purpose**: List all users

**Auth**: Admin required

**Response**:
```json
{
  "status": "success",
  "users": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "created_at": "2025-11-16T00:00:00.000Z",
      "updated_at": "2025-11-16T00:00:00.000Z"
    }
  ]
}
```

**Note**: `password_hash` excluded for security

---

#### POST /api/users
**Purpose**: Create new user

**Auth**: Admin required

**Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "user"
}
```

**Validation**:
- Email: Must be valid format, unique
- Password: Minimum 8 characters
- Role: Must be 'admin' or 'user'

**Response**:
```json
{
  "status": "success",
  "user": {
    "id": "new-user-uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user",
    "created_at": "2025-11-16T00:00:00.000Z",
    "updated_at": "2025-11-16T00:00:00.000Z"
  }
}
```

**Errors**:
- 400: Email already exists
- 400: Invalid email format
- 400: Password too short
- 400: Invalid role

---

#### GET /api/users/[id]
**Purpose**: Get single user by ID

**Auth**: Admin required

**Response**:
```json
{
  "status": "success",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "created_at": "2025-11-16T00:00:00.000Z",
    "updated_at": "2025-11-16T00:00:00.000Z"
  }
}
```

**Errors**:
- 404: User not found

---

#### PATCH /api/users/[id]
**Purpose**: Update user details (name, email, role)

**Auth**: Admin required

**Body** (all fields optional):
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "user"
}
```

**Validation**:
- Email: Must be valid format, unique (if provided)
- Role: Must be 'admin' or 'user' (if provided)
- Cannot change own role (self-protection)
- Cannot change last admin's role (system protection)

**Response**:
```json
{
  "status": "success",
  "user": {
    "id": "user-uuid",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "user",
    "created_at": "2025-11-16T00:00:00.000Z",
    "updated_at": "2025-11-16T12:30:00.000Z"
  }
}
```

**Errors**:
- 404: User not found
- 400: Cannot change own role
- 400: Cannot change last admin's role
- 400: Email already exists
- 400: Invalid email format

---

#### DELETE /api/users/[id]
**Purpose**: Delete user

**Auth**: Admin required

**Validation**:
- Cannot delete yourself (self-protection)
- Cannot delete last admin (system protection)

**Response**:
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

**Errors**:
- 404: User not found
- 400: Cannot delete your own account
- 400: Cannot delete the last admin user

---

#### POST /api/users/[id]/password
**Purpose**: Update user password

**Auth**: Admin required

**Body**:
```json
{
  "newPassword": "newpassword123"
}
```

**Validation**:
- Password: Minimum 8 characters

**Response**:
```json
{
  "status": "success",
  "message": "Password updated successfully"
}
```

**Errors**:
- 404: User not found
- 400: Password too short (minimum 8 characters)

**Note**: User will need to use new password on next login.

---

## Best Practices

### Password Management

✅ **DO**:
- Use strong passwords (mix of letters, numbers, symbols)
- Use minimum 8 characters (longer is better)
- Use unique passwords for each account
- Change passwords periodically
- Store passwords in password manager

❌ **DON'T**:
- Share passwords with others
- Use common passwords (password123, admin, etc.)
- Reuse passwords across systems
- Write passwords in plain text
- Store passwords in code or version control

### User Management

✅ **DO**:
- Create separate accounts for each person
- Assign appropriate roles (user vs admin)
- Remove users when they leave the organization
- Regularly audit user list for inactive accounts
- Keep at least 2 admin users for redundancy

❌ **DON'T**:
- Share admin credentials
- Create unnecessary admin accounts
- Delete the last admin user
- Use generic accounts (admin@company.com)
- Leave inactive accounts enabled

### Security

✅ **DO**:
- Use HTTPS in production (Railway provides this)
- Keep NEXTAUTH_SECRET secure and secret
- Regenerate NEXTAUTH_SECRET if compromised
- Use different secrets for dev and production
- Monitor server logs for authentication errors
- Keep dependencies updated (npm update)

❌ **DON'T**:
- Commit `.env` file to git
- Share NEXTAUTH_SECRET publicly
- Use weak or default secrets
- Disable authentication for convenience
- Allow public access to admin routes

### Database Maintenance

✅ **DO**:
- Backup database regularly
- Test backups periodically
- Monitor database size and performance
- Keep database credentials secure
- Use strong database passwords

❌ **DON'T**:
- Manually edit password_hash in database
- Share database credentials
- Run DELETE queries without WHERE clause
- Truncate users table (creates orphaned sessions)

### Development Workflow

✅ **DO**:
- Test authentication in development before deploying
- Verify all user CRUD operations work
- Test self-protection and last admin protection
- Check TypeScript compilation: `npx tsc --noEmit`
- Run production build: `npm run build`
- Test login/logout flows

❌ **DON'T**:
- Deploy without testing authentication
- Skip validation checks
- Modify authentication code without testing
- Deploy with failing TypeScript errors

---

## Production Deployment Checklist

Before deploying to Railway:

- [ ] **Environment Variables Set**:
  - `NEXTAUTH_URL` set to production URL
  - `NEXTAUTH_SECRET` set to strong secret (different from dev)
  - `DATABASE_URL` configured (Railway auto-provides)

- [ ] **Database Ready**:
  - Users table created (migration runs automatically)
  - Database accessible from Railway app

- [ ] **Code Quality**:
  - TypeScript compiles: `npx tsc --noEmit` (0 errors)
  - Production build succeeds: `npm run build`
  - No console errors in browser

- [ ] **Testing Complete**:
  - Setup page creates first admin
  - Login works with valid credentials
  - Login fails with invalid credentials
  - Admin panel requires authentication
  - Main content (/) remains public
  - User CRUD operations work
  - Self-protection works (cannot delete self)
  - Last admin protection works

- [ ] **Documentation Updated**:
  - CLAUDE.md includes authentication info
  - USER_ACCOUNTS_README.md reviewed
  - Team knows how to access admin panel

- [ ] **Security Verified**:
  - NEXTAUTH_SECRET is strong and unique
  - HTTPS enabled (Railway default)
  - Password requirements enforced
  - Admin routes protected

---

## Support & Feedback

### Getting Help

1. **Check This Guide**: Most questions answered in troubleshooting section
2. **Check CLAUDE.md**: Technical reference for developers
3. **Check Server Logs**: Look for error messages in terminal
4. **Check Browser Console**: Look for client-side errors

### Common Questions

**Q: Can I change my own password?**
A: Currently, only other admins can change passwords via User Management page. Self-service password change coming in future version.

**Q: What's the difference between 'admin' and 'user' roles?**
A: Currently, only 'admin' role has access to `/admin` panel. 'user' role reserved for future content permissions.

**Q: Can I reset a forgotten password?**
A: Currently, another admin must reset your password via `/admin/users/[id]`. Email-based password reset coming in future version.

**Q: How do I create the first admin if locked out?**
A: Run SQL directly: `DELETE FROM users;` then visit `/setup` to create new admin. ⚠️ This deletes ALL users!

**Q: Can I customize session timeout?**
A: Yes, edit `maxAge` in `src/app/api/auth/[...nextauth]/route.ts` (default: 30 days).

---

**Document Version**: 1.0
**Last Updated**: November 16, 2025
**Status**: Production Ready
**Lines**: 800+

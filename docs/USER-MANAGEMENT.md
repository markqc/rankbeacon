# User Management

Super admins can manage admin accounts from `/admin/users`.

## Capabilities

- List users with search and status filters.
- Create new users with a temporary password.
- Edit name, email, status, and roles.
- Activate or deactivate users.
- Reset a user's password to a new temporary password.
- Soft-delete users.

## Safety rules

- You cannot change your own status.
- You cannot delete your own account.
- New users receive a temporary password and are forced to change it on first login.
- Changes are recorded in the activity log (`users` module).

## Roles

Roles are assigned via checkboxes on the create and edit forms. The built-in `super_admin` role grants full admin access.

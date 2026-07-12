import React from 'react';
import ProtectedRoute from './ProtectedRoute';

export default function RoleRoute({ roles, children }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}

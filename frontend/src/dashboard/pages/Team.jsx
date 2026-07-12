import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import EmployeeDirectory from '../ui/EmployeeDirectory';

export default function Team() {
  return (
    <div style={{ padding: '1.5rem' }}>
      <PageHeader title="Team" subtitle="Employee directory, roles and account status" />
      <EmployeeDirectory />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { useApi } from '../../hooks/useApi';
import { organizationService } from '../../services/resourceService';
import { changePassword } from '../../services/authService';
import { Loading, ErrorState, Card, Field, Input, Textarea, PrimaryButton } from '../ui/DataStates';

export default function Settings() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader title="Settings" subtitle="Organization profile and account security" />
      <OrganizationProfile />
      <ChangePassword />
    </div>
  );
}

function OrganizationProfile() {
  const org = useApi(() => organizationService.get(), []);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (org.data) {
      setForm({
        organizationName: org.data.organizationName || '',
        legalName: org.data.legalName || '',
        email: org.data.email || '',
        phone: org.data.phone || '',
        website: org.data.website || '',
        city: org.data.city || '',
        country: org.data.country || '',
        timezone: org.data.timezone || '',
        currency: org.data.currency || '',
        description: org.data.description || '',
      });
    }
  }, [org.data]);

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setMsg(''); setError(''); };

  const save = async () => {
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await organizationService.update(form);
      setMsg('Organization profile updated.');
      org.refetch();
    } catch (err) {
      setError(err.fieldErrors ? Object.values(err.fieldErrors).join(' ') : err.message);
    }
    setSaving(false);
  };

  return (
    <Card style={{ padding: '1.25rem' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>Organization Profile</h3>
      {org.loading || !form ? <Loading /> : org.error ? <ErrorState message={org.error} onRetry={org.refetch} /> : (
        <>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Organization code: <strong style={{ color: 'var(--text-primary)' }}>{org.data.organizationCode}</strong>
          </div>
          <div className="af-form-grid">
            <Field label="Organization name"><Input value={form.organizationName} onChange={set('organizationName')} /></Field>
            <Field label="Legal name"><Input value={form.legalName} onChange={set('legalName')} /></Field>
            <Field label="Contact email"><Input type="email" value={form.email} onChange={set('email')} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={set('phone')} /></Field>
            <Field label="Website"><Input value={form.website} onChange={set('website')} /></Field>
            <Field label="City"><Input value={form.city} onChange={set('city')} /></Field>
            <Field label="Country"><Input value={form.country} onChange={set('country')} /></Field>
            <Field label="Timezone"><Input value={form.timezone} onChange={set('timezone')} /></Field>
            <Field label="Currency"><Input value={form.currency} onChange={set('currency')} /></Field>
            <Field label="Description" full><Textarea value={form.description} onChange={set('description')} /></Field>
          </div>
          {msg && <p style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '0.75rem' }}>{msg}</p>}
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.75rem' }}>{error}</p>}
          <div style={{ marginTop: '1rem' }}>
            <PrimaryButton onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</PrimaryButton>
          </div>
        </>
      )}
    </Card>
  );
}

function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setMsg(''); setError(''); };

  const save = async () => {
    if (form.newPassword.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setSaving(true);
    setMsg('');
    setError('');
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setMsg('Password changed. Other sessions have been signed out.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.fieldErrors ? Object.values(err.fieldErrors).join(' ') : err.message);
    }
    setSaving(false);
  };

  return (
    <Card style={{ padding: '1.25rem' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>Change Password</h3>
      <div className="af-form-grid">
        <Field label="Current password" full><Input type="password" value={form.currentPassword} onChange={set('currentPassword')} /></Field>
        <Field label="New password"><Input type="password" value={form.newPassword} onChange={set('newPassword')} /></Field>
        <Field label="Confirm new password"><Input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} /></Field>
      </div>
      {msg && <p style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '0.75rem' }}>{msg}</p>}
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.75rem' }}>{error}</p>}
      <div style={{ marginTop: '1rem' }}>
        <PrimaryButton onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Change Password'}</PrimaryButton>
      </div>
    </Card>
  );
}

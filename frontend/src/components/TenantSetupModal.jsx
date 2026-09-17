import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const TenantSetupModal = () => {
  const { user, saveTenant } = useAuth();
  const [form, setForm] = useState({
    name: '',
    shopifyStoreUrl: '',
    apiKey: '',
    apiSecret: ''
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user || user.tenant) {
    return null;
  }

  const handleChange = (event) => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.shopifyStoreUrl.trim() || !form.apiKey.trim() || !form.apiSecret.trim()) {
      setError('Store URL, API key, and API secret are required.');
      return;
    }

    setSaving(true);
    try {
      await saveTenant(form);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-left shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Shopify connection</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Connect your store</h2>
        <p className="mt-2 text-sm text-slate-600">
          Add your Shopify credentials to continue to your analytics dashboard.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Store name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="My Shopify Store"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Store URL
            <input
              name="shopifyStoreUrl"
              value={form.shopifyStoreUrl}
              onChange={handleChange}
              placeholder="your-store.myshopify.com"
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Shopify API key
            <input
              name="apiKey"
              value={form.apiKey}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Shopify API secret
            <input
              name="apiSecret"
              type="password"
              value={form.apiSecret}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving details...' : 'Save and continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TenantSetupModal;

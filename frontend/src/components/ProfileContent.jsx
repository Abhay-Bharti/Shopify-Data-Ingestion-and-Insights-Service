import React, { useEffect, useState } from 'react';
import { FiLock, FiMail, FiSave, FiServer, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ProfileContent = () => {
  const { user, updateProfile, updateTenant } = useAuth();
  const [account, setAccount] = useState({ name: '', email: '', password: '' });
  const [shopify, setShopify] = useState({ name: '', shopifyStoreUrl: '', apiKey: '', apiSecret: '' });
  const [accountMessage, setAccountMessage] = useState('');
  const [shopifyMessage, setShopifyMessage] = useState('');
  const [accountError, setAccountError] = useState('');
  const [shopifyError, setShopifyError] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingShopify, setSavingShopify] = useState(false);

  useEffect(() => {
    setAccount({ name: user?.name || '', email: user?.email || '', password: '' });
    setShopify({
      name: user?.tenant?.name || '',
      shopifyStoreUrl: user?.tenant?.shopifyStoreUrl || '',
      apiKey: '',
      apiSecret: ''
    });
  }, [user]);

  const changeAccount = (event) => setAccount(current => ({ ...current, [event.target.name]: event.target.value }));
  const changeShopify = (event) => setShopify(current => ({ ...current, [event.target.name]: event.target.value }));

  const submitAccount = async (event) => {
    event.preventDefault();
    setSavingAccount(true);
    setAccountError('');
    setAccountMessage('');
    try {
      await updateProfile(account);
      setAccount(current => ({ ...current, password: '' }));
      setAccountMessage('Account details updated.');
    } catch (error) {
      setAccountError(error.message);
    } finally {
      setSavingAccount(false);
    }
  };

  const submitShopify = async (event) => {
    event.preventDefault();
    setSavingShopify(true);
    setShopifyError('');
    setShopifyMessage('');
    try {
      await updateTenant(shopify);
      setShopify(current => ({ ...current, apiKey: '', apiSecret: '' }));
      setShopifyMessage('Shopify details updated.');
    } catch (error) {
      setShopifyError(error.message);
    } finally {
      setSavingShopify(false);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><FiUser className="h-5 w-5" /></div>
          <div><h2 className="text-lg font-semibold text-gray-900">Account details</h2><p className="text-sm text-gray-500">Update your login information.</p></div>
        </div>
        <form className="mt-5 space-y-4" onSubmit={submitAccount}>
          <label className="block text-sm font-medium text-gray-700">Name<input name="name" required value={account.name} onChange={changeAccount} className={inputClass} /></label>
          <label className="block text-sm font-medium text-gray-700">Gmail / email<input name="email" type="email" required value={account.email} onChange={changeAccount} className={inputClass} /></label>
          <label className="block text-sm font-medium text-gray-700">New password<input name="password" type="password" minLength="6" value={account.password} onChange={changeAccount} placeholder="Leave blank to keep current password" className={inputClass} /></label>
          {accountError && <p className="text-sm text-red-600">{accountError}</p>}
          {accountMessage && <p className="text-sm text-green-600">{accountMessage}</p>}
          <button disabled={savingAccount} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><FiSave />{savingAccount ? 'Saving...' : 'Save account'}</button>
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><FiServer className="h-5 w-5" /></div>
          <div><h2 className="text-lg font-semibold text-gray-900">Shopify connection</h2><p className="text-sm text-gray-500">Credentials are stored securely and never displayed.</p></div>
        </div>
        <form className="mt-5 space-y-4" onSubmit={submitShopify}>
          <label className="block text-sm font-medium text-gray-700">Store name<input name="name" value={shopify.name} onChange={changeShopify} className={inputClass} /></label>
          <label className="block text-sm font-medium text-gray-700">Store URL<input name="shopifyStoreUrl" required value={shopify.shopifyStoreUrl} onChange={changeShopify} placeholder="your-store.myshopify.com" className={inputClass} /></label>
          <label className="block text-sm font-medium text-gray-700">API key<input name="apiKey" required value={shopify.apiKey} onChange={changeShopify} placeholder="Enter API key to update" className={inputClass} /></label>
          <label className="block text-sm font-medium text-gray-700">API secret<input name="apiSecret" type="password" value={shopify.apiSecret} onChange={changeShopify} placeholder="Leave blank to keep current secret" className={inputClass} /></label>
          {shopifyError && <p className="text-sm text-red-600">{shopifyError}</p>}
          {shopifyMessage && <p className="text-sm text-green-600">{shopifyMessage}</p>}
          <button disabled={savingShopify} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"><FiSave />{savingShopify ? 'Saving...' : 'Save Shopify details'}</button>
        </form>
      </section>
    </div>
  );
};

export default ProfileContent;

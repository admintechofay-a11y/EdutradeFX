'use client';

import React from 'react';
import { useAuthStore } from '../../../store/authStore';
import BrokerProfileEditorPage from '../broker/profile/page';
import SignalProviderProfilePage from '../signal-provider/profile/page';
import AccountManagerProfilePage from '../account-manager/profile/page';
import AccountSettingsPage from '../settings/page';

export default function RoleAdaptiveProfilePage() {
  const { user } = useAuthStore();

  if (user?.role === 'BROKER') {
    return <BrokerProfileEditorPage />;
  }

  if (user?.role === 'SIGNAL_PROVIDER') {
    return <SignalProviderProfilePage />;
  }

  if (user?.role === 'ACCOUNT_MANAGER') {
    return <AccountManagerProfilePage />;
  }

  return <AccountSettingsPage />;
}

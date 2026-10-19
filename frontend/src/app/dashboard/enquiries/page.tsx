'use client';

import React from 'react';
import { useAuthStore } from '../../../store/authStore';
import SignalProviderEnquiriesPage from '../signal-provider/enquiries/page';
import AccountManagerEnquiriesPage from '../account-manager/enquiries/page';

export default function EnquiriesPage() {
  const { user } = useAuthStore();

  if (user?.role === 'ACCOUNT_MANAGER') {
    return <AccountManagerEnquiriesPage />;
  }

  return <SignalProviderEnquiriesPage />;
}

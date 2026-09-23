import { MOCK_BROKERS, MOCK_MANAGERS, MOCK_ACCOUNT_MANAGERS, MOCK_SIGNAL_PROVIDERS, MOCK_COURSES, MOCK_COMPLAINTS } from './mockData';

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  url = url.replace(/\/+$/, '');
  return url.endsWith('/api') ? url : `${url}/api`;
};

const API_BASE = getApiBase();

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Generic fetch with mock fallback
async function fetchWithFallback<T>(url: string, options: RequestInit = {}, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    const data = json.data !== undefined ? json.data : (json as T);
    if (Array.isArray(data) && data.length === 0 && Array.isArray(fallbackData) && (fallbackData as any[]).length > 0) {
      return fallbackData;
    }
    return data;
  } catch (err) {
    // Graceful fallback to mock data
    return fallbackData;
  }
}

export const api = {
  // Brokers
  async getBrokers(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithFallback(`${API_BASE}/brokers${qs}`, { method: 'GET' }, MOCK_BROKERS);
  },

  async getBrokerBySlug(slug: string) {
    const broker = MOCK_BROKERS.find((b) => b.slug === slug || b._id === slug) || MOCK_BROKERS[0];
    return fetchWithFallback(`${API_BASE}/brokers/${slug}`, { method: 'GET' }, broker);
  },

  async compareBrokers(slugs: string[]) {
    const filtered = MOCK_BROKERS.filter((b) => slugs.includes(b.slug) || slugs.includes(b._id));
    return fetchWithFallback(
      `${API_BASE}/brokers/compare?slugs=${slugs.join(',')}`,
      { method: 'GET' },
      filtered.length > 0 ? filtered : MOCK_BROKERS.slice(0, 3)
    );
  },

  // Account Managers
  async getAccountManagers(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithFallback(`${API_BASE}/account-managers${qs}`, { method: 'GET' }, MOCK_ACCOUNT_MANAGERS);
  },

  async getAccountManagerById(id: string) {
    const manager = MOCK_ACCOUNT_MANAGERS.find((m) => m._id === id) || MOCK_ACCOUNT_MANAGERS[0];
    return fetchWithFallback(`${API_BASE}/account-managers/${id}`, { method: 'GET' }, manager);
  },

  // Signal Providers
  async getSignalProviders(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithFallback(`${API_BASE}/signal-providers${qs}`, { method: 'GET' }, MOCK_SIGNAL_PROVIDERS);
  },

  async getSignalProviderById(id: string) {
    const provider = MOCK_SIGNAL_PROVIDERS.find((p) => p._id === id) || MOCK_SIGNAL_PROVIDERS[0];
    return fetchWithFallback(`${API_BASE}/signal-providers/${id}`, { method: 'GET' }, provider);
  },

  // Legacy Managers alias
  async getManagers(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithFallback(`${API_BASE}/account-managers${qs}`, { method: 'GET' }, MOCK_MANAGERS);
  },

  async getManagerById(id: string) {
    const manager = MOCK_MANAGERS.find((m) => m._id === id) || MOCK_MANAGERS[0];
    return fetchWithFallback(`${API_BASE}/account-managers/${id}`, { method: 'GET' }, manager);
  },

  // LMS
  async getCourses(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithFallback(`${API_BASE}/courses${qs}`, { method: 'GET' }, MOCK_COURSES);
  },

  async getCourseBySlug(slug: string) {
    const course = MOCK_COURSES.find((c) => c.slug === slug || c._id === slug) || MOCK_COURSES[0];
    return fetchWithFallback(`${API_BASE}/courses/${slug}`, { method: 'GET' }, course);
  },

  async getLessonById(id: string) {
    // Default mock lesson
    const fallbackLesson = {
      _id: id || 'l1',
      title: 'How Currencies Are Traded: The Base and Quote Pair',
      durationMinutes: 18,
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      content: `
### Understanding the Currency Pair Structure

In the Foreign Exchange (Forex) market, currencies are never traded in isolation. Whenever you make a trade, you are simultaneously **buying one currency while selling another**.

A standard forex quote looks like this:
\`\`\`text
EUR / USD = 1.08500
[Base] / [Quote] = [Price]
\`\`\`

#### 1. The Base Currency
- The first currency listed is the **Base currency** (here, the Euro).
- The base currency always equals **1 unit**.

#### 2. The Quote Currency
- The second currency listed is the **Quote currency** (here, the US Dollar).
- The quote currency indicates how much of the quote currency is required to purchase 1 unit of the base currency.

#### Real-World Example:
If you buy 1 standard lot (100,000 EUR) at **1.08500** and the price rises to **1.09200**:
- Price Difference: \`1.09200 - 1.08500 = +0.00700\` (70 pips)
- Profit: \`70 pips * $10 per pip = $700 USD\`
      `,
      quiz: {
        _id: 'q1',
        title: 'Currency Pairs & Mechanics Check',
        passingScorePercentage: 75,
        questions: [
          {
            question: 'In the currency pair GBP/USD = 1.3000, what is the base currency?',
            options: ['USD (US Dollar)', 'GBP (British Pound)', 'Both equally', 'Neither'],
            correctIndex: 1,
            explanation: 'The first currency in any forex pair is the base currency. In GBP/USD, GBP is the base currency.',
          },
          {
            question: 'If you believe the Japanese Yen will strengthen against the US Dollar, which action should you take on USD/JPY?',
            options: ['Buy (Go Long) USD/JPY', 'Sell (Go Short) USD/JPY', 'Hold USD/JPY', 'None of the above'],
            correctIndex: 1,
            explanation: 'If the quote currency (JPY) strengthens, it takes fewer USD to buy JPY, meaning USD/JPY will decline. Therefore, you should sell (short) USD/JPY.',
          },
        ],
      },
    };
    return fetchWithFallback(`${API_BASE}/lms/lessons/${id}`, { method: 'GET' }, fallbackLesson);
  },

  // Complaints
  async getComplaints(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithFallback(`${API_BASE}/complaints${qs}`, { method: 'GET' }, MOCK_COMPLAINTS);
  },

  async getComplaintByCaseId(caseId: string) {
    const complaint = MOCK_COMPLAINTS.find((c) => c.caseId.toLowerCase() === caseId.toLowerCase()) || MOCK_COMPLAINTS[0];
    return fetchWithFallback(`${API_BASE}/complaints/${caseId}`, { method: 'GET' }, complaint);
  },

  async createComplaint(data: FormData | Record<string, any>) {
    try {
      const isFormData = data instanceof FormData;
      const headers = getHeaders();
      if (isFormData) {
        delete headers['Content-Type'];
      }

      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });
      return await res.json();
    } catch (err) {
      // Mock success response
      const randomCase = `ETF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        success: true,
        message: `Dispute filed successfully with Case ID: ${randomCase}`,
        data: { caseId: randomCase },
      };
    }
  },

  // Admin Stats
  async getAdminStats() {
    const fallbackStats = {
      totalBrokers: 8,
      totalManagers: 6,
      totalCourses: 4,
      totalComplaints: 24,
      activeComplaints: 7,
      scamWarningsCount: 3,
      totalUsers: 1450,
      recentComplaints: MOCK_COMPLAINTS,
    };
    return fetchWithFallback(`${API_BASE}/admin/stats`, { method: 'GET' }, fallbackStats);
  },

  // ==========================================
  // BROKER SELF-SERVICE MODULE
  // ==========================================
  async getBrokerProfile() {
    return fetchWithFallback(`${API_BASE}/brokers/me/profile`, { method: 'GET' }, null);
  },

  async updateBrokerProfile(data: Record<string, any>) {
    const res = await fetch(`${API_BASE}/brokers/me/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async submitBrokerDocuments(documents: any[]) {
    const res = await fetch(`${API_BASE}/brokers/me/documents`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ documents }),
    });
    return res.json();
  },

  async submitBrokerForApproval() {
    const res = await fetch(`${API_BASE}/brokers/me/submit`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getBrokerLeads() {
    return fetchWithFallback(`${API_BASE}/brokers/me/leads`, { method: 'GET' }, []);
  },

  async replyBrokerLead(leadId: string, message: string) {
    const res = await fetch(`${API_BASE}/brokers/me/leads/${leadId}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  async getBrokerReviews() {
    return fetchWithFallback(`${API_BASE}/brokers/me/reviews`, { method: 'GET' }, []);
  },

  async replyBrokerReview(reviewId: string, comment: string) {
    const res = await fetch(`${API_BASE}/brokers/me/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ comment }),
    });
    return res.json();
  },

  // ==========================================
  // SIGNAL PROVIDER SELF-SERVICE MODULE
  // ==========================================
  async getSignalProviderProfile() {
    return fetchWithFallback(`${API_BASE}/signal-providers/me/profile`, { method: 'GET' }, null);
  },

  async updateSignalProviderProfile(data: Record<string, any>) {
    const res = await fetch(`${API_BASE}/signal-providers/me/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async submitSignalProviderForApproval() {
    const res = await fetch(`${API_BASE}/signal-providers/me/submit`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getMySignals() {
    return fetchWithFallback(`${API_BASE}/signal-providers/me/signals`, { method: 'GET' }, []);
  },

  async createSignal(signalData: Record<string, any>) {
    const res = await fetch(`${API_BASE}/signal-providers/me/signals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(signalData),
    });
    return res.json();
  },

  async updateSignal(id: string, signalData: Record<string, any>) {
    const res = await fetch(`${API_BASE}/signal-providers/me/signals/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(signalData),
    });
    return res.json();
  },

  async deleteSignal(id: string) {
    const res = await fetch(`${API_BASE}/signal-providers/me/signals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getSignalSubscribers() {
    return fetchWithFallback(`${API_BASE}/signal-providers/me/subscribers`, { method: 'GET' }, []);
  },

  async getSignalProviderReviews() {
    return fetchWithFallback(`${API_BASE}/signal-providers/me/reviews`, { method: 'GET' }, []);
  },

  async replySignalProviderReview(reviewId: string, comment: string) {
    const res = await fetch(`${API_BASE}/signal-providers/me/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ comment }),
    });
    return res.json();
  },

  // ==========================================
  // TUTOR SELF-SERVICE MODULE
  // ==========================================
  async getMyCourses() {
    return fetchWithFallback(`${API_BASE}/courses/me/courses`, { method: 'GET' }, []);
  },

  async createCourse(courseData: Record<string, any>) {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(courseData),
    });
    return res.json();
  },

  async updateCourse(id: string, courseData: Record<string, any>) {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(courseData),
    });
    return res.json();
  },

  async deleteCourse(id: string) {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async submitCourseForApproval(id: string) {
    const res = await fetch(`${API_BASE}/courses/${id}/submit`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async togglePublishCourse(id: string) {
    const res = await fetch(`${API_BASE}/courses/${id}/publish`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getTutorEarnings() {
    return fetchWithFallback(
      `${API_BASE}/courses/me/earnings`,
      { method: 'GET' },
      { totalSales: 0, totalRevenue: 0, pendingPayouts: 0, sales: [] }
    );
  },

  async getTutorPayouts() {
    return fetchWithFallback(`${API_BASE}/courses/me/payouts`, { method: 'GET' }, []);
  },

  async requestPayout(data: { amount: number; paymentMethod: string; accountDetails: string }) {
    const res = await fetch(`${API_BASE}/courses/me/payouts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ==========================================
  // ADMIN PLATFORM-WIDE CONTROLS
  // ==========================================
  async getAdminBrokers() {
    return fetchWithFallback(`${API_BASE}/brokers/admin/all`, { method: 'GET' }, []);
  },

  async updateBrokerApproval(id: string, approvalStatus: string, rejectionReason?: string) {
    const res = await fetch(`${API_BASE}/brokers/admin/${id}/approval`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ approvalStatus, rejectionReason }),
    });
    return res.json();
  },

  async getAdminSignalProviders() {
    return fetchWithFallback(`${API_BASE}/signal-providers/admin/all`, { method: 'GET' }, []);
  },

  async updateSignalProviderApproval(id: string, approvalStatus: string, rejectionReason?: string) {
    const res = await fetch(`${API_BASE}/signal-providers/admin/${id}/approval`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ approvalStatus, rejectionReason }),
    });
    return res.json();
  },

  async getAdminCourses() {
    return fetchWithFallback(`${API_BASE}/courses/admin/all`, { method: 'GET' }, []);
  },

  async updateCourseApproval(id: string, approvalStatus: string, rejectionReason?: string) {
    const res = await fetch(`${API_BASE}/courses/admin/${id}/approval`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ approvalStatus, rejectionReason }),
    });
    return res.json();
  },

  async getAdminUsers(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithFallback(`${API_BASE}/admin/users${qs}`, { method: 'GET' }, { users: [], total: 0 });
  },

  async updateUserRole(id: string, role: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  async updateUserStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async deleteUser(id: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  async getAuditLogs(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithFallback(`${API_BASE}/admin/audit-logs${qs}`, { method: 'GET' }, []);
  },

  async getAdminPayouts() {
    return fetchWithFallback(`${API_BASE}/admin/payouts`, { method: 'GET' }, []);
  },

  async updatePayoutStatus(id: string, status: string, adminNote?: string) {
    const res = await fetch(`${API_BASE}/admin/payouts/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, adminNote }),
    });
    return res.json();
  },
};

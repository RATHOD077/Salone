import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LockKeyhole,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Phone,
  MessageCircle,
  ExternalLink,
  LogOut,
  Star,
  ShieldCheck,
  ChevronRight,
  Check,
} from 'lucide-react';
import { SALON_NAME, SALON_TAGLINE, API_BASE_URL } from '../utils/constants';

const AUTH_STORAGE_KEY = 'salon_admin_token';
const AUTH_EMAIL_KEY = 'salon_admin_email';

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY) || '');
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem(AUTH_EMAIL_KEY) || 'haircraftsaloon1@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'new' | 'contacted' | 'resolved'
  const [ratingFilter, setRatingFilter] = useState('all'); // 'all' | '1' | '2' | '3' | '4' | '5'

  const apiBase = API_BASE_URL;

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  const handleLogout = useCallback(() => {
    setToken('');
    setPassword('');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setFeedbackList([]);
    setStats(null);
    showToast('Logged out.');
  }, [showToast]);

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  const loadDashboardData = useCallback(async (currentToken = token) => {
    if (!currentToken) return;
    setLoading(true);
    setError('');

    try {
      const headers = {
        'x-admin-token': currentToken,
      };

      const [listRes, statsRes] = await Promise.all([
        fetch(`${apiBase}/api/feedback`, { headers }),
        fetch(`${apiBase}/api/admin/stats`, { headers }),
      ]);

      if (listRes.status === 401 || statsRes.status === 401) {
        handleLogout();
        throw new Error('Session expired. Please log in again.');
      }

      const listData = await listRes.json();
      const statsData = await statsRes.json();

      if (!listRes.ok) throw new Error(listData.error || 'Failed to load feedback list.');
      setFeedbackList(Array.isArray(listData) ? listData : []);
      if (statsRes.ok) setStats(statsData);
    } catch (err) {
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  }, [token, apiBase, handleLogout]);

  useEffect(() => {
    if (token) {
      void loadDashboardData(token);
    }
  }, [token, loadDashboardData]);

  // ─── Login Handler ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiBase}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials.');

      const userToken = data.token;
      setToken(userToken);

      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, userToken);
        localStorage.setItem(AUTH_EMAIL_KEY, adminEmail);
      } else {
        sessionStorage.setItem(AUTH_STORAGE_KEY, userToken);
      }

      showToast('Logged in successfully!');
      void loadDashboardData(userToken);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── Status Update ──────────────────────────────────────────────────────────
  const handleUpdateStatus = async (id, newStatus) => {
    setFeedbackList((prev) =>
      prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
    );

    try {
      const res = await fetch(`${apiBase}/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Status update failed');
      showToast(`Marked as ${newStatus}`);
      fetch(`${apiBase}/api/admin/stats`, {
        headers: { 'x-admin-token': token },
      })
        .then((r) => r.json())
        .then((data) => setStats(data))
        .catch(() => {});
    } catch {
      showToast('Failed to update status on server');
      void loadDashboardData();
    }
  };

  // ─── Delete Item ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer feedback?')) return;

    setFeedbackList((prev) => prev.filter((item) => item._id !== id));

    try {
      const res = await fetch(`${apiBase}/api/feedback/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': token,
        },
      });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Feedback removed');
    } catch {
      showToast('Could not delete feedback');
      void loadDashboardData();
    }
  };

  // ─── Export to CSV ──────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (filteredFeedback.length === 0) {
      showToast('No feedback to export.');
      return;
    }

    const headers = ['Date', 'Customer Name', 'Phone', 'Rating', 'Status', 'Feedback Message'];
    const rows = filteredFeedback.map((item) => [
      `"${new Date(item.createdAt).toLocaleString()}"`,
      `"${(item.name || 'Anonymous').replace(/"/g, '""')}"`,
      `"${item.phone || ''}"`,
      item.rating || 1,
      `"${item.status || 'new'}"`,
      `"${(item.comment || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `HairCraft_Feedback_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Feedback exported to CSV!');
  };

  // ─── Filtering & Search ─────────────────────────────────────────────────────
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      if (statusFilter !== 'all') {
        const itemStatus = item.status || 'new';
        if (itemStatus !== statusFilter) return false;
      }

      if (ratingFilter !== 'all') {
        if (Number(item.rating) !== Number(ratingFilter)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const phoneMatch = (item.phone || '').toLowerCase().includes(q);
        const commentMatch = (item.comment || '').toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !commentMatch) return false;
      }

      return true;
    });
  }, [feedbackList, statusFilter, ratingFilter, searchQuery]);

  const counts = useMemo(() => {
    const total = feedbackList.length;
    const newItems = feedbackList.filter((i) => !i.status || i.status === 'new').length;
    const contacted = feedbackList.filter((i) => i.status === 'contacted').length;
    const resolved = feedbackList.filter((i) => i.status === 'resolved').length;
    return { total, newItems, contacted, resolved };
  }, [feedbackList]);

  // ─── LOGIN VIEW ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="page-enter min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-salon-50 via-white to-pink-50">
        <div className="w-full max-w-md mx-auto">
          <div className="card shadow-2xl border-pink-100 p-8 sm:p-10 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt={SALON_NAME}
                  className="w-20 h-20 rounded-full object-cover shadow-xl border-2 border-white ring-2 ring-pink-200 bg-black"
                />
                <span className="absolute bottom-0 right-0 p-1.5 bg-salon-600 rounded-full text-white shadow-md">
                  <ShieldCheck size={14} />
                </span>
              </div>

              <div>
                <h1 className="font-display text-2xl font-bold text-gray-800">
                  {SALON_NAME}
                </h1>
                <p className="text-xs font-semibold text-salon-600 uppercase tracking-widest mt-0.5">
                  Manager & Admin Portal
                </p>
                <p className="text-xs text-gray-400 mt-1.5">
                  Sign in to view private customer feedback and salon ratings
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    placeholder="haircraftsaloon1@gmail.com"
                    className="form-input pl-10 text-sm py-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter admin password"
                    className="form-input pl-10 pr-10 text-sm py-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-salon-600 focus:ring-salon-400"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-gray-400">Default: admin@123</span>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm mt-2 shadow-lg shadow-pink-200"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LockKeyhole size={16} />
                    <span>Enter Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-gray-100">
              <a
                href="/"
                className="text-xs text-gray-400 hover:text-salon-600 transition-colors inline-flex items-center gap-1"
              >
                <span>Return to Customer Review Form</span>
                <ChevronRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD VIEW ─────────────────────────────────────────────────────────
  return (
    <div className="page-enter min-h-screen bg-gray-50/60 pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce-star">
          <CheckCircle2 size={16} className="text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-pink-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt={SALON_NAME}
              className="w-10 h-10 rounded-full object-cover border border-pink-200 bg-black shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base text-gray-800 leading-tight">
                  {SALON_NAME}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-100 text-salon-700 px-2 py-0.5 rounded-full border border-pink-200">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">{SALON_TAGLINE}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{stats?.storage === 'mongodb' ? 'MongoDB Online' : 'Local Storage Online'}</span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-salon-600 bg-gray-100 hover:bg-pink-50 px-3 py-2 rounded-xl transition-all"
            >
              <ExternalLink size={13} />
              <span>Customer Link</span>
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-3.5 py-2 rounded-xl transition-all"
              title="Logout from admin session"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">

        {/* ── KPI Summary Cards ───────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-pink-100 shadow-sm flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">Total Feedback</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-bold text-gray-800">
                {counts.total}
              </span>
              <span className="text-[11px] text-gray-400">received</span>
            </div>
          </div>

          <div className="bg-orange-50/70 rounded-2xl p-4 sm:p-5 border border-orange-200/80 shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-800">Needs Attention</span>
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-bold text-orange-700">
                {counts.newItems}
              </span>
              <span className="text-[11px] text-orange-600 font-medium">unresolved</span>
            </div>
          </div>

          <div className="bg-blue-50/70 rounded-2xl p-4 sm:p-5 border border-blue-200/80 shadow-sm flex flex-col gap-1">
            <span className="text-xs font-semibold text-blue-800">In Progress</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-bold text-blue-700">
                {counts.contacted}
              </span>
              <span className="text-[11px] text-blue-600 font-medium">contacted</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-sm flex flex-col gap-1">
            <span className="text-xs font-semibold text-emerald-800">Resolved</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-bold text-emerald-700">
                {counts.resolved}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">addressed</span>
            </div>
          </div>
        </section>

        {/* ── Toolbar: Search, Filters, CSV Export ──────────────────── */}
        <section className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, or message..."
              className="form-input pl-10 text-xs sm:text-sm py-2.5 bg-gray-50/80"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-salon-400"
            >
              <option value="all">⭐ All Ratings</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-2.5 rounded-xl transition-all"
              title="Download customer feedback as CSV/Excel"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => loadDashboardData()}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold text-salon-600 bg-salon-50 hover:bg-salon-100 px-3.5 py-2.5 rounded-xl transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </section>

        {/* ── Status Tab Navigation ───────────────────────────────── */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Feedback', count: counts.total },
            { id: 'new', label: 'Needs Action', count: counts.newItems },
            { id: 'contacted', label: 'Contacted', count: counts.contacted },
            { id: 'resolved', label: 'Resolved', count: counts.resolved },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-salon-600 text-white shadow-md shadow-salon-200'
                    : 'bg-white text-gray-600 hover:bg-pink-50/50 border border-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </section>

        {/* ── Feedback List ───────────────────────────────────────── */}
        <section className="flex flex-col gap-3.5">
          {filteredFeedback.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-pink-50 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 text-salon-500 flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-800">
                No Customer Feedback Found
              </h3>
              <p className="text-xs text-gray-400 max-w-sm">
                {searchQuery || statusFilter !== 'all' || ratingFilter !== 'all'
                  ? 'No records match your active search or filters. Try resetting filters.'
                  : 'There are currently no negative customer feedback entries recorded.'}
              </p>
            </div>
          ) : (
            filteredFeedback.map((item) => {
              const currentStatus = item.status || 'new';
              const cleanPhone = (item.phone || '').replace(/[^\d+]/g, '');

              const whatsappText = encodeURIComponent(
                `Hello ${item.name || 'valued customer'}, this is the manager from ${SALON_NAME}. We saw your feedback regarding your recent visit. We sincerely apologize for falling short and would love to speak with you to make things right!`
              );

              return (
                <article
                  key={item._id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-pink-100/80 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-salon-100 to-pink-200 text-salon-700 font-bold flex items-center justify-center text-sm shadow-sm">
                        {(item.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                            {item.name || 'Anonymous Customer'}
                          </h4>
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                            <span className="text-xs font-bold text-amber-700">
                              {item.rating || 1}★
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                          <Clock size={11} />
                          <span>{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                          currentStatus === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : currentStatus === 'contacted'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {currentStatus === 'resolved'
                          ? '✓ Resolved'
                          : currentStatus === 'contacted'
                          ? '⏳ Contacted'
                          : '⚠️ Needs Action'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete feedback"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50/70 rounded-xl p-3.5 border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    "{item.comment}"
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-50">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.phone ? (
                        <>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-all"
                          >
                            <Phone size={13} className="text-salon-600" />
                            <span>{item.phone}</span>
                          </a>

                          <a
                            href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${whatsappText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all"
                          >
                            <MessageCircle size={13} />
                            <span>Reply via WhatsApp</span>
                          </a>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No phone number provided</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-400 font-medium mr-1">Status:</span>

                      {currentStatus !== 'contacted' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item._id, 'contacted')}
                          className="text-[11px] font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-all"
                        >
                          Mark Contacted
                        </button>
                      )}

                      {currentStatus !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item._id, 'resolved')}
                          className="text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 transition-all flex items-center gap-1"
                        >
                          <Check size={12} />
                          <span>Resolve</span>
                        </button>
                      )}

                      {currentStatus === 'resolved' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item._id, 'new')}
                          className="text-[11px] font-medium text-gray-400 hover:text-gray-600 underline px-1"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

      </main>
    </div>
  );
}
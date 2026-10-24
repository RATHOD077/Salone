import { useState } from 'react';
import { LockKeyhole, RefreshCw, MessageSquare } from 'lucide-react';
import { SALON_NAME } from '../utils/constants';

export default function AdminPage() {
  const [email, setEmail] = useState('haircraftsaloon1@gmail.com');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadMessages(event) {
    event?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/feedback`, {
        headers: {
          'x-admin-email': email,
          'x-admin-password': password,
        },
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to load messages.');
      setMessages(body);
    } catch (loadError) {
      setMessages([]);
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter min-h-screen px-4 py-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-gray-800">
            {SALON_NAME} Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">Private customer feedback</p>
        </header>

        <form onSubmit={loadMessages} className="card flex flex-col gap-3">
          <label htmlFor="admin-email" className="text-sm font-semibold text-gray-700">
            Admin email
          </label>
          <input
            id="admin-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="haircraftsaloon1@gmail.com"
            required
          />
          <label htmlFor="admin-password" className="text-sm font-semibold text-gray-700">
            Admin password
          </label>
          <div className="flex gap-2">
            <input
              id="admin-password"
              type="password"
              className="form-input flex-1"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              required
            />
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
              <LockKeyhole size={16} />
              Open
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>

        {messages.length > 0 && (
          <div className="card py-3">
            <p className="text-sm text-gray-600">
              {messages.length} private review{messages.length === 1 ? '' : 's'} stored
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => loadMessages()}
            className="self-end text-sm text-salon-600 flex items-center gap-1"
            disabled={loading}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        )}

        <div className="flex flex-col gap-3">
          {messages.length === 0 && !error && (
            <p className="text-sm text-gray-500 text-center">No messages loaded.</p>
          )}
          {messages.map((message) => (
            <article key={message._id} className="card">
              <div className="flex items-center gap-2 text-salon-600 mb-2">
                <MessageSquare size={16} />
                <span className="font-semibold">{message.name || 'Anonymous'}</span>
                {message.rating && (
                  <span className="text-xs text-orange-500">
                    {message.rating}/5 stars
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.comment}</p>
              {message.phone && <p className="text-xs text-gray-500 mt-2">Phone: {message.phone}</p>}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const STATUSES = ['Applied', 'Interview', 'Offer', 'Rejected'];
const APP_NAME = 'JobTrail';

function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="#2563eb" />
      <rect x="13" y="11" width="22" height="27" rx="4" fill="white" />
      <rect x="19" y="8" width="10" height="7" rx="3" fill="#bfdbfe" />
      <path
        d="M18 26l4 4 8-9"
        stroke="#2563eb"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token,
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setToken('');
    setUserName('');
    setJobs([]);
  };

  const loadJobs = async () => {
    const res = await fetch(API + '/jobs', { headers: authHeaders });
    if (res.status === 401) return logout();
    setJobs(await res.json());
  };

  useEffect(() => {
    if (token) loadJobs();
  }, [token]);

  const login = async () => {
    setError('');
    try {
      const res = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        setToken(data.token);
        setUserName(data.user.name);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Could not connect to the server. Is the backend running?');
    }
  };

  const signup = async () => {
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in name, email and password');
      return;
    }
    try {
      const res = await fetch(API + '/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await login();
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Could not connect to the server. Is the backend running?');
    }
  };

  const addJob = async () => {
    if (!company.trim() || !role.trim()) return;
    await fetch(API + '/jobs', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ company: company.trim(), role: role.trim(), status }),
    });
    setCompany('');
    setRole('');
    setStatus('Applied');
    loadJobs();
  };

  const updateStatus = async (id, newStatus) => {
    await fetch(API + '/jobs/' + id, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: newStatus }),
    });
    loadJobs();
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    await fetch(API + '/jobs/' + id, { method: 'DELETE', headers: authHeaders });
    loadJobs();
  };

  const countOf = (s) => jobs.filter((j) => j.status === s).length;

  const visibleJobs = jobs.filter((j) => {
    const text = (j.company + ' ' + j.role).toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchFilter = filter === 'All' || j.status === filter;
    return matchSearch && matchFilter;
  });

  if (!token) {
    return (
      <div className="login-box card">
        <div className="brand" style={{ marginBottom: 20 }}>
          <Logo size={44} />
          <h2>{APP_NAME}</h2>
        </div>
        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        {isSignup && (
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={isSignup ? signup : login} style={{ width: '100%' }}>
          {isSignup ? 'Sign up' : 'Log in'}
        </button>
        {error && <p className="error">{error}</p>}
        <p
          className="link"
          onClick={() => {
            setIsSignup(!isSignup);
            setError('');
          }}
        >
          {isSignup ? 'Already have an account? Log in' : 'Create a new account'}
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <Logo />
          <h1>{APP_NAME}</h1>
        </div>
        <div className="user">
          {userName && <span>Hi, {userName}</span>}
          <button className="secondary" onClick={logout}>Log out</button>
        </div>
      </div>

      <div className="stats">
        {STATUSES.map((s) => (
          <div key={s} className={'stat ' + s}>
            <div className="num">{countOf(s)}</div>
            <div className="label">{s}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Add a new application</h3>
        <div className="form-row">
          <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          <input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button onClick={addJob}>Add</button>
        </div>
      </div>

      <div className="card">
        <h3>My applications ({jobs.length})</h3>

        <div className="toolbar">
          <input
            placeholder="Search by company or role"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {visibleJobs.length === 0 && (
          <p className="empty">
            {jobs.length === 0
              ? 'No applications yet. Add your first one above.'
              : 'No matching applications.'}
          </p>
        )}

        {visibleJobs.map((job) => (
          <div key={job._id} className={'job status-' + job.status}>
            <div className="info">
              <b>{job.company}</b> <span>- {job.role}</span>
              <span className="date">
                Added {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="actions">
              <select value={job.status} onChange={(e) => updateStatus(job._id, e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button className="danger" onClick={() => deleteJob(job._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
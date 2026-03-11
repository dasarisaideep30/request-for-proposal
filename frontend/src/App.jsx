/**
 * RFP Command Center - Frontend Application
 * Enterprise-Grade React Application with Full Feature Set
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { BarChart3, FileText, CheckSquare, Bell, LogOut, Home, Plus, AlertTriangle, TrendingUp, DollarSign, Clock, Target, Trash2, Edit2 } from 'lucide-react';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============================================
// AUTHENTICATION CONTEXT
// ============================================

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ============================================
// API SERVICE FUNCTIONS
// ============================================

const sleep = ms => new Promise(r => setTimeout(r, ms));

const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        // Rate limited, exponential backoff
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      return response;
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const mockDB = {
  dashboard: { kpis: { activeRFPs: 12, rfpsAtRisk: 2, totalPipelineValue: 45000000, avgProposalTurnaround: 45, winRate: 68, slaCompliance: 92 }, charts: { riskDistribution: [{ level: 'GREEN', count: 8 }, { level: 'AMBER', count: 2 }, { level: 'RED', count: 2 }], industryPipeline: [{ industry: 'Tech', count: 5, value: 20000000 }] }, recentActivity: [] },
  rfps: [{ id: '1', rfpNumber: 'RFP-2026-001', clientName: 'Globex Corp', industry: 'Technology', estimatedDealValue: 5000000, status: 'IN_PROGRESS', riskLevel: 'GREEN', completionPercentage: 45, proposalManager: { firstName: 'Sarah', lastName: 'Johnson' }, tasks: [], milestones: [] }],
  tasks: [],
  notifications: { notifications: [], unreadCount: 0 }
};

const handleMockApi = async (endpoint, options) => {
  await sleep(400); // Simulate network latency
  if (endpoint === '/auth/login') return { token: 'mock-token', user: { id: '1', firstName: 'Sarah', lastName: 'Johnson', role: 'PROPOSAL_MANAGER' } };
  if (endpoint === '/auth/me') return { user: { id: '1', firstName: 'Sarah', lastName: 'Johnson', role: 'PROPOSAL_MANAGER' } };
  if (endpoint === '/dashboard/executive') return mockDB.dashboard;
  if (endpoint === '/dashboard/my-rfps') return { rfps: mockDB.rfps, tasks: [], notifications: [], unreadCount: 0 };
  if (endpoint === '/rfps') return { rfps: mockDB.rfps };
  if (endpoint.startsWith('/rfps/')) return { rfp: mockDB.rfps[0] };
  if (endpoint === '/tasks') return { tasks: mockDB.tasks };
  if (endpoint.startsWith('/activities')) return { activities: [] };
  if (endpoint === '/notifications') return mockDB.notifications;
  return {}; // default fallback
};

const apiCall = async (endpoint, options = {}, token) => {
  if (USE_MOCK) return handleMockApi(endpoint, options);

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetchWithRetry(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API evaluation failed' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// ============================================
// LOGIN COMPONENT
// ============================================

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">RFP Command Center</h1>
          <p className="login-subtitle">Enterprise Proposal Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f1f5f9', borderRadius: '0.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>Demo Credentials:</p>
          <p style={{ fontSize: '0.8rem', color: '#475569' }}>📧 sarah.johnson@example.com</p>
          <p style={{ fontSize: '0.8rem', color: '#475569' }}>🔑 password123</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DASHBOARD COMPONENT
// ============================================

const Dashboard = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await apiCall('/dashboard/executive', {}, token);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!dashboardData) {
    return <div className="empty-state">Failed to load dashboard data</div>;
  }

  const { kpis, charts } = dashboardData;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Executive Dashboard</h1>
        <p style={{ color: '#64748b' }}>Real-time RFP portfolio metrics and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Active RFPs</div>
          <div className="kpi-value">{kpis.activeRFPs}</div>
          <div className="kpi-trend">
            <FileText size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            In Pipeline
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">RFPs at Risk</div>
          <div className="kpi-value" style={{ color: kpis.rfpsAtRisk > 0 ? '#ef4444' : '#10b981' }}>
            {kpis.rfpsAtRisk}
          </div>
          <div className="kpi-trend" style={{ color: kpis.rfpsAtRisk > 0 ? '#ef4444' : '#10b981' }}>
            <AlertTriangle size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            {kpis.rfpsAtRisk > 0 ? 'Requires Attention' : 'All on Track'}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Pipeline Value</div>
          <div className="kpi-value">${(kpis.totalPipelineValue / 1000000).toFixed(1)}M</div>
          <div className="kpi-trend">
            <DollarSign size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Total Potential Revenue
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Avg Turnaround</div>
          <div className="kpi-value">{kpis.avgProposalTurnaround}</div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            <Clock size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Days to Submission
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Win Rate</div>
          <div className="kpi-value">{kpis.winRate}%</div>
          <div className="kpi-trend">
            <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Success Rate
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">SLA Compliance</div>
          <div className="kpi-value" style={{ color: kpis.slaCompliance >= 90 ? '#10b981' : '#f59e0b' }}>
            {kpis.slaCompliance}%
          </div>
          <div className="kpi-trend">
            <Target size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            On-Time Delivery
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Industry Pipeline</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Industry</th>
                  <th>Count</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {charts.industryPipeline.map((item, index) => (
                  <tr key={index}>
                    <td>{item.industry}</td>
                    <td>{item.count}</td>
                    <td>${(item.value / 1000000).toFixed(2)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Risk Distribution</h3>
          </div>
          <div style={{ padding: '1rem' }}>
            {charts.riskDistribution.map((item, index) => (
              <div key={index} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className={`risk-badge risk-${item.level.toLowerCase()}`}>{item.level}</span>
                  <span style={{ fontWeight: 600 }}>{item.count} RFPs</span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(item.count / charts.riskDistribution.reduce((sum, r) => sum + r.count, 0)) * 100}%`,
                    background: item.level === 'GREEN' ? '#10b981' : item.level === 'AMBER' ? '#f59e0b' : '#ef4444'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// RFP LIST COMPONENT
// ============================================

const RFPList = ({ onViewRFP, onCreateRFP }) => {
  const { token, user } = useAuth();
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRFPs();
  }, []);

  const fetchRFPs = async () => {
    try {
      const data = await apiCall('/rfps', {}, token);
      setRfps(data.rfps);
    } catch (error) {
      console.error('Failed to fetch RFPs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const canCreate = user?.role === 'PROPOSAL_MANAGER';

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>RFP Portfolio</h1>
          <p style={{ color: '#64748b' }}>Manage active proposals and opportunities</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={onCreateRFP}>
            <Plus size={18} />
            New RFP
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>RFP Number</th>
                <th>Client</th>
                <th>Industry</th>
                <th>Deadline</th>
                <th>Value</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {rfps.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No RFPs found
                  </td>
                </tr>
              ) : (
                rfps.map((rfp) => (
                  <tr key={rfp.id} onClick={() => onViewRFP(rfp.id)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{rfp.rfpNumber}</td>
                    <td>{rfp.clientName}</td>
                    <td>{rfp.industry}</td>
                    <td>{new Date(rfp.submissionDeadline).toLocaleDateString()}</td>
                    <td>${(rfp.estimatedDealValue / 1000000).toFixed(2)}M</td>
                    <td>
                      <span className={`status-badge status-${rfp.status.toLowerCase()}`}>
                        {rfp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-badge risk-${rfp.riskLevel.toLowerCase()}`}>
                        {rfp.riskLevel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          flex: 1,
                          height: '8px',
                          background: '#e2e8f0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${rfp.completionPercentage}%`,
                            background: '#10b981',
                            transition: 'width 0.3s'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '40px' }}>
                          {rfp.completionPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================
// RFP DETAIL COMPONENT
// ============================================

const RFPDetail = ({ rfpId, onBack }) => {
  const { token, user } = useAuth();
  const [rfp, setRfp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', ownerId: '' });

  useEffect(() => {
    fetchRFPDetail();
  }, [rfpId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify({ ...newTask, rfpId })
      }, token);
      setIsCreatingTask(false);
      setNewTask({ title: '', description: '', dueDate: '', ownerId: '' });
      fetchRFPDetail();
    } catch (err) { alert(err.message); }
  };

  const handleUpdateTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
    try {
      await apiCall(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      }, token);
      fetchRFPDetail();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiCall(`/tasks/${taskId}`, { method: 'DELETE' }, token);
      fetchRFPDetail();
    } catch (err) { alert(err.message); }
  };

  const fetchRFPDetail = async () => {
    try {
      const data = await apiCall(`/rfps/${rfpId}`, {}, token);
      setRfp(data.rfp);
    } catch (error) {
      console.error('Failed to fetch RFP:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!rfp) {
    return <div className="empty-state">RFP not found</div>;
  }

  return (
    <div>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        ← Back to List
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div>
          {/* RFP Overview */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {rfp.projectTitle}
                </h2>
                <p style={{ fontSize: '1.1rem', color: '#64748b' }}>{rfp.clientName}</p>
              </div>
              <span className={`risk-badge risk-${rfp.riskLevel.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                {rfp.riskLevel} RISK
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>RFP Number</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{rfp.rfpNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Industry</div>
                <div style={{ fontWeight: 600 }}>{rfp.industry}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Deal Value</div>
                <div style={{ fontWeight: 600, color: '#10b981' }}>${(rfp.estimatedDealValue / 1000000).toFixed(2)}M</div>
              </div>
            </div>

            {rfp.executiveSummary && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Executive Summary</h4>
                <p style={{ color: '#475569', lineHeight: 1.6 }}>{rfp.executiveSummary}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Proposal Manager</div>
                <div style={{ fontWeight: 600 }}>
                  {rfp.proposalManager.firstName} {rfp.proposalManager.lastName}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Solution Architect</div>
                <div style={{ fontWeight: 600 }}>
                  {rfp.solutionArchitect ?
                    `${rfp.solutionArchitect.firstName} ${rfp.solutionArchitect.lastName}` :
                    'Not Assigned'}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title">Tasks</h3>
              {user?.role === 'PROPOSAL_MANAGER' && (
                <button className="btn btn-primary" onClick={() => setIsCreatingTask(!isCreatingTask)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <Plus size={16} /> New Task
                </button>
              )}
            </div>

            {isCreatingTask && (
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                <form onSubmit={handleCreateTask}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Title</label>
                      <input type="text" className="form-input" style={{ padding: '0.5rem' }} value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Due Date</label>
                      <input type="date" className="form-input" style={{ padding: '0.5rem' }} value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} required />
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Assignee ID (User ID)</label>
                    <input type="text" className="form-input" style={{ padding: '0.5rem' }} placeholder="Enter User UUID" value={newTask.ownerId} onChange={e => setNewTask({ ...newTask, ownerId: e.target.value })} required />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Save</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsCreatingTask(false)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {rfp.tasks.length === 0 && !isCreatingTask ? (
              <div className="empty-state">No tasks yet</div>
            ) : rfp.tasks.length > 0 && (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Done</th>
                      <th>Task</th>
                      <th>Owner</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      {user?.role === 'PROPOSAL_MANAGER' && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rfp.tasks.map((task) => (
                      <tr key={task.id} style={{ opacity: task.status === 'COMPLETED' ? 0.6 : 1 }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={task.status === 'COMPLETED'}
                            onChange={() => handleUpdateTaskStatus(task.id, task.status)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            disabled={user?.role === 'BID_REVIEWER'}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>{task.title}</div>
                          {task.description && (
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                              {task.description}
                            </div>
                          )}
                        </td>
                        <td>{task.owner.firstName} {task.owner.lastName}</td>
                        <td>
                          <span style={{ color: task.isOverdue && task.status !== 'COMPLETED' ? '#ef4444' : '#64748b' }}>
                            {new Date(task.dueDate).toLocaleDateString()}
                            {task.isOverdue && task.status !== 'COMPLETED' && ' (Overdue)'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${task.status.toLowerCase()}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </td>
                        {user?.role === 'PROPOSAL_MANAGER' && (
                          <td>
                            <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Status & Milestones */}
          <div className="card">
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Progress</h4>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Status</div>
              <span className={`status-badge status-${rfp.status.toLowerCase()}`}>
                {rfp.status.replace('_', ' ')}
              </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Completion</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a8a' }}>
                {rfp.completionPercentage}%
              </div>
              <div style={{
                height: '12px',
                background: '#e2e8f0',
                borderRadius: '6px',
                overflow: 'hidden',
                marginTop: '0.5rem'
              }}>
                <div style={{
                  height: '100%',
                  width: `${rfp.completionPercentage}%`,
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  transition: 'width 0.3s'
                }}></div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Submission Deadline</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                {new Date(rfp.submissionDeadline).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                {Math.ceil((new Date(rfp.submissionDeadline) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="card">
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Milestones</h4>
            {rfp.milestones.map((milestone, index) => (
              <div key={milestone.id} style={{
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: index < rfp.milestones.length - 1 ? '1px solid #e2e8f0' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: milestone.isCompleted ? '#10b981' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {milestone.isCompleted && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" fill="none" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{milestone.title}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '1.75rem' }}>
                  {new Date(milestone.targetDate).toLocaleDateString()}
                  {milestone.isCompleted && milestone.completedDate &&
                    ` • Completed ${new Date(milestone.completedDate).toLocaleDateString()}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CREATE RFP COMPONENT
// ============================================

const CreateRFPForm = ({ onCancel, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    clientName: '',
    industry: '',
    projectTitle: '',
    executiveSummary: '',
    submissionDeadline: '',
    estimatedDealValue: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiCall('/rfps', {
        method: 'POST',
        body: JSON.stringify(formData)
      }, token);

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="card">
      <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>Create New RFP</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input
              type="text"
              name="clientName"
              className="form-input"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Industry *</label>
            <select
              name="industry"
              className="form-select"
              value={formData.industry}
              onChange={handleChange}
              required
            >
              <option value="">Select Industry</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Energy">Energy</option>
              <option value="Government">Government</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Project Title *</label>
          <input
            type="text"
            name="projectTitle"
            className="form-input"
            value={formData.projectTitle}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Executive Summary</label>
          <textarea
            name="executiveSummary"
            className="form-textarea"
            rows="4"
            value={formData.executiveSummary}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Submission Deadline *</label>
            <input
              type="date"
              name="submissionDeadline"
              className="form-input"
              value={formData.submissionDeadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Deal Value ($) *</label>
            <input
              type="number"
              name="estimatedDealValue"
              className="form-input"
              value={formData.estimatedDealValue}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create RFP'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================
// MY TASKS COMPONENT
// ============================================

const MyTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await apiCall('/tasks', {}, token);
      setTasks(data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    try {
      await apiCall(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      }, token);
      fetchTasks();
    } catch (error) {
      fetchTasks();
      alert('Failed to update task status');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Tasks</h1>
        <p style={{ color: '#64748b' }}>Manage your assigned workload across all RFPs</p>
      </div>

      <div className="card">
        {tasks.length === 0 ? (
          <div className="empty-state">No tasks assigned to you</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Done</th>
                  <th>Task</th>
                  <th>RFP</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} style={{ opacity: task.status === 'COMPLETED' ? 0.6 : 1 }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={task.status === 'COMPLETED'}
                        onChange={() => handleToggleStatus(task)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                      {task.description && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{task.description}</div>}
                    </td>
                    <td>{task.rfp?.projectTitle} ({task.rfp?.rfpNumber})</td>
                    <td>
                      <span style={{ color: task.isOverdue && task.status !== 'COMPLETED' ? '#ef4444' : '#64748b' }}>
                        {new Date(task.dueDate).toLocaleDateString()}
                        {task.isOverdue && task.status !== 'COMPLETED' && ' (Overdue)'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${task.status.toLowerCase()}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// ANALYTICS & ACTIVITY COMPONENT
// ============================================

const AnalyticsView = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await apiCall('/activities?limit=100', {}, token);
      setActivities(data.activities);
    } catch (error) {
      console.error('Failed to fetch activities', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Global Activity Feed</h1>
        <p style={{ color: '#64748b' }}>Audit trail of actions across the command center</p>
      </div>

      <div className="card">
        {activities.length === 0 ? (
          <div className="empty-state">No recent activity</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map(act => (
              <div key={act.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, color: '#1e3a8a', flexShrink: 0
                }}>
                  {act.user.firstName[0]}{act.user.lastName[0]}
                </div>
                <div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{act.user.firstName} {act.user.lastName}</span>
                    {' '}<span style={{ color: '#64748b' }}>{act.description}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '1rem' }}>
                    <span>{new Date(act.createdAt).toLocaleString()}</span>
                    {act.rfp && <span>RFP: {act.rfp.rfpNumber}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

const AppLayout = () => {
  const { user, logout, token } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedRFPId, setSelectedRFPId] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const data = await apiCall('/notifications', {}, token);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) { console.error('Failed to fetch notifications', err); }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await apiCall(`/notifications/${id}/read`, { method: 'PATCH' }, token);
      fetchNotifications();
    } catch (err) { console.error('Failed to update notification', err); }
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'rfps', label: 'RFPs', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const handleViewRFP = (rfpId) => {
    setSelectedRFPId(rfpId);
    setCurrentView('rfp-detail');
  };

  const handleBackToList = () => {
    setCurrentView('rfps');
    setSelectedRFPId(null);
  };

  const handleCreateRFP = () => {
    setCurrentView('create-rfp');
  };

  const handleRFPCreated = () => {
    setCurrentView('rfps');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'rfps':
        return <RFPList onViewRFP={handleViewRFP} onCreateRFP={handleCreateRFP} />;
      case 'rfp-detail':
        return <RFPDetail rfpId={selectedRFPId} onBack={handleBackToList} />;
      case 'create-rfp':
        return <CreateRFPForm onCancel={handleBackToList} onSuccess={handleRFPCreated} />;
      case 'tasks':
        return <MyTasks />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">RFP Command Center</h1>
          <p className="sidebar-subtitle">RFP Command Center</p>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id)}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={logout} style={{ width: '100%', marginTop: '1rem' }}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2 className="topbar-title">
            {currentView === 'dashboard' && 'Dashboard'}
            {currentView === 'rfps' && 'RFP Portfolio'}
            {currentView === 'rfp-detail' && 'RFP Details'}
            {currentView === 'create-rfp' && 'Create New RFP'}
            {currentView === 'tasks' && 'Tasks'}
            {currentView === 'analytics' && 'Analytics'}
          </h2>

          <div className="topbar-actions" style={{ position: 'relative' }}>
            <div className="notification-badge" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={24} />
              {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
            </div>

            {showNotifications && (
              <div style={{
                position: 'absolute', top: '100%', right: '0', marginTop: '1.5rem',
                width: '340px', background: 'white', borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                zIndex: 1000, border: '1px solid #e2e8f0', maxHeight: '400px', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Notifications</span>
                  {unreadCount > 0 && <span style={{ color: '#1e3a8a', fontSize: '0.85rem' }}>{unreadCount} new</span>}
                </div>
                <div style={{ overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={() => !n.isRead && handleMarkAsRead(n.id)} style={{
                        padding: '1rem', borderBottom: '1px solid #e2e8f0',
                        background: n.isRead ? 'white' : '#f0f9ff', cursor: n.isRead ? 'default' : 'pointer',
                        transition: 'background 0.2s'
                      }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: '#0f172a' }}>{n.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// ============================================
// ROOT APP COMPONENT
// ============================================

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
      }}>
        <div className="spinner" style={{ borderTopColor: 'white' }}></div>
      </div>
    );
  }

  return user ? <AppLayout /> : <LoginPage />;
}

export default App;

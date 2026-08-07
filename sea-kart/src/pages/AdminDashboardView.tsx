import { useState, useEffect } from 'react';
import { useAdminAuth, getApiBase } from '../context/AdminAuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Package, Users, ShoppingCart, LogOut, CheckCircle2, Trash2, Waves, Truck, Sun, Moon } from 'lucide-react';

import ConfirmModal from '../components/ConfirmModal';

const api = axios.create();

api.interceptors.request.use((config) => {
  config.baseURL = `${getApiBase()}/api`;
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function AdminDashboardView() {
  const { user, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'customers'>('orders');
  const [ordersPage, setOrdersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('admin_theme') as 'dark' | 'light') || 'dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('admin_theme', nextTheme);
  };

  const isDark = theme === 'dark';

  useEffect(() => {
    const bgColor = isDark ? '#0f172a' : '#f1f5f9';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;
    const appEl = document.getElementById('app');
    if (appEl) appEl.style.backgroundColor = bgColor;

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    type?: 'logout' | 'delivered' | 'out_of_delivery' | 'delete';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'logout' | 'delivered' | 'out_of_delivery' | 'delete' = 'logout',
    confirmText = 'Yes, Proceed'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      type,
      confirmText
    });
  };

  const queryClient = useQueryClient();

  const { data: ordersResponse, isLoading: loadingOrders } = useQuery({
    queryKey: ['adminOrders', ordersPage],
    queryFn: async () => (await api.get(`/admin/orders?page=${ordersPage}&limit=10`)).data,
    refetchInterval: 3000,
  });
  const orders = ordersResponse?.data;
  const ordersTotalPages = ordersResponse?.totalPages || 1;

  const { data: productsResponse, isLoading: loadingProducts } = useQuery({
    queryKey: ['adminProducts', productsPage],
    queryFn: async () => (await api.get(`/admin/products?page=${productsPage}&limit=10`)).data
  });
  const products = productsResponse?.data;
  const productsTotalPages = productsResponse?.totalPages || 1;

  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => (await api.get('/admin/users')).data
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return (await api.put(`/admin/products/${id}`, data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      return (await api.delete(`/admin/orders/${encodeURIComponent(id)}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      return (await api.put(`/admin/orders/${encodeURIComponent(id)}/status`, { status })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    }
  });

  const navItems = [
    { id: 'orders', label: 'Live Orders', icon: ShoppingCart },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
  ] as const;

  // Count stats
  const totalOrders = orders?.length || 0;
  const cancelledOrders = orders?.filter((o: any) => o.status === 'CANCELLED').length || 0;
  const deliveredOrders = orders?.filter((o: any) => o.status === 'DELIVERED' || o.status === 'COMPLETED').length || 0;

  // Dynamic Theme Colors
  const colors = {
    pageBg: isDark ? '#0f172a' : '#f1f5f9',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? 'rgba(148,163,184,0.15)' : '#e2e8f0',
    headerBg: isDark ? '#1e293b' : '#f8fafc',
    textTitle: isDark ? '#f8fafc' : '#0f172a',
    textSub: isDark ? '#94a3b8' : '#64748b',
    inputBg: isDark ? '#0f172a' : '#f8fafc',
    inputBorder: isDark ? 'rgba(148,163,184,0.3)' : '#e2e8f0',
    tableRowHover: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(239,246,255,0.8)'
  };

  return (
    <div className="min-h-screen flex admin-layout" style={{ background: colors.pageBg, transition: 'background 0.3s ease' }}>
      <style>{`
        @keyframes rainbowSlide {
          0% { background-position: 0% 0%; }
          100% { background-position: 300% 0%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
        }
        @keyframes tabFade {
          from { opacity: 0.85; transform: scale(0.995); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-btn { transition: all 0.2s ease; }
        .nav-btn:hover { transform: translateX(4px); }
        .card-stat { animation: fadeInUp 0.4s ease both; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59,130,246,0.15); }
        .card-stat:nth-child(1) { animation-delay: 0.05s; }
        .card-stat:nth-child(2) { animation-delay: 0.1s; }
        .card-stat:nth-child(3) { animation-delay: 0.15s; }
        .action-btn { transition: all 0.18s ease; }
        .action-btn:hover { transform: translateY(-1px); }
        .action-btn:active { transform: translateY(0); }
        .table-row { transition: background 0.15s ease; }
        .table-row:hover { background: ${colors.tableRowHover} !important; }
        .search-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .search-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); outline: none; }
        .tab-animate { animation: tabFade 0.25s ease-out both; }
        
        @media (max-width: 900px) {
          .admin-layout {
            flex-direction: column !important;
          }
          .admin-sidebar {
            width: 100% !important;
            position: sticky !important;
            top: 0 !important;
            height: auto !important;
            z-index: 100 !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
          }
          .admin-brand {
            padding: 12px 16px !important;
          }
          .admin-nav-container {
            padding: 6px 12px !important;
          }
          .admin-nav-label {
            display: none !important;
          }
          .admin-nav-list {
            flex-direction: row !important;
            overflow-x: auto !important;
            gap: 8px !important;
            padding-bottom: 4px !important;
          }
          .nav-btn {
            width: auto !important;
            flex-shrink: 0 !important;
            padding: 8px 12px !important;
            font-size: 13px !important;
          }
          .admin-user-box {
            display: none !important;
          }
          .admin-main-content {
            margin-left: 0 !important;
            padding: 12px !important;
            padding-top: 16px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .stats-container {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .card-stat {
            flex: 1 1 calc(50% - 8px) !important;
            min-width: 120px !important;
            padding: 12px !important;
          }
          .table-responsive-wrapper {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            width: 100% !important;
          }
        }
        @media (max-width: 480px) {
          .card-stat {
            flex: 1 1 100% !important;
          }
        }
      `}</style>

      {/* ── Animated top rainbow bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '4px', zIndex: 1000,
        background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #6366f1, #8b5cf6, #06b6d4, #3b82f6)',
        backgroundSize: '300% 100%',
        animation: 'rainbowSlide 3s linear infinite'
      }} />

      {/* ── SIDEBAR ── */}
      <div className="admin-sidebar" style={{
        width: '256px', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: '#94a3b8', display: 'flex', flexDirection: 'column', position: 'fixed',
        height: '100%', zIndex: 10, boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
        paddingTop: '4px'
      }}>
        {/* Brand */}
        <div className="admin-brand" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            boxShadow: '0 4px 15px rgba(59,130,246,0.4)', animation: 'pulseGlow 3s ease-in-out infinite'
          }}>
            <Waves style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: 'white', letterSpacing: '-0.3px' }}>Sea Kart</div>
            <div style={{ fontSize: '11px', color: 'rgba(148,163,184,0.6)', fontWeight: 500 }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <div className="admin-nav-container" style={{ padding: '16px', flex: 1 }}>
          <div className="admin-nav-label" style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(148,163,184,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', paddingLeft: '12px' }}>
            Navigation
          </div>
          <nav className="admin-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="nav-btn"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  fontWeight: activeTab === item.id ? 700 : 500, fontSize: '14px',
                  background: activeTab === item.id
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(99,102,241,0.9) 100%)'
                    : 'transparent',
                  color: activeTab === item.id ? 'white' : 'rgba(148,163,184,0.8)',
                  boxShadow: activeTab === item.id ? '0 4px 15px rgba(59,130,246,0.35)' : 'none',
                  textAlign: 'left'
                }}
              >
                <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                {item.label}
                {item.id === 'orders' && totalOrders > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: activeTab === 'orders' ? 'rgba(255,255,255,0.25)' : 'rgba(59,130,246,0.15)',
                    color: activeTab === 'orders' ? 'white' : '#60a5fa', borderRadius: '20px',
                    padding: '2px 8px', fontSize: '11px', fontWeight: 700
                  }}>
                    {totalOrders}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User + Theme Toggle + Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="action-btn"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)',
              background: isDark ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.06)',
              color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              marginBottom: '10px', transition: 'all 0.2s'
            }}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? (
              <>
                <Sun style={{ width: 16, height: 16, color: '#fbbf24' }} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon style={{ width: 16, height: 16, color: '#60a5fa' }} />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <div className="admin-user-box" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', marginBottom: '8px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '15px'
            }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name === 'Super Admin' ? 'Admin' : (user?.name || 'Admin')}</div>
              <div style={{ fontSize: '11px', color: 'rgba(148,163,184,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'seakart019@gmail.com'}</div>
            </div>
          </div>
          <button
            onClick={() => {
              openConfirm(
                "Logout Confirmation",
                "Are you sure you want to log out of the Admin Dashboard?",
                logout,
                'logout',
                "Yes, Logout"
              );
            }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#f87171', fontWeight: 600, fontSize: '14px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut style={{ width: 16, height: 16 }} />
            Logout
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="admin-main-content" style={{ flex: 1, marginLeft: '256px', padding: '32px', paddingTop: '36px' }}>
        {/* Page header */}
        <header style={{ marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
              }}>
                {activeTab === 'orders' && <ShoppingCart style={{ width: 22, height: 22, color: 'white' }} />}
                {activeTab === 'products' && <Package style={{ width: 22, height: 22, color: 'white' }} />}
                {activeTab === 'customers' && <Users style={{ width: 22, height: 22, color: 'white' }} />}
              </div>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: colors.textTitle, margin: 0, letterSpacing: '-0.4px', textTransform: 'capitalize' }}>
                  {activeTab === 'orders' ? 'Live Orders' : activeTab}
                </h1>
                <p style={{ fontSize: '13px', color: colors.textSub, margin: '2px 0 0' }}>
                  {activeTab === 'orders' ? 'Manage and track all customer orders in real-time' :
                   activeTab === 'products' ? 'Manage product inventory, pricing, and stock' :
                   'View and manage customer accounts'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats for orders */}
          {activeTab === 'orders' && (
            <div className="stats-container" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {[
                { label: 'Total Orders', value: totalOrders, color: '#3b82f6', bg: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)' },
                { label: 'Delivered', value: deliveredOrders, color: '#10b981', bg: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)' },
                { label: 'Cancelled', value: cancelledOrders, color: '#ef4444', bg: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)' },
              ].map((stat) => (
                <div key={stat.label} className="card-stat" style={{
                  background: stat.bg, border: `1px solid ${stat.color}33`,
                  borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: colors.textSub }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="tab-animate" style={{ background: colors.cardBg, borderRadius: '20px', border: `1px solid ${colors.cardBorder}`, overflow: 'hidden', boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.cardBorder}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                <input
                  type="text"
                  placeholder="Search by ID, email, name, items, date, total, slot, status..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="search-input"
                  style={{
                    width: '100%', padding: '9px 14px 9px 38px',
                    border: `1px solid ${colors.inputBorder}`, borderRadius: '10px',
                    fontSize: '13px', color: colors.textTitle, background: colors.inputBg
                  }}
                />
                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </div>

            {loadingOrders ? (
              <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: colors.headerBg }}>
                        {['Order ID', 'Customer', 'Date & Time', 'Items', 'Total', 'Delivery Place', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: colors.textSub, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${colors.cardBorder}`, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders?.filter((order: any) => {
                        if (!orderSearchQuery.trim()) return true;
                        const q = orderSearchQuery.toLowerCase().trim();
                        const idMatch = order.id?.toLowerCase().includes(q);
                        const nameMatch = order.user?.name?.toLowerCase().includes(q);
                        const emailMatch = order.user?.email?.toLowerCase().includes(q);
                        const phoneMatch = order.user?.phone?.toLowerCase().includes(q);
                        const dateStr = order.timestamp ? new Date(order.timestamp).toLocaleDateString().toLowerCase() : '';
                        const timeStr = order.timestamp ? new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : '';
                        const dateTimeMatch = dateStr.includes(q) || timeStr.includes(q);
                        const itemsStr = order.items ? order.items.map((i: any) => `${i.quantity} ${i.name}`).join(' ').toLowerCase() : '';
                        const itemsMatch = itemsStr.includes(q);
                        const totalMatch = order.total?.toString().toLowerCase().includes(q);
                        const slotMatch = order.deliverySlot?.toLowerCase().includes(q);
                        const statusStr = order.status?.toLowerCase() || '';
                        const statusMatch = statusStr.includes(q) || 
                          (q.includes('out') && statusStr.includes('out_of_delivery')) ||
                          (q.includes('deliv') && (statusStr.includes('delivered') || statusStr.includes('completed'))) ||
                          (q.includes('cancel') && statusStr.includes('cancelled'));
                        const addressMatch = order.address?.toLowerCase().includes(q) || order.user?.address?.toLowerCase().includes(q);

                        return idMatch || nameMatch || emailMatch || phoneMatch || dateTimeMatch || itemsMatch || totalMatch || slotMatch || statusMatch || addressMatch;
                      }).map((order: any) => (
                        <tr key={order._id} className="table-row" style={{ borderBottom: `1px solid ${colors.cardBorder}` }}>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#3b82f6', fontSize: '13px', whiteSpace: 'nowrap' }}>{order.id}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: colors.textTitle, fontSize: '13px' }}>{order.user?.name || 'Unknown'}</div>
                            <div style={{ fontSize: '12px', color: colors.textSub }}>{order.user?.email}</div>
                            {order.user?.phone && (
                              <a href={`tel:${order.user.phone}`} style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'none', display: 'block', marginTop: '2px' }}>
                                📞 {order.user.phone}
                              </a>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: colors.textTitle, fontSize: '13px' }}>{new Date(order.timestamp).toLocaleDateString()}</div>
                            <div style={{ fontSize: '12px', color: colors.textSub }}>{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {order.items.map((item: any) => (
                              <div key={item.id} style={{ fontSize: '12px', color: colors.textTitle, whiteSpace: 'nowrap' }}>{item.quantity}× {item.name}</div>
                            ))}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: colors.textTitle, whiteSpace: 'nowrap', fontSize: '13px' }}>{order.total}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {order.deliverySlot ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
                                  border: '1px solid rgba(59,130,246,0.25)', padding: '4px 10px',
                                  borderRadius: '20px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', width: 'fit-content'
                                }}>
                                  🕗 {order.deliverySlot}
                                </span>
                              ) : (
                                <span style={{ fontSize: '11px', color: colors.textSub, fontStyle: 'italic' }}>No slot specified</span>
                              )}
                              
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: colors.textTitle }}>
                                <span style={{ color: '#ef4444', marginTop: '2px' }}>📍</span>
                                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={order.address || order.user?.address || 'Not specified'}>
                                  {order.address || order.user?.address || <span style={{ fontStyle: 'italic', color: colors.textSub }}>No address provided</span>}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {order.status === 'CANCELLED' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239,68,68,0.12)', color: '#f87171', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                                ✕ Cancelled
                              </span>
                            ) : order.status === 'DELIVERED' || order.status === 'COMPLETED' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.12)', color: '#34d399', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                                ✓ Delivered
                              </span>
                            ) : order.status === 'OUT_OF_DELIVERY' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                                🚚 Out for Delivery
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245,158,11,0.12)', color: '#fbbf24', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                                ⟳ Processing
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
                              {order.status !== 'CANCELLED' && (
                                <>
                                  <button
                                    className="action-btn"
                                    onClick={() => {
                                      openConfirm(
                                        "Out for Delivery",
                                        `Mark order ${order.id} as Out for Delivery?`,
                                        () => updateOrderStatusMutation.mutate({ id: order.id, status: 'OUT_OF_DELIVERY' }),
                                        'out_of_delivery',
                                        "Mark Out for Delivery"
                                      );
                                    }}
                                    disabled={order.status === 'OUT_OF_DELIVERY' || order.status === 'DELIVERED' || order.status === 'COMPLETED'}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                                      padding: '8px 14px', borderRadius: '10px', border: 'none',
                                      fontWeight: 700, fontSize: '12px', color: 'white',
                                      background: order.status === 'OUT_OF_DELIVERY' || order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                        ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                      boxShadow: order.status === 'OUT_OF_DELIVERY' || order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'none' : '0 3px 10px rgba(59,130,246,0.3)',
                                      opacity: order.status === 'OUT_OF_DELIVERY' || order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 0.6 : 1,
                                      cursor: order.status === 'OUT_OF_DELIVERY' || order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'not-allowed' : 'pointer'
                                    }}
                                    title="Mark as Out for Delivery"
                                  >
                                    <Truck style={{ width: 14, height: 14 }} />
                                    Out for Delivery
                                  </button>

                                  <button
                                    className="action-btn"
                                    onClick={() => {
                                      openConfirm(
                                        "Mark as Delivered",
                                        `Mark order ${order.id} as Delivered?`,
                                        () => updateOrderStatusMutation.mutate({ id: order.id, status: 'DELIVERED' }),
                                        'delivered',
                                        "Mark Delivered"
                                      );
                                    }}
                                    disabled={order.status === 'DELIVERED' || order.status === 'COMPLETED'}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                                      padding: '8px 14px', borderRadius: '10px', border: 'none',
                                      fontWeight: 700, fontSize: '12px', color: 'white',
                                      background: order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                        ? '#86efac' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                      boxShadow: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'none' : '0 3px 10px rgba(16,185,129,0.3)',
                                      opacity: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 0.6 : 1,
                                      cursor: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'not-allowed' : 'pointer'
                                    }}
                                    title="Mark as Delivered"
                                  >
                                    <CheckCircle2 style={{ width: 14, height: 14 }} />
                                    Delivered
                                  </button>
                                </>
                              )}
                              <button
                                className="action-btn"
                                onClick={() => {
                                  openConfirm(
                                    "Delete Order",
                                    `Are you sure you want to permanently delete order ${order.id}?`,
                                    () => deleteOrderMutation.mutate(order.id),
                                    'delete',
                                    "Yes, Delete"
                                  );
                                }}
                                style={{
                                  padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                  background: 'rgba(239,68,68,0.1)', color: '#f87171',
                                  transition: 'all 0.18s'
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
                                title="Delete Order"
                              >
                                <Trash2 style={{ width: 15, height: 15 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!orders?.length && (
                        <tr>
                          <td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: colors.textSub, fontSize: '14px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
                            No orders yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {ordersTotalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: `1px solid ${colors.cardBorder}` }}>
                    <button
                      onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                      disabled={ordersPage === 1}
                      style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: colors.textTitle, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`, borderRadius: '8px', cursor: 'pointer', opacity: ordersPage === 1 ? 0.4 : 1 }}
                    >
                      ← Previous
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textSub }}>Page {ordersPage} of {ordersTotalPages}</span>
                    <button
                      onClick={() => setOrdersPage(p => Math.min(ordersTotalPages, p + 1))}
                      disabled={ordersPage === ordersTotalPages}
                      style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: colors.textTitle, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`, borderRadius: '8px', cursor: 'pointer', opacity: ordersPage === ordersTotalPages ? 0.4 : 1 }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <div className="tab-animate">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {loadingProducts ? (
                <div style={{ gridColumn: '1/-1', padding: '60px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : (
                products?.map((product: any) => (
                  <div key={product.id} style={{
                    background: colors.cardBg, borderRadius: '16px', border: `1px solid ${colors.cardBorder}`,
                    padding: '16px', display: 'flex', gap: '14px',
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.2s, transform 0.2s'
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                  >
                    <img src={product.image} style={{ width: '88px', height: '88px', borderRadius: '12px', objectFit: 'cover', background: isDark ? '#0f172a' : '#f1f5f9', flexShrink: 0 }} alt={product.name} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontWeight: 700, color: colors.textTitle, fontSize: '14px', margin: 0 }}>{product.name}</h3>
                        <div style={{ fontSize: '12px', color: colors.textSub, marginTop: '2px' }}>{product.localName}</div>
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          border: `1px solid ${colors.inputBorder}`, background: colors.inputBg,
                          borderRadius: '8px', overflow: 'hidden'
                        }}>
                          <span style={{
                            padding: '6px 10px', fontSize: '13px', fontWeight: 800,
                            color: '#3b82f6', background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)',
                            userSelect: 'none', borderRight: `1px solid ${colors.cardBorder}`
                          }} title="Permanent Currency Symbol (Cannot be deleted)">
                            ₹
                          </span>
                          <input
                            defaultValue={product.priceRange?.startsWith('₹') ? product.priceRange.slice(1).trim() : product.priceRange}
                            onBlur={(e) => {
                              let val = e.target.value.trim();
                              if (!val.startsWith('₹')) {
                                val = `₹${val}`;
                              }
                              if (val !== product.priceRange) {
                                updateProductMutation.mutate({ id: product.id, data: { priceRange: val, isOutOfStock: product.isOutOfStock }});
                              }
                            }}
                            onChange={(e) => {
                              if (e.target.value.startsWith('₹')) {
                                e.target.value = e.target.value.slice(1);
                              }
                            }}
                            style={{
                              fontSize: '13px', border: 'none', background: 'transparent',
                              padding: '6px 10px', outline: 'none', color: colors.textTitle, width: '100%', fontWeight: 600
                            }}
                          />
                        </div>
                        <button
                          onClick={() => updateProductMutation.mutate({ id: product.id, data: { priceRange: product.priceRange, isOutOfStock: !product.isOutOfStock }})}
                          style={{
                            padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontSize: '11px', fontWeight: 700,
                            background: product.isOutOfStock ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                            color: product.isOutOfStock ? '#f87171' : '#34d399'
                          }}
                        >
                          {product.isOutOfStock ? '✕ Out of Stock' : '✓ In Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {!loadingProducts && productsTotalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px 0' }}>
                <button onClick={() => setProductsPage(p => Math.max(1, p - 1))} disabled={productsPage === 1} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: colors.textTitle, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`, borderRadius: '8px', cursor: 'pointer', opacity: productsPage === 1 ? 0.4 : 1 }}>← Previous</button>
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textSub }}>Page {productsPage} of {productsTotalPages}</span>
                <button onClick={() => setProductsPage(p => Math.min(productsTotalPages, p + 1))} disabled={productsPage === productsTotalPages} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: colors.textTitle, background: colors.cardBg, border: `1px solid ${colors.cardBorder}`, borderRadius: '8px', cursor: 'pointer', opacity: productsPage === productsTotalPages ? 0.4 : 1 }}>Next →</button>
              </div>
            )}
          </div>
        )}

        {/* ── CUSTOMERS TAB ── */}
        {activeTab === 'customers' && (
          <div className="tab-animate" style={{ background: colors.cardBg, borderRadius: '20px', border: `1px solid ${colors.cardBorder}`, overflow: 'hidden', boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.cardBorder}` }}>
              <div style={{ position: 'relative', maxWidth: '360px' }}>
                <input
                  type="text"
                  placeholder="Search by Gmail / Email..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', padding: '9px 14px 9px 38px', border: `1px solid ${colors.inputBorder}`, borderRadius: '10px', fontSize: '13px', color: colors.textTitle, background: colors.inputBg }}
                />
                <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94a3b8' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </div>
            {loadingCustomers ? (
              <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr style={{ background: colors.headerBg }}>
                      {['', 'Name', 'Email / Gmail', 'Role'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: colors.textSub, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${colors.cardBorder}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers?.filter((u: any) => u.email.toLowerCase().includes(customerSearchQuery.toLowerCase())).map((u: any) => (
                      <tr key={u._id} className="table-row" style={{ borderBottom: `1px solid ${colors.cardBorder}` }}>
                        <td style={{ padding: '14px 16px' }}>
                          <img src={u.avatar} alt={u.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: colors.inputBg, border: `2px solid ${colors.cardBorder}` }} />
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: colors.textTitle, fontSize: '14px' }}>{u.name}</td>
                        <td style={{ padding: '14px 16px', color: colors.textSub, fontSize: '13px' }}>{u.email}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                            background: u.isAdmin ? 'rgba(59,130,246,0.15)' : 'rgba(100,116,139,0.15)',
                            color: u.isAdmin ? '#60a5fa' : colors.textSub
                          }}>
                            {u.isAdmin ? '⚡ Admin' : '👤 Customer'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

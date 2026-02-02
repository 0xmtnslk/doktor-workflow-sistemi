import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, createUser, updateUser, deleteUser, getWorkflowRoles } from '../api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface WorkflowRole {
  id: string;
  name: string;
  description: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<WorkflowRole[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([getUsers(), getWorkflowRoles()]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: '', password: '' });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: '', password: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.role) {
      setError('Tüm alanları doldurun.');
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, { name: formData.name, email: formData.email, role: formData.role });
        setSuccess('Kullanıcı güncellendi.');
      } else {
        await createUser(formData);
        setSuccess('Kullanıcı eklendi.');
      }
      handleCloseModal();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bir hata oluştu.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

    try {
      await deleteUser(id);
      setSuccess('Kullanıcı silindi.');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Silme işlemi başarısız.');
    }
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const currentUser = localStorage.getItem('userId');
  const currentUserData = users.find(u => u.id === Number(currentUser));

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          Doktor Workflow
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-link" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="sidebar-link active">
            Admin Panel
          </button>
          <button className="sidebar-link" onClick={() => { localStorage.removeItem('userId'); navigate('/'); }}>
            Çıkış
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Kullanıcı ve rol yönetimi</p>
          </div>
          {currentUserData && (
            <div className="header-user">
              <div className="header-user-info">
                <div className="header-user-name">{currentUserData.name}</div>
                <div className="header-user-role">{getRoleName(currentUserData.role)}</div>
              </div>
              <div className="user-avatar">{currentUserData.name.charAt(0)}</div>
            </div>
          )}
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && !showModal && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon primary">👥</div>
            <div className="stat-card-value">{users.length}</div>
            <div className="stat-card-label">Toplam Kullanıcı</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon success">✓</div>
            <div className="stat-card-value">{roles.length}</div>
            <div className="stat-card-label">Workflow Rolü</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Kullanıcılar</h2>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              + Yeni Kullanıcı
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ad Soyad</th>
                  <th>E-posta</th>
                  <th>Rol</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge badge-primary">{getRoleName(user.role)}</span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenModal(user)}>
                          Düzenle
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="empty-state">
              <h3>Henüz kullanıcı yok</h3>
              <p>Yeni kullanıcı eklemek için yukarıdaki butonu kullanın.</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Workflow Rolleri</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Rol ID</th>
                  <th>Rol Adı</th>
                  <th>Açıklama</th>
                  <th>Atanan Kullanıcılar</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id}>
                    <td><code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{role.id}</code></td>
                    <td><strong>{role.name}</strong></td>
                    <td style={{ color: '#64748b' }}>{role.description}</td>
                    <td>
                      {users.filter(u => u.role === role.id).map(u => (
                        <span key={u.id} className="badge badge-success" style={{ marginRight: '4px' }}>
                          {u.name}
                        </span>
                      ))}
                      {users.filter(u => u.role === role.id).length === 0 && (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Atanmamış</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label className="form-label">Ad Soyad</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Ahmet Yılmaz"
                />
              </div>

              <div className="form-group">
                <label className="form-label">E-posta</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@hastane.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Workflow Rolü</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Rol seçin...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name} - {role.description}</option>
                  ))}
                </select>
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label className="form-label">Şifre (Opsiyonel)</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Şifre belirleyin"
                  />
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

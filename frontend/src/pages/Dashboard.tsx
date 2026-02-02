import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createContract, getUsers } from '../api';

interface Task {
  id: number;
  assigned_to: number;
  assigned_user_name: string;
  step_name: string;
  doctor_name: string;
  current_status: string;
  status: string;
  data: any;
}

interface User {
  id: number;
  name: string;
  role: string;
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newContract, setNewContract] = useState({ doctor_name: '', doctor_role: '', start_date: '' });
  const [showAllTasks, setShowAllTasks] = useState(false);
  const navigate = useNavigate();

  const myUserId = localStorage.getItem('userId');
  const currentUser = users.find(u => u.id === Number(myUserId));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([getTasks(), getUsers()]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateContract = async () => {
    if (!newContract.doctor_name || !newContract.doctor_role || !newContract.start_date) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      await createContract({ ...newContract, created_by: myUserId });
      alert('Sözleşme başarıyla başlatıldı!');
      setNewContract({ doctor_name: '', doctor_role: '', start_date: '' });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Hata oluştu.');
    }
  };

  const myTasks = tasks.filter(t => t.assigned_to === Number(myUserId) && t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  const pendingTasks = tasks.filter(t => t.status === 'PENDING');

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'MALI_GMY': 'Mali GMY',
      'MERKEZ_HAKEDIS': 'Merkez Hakediş',
      'INSAN_KAYNAKLARI': 'İnsan Kaynakları',
      'RUHSATLANDIRMA': 'Ruhsatlandırma',
      'MALI_ISLER': 'Mali İşler',
      'BILGI_SISTEMLERI': 'Bilgi Sistemleri',
      'MISAFIR_HIZMETLERI': 'Misafir Hizmetleri',
      'BIYOMEDIKAL': 'Biyomedikal',
      'ISG_EGITMENI': 'İSG Eğitmeni',
      'KALITE_EGITMENI': 'Kalite Eğitmeni',
      'ADMIN': 'Admin',
    };
    return roleMap[role] || role;
  };

  const getStepLabel = (step: string) => {
    const stepMap: { [key: string]: string } = {
      'MALI_GMY': 'Mali GMY Onayı',
      'MERKEZ_HAKEDIS': 'Merkez Hakediş',
      'INSAN_KAYNAKLARI': 'İnsan Kaynakları',
      'RUHSATLANDIRMA': 'Ruhsatlandırma',
      'MALI_ISLER': 'Mali İşler',
      'BILGI_SISTEMLERI': 'Bilgi Sistemleri',
      'MISAFIR_HIZMETLERI': 'Misafir Hizmetleri',
      'BIYOMEDIKAL': 'Biyomedikal',
      'ORYANTASYON': 'Oryantasyon Planlaması',
    };
    return stepMap[step] || step;
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          Doktor Workflow
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-link active">
            Dashboard
          </button>
          {currentUser?.role === 'ADMIN' && (
            <button className="sidebar-link" onClick={() => navigate('/admin')}>
              Admin Panel
            </button>
          )}
          <button className="sidebar-link" onClick={() => { localStorage.removeItem('userId'); navigate('/'); }}>
            Çıkış
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Hoş geldiniz, görevlerinizi takip edin</p>
          </div>
          {currentUser && (
            <div className="header-user">
              <div className="header-user-info">
                <div className="header-user-name">{currentUser.name}</div>
                <div className="header-user-role">{getRoleLabel(currentUser.role)}</div>
              </div>
              <div className="user-avatar">{currentUser.name.charAt(0)}</div>
            </div>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon primary">📋</div>
            <div className="stat-card-value">{myTasks.length}</div>
            <div className="stat-card-label">Bekleyen Görevlerim</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon warning">⏳</div>
            <div className="stat-card-value">{pendingTasks.length}</div>
            <div className="stat-card-label">Toplam Bekleyen</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon success">✓</div>
            <div className="stat-card-value">{completedTasks.length}</div>
            <div className="stat-card-label">Tamamlanan</div>
          </div>
        </div>

        <div className="new-contract-card">
          <h3>Yeni Sözleşme Süreci Başlat</h3>
          <div className="new-contract-form">
            <input
              type="text"
              placeholder="Doktor Adı (Dr. ...)"
              value={newContract.doctor_name}
              onChange={e => setNewContract({ ...newContract, doctor_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Branş (Dahiliye, vs.)"
              value={newContract.doctor_role}
              onChange={e => setNewContract({ ...newContract, doctor_role: e.target.value })}
            />
            <input
              type="date"
              value={newContract.start_date}
              onChange={e => setNewContract({ ...newContract, start_date: e.target.value })}
            />
            <button onClick={handleCreateContract}>
              Süreci Başlat
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Bekleyen Görevlerim</h2>
          </div>

          {myTasks.length === 0 ? (
            <div className="empty-state">
              <h3>Harika! Bekleyen göreviniz yok</h3>
              <p>Yeni görevler atandığında burada görünecektir.</p>
            </div>
          ) : (
            myTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <div className="task-card-title">{getStepLabel(task.step_name)}</div>
                  <span className="badge badge-warning">Bekliyor</span>
                </div>
                <div className="task-card-meta">
                  <span>Doktor: <strong>{task.doctor_name}</strong></span>
                  <span>Durum: {task.current_status}</span>
                </div>
                <button
                  className="btn btn-success"
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  Göreve Git
                </button>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tüm Görevler</h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAllTasks(!showAllTasks)}
            >
              {showAllTasks ? 'Gizle' : 'Göster'}
            </button>
          </div>

          {showAllTasks && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Atanan</th>
                    <th>Adım</th>
                    <th>Doktor</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td>{task.id}</td>
                      <td>{task.assigned_user_name}</td>
                      <td>{getStepLabel(task.step_name)}</td>
                      <td>{task.doctor_name}</td>
                      <td>
                        <span className={`badge ${task.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                          {task.status === 'COMPLETED' ? 'Tamamlandı' : 'Bekliyor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

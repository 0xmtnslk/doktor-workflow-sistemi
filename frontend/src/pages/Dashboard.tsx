import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createContract, getUsers, getContracts } from '../api';
import ContractTimeline from '../components/ContractTimeline';

interface Task {
  id: number;
  assigned_to: number;
  assigned_user_name: string;
  step_name: string;
  doctor_name: string;
  current_status: string;
  status: string;
  data: any;
  contract_id: number;
}

interface User {
  id: number;
  name: string;
  role: string;
}

interface Contract {
  id: number;
  current_status: string;
  created_by: number;
  created_by_name: string;
  data: {
    doctor_name: string;
    doctor_role: string;
    start_date: string;
  };
  created_at: string;
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [newContract, setNewContract] = useState({ doctor_name: '', doctor_role: '', start_date: '' });
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const navigate = useNavigate();

  const myUserId = localStorage.getItem('userId');
  const currentUser = users.find(u => u.id === Number(myUserId));

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, usersRes, contractsRes] = await Promise.all([
        getTasks(), 
        getUsers(),
        getContracts()
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setContracts(contractsRes.data);
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
  
  const myContracts = contracts.filter(c => c.created_by === Number(myUserId));
  const activeContracts = myContracts.filter(c => c.current_status !== 'TAMAMLANDI');

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
      'PARALEL_SUREC': 'Paralel Süreç',
      'MALI_ISLER': 'Mali İşler',
      'BILGI_SISTEMLERI': 'Bilgi Sistemleri',
      'MISAFIR_HIZMETLERI': 'Misafir Hizmetleri',
      'PARALEL_2': 'Paralel Süreç 2',
      'BIYOMEDIKAL': 'Biyomedikal',
      'ORYANTASYON': 'Oryantasyon Planlaması',
      'TAMAMLANDI': 'Tamamlandı',
    };
    return stepMap[step] || step;
  };

  const getStatusColor = (status: string) => {
    if (status === 'TAMAMLANDI') return '#10b981';
    return '#f59e0b';
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
          {activeContracts.length > 0 && (
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>🔄</div>
              <div className="stat-card-value">{activeContracts.length}</div>
              <div className="stat-card-label">Aktif Süreçlerim</div>
            </div>
          )}
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

        {myContracts.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Başlattığım Süreçler</h2>
              <span className="badge badge-primary">{myContracts.length} süreç</span>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {myContracts.map(contract => (
                <div 
                  key={contract.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${getStatusColor(contract.current_status)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setSelectedContractId(contract.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '1.25rem'
                    }}>
                      {contract.data?.doctor_name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>
                        {contract.data?.doctor_name || 'Doktor'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {contract.data?.doctor_role} • {new Date(contract.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#64748b',
                        marginBottom: '4px'
                      }}>
                        Mevcut Adım
                      </div>
                      <span 
                        className={`badge ${contract.current_status === 'TAMAMLANDI' ? 'badge-success' : 'badge-warning'}`}
                      >
                        {getStepLabel(contract.current_status)}
                      </span>
                    </div>
                    <div style={{ 
                      color: '#64748b', 
                      fontSize: '1.25rem',
                      padding: '8px'
                    }}>
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Süreç detaylarını görmek için bir sözleşmeye tıklayın
            </div>
          </div>
        )}

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
                  <span>Durum: {getStepLabel(task.current_status)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-success"
                    onClick={() => navigate(`/task/${task.id}`)}
                  >
                    Göreve Git
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedContractId(task.contract_id)}
                  >
                    Süreci Gör
                  </button>
                </div>
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

      {selectedContractId && (
        <ContractTimeline 
          contractId={selectedContractId} 
          onClose={() => setSelectedContractId(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;

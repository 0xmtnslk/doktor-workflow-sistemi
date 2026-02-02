import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createContract, getUsers, getContracts } from '../api';
import InlineTimeline from '../components/InlineTimeline';

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
  const [showNewContractForm, setShowNewContractForm] = useState(false);
  const navigate = useNavigate();

  const myUserId = localStorage.getItem('userId');
  const currentUser = users.find(u => u.id === Number(myUserId));

  const myContracts = contracts.filter(c => c.created_by === Number(myUserId));
  const activeContracts = myContracts.filter(c => c.current_status !== 'TAMAMLANDI');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (myContracts.length === 1 && selectedContractId === null) {
      setSelectedContractId(myContracts[0].id);
    } else if (myContracts.length > 1 && selectedContractId === null) {
      setSelectedContractId(myContracts[0].id);
    }
  }, [myContracts, selectedContractId]);

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
      const res = await createContract({ ...newContract, created_by: myUserId });
      alert('Sözleşme başarıyla başlatıldı!');
      setNewContract({ doctor_name: '', doctor_role: '', start_date: '' });
      setShowNewContractForm(false);
      loadData();
      if (res.data && res.data.contractId) {
        setSelectedContractId(res.data.contractId);
      }
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

  const isMaliGMY = currentUser?.role === 'MALI_GMY';

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

        {isMaliGMY && (
          <div className="card" style={{ marginBottom: '24px' }}>
            {myContracts.length === 0 || showNewContractForm ? (
              <>
                <div className="card-header">
                  <h2 className="card-title">
                    {myContracts.length === 0 ? 'Yeni Sözleşme Süreci Başlat' : 'Yeni Süreç Ekle'}
                  </h2>
                  {myContracts.length > 0 && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowNewContractForm(false)}
                    >
                      Geri
                    </button>
                  )}
                </div>
                <div className="new-contract-form" style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  flexWrap: 'wrap',
                  padding: '0'
                }}>
                  <input
                    type="text"
                    placeholder="Doktor Adı (Dr. ...)"
                    value={newContract.doctor_name}
                    onChange={e => setNewContract({ ...newContract, doctor_name: e.target.value })}
                    style={{ flex: '1', minWidth: '200px' }}
                  />
                  <input
                    type="text"
                    placeholder="Branş (Dahiliye, vs.)"
                    value={newContract.doctor_role}
                    onChange={e => setNewContract({ ...newContract, doctor_role: e.target.value })}
                    style={{ flex: '1', minWidth: '150px' }}
                  />
                  <input
                    type="date"
                    value={newContract.start_date}
                    onChange={e => setNewContract({ ...newContract, start_date: e.target.value })}
                    style={{ minWidth: '150px' }}
                  />
                  <button 
                    className="btn btn-success"
                    onClick={handleCreateContract}
                  >
                    Süreci Başlat
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="card-header" style={{ marginBottom: '16px' }}>
                  <h2 className="card-title">Süreç Takibi</h2>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => setShowNewContractForm(true)}
                  >
                    + Yeni Süreç
                  </button>
                </div>

                {myContracts.length > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    borderBottom: '2px solid #e2e8f0',
                    paddingBottom: '12px'
                  }}>
                    {myContracts.map(contract => (
                      <button
                        key={contract.id}
                        onClick={() => setSelectedContractId(contract.id)}
                        style={{
                          padding: '10px 16px',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.2s',
                          background: selectedContractId === contract.id 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                            : '#f1f5f9',
                          color: selectedContractId === contract.id ? 'white' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: contract.current_status === 'TAMAMLANDI' ? '#10b981' : '#f59e0b'
                        }} />
                        {contract.data?.doctor_name || 'Doktor'}
                      </button>
                    ))}
                  </div>
                )}

                {selectedContractId && (
                  <InlineTimeline contractId={selectedContractId} />
                )}
              </>
            )}
          </div>
        )}

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
          {isMaliGMY && activeContracts.length > 0 && (
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>🔄</div>
              <div className="stat-card-value">{activeContracts.length}</div>
              <div className="stat-card-label">Aktif Süreçlerim</div>
            </div>
          )}
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
                  <span>Durum: {getStepLabel(task.current_status)}</span>
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

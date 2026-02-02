import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../api';

interface User {
  id: number;
  name: string;
  role: string;
}

const Login = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
      if (res.data.length > 0) {
        setUserId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!userId) return;
    localStorage.setItem('userId', userId);
    const user = users.find(u => u.id === Number(userId));
    if (user?.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

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

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'white',
            fontSize: '28px'
          }}>
            🏥
          </div>
          <h1>Doktor Workflow</h1>
          <p>Doktor işe alım süreç yönetim sistemi</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
            Yükleniyor...
          </div>
        ) : users.length === 0 ? (
          <div className="alert alert-error">
            Sistemde kayıtlı kullanıcı bulunamadı. Lütfen veritabanını kontrol edin.
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Kullanıcı Seçin</label>
              <select
                className="form-select"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({getRoleLabel(user.role)})
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleLogin}
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              Giriş Yap
            </button>

            <div style={{ 
              marginTop: '24px', 
              textAlign: 'center', 
              fontSize: '0.875rem', 
              color: '#64748b' 
            }}>
              Test modu - Şifre gerekli değildir
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;

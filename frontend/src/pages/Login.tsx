import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [userId, setUserId] = useState('1'); // Varsayılan 1 (Ahmet Yılmaz)
  const navigate = useNavigate();

  const handleLogin = () => {
    // Gerçek uygulamada şifre kontrolü yapılır. Şimdilik ID ile geçiş yapıyoruz.
    // ID'yi localStorage'a kaydediyoruz ki görevleri filtreleyebiliriz.
    localStorage.setItem('userId', userId);
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Doktor Workflow Sistemi</h1>
      <div style={{ border: '1px solid #ccc', padding: '20px', maxWidth: '300px', margin: 'auto' }}>
        <h3>Giriş Yap (Test)</h3>
        <p>Hangi kullanıcı olarak girmek istersiniz?</p>
        
       <select 
  value={userId} 
  onChange={(e) => setUserId(e.target.value)}
  style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
>
  <option value="1">Ahmet Yılmaz (Mali GMY)</option>
  <option value="2">Ayşe Demir (Merkez Hakediş)</option>
  <option value="3">Ali Veli (İnsan Kaynakları)</option>
  <option value="4">Zeynep Yılmaz (Ruhsatlandırma)</option>
  <option value="5">Hasan Hakkediş (Mali İşler)</option>
  <option value="6">Ahmet Bilişim (Bilgi Sistemleri)</option>
  <option value="7">Fatma Misafir (Misafir Hizmetleri)</option>
  <option value="8">Tuncer Bio (Biyomedikal)</option>
  <option value="9">Osman Güven (İSG Eğitmeni)</option>
  <option value="10">Selin Kalite (Kalite Eğitmeni)</option>
</select>
        
        <button onClick={handleLogin} style={{ padding: '10px 20px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}>
          Giriş Yap
        </button>
      </div>
    </div>
  );
};

export default Login;
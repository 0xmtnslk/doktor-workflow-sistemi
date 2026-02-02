import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTasks, completeTask, getUsers } from '../api';

interface User {
  id: number;
  name: string;
  role: string;
}

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const myUserId = localStorage.getItem('userId');
  const currentUser = users.find(u => u.id === Number(myUserId));

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const [tasksRes, usersRes] = await Promise.all([getTasks(), getUsers()]);
    const found = tasksRes.data.find((t: any) => t.id === Number(id));
    setTask(found);
    setUsers(usersRes.data);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await completeTask(Number(id), formData);
      alert('Görev tamamlandı!');
      navigate('/dashboard');
    } catch (err) {
      alert('Hata oluştu!');
    } finally {
      setLoading(false);
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

  const getStepLabel = (step: string) => {
    const stepMap: { [key: string]: string } = {
      'MALI_GMY': 'Mali GMY Onayı',
      'MERKEZ_HAKEDIS': 'Merkez Hakediş Kontrolü',
      'INSAN_KAYNAKLARI': 'İnsan Kaynakları İşlemleri',
      'RUHSATLANDIRMA': 'Ruhsatlandırma İşlemleri',
      'MALI_ISLER': 'Mali İşler Entegrasyonu',
      'BILGI_SISTEMLERI': 'Bilgi Sistemleri Kurulumu',
      'MISAFIR_HIZMETLERI': 'Misafir Hizmetleri Hazırlığı',
      'BIYOMEDIKAL': 'Biyomedikal Ekipman Hazırlığı',
      'ORYANTASYON': 'Oryantasyon Planlaması',
    };
    return stepMap[step] || step;
  };

  const renderForm = () => {
    const stepName = task?.step_name;
    if (!stepName) return <div className="empty-state"><p>Yükleniyor...</p></div>;

    const formFields: { [key: string]: React.ReactNode } = {
      'MALI_GMY': (
        <>
          <div className="form-group">
            <label className="form-label">Doktor Adı</label>
            <input type="text" className="form-input" value={task?.doctor_name || ''} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Satış Onaylandı mı?</label>
            <select className="form-select" value={formData.satis_onaylandi_mi || ''} onChange={e => setFormData({...formData, satis_onaylandi_mi: e.target.value === 'true'})}>
              <option value="">Seçiniz</option>
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Hakedişe Gönderildi mi?</label>
            <select className="form-select" value={formData.hakedise_gonderildi_mi || ''} onChange={e => setFormData({...formData, hakedise_gonderildi_mi: e.target.value === 'true'})}>
              <option value="">Seçiniz</option>
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
        </>
      ),
      'MERKEZ_HAKEDIS': (
        <>
          <div className="form-group">
            <label className="form-label">Sözleşme Ulaştı mı?</label>
            <select className="form-select" value={formData.sozlesme_ulasti_mi || ''} onChange={e => setFormData({...formData, sozlesme_ulasti_mi: e.target.value === 'true'})}>
              <option value="">Seçiniz</option>
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sözleşme Onaylandı mı?</label>
            <select className="form-select" value={formData.sozlesme_onaylandi_mi || ''} onChange={e => setFormData({...formData, sozlesme_onaylandi_mi: e.target.value === 'true'})}>
              <option value="">Seçiniz</option>
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
        </>
      ),
      'INSAN_KAYNAKLARI': (
        <div className="form-group">
          <label className="form-label">Oracle Girişi Yapıldı mı?</label>
          <select className="form-select" value={formData.oracle_girisi || ''} onChange={e => setFormData({...formData, oracle_girisi: e.target.value === 'true'})}>
            <option value="">Seçiniz</option>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
        </div>
      ),
      'RUHSATLANDIRMA': (
        <div className="form-group">
          <label className="form-label">e-İmza İstendi mi?</label>
          <select className="form-select" value={formData.esign_istendi || ''} onChange={e => setFormData({...formData, esign_istendi: e.target.value === 'true'})}>
            <option value="">Seçiniz</option>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
        </div>
      ),
      'MALI_ISLER': (
        <div className="form-group">
          <label className="form-label">Hakediş Entegre Edildi mi?</label>
          <select className="form-select" value={formData.hakkedis || ''} onChange={e => setFormData({...formData, hakkedis: e.target.value === 'true'})}>
            <option value="">Seçiniz</option>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
        </div>
      ),
      'BILGI_SISTEMLERI': (
        <>
          <div className="form-group">
            <label className="form-label">Pusula Kuruldu mu?</label>
            <select className="form-select" value={formData.pusula_kuruldu_mu || ''} onChange={e => setFormData({...formData, pusula_kuruldu_mu: e.target.value === 'true'})}>
              <option value="">Seçiniz</option>
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Comed Kuruldu mu?</label>
            <select className="form-select" value={formData.comed_kuruldu_mu || ''} onChange={e => setFormData({...formData, comed_kuruldu_mu: e.target.value === 'true'})}>
              <option value="">Seçiniz</option>
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">e-İmza Entegrasyonu Tamam mı?</label>
            <select className="form-select" value={formData.esign_integrasyon || ''} onChange={e => setFormData({...formData, esign_integrasyon: e.target.value === 'true'})}>
              <option value="">Seçiniz</option>
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
        </>
      ),
      'MISAFIR_HIZMETLERI': (
        <>
          <div className="form-group">
            <label className="form-label">Randevu Ekranları Tanımlandı mı?</label>
            <select className="form-select" value={formData.randevu_tanimlandi || ''} onChange={e => setFormData({...formData, randevu_tanimlandi: e.target.value === 'true'})}>
              <option value="">Seçiniz</option>
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Oda Altyapı Hazır mı?</label>
            <select className="form-select" value={formData.oda_altyapi || ''} onChange={e => setFormData({...formData, oda_altyapi: e.target.value === 'true'})}>
              <option value="">Seçiniz</option>
              <option value="false">Hayır</option>
              <option value="true">Evet</option>
            </select>
          </div>
        </>
      ),
      'BIYOMEDIKAL': (
        <div className="form-group">
          <label className="form-label">Medikal Ekipman Tamam mı?</label>
          <select className="form-select" value={formData.ekipman_tamam || ''} onChange={e => setFormData({...formData, ekipman_tamam: e.target.value === 'true'})}>
            <option value="">Seçiniz</option>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
        </div>
      ),
      'ORYANTASYON': (
        <>
          <div className="form-group">
            <label className="form-label">Doktor Konumu</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Örn: Zemin Kat Oda A" 
              value={formData.doktor_konumu || ''} 
              onChange={e => setFormData({...formData, doktor_konumu: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Eğitim Verilecek Birimler</label>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  style={{ width: '18px', height: '18px' }}
                  onChange={e => {
                    const units = formData.secilen_birimler || [];
                    if(e.target.checked) units.push(1);
                    else {
                      const idx = units.indexOf(1);
                      if(idx > -1) units.splice(idx, 1);
                    }
                    setFormData({...formData, secilen_birimler: [...units]});
                  }} 
                /> 
                İSG (İş Sağlığı Güvenliği)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  style={{ width: '18px', height: '18px' }}
                  onChange={e => {
                    const units = formData.secilen_birimler || [];
                    if(e.target.checked) units.push(2);
                    else {
                      const idx = units.indexOf(2);
                      if(idx > -1) units.splice(idx, 1);
                    }
                    setFormData({...formData, secilen_birimler: [...units]});
                  }} 
                /> 
                Kalite
              </label>
            </div>
          </div>
        </>
      ),
    };

    return formFields[stepName] || <p style={{ color: '#64748b' }}>Bu adım için form tanımlanmadı.</p>;
  };

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
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/dashboard')}
              style={{ marginBottom: '16px' }}
            >
              ← Geri Dön
            </button>
            <h1 className="page-title">{task ? getStepLabel(task.step_name) : 'Görev Detayı'}</h1>
            <p className="page-subtitle">Görevi tamamlamak için formu doldurun</p>
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

        {task && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Görev Bilgileri</h2>
              </div>
              <span className="badge badge-warning">Bekliyor</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Doktor</div>
                <div style={{ fontWeight: '600' }}>{task.doctor_name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Sorumlu</div>
                <div style={{ fontWeight: '600' }}>{task.assigned_user_name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Sözleşme Durumu</div>
                <div style={{ fontWeight: '600' }}>{task.current_status}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.125rem', fontWeight: '600' }}>Görev Formu</h3>
              {renderForm()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <button 
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={loading}
                style={{ padding: '14px 28px', fontSize: '1rem' }}
              >
                {loading ? 'Kaydediliyor...' : 'Tamamla ve İlerle'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TaskDetail;

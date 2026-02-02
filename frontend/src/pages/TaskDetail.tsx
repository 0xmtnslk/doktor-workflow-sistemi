import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTasks, completeTask } from '../api';
import axios from 'axios';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTaskDetail();
  }, [id]);

  const loadTaskDetail = async () => {
    // Tek tek çekebileceğimiz endpoint yok, tümünü çekip filtreliyoruz (Geliştirilebilir)
    const res = await getTasks();
    const found = res.data.find((t: any) => t.id === Number(id));
    setTask(found);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Form verisini API'ye gönder
      await completeTask(Number(id), formData);
      alert('Görev tamamlandı!');
      navigate('/dashboard');
    } catch (err) {
      alert('Hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  // Dinamik Form Oluşturma (Adım Adım Adlarına Göre)
  const renderForm = () => {
    const stepName = task?.step_name;

    if (!stepName) return <div>Yükleniyor...</div>;

    if (stepName === 'MALI_GMY') {
      return (
        <div>
          <label>Doktor Adı: <b>{task?.doctor_name}</b></label>
          <br /><br />
          <label>Satış Onaylandı mı?</label>
          <select value={formData.satis_onaylandi_mi} onChange={e => setFormData({...formData, satis_onaylandi_mi: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
          <br /><br />
          <label>Hakedişe Gönderildi mi?</label>
          <select value={formData.hakedise_gonderildi_mi} onChange={e => setFormData({...formData, hakedise_gonderildi_mi: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
        </div>
      );
    }
        if (stepName === 'BILGI_SISTEMLERI') {
      return (
        <div>
          <label>Pusula Kuruldu mu?</label>
          <select value={formData.pusula_kuruldu_mu} onChange={e => setFormData({...formData, pusula_kuruldu_mu: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
          <br /><br />
          <label>Comed Kuruldu mu?</label>
          <select value={formData.comed_kuruldu_mu} onChange={e => setFormData({...formData, comed_kuruldu_mu: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
          <br /><br />
          <label>e-İmza Entegrasyon?</label>
          <select value={formData.esign_integrasyon} onChange={e => setFormData({...formData, esign_integrasyon: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
        </div>
      );
    }

    if (stepName === 'MISAFIR_HIZMETLERI') {
      return (
        <div>
          <label>Randevu Ekranları Tanımlandı mı?</label>
          <select value={formData.randevu_tanimlandi} onChange={e => setFormData({...formData, randevu_tanimlandi: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
          <br /><br />
          <label>Oda Altyapı Hazır mı?</label>
          <select value={formData.oda_altyapi} onChange={e => setFormData({...formData, oda_altyapi: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
        </div>
      );
    }

    if (stepName === 'BIYOMEDIKAL') {
      return (
        <div>
           <label>Medikal Ekipman Tamam mı?</label>
           <select value={formData.ekipman_tamam} onChange={e => setFormData({...formData, ekipman_tamam: e.target.value === 'true'})}>
             <option value="false">Hayır</option>
             <option value="true">Evet</option>
           </select>
        </div>
      );
    }
    
    if (stepName === 'ORYANTASYON') {
      // Basit bir checkbox listesi simülasyonu
      return (
        <div>
           <label>Doktor Konumu:</label>
           <input type="text" placeholder="Örn: Zemin Kat Oda A" onChange={e => setFormData({...formData, doktor_konumu: e.target.value})} value={formData.doktor_konumu || ''} />
           
           <p style={{marginTop: '10px'}}>Eğitim Verilecek Birimler (Çoklu Seçim):</p>
           <div style={{background: '#f0f0f0', padding: '10px', borderRadius: '5px'}}>
             <label><input type="checkbox" onChange={e => {
               const units = formData.secilen_birimler || [];
               if(e.target.checked) units.push(1); // İSG ID
               else {
                 const idx = units.indexOf(1);
                 if(idx > -1) units.splice(idx, 1);
               }
               setFormData({...formData, secilen_birimler: units});
             }} /> İSG (İş Sağlığı Güvenliği)</label>
             <br />
             <label><input type="checkbox" onChange={e => {
               const units = formData.secilen_birimler || [];
               if(e.target.checked) units.push(2); // Kalite ID
               else {
                 const idx = units.indexOf(2);
                 if(idx > -1) units.splice(idx, 1);
               }
               setFormData({...formData, secilen_birimler: units});
             }} /> Kalite</label>
           </div>
        </div>
      );
    }

    if (stepName === 'MERKEZ_HAKEDIS') {
      return (
        <div>
          <label>Sözleşme Ulaştı mı?</label>
          <select value={formData.sozlesme_ulasti_mi} onChange={e => setFormData({...formData, sozlesme_ulasti_mi: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
          <br /><br />
          <label>Sözleşme Onaylandı mı?</label>
          <select value={formData.sozlesme_onaylandi_mi} onChange={e => setFormData({...formData, sozlesme_onaylandi_mi: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
        </div>
      );
    }

    if (stepName === 'INSAN_KAYNAKLARI') {
      return (
        <div>
          <label>Oracle Girişi Yapıldı mı?</label>
          <select value={formData.oracle_girisi} onChange={e => setFormData({...formData, oracle_girisi: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
        </div>
      );
    }
    
    if (stepName === 'RUHSATLANDIRMA') {
      return (
        <div>
          <label>e-İmza İstendi mi?</label>
          <select value={formData.esign_istendi} onChange={e => setFormData({...formData, esign_istendi: e.target.value === 'true'})}>
            <option value="false">Hayır</option>
            <option value="true">Evet</option>
          </select>
        </div>
      );
    }

    if (stepName === 'MALI_ISLER') {
      return (
        <div>
           <label>Hakkediş Entegre Edildi mi?</label>
           <select value={formData.hakkedis} onChange={e => setFormData({...formData, hakkedis: e.target.value === 'true'})}>
             <option value="false">Hayır</option>
             <option value="true">Evet</option>
           </select>
        </div>
      );
    }

    return <p>Bu adım için henüz form tanımlanmadı.</p>;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: '#ccc', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Geri Dön</button>
      
      {task && (
        <div style={{ border: '1px solid #333', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
          <h2>{task.step_name}</h2>
          <p>Sorumlu Kişi: {task.assigned_user_name}</p>
          <hr />
          <h3>Görev Formu</h3>
          {renderForm()}
          <br />
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            style={{ padding: '15px 30px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', float: 'right' }}
          >
            {loading ? 'Kaydediliyor...' : 'Tamamla ve İleri'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
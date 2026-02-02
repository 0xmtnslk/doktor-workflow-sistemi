import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createContract } from '../api';

interface Task {
  id: number;
  assigned_to: number; 
  assigned_user_name: string;
  step_name: string;
  doctor_name: string;
  current_status: string;
  status: string; // PENDING or COMPLETED
  data: any;
}

const Dashboard = () => {
    // Yeni Sözleşme Formu State'leri
  const [newContract, setNewContract] = useState({ doctor_name: '', doctor_role: '', start_date: '' });

  // Yeni Sözleşme Başlatma Fonksiyonu
  const handleCreateContract = async () => {
    if (!newContract.doctor_name || !newContract.doctor_role || !newContract.start_date) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const currentUser = localStorage.getItem('userId');
      await createContract({ ...newContract, created_by: currentUser });
      alert("Sözleşme başarıyla başlatıldı! Görevler oluşturuluyor...");
      setNewContract({ doctor_name: '', doctor_role: '', start_date: '' }); // Formu temizle
      loadTasks(); // Listeyi yenile
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    }
  };
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Sadece bana atanmış ve bekleyen görevleri gösterelim
  const myUserId = localStorage.getItem('userId');
  const myTasks = tasks.filter(t => t.assigned_to === Number(myUserId) && t.status === 'PENDING'); // Basit filtreleme

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2>Görev Panelim (Dashboard)</h2>
              {/* YENİ SÖZLEŞME BAŞLATMA KUTUSU */}
      <div style={{ border: '1px dashed #007bff', padding: '15px', marginBottom: '20px', borderRadius: '5px', backgroundColor: '#e6f2ff' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Yeni Sözleşme Süreci Başlat</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Doktor Adı (Dr. ...)" 
            value={newContract.doctor_name}
            onChange={e => setNewContract({...newContract, doctor_name: e.target.value})}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          />
          <input 
            type="text" 
            placeholder="Branş (Dahiliye, vs.)" 
            value={newContract.doctor_role}
            onChange={e => setNewContract({...newContract, doctor_role: e.target.value})}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          />
          <input 
            type="date" 
            value={newContract.start_date}
            onChange={e => setNewContract({...newContract, start_date: e.target.value})}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button 
            onClick={handleCreateContract}
            style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Başlat
          </button>
        </div>
      </div>
      {/* KUTU BİTİŞ */}
        <button onClick={() => window.location.href='/'} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Çıkış</button>
      </div>

      <h3>Bekleyen Görevlerim:</h3>
      {myTasks.length === 0 && <p>Hiç göreviniz yok!</p>}
      
      <ul style={{ listStyle: 'none' }}>
        {myTasks.map(task => (
          <li key={task.id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{task.step_name}</div>
            <div>Doktor: <b>{task.doctor_name}</b> | Sözleşme Durumu: {task.current_status}</div>
            <button 
              onClick={() => navigate(`/task/${task.id}`)}
              style={{ marginTop: '10px', padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            >
              Göreve Git
            </button>
          </li>
        ))}
      </ul>

      <hr />
      <h3>Tüm Görevler (Debug Görünümü):</h3>
      <ul style={{ listStyle: 'none', fontSize: '12px' }}>
        {tasks.map(task => (
          <li key={task.id}>
            ID: {task.id} - {task.assigned_user_name} - {task.step_name} ({task.status})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
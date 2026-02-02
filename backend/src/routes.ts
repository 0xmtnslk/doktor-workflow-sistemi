import express from 'express';
import { pool } from './db';
import { createContract, getContracts, completeTask } from './workflowController';

const router = express.Router();

// 1. TEST
router.get('/', (req, res) => {
  res.send({ message: 'API Çalışıyor! 🚀' });
});

// 2. KULLANICI İŞLEMLERİ
router.post('/users', async (req, res) => {
  const { name, email, role, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, role, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, role, password || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor.' });
    } else {
      res.status(500).json({ error: 'Kullanıcı oluşturulamadı.' });
    }
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcılar getirilemedi.' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı getirilemedi.' });
  }
});

router.put('/users/:id', async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role, created_at',
      [name, email, role, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor.' });
    } else {
      res.status(500).json({ error: 'Kullanıcı güncellenemedi.' });
    }
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.json({ message: 'Kullanıcı silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Kullanıcı silinemedi.' });
  }
});

// 3. BİRİM İŞLEMLERİ
router.get('/units', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, us.name as trainer_name 
      FROM units u 
      LEFT JOIN users us ON u.training_contact_user_id = us.id 
      ORDER BY u.id
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Birimler getirilemedi.' });
  }
});

router.post('/units', async (req, res) => {
  const { name, training_contact_user_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO units (name, training_contact_user_id) VALUES ($1, $2) RETURNING *',
      [name, training_contact_user_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Birim oluşturulamadı.' });
  }
});

router.put('/units/:id', async (req, res) => {
  const { name, training_contact_user_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE units SET name = $1, training_contact_user_id = $2 WHERE id = $3 RETURNING *',
      [name, training_contact_user_id || null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Birim bulunamadı.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Birim güncellenemedi.' });
  }
});

router.delete('/units/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM units WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Birim bulunamadı.' });
    }
    res.json({ message: 'Birim silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Birim silinemedi.' });
  }
});

// Workflow Rolleri (Sabit liste)
router.get('/workflow-roles', (req, res) => {
  const roles = [
    { id: 'MALI_GMY', name: 'Mali GMY', description: 'Sözleşme başlatma ve onaylama' },
    { id: 'MERKEZ_HAKEDIS', name: 'Merkez Hakediş', description: 'Sözleşme ulaşım kontrolü' },
    { id: 'INSAN_KAYNAKLARI', name: 'İnsan Kaynakları', description: 'Oracle ve özlük işlemleri' },
    { id: 'RUHSATLANDIRMA', name: 'Ruhsatlandırma', description: 'e-İmza işlemleri' },
    { id: 'MALI_ISLER', name: 'Mali İşler', description: 'Hakediş entegrasyonu' },
    { id: 'BILGI_SISTEMLERI', name: 'Bilgi Sistemleri', description: 'Pusula ve e-imza kontrolü' },
    { id: 'MISAFIR_HIZMETLERI', name: 'Misafir Hizmetleri', description: 'Oda ve randevu hazırlık' },
    { id: 'BIYOMEDIKAL', name: 'Biyomedikal', description: 'Medikal ekipman hazırlık' },
    { id: 'ISG_EGITMENI', name: 'İSG Eğitmeni', description: 'İSG eğitimi' },
    { id: 'KALITE_EGITMENI', name: 'Kalite Eğitmeni', description: 'Kalite eğitimi' },
    { id: 'ADMIN', name: 'Admin', description: 'Sistem yöneticisi' }
  ];
  res.json(roles);
});

// 4. WORKFLOW (SÖZLEŞME) BAŞLATMA
router.post('/contracts', createContract);

// 5. SÖZLEŞMELERİ LİSTELEME
router.get('/contracts', getContracts);

// Sözleşme Timeline (Akış takibi için)
router.get('/contracts/:id/timeline', async (req, res) => {
  try {
    const contractId = req.params.id;
    
    const contractResult = await pool.query(`
      SELECT c.*, u.name as created_by_name 
      FROM contracts c 
      LEFT JOIN users u ON c.created_by = u.id 
      WHERE c.id = $1
    `, [contractId]);
    
    if (contractResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sözleşme bulunamadı.' });
    }
    
    const contract = contractResult.rows[0];
    
    const tasksResult = await pool.query(`
      SELECT t.*, u.name as assigned_user_name, u.role as assigned_user_role
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      WHERE t.contract_id = $1
      ORDER BY t.created_at ASC
    `, [contractId]);
    
    const tasks = tasksResult.rows;
    
    const workflowSteps = [
      { id: 'MALI_GMY', name: 'Mali GMY Onayı', order: 1, parallel: false },
      { id: 'MERKEZ_HAKEDIS', name: 'Merkez Hakediş', order: 2, parallel: false },
      { id: 'INSAN_KAYNAKLARI', name: 'İnsan Kaynakları', order: 3, parallel: true, parallelGroup: 'A' },
      { id: 'RUHSATLANDIRMA', name: 'Ruhsatlandırma', order: 3, parallel: true, parallelGroup: 'A' },
      { id: 'MALI_ISLER', name: 'Mali İşler', order: 4, parallel: false },
      { id: 'BILGI_SISTEMLERI', name: 'Bilgi Sistemleri', order: 5, parallel: false },
      { id: 'MISAFIR_HIZMETLERI', name: 'Misafir Hizmetleri', order: 6, parallel: true, parallelGroup: 'B' },
      { id: 'BIYOMEDIKAL', name: 'Biyomedikal', order: 6, parallel: true, parallelGroup: 'B' },
      { id: 'ORYANTASYON', name: 'Oryantasyon Planlaması', order: 7, parallel: false },
      { id: 'TAMAMLANDI', name: 'Süreç Tamamlandı', order: 8, parallel: false },
    ];
    
    const timeline = workflowSteps.map(step => {
      const relatedTasks = tasks.filter((t: any) => t.step_name === step.id);
      const completedTask = relatedTasks.find((t: any) => t.status === 'COMPLETED');
      const pendingTask = relatedTasks.find((t: any) => t.status === 'PENDING');
      
      return {
        ...step,
        status: completedTask ? 'COMPLETED' : (pendingTask ? 'PENDING' : 'WAITING'),
        completedBy: completedTask ? completedTask.assigned_user_name : null,
        completedAt: completedTask ? completedTask.completed_at : null,
        assignedTo: pendingTask ? pendingTask.assigned_user_name : null,
        tasks: relatedTasks
      };
    });
    
    res.json({
      contract: {
        id: contract.id,
        doctor_name: contract.data?.doctor_name,
        doctor_role: contract.data?.doctor_role,
        current_status: contract.current_status,
        created_by: contract.created_by_name,
        created_at: contract.created_at
      },
      timeline,
      tasks
    });
  } catch (error) {
    console.error('Timeline hatası:', error);
    res.status(500).json({ error: 'Timeline yüklenemedi.' });
  }
});

// Kullanıcının oluşturduğu sözleşmeleri getir
router.get('/contracts/by-user/:userId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as created_by_name 
      FROM contracts c 
      LEFT JOIN users u ON c.created_by = u.id 
      WHERE c.created_by = $1
      ORDER BY c.created_at DESC
    `, [req.params.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Sözleşmeler getirilemedi.' });
  }
});

// TÜM GÖREVLERİ LİSTELE
router.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name as assigned_user_name, u.role, c.data->>'doctor_name' as doctor_name, c.current_status
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      JOIN contracts c ON t.contract_id = c.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Hata' }); }
});

// 6. GÖREVİ TAMAMLAMA
router.post('/tasks/:id/complete', completeTask);

export default router;
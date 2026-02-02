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
import express from 'express';
import { pool } from './db';
import { createContract, getContracts, completeTask } from './workflowController';

const router = express.Router();

// 1. TEST
router.get('/', (req, res) => {
  res.send({ message: 'API Çalışıyor! 🚀' });
});

// 2. KULLANICI İŞLEMLERİ (Önceki adımdan kalabilir)
router.post('/users', async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const result = await pool.query('INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *', [name, email, role]);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
// KULLANICILARI LİSTELE
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Hata' }); }
});

// 3. BİRİM İŞLEMLERİ
router.post('/units', async (req, res) => {
  const { name, training_contact_user_id } = req.body;
  try {
    const result = await pool.query('INSERT INTO units (name, training_contact_user_id) VALUES ($1, $2) RETURNING *', [name, training_contact_user_id]);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Hata' }); }
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
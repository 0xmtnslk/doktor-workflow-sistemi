import { Request, Response } from 'express';
import { pool } from './db';

// --- FONKSİYON 1: Sözleşme Başlat (MALI GMY) ---
export const createContract = async (req: Request, res: Response) => {
  const { doctor_name, doctor_role, start_date, created_by } = req.body;

  try {
    const data = {
      doctor_name,
      doctor_role,
      start_date
    };

    const contractResult = await pool.query(
      `INSERT INTO contracts (current_status, created_by, data)
       VALUES ('MALI_GMY', $1, $2) RETURNING *`,
      [created_by, JSON.stringify(data)]
    );

    const contract = contractResult.rows[0];

    // Mali GMY'ye ilk görevi atanır
    await pool.query(
      `INSERT INTO tasks (contract_id, assigned_to, step_name, description)
       VALUES ($1, $2, 'MALI_GMY', 'Doktor bilgilerini doğrulayın ve süreci başlatın.')`,
      [contract.id, created_by]
    );

    res.status(201).json({ 
      message: 'Sözleşme başarıyla başlatıldı.', 
      contract_id: contract.id 
    });

  } catch (error) {
    console.error("Workflow Hatası:", error);
    res.status(500).json({ error: 'Sözleşme başlatılamadı.' });
  }
};

// --- FONKSİYON 2: Sözleşmeleri Listele ---
export const getContracts = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as created_by_name 
      FROM contracts c 
      JOIN users u ON c.created_by = u.id 
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Veri çekilemedi.' });
  }
};

// --- FONKSİYON 3: Görev Tamamlama ve Akış Yönetimi ---
export const completeTask = async (req: Request, res: Response) => {
  const taskId = req.params.id;
  const answers = req.body;

  try {
    // 1. Görevi Bul
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];

    if (!task) return res.status(404).json({ error: 'Görev bulunamadı.' });

    // 2. Görevi Tamamlandı Olarak İşaretle ve Cevapları Kaydet
    await pool.query(
      'UPDATE tasks SET status = $1, data = $2, completed_at = NOW() WHERE id = $3',
      ['COMPLETED', JSON.stringify(answers), taskId]
    );

    // 3. Sözleşmenin Şimdiki Durumunu Öğren
    const contractResult = await pool.query('SELECT * FROM contracts WHERE id = $1', [task.contract_id]);
    const contract = contractResult.rows[0];

    // --- AKIŞ MANTIĞI (State Machine) ---

    // BLOK 1: MALI_GMY -> MERKEZ_HAKEDIS
    if (contract.current_status === 'MALI_GMY') {
      // Ayşe Demir (ID: 2) Merkez Hakediş görevi atar
      await pool.query(
        `INSERT INTO tasks (contract_id, assigned_to, step_name, description)
         VALUES ($1, $2, $3, 'Sözleşmenin ulaşım durumunu kontrol edin.')`,
        [task.contract_id, 2, 'MERKEZ_HAKEDIS']
      );
      
      await pool.query('UPDATE contracts SET current_status = $1 WHERE id = $2', ['MERKEZ_HAKEDIS', task.contract_id]);
      return res.json({ message: 'Merkez Hakediş birimine yönlendirildi.', next_step: 'MERKEZ_HAKEDIS' });
    }

    // BLOK 2: MERKEZ_HAKEDIS -> PARALEL SÜREÇ (IK & RUHSAT)
    if (contract.current_status === 'MERKEZ_HAKEDIS') {
      const contract_arrived = answers.sozlesme_ulasti_mi;
      const contract_approved = answers.sozlesme_onaylandi_mi;

      // Sözleşme gelmediyse durdur
      if (contract_arrived === false) {
        return res.json({ message: 'Sözleşme ulaşmadı! Mali GMY ye bildirim atılıyor.', status: 'BACK_TO_START' });
      }

      // Sözleşme onaylandıysa IK ve Ruhsat'a paralel görev at
      if (contract_approved === true) {
        // Ali Veli (ID: 3) - İnsan Kaynakları
        await pool.query(`INSERT INTO tasks (contract_id, assigned_to, step_name, description) VALUES ($1, $2, $3, 'Oracle girişi ve özlük işlemlerini yapın.')`, [task.contract_id, 3, 'INSAN_KAYNAKLARI']);

        // Zeynep Yılmaz (ID: 4) - Ruhsatlandırma
        await pool.query(`INSERT INTO tasks (contract_id, assigned_to, step_name, description) VALUES ($1, $2, $3, 'e-imza istemini yapın.')`, [task.contract_id, 4, 'RUHSATLANDIRMA']);
        
        await pool.query('UPDATE contracts SET current_status = $1 WHERE id = $2', ['PARALEL_SUREC', task.contract_id]);
        return res.json({ message: 'Sözleşme onaylandı. İK ve Ruhsat birimlerine görev atandı.', next_status: 'PARALEL' });
      }
    }

    // BLOK 3: PARALEL_SUREC -> MALI_ISLER
    if (contract.current_status === 'PARALEL_SUREC') {
      // Diğer bitmemiş (PENDING) görev var mı bakalım?
      // Kendimizi (şu an biten task'ı) saymıyoruz.
      const pendingResult = await pool.query(
        'SELECT * FROM tasks WHERE contract_id = $1 AND status = $2 AND id != $3',
        [task.contract_id, 'PENDING', taskId]
      );

      // Eğer hala beklemede görev varsa, diğerini bekle.
      if (pendingResult.rows.length > 0) {
        return res.json({ message: 'Görev tamamlandı. Diğer paralel birim (IK/Ruhsat) bitmeyi bekliyor.' });
      }

      // Eğer hiç beklemede görev yoksa (Yani son görevi biz bitirdik) -> Mali İşlere Git.
      // Hasan Hakkediş (ID: 5) - Mali İşler
      await pool.query(
        `INSERT INTO tasks (contract_id, assigned_to, step_name, description)
         VALUES ($1, $2, $3, 'Hakkediş entegrasyonunu yapın.')`,
        [task.contract_id, 5, 'MALI_ISLER']
      );

      await pool.query('UPDATE contracts SET current_status = $1 WHERE id = $2', ['MALI_ISLER', task.contract_id]);

      return res.json({ message: 'İK ve Ruhsat süreçleri tamamlandı. Mali İşlere gönderildi.', next_status: 'MALI_ISLER' });
    }

    return res.json({ message: 'Tanımsız durum.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
};
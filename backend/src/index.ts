import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { pool } from './db'; // DB bağlantısını buradan al
import routes from './routes'; // Routes'u al

const app = express();
// Middleware'ler
app.use(cors()); // <--- BU SATIRI EKLE
app.use(express.json());
const PORT = 3001;

// Middleware'ler
app.use(express.json()); // JSON verilerini okur

// Routes'u kullan
app.use('/api', routes); // Tüm /api başlayan istekleri routes'a yönlendir

// --- BAŞLATMA FONKSİYONU ---
async function initializeDatabase() {
  try {
    // Veritabanı bağlantısı test
    const client = await pool.connect();
    console.log("✅ Veritabanına başarıyla bağlanıldı.");

    // Şema dosyasını oku
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Şemayı çalıştır (Tablo yoksa oluşturur, varsa hata vermez)
    await client.query(schemaSql);
    console.log("✅ Veritabanı şeması kontrol edildi.");

    client.release();
  } catch (err) {
    console.error("❌ Veritabanı hatası:", err);
  }
}

// Sunucuyu Başlat
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🔥 Sunucu ${PORT} portunda: http://localhost:${PORT}`);
  });
});
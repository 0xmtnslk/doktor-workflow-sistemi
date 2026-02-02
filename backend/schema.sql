-- 1. Birimler Tablosu (Units)
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    training_contact_user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kullanıcılar Tablosu (Users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sözleşmeler Tablosu (Contracts) - JSONB ile veriyi tutarız
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    current_status VARCHAR(100) DEFAULT 'BASLANGIC',
    created_by INTEGER REFERENCES users(id),
    data JSONB DEFAULT '{}', -- Doktor adı, konum vb. bilgiler burada
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Görevler Tablosu (Tasks) - Akış adımları burada oluşur
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(id),
    assigned_to INTEGER REFERENCES users(id),
    step_name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED
    data JSONB DEFAULT '{}', -- Soruların cevapları burada
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
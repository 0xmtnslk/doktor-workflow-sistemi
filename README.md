# 📦 Süreç Workflow Sistemi 
Bu rehber, projenin Ubuntu Sunucusunda (Root kullanıcı ile) sıfırdan kurulmasını ve PM2 ile arkaplanda sürekli çalıştırılmasını anlatır.

### Ön Hazırlık
Sunucuda root yetkisiyle oturum açtığınızı varsayıyoruz.
Sunucunun internet erişimi olduğunu varsayıyoruz.

Proje GitHub adresi: https://github.com/0xmtnslk/doktor-workflow-sistemi.git

## ⚙️ ADIM 1: Sistemi Güncelleme ve Gerekli Paketler
Önce sunucuyu güncelleyelim ve Git ile Nano editörünü kuralım.

```
apt-get update && apt-get upgrade -yapt-get install git nano -y
```
## ⚙️ ADIM 2: Node.js ve NPM Kurulumu

Projeyi çalıştırmak için Node.js 18 sürümünü kuracağız.

```
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
```
Kurulumun başarılı olup olmadığını kontrol edin:

```
node -v
npm -v
```

## ⚙️ ADIM 3: Docker ve Docker Compose Kurulumu
Sadece PostgreSQL veritabanını koşturmak için Docker kullanacağız.

```
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```
(Docker Compose, son Docker sürümleriyle otomatik gelir, ekstra kuruluma gerek yoktur.)

## ⚙️ ADIM 4: Projeyi Sunucuya İndirme
Projeyi GitHub'dan sunucuya kopyalayın.

```
cd /root
git clone https://github.com/0xmtnslk/doktor-workflow-sistemi.git
cd doktor-workflow-sistemi
```

## ⚙️ ADIM 5: Ayarları Düzenleme (İsteğe Bağlı)

A. Veritabanı Şifresini Değiştirmek İstiyorsanız:
Dosyayı açın:
```
nano docker-compose.yml
```
Aşağıdaki satırları kendi şifrenizle değiştirin:
```
environment:
  POSTGRES_USER: doktoradmin      <-- İstediğiniz kullanıcı adı
  POSTGRES_PASSWORD: sifre1234    <-- İstediğiniz güçlü şifre
  POSTGRES_DB: doktor_db
```
Değişiklikten sonra Ctrl + X tuşlarına basın, ardından Y tuşuna basarak kaydedin ve çıkın.

⚠️ DİKKAT: Şifreyi buradan değiştirirseniz, aynı şifreyi backend/src/db.ts dosyasında da güncellemelisiniz, aksi takdirde uygulama veritabanına bağlanamaz. İlk kurulum için standart şifreleri bırakmanız önerilir.

## ⚙️ ADIM 6: Backend ve Frontend Bağımlılıklarını Yükleme
Her iki tarafın da paketlerini indirelim.

```
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## ⚙️ ADIM 7: Veritabanını Başlatma
PostgreSQL veritabanını Docker ile çalıştırıyoruz.

```
docker compose up -d
Konteynerin çalıştığını doğrulamak için:
```
```
docker ps
```
(Çıktıda doktor_wf_db adında bir konteyner görüyorsanız veritabanı hazırdır.)

## ⚙️ ADIM 8: PM2 Kurulumu
PM2, Node.js uygulamalarını arkaplanda çalıştırır ve sunucu yeniden başladığında uygulamayı tekrar açar.

```
npm install -g pm2
```

## ⚙️ ADIM 9: PM2 Konfigürasyon Dosyası Oluşturma
Komutları unutmamak için bir ayar dosyası oluşturacağız.
Projenin ana dizinine (/root/doktor-workflow-sistemi) gelin ve şu komutu çalıştırarak ecosystem.config.js dosyasını oluşturun:

```
nano ecosystem.config.js
```
Aşağıdaki içeriği kopyalayıp yapıştırın ve kaydedin (Ctrl + X -> Y):

```
module.exports = {
  apps : [
    {
      name   : "Doktor Backend",
      script : "npm",
      args   : "run dev",
      cwd    : "/root/doktor-workflow-sistemi/backend",
      watch  : false,
      autorestart: true,
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name   : "Doktor Frontend",
      script : "npm",
      args   : "run dev -- --host",
      cwd    : "/root/doktor-workflow-sistemi/frontend",
      watch  : false,
      autorestart: true,
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

## ⚙️ ADIM 10: Uygulamaları Başlatma
PM2 kullanarak hem Backend'i hem Frontend'i başlatın.

```
pm2 start ecosystem.config.js --env production
```
Çalışıyor mu kontrol edelim:

```
pm2 status
```

(Burada online yazıyorsa sistem aktiftir.)

## ⚙️ ADIM 11: PM2 Kalıcı Hale Getirme (Otomatik Başlatma)
Sunucu yeniden başladığında uygulamanın otomatik çalışması için şu komutu verin.

Önce otomatik başlatma scriptini oluşturmasını iste:

```
pm2 startup
```
(Terminalde size sudo env PATH=$PATH:... şeklinde uzun bir çıktı verecek.)
Bu uzun çıktıyı kopyalayıp Enter'a basın.
Son olarak çalışan durumları kaydedin:

```
pm2 save
```

🔗 Sisteme Erişim
Sistem hazır! Tarayıcınıza şu adresleri girerek sisteme erişebilirsiniz:

Sunucunun IP adresini öğrenmek için:

```
ip addr show eth0 | grep inet | awk '{ print $2; }' | sed 's/\/.*$//'
```

(Örneğin IP adresi 192.168.1.50 ise...)

Sistem Giriş URL: http://SUNUCU_IP_ADRESI:5173
PM2 Monitor (Canlı İzleme): pm2 monit
Artık terminali kapatsanız bile sistem arkaplanda çalışmaya devam edecektir.

⚠️ Güvenlik ve Uyarılar
Sunucu Güvenlik Duvarı (UFW): Eğer sistem dışarıdan ulaşılmıyorsa, portları açmak gerekebilir:

```
ufw allow 3000
ufw allow 5173
ufw allow 80
ufw allow 443
ufw enable
```

Kontroller:
Backend Loglarını görmek için: pm2 logs Doktor Backend
Frontend Loglarını görmek için: pm2 logs Doktor Frontend
Tüm sistemi durdurmak için: pm2 stop all
Sistemi yeniden başlatmak için: pm2 restart all

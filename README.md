# EnCoach 🚀

**EnCoach**, öğretmenlerin ve öğrencilerin etkileşimli bir şekilde İngilizce eğitim sürecini yönetebildiği, yapay zeka destekli (Google Gemini) modern bir mobil öğrenme platformudur. "Glassmorphism" UI konseptiyle tasarlanmış akıcı bir React Native arayüzüne ve güçlü bir Spring Boot (Java 21) arka planına sahiptir.

## 🌟 Proje Hakkında

EnCoach, klasik bir öğrenme yönetim sisteminin (LMS) ötesine geçerek öğrencilerin okuma metinleri üzerinde etkileşim kurmasını, anında çeviri yapabilmesini ve yapay zeka tabanlı "AI Öğretmen" ile birebir pratik yapmasını sağlar. 

### 👨‍🏫 Öğretmen Özellikleri
*   **Öğrenci Yönetimi:** Kendi öğrencilerini sisteme ekleyip takip edebilme.
*   **Okuma Metni (Passage) Oluşturma:** Öğrenciler için özel okuma parçaları hazırlama ve atama.
*   **Test/Sınav Hazırlama:** Okuduğunu anlama veya gramer odaklı çoktan seçmeli testler oluşturma ve atama.
*   **Performans Takibi:** Öğrencilerin çözdüğü testlerin sonuçlarını ve analizlerini görüntüleme.

### 🎓 Öğrenci Özellikleri
*   **İnteraktif Okuma:** Atanan okuma parçalarını okurken bilmediği kelimelerin üzerine dokunarak anında çevirisine ve örnek cümlelerine (DeepL & Dictionary API) ulaşma.
*   **Kelime Kütüphanesi (Vocabulary):** Öğrendiği kelimeleri kaydederek kendi sözlüğünü oluşturma ve sonradan kelime tekrarı yapabilme.
*   **Test Çözme:** Atanan testleri çözme ve anında sonuçları görme.
*   **AI Chat (Yapay Zeka Öğretmen):** Gemini altyapısı ile çalışan sanal öğretmene İngilizce gramer soruları sorma, sohbet ederek pratik yapma.
*   **AI Metin Analizi:** Okuma parçalarında anlamadığı cümleleri seçip yapay zekadan gramer ve yapı analizi isteme.
*   **AI Yanlış Cevap Açıklayıcı:** Testlerde yanlış yaptığı soruların "Neden yanlış?" ve "Doğrusu ne olmalı?" mantığını yapay zekaya sorarak öğrenme.
*   **AI Quiz (Sınav) Üretici:** İstediği herhangi bir konuda yapay zekaya otomatik quiz hazırlatıp pratik yapma.

---

## 📸 Ekran Görüntüleri
<div align="center">

<img width="362" height="812" alt="Ekran görüntüsü 2026-05-17 144736" src="https://github.com/user-attachments/assets/5b97771b-71e3-4627-b576-f036c929b3e8" />
<img width="363" height="815" alt="Ekran görüntüsü 2026-05-17 144825" src="https://github.com/user-attachments/assets/7b3fe9e6-388c-4453-8997-3c9eb1530e19" />
<img width="363" height="808" alt="Ekran görüntüsü 2026-05-17 144758" src="https://github.com/user-attachments/assets/f045cafd-4c84-4df6-850c-b8ee3bac4f3b" />
<img width="365" height="813" alt="Ekran görüntüsü 2026-05-17 145014" src="https://github.com/user-attachments/assets/829f4701-1fd0-4056-90e2-e93268d59d6b" />
<img width="367" height="817" alt="Ekran görüntüsü 2026-05-17 145031" src="https://github.com/user-attachments/assets/5fb78da2-7cb3-4fc6-beaa-b85d51612053" />

  
 </div>

---

## 🛠️ Teknoloji Stoku (Tech Stack)

### Backend (Sunucu)
*   **Dil:** Java 21
*   **Framework:** Spring Boot 3.x
*   **Veritabanı:** PostgreSQL
*   **Güvenlik:** Spring Security & JWT (JSON Web Token)
*   **ORM:** Hibernate / Spring Data JPA
*   **Harici API'ler:** Google Gemini SDK, DeepL API, Free Dictionary API

### Frontend (Mobil)
*   **Framework:** React Native (Expo)
*   **Dil:** TypeScript
*   **Navigasyon:** React Navigation (Stack & Bottom Tabs)
*   **Durum Yönetimi:** Context API
*   **Ağ İstekleri:** Axios
*   **Tasarım Dili:** Özel "Glassmorphism" UI, Modern animasyonlar ve Vector Icons

---

## 🚀 Kurulum (Local Development)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler
*   [Java 21](https://www.oracle.com/java/technologies/downloads/)
*   [Node.js](https://nodejs.org/) (v18 veya üzeri önerilir)
*   [PostgreSQL](https://www.postgresql.org/)
*   Expo CLI (`npm install -g expo-cli`)

### 1. Veritabanı Hazırlığı
PostgreSQL üzerinde `encoachdb` adında boş bir veritabanı oluşturun.
```sql
CREATE DATABASE encoachdb;
```

### 2. Çevre Değişkenleri (.env) Ayarları
Projenin root dizininde güvenlik amacıyla API anahtarları `.env` dosyalarından okunmaktadır.

**Backend için:**
`backend/` dizinine gidin ve `.env.example` dosyasının bir kopyasını oluşturup adını `.env` yapın. İçini kendi bilgilerinizle doldurun:
```env
DB_URL=jdbc:postgresql://localhost:5432/encoachdb
DB_USERNAME=postgres
DB_PASSWORD=sizin_veritabani_sifreniz
JWT_SECRET=super_gizli_rastgele_jwt_anahtariniz_256_bit_olmali
GEMINI_API_KEY=google_gemini_api_anahtariniz
DEEPL_API_KEY=deepl_api_anahtariniz
```

**Mobil için:**
`mobile/enmobile/` dizinine gidin ve `.env.example` dosyasının bir kopyasını oluşturup adını `.env` yapın. Eğer fiziksel cihazda test ediyorsanız bilgisayarınızın yerel IP adresini (Örn: 192.168.1.x) kullanın. Emülatör kullanıyorsanız genellikle boş bırakabilir veya localhost ayarlayabilirsiniz.
```env
EXPO_PUBLIC_API_URL=http://192.168.1.x:8080/api
```

### 3. Backend'i Çalıştırma
```bash
cd backend
./mvnw spring-boot:run
```
*(Sunucu varsayılan olarak `http://localhost:8080` portunda ayağa kalkacaktır.)*

### 4. Mobil Uygulamayı Çalıştırma
```bash
cd mobile/enmobile
npm install
npm run start
```
Açılan menüden `a` tuşuna basarak Android emülatöründe, `i` tuşuna basarak iOS simülatöründe (sadece Mac) veya telefonunuza **Expo Go** uygulamasını indirip QR kodu okutarak test edebilirsiniz.

---

## 🔒 Güvenlik Notu
Bu proje güvenlik odaklı olarak tasarlanmıştır. Veritabanı bilgileri, şifreleme anahtarları ve dış API token'ları hiçbir şekilde kaynak kod içerisinde barındırılmaz (`.env` dosyaları ile yönetilir ve `.gitignore` listesindedir). Lütfen kendi `.env` dosyanızı GitHub vb. açık kaynaklı ortamlara **pushlamadığınızdan** emin olun.

## 📄 Lisans
Bu proje [MIT Lisansı](https://opensource.org/licenses/MIT) altında lisanslanmıştır.

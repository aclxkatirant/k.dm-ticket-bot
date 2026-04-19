# 📂 Katirant DM Ticket Bot

![Discord.js](https://img.shields.io/badge/Discord.js-v14-red?style=for-the-badge&logo=discord)
![Node.js](https://img.shields.io/badge/Node.js-v18+-black?style=for-the-badge&logo=nodedotjs)
![License](https://img.shields.io/badge/License-MIT-red?style=for-the-badge)

Gelişmiş topluluklar ve profesyonel sunucular için özel olarak tasarlanmış, **Discord.js v14** tabanlı modern bir DM (Özel Mesaj) destek altyapısı.

## 🚀 Öne Çıkan Özellikler

- **Çift Yönlü Webhook İletişimi:** Kullanıcı ile yetkili arasındaki sohbet, sunucu içerisinde özel oluşturulan Webhook'lar aracılığıyla kullanıcının profil fotoğrafı ve ismiyle yansıtılır.
- **Asenkron Performans & Bellek Yönetimi:** Geçici bellek yönetimi yapılarak minimum RAM tüketimi sağlanır.
- **Kalıcı Kurulum:** Bot yeniden başlasa dahi verileri kurulum verileri güvenle saklanır.
- **Gelişmiş Transcript Sistemi:** Bilet kapatıldığında, tüm görüşme geçmişi medya dosyalarıyla birlikte `.html` formatında derlenip log kanalına aktarılır.
- **DM Temizleme Protokolü:** Kullanıcılar, bilet kapatıldıktan sonra botun DM kutusundaki kendi mesaj geçmişini tek bir tuşla temizleyebilir.

---

## 🛠️ Gereksinimler

- Node.js **v18.0.0** veya üzeri.
- Discord Bot Token'ı (Intentlerin tümü açık olmalıdır: `Guilds`, `GuildMessages`, `DirectMessages`, `MessageContent`).
- Yönetici (`Administrator`) yetkisine sahip bir bot davet bağlantısı.

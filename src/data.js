export function isForbiddenFastingDay(hijriParts) {
  // Idul Fitri (1 Syawal)
  if (hijriParts.month === 10 && hijriParts.day === 1) return true;
  // Idul Adha (10 Dzulhijjah)
  if (hijriParts.month === 12 && hijriParts.day === 10) return true;
  // Hari Tasyrik (11, 12, 13 Dzulhijjah)
  if (hijriParts.month === 12 && (hijriParts.day >= 11 && hijriParts.day <= 13)) return true;
  return false;
}

export const FASTS = [
  {
    id: 'ramadhan',
    name: 'Puasa Ramadhan',
    type: 'Wajib',
    description: 'Puasa wajib sebulan penuh di bulan Ramadhan.',
    hadith: '"Islam dibangun di atas lima perkara: bersaksi bahwa tiada tuhan selain Allah dan Muhammad utusan Allah, mendirikan shalat, menunaikan zakat, haji, dan puasa Ramadhan." (HR. Bukhari dan Muslim)',
    check: (gregorianDate, hijriParts) => hijriParts.month === 9
  },
  {
    id: 'senin-kamis',
    name: 'Puasa Sunnah Senin Kamis',
    type: 'Sunnah',
    description: 'Puasa sunnah yang sangat dianjurkan untuk dilakukan pada hari Senin dan Kamis.',
    hadith: '"Amal-amal (manusia) dilaporkan (kepada Allah) pada hari Senin dan Kamis, maka aku suka amalku dilaporkan saat aku sedang berpuasa." (HR. Tirmidzi)',
    check: (gregorianDate, hijriParts) => {
      const dayOfWeek = gregorianDate.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu
      if (hijriParts.month === 9) return false; // Ramadhan is wajib
      if (isForbiddenFastingDay(hijriParts)) return false;
      return dayOfWeek === 1 || dayOfWeek === 4;
    }
  },
  {
    id: 'ayyamul-bidh',
    name: 'Puasa Ayyamul Bidh',
    type: 'Sunnah',
    description: 'Puasa pertengahan bulan Hijriah pada tanggal 13, 14, dan 15.',
    hadith: '"Kekasihku (Rasulullah SAW) mewasiatkan kepadaku tiga hal: puasa tiga hari setiap bulan (Ayyamul Bidh), shalat Dhuha dua rakaat, dan shalat Witir sebelum tidur." (HR. Bukhari dan Muslim)',
    check: (gregorianDate, hijriParts) => {
      if (hijriParts.month === 9) return false;
      if (isForbiddenFastingDay(hijriParts)) return false;
      return [13, 14, 15].includes(hijriParts.day);
    }
  },
  {
    id: 'asyura',
    name: 'Puasa Asyura',
    type: 'Sunnah',
    description: 'Puasa pada tanggal 10 Muharram.',
    hadith: '"Puasa pada hari Asyura, aku berharap kepada Allah agar menghapuskan dosa tahun sebelumnya." (HR. Muslim)',
    check: (gregorianDate, hijriParts) => hijriParts.month === 1 && hijriParts.day === 10
  },
  {
    id: 'tasua',
    name: 'Puasa Tasu\'a',
    type: 'Sunnah',
    description: 'Puasa pada tanggal 9 Muharram (sehari sebelum Asyura).',
    hadith: '"Jika aku masih hidup pada tahun depan, sungguh aku akan berpuasa pada hari kesembilan." (HR. Muslim)',
    check: (gregorianDate, hijriParts) => hijriParts.month === 1 && hijriParts.day === 9
  },
  {
    id: 'arafah',
    name: 'Puasa Arafah',
    type: 'Sunnah',
    description: 'Puasa pada tanggal 9 Dzulhijjah bagi yang tidak melaksanakan wukuf di Arafah.',
    hadith: '"Puasa pada hari Arafah menghapuskan dosa tahun lalu dan tahun yang akan datang." (HR. Muslim)',
    check: (gregorianDate, hijriParts) => hijriParts.month === 12 && hijriParts.day === 9
  },
  {
    id: 'tarwiyah',
    name: 'Puasa Tarwiyah',
    type: 'Sunnah',
    description: 'Puasa sunnah di awal bulan Dzulhijjah, khususnya tanggal 8 Dzulhijjah.',
    hadith: '"Tidak ada hari-hari di mana amal shalih di dalamnya lebih dicintai oleh Allah daripada hari-hari ini (yakni sepuluh hari pertama bulan Dzulhijjah)." (HR. Bukhari)',
    check: (gregorianDate, hijriParts) => hijriParts.month === 12 && hijriParts.day === 8
  },
  {
    id: 'syawal',
    name: 'Puasa Syawal',
    type: 'Sunnah',
    description: 'Puasa 6 hari di bulan Syawal. Dianjurkan setelah Idul Fitri.',
    hadith: '"Barangsiapa berpuasa Ramadhan kemudian mengiringinya dengan puasa enam hari di bulan Syawal, maka dia seperti berpuasa sepanjang tahun." (HR. Muslim)',
    check: (gregorianDate, hijriParts) => {
      // Bebas hari apa saja yang penting 6 hari di bulan Syawal, 
      // Tapi kita tandai saja seluruh bulan Syawal setelah Idul Fitri (tanggal 2-30) sebagai peluang puasa Syawal.
      return hijriParts.month === 10 && hijriParts.day >= 2 && hijriParts.day <= 30;
    }
  }
];

export const IBADAH = [
  {
    id: 'dhuha',
    name: 'Shalat Dhuha',
    description: 'Shalat sunnah di waktu Dhuha (pagi hari setelah matahari terbit hingga menjelang siang).',
    hadith: '"Pada pagi hari, setiap persendian dari kalian harus disedekahi... Dan dua rakaat shalat Dhuha telah mencukupi itu semua." (HR. Muslim)',
    check: () => true // Setiap hari
  },
  {
    id: 'tahajjud',
    name: 'Qiyamul Lail / Tahajjud',
    description: 'Shalat sunnah di sepertiga malam terakhir.',
    hadith: '"Sebaik-baik puasa setelah Ramadhan adalah puasa di bulan Allah, Muharram. Dan sebaik-baik shalat setelah shalat fardhu adalah shalat malam." (HR. Muslim)',
    check: () => true // Setiap hari
  },
  {
    id: 'witir',
    name: 'Shalat Witir',
    description: 'Shalat sunnah penutup malam dengan jumlah rakaat ganjil.',
    hadith: '"Sesungguhnya Allah itu ganjil dan menyukai yang ganjil, maka shalat witirlah wahai ahli Al-Qur\'an." (HR. Abu Dawud)',
    check: () => true // Setiap hari
  },
  {
    id: 'jumat',
    name: 'Amalan Hari Jumat',
    description: 'Membaca surat Al-Kahfi, memperbanyak shalawat, dan shalat Jumat (bagi laki-laki).',
    hadith: '"Barangsiapa membaca surat Al-Kahfi pada hari Jumat, akan diterangi dengan cahaya di antara dua Jumat." (HR. An-Nasa\'i)',
    check: (gregorianDate) => gregorianDate.getDay() === 5
  }
];

export function getHijriDateParts(date) {
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  const parts = formatter.formatToParts(date);
  let day = 1, month = 1, year = 1445;
  parts.forEach(p => {
    if (p.type === 'day') day = parseInt(p.value, 10);
    if (p.type === 'month') month = parseInt(p.value, 10);
    if (p.type === 'year') {
      const yearStr = p.value.split(' ')[0];
      year = parseInt(yearStr, 10);
    }
  });
  return { day, month, year };
}

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"
];

export function getHijriMonthName(monthIndex) {
  return HIJRI_MONTHS[monthIndex - 1] || "";
}

export function formatHijriDate(date) {
  const { day, month, year } = getHijriDateParts(date);
  return `${day} ${getHijriMonthName(month)} ${year} H`;
}

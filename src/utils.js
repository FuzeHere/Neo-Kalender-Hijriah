export function getHijriDateParts(date, adjustment = 0) {
  const adjustedDate = new Date(date);
  if (adjustment !== 0) {
    adjustedDate.setDate(adjustedDate.getDate() + adjustment);
  }
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  const parts = formatter.formatToParts(adjustedDate);
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

export function formatHijriDate(date, adjustment = 0) {
  const { day, month, year } = getHijriDateParts(date, adjustment);
  return `${day} ${getHijriMonthName(month)} ${year} H`;
}

export function formatDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getCurrentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthName(monthStr) {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [year, month] = monthStr.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

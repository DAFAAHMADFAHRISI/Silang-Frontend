/** Parse MySQL/API datetime as local time (avoids UTC shift on "YYYY-MM-DD HH:mm:ss"). */
export function parseDateTime(value: string): Date {
  const trimmed = value.trim();
  const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  return new Date(normalized);
}

/**
 * Deadline label for task cards.
 * - If submitted: compare submission time vs deadline (fixed status after submit).
 * - If not submitted: compare now vs deadline (countdown / overdue).
 */
export function getDeadlineStatus(
  dueDate: string,
  submittedAt?: string | null
): string {
  if (!dueDate) return 'Tidak ada deadline';

  try {
    const due = parseDateTime(dueDate);
    if (isNaN(due.getTime())) return 'Format deadline tidak valid';

    const reference = submittedAt ? parseDateTime(submittedAt) : new Date();
    if (isNaN(reference.getTime())) return 'Format tanggal tidak valid';

    const diff = due.getTime() - reference.getTime();

    if (submittedAt) {
      return diff < 0 ? 'Terlambat' : 'Tepat Waktu';
    }

    if (diff < 0) return 'Terlambat';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `dalam ${days} hari`;
    if (hours > 0) return `dalam ${hours} jam`;
    return 'dalam beberapa menit';
  } catch {
    return 'Error menghitung deadline';
  }
}

export function isDeadlineLate(
  dueDate: string,
  submittedAt?: string | null
): boolean {
  return getDeadlineStatus(dueDate, submittedAt) === 'Terlambat';
}

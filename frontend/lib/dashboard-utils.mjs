export function filterTasks(tasks, { query = '', status = 'all' } = {}) {
  const normalized = query.trim().toLowerCase();
  return tasks.filter((task) => (
    (status === 'all' || task.status === status)
    && (!normalized || `${task.title} ${task.description || ''}`.toLowerCase().includes(normalized))
  ));
}

export function safeExternalUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function localDateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

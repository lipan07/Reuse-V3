/**
 * Laravel may serialize is_seen as boolean, 0/1 int, or string from JSON.
 */
export function isMessageSeen(value) {
  return value === true || value === 1 || value === '1';
}

export function sameMessageId(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

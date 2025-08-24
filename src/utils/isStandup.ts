export function isStandup(message: string | null | undefined): boolean {
  if (!message) return false;
  const trimmedStart = message.trimStart();
  return /^stand[-\s]?up\b/i.test(trimmedStart);
}

export default isStandup;

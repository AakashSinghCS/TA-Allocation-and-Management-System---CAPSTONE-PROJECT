export function fallbackTempId(): string {
  // Date gives millisecond resolution; random adds entropy for fast loops
  return (
    "tmp-" +
    Date.now().toString(36) +        // e.g. "lfr5c7n"
    "-" +
    Math.random().toString(36).slice(2, 8)  // e.g. "k3h91q"
  );
}
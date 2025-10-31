export default function ActionGate({ actions, code, children }) {
  if (!actions || !actions.length) return null;
  const ok = actions.some((a) => a.actionCode === code);
  return ok ? children : null;
}

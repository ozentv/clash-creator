// Petits messages de confirmation en bas de l'écran. toast('Lien copié') depuis n'importe où ;
// le composant <Toaster /> les affiche.
let nextId = 1;
let toasts = [];
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener(toasts));

export function toast(message, { error = false, duration = 2600 } = {}) {
  const id = nextId++;
  toasts = [...toasts, { id, message, error }].slice(-3);
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function copyText(text, message = 'Lien copié') {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    toast('Copie impossible dans ce navigateur', { error: true });
  }
}

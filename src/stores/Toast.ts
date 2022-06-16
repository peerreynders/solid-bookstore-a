import { createSignal } from 'solid-js';

import type { Accessor } from 'solid-js';

type ToastState = {
  fadeMs: number;
  show: boolean;
  messages: string[];
};

type Toast = [Accessor<ToastState>, (text: string) => void];

function createToast(persistMs: number, fadeMs: number): Toast {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let show = false;
  const messages: string[] = [];
  const [toast, setToast] = createSignal<ToastState>(makeState());

  return [toast, display];

  // ---

  function makeState() {
    return { fadeMs, show, messages };
  }

  function reset(): void {
    show = false;
    messages.length = 0;
    timeoutId = undefined;
    setToast(makeState());
  }

  function display(text: string): void {
    messages.push(text);
    show = true;
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(fadeOut, persistMs);
    setToast(makeState());
  }

  function fadeOut() {
    show = false;
    timeoutId = setTimeout(reset, fadeMs);
    setToast(makeState());
  }
}

export { createToast };

export type { Toast, ToastState };

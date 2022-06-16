import { Index } from 'solid-js/web';
import { useShop } from '../providers/Shop';

import type { JSX } from 'solid-js';

function Toast(): JSX.Element {
  const { toast } = useShop();

  return (
    <div
      class="c-toast"
      classList={{
        'c-toast__fadein': toast().show,
        'c-toast__fadeout': !toast().show && toast().messages.length > 0,
      }}
      style={{ '--c-toast-fade-duration': `${toast().fadeMs}ms` }}
    >
      <Index each={toast().messages}>
        {(message, _i) => <p>{message()}</p>}
      </Index>
    </div>
  );
}

export { Toast };

import { Show } from 'solid-js';
import { formatCurrency } from '../../lib/helpers';
import { useShop } from '../../providers/Shop';

import type { JSX } from 'solid-js';

function Book(): JSX.Element {
  const {
    currentBook,
    cart: [, facadeCart],
  } = useShop();

  // TypeScript doesn't understand `Show`
  // so the non-null assertions become necessary
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  return (
    <Show when={currentBook()} fallback={<div>Loading…</div>}>
      <section class="c-book-detail">
        <h2>{currentBook()!.name}</h2>
        <p>
          <i>By: {currentBook()!.author}</i>
        </p>
        <p>Price: {formatCurrency(currentBook()!.price)}</p>
        <button onClick={(_e) => facadeCart.addItem(currentBook()!.id)}>
          Add to cart
        </button>
      </section>
    </Show>
  );
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
}

export { Book as default };

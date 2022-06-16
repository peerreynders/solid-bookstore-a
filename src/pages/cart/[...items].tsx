import { For, Show } from 'solid-js/web';
import { Link } from 'solid-app-router';

import { itemIsValid, itemPrice, useShop } from '../../providers/Shop';
import { formatCurrency } from '../../lib/helpers';

import type { JSX } from 'solid-js';
import type { BookId, CartStore } from '../../providers/Shop';

function Cart(): JSX.Element {
  const [storeCart, facadeCart] = useShop().cart;
  const checkout = (_e: unknown) => facadeCart.checkout();

  return (
    <section class="c-cart">
      <h2>Your cart</h2>
      <section class="c-car__items">
        <For each={storeCart}>
          {(item, _i) => (
            <div class="c-cart-item">
              <p>
                <Link href={`/book/${item.book.id}`}>{item.book.name}</Link>
              </p>
              <Show when={!itemIsValid(item)}>
                <p>
                  <b>Not available anymore</b>
                </p>
              </Show>
              <div class="c-cart-item__detail">
                <p>
                  Amount:
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={makeListener(facadeCart, item.book.id)}
                  />
                  total: <b>{formatCurrency(itemPrice(item))}</b>
                </p>
              </div>
            </div>
          )}
        </For>
      </section>
      <p>Subtotal: {formatCurrency(facadeCart.subTotal())}</p>
      <Show when={facadeCart.discount() > 0}>
        <p>
          <i>Large order discount: {formatCurrency(facadeCart.discount())}</i>
        </p>
      </Show>
      <p>
        <b>Total: {formatCurrency(facadeCart.total())}</b>
      </p>
      <button disabled={!facadeCart.canCheckout()} onClick={checkout}>
        Submit order
      </button>
    </section>
  );
}

function makeListener(facade: CartStore[1], id: BookId) {
  return (event: Event) => {
    const input = event.target as HTMLInputElement;
    facade.updateItem(id, input.value);
  };
}

export { Cart as default };

import { For, Show } from 'solid-js/web';
import { Link } from 'solid-app-router';

import { useShop } from '../providers/Shop';

import type { JSX } from 'solid-js';

function Books(): JSX.Element {
  const shop = useShop();
  const [books, facade] = shop.books;

  return (
    <section class="c-books">
      <h1>Available books</h1>
      <Show when={!shop.loading()} fallback={<div>Loading...</div>}>
        <ol>
          <For each={facade.sorted()}>
            {(id, _i) => (
              <li>
                <Link href={`/book/${id}`}>{books[id].name}</Link>
              </li>
            )}
          </For>
        </ol>
      </Show>
    </section>
  );
}

export { Books as default };

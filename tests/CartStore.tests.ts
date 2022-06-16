import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { createEffect, on } from 'solid-js';

import { createShop } from '../src/stores/Shop';
import {
  booksSizes,
  constantFetcher,
  cycleFetcher,
  lastMessage,
  nullStorage,
  rootAndRun,
  TOAST_SILENCE,
} from './helpers';

import type { ToastState } from '../src/stores/Shop';

const ShopCart = suite('CartStore tests');

const ID = '999-9999999999';
const data = [
  {
    id: ID,
    cat: ['book'],
    name: 'The Placeholder',
    author: 'Who cares?',
    sequence: 1,
    genre: 'dry',
    in_stock: true,
    price: 3.0,
    pages: 999,
  },
];

ShopCart('CartStore can add new entries', async () => {
  // tests terminate faster with
  // `notify = false`
  const notify = false;
  const message1 = notify ? 'Added (1) of "The Placeholder"' : TOAST_SILENCE;
  const message2 = notify
    ? 'Updated "The Placeholder" quantity to 2'
    : TOAST_SILENCE;

  const result = await rootAndRun<number>(1000, function factory(done) {
    const shop = createShop(constantFetcher(data), nullStorage);
    const [_cart, facade] = shop.cart;
    const toast = shop.toast;

    // save the last toast
    let lastToast: ToastState | undefined;
    if (notify) {
      createEffect(
        on(toast, () => {
          lastToast = toast();
        })
      );
    }

    // kick things off
    createEffect(
      on(shop.loading, () => {
        if (shop.loading()) return;

        // let things settle first
        queueMicrotask(task);
      })
    );

    const task = () => {
      // These cause toasts unless `notify = false`
      facade.addItem(ID, undefined, notify);
      assert.is(lastMessage(lastToast), message1);

      facade.addItem(ID, undefined, notify);
      assert.is(lastMessage(lastToast), message2);

      assert.is(facade.subTotal(), 6);
      assert.is(facade.total(), 6);

      // Doesn't cause a toast
      // (as effect is visible
      // on the same page)
      facade.updateItem(ID, '100');

      assert.is(facade.subTotal(), 300);
      assert.is(facade.total(), 270);

      done(0);
    };

    return undefined;
  });

  assert.equal(result, 0);
});

ShopCart('CartStore can clear entries', async () => {
  const result = await rootAndRun<number>(1000, function factory(done) {
    const shop = createShop(constantFetcher(data), nullStorage);
    const [_cart, facade] = shop.cart;

    createEffect(
      on(shop.loading, () => {
        if (shop.loading()) return;

        queueMicrotask(task);
      })
    );

    const task = () => {
      facade.addItem(ID, 1, false);

      assert.is(facade.total(), 3);
      assert.is(facade.canCheckout(), true);

      facade.updateItem(ID, '0');

      assert.is(facade.total(), 0);
      assert.is(facade.canCheckout(), false);

      done(0);
    };

    return undefined;
  });

  assert.equal(result, 0);
});

ShopCart('CartStore will invalidate entries', async () => {
  // (1A) Setup (non-reactive)
  const fetcher = cycleFetcher([data, []]);

  const result = await rootAndRun<number>(1000, function factory(done) {
    // (1B) Setup (reactive)
    const shop = createShop(fetcher, nullStorage);
    const [_cart, facade] = shop.cart;
    const [books, booksFacade] = shop.books;

    const tasks = [task1, task2];
    let loadCount = 0;

    // Effect to launch any
    // sequenced exercise tasks
    createEffect(
      on(shop.loading, () => {
        if (shop.loading()) return;

        if (loadCount >= tasks.length)
          done(undefined, new Error('Unexpected Books Load'));
        const task = tasks[loadCount];
        loadCount += 1;

        // launch sequenced exercise task
        queueMicrotask(task);
      })
    );
    // END setup (reactive)

    // Return optional immediate exercise task
    return undefined;

    // --- (2) Exercise (reactive) and (3A) Verify (reactive)
    function task1() {
      facade.addItem(ID, 1, false);

      assert.is(facade.total(), 3);
      assert.is(facade.canCheckout(), true);
      assert.equal(booksSizes(books), [1, 1]);

      booksFacade.refetch();
    }

    function task2() {
      assert.is(facade.total(), 3);
      assert.not.ok(books[ID].isAvailable);
      assert.is(facade.canCheckout(), false);
      assert.equal(booksSizes(books), [1, 0]);

      // (4A) Teardown (reactive)
      done(0);
    }
  });

  // (3B) Verify (non-reactive)
  assert.equal(result, 0);

  // (4B) Teardown (non-reactive)
});

ShopCart.run();

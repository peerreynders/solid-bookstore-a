import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { createEffect, on } from 'solid-js';

import { createShop, MODE, ToastState } from '../src/stores/Shop';

import {
  booksSizes,
  lastMessage,
  makeFileFetcher,
  nullStorage,
  rootAndRun,
  TOAST_SILENCE,
} from './helpers';

import type { ToastState } from '../src/stores/Shop';

// Relative from project root
// where `npm run test` is run
//
const BOOKS_SOURCE = './public/books.json';

const Shop = suite('Shop tests');

Shop('User buying books', async () => {
  const ID = '978-1423103349';
  const BOOK_PATHNAME = '/book/978-1423103349';
  const CART_PATHNAME = '/cart';
  const fetcher = makeFileFetcher(BOOKS_SOURCE);

  // `notify = false` completes faster
  const notify = false;
  const addMessage = notify
    ? 'Added (1) of "The Sea of Monsters"'
    : TOAST_SILENCE;
  const checkoutMessage = notify ? 'Bought books for € 6,49!' : TOAST_SILENCE;

  const result = await rootAndRun<number>(1000, function factory(done) {
    const shop = createShop(fetcher, nullStorage);
    const {
      loading,
      toast,
      currentBook,
      books: [books, _booksFacade],
      mode: [mode, modeFacade],
      cart: [cart, cartFacade],
    } = shop;

    // save the last toast
    let lastToast: ToastState | undefined;
    if (notify) {
      createEffect(
        on(toast, () => {
          lastToast = toast();
        })
      );
    }

    createEffect(
      on(loading, () => {
        if (loading()) return;

        // Commence once books are loaded
        queueMicrotask(task);
      })
    );

    // no immediate task
    return undefined;

    // ---
    function task() {
      assert.equal(booksSizes(books), [4, 4]);

      // Books details page
      modeFacade.setMode([
        MODE.bookDetail,
        {
          id: ID,
        },
        BOOK_PATHNAME,
      ]);
      assert.is(mode.pathname, BOOK_PATHNAME);
      const current = currentBook();
      if (current == undefined) throw new Error('Unset currentBook()');

      assert.is(current.name, 'The Sea of Monsters');
      assert.equal(lastMessage(lastToast), TOAST_SILENCE);

      cartFacade.addItem(current.id, undefined, notify);
      assert.equal(lastMessage(lastToast), addMessage);

      // Cart page
      modeFacade.setMode([MODE.cart, {}, CART_PATHNAME]);
      assert.is(mode.pathname, CART_PATHNAME);
      assert.is(cartFacade.canCheckout(), true);

      cartFacade.checkout(notify);
      assert.equal(lastMessage(lastToast), checkoutMessage);
      assert.is(cart.length, 0);
      assert.is(cartFacade.canCheckout(), false);

      // And we're done
      done(0);
    }
  });

  assert.is(result, 0);
});

Shop.run();

import { createMemo } from 'solid-js';
import { createToast } from './Toast';
import { MODE, createModeStore } from './ModeStore';
import { createBookStore } from './BookStore';
import { createCartStore, itemIsValid, itemPrice } from './CartStore';

import type { Accessor } from 'solid-js';
import type { ToastState } from './Toast';
import type { Mode, ModeArgs, ModeStore } from './ModeStore';
import type { Book, BookId, BookRaw, BookStore, Fetcher } from './BookStore';
import type { CartStore, CartStorage } from './CartStore';

type Shop = {
  loading: Accessor<boolean>;
  toast: Accessor<ToastState>;
  currentBook: Accessor<Book | undefined>;
  mode: ModeStore;
  books: BookStore;
  cart: CartStore;
};

function createShop(fetcher: Fetcher, storage?: CartStorage): Shop {
  const [toast, send] = createToast(2500, 500);

  const mode = createModeStore();
  const [storeMode] = mode;

  const books = createBookStore(fetcher);
  const [storeBooks] = books;

  const currentBook = createMemo(() => {
    const id = storeMode.id;
    return id ? storeBooks[id] : undefined;
  });

  const cart = createCartStore(books[1].loading, storeBooks, storage, send);
  const loading = cart[1].loading;

  return {
    loading,
    toast,
    currentBook,
    mode,
    books,
    cart,
  };
}

export { MODE, createShop, itemIsValid, itemPrice };

export type {
  BookId,
  BookRaw,
  BookStore,
  CartStore,
  CartStorage,
  Fetcher,
  Mode,
  ModeArgs,
  Shop,
  ToastState,
};

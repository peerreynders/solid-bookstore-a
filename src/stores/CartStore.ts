import { createEffect, createMemo, createSignal, on } from 'solid-js';
import { createStore, unwrap } from 'solid-js/store';
import { formatCurrency } from '../lib/helpers';

import type { Accessor } from 'solid-js';
import type { Store } from 'solid-js/store';
import type { Book, BookId, BookState } from './BookStore';

// At this point stores only support
// nested reactivity an arrays
// and plain objects

type Item = {
  book: Book;
  quantity: number;
};

function makeItem(book: Book, quantity: number) {
  return {
    book,
    quantity,
  };
}

function itemPrice(item: Item) {
  return item.quantity * item.book.price;
}

function itemIsValid(item: Item) {
  return item.book.isAvailable;
}

function itemToJson(item: Item) {
  return {
    id: item.book.id,
    quantity: item.quantity,
  };
}

type ItemJson = ReturnType<typeof itemToJson>;

type CartState = Item[];

type SendNotice = (text: string) => void;
type AddItem = (id: BookId, quantity?: number, notify?: boolean) => void;
type UpdateItem = (id: BookId, quantity: string) => void;

type CartStore = [
  Store<Item[]>,
  {
    loading: Accessor<boolean>;
    subTotal: Accessor<number>;
    discount: Accessor<number>;
    total: Accessor<number>;
    canCheckout: Accessor<boolean>;
    addItem: AddItem;
    updateItem: UpdateItem;
    checkout(notify?: boolean): void;
  }
];

type CartStorage = {
  load: () => Promise<string | undefined | null>;
  save: (json: string) => Promise<void>;
};

function createCartStore(
  booksLoading: Accessor<boolean>,
  books: Store<BookState>,
  storage?: CartStorage,
  send?: SendNotice
): CartStore {
  const [items, setItems] = createStore<CartState>([]);
  const subTotal = createMemo(() => items.reduce(addItemPrice, 0));
  const discount = createMemo(() => (subTotal() >= 100 ? subTotal() * 0.1 : 0));
  const total = createMemo(() => subTotal() - discount());
  const canCheckout = createMemo(
    () => items.length > 0 && items.every(isValidForCheckout)
  );

  // Cart Storage Management
  let initialized = false;
  let lastBooksLoading = true;
  const [loading, setLoading] = createSignal(true);

  createEffect(
    on(booksLoading, () => {
      if (booksLoading()) {
        // transition to loadING
        if (!lastBooksLoading) setLoading(true);
        lastBooksLoading = true;
        return;
      }

      // No transition - nothing to do
      if (!lastBooksLoading) return;

      // Transition to loadED
      lastBooksLoading = false;
      if (initialized || !storage) {
        // Nothing to load
        setLoading(false);
        initialized = true;
        return;
      }

      // Load from storage after first books load
      storage.load().then(loadCart);
    })
  );

  // Keep saving cart if storage present
  if (storage) {
    const json = createMemo(() => items.reduce(pushValidItemJson, []));
    createEffect(
      on(json, () => {
        if (loading()) return;

        storage.save(JSON.stringify(json()));
      })
    );
  }

  return [
    items,
    {
      loading,
      subTotal,
      total,
      discount,
      canCheckout,
      addItem,
      updateItem,
      checkout: (notify = true) => {
        const totalAmount = total();
        setItems([]);
        if (notify && send)
          send(`Bought books for ${formatCurrency(totalAmount)}!`);
      },
    },
  ];

  // ---
  function addItem(id: BookId, quantity = 1, notify = true): void {
    const data = unwrap(items);
    const index = data.findIndex((item) => item.book.id === id);

    if (index > -1) {
      // Add specified quantity to existing item
      const item = data[index];
      const newQuantity = item.quantity + quantity;
      setItems(index, 'quantity', newQuantity);
      if (notify && send)
        send(`Updated "${item.book.name}" quantity to ${newQuantity}`);
      return;
    }

    const book = books[id];
    if (!book) return;

    // Create a new item
    const newItem = makeItem(book, quantity);
    setItems(items.concat(newItem));
    if (notify && send) send(`Added (${quantity}) of "${book.name}"`);
  }

  function updateItem(id: BookId, value: string) {
    const quantity = Number.parseInt(value, 10);
    if (Number.isNaN(quantity)) return;

    const data = unwrap(items);
    const index = data.findIndex((item) => item.book.id === id);
    if (index < 0) return;

    if (quantity > 0) {
      // Replace quantity
      setItems(index, 'quantity', quantity);
      return;
    }

    // Remove item
    setItems(data.filter((item) => item.book.id !== id));
  }

  function loadCart(json: string | undefined | null): void {
    const rawItems: ItemJson[] = JSON.parse(json ?? '[]');
    const items = rawItems.reduce(
      (array: CartState, { id, quantity }: ItemJson) => {
        const book = books[id];
        if (book) array.push(makeItem(book, quantity));
        return array;
      },
      []
    );

    setItems(items);
    initialized = true;
    setLoading(false);
  }
}

function addItemPrice(sum: number, item: Item): number {
  return sum + itemPrice(item);
}

function isValidForCheckout(item: Item): boolean {
  return item.quantity > 0 && itemIsValid(item);
}

function pushValidItemJson(array: ItemJson[], item: Item): ItemJson[] {
  if (itemIsValid(item)) array.push(itemToJson(item));
  return array;
}

export { createCartStore, itemPrice, itemIsValid };
export type { CartStore, CartStorage, Item };

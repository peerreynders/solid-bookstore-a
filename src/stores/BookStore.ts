import { createEffect, createSignal, createResource, on } from 'solid-js';

import { createStore, unwrap } from 'solid-js/store';

import type { Accessor, ResourceFetcher } from 'solid-js';
import type { Store } from 'solid-js/store';

type BookId = string;

type BookRaw = {
  id: BookId;
  cat: string[];
  name: string;
  author: string;
  series?: string;
  sequence: number;
  genre: string;
  in_stock: boolean;
  price: number;
  pages: number;
};

type Book = {
  id: BookId;
  name: string;
  author: string;
  price: number;
  isAvailable: boolean;
};

type BookState = {
  [id: BookId]: Book;
};

type BookStore = [
  Store<BookState>,
  {
    loading: Accessor<boolean>;
    sorted: Accessor<BookId[]>;
    refetch: () => void;
  }
];

type Fetcher = ResourceFetcher<true, BookRaw[]>;

function createBookStore(fetcher: Fetcher): BookStore {
  const [loading, setLoading] = createSignal(true);
  const [payload, ctrl] = createResource(fetcher, { initialValue: [] });
  const [books, setBooks] = createStore<BookState>({});
  const [sorted, setSorted] = createSignal<BookId[]>([]);

  createEffect(on(payload, loadBooks));

  return [
    books,
    {
      loading,
      sorted,
      refetch: () => {
        setLoading(true);
        ctrl.refetch();
      },
    },
  ];

  function loadBooks() {
    if (payload.loading) {
      setLoading(true);
      return;
    }

    for (const id in books) setBooks(id, 'isAvailable', false);

    setBooks(payload().reduce(appendBook, {}));
    setSorted(sortedIds(books));
    setLoading(false);
  }
}

function appendBook(
  books: BookState,
  { id, name, author, price }: BookRaw
): BookState {
  const book = {
    id,
    name,
    author,
    price,
    isAvailable: true,
  };

  books[book.id] = book;
  return books;
}

function sortedIds(books: Store<BookState>): BookId[] {
  return Object.values(unwrap(books))
    .filter(keepAvailable)
    .sort(byNameAsc)
    .map(extractId);
}

function keepAvailable(book: Book): boolean {
  return book.isAvailable;
}

function byNameAsc(a: Book, b: Book): number {
  if (a.name > b.name) return 1;
  if (a.name === b.name) return 0;
  return -1;
}

function extractId({ id }: Book): BookId {
  return id;
}

export { createBookStore };

export type { Book, BookId, BookRaw, BookState, BookStore, Fetcher };

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { createEffect, on } from 'solid-js';
import { unwrap } from 'solid-js/store';

import { makeCachedFetcher, rootAndRun } from './helpers';

import { createBookStore } from '../src/stores/BookStore';

import type { Store } from 'solid-js/store';
import type { BookId, BookState } from '../src/stores/BookStore';

// Relative from project root
// where `npm run test` is run
//
const BOOKS_SOURCE = './public/books.json';
const fetcher = makeCachedFetcher(BOOKS_SOURCE);

const Books = suite('BookStore tests');

Books('Basic loading', async () => {
  const result = await rootAndRun<BookState>(1000, function factory(done) {
    const [books, facade] = createBookStore(fetcher);

    createEffect(
      on(facade.loading, () => {
        // loading() is one of the methods of the facade
        // to the Store<BookState>.
        // `loading` is simply a signal but other methods
        // could be using the SetStoreFunction<BookState>.

        if (facade.loading()) return;

        // Just verify what's in the Store<BookState>

        done(unwrap(books));
      })
    );

    return undefined;
  });

  assert.ok(Object.hasOwn(result, '978-0641723445'));
  assert.ok(Object.hasOwn(result, '978-1423103349'));
  assert.ok(Object.hasOwn(result, '978-1857995879'));
  assert.ok(Object.hasOwn(result, '978-1933988177'));
  assert.equal(result['978-1933988177'].price, 30.5);
});

Books('IDs sorted by names', async () => {
  const toEntries = (books: Store<BookState>, ids: BookId[]) => {
    return ids.reduce<[string, string][]>((array, id) => {
      const book = books[id];
      if (book) array.push([id, book.name]);
      return array;
    }, []);
  };

  const expected = [
    ['978-1933988177', 'Lucene in Action, Second Edition'],
    ['978-1857995879', "Sophie's World : The Greek Philosophers"],
    ['978-0641723445', 'The Lightning Thief'],
    ['978-1423103349', 'The Sea of Monsters'],
  ];

  const result = await rootAndRun<[string, string][]>(
    1000,
    function factory(done) {
      const [books, facade] = createBookStore(fetcher);

      createEffect(
        on(facade.loading, () => {
          if (facade.loading()) return;

          const sortedIds = facade.sorted();

          // Lets make it a bit more obvious that the IDs
          // are sorted by name
          const entries = toEntries(books, sortedIds);

          done(entries);
        })
      );

      return undefined;
    }
  );

  assert.equal(result, expected);
});

Books.run();

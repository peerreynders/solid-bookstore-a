import { readFile } from 'node:fs/promises';

import { createRoot } from 'solid-js';
import { unwrap } from 'solid-js/store';

import type { Store } from 'solid-js/store';
import { ToastState } from '../../src/stores/Toast';
import type { BookRaw, BookState } from '../../src/stores/BookStore';

type FnVoid = () => void;
type Maybe<T> = T | undefined;
type Resolve<T> = (value: T) => void;
type Reject = (reason: unknown) => void;
type Done<T> = (data: Maybe<T>, err?: unknown) => void;
type Factory<T> = (done: Done<T>) => Maybe<FnVoid>;

const TOAST_SILENCE = 'CRICKETS';

async function rootAndRun<T>(
  timeoutMs: number,
  factory: Factory<T>
): Promise<T> {
  let disposeFn: Maybe<FnVoid>;
  let timeoutId: Maybe<ReturnType<typeof setTimeout>>;
  try {
    return await new Promise(executor);
  } finally {
    if (disposeFn) {
      disposeFn();
      disposeFn = undefined;
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  }

  // ---
  function executor(resolve: Resolve<T>, reject: Reject) {
    createRoot((dispose) => {
      disposeFn = dispose;
      timeoutId = setTimeout(timeout, timeoutMs);
      // queueMicrotask/setTimeout allows `setup` to finish
      // before exercising the reactive graph with `run`
      const run = factory(done);
      if (typeof run === 'function') queueMicrotask(run);
    });

    // ---
    function timeout() {
      timeoutId = undefined;
      reject(new Error('Timed out'));
    }

    function done(data: Maybe<T>, reason: unknown) {
      // eslint-disable-next-line eqeqeq
      if (data != undefined) resolve(data);
      else reject(reason);
    }
  }
}

function constantFetcher(
  data: BookRaw[]
): (s: unknown, i: unknown) => Promise<BookRaw[]> {
  return (_source: unknown, _info: unknown) => {
    return Promise.resolve(data);
  };
}

function cycleFetcher(
  data: BookRaw[][]
): (s: unknown, i: unknown) => Promise<BookRaw[]> {
  const last = data.length - 1;
  let next = 0;
  const cycle = () => {
    next = next < last ? next + 1 : 0;
  };

  return (_source: unknown, _info: unknown) => {
    const payload = data[next];
    cycle();
    return Promise.resolve(payload);
  };
}

const jsonBooks = `[
{"id":"978-0641723445","cat":["book","hardcover"],"name":"The Lightning Thief",
"author":"Rick Riordan","series":"Percy Jackson and the Olympians","sequence":1,
"genre":"fantasy","in_stock":true,"price":12.5,"pages":384},
{"id":"978-1423103349","cat":["book","paperback"],"name":"The Sea of Monsters",
"author":"Rick Riordan","series":"Percy Jackson and the Olympians","sequence":2,
"genre":"fantasy","in_stock":true,"price":6.49,"pages":304},
{"id":"978-1857995879","cat":["book","paperback"],"name":"Sophie's World : The Greek Philosophers",
"author":"Jostein Gaarder","sequence":1,
"genre":"fantasy","in_stock":true,"price":3.07,"pages":64},
{"id":"978-1933988177","cat":["book","paperback"],"name":"Lucene in Action, Second Edition",
"author":"Michael McCandless","sequence":1,
"genre":"IT","in_stock":true,"price":30.5,"pages":475}
]`;

function fakeSimpleFetcher(
  _source: unknown,
  _info: unknown
): Promise<BookRaw[]> {
  return Promise.resolve(JSON.parse(jsonBooks));
}

function makeFileFetcher(fullpath: string) {
  return (_source: unknown, _info: unknown) => {
    return readFile(fullpath, { encoding: 'utf8' }).then((json) =>
      JSON.parse(json)
    );
  };
}

function makeCachedFetcher(fullpath: string) {
  let result: Promise<BookRaw[]> | undefined;
  const fileFetcher = makeFileFetcher(fullpath);

  return (source: unknown, info: unknown) => {
    if (result) return result;

    result = fileFetcher(source, info);
    return result;
  };
}

const nullStorage = {
  load() {
    return Promise.resolve('[]');
  },
  save(_json: string) {
    return Promise.resolve();
  },
};

Object.freeze(nullStorage);

function booksSizes(books: Store<BookState>): [number, number] {
  const data = unwrap(books);
  let size = 0;
  let available = 0;
  for (const id in data) {
    size += 1;
    if (data[id].isAvailable) available += 1;
  }
  return [size, available];
}

function lastMessage(state?: ToastState): string {
  if (state == undefined) return TOAST_SILENCE;

  if (state.messages.length === 0) return TOAST_SILENCE;

  return state.messages[state.messages.length - 1];
}

export {
  booksSizes,
  constantFetcher,
  cycleFetcher,
  fakeSimpleFetcher,
  lastMessage,
  makeCachedFetcher,
  makeFileFetcher,
  nullStorage,
  rootAndRun,
  TOAST_SILENCE,
};

export type { Done, Factory };

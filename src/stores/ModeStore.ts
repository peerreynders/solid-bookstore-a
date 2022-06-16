import { createStore } from 'solid-js/store';

import type { Store } from 'solid-js/store';

const MODE = {
  books: 'books',
  bookDetail: 'book-detail',
  cart: 'cart',
} as const;

Object.freeze(MODE);

type TypeMode = typeof MODE;
type Mode = TypeMode[keyof TypeMode];

type ModeState = {
  mode: Mode;
  id: string | undefined;
  pathname: string | undefined;
};

type ModeArgs = [
  mode: Mode,
  params: Record<string, string> | undefined,
  pathname: string | undefined
];
type SetMode = (args: ModeArgs) => void;

type ModeStore = [
  Store<ModeState>,
  {
    setMode: SetMode;
  }
];

function createModeStore(): ModeStore {
  const [mode, setMode] = createStore<ModeState>({
    mode: MODE.books,
    id: undefined,
    pathname: undefined,
  });

  return [
    mode,
    {
      setMode: (args) => setMode(makeModeState(args)),
    },
  ];
}

function makeModeState([mode, params, pathname]: ModeArgs) {
  return {
    mode,
    id: params?.id,
    pathname,
  };
}

export { MODE, createModeStore };

export type { Mode, ModeArgs, ModeStore };

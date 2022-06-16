import { createContext, useContext } from 'solid-js';
import { createShop, itemIsValid, itemPrice, MODE } from '../stores/Shop';

// https://github.com/solidjs/solid/blob/main/packages/solid/h/jsx-runtime/src/jsx.d.ts

import type { Context, JSX } from 'solid-js';
import type {
  BookId,
  BookRaw,
  BookStore,
  CartStore,
  CartStorage,
  Fetcher,
  Mode,
  Shop,
  ToastState,
} from '../stores/Shop';

const ShopContext: Context<Shop | undefined> = createContext();

type Props = {
  fetcher: Fetcher;
  storage?: CartStorage;
  children?: JSX.Element;
};

function ShopProvider(props: Props): JSX.Element {
  const shop = createShop(props.fetcher, props.storage);

  return (
    <ShopContext.Provider value={shop}>{props.children}</ShopContext.Provider>
  );
}

function useShop(): Shop {
  const shop = useContext(ShopContext);
  if (!shop) throw Error('Shop is not instantiated yet');

  return shop;
}

export { itemIsValid, itemPrice, MODE, ShopProvider, useShop };

export type {
  BookId,
  BookRaw,
  BookStore,
  CartStore,
  Fetcher,
  Mode,
  Shop,
  ToastState,
};

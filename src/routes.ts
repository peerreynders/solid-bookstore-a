import { lazy } from 'solid-js';
import { useShop, MODE } from './providers/Shop';

import type { RouteDataFuncArgs } from 'solid-app-router';
import type { Mode } from './providers/Shop';

function RouteData(mode: Mode, args: RouteDataFuncArgs) {
  const setMode = useShop().mode[1].setMode;
  setMode([mode, args.params, args.location.pathname]);
}

function makeRouteData(mode: Mode) {
  return (args: RouteDataFuncArgs) => RouteData(mode, args);
}

export const routes = [
  {
    path: '/book/:id',
    component: lazy(() => import('./pages/book/[id]')),
    data: makeRouteData(MODE.bookDetail),
  },
  {
    path: '/cart',
    component: lazy(() => import('./pages/cart/[...items]')),
    data: makeRouteData(MODE.cart),
  },
  {
    path: '/*books',
    component: lazy(() => import('./pages/[...books]')),
    data: makeRouteData(MODE.books),
  },
];

/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, useRoutes } from 'solid-app-router';

import { ShopProvider } from './providers/Shop';
import { routes } from './routes';
import { Nav } from './components/Nav';
import { Toast } from './components/Toast';
import { fetcher, storage } from './lib/browser';

const Routes = useRoutes(routes);

render(
  () => (
    <ShopProvider fetcher={fetcher} storage={storage}>
      <Router>
        <div class="shell">
          <Nav />
          <Routes />
          <Toast />
        </div>
      </Router>
    </ShopProvider>
  ),
  document.getElementById('root') as HTMLElement
);

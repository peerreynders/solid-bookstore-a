import type { BookRaw } from '../providers/Shop';

async function fetcher(_source: unknown, _info: unknown): Promise<BookRaw[]> {
  const response = await fetch('/books.json');
  if (!response.ok) {
    throw new Error(
      `HTTP error status (${response.status}): ${response.statusText}`
    );
  }
  return response.json();
}

const storage = {
  load() {
    return new Promise(
      (resolve: (t: string | undefined | null) => void, _reject: unknown) => {
        resolve(self.localStorage.getItem('cart'));
      }
    );
  },
  save(json: string): Promise<void> {
    return new Promise((resolve: () => void, _reject: unknown) => {
      self.localStorage.setItem('cart', json);
      resolve();
    });
  },
};

export { fetcher, storage };

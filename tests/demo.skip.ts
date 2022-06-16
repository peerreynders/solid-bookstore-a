import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { createEffect, createSignal, createRoot } from 'solid-js';

import { rootAndRun } from './helpers';

test('POC test', async () => {
  const result = await new Promise<number | undefined>((resolve, _reject) => {
    createRoot(withRxGraph);

    function withRxGraph(dispose: () => void) {
      const [count, setCount] = createSignal(0);

      let result: number | undefined;
      createEffect(() => {
        console.log('running effect');
        result = count();
      });

      setTimeout(() => {
        console.log('incrementing');
        setCount((n) => n + 1);

        console.log('flushing');
        dispose();

        resolve(result);
      });

      console.log('end setup');
    }
  });

  assert.equal(result, 1);
});

test('rootAndRun test', async () => {
  const result = await rootAndRun(1000, function factory(done) {
    const [count, setCount] = createSignal(0);

    let result = -1;
    createEffect(() => {
      console.log('running effect');
      result = count();
    });

    console.log('exiting setup');
    return function task() {
      console.log('incrementing');
      setCount((n) => n + 1);

      console.log('exiting task');
      done(result);
    };
  });

  console.log('comparing results');
  assert.equal(result, 1);
});

test.run();

# solid-bookstore-a

[MobX](https://mobx.js.org)'s Michel Weststrate picked up the idea of the [Humble Dialog](./assets/TheHumbleDialogBox.pdf) (2002) (see also [Humble Object](http://xunitpatterns.com/Humble%20Object.html)) in [UI as an Afterthought](https://michel.codes/blogs/ui-as-an-afterthought) (2019), a topic he had previously touched on in his [2017 React Amsterdam talk](https://youtu.be/3J9EJrvqOiM?t=710).

This repo takes the [2017 React & MobX demo](https://github.com/mweststrate/react-mobx-shop/tree/react-amsterdam-2017) and "ports" it to [SolidJS](https://www.solidjs.com/) but preserves the notion of the [Segregated DOM](https://martinfowler.com/bliki/SegregatedDOM.html) to enable lightning fast [microtesting](https://youtu.be/H3LOyuqhaJA) (and perhaps [improving](https://michaelfeathers.typepad.com/michael_feathers_blog/2008/06/the-flawed-theo.html) the client-side application design in the process).

The idea of applying [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) ([Hexagonal Architecture](https://web.archive.org/web/20191210095000/https://alistair.cockburn.us/hexagonal-architecture/)) to the front-end is fielded regularly (e.g. [1](https://medium.com/@Killavus/hexagonal-architecture-in-javascript-applications-and-how-it-relates-to-flux-349616d1268d), [2](https://dev.to/huytaquoc/a-different-approach-to-frontend-architecture-38d4), [3](https://dev.to/xurxodev/moving-away-from-reactjs-and-vuejs-on-front-end-using-clean-architecture-3olk)) but the concept itself originates from back-end software. It's easily overlooked that some web applications can [ill afford](https://alistapart.com/article/responsible-javascript-part-1/) to take on bloat resulting from a front-end framework **and** a state management solution plus any code necessary to decouple the UI from the client-side behaviour:

> [you’re making a trade-off in terms of initial performance](https://timkadlec.com/remembers/2020-04-21-the-cost-of-javascript-frameworks/#the-big-picture).

SolidJS is unique as its [component boundaries vanish during runtime](https://dev.to/this-is-learning/components-are-pure-overhead-hpm). That makes it possible to assemble client-side behaviour purely from the [reactive primitives](https://www.solidjs.com/guides/reactivity#introducing-primitives) and [reactive stores](https://www.solidjs.com/docs/latest/api#using-stores). Using this approach "application components" tend to manifest around [stores](./src/stores) and can be wired together separately from the UI. The UI elements ([pages](./src/pages), [components](./src/components)) then simply snap onto the application core ([Shop](./src/stores/Shop.ts)) without the typical decoupling overhead.

This results in an application core that can be microtested without the overhead of rendering any markup or interacting with a surrogate DOM. This leaves the behavioural tests free to provide lightning fast [feedback](https://twitter.com/mfeathers/status/997570047185842176) during development while the remaining less responsive UI tests can be delayed to less frequently exercised integration tests. 

Currently this demo compiles to a ~37Kb (~15Kb gzipped) build.

---

## Notes
* Yes, this could use a bit more work; perhaps later.
* SolidJS's reactive primitives only work within a tracked context. On the client-side [render](https://www.solidjs.com/docs/latest/api#render) ([`index.tsx`](.src/index.tsx)) is responsible for creating that environment.
  * When testing outside of the browser an owner scope has to be explicitly created with [`createRoot`](https://www.solidjs.com/docs/latest/api#createroot) for the test to run in. The [rootAndRun()](./tests/helpers/index.ts) testing utility wraps a test passed as a factory in such a scope. See the [demo test](./tests/demo.skip.ts) for a rudimentary example and [Testing your Solid.js code with jest](https://dev.to/lexlohr/testing-your-solidjs-code-2gfh) for more background.
  * When running server-side SolidJS's reactivity is deliberately curtailed to properly support SSR. For the client-side code under test to operate as intended it is necessary to direct the module loader to load the browser version of SolidJS instead of the server version. This is accomplished with [`solid-register`](https://github.com/atk/solid-register). For more background see [Testing Solid.js code beyond jest](https://dev.to/lexlohr/testing-solidjs-code-beyond-jest-39p).
* [uvu](https://github.com/lukeed/uvu) was selected for its speed and [minimalist](https://medium.com/javascript-scene/why-i-use-tape-instead-of-mocha-so-should-you-6aa105d8eaf4) API.

---

Clone the repo (requires node.js 16.9 or later):
```
$ cd solid-bookstore-a
$ npm i
$ npm run test
```

… and watch the tests fly. To launch the app …

```
$ npm run dev
```

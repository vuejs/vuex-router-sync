# vuex-router-sync

> Effortlessly keep vue-router and vuex store in sync.

**Note:** requires `vuex>=0.6.2`.

### Usage

``` bash
npm install vuex-router-sync
```
``` js
import { sync } from 'vuex-router-sync'
import store from './vuex/store' // vuex store instance
import router from './router' // vue-router instance

sync(store, router) // done.

// bootstrap your app...
```

### How does it work?

- It adds a `route` module into the store, which contains the state representing the current route:

  ``` js
  store.state.route.path   // current path (string)
  store.state.route.params // current params (object)
  store.state.route.query  // current query (object)
  ```

- When the router navigates to a new route, the store's state is updated.

- When the store's `route` state is updated, it notifies the router to navigate to the corresponding path. This enables time-traveling between routes in `vue-devtools`.

### License

[MIT](http://opensource.org/licenses/MIT)

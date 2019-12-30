## vuex-router-sync

> 把 vue-router 当前的状态同步为 vuex 状态的一部分

### 用法

```
# 最新版本需要配合 vue-router 2.0及以上的版本使用
npm install vuex-router-sync
# 如果 vue-router 版本低于 2.0，执行如下
npm install vuex-router-sync@2
```



```javascript
import { sync } from 'vuex-router-sync'
import store from './vuex/store' // vuex store 实例
import router from './router' // vue-router 实例

const unsync = sync(store, router) // 返回值是 unsync 回调方法

// 在这里写你的代码

// 在 vue 应用销毁的阶段执行如下代码 (比如说, 你只在应用中一部分场景使用了 vue, 当跳出该场景想销毁 vue 实例时）
unsync() // 取消 store 和 router 中间的同步
```

你也可以设定一个自定义的 `vuex` `module`  的 `name` 值，如下：

```javascript
sync(store, router, { moduleName: 'RouteModule' } )
```



### 工作原理

- 该库在 `vuex`   `store` 上增加了默认名为 `route` 的 `module`, 用于表示当前路由的状态。

  ```javascript
  store.state.route.path   // current path (字符串类型)
  store.state.route.params // current params (对象类型)
  store.state.route.query  // current query (对象类型)
  ```

- 当被导航到一个路由时，`store` 的状态会被同步的更新。

- 请注意，`store.state.route` 是不可修改的，因为该值来源自 `URL` , 而不应该通过修改该值去触发浏览器的导航行为。相反，你只需要调用 `$router.push()` 或者 `$router.go()` 。另外，你可以通过 `$router.push({ query: {...}})` 来更新当前路径的 `query` 值。

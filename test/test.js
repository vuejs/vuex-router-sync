const Vue = require('vue')
const Vuex = require('vuex')
const VueRouter = require('vue-router')
const { sync } = require('../index')
const { mapState } = Vuex

Vue.use(Vuex)
Vue.use(VueRouter)

const run = (originalModuleName, done) => {
  const moduleName = originalModuleName || 'route'

  const store = new Vuex.Store({
    state: { msg: 'foo' }
  })

  const Home = {
    computed: mapState(moduleName, {
      path: state => state.fullPath,
      foo: state => state.params.foo,
      bar: state => state.params.bar
    }),
    render (h) {
      return h('div', [this.path, ' ', this.foo, ' ', this.bar])
    }
  }

  const router = new VueRouter({
    mode: 'abstract',
    routes: [
      { path: '/:foo/:bar', component: Home }
    ]
  })

  const unsync = sync(store, router, {
    moduleName: originalModuleName
  })

  router.push('/a/b')
  expect(store.state[moduleName].fullPath).toBe('/a/b')
  expect(store.state[moduleName].params).toEqual({ foo: 'a', bar: 'b' })

  const app = new Vue({
    store,
    router,
    render: h => h('router-view')
  }).$mount()

  expect(app.$el.textContent).toBe('/a/b a b')

  router.push('/c/d?n=1#hello')
  expect(store.state[moduleName].fullPath).toBe('/c/d?n=1#hello')
  expect(store.state[moduleName].params).toEqual({ foo: 'c', bar: 'd' })
  expect(store.state[moduleName].query).toEqual({ n: '1' })
  expect(store.state[moduleName].hash).toEqual('#hello')

  Vue.nextTick(() => {
    expect(app.$el.textContent).toBe('/c/d?n=1#hello c d')
    done(unsync)
  })
}

test('default usage', done => {
  run(null, done)
})

test('with custom moduleName', done => {
  run('moduleName', done)
})

test('desync', done => {
  const store = new Vuex.Store()
  spyOn(store, "watch").and.callThrough()
  
  const router = new VueRouter()

  const moduleName = 'testDesync'  
  const unsync = sync(store, router, {
    moduleName: moduleName
  })

  expect(unsync).toBeInstanceOf(Function)

  // Test module registered, store watched, router hooked
  expect(store.state[moduleName]).toBeDefined()
  expect(store.watch).toHaveBeenCalled()
  expect(store._watcherVM).toBeDefined()
  expect(store._watcherVM._watchers).toBeDefined()
  expect(store._watcherVM._watchers.length).toBe(1)
  expect(router.afterHooks).toBeDefined()
  expect(router.afterHooks.length).toBe(1)

  // Now unsync vuex-router-sync
  unsync()

  // Ensure router unhooked, store-unwatched, module unregistered
  expect(router.afterHooks.length).toBe(0)
  expect(store._watcherVm).toBeUndefined()
  expect(store.state[moduleName]).toBeUndefined()
  
  done()
})
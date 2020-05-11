import Vue from 'vue'
import Vuex, { mapState } from 'vuex'
import VueRouter from 'vue-router'
import { sync } from '@/index'

Vue.use(Vuex)
Vue.use(VueRouter)

function run(originalModuleName: string, done: Function): void {
  const moduleName: string = originalModuleName || 'route'

  const store = new Vuex.Store({
    state: { msg: 'foo' }
  })

  const Home = Vue.extend({
    computed: mapState(moduleName, {
      path: (state: any) => state.fullPath,
      foo: (state: any) => state.params.foo,
      bar: (state: any) => state.params.bar
    }),
    render(h) {
      return h('div', [this.path, ' ', this.foo, ' ', this.bar])
    }
  })

  const router = new VueRouter({
    mode: 'abstract',
    routes: [{ path: '/:foo/:bar', component: Home }]
  })

  sync(store, router, {
    moduleName: originalModuleName
  })

  router.push('/a/b')
  expect((store.state as any)[moduleName].fullPath).toBe('/a/b')
  expect((store.state as any)[moduleName].params).toEqual({
    foo: 'a',
    bar: 'b'
  })

  const app = new Vue({
    store,
    router,
    render: (h) => h('router-view')
  }).$mount()

  expect(app.$el.textContent).toBe('/a/b a b')

  router.push('/c/d?n=1#hello')
  expect((store.state as any)[moduleName].fullPath).toBe('/c/d?n=1#hello')
  expect((store.state as any)[moduleName].params).toEqual({
    foo: 'c',
    bar: 'd'
  })
  expect((store.state as any)[moduleName].query).toEqual({ n: '1' })
  expect((store.state as any)[moduleName].hash).toEqual('#hello')

  Vue.nextTick(() => {
    expect(app.$el.textContent).toBe('/c/d?n=1#hello c d')
    done()
  })
}

test('default usage', (done) => {
  run('', done)
})

test('with custom moduleName', (done) => {
  run('moduleName', done)
})

test('unsync', (done) => {
  const store = new Vuex.Store({})
  spyOn(store, 'watch').and.callThrough()

  const router = new VueRouter()

  const moduleName = 'testDesync'
  const unsync = sync(store, router, {
    moduleName: moduleName
  })

  expect(unsync).toBeInstanceOf(Function)

  // Test module registered, store watched, router hooked
  expect((store as any).state[moduleName]).toBeDefined()
  expect((store as any).watch).toHaveBeenCalled()
  expect((store as any)._watcherVM).toBeDefined()
  expect((store as any)._watcherVM._watchers).toBeDefined()
  expect((store as any)._watcherVM._watchers.length).toBe(1)
  expect((router as any).afterHooks).toBeDefined()
  expect((router as any).afterHooks.length).toBe(1)

  // Now unsync vuex-router-sync
  unsync()

  // Ensure router unhooked, store-unwatched, module unregistered
  expect((router as any).afterHooks.length).toBe(0)
  expect((store as any)._watcherVm).toBeUndefined()
  expect((store as any).state[moduleName]).toBeUndefined()

  done()
})

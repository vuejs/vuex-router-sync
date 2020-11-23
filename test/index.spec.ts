import { createApp, defineComponent, h, nextTick } from 'vue'

import { createStore, mapState } from 'vuex'
import { createRouter, createWebHistory } from 'vue-router'
import { sync } from '@/index'

async function run(originalModuleName: string, done: Function): Promise<void> {
  const moduleName: string = originalModuleName || 'route'

  const store = createStore({
    state() {
      return { msg: 'foo' }
    }
  })

  const Home = defineComponent({
    computed: mapState(moduleName, {
      path: (state: any) => state.fullPath,
      foo: (state: any) => state.params.foo,
      bar: (state: any) => state.params.bar
    }),
    render() {
      h('div', [this.path, ' ', this.foo, ' ', this.bar])
    }
  })

  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/:foo/:bar', component: Home }]
  })

  sync(store, router, {
    moduleName: originalModuleName
  })

  router.push('/a/b')
  await router.isReady()
  expect((store.state as any)[moduleName].fullPath).toBe('/a/b')
  expect((store.state as any)[moduleName].params).toEqual({
    foo: 'a',
    bar: 'b'
  })

  const rootEl = document.createElement('div')
  document.body.appendChild(rootEl)

  const app = createApp({
    render: () => h('router-view')
  })
  app.use(store)
  app.use(router)
  app.mount(rootEl)

  // expect(app.$el.textContent).toBe('/a/b a b')
  await router.push('/c/d?n=1#hello')
  expect((store.state as any)[moduleName].fullPath).toBe('/c/d?n=1#hello')
  expect((store.state as any)[moduleName].params).toEqual({
    foo: 'c',
    bar: 'd'
  })
  expect((store.state as any)[moduleName].query).toEqual({ n: '1' })
  expect((store.state as any)[moduleName].hash).toEqual('#hello')

  nextTick(() => {
    // expect(app.$el.textContent).toBe('/c/d?n=1#hello c d')
    done()
  })
}

test('default usage', async (done) => {
  await run('', done)
})

test('with custom moduleName', async (done) => {
  await run('moduleName', done)
})

test('unsync', (done) => {
  const store = createStore({})
  spyOn(store, 'watch').and.callThrough()

  const router = createRouter({
    history: createWebHistory(),
    routes: []
  })

  const moduleName = 'testDesync'
  const unsync = sync(store, router, {
    moduleName: moduleName
  })

  expect(unsync).toBeInstanceOf(Function)
  // Test module registered, store watched, router hooked
  expect((store as any).state[moduleName]).toBeDefined()
  expect((store as any).watch).toHaveBeenCalled()
  // expect((store as any)._watcherVM).toBeDefined()
  // expect((store as any)._watcherVM._watchers).toBeDefined()
  // expect((store as any)._watcherVM._watchers.length).toBe(1)
  expect((router as any).afterEach).toBeDefined()
  expect((router as any).afterEach.length).toBe(1)

  // Now unsync vuex-router-sync
  unsync()

  // Ensure router unhooked, store-unwatched, module unregistered
  // expect((router as any).afterEach.length).toBe(0)
  // expect((store as any)._watcherVm).toBeUndefined()
  expect((store as any).state[moduleName]).toBeUndefined()

  done()
})

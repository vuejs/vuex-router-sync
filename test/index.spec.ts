import { createApp, defineComponent, h, computed, nextTick } from 'vue'

import { createStore, useStore } from 'vuex'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { sync } from '@/index'

async function run(originalModuleName: string, done: Function): Promise<void> {
  const moduleName: string = originalModuleName || 'route'

  const store = createStore({
    state() {
      return { msg: 'foo' }
    }
  })

  const Home = defineComponent({
    setup() {
      const store = useStore()
      const path = computed(() => store.state[moduleName].fullPath)
      const foo = computed(() => store.state[moduleName].params.foo)
      const bar = computed(() => store.state[moduleName].params.bar)
      return () => h('div', [path.value, ' ', foo.value, ' ', bar.value])
    }
  })

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        component: {
          template: 'root'
        }
      },
      { path: '/:foo/:bar', component: Home }
    ]
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
    render: () => h(RouterView)
  })
  app.use(store)
  app.use(router)
  app.mount(rootEl)

  expect(rootEl.textContent).toBe('/a/b a b')
  await router.push('/c/d?n=1#hello')
  expect((store.state as any)[moduleName].fullPath).toBe('/c/d?n=1#hello')
  expect((store.state as any)[moduleName].params).toEqual({
    foo: 'c',
    bar: 'd'
  })
  expect((store.state as any)[moduleName].query).toEqual({ n: '1' })
  expect((store.state as any)[moduleName].hash).toEqual('#hello')

  nextTick(() => {
    expect(rootEl.textContent).toBe('/c/d?n=1#hello c d')
    done()
  })
}

test('default usage', async (done) => {
  await run('', done)
})

test('with custom moduleName', async (done) => {
  await run('moduleName', done)
})

test('unsync', async (done) => {
  const store = createStore({
    state() {
      return { msg: 'foo' }
    }
  })
  spyOn(store, 'watch').and.callThrough()

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        component: {
          template: 'root'
        }
      }
    ]
  })

  const moduleName = 'testDesync'
  const unsync = sync(store, router, {
    moduleName: moduleName
  })

  expect(unsync).toBeInstanceOf(Function)
  // Test module registered, store watched, router hooked
  expect((store as any).state[moduleName]).toBeDefined()
  expect((store as any).watch).toHaveBeenCalled()

  // Now unsync vuex-router-sync
  unsync()

  // Ensure module unregistered, no store change
  router.push('/')
  await router.isReady()
  expect((store as any).state[moduleName]).toBeUndefined()
  expect((store as any).state).toEqual({ msg: 'foo' })
  done()
})

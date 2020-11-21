import { Store } from 'vuex'
import { Router, RouteLocationNormalized } from 'vue-router'

export interface SyncOptions {
  moduleName: string
}

export interface State {
  name?: RouteLocationNormalized['name']
  path: RouteLocationNormalized['path']
  hash: RouteLocationNormalized['hash']
  query: RouteLocationNormalized['query']
  params: RouteLocationNormalized['params']
  fullPath: RouteLocationNormalized['fullPath']
  meta?: RouteLocationNormalized['meta']
  from?: Omit<State, 'from'>
}

export interface Transition {
  to: RouteLocationNormalized
  from: RouteLocationNormalized
}

export function sync(
  store: Store<any>,
  router: Router,
  options?: SyncOptions
): () => void {
  const moduleName = (options || {}).moduleName || 'route'

  store.registerModule(moduleName, {
    namespaced: true,
    state: cloneRoute(router.currentRoute),
    mutations: {
      ROUTE_CHANGED(_state: State, transition: Transition): void {
        store.state[moduleName] = cloneRoute(transition.to, transition.from)
      }
    }
  })

  let isTimeTraveling: boolean = false
  let currentPath: string

  // sync router on store change
  const storeUnwatch = store.watch(
    (state) => state[moduleName],
    (route: RouteLocationNormalized) => {
      const { fullPath } = route
      if (fullPath === currentPath) {
        return
      }
      if (currentPath != null) {
        isTimeTraveling = true
        router.push(route as any)
      }
      currentPath = fullPath
    },
    { sync: true } as any
  )

  // sync store on router navigation
  const afterEachUnHook = router.afterEach((to, from) => {
    if (isTimeTraveling) {
      isTimeTraveling = false
      return
    }
    currentPath = to.fullPath
    store.commit(moduleName + '/ROUTE_CHANGED', { to, from })
  })

  return function unsync(): void {
    // On unsync, remove router hook
    if (afterEachUnHook != null) {
      afterEachUnHook()
    }

    // On unsync, remove store watch
    if (storeUnwatch != null) {
      storeUnwatch()
    }

    // On unsync, unregister Module with store
    store.unregisterModule(moduleName)
  }
}

function cloneRoute(
  to: RouteLocationNormalized,
  from?: RouteLocationNormalized
): State {
  const clone: State = {
    name: to.name,
    path: to.path,
    hash: to.hash,
    query: to.query,
    params: to.params,
    fullPath: to.fullPath,
    meta: to.meta
  }

  if (from) {
    clone.from = cloneRoute(from)
  }

  return Object.freeze(clone)
}

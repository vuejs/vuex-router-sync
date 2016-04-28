exports.sync = function (store, router) {
  store.router = router
  patchStore(store)

  var isTimeTraveling = false
  var currentPath

  // sync router on store change
  store.watch(
    function (state) {
      return state.route
    },
    function (route) {
      if (route.path === currentPath) {
        return
      }
      isTimeTraveling = true
      currentPath = route.path
      router.go(route.path)
    },
    { deep: true, sync: true }
  )

  // sync store on router navigation
  router.afterEach(function (transition) {
    if (isTimeTraveling) {
      isTimeTraveling = false
      return
    }
    var to = transition.to
    currentPath = to.path
    store.dispatch('router/ROUTE_CHANGED', {
      path: to.path,
      query: to.query,
      params: to.params
    })
  })
}

function patchStore (store) {
  // add state
  var set = store._vm.constructor.parsers.path.setPath,
      initialRoute = store.router._currentRoute
  store._dispatching = true
  set(store._vm._data, 'route', {
    path: initialRoute.path,
    query: initialRoute.query,
    params: initialRoute.params
  })
  store._dispatching = false
  // add mutations
  store.hotUpdate({
    modules: {
      route: {
        mutations: {
          'router/ROUTE_CHANGED': function (state, to) {
            state.path = to.path
            state.query = to.query
            state.params = to.params
          }
        }
      }
    }
  })
}

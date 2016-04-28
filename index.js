exports.sync = function (store, router) {
  patchStore(store)
  store.router = router

  var isTimeTraveling = false
  var currentPath

  // sync router on store change
  store.watch(
    function (state) {
      return state.route
    },
    function (route) {
      isTimeTraveling = true
      currentPath = route.path
      router.go({
        path: route.path,
        query: route.query,
        params: route.params
      })
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
  var set = store._vm.constructor.parsers.path.setPath
  store._dispatching = true
  set(store._vm._data, 'route', {
    path: '',
    query: null,
    params: null
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

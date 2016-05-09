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
      name: to.name,
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
    name: '',
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
            state.name = to.name
            state.query = to.query
            state.params = to.params
          }
        }
      }
    }
  })
}

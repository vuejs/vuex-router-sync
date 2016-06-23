exports.sync = function (store, router, stateForSync = {
  path: '',
  query: null,
  params: null
}) {
  patchStore(store, stateForSync)
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
    var newState = {}
    Object.keys(stateForSync).forEach(key => {
      newState[key] = to[key] || ''
    })
    store.dispatch('router/ROUTE_CHANGED', newState)
  })
}

function patchStore (store, stateForSync) {
  // add state
  var set = store._vm.constructor.parsers.path.setPath
  store._dispatching = true
  set(store._vm._data, 'route', stateForSync)
  store._dispatching = false
  // add mutations
  store.hotUpdate({
    modules: {
      route: {
        mutations: {
          'router/ROUTE_CHANGED': function (state, to) {
            Object.keys(stateForSync).forEach(key => {
              state[key] = to[key] || ''
            })
          }
        }
      }
    }
  })
}

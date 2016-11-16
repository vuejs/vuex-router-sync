exports.sync = function (store, router) {
  store.registerModule('route', {
    state: {},
    mutations: {
      'router/ROUTE_CHANGED': function (state, to) {
        store.state.route = Object.freeze({
          name: to.name,
          path: to.path,
          hash: to.hash,
          query: to.query,
          params: to.params,
          fullPath: to.fullPath,
          meta: to.meta
        })
      }
    }
  })

  var isTimeTraveling = false
  var currentPath

  // sync router on store change
  store.watch(
    function (state) { return state.route },
    function (route) {
      if (route.fullPath === currentPath) {
        return
      }
      isTimeTraveling = true
      currentPath = route.fullPath
      router.push(route)
    },
    { sync: true }
  )

  // sync store on router navigation
  router.afterEach(function (to) {
    if (isTimeTraveling) {
      isTimeTraveling = false
      return
    }
    currentPath = to.fullPath
    store.commit('router/ROUTE_CHANGED', to)
  })
}

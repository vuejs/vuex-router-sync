exports.sync = function (store, router, options) {
  var moduleName = (options || {}).moduleName || 'route'

  store.registerModule(moduleName, {
    state: {},
    mutations: {
      'router/ROUTE_CHANGED': function (state, transition) {
        store.state[moduleName] = Object.freeze({
          name: transition.to.name,
          path: transition.to.path,
          hash: transition.to.hash,
          query: transition.to.query,
          params: transition.to.params,
          fullPath: transition.to.fullPath,
          meta: transition.to.meta,
          from: transition.from
        })
      }
    }
  })

  var isTimeTraveling = false
  var currentPath

  // sync router on store change
  store.watch(
    function (state) { return state[moduleName] },
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
  router.afterEach(function (to, from) {
    if (isTimeTraveling) {
      isTimeTraveling = false
      return
    }
    currentPath = to.fullPath
    store.commit('router/ROUTE_CHANGED', { to: to, from: from })
  })
}

<template>
  <h1 class="title">Vuex Router Sync</h1>

  <ul class="nav">
    <li class="nav-item">
      <RouterLink class="nav-link" to="/">Home</RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink class="nav-link" to="/about">About</RouterLink>
    </li>
  </ul>

  <div class="store">
    <pre class="store-view">{{ $store.state.route }}</pre>
  </div>

  <RouterView />
</template>

<style>
*,
::before,
::after {
  box-sizing: border-box;
}

body {
  padding: 64px 32px 96px;
  width: 100%;
  min-width: 320px;
  min-height: 100vh;
  letter-spacing: .4px;
  line-height: 24px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #2c3e50;
  background-color: #ffffff;
  direction: ltr;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body,
p,
h1,
pre {
  margin: 0;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
}

.nav {
  display: flex;
  justify-content: center;
  margin: 0 -8px;
  padding: 24px 0 0;
  list-style: none;
}

.nav-item {
  padding: 0 8px;
}

.nav-link {
  display: block;
  border-radius: 4px;
  padding: 0 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  text-decoration: none;
  background-color: #f2f2f2;
  transition: color .25s, background-color .25s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #ffffff;
  background-color: #3eaf7c;
}

.store {
  margin: 24px auto 0;
  padding: 24px;
  border-radius: 8px;
  max-width: 480px;
  background-color: #282c34;
}

.store-view {
  font-family: monospace;
  font-size: 16px;
  color: #ffffff;
}
</style>

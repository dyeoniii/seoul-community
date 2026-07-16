<template>
  <header>
    <nav class="main-nav">
      <ul class="nav-list">
        <li><router-link to="/">홈</router-link></li>
        <li><router-link to="/info">정보</router-link></li>
        <li><router-link to="/chat">챗봇</router-link></li>
        <li><router-link to="/community">커뮤니티</router-link></li>
      </ul>
    </nav>
  </header>

  <main>
    <router-view />
  </main>
</template>

<style scoped>
.main-nav {
  background: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: center;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: center;
}

.nav-list a {
  color: #333;
  text-decoration: none;
  padding: 12px 8px;
  display: inline-block;
}

.nav-list a.router-link-active {
  color: #42b983;
  font-weight: 700;
}
</style>
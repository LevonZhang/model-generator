<template>
  <div id="app">
    <header>
      <div class="header-content">
        <img src="@/assets/logo.png" alt="ModelWise Logo" class="logo">
        <nav>
          <router-link :to="{ name: 'object-diagram-generator' }" class="active">Object Diagram Generator</router-link>
          <router-link :to="{ name: 'sequence-diagram-generator' }">Sequence Diagram Generator</router-link>
          <router-link :to="{ name: 'text-translator' }">Text Translator</router-link>
          <router-link :to="{ name: 'word-translator' }">Word Document Translator</router-link>
          <router-link :to="{ name: 'ddd-blog' }">Domain Driven Design Blogs</router-link>
        </nav>
      </div>  
    </header>
    <main>
      <RouterView/>
    </main>
  </div>
</template>
<style>
/* App.vue 样式 */
#app {
  font-family: 'Arial', sans-serif;  /* 设置字体 */
}

header {
  background-color: #2c3e50; /* 深蓝色背景 */
  color: white; /* 白色文字 */
  padding: 1rem 0; /* 上下内边距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.header-content {
  display: flex; 
  align-items: center; 
  margin: 0 auto; 
  padding: 0 2rem; 
}

.logo {
  height: 80px; /* 设置 logo 高度 */
  margin-right: auto; /* 将 logo 推到左边 */
}

nav {
  display: flex;
  justify-content: center; /* 将导航菜单水平居中 */
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

nav li {
  margin: 0 1rem;
}

nav a {
  text-decoration: none;
  color: white; /* 白色链接 */
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 5px; /* 圆角 */
  transition: background-color 0.3s ease; /* 添加过渡效果 */
}

nav a:hover,
nav a.router-link-exact-active {
  background-color: #34495e; /* 悬停和激活状态的背景颜色 */
}

main {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: top; /* 垂直居上 */
  min-height: calc(100vh - 100px); /* 设置最小高度，减去页眉高度 */
}
</style>
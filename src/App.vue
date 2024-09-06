<template>
  <div id="app">
    <header>
      <div class="header-content">
        <img src="@/assets/logo.png" alt="ModelWise Logo" class="logo">
        <nav>
          <router-link :to="{ name: 'home' }" class="active">Home</router-link>
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
    <footer>
      <div class="footer-content">
        <div class="social-links">
          <a href="https://twitter.com/zlianhua" target="_blank"><font-awesome-icon icon="fab fa-twitter" /></a>
          <a href="https://www.facebook.com/zlianhua" target="_blank"><font-awesome-icon icon="fab fa-facebook-f" /></a>
          <a href="mailto:zlianhua@gmail.com"><font-awesome-icon icon="fas fa-envelope" /></a>
        </div>
        <div class="donate">
          <a href="https://paypal.me/zlianhua?country.x=C2&locale.x=zh_XC" target="_blank">
            Donate with PayPal <font-awesome-icon icon="fab fa-paypal"/> 
          </a>
        </div>
      </div>
    </footer>
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
  padding: 0.2rem 0; /* 上下内边距 */
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

footer {
  background-color: #34495e;
  color: white;
  padding: 1rem 0;
  text-align: center;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  padding: 0 2rem;
  max-width: 1200px; /* 设置最大宽度 */
}

.social-links {
  display: flex;
  justify-content: center; /* Center social links */
}

.social-links a {
  margin: 0 1rem; /* Add 1rem spacing between icons */
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.social-links a:hover {
  color: #f0ad4e; /* 悬停颜色 */
}

.donate {
  text-align: right; /* Right align the donate section */
}

/* Style the PayPal button to match social icons */
.donate {
  margin: 0 1rem; /* Add 1rem spacing between icons */
  color: white;
  text-decoration: none;
  font-size: 1.0rem;
  transition: color 0.3s ease;
  margin-left: 0.5rem; /* Add some space between the icon and text */
  margin-right: 0.5rem; /* Add some space between the icon and text */
}

.donate a {
  margin: 0 1rem; /* Add 1rem spacing between icons */
  color: white;
  text-decoration: none;
  font-size: 1.0 rem;
  transition: color 0.3s ease;
}

.donate a:hover {
  color: #f0ad4e; /* 悬停颜色 */
}
</style>
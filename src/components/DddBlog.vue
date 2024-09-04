<template>
    <div class="iframe-container">
      <iframe 
        src="https://ddd-talking.com" 
        title="Domain Driven Design Blogs"
      ></iframe>
    </div>
  </template>
  
  <style scoped>
  .iframe-container {
    width: 100%;  /* 设置容器宽度为 100% */
    height: 800px;  /* 设置 iframe 高度 */
    align-items: top; /* 垂直居上 */
  }
  
  .iframe-container iframe {
    width: 100%;  /* 设置 iframe 宽度为 100% */
    height: 100%;  /* 设置 iframe 高度为 100% */
    border: none;  /* 移除边框 */
  }
  </style>
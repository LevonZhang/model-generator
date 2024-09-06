<template>
    <div class="container">
      <div class="iframe-container">
        <iframe 
          src="https://doctranslatepy-cbsb5sdfaa8b74yy5rtr6e.streamlit.app/?embedded=true" 
          title="Word Document Translator"
        ></iframe>
    </div>
    </div>
  </template>
  
  <style scoped>
  .iframe-container {
    width: 100%;  /* 设置容器宽度为 100% */
    height: 800px;  /* 设置 iframe 高度 */
  }
  
  .iframe-container iframe {
    width: 100%;  /* 设置 iframe 宽度为 100% */
    height: 100%;  /* 设置 iframe 高度为 100% */
    border: none;  /* 移除边框 */
  }
  </style>
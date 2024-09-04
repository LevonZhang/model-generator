<template>
    <div class="container">
      <h2 class="title">AI-Powered Word Document Translator</h2>
      <p class="description">
        Translate your entire Word documents while preserving formatting with our AI-powered translator.
        Simply upload your document, choose the target language, and let our tool handle the rest. 
        Powered by Google Gemini for accurate and efficient document translation.
      </p>
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
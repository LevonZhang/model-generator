<template>
    <div class="container">
      <h1 class="main-title">ModelWise: AI-Powered Development Tools</h1>
  
      <div class="feature-section">
        <div class="feature">
          <h2 class="title">AI-Powered Object Diagram Generator</h2>
          <p class="description">
            Effortlessly design your Object Diagram domain models with our AI-powered generator! 
            Simply describe your requirements in natural language, and our tool will automatically generate a PlantUML class diagram. 
            You can even edit the generated code directly for further customization. Perfect for software developers and architects!
          </p>
          <router-link to="/object-diagram-generator" class="button">Try It Out</router-link>
        </div>
  
        <div class="feature">
          <h2 class="title">AI-Powered Sequence Diagram Generator</h2>
          <p class="description">
            Visualize your system interactions with ease using our AI-powered sequence diagram generator! 
            Describe the sequence of events in natural language, and our tool will automatically generate a PlantUML sequence diagram. 
            Customize the generated code for even more precise representation of your system's behavior. 
          </p>
          <router-link to="/sequence-diagram-generator" class="button">Try It Out</router-link>
        </div>
      </div>
  
      <div class="feature-section">
        <div class="feature">
          <h2 class="title">AI-Powered Text Translator</h2>
          <p class="description">
            Translate your text quickly and accurately with our AI-powered translator. 
            Leveraging the power of Google Gemini, our tool supports multiple languages and delivers high-quality translations. 
          </p>
          <router-link to="/text-translator" class="button">Try It Out</router-link>
        </div>
  
        <div class="feature">
          <h2 class="title">AI-Powered Word Document Translator</h2>
          <p class="description">
            Translate your entire Word documents while preserving formatting with our AI-powered translator.
            Simply upload your document, choose the target language, and let our tool handle the rest. 
            Powered by Google Gemini for accurate and efficient document translation.
          </p>
          <router-link to="/word-translator" class="button">Try It Out</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;  /* 减少内边距 */
    font-family: sans-serif;
    width: 70%
  }
  
  .main-title {
    font-size: 3rem;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .feature-section {
    display: flex;
    gap: 3rem;
    margin-bottom: 3rem;
  }
  
  .feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 45%; /* Adjust as needed */
  }
  
  .title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .description {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #333;
    margin-bottom: 2rem;
    text-align: left;
  }
  
  .button {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 4px;
    background-color: #4CAF50;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .button:hover {
    background-color: #45a049;
  }
  </style>
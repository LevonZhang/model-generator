<template>
  <div class="container">
    <h1 class="title">领域模型生成器</h1>

    <div class="input-group">
      <label for="domainInput" class="label">领域需求描述:</label>
      <textarea 
        id="domainInput" 
        v-model="domainDescription" 
        placeholder="用自然语言描述您的领域需求"
        class="textarea"
        rows="8"
      ></textarea>
    </div>

    <button @click="designModel" class="button primary">去设计</button>

    <div class="input-group">
      <label for="plantumlInput" class="label">PlantUML 代码:</label>
      <textarea 
        id="plantumlInput" 
        v-model="userInput" 
        placeholder="输入您的 PlantUML 代码"
        class="textarea"
        rows="12"
      ></textarea>
    </div>

    <button @click="generateModel" class="button">生成模型</button>

    <div v-if="isLoading" class="diagram-container">
      <div class="loader"></div> 
      <p>图片生成中...</p>
    </div>
    <div v-else-if="imageUrl" class="diagram-container">
      <img :src="imageUrl" alt="PlantUML Diagram" class="diagram-image" />
      <button @click="downloadPNG" class="button">下载 PNG</button>
    </div>
    <div v-else-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>
  
  <script>  
  export default {
    data() {
      return {
        domainDescription: '', // 新增：用于存储领域需求描述
        userInput: '',
        isLoading: false,
        errorMessage: null,
        imageUrl: null,
      };
    },
    methods: {
      async designModel() {
        this.isLoading = true;
        this.errorMessage = null;
        this.userInput = ''; // 清空 PlantUML 代码

        try {
          // 调用 Google Gemini API 生成 PlantUML 代码
          const response = await fetch('/api/generate-plantuml', { // 假设你创建了一个新的 Serverless 函数
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              domain_description: this.domainDescription,
            }),
          });

          if (!response.ok) {
            throw new Error(`Google Gemini API request failed with status ${response.status}`);
          }

          const data = await response.json();
          console.log(data)
          if(data && data.plantuml_code){
            this.userInput = data.plantuml_code.replace(/^@startuml|@enduml$/gm, '').trim(); // 去掉 @startuml 和 @enduml
            // 生成图片
            this.generateModel();
          }else{
            this.errorMessage = "设计模型输出内容为空。";
          }
        } catch (error) {
          console.error("Error designing model:", error);
          this.errorMessage = "设计模型时出错，请检查您的输入或网络连接。";
        } finally {
          this.isLoading = false;
        }
      },
      async generateModel() {
        this.isLoading = true;
        this.imageUrl = null;
        this.errorMessage = null; 

        try {
          const response = await fetch('/api/generate-diagram', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              "diagram_source": this.userInput,
              "diagram_type": "plantuml",
              "output_format": "png"
            }),
          });

          if (!response.ok) {
            throw new Error(`Kroki API request failed with status ${response.status}`);
          }

          const blob = await response.blob();
          this.imageUrl = URL.createObjectURL(blob); 
        } catch (error) {
          console.error("Error generating diagram:", error);
          this.errorMessage = "生成图表时出错，请检查您的输入或网络连接。";
        } finally {
          this.isLoading = false;
        }
      },
      downloadPNG() {
        const link = document.createElement('a');
        link.href = this.imageUrl;
        link.download = 'diagram.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
  };
  </script>
  <style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    font-family: sans-serif;
  }
  
  .title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  .input-group {
    width: 100%;
    max-width: 600px;
    margin-bottom: 1rem;
  }
  
  .label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  .textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
  }
  
  .button {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 4px;
    background-color: #eee;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .button:hover {
    background-color: #ddd;
  }
  
  .button.primary {
    background-color: #4CAF50;
    color: white;
  }
  
  .button.primary:hover {
    background-color: #45a049;
  }
  
  .diagram-container {
    margin-top: 2rem;
    text-align: center;
  }
  
  .loader {
    width: 48px;
    height: 48px;
    border: 5px solid #f3f3f3;
    border-radius: 50%;
    border-top: 5px solid #3498db;
    animation: spin 2s linear infinite;
    margin: 1rem auto;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .diagram-image {
    max-width: 100%;
    height: auto;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .error-message {
    color: red;
    font-weight: bold;
    margin-top: 2rem;
  }
  </style>
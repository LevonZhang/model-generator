<template>
  <div>
      <h1>领域模型生成器</h1>
      <textarea v-model="userInput" placeholder="输入您的领域模型需求"></textarea>
      <button @click="generateModel">生成模型</button>

      <div v-if="isLoading" class="diagram-container">
        图片生成中...
      </div>
      <div v-else-if="imageUrl" class="diagram-container">
        <img :src="imageUrl" alt="PlantUML Diagram" />
        <button @click="downloadPNG">下载 PNG</button>
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
        userInput: '',
        isLoading: false,
        errorMessage: null,
        imageUrl: null
      };
    },
    methods: {
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
  .diagram-container {
    border: 1px solid #ccc; 
    padding: 10px;
    margin-top: 10px;
    text-align: center; /* 图片居中 */
  }
  
  .error-message {
    color: red;
    font-weight: bold;
    margin-top: 10px;
  }
  </style>
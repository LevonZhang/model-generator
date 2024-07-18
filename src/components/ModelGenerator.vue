<template>
  <div>
    <h1>领域模型生成器</h1>

    <label for="domainInput">领域需求描述:</label>
    <textarea id="domainInput" v-model="domainDescription" placeholder="用自然语言描述您的领域需求"></textarea>
    <button @click="designModel">去设计</button>

    <label for="plantumlInput">PlantUML 代码:</label>
    <textarea id="plantumlInput" v-model="userInput" placeholder="编辑您的 PlantUML 代码"></textarea>
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
          this.userInput = data.plantuml_code.replace(/^@startuml|@enduml$/gm, '').trim(); // 去掉 @startuml 和 @enduml

          // 生成图片
          this.generateModel();
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
<template>
  <div class="container">
    <h1 class="title">领域模型生成器</h1>

    <div class="input-container">
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
    </div>

    <button @click="designModel" class="button primary">
      {{ hasDesign ? "去修改设计" : "去设计" }} 
    </button>

    <div v-if="isDesigning" class="designing-message">
      <div class="loader"></div>
      <p>设计中...</p>
    </div>

    <div v-if="designExplanation" class="explanation-container">
      <h3 class="explanation-title">设计说明:</h3>
      <p class="explanation-text">{{ designExplanation }}</p>
    </div>

    <div v-if="imageUrl" class="diagram-container">
      <img :src="imageUrl" alt="PlantUML Diagram" class="diagram-image" />
      <button @click="downloadPNG" class="button download">下载 PNG</button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>  
export default {
  data() {
    return {
      domainDescription: '',
      userInput: '',
      isLoading: false,
      isDesigning: false,
      errorMessage: null,
      imageUrl: null,
      designExplanation: null,
    };
  },
  computed: {
    hasDesign() {
      return this.designExplanation || this.imageUrl; 
    }
  },
  watch: {
    domainDescription: 'updateDesignButton',
    userInput: 'updateDesignButton',
  },
  methods: {
    async designModel() {
      this.isDesigning = true; 
      this.errorMessage = null;

      try {
        const response = await fetch('/api/generate-plantuml', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            domain_description: this.domainDescription,
            plantuml_code: this.userInput.replace(/^@startuml|@enduml$/gm, '').trim()
          }),
        });

        if (!response.ok) {
          throw new Error(`Google Gemini API request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (data) {
          console.log(JSON.stringify(data, null, 2));
          this.userInput = data.plantuml_code;
          this.designExplanation = data.design_explanation;
          this.isLoading = true;
          this.generateModel();
        } else {
          this.errorMessage = "设计模型输出内容为空。";
        }
      } catch (error) {
        console.error("Error designing model:", error);
        this.errorMessage = "设计模型时出错，请检查您的输入或网络连接。";
      } finally {
        this.isLoading = false;
        this.isDesigning = false; 
      }
    },
    async generateModel() {
      this.imageUrl = null;
      this.errorMessage = null; 

      try {
        let toGenText = this.userInput.replace(/^@startuml|@enduml$/gm, '').trim(); 
        const response = await fetch('/api/generate-diagram', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "diagram_source": toGenText,
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
    updateDesignButton() {
      if (!this.domainDescription) {
        this.hasDesign = false;
      } else {
        this.hasDesign = true;
      }
    },
  },
};
</script>

<style scoped>
/* ... (其他样式) */

.input-container {
  display: flex;
  gap: 1rem;
}

.explanation-container {
  width: 100%;
  max-width: 600px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 2rem;
}

.explanation-title {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.explanation-text {
  white-space: pre-wrap; 
}

.designing-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.button.download {
  background-color: #2196F3;
  color: white;
  margin-top: 1rem;
}
</style>
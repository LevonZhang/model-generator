<template>
  <div class="container">
    <h1 class="title">Domain Model Generator</h1>

    <div class="input-container">
      <div class="input-group">
        <label for="domainInput" class="label">Domain Requirements:</label>
        <textarea 
          id="domainInput" 
          v-model="domainDescription" 
          placeholder="Describe your domain requirements in natural language"
          class="requirement-textarea"
          rows="12"
        ></textarea>
      </div>

      <div class="input-group">
        <label for="plantumlInput" class="label">Edit PlantUML code directly if needed:</label>
        <textarea 
          id="plantumlInput" 
          v-model="userInput" 
          placeholder="Edit PlantUML code directly if needed"
          class="plantuml-textarea"
          rows="12"
        ></textarea>
      </div>
    </div>

    <div class="button-group"> 
      <button @click="designModel" class="button primary">
        {{ hasDesign ? "Modify Design" : "Design" }} 
      </button>
      <button @click="clearDesign" class="button">Clear Design</button>
    </div>

    <div v-if="isDesigning" class="designing-message">
      <div class="loader"></div>
      <p>Designing...</p>
    </div>

    <div v-if="designExplanation" class="explanation-container">
      <h3 class="explanation-title">Design explanation:</h3>
      <p class="explanation-text">{{ designExplanation }}</p>
    </div>

    <div v-if="imageUrl" class="diagram-container">
      <img :src="imageUrl" alt="PlantUML Diagram" class="diagram-image" />
    </div>
    
    <button v-if="imageUrl" @click="downloadPNG" class="button download">Download PNG</button>

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
          this.errorMessage = "Design model output is empty.";
        }
      } catch (error) {
        console.error("Error designing model:", error);
        this.errorMessage = "Error designing model. Please check your input or network connection.";
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
        this.errorMessage = "Error generating diagram. Please check your input or network connection.";
      } finally {
        this.isLoading = false;
      }
    },
    downloadPNG() {
      const link = document.createElement('a');
      link.href = this.imageUrl;
      link.download = `designDiagram-${this.generateUUID()}.png`; // 添加 UUID 到文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    generateUUID() { // 生成 UUID 的函数
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
    updateDesignButton() {
      if (!this.domainDescription) {
        this.hasDesign = false;
      } else {
        this.hasDesign = true;
      }
    },
    clearDesign() {
      this.domainDescription = '';
      this.userInput = '';
      this.designExplanation = null;
      this.imageUrl = null;
      this.errorMessage = null;
      this.isLoading = false;
      this.isDesigning = false;
    },
  }  
};
</script>

<style>
.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

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

.input-container {
  display: flex;
  gap: 2rem;
  width: 100%;
  max-width: 800px; /* 调整最大宽度 */
}

.input-group {
  flex: 1; /* 使两个 input-group 平分宽度 */
  margin-bottom: 1rem;
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.requirement-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  font-family: 'Courier New', monospace; 
}

.plantuml-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  font-family: 'Georgia', monospace; 
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

.designing-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #f3f3f3;
  border-radius: 50%;
  border-top: 5px solid #3498db;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.explanation-container {
  width: 100%;
  max-width: 800px;  /* 调整最大宽度 */
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

.diagram-container {
  margin-top: 2rem;
  text-align: center;
  width: 100%;
  max-width: 800px; /* 调整最大宽度 */
}

.diagram-image {
  max-width: 100%;
  height: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button.download {
  background-color: #2196F3;
  color: white;
  margin-top: 1rem;
}

.error-message {
  color: red;
  font-weight: bold;
  margin-top: 2rem;
}
</style>

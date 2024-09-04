<template>
    <div class="container">
      <h2 class="title">AI-Powered Sequence Diagram Generator</h2>
      <p class="description">
        Visualize your system interactions with ease using our AI-powered sequence diagram generator! 
        Describe the sequence of events in natural language, and our tool will automatically generate a PlantUML sequence diagram. 
        Customize the generated code for even more precise representation of your system's behavior. 
      </p>
  
      <div class="input-container">
        <div class="input-group">
          <label for="domainInput" class="label">Sequence Diagram Requirements:</label>
          <textarea 
            id="domainInput" 
            v-model="domainDescription" 
            :placeholder="inputSample"
            class="requirement-textarea"
            rows="12"
          ></textarea>
        </div>
  
        <div class="input-group">
          <label for="plantumlInput" class="label">Edit PlantUML code directly if needed:</label>
          <textarea 
            id="plantumlInput" 
            v-model="userInput" 
            :placeholder="umlSample"
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
        inputSample: `Describe your sequence diagram requirements in natural language. For example: 
  The user sends a login request to the system. The system checks the user's credentials. If the credentials are valid, the system returns a success response. Otherwise, the system returns an error response.`,
        umlSample: `@startuml
    actor User
    participant System
  
    User -> System: Login Request
    activate System
    System -> System: Check Credentials
    alt Credentials are valid
      System -> User: Success Response
    else Credentials are invalid
      System -> User: Error Response
    end
    deactivate System
  @endtuml`,
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
            const response = await fetch('/api/generate-sequenceDiagramUml', { // 修改 API 路径
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
            link.download = `designSequenceDiagram-${this.generateUUID()}.png`; // 添加 UUID 到文件名
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
    padding: 1rem;  /* 减少内边距 */
    font-family: sans-serif;
    width: 70%
    }

    .title {
    font-size: 2rem;
    margin-bottom: 2rem;
    }

    .input-container {
    display: flex;
    gap: 3rem;  /* 增加间距 */
    width: 100%;
    max-width: 1200px; /* 增加最大宽度 */
    }

    .input-group {
    flex: 1 1 400px; /* 设置最小宽度并允许扩展 */
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

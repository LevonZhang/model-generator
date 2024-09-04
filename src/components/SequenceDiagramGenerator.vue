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
  import { generateUUID } from '@/utils/common.js'; // 引入公共函数
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

</style>

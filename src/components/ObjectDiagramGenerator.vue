<template>
  <div class="container">
    <div class="input-container">
      <div class="input-group">
        <label for="domainInput" class="label">Domain Requirements:</label>
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
      inputSample: `Describe your domain requirements in natural language. For example: 
I need a model for customers and their addresses. Customers can be either individuals or businesses. Individual customers have a name and gender, while businesses have a company code.
Each customer can have one or more addresses, which include information like state, city, street, and details.`,
      umlSample: `@startuml
  class Customer {
  - customerId: Long
  + addAddress(address: Address): void
} 

class Individual extends Customer {
  - firstName: String
  - lastName: String
  - gender: Gender
  + getFullName(): String
} 

class Business extends Customer {
  - companyCode: String
  - companyName: String
  + getContactName(): String
} 

class Address {
  - street: String
  - city: String
  - state: String
  - details: String 
}

Customer "1" *--> "1..*" Address : addresses

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
        const response = await fetch('/api/generate-objectDiagramUml', {
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

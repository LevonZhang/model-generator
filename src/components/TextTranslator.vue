<template>
  <div class="container">
    <div class="translator">
      <div class="input-area">
        <label for="input-text">Text to Translate:</label>
        <div v-html="inputText" contenteditable="true" @input="onInputTextChange"></div> 
      </div>
      <div class="output-area">
        <!-- <div class="language-selector"> -->
          <select id="target-language" v-model="targetLanguage">
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="es">Spanish</option>
            <option value="ja">Japanese</option>
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="zh-TW">Chinese (Traditional)</option>
          </select>
        <!-- </div> -->
        <div v-html="outputText" contenteditable="false"></div>
      </div>
    </div>
    <button @click="translateText">Translate</button>
    <div v-if="isDesigning" class="designing-message">
      <div class="loader"></div>
      <p>Translating...</p>
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
      inputText: '',
      outputText: '',
      targetLanguage: 'zh-CN', // Default target language
      isDesigning: false,
      errorMessage: null,
    };
  },
  methods: {
    onInputTextChange(event) {
      this.inputText = event.target.innerHTML;
    },
    translateText() {
      if (this.inputText.trim() === '') { // Check if input is empty
        return; // If empty, do nothing and return
      }
      this.isDesigning = true; // Show loading message
      this.errorMessage = null;
      fetch('/api/text-translator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textToTranslate: this.inputText,
          targetLanguage: this.targetLanguage
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json(); 
      })
      .then(data => {
        this.outputText = data.translatedText;
      })
      .catch(error => {
        console.error('Translation error:', error);
        this.errorMessage = "Error during translate. Please check your input or network connection.";
        // Handle translation error (e.g., display an error message)
      })
      .finally(() => {
        this.isDesigning = false; // Hide loading message
      });
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.translator {
  display: flex;
  width: 80%;
  margin-bottom: 20px;
}

.translator > div {
  flex-grow: 1; /* Allow text areas to grow to fill available space */
}

.input-area,
.output-area {
  width: 50%;
  padding: 10px;
  border: 1px solid #ddd;
  margin: 0 10px;
  box-sizing: border-box;
  min-height: 400px; /* Adjust as needed */
}

.language-selector {
  margin-bottom: 10px;
}

.language-selector label,
.input-area label,
.output-area label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.language-selector select {
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.translator > div {
  height: 300px; /* Adjust height as needed */
}

.translator > div div {
  height: 100%;
  overflow-y: auto;
}
</style>
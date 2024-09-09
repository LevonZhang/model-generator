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
      if (this.inputText.trim() === '') {
        return;
      }
      this.isDesigning = true;
      this.errorMessage = null;

      const chunkSize = 1000; // Define chunk size here
      const textChunks = this.splitTextIntoChunks(this.inputText, chunkSize);
      const translatedChunks = []; // Array to store translated chunks

      // Translate each chunk sequentially
      textChunks.forEach(async (chunk, index) => {
        try {
          const response = await fetch('/api/text-translator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              textToTranslate: chunk,
              targetLanguage: this.targetLanguage
            })
          });

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          response.text().then(data => {
            translatedChunks[index] = { index: index, translatedText: data }; // Store translated chunk with index

            // Check if all chunks have been translated
            if (translatedChunks.length === textChunks.length) {
              let fullText = translatedChunks.sort((a, b) => a.index - b.index).map(chunk => chunk.translatedText).join(''); // Combine in order
              this.outputText = fullText
              this.isDesigning = false;
            }
          });
        } catch (error) {
          console.error('Translation error:', error);
          this.errorMessage = "Error during translate. Please check your input or network connection.";
          this.isDesigning = false;
        }
      });
    },

    splitTextIntoChunks(htmlString, maxChunkSize ) {
      const chunks = [];
      let currentChunk = "";
      let tagStack = []; 

      const isTagStart = (char) => char === "<";
      const isTagEnd = (char) => char === ">";
      const isSentenceEnd = (char) => /[.!?;]/.test(char); // 判断是否是句子结束符号

      for (let i = 0; i < htmlString.length; i++) {
        const char = htmlString[i];

        currentChunk += char;

        if (isTagStart(char)) {
          tagStack.push(char); 
        } else if (isTagEnd(char)) {
          tagStack.pop();
        }

        // 检查是否可以拆分，需要在句子结束后
        if (
          currentChunk.length >= maxChunkSize &&
          tagStack.length === 0 && 
          !isTagStart(htmlString[i + 1]) &&
          isSentenceEnd(htmlString[i]) // 确保在句子结束符号处拆分
        ) {
          chunks.push(currentChunk);
          currentChunk = "";
        }
      }

      // 处理剩余内容
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }

      console.log(chunks);

      return chunks;
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

.input-area,
.output-area {
  display: flex; /* Use flexbox to manage height */
  flex-direction: column; 
  width: 48%;
  padding: 10px;
  border: 1px solid #ddd;
  margin: 0 10px;
  box-sizing: border-box;
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

.input-area > div,
.output-area > div { /* Target the inner div */
  flex-grow: 1;  /* Allow the div to grow */
  min-height: 400px; /* Set a minimum height */
  height: 450px; /* Set a fixed height */
  padding: 10px;
  border: 1px solid #ddd;
  overflow-y: auto; /* Add scrollbar if needed */
}
</style>
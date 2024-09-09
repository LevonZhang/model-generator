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

      const chunkSize = 800;
      const textWithIndex = this.extractTextAndIndex(this.inputText); 
      console.log(textWithIndex)
      const textChunks = this.chunkText(textWithIndex, chunkSize);
      onsole.log(textChunks)
      const translatedChunks = [];

      textChunks.forEach(async (chunk, index) => {
        try {
          const textToTranslate = chunk.map(item => item.text).join(''); 
          const response = await fetch('/api/text-translator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              textToTranslate,
              targetLanguage: this.targetLanguage
            })
          });

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          response.text().then(data => {
            // Check if the chunk has a sub-index
            if (index.includes('-')) {
              // Chunk has a sub-index, so update the translatedChunks array
              const [originalIndex, subIndex] = index.split('-');
              if (!translatedChunks[originalIndex]) {
                translatedChunks[originalIndex] = []; // Initialize the array for this index if it doesn't exist
              }
              translatedChunks[originalIndex][subIndex] = data; // Store the translated text at the sub-index
            } else {
              // Chunk does not have a sub-index, so directly store the translated text
              translatedChunks[index] = data;
            }

            // Check if all chunks have been translated
            if (translatedChunks.length === textChunks.length) {
              const translatedHTML = this.buildTranslatedHTML(translatedChunks, textWithIndex);
              this.outputText = translatedHTML;
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

    // Function to extract text and create an index
    extractTextAndIndex(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const textWithIndex = [];
      let currentIndex = 0;

      function traverse(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue.trim(); // Trim whitespace
          if (text) {
            textWithIndex.push({ index: currentIndex, text: text });
            currentIndex++;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          textWithIndex.push({ index: currentIndex, text: `<${node.tagName.toLowerCase()}${getAttributes(node)}>` });
          currentIndex++;

          for (let child of node.childNodes) {
            traverse(child);
          }

          textWithIndex.push({ index: currentIndex, text: `</${node.tagName.toLowerCase()}>` });
          currentIndex++;
        }
      }

      function getAttributes(node) {
        const attrs = [];
        for (let attr of node.attributes) {
          attrs.push(`${attr.name}="${attr.value}"`);
        }
        return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
      }

      for (let child of doc.body.childNodes) {
        traverse(child);
      }

      return textWithIndex;
    },

    // Function to chunk the extracted text
    chunkText(textWithIndex, chunkSize = 800) {
      const chunks = [];
      let currentChunk = [];
      let currentChunkSize = 0;

      textWithIndex.forEach((item, index) => {
        if (item.text.length > chunkSize) {
          // Split the item into sub-chunks
          const subChunks = this.splitItemIntoChunks(item, chunkSize);
          subChunks.forEach((subChunk, subIndex) => {
            // Create a new sub-item with the original index and sub-index
            const subItem = {
              index: `${index}-${subIndex}`, // Create a combined index
              text: subChunk
            };
            currentChunk.push(subItem);
            currentChunkSize += subChunk.length;

            if (currentChunkSize >= chunkSize) {
              chunks.push(currentChunk);
              currentChunk = [];
              currentChunkSize = 0;
            }
          });
        } else {
          // Add the item to the current chunk
          currentChunk.push(item);
          currentChunkSize += item.text.length;

          if (currentChunkSize >= chunkSize) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentChunkSize = 0;
          }
        }
      });

      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }

      return chunks;
    },

    // Helper function to split an item into chunks
    splitItemIntoChunks(item, chunkSize) {
      const subChunks = [];
      let currentChunk = '';
      let currentChunkSize = 0;

      for (let i = 0; i < item.text.length; i++) {
        if (currentChunkSize + 1 >= chunkSize) {
          subChunks.push(currentChunk);
          currentChunk = '';
          currentChunkSize = 0;
        }
        currentChunk += item.text[i];
        currentChunkSize++;
      }

      if (currentChunkSize > 0) {
        subChunks.push(currentChunk);
      }

      return subChunks;
    },

    buildTranslatedHTML(translatedChunks, originalTextWithIndex) {
      let translatedHTML = '';
      translatedChunks.forEach((chunk, index) => {
        // Handle cases with sub-indices
        if (Array.isArray(chunk)) {
          chunk.sort((a, b) => a.index - b.index).forEach((subChunk) => {
            const originalItem = originalTextWithIndex.find(item => item.index === subChunk.index);
            if (originalItem) {
              translatedHTML += subChunk.translatedText;
            }
          });
        } else {
          // Handle cases without sub-indices
          const originalItem = originalTextWithIndex.find(item => item.index === index);
          if (originalItem) {
            translatedHTML += chunk;
          }
        }
      });
      return translatedHTML;
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
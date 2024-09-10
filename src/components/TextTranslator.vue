<template>
  <div class="container">
    <div class="translator">
      <div class="input-area">
        <label for="input-text">Text to Translate:</label>
        <div ref="inputText" v-html="inputText" contenteditable="true" @input="onInputTextChange"></div> 
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
        <div ref="outputText" v-html="outputText" contenteditable="false"></div>
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
  mounted() {
    this.$refs.inputText.addEventListener('scroll', this.syncScroll);
    this.$refs.outputText.addEventListener('scroll', this.syncScroll);
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

      const { textWithIndex, htmlTags } = this.extractTextAndIndex(this.inputText);
      const translatedChunks = [];
      const apiChunkSize = 1000; // API 的字数限制

      // 将文本块分成多个符合 API 字数限制的请求
      let currentApiChunk = [];
      let currentApiChunkSize = 0;
      let currentChunkIndex = 0; // 当前块的索引

      // 直接使用 textWithIndex 来进行处理
      textWithIndex.forEach((item, index) => {
        // 如果当前项的大小超过限制，则单独进行处理
        if (item.text.length >= apiChunkSize) {
          // 将当前项拆分成多个子项
          const subItems = this.splitItemIntoChunks(item, apiChunkSize);
          subItems.forEach((subItem, subIndex) => {
            // 将子项添加到当前 API 块中
            currentApiChunk.push({
              index: `${index}-${subIndex}`, // 添加子索引
              text: subItem
            });
            currentApiChunkSize += subItem.length;

            // 如果当前 API 块的大小超过限制，则发送请求
            if (currentApiChunkSize >= apiChunkSize) {
              this.translateApiChunk(currentApiChunk, translatedChunks, index).then(() => {
                // 检查是否所有块都已翻译
                if (translatedChunks.length === textWithIndex.length) {
                  const translatedHTML = this.buildTranslatedHTML(
                    translatedChunks,
                    htmlTags
                  );
                  this.outputText = translatedHTML;
                  this.isDesigning = false;
                }
              });
              // 重置当前 API 块
              currentApiChunk = [];
              currentApiChunkSize = 0;
              currentChunkIndex++; // 更新当前块的索引
            }
          });
        } else {
          // 将 item 添加到当前 API 块中
          currentApiChunk.push(item);
          currentApiChunkSize += item.text.length;

          // 如果当前 API 块的大小超过限制，则发送请求
          if (currentApiChunkSize >= apiChunkSize) {
            this.translateApiChunk(currentApiChunk, translatedChunks, currentChunkIndex).then(() => {
              // 检查是否所有块都已翻译
              if (translatedChunks.length === textWithIndex.length) {
                const translatedHTML = this.buildTranslatedHTML(
                  translatedChunks,
                  htmlTags
                );
                this.outputText = translatedHTML;
                this.isDesigning = false;
              }
            });
            // 重置当前 API 块
            currentApiChunk = [];
            currentApiChunkSize = 0;
            currentChunkIndex++; // 更新当前块的索引
          }
        }
      });

      // 如果最后一块没有超过限制，则发送请求
      if (currentApiChunk.length > 0) {
        this.translateApiChunk(currentApiChunk, translatedChunks, currentChunkIndex).then(() => {
          // 检查是否所有块都已翻译
          if (translatedChunks.length === textWithIndex.length) {
            const translatedHTML = this.buildTranslatedHTML(
              translatedChunks,
              htmlTags
            );
            this.outputText = translatedHTML;
            this.isDesigning = false;
          }
        });
      }
    },

    // 翻译单个 API 块
    async translateApiChunk(chunk, translatedChunks) {
      try {
        // 拼接块中的文本内容，并用索引编号区分
        const textToTranslate = JSON.stringify(chunk.map(item => ({ index: item.index, translatedText: item.text })));
        let response;
        let retryCount = 0;
        const maxRetries = 5; // 最大重试次数
        let translateError = false
        while (retryCount < maxRetries) {
          response = await fetch('/api/text-translator', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              textToTranslate,
              targetLanguage: this.targetLanguage
            })
          });

          if (response.ok) {
            break; // 请求成功，退出循环
          } else {
            console.error(`API request failed with status ${response.status}, retrying...`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒后重试
          }
        }

        if (retryCount >= maxRetries) {
          translateError = true
          // 超过最大重试次数，直接使用原始文本
          console.error("Maximum retries reached, using original text.");
          chunk.forEach(item => {
            translatedChunks.push({
              index: item.index,
              translatedText: item.text
            });
          });
          return; // 退出函数
        }

        const data = await response.json();
        // 处理翻译结果
        data.forEach(item => {
          // 将翻译后的文本存储到 translatedChunks 中
          const [index, subIndex] = item.index.split('-');
          if (subIndex) {
            // 如果有子索引，则合并翻译结果
            const existingIndex = translatedChunks.findIndex(chunk => chunk.index === index);
            if (existingIndex !== -1) {
              // 如果已存在该索引，则将翻译结果追加到对应索引的字符串中
              translatedChunks[existingIndex].translatedText += item.translatedText;
            } else {
              // 如果不存在该索引，则创建一个新的对象并添加到数组中
              translatedChunks.push({
                index: index,
                translatedText: item.translatedText
              });
            }
          } else {
            // 如果没有子索引，则直接存储翻译结果
            translatedChunks.push({
              index: index,
              translatedText: item.translatedText
            });
          }
        });
      } catch (error) {
        console.error('Translation error:', error);
        this.errorMessage = "Error during translate. Please check your input or network connection.";
      }
    },

    // Function to extract text and create an index
    extractTextAndIndex(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const textWithIndex = []; // 存储需要翻译的文本和索引
      const htmlTags = []; // 存储 HTML 标签和索引
      let currentIndex = 0;

      function traverse(node, parentIndex = null) {
        let tagName=null
        if(node.tagName){
          tagName = node.tagName.toLowerCase()
        }
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.nodeValue.trim(); // 去除空格
          let htmlTag = {
            index: currentIndex,
            tagName: tagName, // 添加原始标签
            text: text, // 直接添加数字内容到 htmlTags
            isTranslated: false // 设置为不翻译
          };
          // 检查文本是否完全由数字、逗号和句点组成
          if (text && /^[0-9.,]+$/.test(text) === false) {
            // 对文本进行转义处理
            // const escapedText = text.replace(/\n/g, '\\n'); // 将回车符转换为 \n
            textWithIndex.push({ index: currentIndex, text: text });
            htmlTag.isTranslated = true;
          }
          currentIndex++;
          return htmlTag; // 返回当前的 htmlTag 对象
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // 将 HTML 标签存储到 htmlTags 数组中
          tagName = `<${node.tagName.toLowerCase()}${getAttributes(node)}>`;
          let endTag= `</${node.tagName.toLowerCase()}>`
          const htmlTag = {
            index: currentIndex,
            tagName: tagName, // 添加原始标签
            endTag: endTag,
            isTranslated: false, // 设置为不翻译
            children: [] // 初始化子节点数组
          };
          currentIndex++;

          for (let child of node.childNodes) {
            let childTag = traverse(child, currentIndex); // 将当前索引传递给子节点
            htmlTag.children.push(childTag);
          }
          currentIndex++;
          return htmlTag; // 返回当前的 htmlTag 对象
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
        let nodeTag = traverse(child);
        htmlTags.push(nodeTag);
      }

      return { textWithIndex, htmlTags }; // 返回两个数组
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

    buildTranslatedHTML(translatedChunks, htmlTags) {
      let translatedHTML = '';

      function traverseHTML(tagItem, translatedChunks) {
        // 处理当前节点
        if(tagItem.tagName){
            translatedHTML += tagItem.tagName
        }
        if (tagItem.isTranslated) {
          // 查找对应的翻译内容
          const matchingChunks = translatedChunks.filter(
            chunk => parseInt(chunk.index) === tagItem.index
          );

          if (matchingChunks.length > 0) {
            // 如果找到匹配的翻译内容，则将其插入到 translatedHTML 中
            translatedHTML += matchingChunks.map(chunk => chunk.translatedText).join('');
          }
        } else if(tagItem.text){
          translatedHTML += tagItem.text;
        }
        if(tagItem.tagName){
            translatedHTML += tagItem.endTag
        }

        // 递归处理子节点
        if (tagItem.children) {
          tagItem.children.forEach(child => {
            traverseHTML(child, translatedChunks);
          });
        }
      }
      htmlTags.forEach(tag=>{
        traverseHTML(tag,translatedChunks); // 从根节点开始递归处理
      })
      
      return translatedHTML;
    },

    syncScroll(event) {
      // 获取当前滚动的元素
      const targetElement = event.target;
      // 获取另一个元素
      const otherElement = targetElement === this.$refs.inputText ? this.$refs.outputText : this.$refs.inputText;

      // 同步滚动位置
      otherElement.scrollTop = targetElement.scrollTop;
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
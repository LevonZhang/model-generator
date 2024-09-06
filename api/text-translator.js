// api/text-translator.js

module.exports = async (req, res) => {
    try {
      const MODEL_NAME = "gemini-1.5-pro-latest";
      const { GoogleGenerativeAI, FunctionDeclarationSchemaType } = await import('@google/generative-ai');
  
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); 
  
      const targetLanguage = req.body.targetLanguage || 'en'; // Get target language from request
      const textToTranslate = req.body.textToTranslate; // Get text to translate
  
      const chunkSize = 3000; // Set the chunk size for translation
  
      let translatedText = '';
  
      // Split text into chunks and translate each chunk
      for (let i = 0; i < textToTranslate.length; i += chunkSize) {
        const chunk = textToTranslate.slice(i, i + chunkSize);
  
        const sys_prompt = `Translate the following text into ${targetLanguage}, preserving any formatting like paragraph breaks, line breaks, and lists: \n\n${chunk}`;
  
        const schema = {
          description: "Objects containing translated text",
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            translatedText: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "Translated text",
              nullable: false,
            },
          },
          required: ["translatedText"],
        };  
  
        const generationConfig = {
          response_mime_type:'application/json',
          responseSchema: schema,
        }
  
        const model = genAI.getGenerativeModel({
          model: MODEL_NAME,
          systemInstruction: {
            parts: [{ text: sys_prompt }],
            role:"model"
          },
          generationConfig: generationConfig,
        });  
  
        const result = await model.generateContent(''); // Generate content with empty prompt since systemInstruction contains the prompt
  
        if(result.response.promptFeedback && result.response.promptFeedback.blockReason) {   
          return { error: `Blocked for ${result.response.promptFeedback.blockReason}` };
        }
        let text = result.response.text();
        translatedText += JSON.parse(text).translatedText; 
      }
  
      res.status(200).json({ translatedText }); 
    } catch (error) {
      console.error("Error translating text:", error);
      res.status(500).send("Error translating text");
    }
  };
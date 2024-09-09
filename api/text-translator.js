// api/text-translator.js

module.exports = async (req, res) => {
  try {
    const MODEL_NAME = "gemini-1.5-pro-latest";
    const { GoogleGenerativeAI, FunctionDeclarationSchemaType } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); 

    const targetLanguage = req.body.targetLanguage || 'en'; 
    const textToTranslate = req.body.textToTranslate; 

    const sys_prompt = `Translate the given JSON array of objects into ${targetLanguage}.

                        **Formatting instructions:**
                        - Do not add any extra line breaks, markdown formatting, numbering, or any other special formatting. 
                        - Preserve all original formatting, including spaces, line breaks, and special characters such as tabs.
                        - Return a JSON array without any additional formatting.
                        - Ensure that each object in the array includes the original "index" and the "translatedText" attribute, where the "translatedText" is replaced by the translated text.
                        - **Translate ALL objects in the JSON array, and do NOT only return the first object.** 
                        - Make sure the output is a complete and valid JSON array, and each object is processed from start to finish.
                        
                        Please translate the following JSON array of objects, replacing the "translatedText" in each object with the translated version, and return the entire updated JSON array:
                        ${textToTranslate}`;
    
                          
        const schema = {
          description: "Objects containing translated text",
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            index: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "index",
              nullable: false,
            },
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
        responseSchema: list[schema],
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
      console.log(text)
      res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error("Error translating text:", error);
    res.status(500).send("Error translating text");
  }
};
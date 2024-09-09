// api/text-translator.js

module.exports = async (req, res) => {
  try {
    const MODEL_NAME = "gemini-1.5-pro-latest";
    const { GoogleGenerativeAI, FunctionDeclarationSchemaType } = await import('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); 

    const targetLanguage = req.body.targetLanguage || 'en'; 
    const textToTranslate = req.body.textToTranslate; 

    const sys_prompt = `Translate the following text into ${targetLanguage}, 
                          and directly return translated result, do NOT wrap the returned results in any marks!
                          
                          **Formatting instructions:**
                          - Do not add any extra line breaks, markdown formatting, numbering, or any other special formatting. 
                          - Please preserving all original formatting, including spaces, line breaks, and special characters such as tabs.
                          - Directly return a JSON array without any additional formatting. 
                          - The returned JSON array must strictly adhere to the following JSON format, each object in array must include index, translation.  It is absolutely forbidden to return only the translated text directly.
                          - Make sure the output is a complete and valid JSON array.
                          
                          Only return the result in the following JSON format,replace translation value with the translated text :
                          [
                            {"index": "0", "translatedText": "Translated text 1"},
                            {"index": "1-1", "translatedText": "Translated text 1-1"}
                          ]
                            
                          Please translate the following texts:
                          ${textToTranslate}
                          `;

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
      res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error("Error translating text:", error);
    res.status(500).send("Error translating text");
  }
};
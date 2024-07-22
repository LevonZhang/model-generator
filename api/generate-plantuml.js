// api/generate-plantuml.js

module.exports = async (req, res) => {
    try {
      const MODEL_NAME = "gemini-1.5-pro-latest";
      // 使用 dynamic import() 导入 Google Generative AI
      const { GoogleGenerativeAI, FunctionDeclarationSchemaType} = await import('@google/generative-ai');
  
      // 初始化 Google Gemini API 客户端
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

      const sys_prompt = `你是一个领域建模专家，精通 PlantUML 类图设计。你的任务是根据用户的领域需求描述，根据Schema要求生成一个 JSON格式的 响应，
                        其中plantuml_code是生成的PlantUML类图设计源代码，design_explanation是设计的中文简要说明。
                        请根据用户输入的要求进行设计，并按照上述格式生成 JSON 响应。`

        const schema = {
          description: "包含 PlantUML 代码和设计说明的对象",
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            plantuml_code: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "符合 PlantUML 语法的类图代码",
              nullable: false,
            },
            design_explanation: {
              type: FunctionDeclarationSchemaType.STRING,
              description: "中文的设计简要说明",
              nullable: false,
            },
          },
          required: ["plantuml_code", "design_explanation"],
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
    
      // 获取用户输入的领域需求描述
      const requestText = req.body.domain_description;
      const result = await model.generateContent(requestText);  

      if(result.response.promptFeedback && result.response.promptFeedback.blockReason) {   
        return { error: `Blocked for ${result.response.promptFeedback.blockReason}` };
      }
      let text = result.response.text();
      console.log(text);
      res.status(200).json(JSON.parse(text));
    } catch (error) {
      console.error("Error generating PlantUML code:", error);
      res.status(500).send("Error generating PlantUML code");
    }
  };
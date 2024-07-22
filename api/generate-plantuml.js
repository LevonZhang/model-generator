// api/generate-plantuml.js

module.exports = async (req, res) => {
    try {
      const MODEL_NAME = "gemini-1.5-pro-latest";
      // 使用 dynamic import() 导入 Google Generative AI
      const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = await import('@google/generative-ai');
  
      // 初始化 Google Gemini API 客户端
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

      const sys_prompt = `你是一个领域建模专家，精通 PlantUML 类图设计。你的任务是根据以下领域需求描述，生成一个 JSON 响应，格式如下：
                        {
                          "plantuml_code": "生成的 PlantUML 代码",
                          "design_explanation": "中文的设计简要说明"
                        }

                        请注意：
                        - 只包含基于领域需求描述的 PlantUML 代码和设计说明。
                        - 只生成 PlantUML 类图代码，不要生成数据库设计或Python、Java等其他编程语言的代码。

                        ## PlantUML 示例：

                        \`\`\`plantuml
                        @startuml
                        class Car
                        @enduml
                        \`\`\`

                        \`\`\`plantuml
                        @startuml
                        class User {
                          - name: string
                          - age: int
                        }
                        @enduml
                        \`\`\`

                        \`\`\`plantuml
                        @startuml
                        class Author {
                          - name: string
                        }
                        class Book {
                          - title: string
                        }
                        Author "1" -- "*" Book : writes
                        @enduml
                        \`\`\`

                        根据上述要求生成 JSON 响应。`

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
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
        response_mime_type:'application/json',
        responseSchema: schema,
      }

      // const model = genAI.getGenerativeModel({ model: MODEL_NAME,
      //   systemInstruction: {
      //     parts: [{ text: sys_prompt }],
      //     role:"model"
      //   }});

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
      let text = result.response.candidates[0].content.parts[0].text;
      console.log(JSON.parse(text));
      res.status(200).json(JSON.parse(text));
    } catch (error) {
      console.error("Error generating PlantUML code:", error);
      res.status(500).send("Error generating PlantUML code");
    }
  };
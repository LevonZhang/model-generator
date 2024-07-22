// api/generate-plantuml.js

module.exports = async (req, res) => {
    try {
      // 获取用户输入的领域需求描述
      const prompt = req.body.domain_description;
  
      // 使用 dynamic import() 导入 Google Generative AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
      // 初始化 Google Gemini API 客户端
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

      const sys_prompt = `You are a domain modeling expert and proficient in PlantUML class diagram design. Your task is to generate a JSON response containing two fields:

        1. \`plantuml_code\`: Contains ONLY the PlantUML code that represents the class diagram based on the following domain requirements description. Please refer to the PlantUML examples below for guidance on syntax and structure.
        2. \`design_explanation\`: Contains a concise explanation of the design in Chinese.

        Do NOT include any additional introductions, or code in other programming languages.

        ## PlantUML Examples:

        \`\`\`
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
        `;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",
        system_instruction: sys_prompt, });
  
      // 调用 Google Gemini API 生成 PlantUML 代码
      const result = await model.generateContent( prompt);
      console.log(JSON.stringify(result.response.text(), null, 2));
      // 返回生成的 PlantUML 代码
      res.status(200).json(result.response.text());
  
    } catch (error) {
      console.error("Error generating PlantUML code:", error);
      res.status(500).send("Error generating PlantUML code");
    }
  };
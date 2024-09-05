// api/generate-plantuml.js

module.exports = async (req, res) => {
    try {
      const MODEL_NAME = "gemini-1.5-pro-latest";
      // 使用 dynamic import() 导入 Google Generative AI
      const { GoogleGenerativeAI, FunctionDeclarationSchemaType} = await import('@google/generative-ai');
  
      // 初始化 Google Gemini API 客户端
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

      const existingPlantUML = req.body.plantuml_code || ""; // 获取已设计的 PlantUML 代码
      let sys_prompt = `You are a domain modeling expert and proficient in PlantUML class diagram design. Your task is to generate a JSON formatted response based on the user's domain requirements description and the provided Schema.
                        The response should include:
                        1. plantuml_code: the generated PlantUML class diagram source code
                        2. design_explanation: a brief explanation of the design.
                        Note: All content should be in English, regardless of the language of the user's input.
                        Note: Please follow the Domain Driven Design (DDD) pattern in your class diagram design. 
                        Please utilize value objects whenever possible, employ interfaces with clear intentions and no side effects.
                        Please strive to use directional arrows to indicate the direction of relationships between classes, specify cardinality, and mark aggregation or composition relationships where applicable. 
                        For example: Customer "1" *--> "1..*" CustomerAccount : accounts, 
                        where the * in *--> represents aggregation relationship, --> represents a line with an arrow, 
                        "1" represents the cardinality constraint that a CustomerAccount belongs to one Customer, 
                        and "1..*" represents that one Customer can have multiple CustomerAccounts, 
                        and accounts represents the relation name between Customer and CustomerAccount. 
                        Include class methods in the design whenever possible.
                        Generate the JSON response according to the format described above.`
      
      if (existingPlantUML) {
        sys_prompt += `\n\nBased on the existing PlantUML code below, please modify the design according to the domain requirement description entered by the user:\n\n\`\`\`plantuml\n${existingPlantUML}\n\`\`\`\n`;
      } else {
        sys_prompt += "\n\nPlease create a new design based on the domain requirements description entered by the user and";
      }
  
      sys_prompt += "Generate a JSON response in the above format."; 

      const schema = {
        description: "Objects containing PlantUML code and design descriptions",
        type: FunctionDeclarationSchemaType.OBJECT,
        properties: {
          plantuml_code: {
            type: FunctionDeclarationSchemaType.STRING,
            description: "Class diagram code conforming to PlantUML syntax",
            nullable: false,
          },
          design_explanation: {
            type: FunctionDeclarationSchemaType.STRING,
            description: "Design brief",
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
      res.status(200).json(JSON.parse(text));
    } catch (error) {
      console.error("Error generating PlantUML code:", error);
      res.status(500).send("Error generating PlantUML code");
    }
  };
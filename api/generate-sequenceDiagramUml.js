// api/generate-sequenceDiagramUml.js

module.exports = async (req, res) => {
  try {
    const MODEL_NAME = "gemini-1.5-pro-latest";
    // 使用 dynamic import() 导入 Google Generative AI
    const { GoogleGenerativeAI, FunctionDeclarationSchemaType } = await import('@google/generative-ai');

    // 初始化 Google Gemini API 客户端
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    const existingPlantUML = req.body.plantuml_code || ""; // 获取已设计的 PlantUML 代码
    let sys_prompt = `You are a proficient software designer, particularly skilled in PlantUML sequence diagram creation. 
                      Your objective is to craft a JSON-formatted response encompassing a sequence diagram based on the user's provided sequence description.

                      The response should include:
                      1. **plantuml_code**: The generated PlantUML sequence diagram source code (without any surrounding markers!). The PlantUML code must be written in **English**, regardless of the user's input language. No other language should be used in the plantuml_code.
                      2. **design_explanation**: A brief explanation of the design based on the user’s input. The explanation should be numbered (1, 2, 3, …) to clearly describe each step in the sequence diagram. The language of the design_explanation should match the **user's input language**.

                      **Detailed Requirements:**
                      1. **plantuml_code**: 
                        - Start with @startuml and end with @enduml.
                        - Declare actors and participants first, then add appropriate "activate" and "deactivate" statements before and after calls.
                        - Use "->" to represent the direction of calls, and "-->" to represent the direction of returns.
                        - The PlantUML code **must be entirely in English**, even if the user’s input language is not English. 
                        - **Translate any non-English descriptions into English**.

                      2. **design_explanation**:
                        - Use the same language as the user's input. 
                        - The explanation should clearly describe each step of the sequence diagram.

                      Generate the JSON response according to the format described above.`;

    if (existingPlantUML) {
      sys_prompt += `\n\nBased on the existing PlantUML code below, please modify the design according to the sequence description entered by the user:\n\n\`\`\`plantuml\n${existingPlantUML}\n\`\`\`\n`;
    } else {
      sys_prompt += "\n\nPlease create a new design based on the sequence description entered by the user and";
    }

    sys_prompt += "Generate a JSON response in the above format.";

    const schema = {
      description: "Objects containing PlantUML code and design descriptions",
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        plantuml_code: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Sequence diagram code conforming to PlantUML syntax",
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
      response_mime_type: 'application/json',
      responseSchema: schema,
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: {
        parts: [{ text: sys_prompt }],
        role: "model"
      },
      generationConfig: generationConfig,
    });

    // 获取用户输入的领域需求描述
    const requestText = req.body.domain_description;
    const result = await model.generateContent(requestText);

    if (result.response.promptFeedback && result.response.promptFeedback.blockReason) {
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
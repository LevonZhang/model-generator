// api/generate-plantuml.js

module.exports = async (req, res) => {
    try {
      // 获取用户输入的领域需求描述
      const domainDescription = req.body.domain_description;
  
      // 使用 dynamic import() 导入 Google Generative AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
      // 初始化 Google Gemini API 客户端
      const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
      // 调用 Google Gemini API 生成 PlantUML 代码
      const response = await googleAI.generateText({
        model: "gemini-pro", // 或其他合适的模型
        prompt: `根据以下领域需求描述生成 PlantUML 代码：\n\n${domainDescription}`,
      });
  
      // 提取生成的 PlantUML 代码
      const plantumlCode = response[0].text;
  
      // 返回生成的 PlantUML 代码
      res.status(200).json({ plantuml_code: plantumlCode });
  
    } catch (error) {
      console.error("Error generating PlantUML code:", error);
      res.status(500).send("Error generating PlantUML code");
    }
  };
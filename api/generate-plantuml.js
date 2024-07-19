// api/generate-plantuml.js

module.exports = async (req, res) => {
    try {
      // 获取用户输入的领域需求描述
      const domainDescription = req.body.domain_description;
  
      // 使用 dynamic import() 导入 Google Generative AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
      // 初始化 Google Gemini API 客户端
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      const prompt=`你是一个业务领域设计专家，并且精通PlantUML的类图设计。请根据以下领域需求描述生成 PlantUML 类图源代码：\n\n${domainDescription}`
      // 调用 Google Gemini API 生成 PlantUML 代码
      const result = await model.generateContent( prompt);

      // 提取生成的 PlantUML 代码
      const plantumlCode = result.response.text();
      plantumlCode = plantumlCode.replace(/^```|```$/g, '');
  
      console.log("生成的plantumlCode:"+plantumlCode)
      // 返回生成的 PlantUML 代码
      res.status(200).json({ plantuml_code: plantumlCode });
  
    } catch (error) {
      console.error("Error generating PlantUML code:", error);
      res.status(500).send("Error generating PlantUML code");
    }
  };
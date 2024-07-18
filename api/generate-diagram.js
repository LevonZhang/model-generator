// api/generate-diagram.js

import fetch from 'node-fetch';

export default async (req, res) => { // 使用 export default 导出模块
  try {
    const response = await fetch('https://kroki.io/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`Kroki request failed: ${response.status}`);
    }

    const blob = await response.blob();
    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from(await blob.arrayBuffer()));

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error generating diagram');
  }
};
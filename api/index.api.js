import { ENV } from "../config/env.js";
import Airtable from "airtable";
import OpenAI from "openai";

const airtable = new Airtable({ apiKey: ENV.AIRTABLE_API_KEY })
  .base(ENV.AIRTABLE_BASE_ID);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { pergunta } = req.body;

    // Cloudinho respondendo via ChatGPT
    const resposta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é o Cloudinho, mascote do Varal dos Sonhos. Fale com empatia e alegria!" },
        { role: "user", content: pergunta },
      ],
    });

    // Exemplo de integração Airtable
    const records = await airtable(ENV.AIRTABLE_TABLES.cartinhas).select().firstPage();

    res.status(200).json({
      resposta: resposta.choices[0].message.content,
      cartinhas_disponiveis: records.length
    });

  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ erro: err.message });
  }
}

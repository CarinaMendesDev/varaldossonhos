// /api/conectarAirtable.js
import Airtable from "airtable";
import dotenv from "dotenv";
import path from "path";

// Em desenvolvimento carregamos o .env.local; em produção o Vercel usa variáveis de ambiente já definidas.
dotenv.config({ path: path.resolve("./config/.env.local") });

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!apiKey || !baseId) {
  console.warn("⚠️ AIRTABLE_API_KEY ou AIRTABLE_BASE_ID não definidos. Configure config/.env.local ou variáveis no Vercel.");
}

export const base = new Airtable({ apiKey }).base(baseId);

export default base;

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export class GeminiClient {
  private readonly client: GoogleGenerativeAI;

  constructor(private readonly modelName = "gemini-2.5-flash") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY 가 .env 또는 환경변수에 설정되어 있어야 합니다."
      );
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text ?? "";
  }
}

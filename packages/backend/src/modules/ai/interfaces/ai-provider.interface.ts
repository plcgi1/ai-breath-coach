export interface AiOptions {
  temperature?: number;
  systemInstruction?: string;
}

export interface AiResponse {
  text: string;
  userId: string;
  technique?: any;
  slug: string;
  score: string;
  description: string;
}

export interface AiProvider {
  generate(prompt: string, options?: AiOptions): Promise<AiResponse>;
}

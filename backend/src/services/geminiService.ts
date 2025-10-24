import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/environment';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!config.externalApis.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(config.externalApis.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Generate content using Gemini AI
   * @param prompt The prompt to send to Gemini
   * @returns The generated content
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw new Error('Failed to generate content with Gemini AI');
    }
  }

  /**
   * Generate content with streaming
   * @param prompt The prompt to send to Gemini
   * @returns AsyncGenerator that yields chunks of text
   */
  async* generateContentStream(prompt: string): AsyncGenerator<string> {
    try {
      const result = await this.model.generateContentStream(prompt);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }
    } catch (error) {
      console.error('Error generating streaming content with Gemini:', error);
      throw new Error('Failed to generate streaming content with Gemini AI');
    }
  }

  /**
   * Analyze an image using Gemini Pro Vision
   * @param imageBase64 Base64 encoded image
   * @param prompt The prompt to analyze the image
   * @returns The analysis result
   */
  async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
    try {
      const visionModel = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
      
      const image = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/png',
        },
      };
      
      const result = await visionModel.generateContent([prompt, image]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing image with Gemini:', error);
      throw new Error('Failed to analyze image with Gemini AI');
    }
  }
}

export default new GeminiService();
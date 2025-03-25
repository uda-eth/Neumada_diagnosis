// Importing Anthropic but with a conditional check 
let Anthropic: any;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch (e) {
  console.warn('Anthropic SDK not available, using fallback translation methods');
}

// Check if anthropic client can be initialized
let anthropicClient: any = null;
if (process.env.ANTHROPIC_API_KEY && Anthropic) {
  try {
    anthropicClient = new Anthropic.default({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  } catch (error) {
    console.warn('Failed to initialize Anthropic client', error);
  }
}

// Simple mock translations for common phrases
const mockTranslations: Record<string, Record<string, string>> = {
  'es': {
    'hello': 'hola',
    'how are you': 'cómo estás',
    'thank you': 'gracias',
    'what is your name': 'cuál es tu nombre',
    'welcome': 'bienvenido',
    'goodbye': 'adiós',
    'good morning': 'buenos días',
    'good afternoon': 'buenas tardes',
    'good evening': 'buenas noches',
    'yes': 'sí',
    'no': 'no',
    'please': 'por favor'
  },
  'fr': {
    'hello': 'bonjour',
    'how are you': 'comment allez-vous',
    'thank you': 'merci',
    'what is your name': 'comment vous appelez-vous',
    'welcome': 'bienvenue',
    'goodbye': 'au revoir',
    'good morning': 'bonjour',
    'good afternoon': 'bon après-midi',
    'good evening': 'bonsoir',
    'yes': 'oui',
    'no': 'non',
    'please': 's\'il vous plaît'
  }
};

function mockTranslate(text: string, targetLanguage: string): string {
  // Return the original text if target is English or not supported
  if (targetLanguage === 'en' || !['es', 'fr'].includes(targetLanguage)) {
    return text;
  }
  
  // Check if we have a direct mock translation
  const lowerText = text.toLowerCase();
  if (mockTranslations[targetLanguage][lowerText]) {
    return mockTranslations[targetLanguage][lowerText];
  }
  
  // If we don't have an exact match, append a note
  return `${text} (translation unavailable - please add API key for actual translation)`;
}

export async function translateMessage(text: string, targetLanguage: string): Promise<string> {
  // Return original text if it's already in the target language
  if (targetLanguage === 'en') {
    return text;
  }
  
  // If we have an API key and client, use the real translation service
  if (anthropicClient) {
    try {
      const response = await anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Translate the following text to ${targetLanguage}. Only provide the translation, no explanations:\n\n${text}`
        }],
      });

      // Access the text content safely from the response
      const translation = response.content[0].type === 'text' 
        ? response.content[0].text 
        : 'Translation failed';

      return translation;
    } catch (error) {
      console.error('Translation error with API:', error);
      // Fall back to mock translation if API fails
      return mockTranslate(text, targetLanguage);
    }
  } else {
    // Use mock translation when no API key is available
    console.log(`Using mock translation for ${targetLanguage}`);
    return mockTranslate(text, targetLanguage);
  }
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' }
];
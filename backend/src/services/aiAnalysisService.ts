import { GoogleGenAI } from '@google/genai';
import { geminiLimiter } from '../utils/apiRateLimiter';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const client = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Log API key status on startup (without exposing the key)
if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI analysis feature will not work.');
  console.warn('   To enable AI analysis, set GEMINI_API_KEY in Railway environment variables.');
  console.warn('   Get an API key from: https://aistudio.google.com/apikey');
} else {
  console.log('✅ GEMINI_API_KEY is configured. AI analysis is enabled.');
}

export interface CountryData {
  countryName: string;
  region?: string;
  current: {
    interestRate?: number;
    inflation?: number;
    exchangeRate?: number;
    gdpGrowth?: number;
    unemployment?: number;
    governmentDebt?: number;
    gdpPerCapita?: number;
    tradeBalance?: number;
    currentAccount?: number;
    fdi?: number;
    populationGrowth?: number;
    lifeExpectancy?: number;
    giniCoefficient?: number;
    exports?: number;
  };
  historical: {
    interest?: Array<{ date: string; value: number }>;
    inflation?: Array<{ date: string; value: number }>;
    exchange?: Array<{ date: string; value: number }>;
    gdp?: Array<{ date: string; value: number }>;
    unemployment?: Array<{ date: string; value: number }>;
    'government-debt'?: Array<{ date: string; value: number }>;
    'gdp-per-capita'?: Array<{ date: string; value: number }>;
    'trade-balance'?: Array<{ date: string; value: number }>;
    'current-account'?: Array<{ date: string; value: number }>;
    fdi?: Array<{ date: string; value: number }>;
    'population-growth'?: Array<{ date: string; value: number }>;
    'life-expectancy'?: Array<{ date: string; value: number }>;
    'gini-coefficient'?: Array<{ date: string; value: number }>;
    exports?: Array<{ date: string; value: number }>;
  };
}

function buildAnalysisPrompt(data: CountryData): string {
  const { countryName, region, current, historical } = data;

  const calculateTrend = (history: Array<{ date: string; value: number }> | undefined): string => {
    if (!history || history.length < 2) return 'insufficient data';
    const recent = history.slice(-3);
    const older = history.slice(0, Math.min(3, history.length - recent.length));
    if (recent.length === 0 || older.length === 0) return 'insufficient data';
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.value, 0) / older.length;
    if (Math.abs(olderAvg) < 0.001) return 'stable';
    const change = ((recentAvg - olderAvg) / Math.abs(olderAvg)) * 100;
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  const trends = {
    interest: calculateTrend(historical.interest),
    inflation: calculateTrend(historical.inflation),
    gdp: calculateTrend(historical.gdp),
    unemployment: calculateTrend(historical.unemployment),
    'government-debt': calculateTrend(historical['government-debt']),
  };

  return `You are an economic analyst. Analyze the economic data for ${countryName}${region ? ` (${region})` : ''} and provide insights.

CURRENT ECONOMIC INDICATORS:
- Real Interest Rate: ${current.interestRate !== undefined ? current.interestRate.toFixed(2) + '%' : 'N/A'}
- Inflation Rate: ${current.inflation !== undefined ? current.inflation.toFixed(2) + '%' : 'N/A'}
- Exchange Rate (vs USD): ${current.exchangeRate !== undefined ? current.exchangeRate.toFixed(4) : 'N/A'}
- GDP Growth: ${current.gdpGrowth !== undefined ? current.gdpGrowth.toFixed(2) + '%' : 'N/A'}
- Unemployment: ${current.unemployment !== undefined ? current.unemployment.toFixed(2) + '%' : 'N/A'}
- Government Debt (% of GDP): ${current.governmentDebt !== undefined ? current.governmentDebt.toFixed(2) + '%' : 'N/A'}
- GDP Per Capita: ${current.gdpPerCapita !== undefined ? '$' + current.gdpPerCapita.toLocaleString('en-US', { maximumFractionDigits: 0 }) : 'N/A'}
- Trade Balance (% of GDP): ${current.tradeBalance !== undefined ? current.tradeBalance.toFixed(2) + '%' : 'N/A'}
- Current Account (% of GDP): ${current.currentAccount !== undefined ? current.currentAccount.toFixed(2) + '%' : 'N/A'}
- FDI (% of GDP): ${current.fdi !== undefined ? current.fdi.toFixed(2) + '%' : 'N/A'}
- Population Growth: ${current.populationGrowth !== undefined ? current.populationGrowth.toFixed(2) + '%' : 'N/A'}
- Life Expectancy: ${current.lifeExpectancy !== undefined ? current.lifeExpectancy.toFixed(1) + ' years' : 'N/A'}
- Gini Coefficient: ${current.giniCoefficient !== undefined ? current.giniCoefficient.toFixed(2) : 'N/A'}
- Exports (% of GDP): ${current.exports !== undefined ? current.exports.toFixed(2) + '%' : 'N/A'}

HISTORICAL TRENDS (last 5-10 years):
- Real Interest Rate: ${trends.interest}
- Inflation: ${trends.inflation}
- GDP Growth: ${trends.gdp}
- Unemployment: ${trends.unemployment}
- Government Debt: ${trends['government-debt']}

Provide a concise economic analysis (2-3 paragraphs) that:
1. Explains the overall economic health based on current indicators
2. Identifies key relationships between indicators (e.g., why real interest rate is negative if inflation is high)
3. Explains the patterns visible in the historical charts (why trends are increasing/decreasing/stable)
4. Highlights any notable economic characteristics or concerns

Focus on data-driven insights using ONLY the provided indicators. Be specific about numbers and trends. Keep it professional and educational.`;
}

async function callModelWithRetry(prompt: string): Promise<string> {
  if (!client) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY environment variable in Railway.');
  }

  // Try pro first (more reliable), then flash
  // Updated model names for @google/genai v1.34.0
  const models = ['gemini-1.5-pro', 'gemini-1.5-flash'];
  
  console.log(`Attempting AI analysis with models: ${models.join(', ')}`);
  const maxAttempts = 4;
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  for (const model of models) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Wait for rate limiter before making API call
        await geminiLimiter.wait();
        
        console.log(`Trying model: ${model}, attempt: ${attempt}`);
        const result = await client.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        
        console.log(`Model ${model} response received, parsing...`);

        // Handle different response formats from Gemini API
        const resultAny = result as any;
        const text =
          (Array.isArray(resultAny.output)
            ? resultAny.output
                .map((o: any) => o?.content?.parts?.map((p: any) => p.text).join('\n'))
                .filter(Boolean)
                .join('\n')
                .trim()
            : '') ||
          (Array.isArray(resultAny.outputs)
            ? resultAny.outputs
                .map((o: any) => o.text || o.content?.parts?.map((p: any) => p.text).join('\n'))
                .filter(Boolean)
                .join('\n')
                .trim()
            : '') ||
          (Array.isArray(resultAny.candidates)
            ? resultAny.candidates
                .map((c: any) => c.content?.parts?.map((p: any) => p.text).join('\n'))
                .filter(Boolean)
                .join('\n')
                .trim()
            : '') ||
          resultAny.text ||
          '';

        if (!text) throw new Error('Empty response from Gemini');
        return text;
      } catch (error: any) {
        const msg = error?.message || '';
        const code = error?.error?.code || error?.status || '';
        console.error(`Gemini API error (model: ${model}, attempt: ${attempt}):`, {
          message: msg,
          code,
          status: error?.response?.status || error?.status,
          error: error?.error || error
        });
        
        const statusCode = error?.response?.status || error?.status || code;
        const isRetryable = 
          statusCode === 503 || // Service Unavailable
          statusCode === 429 || // Too Many Requests
          statusCode === 500 || // Internal Server Error
          /503|500|429/.test(String(code)) ||
          /overloaded|unavailable|rate.limit|quota|throttle/i.test(msg) ||
          /UNAVAILABLE|SERVICE_UNAVAILABLE/i.test(msg);
        
        // Retry with exponential backoff for retryable errors
        if (attempt < maxAttempts && isRetryable) {
          // Exponential backoff: 2s, 4s, 8s, 16s
          const backoffDelay = Math.min(2000 * Math.pow(2, attempt - 1), 16000);
          console.warn(`  Retrying in ${backoffDelay}ms... (attempt ${attempt + 1}/${maxAttempts})`);
          await sleep(backoffDelay);
          continue;
        }
        
        // If 429 (rate limit), wait longer before trying next model
        if (statusCode === 429 && attempt === maxAttempts) {
          console.warn(`  Rate limited. Waiting 10 seconds before trying next model...`);
          await sleep(10000);
        }
        
        if (attempt === maxAttempts) {
          // move to next model
          break;
        }
      }
    }
  }
  throw new Error('AI analysis failed after retries. Please try again later.');
}

export async function analyzeCountryEconomy(data: CountryData): Promise<string> {
  const prompt = buildAnalysisPrompt(data);
  return callModelWithRetry(prompt);
}

import { Client, Mortgage, BreakEvenResult, BestAvailableDeal } from '../types';

const AI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const AI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';

interface AIProvider {
  generateClientEmail(client: Client, mortgage: Mortgage, breakEven: BreakEvenResult, deal: BestAvailableDeal): Promise<{ subject: string; body: string }>;
  generateReportSummary(client: Client, mortgage: Mortgage, breakEven: BreakEvenResult): Promise<string>;
}

/**
 * Mock AI Provider - generates realistic responses without API calls
 */
class MockAIProvider implements AIProvider {
  async generateClientEmail(client: Client, mortgage: Mortgage, breakEven: BreakEvenResult, deal: BestAvailableDeal): Promise<{ subject: string; body: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const firstName = client.name.split(' ')[0];
    const savingText = breakEven.totalSavingOverRemainingTerm > 0
      ? `£${breakEven.totalSavingOverRemainingTerm.toLocaleString()}`
      : 'a reduced rate';
    
    let subject: string;
    let body: string;
    
    if (breakEven.recommendedAction === 'switch-now') {
      subject = `Good news – you could save ${savingText} by switching your ${mortgage.lender} mortgage`;
      body = `Dear ${firstName},

I've been monitoring the mortgage market for you and I've identified an opportunity worth acting on.

Your ${mortgage.lender} ${mortgage.product} is currently at ${mortgage.fixedRate}%, but I've found a better deal:

• New rate available: ${deal.rate}% (${deal.lender} ${deal.product})
• Monthly saving: £${Math.round(breakEven.monthlySaving).toLocaleString()}/month
• Early Repayment Charge: £${breakEven.ercCost.toLocaleString()}
• Break-even point: ${breakEven.monthsToBreakEven} months
• Net saving over remaining term: ${savingText}

${breakEven.ercCost > 0 ? `Even after paying the ERC of £${breakEven.ercCost.toLocaleString()}, switching puts you better off financially.` : 'With minimal ERC at this stage, switching is clearly beneficial.'}

${breakEven.recommendedAction === 'switch-now' ? 'I recommend we act promptly – this rate may not be available for long.' : ''}

Would you have 15 minutes this week for a quick call? I can have the full comparison ready within 48 hours.

Kind regards,
Mark Thompson
Independent Mortgage Advisor
RateShift UK`;
    } else if (breakEven.recommendedAction === 'wait') {
      subject = `Update on your ${mortgage.lender} mortgage – timing opportunity ahead`;
      body = `Dear ${firstName},

I wanted to give you a quick update on your ${mortgage.lender} ${mortgage.product} (currently at ${mortgage.fixedRate}%).

I've been tracking the market and while there are deals available at ${deal.rate}%, the early repayment charge of £${breakEven.ercCost.toLocaleString()} means the optimal switching window is approaching rather than right now.

Here's what I recommend:
• Wait approximately ${Math.min(3, Math.ceil(getMonthsRemaining(mortgage.endDate) / 4))} months for your ERC to reduce
• At that point, the break-even improves significantly
• Your deal expires ${new Date(mortgage.endDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}

I'll continue monitoring and alert you when the numbers work in your favour. In the meantime, if you have any questions, please don't hesitate to reach out.

Kind regards,
Mark Thompson
Independent Mortgage Advisor
RateShift UK`;
    } else {
      subject = `Your mortgage review – ${mortgage.endDate ? new Date(mortgage.endDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''} expiry planning`;
      body = `Dear ${firstName},

I'm writing to let you know I'm keeping a close eye on your ${mortgage.lender} ${mortgage.product} which is due to expire on ${new Date(mortgage.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.

At present, switching early would incur an ERC of £${breakEven.ercCost.toLocaleString()} which outweighs the available savings. However, I'm monitoring daily and will contact you as soon as:

1. Your ERC reduces to a level where switching becomes beneficial
2. Market rates drop sufficiently to create a clear saving
3. You enter the 6-month window before expiry (when you can switch penalty-free)

For now, no action is needed from you. I'll be in touch well before your expiry date with tailored options.

Kind regards,
Mark Thompson
Independent Mortgage Advisor
RateShift UK`;
    }
    
    return { subject, body };
  }

  async generateReportSummary(client: Client, mortgage: Mortgage, breakEven: BreakEvenResult): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return `## Mortgage Review Summary for ${client.name}

**Current Deal:** ${mortgage.lender} ${mortgage.product} at ${mortgage.fixedRate}%
**Outstanding Balance:** £${mortgage.balance.toLocaleString()}
**Expiry Date:** ${new Date(mortgage.endDate).toLocaleDateString('en-GB')}
**Monthly Payment:** £${mortgage.monthlyPayment.toLocaleString()}

### Break-Even Analysis

${breakEven.explanation}

**Key Figures:**
- ERC Cost: £${breakEven.ercCost.toLocaleString()}
- Best Available Rate: ${breakEven.bestAvailableRate}%
- New Monthly Payment: £${Math.round(breakEven.newMonthlyPayment).toLocaleString()}
- Monthly Saving: £${Math.round(breakEven.monthlySaving).toLocaleString()}
- Months to Break Even: ${breakEven.monthsToBreakEven === 999 ? 'N/A' : breakEven.monthsToBreakEven}
- Net Saving Over Term: £${breakEven.totalSavingOverRemainingTerm.toLocaleString()}

### Recommendation: ${breakEven.recommendedAction === 'switch-now' ? 'Switch Now' : breakEven.recommendedAction === 'wait' ? 'Wait & Monitor' : 'Stay on Current Deal'}

*Generated by RateShift UK AI Analysis Engine*`;
  }
}

/**
 * OpenAI AI Provider - uses real API when key is available
 */
class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateClientEmail(client: Client, mortgage: Mortgage, breakEven: BreakEvenResult, deal: BestAvailableDeal): Promise<{ subject: string; body: string }> {
    const systemPrompt = `You are a friendly, professional UK independent mortgage broker named Mark Thompson. You write clear, concise emails to clients about mortgage opportunities. Use British English. Always include specific figures. Keep emails under 250 words.`;
    
    const userPrompt = `Write a client email for:
- Client: ${client.name}
- Current mortgage: ${mortgage.lender} ${mortgage.product} at ${mortgage.fixedRate}%, balance £${mortgage.balance.toLocaleString()}, expires ${mortgage.endDate}
- Best available deal: ${deal.lender} ${deal.product} at ${deal.rate}%
- Break-even analysis: ${breakEven.explanation}
- ERC cost: £${breakEven.ercCost.toLocaleString()}
- Monthly saving: £${Math.round(breakEven.monthlySaving)}
- Recommendation: ${breakEven.recommendedAction}

Provide the email as JSON with "subject" and "body" fields.`;

    const result = await this.callOpenAI(systemPrompt, userPrompt);
    try {
      const parsed = JSON.parse(result);
      return { subject: parsed.subject, body: parsed.body };
    } catch {
      // Fallback to mock if parsing fails
      return new MockAIProvider().generateClientEmail(client, mortgage, breakEven, deal);
    }
  }

  async generateReportSummary(client: Client, mortgage: Mortgage, breakEven: BreakEvenResult): Promise<string> {
    const systemPrompt = `You are a UK mortgage analysis AI. Generate clear, professional summaries in British English.`;
    const userPrompt = `Summarize this mortgage review for ${client.name}: ${mortgage.lender} at ${mortgage.fixedRate}%, balance £${mortgage.balance.toLocaleString()}. ${breakEven.explanation}. Recommendation: ${breakEven.recommendedAction}.`;
    
    return this.callOpenAI(systemPrompt, userPrompt);
  }
}

// Provider singleton
let provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!provider) {
    if (AI_API_KEY) {
      provider = new OpenAIProvider(AI_API_KEY, AI_MODEL);
    } else {
      provider = new MockAIProvider();
    }
  }
  return provider;
}

export function isMockMode(): boolean {
  return !AI_API_KEY;
}

function getMonthsRemaining(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30)));
}

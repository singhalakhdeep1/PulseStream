import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Generate text
export async function generateText(prompt: string, model: string = 'claude-3-opus-20240229') {
  const message = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

// Stream text
export async function* streamText(prompt: string, model: string = 'claude-3-opus-20240229') {
  const stream = await anthropic.messages.stream({
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text;
    }
  }
}

// Generate with system prompt
export async function generateWithSystem(system: string, prompt: string) {
  const message = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

// Count tokens
export async function countTokens(text: string) {
  const response = await anthropic.messages.countTokens({
    model: 'claude-3-opus-20240229',
    messages: [{ role: 'user', content: text }],
  });

  return response.input_tokens;
}

export { anthropic };

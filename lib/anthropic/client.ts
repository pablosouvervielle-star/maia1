import Anthropic from '@anthropic-ai/sdk'

// Lazy singleton — validated at request time, not module load time
let _client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export const DENTAL_MODEL = 'claude-opus-4-6'

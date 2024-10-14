import { describe, it, expect } from 'vitest';
import {
  anthropicWireMessagesRequestSchema,
  anthropicWireMessagesResponseSchema,
} from './anthropic.wiretypes';

describe('anthropicWireMessagesRequestSchema', () => {
  it('should validate a correct request structure', () => {
    const validRequest = {
      model: 'test-model',
      messages: [
        { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
        { role: 'assistant', content: [{ type: 'text', text: 'Hi there!' }] },
      ],
      max_tokens: 100,
      metadata: { user_id: '1234' },
      stop_sequences: ['stop'],
      stream: false,
      temperature: 0.5,
      top_p: 0.9,
      top_k: 50,
    };

    expect(() => anthropicWireMessagesRequestSchema.parse(validRequest)).not.toThrow();
  });

  it('should fail if messages do not alternate starting with user', () => {
    const invalidRequest = {
      model: 'test-model',
      messages: [
        { role: 'assistant', content: [{ type: 'text', text: 'Hi there!' }] },
        { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
      ],
      max_tokens: 100,
    };

    expect(() => anthropicWireMessagesRequestSchema.parse(invalidRequest)).toThrow();
  });

  it('should fail if max_tokens is missing', () => {
    const invalidRequest = {
      model: 'test-model',
      messages: [
        { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
        { role: 'assistant', content: [{ type: 'text', text: 'Hi there!' }] },
      ],
    };

    expect(() => anthropicWireMessagesRequestSchema.parse(invalidRequest)).toThrow();
  });
});

describe('anthropicWireMessagesResponseSchema', () => {
  it('should validate a correct response structure', () => {
    const validResponse = {
      id: 'response-id',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: 'Hello, user!' }],
      model: 'test-model',
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: 50,
        output_tokens: 50,
      },
    };

    expect(() => anthropicWireMessagesResponseSchema.parse(validResponse)).not.toThrow();
  });

  it('should fail if the role is not assistant', () => {
    const invalidResponse = {
      id: 'response-id',
      type: 'message',
      role: 'user',
      content: [{ type: 'text', text: 'Hello, user!' }],
      model: 'test-model',
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: 50,
        output_tokens: 50,
      },
    };

    expect(() => anthropicWireMessagesResponseSchema.parse(invalidResponse)).toThrow();
  });

  it('should fail if content is not an array of text blocks', () => {
    const invalidResponse = {
      id: 'response-id',
      type: 'message',
      role: 'assistant',
      content: 'Hello, user!',
      model: 'test-model',
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: 50,
        output_tokens: 50,
      },
    };

    expect(() => anthropicWireMessagesResponseSchema.parse(invalidResponse)).toThrow();
  });
});
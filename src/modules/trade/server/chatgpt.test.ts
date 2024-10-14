import { describe, it, expect } from 'vitest';
import { TRPCError } from '@trpc/server';
import { chatGptParseConversation } from './chatgpt';

describe('chatGptParseConversation', () => {
  it('should successfully parse and validate JSON data from HTML', () => {
    const htmlPage = `
      <html>
        <body>
          <script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"continueMode":true,"moderationMode":false,"serverResponse":{"data":{"title":"Chat Title","create_time":1234567890,"update_time":1234567891,"moderation_results":[],"current_node":"node_1","is_public":true,"linear_conversation":[],"has_user_editable_context":false,"continue_conversation_url":"http://example.com","model":{"slug":"model-slug","max_tokens":100,"title":"Model Title","description":"Model Description","tags":[]},"moderation_state":{}}},"sharedConversationId":"conversation_123"}}}</script>
        </body>
      </html>
    `;

    const result = chatGptParseConversation(htmlPage);
    expect(result).toBeDefined();
    expect(result.props.pageProps.serverResponse.data.title).toBe('Chat Title');
  });

  it('should throw an error if JSON data is missing', () => {
    const htmlPage = `
      <html>
        <body>
          <script id="__NEXT_DATA__" type="application/json"></script>
        </body>
      </html>
    `;

    expect(() => chatGptParseConversation(htmlPage)).toThrowError(TRPCError);
  });

  it('should throw an error if JSON data is invalid', () => {
    const htmlPage = `
      <html>
        <body>
          <script id="__NEXT_DATA__" type="application/json">Invalid JSON</script>
        </body>
      </html>
    `;

    expect(() => chatGptParseConversation(htmlPage)).toThrowError(TRPCError);
  });

  it('should throw an error for invalid JSON structure', () => {
    const htmlPage = `
      <html>
        <body>
          <script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"continueMode":true,"moderationMode":false,"serverResponse":{"data":{"title":"Chat Title"}},"sharedConversationId":"conversation_123"}}}</script>
        </body>
      </html>
    `;

    expect(() => chatGptParseConversation(htmlPage)).toThrowError(TRPCError);
  });
});
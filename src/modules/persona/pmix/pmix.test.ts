import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bareBonesPromptMixer } from './pmix';
import { DLLMId, findLLMOrThrow } from '~/modules/llms/store-llms';
import { browserLangOrUS } from '~/common/util/pwaUtils';

vi.mock('~/modules/llms/store-llms', () => ({
  findLLMOrThrow: vi.fn(),
}));

vi.mock('~/common/util/pwaUtils', () => ({
  browserLangOrUS: 'en-US',
}));

describe('bareBonesPromptMixer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should replace {{Today}} with the current date', () => {
    const template = 'Today is {{Today}}';
    const result = bareBonesPromptMixer(template, undefined);
    const today = new Date();
    const expectedDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    expect(result).toBe(`Today is ${expectedDate}`);
  });

  it('should replace {{LocaleNow}} with formatted date and time', () => {
    const template = 'Current time: {{LocaleNow}}';
    const result = bareBonesPromptMixer(template, undefined);
    const formatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      hour12: true,
    });
    const formattedDateTime = formatter.format(new Date());
    expect(result).toBe(`Current time: ${formattedDateTime}`);
  });

  it('should replace static placeholders', () => {
    const template = '{{PreferTables}}, {{RenderMermaid}}, {{RenderPlantUML}}, {{RenderSVG}}, {{InputImage0}}, {{ToolBrowser0}}';
    const result = bareBonesPromptMixer(template, undefined);
    expect(result).toBe('Data presentation: prefer tables (auto-columns), Mermaid rendering: Enabled, PlantUML rendering: Enabled, SVG in markdown rendering: Enabled, Image input capabilities: Disabled, Web browsing capabilities: Disabled');
  });

  it('should replace {{Cutoff}} with training data cutoff if assistantLlmId is provided', () => {
    const template = 'Cutoff date: {{Cutoff}}';
    const mockCutoffDate = '2023-01-01';
    const mockLlmId: DLLMId = 'mock-llm-id';

    vi.mocked(findLLMOrThrow).mockReturnValueOnce({ trainingDataCutoff: mockCutoffDate } as any);

    const result = bareBonesPromptMixer(template, mockLlmId);

    expect(findLLMOrThrow).toHaveBeenCalledWith(mockLlmId);
    expect(result).toBe(`Cutoff date: ${mockCutoffDate}`);
  });

  it('should remove lines containing {{Cutoff}} if no assistantLlmId is provided', () => {
    const template = 'Cutoff date: {{Cutoff}}\nNext line';
    const result = bareBonesPromptMixer(template, undefined);
    expect(result).toBe('Next line');
  });

  it('should handle custom field replacements', () => {
    const template = 'Hello, {{name}}!';
    const customFields = { '{{name}}': 'Alice' };
    const result = bareBonesPromptMixer(template, undefined, customFields);
    expect(result).toBe('Hello, Alice!');
  });

  it('should limit consecutive newlines to two', () => {
    const template = 'Line1\n\n\nLine2';
    const result = bareBonesPromptMixer(template, undefined);
    expect(result).toBe('Line1\n\nLine2');
  });
});
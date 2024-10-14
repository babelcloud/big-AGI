import { describe, it, expect, beforeEach } from 'vitest';
import { plantumlDiagramPrompt, mermaidDiagramPrompt, bigDiagramPrompt } from './diagrams.data';
import type { DiagramType, DiagramLanguage } from './diagrams.data';
import type { VChatMessageIn } from '~/modules/llms/llm.client';

describe('plantumlDiagramPrompt', () => {
  it('should generate correct prompts for "auto" diagram type', () => {
    const result = plantumlDiagramPrompt('auto');
    expect(result.sys).toContain('Generate a valid PlantUML diagram markdown');
    expect(result.usr).toContain('Generate the PlantUML code for a suitable diagram');
  });

  it('should generate correct prompts for "mind" diagram type', () => {
    const result = plantumlDiagramPrompt('mind');
    expect(result.sys).toContain('Generate a valid PlantUML mindmap markdown');
    expect(result.usr).toContain('Generate a PlantUML mindmap');
  });
});

describe('mermaidDiagramPrompt', () => {
  it('should generate correct prompts for "auto" diagram type', () => {
    const result = mermaidDiagramPrompt('auto');
    expect(result.sys).toContain('Generate a valid Mermaid diagram markdown');
    expect(result.usr).toContain('Generate the Mermaid code for a suitable diagram');
  });

  it('should generate correct prompts for "mind" diagram type', () => {
    const result = mermaidDiagramPrompt('mind');
    expect(result.sys).toContain('Generate a valid Mermaid mindmap markdown');
    expect(result.usr).toContain('Generate the Mermaid code for a mind map');
  });
});

describe('bigDiagramPrompt', () => {
  const chatSystemPrompt = 'Chat system prompt';
  const subject = 'Subject content';
  const customInstruction = 'Custom instruction';

  it('should generate correct messages for Mermaid "auto" diagram', () => {
    const result = bigDiagramPrompt('auto', 'mermaid', chatSystemPrompt, subject, customInstruction);
    expect(result).toHaveLength(4);
    expect(result[0].content).toContain('Generate a valid Mermaid diagram markdown');
    expect(result[3].content).toContain('Generate the Mermaid code for a suitable diagram');
  });

  it('should generate correct messages for Mermaid "mind" diagram', () => {
    const result = bigDiagramPrompt('mind', 'mermaid', chatSystemPrompt, subject, customInstruction);
    expect(result).toHaveLength(4);
    expect(result[0].content).toContain('Generate a valid Mermaid mindmap markdown');
    expect(result[3].content).toContain('Generate the Mermaid code for a mind map');
  });

  it('should generate correct messages for PlantUML "auto" diagram', () => {
    const result = bigDiagramPrompt('auto', 'plantuml', chatSystemPrompt, subject, customInstruction);
    expect(result).toHaveLength(4);
    expect(result[0].content).toContain('Generate a valid PlantUML diagram markdown');
    expect(result[3].content).toContain('Generate the PlantUML code for a suitable diagram');
  });

  it('should generate correct messages for PlantUML "mind" diagram', () => {
    const result = bigDiagramPrompt('mind', 'plantuml', chatSystemPrompt, subject, customInstruction);
    expect(result).toHaveLength(4);
    expect(result[0].content).toContain('Generate a valid PlantUML mindmap markdown');
    expect(result[3].content).toContain('Generate a PlantUML mindmap');
  });

  it('should handle empty custom instructions', () => {
    const result = bigDiagramPrompt('auto', 'mermaid', chatSystemPrompt, subject, '');
    expect(result[3].content).not.toContain('Also consider the following instructions');
  });
});
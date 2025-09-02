import { PromptManager } from '../../src/llm/PromptManager';

describe('PromptManager', () => {
  it('projectContext는 의존성 정보를 포함해야 한다', () => {
    const p = PromptManager.projectContext({ a: '1.0.0' }, { b: '2.0.0' });
    expect(p).toMatch(/a@1.0.0/);
    expect(p).toMatch(/b@2.0.0/);
  });
});

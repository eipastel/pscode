import { createHash } from 'node:crypto';
import { describe, expect, it, test } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getCompleteChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getPsApplyCommandTemplate,
  getPsCompleteCommandTemplate,
  getPsExploreCommandTemplate,
  getPsProposeCommandTemplate,
  getProposeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getApplyChangeSkillTemplate: 'c5ce88e14875831586cb50e5e24a5a4c8c9994282ecabd6334bcd08b28dcb1bf',
  getCompleteChangeSkillTemplate: 'e932374cb314b00a77854536619c1044e21367431f49124776b26f3b5e179bfe',
  getExploreSkillTemplate: '883766675e50ab0f1e8ddea8d35083523dad24f7358107659d670d4e6569e1cb',
  getFeedbackSkillTemplate: '37cc46fb58f8390f6cb47d4221bfd729ea45692903f19ef5dc932b6a6e04c24a',
  getProposeSkillTemplate: '5ab0ffe2466a2a383cd551f6d47110137926ee3091285bf5a43a09320adc5cf5',
  getPsApplyCommandTemplate: 'a9bde78b28366d2bb76a08a7daf88d7a82c06145eb6e7df59d378e2db082464a',
  getPsCompleteCommandTemplate: '74db9b5f7f40e8e3b1360872a74969b1e5676c02eea69ea672d74c5a7c96598f',
  getPsExploreCommandTemplate: 'bfd0f5505ee60d50fb9b7f1ecb3ffa933d801d86136786e78c4fa4f60a1acabe',
  getPsProposeCommandTemplate: '317f6e0c2547864f95c9adc72ecd90b325059b367a740fff7c8777ada05643ea',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'pscode-apply-change': '2eaec08f697edf2e3a1ab20c0cac7d1935639bfcfd70aab80bd589094045594b',
  'pscode-complete-change': 'c90b597d7f5f3f78c6ee6416b79587fbd71f4224949a4014d2941cd105c48b80',
  'pscode-explore': 'e99fb2a097f7f6a5d7c2f3f5e8b4f59c8d1f979f971b91613409a3978fe503d3',
  'pscode-propose': 'd8c4c26313b0fd3fa4bfaef81508ed6a846ce11748f047726ae2a022903c0f55',
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('skill templates split parity', () => {
  it('preserves all template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getExploreSkillTemplate,
      getApplyChangeSkillTemplate,
      getPsExploreCommandTemplate,
      getPsApplyCommandTemplate,
      getCompleteChangeSkillTemplate,
      getPsCompleteCommandTemplate,
      getProposeSkillTemplate,
      getPsProposeCommandTemplate,
      getFeedbackSkillTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves generated skill file content exactly', () => {
    // Intentionally excludes getFeedbackSkillTemplate: skillFactories only models templates
    // deployed via generateSkillContent, while feedback is covered in function payload parity.
    const skillFactories: Array<[string, () => SkillTemplate]> = [
      ['pscode-explore', getExploreSkillTemplate],
      ['pscode-apply-change', getApplyChangeSkillTemplate],
      ['pscode-complete-change', getCompleteChangeSkillTemplate],
      ['pscode-propose', getProposeSkillTemplate],
    ];

    const actualHashes = Object.fromEntries(
      skillFactories.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });

  describe('apply skill PR config integration', () => {
    it('apply skill instructs agent to read pscode/config.yaml', () => {
      const content = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      expect(content).toContain('pscode/config.yaml');
      expect(content).toContain('pr.enabled: true');
    });

    it('apply skill includes PR disabled fallback instruction', () => {
      const content = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      expect(content).toContain('pr.enabled: false');
      expect(content).toContain('continue normally without any PR instructions');
    });

    it('apply skill includes branch pattern instruction when PR enabled', () => {
      const content = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      expect(content).toContain('pr.branch.pattern');
      expect(content).toContain('pr.title.template');
      expect(content).toContain('pr.description.template');
    });
  });

  describe('PR auto-draft integration', () => {
    it('propose skill asks once about opening the draft PR when PR enabled', () => {
      const content = generateSkillContent(getProposeSkillTemplate(), 'TEST');
      expect(content).toContain('pr.enabled: true');
      expect(content).toContain('Quer abrir o Pull Request em DRAFT agora?');
      expect(content).toContain('gh pr create --draft');
    });

    it('propose skill leaves PR opening to apply when user declines or PR disabled', () => {
      const content = generateSkillContent(getProposeSkillTemplate(), 'TEST');
      expect(content).toContain('left to `/ps:apply`');
      expect(content).toContain('PR_OPENED');
    });

    it('apply skill opens a draft PR automatically when none exists', () => {
      const content = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      expect(content).toContain('open one in **DRAFT automatically, without asking the user**');
      expect(content).toContain('gh pr view --json state');
      expect(content).toContain('gh pr create --draft');
    });

    it('apply skill continues on the existing PR without opening another', () => {
      const content = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      expect(content).toContain('do NOT open another');
    });

    it('both skills describe non-blocking PR failure handling', () => {
      const proposeContent = generateSkillContent(getProposeSkillTemplate(), 'TEST');
      const applyContent = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      for (const content of [proposeContent, applyContent]) {
        expect(content).toContain('--draft');
        expect(content).toContain('gh auth login');
        expect(content).toMatch(/do NOT block|não-bloqueante/);
      }
    });

    it('both skills comment the PR link on the tracker when linkInTask is enabled', () => {
      const proposeContent = generateSkillContent(getProposeSkillTemplate(), 'TEST');
      const applyContent = generateSkillContent(getApplyChangeSkillTemplate(), 'TEST');
      for (const content of [proposeContent, applyContent]) {
        expect(content).toContain('pr.comments.linkInTask: true');
      }
    });
  });

  it('guards unsupported workspace workflows from repo-local fallback edits', () => {
    const guardedSkills: Array<[string, () => SkillTemplate, string]> = [
      ['pscode-apply-change', getApplyChangeSkillTemplate, 'full workspace apply is not supported'],
      ['pscode-complete-change', getCompleteChangeSkillTemplate, 'workspace archive is not supported'],
    ];

    for (const [dirName, createTemplate, guardText] of guardedSkills) {
      const content = generateSkillContent(createTemplate(), 'PARITY-BASELINE');

      expect(content, dirName).toContain('actionContext.mode: "workspace-planning"');
      expect(content, dirName).toContain(guardText);
      expect(content, dirName).not.toContain('pscode/changes/<name>');
      expect(content, dirName).not.toContain('mv pscode/changes');
    }
  });
});

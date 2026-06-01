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
  getApplyChangeSkillTemplate: '9ba4b2b078bcd3b47895cc30b5b00e042b360546dea8732cfe46e01f5a1c36a4',
  getCompleteChangeSkillTemplate: 'e932374cb314b00a77854536619c1044e21367431f49124776b26f3b5e179bfe',
  getExploreSkillTemplate: '883766675e50ab0f1e8ddea8d35083523dad24f7358107659d670d4e6569e1cb',
  getFeedbackSkillTemplate: '37cc46fb58f8390f6cb47d4221bfd729ea45692903f19ef5dc932b6a6e04c24a',
  getProposeSkillTemplate: '2df25f87f31a1c5ba43a88757835c4d894a49647dead7fc78376d056fc8c0c56',
  getPsApplyCommandTemplate: 'c75efd8b81ff877ba08c03463ff521eb3f7924cb230d8d95386f4ea431b0fdef',
  getPsCompleteCommandTemplate: '74db9b5f7f40e8e3b1360872a74969b1e5676c02eea69ea672d74c5a7c96598f',
  getPsExploreCommandTemplate: 'bfd0f5505ee60d50fb9b7f1ecb3ffa933d801d86136786e78c4fa4f60a1acabe',
  getPsProposeCommandTemplate: '64110994ba8c58be601aa73b617d539c9eb754c6a072f5c6f9e400fdd752b14c',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'pscode-apply-change': 'b4c78829a73d9ccb692b0ce09afa94c5049c3239ea2834f113b568e7d1bfcdcc',
  'pscode-complete-change': 'c90b597d7f5f3f78c6ee6416b79587fbd71f4224949a4014d2941cd105c48b80',
  'pscode-explore': 'e99fb2a097f7f6a5d7c2f3f5e8b4f59c8d1f979f971b91613409a3978fe503d3',
  'pscode-propose': '17f51fbb4a527390f8b1d680c3eae84769bf3d7b8615b90b138b1e8366e853e2',
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

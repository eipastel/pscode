import { createHash } from 'node:crypto';
import { describe, expect, it, test } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getCompleteChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getFfChangeSkillTemplate,
  getNewChangeSkillTemplate,
  getOnboardSkillTemplate,
  getPsApplyCommandTemplate,
  getPsCompleteCommandTemplate,
  getPsBulkArchiveCommandTemplate,
  getPsContinueCommandTemplate,
  getPsExploreCommandTemplate,
  getPsFfCommandTemplate,
  getPsNewCommandTemplate,
  getPsOnboardCommandTemplate,
  getPsProposeCommandTemplate,
  getProposeSkillTemplate,
  getPsVerifyCommandTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getApplyChangeSkillTemplate: '9ba4b2b078bcd3b47895cc30b5b00e042b360546dea8732cfe46e01f5a1c36a4',
  getCompleteChangeSkillTemplate: '13f00c3a3fc13d29a4d81a199f9c993c8fc691a10ef12a3739d3fe2520d4b09e',
  getBulkArchiveChangeSkillTemplate: '9a625b7b199ac465654d3c3d89b812f8a7ae6a4e2cca60010a8c03293a1ff801',
  getContinueChangeSkillTemplate: '4bcce8b5109e8fe489782b5415d318816457b43db315b0747063ee35f4dc4e77',
  getExploreSkillTemplate: '883766675e50ab0f1e8ddea8d35083523dad24f7358107659d670d4e6569e1cb',
  getFeedbackSkillTemplate: '37cc46fb58f8390f6cb47d4221bfd729ea45692903f19ef5dc932b6a6e04c24a',
  getFfChangeSkillTemplate: '900ccf0782ec1a9024ad4a8b890e34db4e7302222bd1b71613c8c858984126fd',
  getNewChangeSkillTemplate: 'cd6a0b88659afcabe73581646e8d9b1accb2f48df547faa7c5d0e44d77ece0aa',
  getOnboardSkillTemplate: '2db2164f9a052903709e1312175e34aeffb9d38e2c205cf9f985130013110b33',
  getProposeSkillTemplate: '6d0075a19dc1ff15d646e2d039fb1131156d399e0c6794b686762e4f98aa92dc',
  getPsApplyCommandTemplate: 'c75efd8b81ff877ba08c03463ff521eb3f7924cb230d8d95386f4ea431b0fdef',
  getPsCompleteCommandTemplate: '74db9b5f7f40e8e3b1360872a74969b1e5676c02eea69ea672d74c5a7c96598f',
  getPsBulkArchiveCommandTemplate: '1464df49ad5bf07a550d34f6950495e5ca397f6eb7a8690bcc0993c8e4136b74',
  getPsContinueCommandTemplate: 'dca3927fa00bf0a7135c6cc99f75b2908e80a38bb495ec5f3e5888743e0f1e6d',
  getPsExploreCommandTemplate: 'bfd0f5505ee60d50fb9b7f1ecb3ffa933d801d86136786e78c4fa4f60a1acabe',
  getPsFfCommandTemplate: 'ef272952e2e01b96ed6e49abef147e8808d6186896d61cea60ce7ebcd947eabc',
  getPsNewCommandTemplate: 'fdb348e81411ff65d722ab90a218155ed301712ef44b6621124dbad726959895',
  getPsOnboardCommandTemplate: 'f01a5baae071c51e5991e10024abef089a35c222c0bbc8be3c2f8dd580d48091',
  getPsProposeCommandTemplate: 'd527c961486c2113e2843acb431b500b34797cd1a140947b51f2b73b12bb533b',
  getPsVerifyCommandTemplate: 'ff5444b1f84b2de82e3c56b105f384bdd61e58251257b183087c5c92a608e7ec',
  getVerifyChangeSkillTemplate: 'fb57bd2789816164ae3ffae404442456377e590cb7fe0a7a266eb1841c29ca5c',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'pscode-apply-change': 'b4c78829a73d9ccb692b0ce09afa94c5049c3239ea2834f113b568e7d1bfcdcc',
  'pscode-archive-change': '6488e283714cb475040f23cf534f497ce2b3af43d7d06288e1a86459015a3294',
  'pscode-bulk-archive-change': 'b09bc4dbad8eaa9d4682b28b3bbbc521948a397a0495f832cd3121a03703a863',
  'pscode-continue-change': '2839984327a5ec7af43795bf7abc808074c3424a26f6c717dba31e0fc7d922b1',
  'pscode-explore': 'e99fb2a097f7f6a5d7c2f3f5e8b4f59c8d1f979f971b91613409a3978fe503d3',
  'pscode-ff-change': 'b16f044a89d3f675317500407dc9c4adfff8e788fb8a36b9441191a67221360c',
  'pscode-new-change': 'bc876dbb82313189b89fc6a1076f29b2ebae749bc4f0bceca06480ea97de292e',
  'pscode-onboard': '21fee8182d0b868c743cfde2fc4e21d7f8c12e0fec7e34b3641453eae1510fa6',
  'pscode-propose': 'fb49b8d89719d4b2617fc0ac6e1df397693f8e80dd670a1b71572f35ffc993b9',
  'pscode-verify-change': '93f85208b848b63b1baebd1e0165dc676a4b9b53b865b74aa811db9d2a9d5b8d',
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
      getNewChangeSkillTemplate,
      getContinueChangeSkillTemplate,
      getApplyChangeSkillTemplate,
      getFfChangeSkillTemplate,
      getOnboardSkillTemplate,
      getPsExploreCommandTemplate,
      getPsNewCommandTemplate,
      getPsContinueCommandTemplate,
      getPsApplyCommandTemplate,
      getPsFfCommandTemplate,
      getCompleteChangeSkillTemplate,
      getBulkArchiveChangeSkillTemplate,
      getVerifyChangeSkillTemplate,
      getPsCompleteCommandTemplate,
      getPsOnboardCommandTemplate,
      getPsBulkArchiveCommandTemplate,
      getPsVerifyCommandTemplate,
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
      ['pscode-new-change', getNewChangeSkillTemplate],
      ['pscode-continue-change', getContinueChangeSkillTemplate],
      ['pscode-apply-change', getApplyChangeSkillTemplate],
      ['pscode-ff-change', getFfChangeSkillTemplate],
      ['pscode-archive-change', getCompleteChangeSkillTemplate],
      ['pscode-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['pscode-verify-change', getVerifyChangeSkillTemplate],
      ['pscode-onboard', getOnboardSkillTemplate],
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
      ['pscode-archive-change', getCompleteChangeSkillTemplate, 'workspace archive is not supported'],
      ['pscode-bulk-archive-change', getBulkArchiveChangeSkillTemplate, 'workspace bulk archive is not supported'],
      ['pscode-verify-change', getVerifyChangeSkillTemplate, 'full workspace implementation verification is not supported'],
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

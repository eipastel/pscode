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
  getApplyChangeSkillTemplate: 'a119abeb7419257651bd3a04e58327ec6366db163d7e07dc30f7795f98e83200',
  getCompleteChangeSkillTemplate: '768bea27f406315280d0e12bfd312a82185fea86a13dd030ac8b11424f04550b',
  getExploreSkillTemplate: 'ec6aac22ecaa6491ef4257a38eda9e5fe1da5710c6b94279218fc960fa224c84',
  getFeedbackSkillTemplate: '37cc46fb58f8390f6cb47d4221bfd729ea45692903f19ef5dc932b6a6e04c24a',
  getProposeSkillTemplate: '4951eb305b93333f971fa58b5506198c8674d5708aa142be8f19592e00d22042',
  getPsApplyCommandTemplate: 'e5248a1835adc945e99be1681d853f5d9e64afa7ad4674cdec9f16f72487b2e6',
  getPsCompleteCommandTemplate: '13fcb6aca5056d15cd6a85d2217505b85a6cf8c8ff9efe6f90c8cb67afc46150',
  getPsExploreCommandTemplate: '0810094efe2f38452e48472e29e04594557940a31dc85977f42714476d8cc37b',
  getPsProposeCommandTemplate: 'bec7c88d077d23817b4ffee0faa40e9d16b0468f70e43951b3130a0fcddb3818',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'pscode-apply-change': 'a8b22f3d850537240a5d826091cd5cc61fbfea494d6ed25e76b6e3d9c4f39964',
  'pscode-complete-change': '14d11255cb32342f8d40e24486a4753b76b352a9b668b7f1ccd397aa975b6e68',
  'pscode-explore': '51fdc182ffacff035ae58f55056ad997aae48bad246ccc075756fd6c7c76e803',
  'pscode-propose': '665244d98a6acc2702ceb5d61488ef11cbeda896e90fc412711c926dc377f6dd',
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

  describe('complete auto sync & archive (no confirmation prompts)', () => {
    // The skill exposes the shared instructions via `.instructions`; the command via `.content`.
    const completeContents: Array<[string, string]> = [
      ['pscode-complete-change skill', getCompleteChangeSkillTemplate().instructions],
      ['ps:complete command', getPsCompleteCommandTemplate().content],
    ];

    it('only uses AskUserQuestion for change selection (Step 1), never to confirm sync/archive', () => {
      for (const [label, content] of completeContents) {
        // Step 1 selection keeps the prompt
        expect(content, label).toContain('Use the **AskUserQuestion tool** to let the user select');
        // No confirmation prompts for incomplete artifacts/tasks or sync
        expect(content, label).toContain('Proceed automatically — do NOT use `AskUserQuestion`');
        expect(content, label).toContain(
          'Never use `AskUserQuestion` to confirm sync or archiving'
        );
        expect(content, label).not.toContain('to confirm user wants to proceed');
      }
    });

    it('syncs delta specs inline without the non-existent pscode-sync-specs skill', () => {
      for (const [label, content] of completeContents) {
        expect(content, label).toContain('Sync delta specs into main specs automatically');
        expect(content, label).toContain('perform the merge inline');
        expect(content, label).toContain('there is no `pscode-sync-specs` skill');
        // No subagent delegation to the missing skill
        expect(content, label).not.toContain('invoke pscode-sync-specs');
        expect(content, label).not.toContain('Sync now (recommended)');
      }
    });

    it('records incomplete artifacts/tasks as warnings instead of blocking', () => {
      for (const [label, content] of completeContents) {
        expect(content, label).toContain('Record a warning listing the incomplete artifacts');
        expect(content, label).toContain('Record a warning showing the count of incomplete tasks');
        // The "user chose to skip" sync state no longer exists
        expect(content, label).not.toContain('Sync skipped (user chose to skip)');
        expect(content, label).not.toContain('Delta spec sync was skipped');
      }
    });
  });

  describe('complete promotes the PR out of draft with user confirmation', () => {
    const completeContents: Array<[string, string]> = [
      ['pscode-complete-change skill', getCompleteChangeSkillTemplate().instructions],
      ['ps:complete command', getPsCompleteCommandTemplate().content],
    ];

    it('reads pscode/config.yaml and checks the PR state when pr.enabled', () => {
      for (const [label, content] of completeContents) {
        expect(content, label).toContain('PR Integration');
        expect(content, label).toContain('pscode/config.yaml');
        expect(content, label).toContain('pr.enabled');
        expect(content, label).toContain('pr.branch.pattern');
        expect(content, label).toContain('gh pr view --json state,isDraft,url');
      }
    });

    it('commits and pushes the complete changes before asking', () => {
      for (const [label, content] of completeContents) {
        expect(content, label).toContain('git add -A && git commit');
        expect(content, label).toContain('git push');
      }
    });

    it('asks the user once and promotes via gh pr ready, never merging', () => {
      for (const [label, content] of completeContents) {
        expect(content, label).toContain('AskUserQuestion');
        expect(content, label).toContain('Sim, tirar de draft');
        expect(content, label).toContain('gh pr ready');
        expect(content, label).toContain('NEVER run `gh pr merge`');
      }
    });

    it('skips the PR step silently when guards are not met', () => {
      for (const [label, content] of completeContents) {
        expect(content, label).toContain('skip this entire step');
        expect(content, label).toContain('already out of draft');
      }
    });

    it('treats gh/git failures as non-blocking', () => {
      for (const [label, content] of completeContents) {
        expect(content, label).toContain('gh auth login');
        expect(content, label).toMatch(/do NOT block|não-bloqueante/);
      }
    });

    it('allows a second interactive point for the PR promotion guardrail', () => {
      for (const [label, content] of completeContents) {
        expect(content, label).toContain('Interactive points are limited to TWO');
        expect(content, label).toContain('Never merge the PR in complete');
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

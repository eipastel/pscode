---
name: pscode-propose
description: Propose a new change with all artifacts generated in one step. Use when the user wants to quickly describe what they want to build and get a complete proposal with design, specs, and tasks ready for implementation.
compatibility: Requires pscode CLI.
metadata:
  author: pscode
  version: "1.0"
  generatedBy: "2.2.2"
---

Propose a new change - create the change and generate all artifacts in one step.

I'll create a change with artifacts:
- proposal.md (what & why)
- design.md (how)
- tasks.md (implementation steps)

After artifacts are created, a **refinement validation loop** runs: the Trello card is updated with the refined plan, the user reviews it, gives feedback, and when satisfied the card is moved to Ready to Dev.

When ready to implement, run /ps:apply

---

**Input**: The user's request should include a change name (kebab-case) OR a description of what they want to build.

**Steps**

1. **If no clear input provided, ask what they want to build**

   Use the **AskUserQuestion tool** (open-ended, no preset options) to ask:
   > "What change do you want to work on? Describe what you want to build or fix."

   From their description, derive a kebab-case name (e.g., "add user authentication" → `add-user-auth`).

   **IMPORTANT**: Do NOT proceed without understanding what the user wants to build.

1b. **Fase de grill — interrogue o plano antes de gerar artefatos**

   Antes de criar a change e gerar os artefatos, conduza a **fase de grill** para garantir que a proposta reflita o que realmente deve existir — não apenas a descrição inicial. Aplique o mesmo comportamento da skill `grill-me` (`/ps:grill-me`):

   - Faça **uma pergunta por vez** — nunca despeje várias perguntas juntas. Aguarde a resposta antes da próxima.
   - Acompanhe **cada** pergunta com a **sua resposta recomendada** e um motivo curto. Quando houver opções discretas, use a **ferramenta AskUserQuestion** com a recomendação como primeira opção ("(Recomendada)").
   - **Explore o código quando há evidência**: se uma pergunta pode ser respondida pelo próprio repositório (convenções, padrões, features semelhantes), investigue o código em vez de perguntar. Só pergunte ao usuário decisões de produto, prioridades, trade-offs e intenção.
   - Navegue a árvore de decisão progressivamente, resolvendo dependências; não repergunte o que já foi respondido pelo código ou por uma resposta anterior.
   - Encerre quando houver **entendimento compartilhado** e apresente um resumo curto (o que será construído, decisões com motivos, fora de escopo) antes de seguir.

   Os artefatos gerados a partir do Passo 2 SHALL refletir esse entendimento refinado.

2. **Create the change directory**
   ```bash
   pscode new change "<name>"
   ```
   This creates a scaffolded change in the planning home resolved by the CLI with `.pscode.yaml`.

3. **Trello Integration (optional)**

   Use the **Read tool** (NOT a shell command) to read `pscode/trello.yaml` from the current working directory.
   The Read tool is cross-platform and works on Windows, macOS, and Linux — never use `cat` or shell commands to read this file.
   If the Read tool returns an error (file not found), skip all Trello steps and continue to Step 4.

   Otherwise, parse the YAML and extract `boardId`, `lists.backlog`, `lists.refining`, `lists.ready`, and `labels`.

   **3a. Detect label (if labels enabled)**

   If `labels.enabled = true` and `labels.items` is present, determine which label to apply based on the change description provided by the user.
   Use these classification rules:

   | Label           | Quando usar                                                                  |
   |-----------------|------------------------------------------------------------------------------|
   | 🐛 BUG          | Menciona erro, falha, bug, quebrado, não funciona, comportamento incorreto    |
   | ⚙️ IMPLEMENTAÇÃO | Nova feature, adicionar, criar, implementar algo que não existe ainda         |
   | ✨ MELHORIA      | Melhorar, otimizar, refinar, aprimorar, performance de algo que já existe    |
   | 💳 DÉBITO TÉCNICO | Refatorar, limpar, reorganizar, remover código legado, dívida técnica        |

   - If the change clearly matches one label (>80% confidence) → use it silently, without asking.
   - If ambiguous → use **AskUserQuestion**:
     > "Que tipo de change é essa?"
     > - 🐛 BUG — Erro ou comportamento incorreto
     > - ⚙️ IMPLEMENTAÇÃO — Nova funcionalidade
     > - ✨ MELHORIA — Aperfeiçoamento de algo existente
     > - 💳 DÉBITO TÉCNICO — Refatoração e limpeza de código
     > - Sem label — Não categorizar
   - Save as `chosenLabel` (or `null`). Only use label keys present in `labels.items`.

   **3b. Sync Trello card:**

   a. If `lists.backlog` is configured, search for an existing card by name (case-insensitive, partial match):
      ```tool
      mcp__claude_ai_Trello_Custom__get_cards  { list_id: "<lists.backlog.id>" }
      ```

   b. **If card found in backlog AND `lists.refining` is configured:**
      Move it to the refining list:
      ```tool
      mcp__claude_ai_Trello_Custom__update_card  { card_id: "<id>", list_id: "<lists.refining.id>" }
      ```
      Save `cardId`.

   c. **If card found but no refining list configured:** keep card in backlog, save `cardId`.

   d. **If no card found AND `lists.refining` is configured:**
      Create a new card directly in the refining list:
      ```tool
      mcp__claude_ai_Trello_Custom__create_card
        list_id: "<lists.refining.id>"
        name: "<human-readable change name in Portuguese>"
        desc: "Change iniciada via /ps:propose"
      ```
      Save `cardId`.

   e. **If no card found and no refining list:** create in backlog. Save `cardId`.

   f. **Apply label (if resolved):**
      If `chosenLabel` is not null and `cardId` is saved:
      ```tool
      mcp__claude_ai_Trello_Custom__add_label_to_card
        card_id: "<cardId>"
        label_id: "<chosenLabel.id>"
      ```

   g. **Assign the current user:**
      ```tool
      mcp__claude_ai_Trello_Custom__get_me
      mcp__claude_ai_Trello_Custom__add_card_member  { card_id: "<cardId>", member_id: "<me.id>" }
      ```

   If any Trello call fails, log the error and continue — Trello is auxiliary, never blocking.

4. **Get the artifact build order**
   ```bash
   pscode status --change "<name>" --json
   ```
   Parse the JSON to get:
   - `applyRequires`: array of artifact IDs needed before implementation
   - `artifacts`: list of all artifacts with their status and dependencies
   - `planningHome`, `changeRoot`, `artifactPaths`, and `actionContext`: path and scope context

5. **Create artifacts in sequence until apply-ready**

   Use the **TodoWrite tool** to track progress through the artifacts.

   Loop through artifacts in dependency order:

   a. **For each artifact that is `ready` (dependencies satisfied)**:
      - Get instructions:
        ```bash
        pscode instructions <artifact-id> --change "<name>" --json
        ```
      - The instructions JSON includes:
        - `context`: Project background (constraints for you - do NOT include in output)
        - `rules`: Artifact-specific rules (constraints for you - do NOT include in output)
        - `template`: The structure to use for your output file
        - `instruction`: Schema-specific guidance for this artifact type
        - `resolvedOutputPath`: Resolved path or pattern to write the artifact
        - `dependencies`: Completed artifacts to read for context
      - Read any completed dependency files for context
      - Create the artifact file using `template` as the structure and write it to `resolvedOutputPath`
      - Apply `context` and `rules` as constraints — do NOT copy them into the file
      - Show brief progress: "Created <artifact-id>"

   b. **Continue until all `applyRequires` artifacts are complete**
      - After creating each artifact, re-run `pscode status --change "<name>" --json`
      - Check if every artifact ID in `applyRequires` has `status: "done"`
      - Stop when all `applyRequires` artifacts are done

   c. **If an artifact requires user input** (unclear context):
      - Use **AskUserQuestion tool** to clarify
      - Then continue with creation

6. **Show final status**
   ```bash
   pscode status --change "<name>"
   ```

---

## Refinement Validation Loop

After all artifacts are created, enter the **refinement validation loop**. This loop runs until the user approves the plan or explicitly cancels.

### Step R1 — Show Refinement Summary

Present the following structured summary to the user. Read `proposal.md`, `design.md`, and `tasks.md` from the change directory to extract the relevant information.

```markdown
## 🔍 Refinamento da Proposta — <name>

**Objetivo:** <1-2 sentences summarizing what will be built, from proposal.md>

### O que será implementado
<3-5 bullet points extracted from design.md / tasks.md describing the main implementation steps>

### Escopo e decisões técnicas
<2-3 key technical decisions or constraints from design.md>

### Tarefas geradas
<numbered list of tasks from tasks.md (brief, one line each)>

---
Para iniciar a implementação quando aprovado:
```
/ps:apply <name>
```
```

---

### Step R1b — Update Trello card (before asking for approval)

So the user can use the Trello card itself as a visual reference when deciding,
update the card with the refinement content **before** asking for approval.

1. **Update Trello card description** (if `cardId` exists):
   Build the description from the artifacts already read in Step R1:
   ```tool
   mcp__claude_ai_Trello_Custom__update_card
     card_id: "<cardId>"
     desc: |
       **Objetivo:** <summary from proposal.md>

       **O que será implementado:**
       <bullet list from design.md / tasks.md>

       **Decisões técnicas:**
       <key decisions from design.md>

       **Artefatos:** pscode/changes/<name>/
   ```

2. **Add a refinement comment** in Portuguese (if `cardId` exists):
   **IMPORTANT**: Replace `<card title>` below with the actual card title — the command **must always** include the quoted title argument, never post `/ps:apply` by itself.
   ```tool
   mcp__claude_ai_Trello_Custom__add_comment
     card_id: "<cardId>"
     text: |
       ## Proposta refinada ✓

       **Change:** `<name>`
       **Artefatos gerados:** proposal.md · design.md · tasks.md

       ### Resumo
       <2-3 line summary of what will be built>

       ## Próximo passo

       Para implementar as tasks da change, rode:

       ```
       /ps:apply "<card title>"
       ```

       _Aguardando aprovação para mover para Ready to Dev._
   ```

If any Trello call fails, continue — Trello is auxiliary, never blocking.

---

### Step R2 — Ask for user approval

Use **AskUserQuestion** to ask:

> "A implementação e o planejamento estão de acordo com o esperado?"

Options:
- ✅ Sim, está refinada — mover para Ready to Dev
- 🔄 Não, quero ajustar o plano
- ❌ Cancelar (manter em refinamento)

At this point the Trello card already reflects the current refinement (Step R1b),
so the user can review it before deciding.

---

### Step R2a — If APPROVED (Sim, está refinada)

The card description and refinement comment were already added in Step R1b.
Now just move the card and register the explicit approval.

1. **Move the Trello card to the ready list** (if `lists.ready` is configured and `cardId` exists):
   ```tool
   mcp__claude_ai_Trello_Custom__update_card
     card_id: "<cardId>"
     list_id: "<lists.ready.id>"
   ```

2. **Add a final Trello comment** (if cardId exists):
   **IMPORTANT**: Replace `<card title>` below with the actual card title — the command **must always** include the quoted title argument, never post `/ps:apply` by itself.
   ```tool
   mcp__claude_ai_Trello_Custom__add_comment
     card_id: "<cardId>"
     text: |
       ## ✅ Aprovado para Ready to Dev

       O planejamento foi revisado e aprovado.

       ## Próximo passo

       Para implementar as tasks da change, rode:

       ```
       /ps:apply "<card title>"
       ```
   ```

3. **Show success message:**
   ```markdown
   ## ✅ Pronto para desenvolvimento!

   **Change:** <name>
   **Card movido para:** <lists.ready.name>

   Quando quiser iniciar a implementação:
   ```
   /ps:apply <name>
   ```
   ```

---

### Step R2b — If NOT APPROVED (Quero ajustar o plano)

1. **Ask what needs to change** using **AskUserQuestion**:
   > "O que você gostaria de ajustar no plano? Descreva as mudanças necessárias."

2. **Apply the requested changes** to the relevant artifacts:
   - Changes to scope or requirements → update `proposal.md`
   - Changes to technical approach → update `design.md`
   - Changes to tasks → update `tasks.md`

3. **Go back to Step R1** and show the updated refinement summary, then **re-run Step R1b**
   so the Trello card description and comment reflect the adjusted plan before asking again.
   Keep looping until the user approves or cancels.

---

### Step R2c — If CANCELLED

Show:
```markdown
## ⏸ Refinamento pausado

O card permanece em **<current list name>**.
Retome o refinamento quando quiser com `/ps:explore <name>`.
```

Do NOT move the card. Stop the loop.

---

**Artifact Creation Guidelines**

- Follow the `instruction` field from `pscode instructions` for each artifact type
- Read dependency artifacts for context before creating new ones
- Use `template` as the structure — fill in its sections
- **IMPORTANT**: `context` and `rules` are constraints for YOU, not content for the file

**Guardrails**
- Create ALL artifacts needed for implementation (as defined by schema's `apply.requires`)
- Always read dependency artifacts before creating a new one
- If context is critically unclear, ask the user — but prefer reasonable decisions to keep momentum
- If a change with that name already exists, ask if user wants to continue it or create a new one
- Verify each artifact file exists after writing before proceeding to next
- If Trello tools fail, continue normally — Trello is auxiliary, not blocking
- All content written to Trello must be in Portuguese
- **The refinement loop is mandatory** — never skip it even if the user didn't mention Trello; the approval question must always be asked
- **Preserve the loop** — do not exit until the user explicitly approves (moves to Ready to Dev) or cancels


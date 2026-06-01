---
"@thiagodiogo/pscode": patch
---

Refinamento do `ps:propose`: atualiza card do Trello antes de pedir confirmação

O loop de refinamento do skill `ps:propose` agora atualiza a descrição e adiciona o comentário de refinamento no card do Trello **antes** de perguntar ao usuário se o planejamento está de acordo (novo Step R1b), permitindo que o card sirva como referência visual na decisão de aprovação. O Step R2a passa a apenas mover o card para Ready to Dev e registrar a aprovação explícita; em iterações de ajuste (R2b) o card é reatualizado antes de nova confirmação. A correção foi aplicada no template-fonte `src/core/templates/workflows/propose.ts` e nos arquivos gerados.

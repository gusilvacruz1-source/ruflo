---
name: skill-builder
description: Conduz a criação, o refino e a auditoria de skills por um processo de descoberta em seis rodadas — o trabalho, o gatilho, o material, o caminho, os erros e o que empacotar. Use sempre que alguém quiser transformar um procedimento em skill, disser "vira isso numa skill", pedir para melhorar ou consertar uma skill existente que não dispara ou dispara demais, revisar um SKILL.md, ou quando um mesmo tipo de tarefa se repetir na conversa e valer a pena virar instrução reutilizável.
---

# Construir uma skill

Uma skill é um procedimento escrito para ser lido por um modelo em contextos
que você não vai acompanhar. Isso muda o que é uma boa instrução: não basta
estar certa, ela precisa continuar certa quando a tarefa chegar diferente do
exemplo que você tinha na cabeça.

Duas armadilhas dominam. **Vaga demais** ("aplique boas práticas de design")
não muda nada — o modelo já ia fazer isso. **Específica demais** (o passo a
passo de um caso) funciona uma vez e atrapalha nas outras vinte. O alvo é o
meio: o procedimento com as decisões nomeadas, os números que importam e o
*porquê* de cada uma — porque o porquê é o que permite ao modelo acertar num
caso que você não previu.

Se a sessão tiver o `skill-creator` da Anthropic disponível, ele cobre a parte
de rodar avaliações com subagentes e comparar com e sem a skill. Este
documento cobre a outra metade: extrair o conteúdo da cabeça de quem sabe, e
auditar o que já existe.

## As seis rodadas

Uma rodada por vez, em conversa. Não despeje as seis perguntas de uma vez —
cada resposta muda a próxima pergunta. Se a conversa atual já responde alguma
rodada, aproveite e confirme em vez de perguntar de novo.

### 1. O trabalho

O que a skill deve permitir fazer, e como se sabe que ficou pronto.

- Qual é a tarefa, em uma frase?
- Quem faz isso hoje, e com o quê?
- Como é um resultado bom? E um ruim que passa despercebido?

Sem um critério de pronto, a skill vira lista de conselhos.

### 2. O gatilho

Quando ela deve entrar em cena — e, tão importante, quando não.

- Como as pessoas pedem isso, nas palavras delas? Colete três ou quatro
  formulações reais, incluindo as preguiçosas.
- Que pedidos **parecidos** não são esse? São os quase-acertos que definem a
  fronteira: se a skill dispara neles, ela atrapalha.
- Existe outra skill que compete? Qual ganha, e por quê?

Isto vira a `description`, que é o único texto sempre em contexto — e portanto
o que decide se a skill é consultada.

### 3. O material

O que entra e o que sai.

- Formatos de entrada, e o que fazer quando vier torto.
- Formato exato da saída — arquivo, estrutura, nomes.
- Um exemplo de entrada e a saída correspondente. Exemplo concreto vale mais
  que três parágrafos de especificação.

### 4. O caminho

Os passos, em ordem, e onde entra julgamento.

- Qual é a sequência?
- Em que ponto existe uma escolha, e o que decide? Este é o miolo: a triagem
  no começo ("isto aqui é caso para o caminho caro ou para o barato?") costuma
  ser a parte mais valiosa da skill inteira.
- O que dá para calcular em vez de chutar? Números explícitos — tetos,
  faixas, limites — são o que faz o resultado ser reprodutível.

### 5. Os erros

O que dá errado, como se percebe e como se sai.

- Quais falhas se repetem? Como aparecem?
- Qual é o erro silencioso — o que passa e só é descoberto depois?
- O que verificar antes de entregar?

Uma seção de "erros que voltam sempre" costuma ser a parte mais consultada de
uma skill. Escreva o sintoma, não só a causa: é pelo sintoma que a pessoa
chega ali.

### 6. O que empacotar

O que é repetitivo o bastante para virar arquivo.

- Algum passo é sempre o mesmo código? Vira `scripts/`.
- Alguma referência é longa e só serve às vezes? Vira `references/`, citada
  no `SKILL.md` com uma linha dizendo quando abrir.
- Algum arquivo entra no resultado (modelo, fonte, ícone)? Vira `assets/`.

Se o `SKILL.md` está passando de 500 linhas, é sinal de que falta esta rodada.

## Escrevendo o arquivo

```
nome-da-skill/
├── SKILL.md          ← frontmatter + procedimento
├── references/       ← o que se lê só quando precisa
├── scripts/          ← o que se executa
└── assets/           ← o que entra no resultado
```

O frontmatter tem dois campos obrigatórios:

```yaml
---
name: nome-da-skill        # igual ao nome da pasta, minúsculo, com hífens
description: O que faz + quando usar, numa frase densa.
---
```

Sobre a `description`: modelos tendem a **não** acionar skills que seriam
úteis. Compense sendo explícito e um pouco insistente — liste os contextos e
as palavras que as pessoas usam de verdade, inclusive quando elas não nomeiam
a técnica. Detalhes em `references/anatomia.md`.

Sobre o corpo: imperativo, explicando o porquê. Se você se pegar escrevendo
SEMPRE e NUNCA em maiúsculas, é sinal de que faltou explicar a razão — e
razão convence um modelo bem melhor do que ênfase.

## Auditando uma skill existente

Quando o pedido for "essa skill não está funcionando", diagnostique antes de
reescrever:

**Não dispara** → é a `description`. Compare-a com o jeito que a pessoa pediu
de fato. Falta o vocabulário dela, ou está descrevendo a técnica em vez do
problema.

**Dispara onde não devia** → a `description` está larga. Nomeie os
quase-acertos e diga para onde eles devem ir.

**Dispara e o resultado é genérico** → o corpo é conselho, não procedimento.
Procure frases que valeriam para qualquer tarefa e troque cada uma por uma
decisão com critério.

**Dispara e o resultado é rígido** → a skill descreve um caso, não um método.
Suba um nível: o que era verdade naquele caso e o que era só daquele caso?

**Custa caro** → há trabalho repetido que devia estar em `scripts/`, ou
contexto que devia estar em `references/` e está no corpo.

`references/anatomia.md` traz a lista de verificação completa para revisão.

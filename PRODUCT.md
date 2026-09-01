# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS, sem build step. Decisão do usuário, declarada no brief
("HTML/CSS puro, sem build"). A loja da Lumière vive em `lumiere/`, isolada
do site da BETIM que já ocupa a raiz do repositório.

## Users

Mulheres da região dos Campos Gerais do Paraná — Reserva, Imbaú e Telêmaco
Borba — que hoje compram pelo Instagram e pelo grupo de WhatsApp da marca.
A cliente já conhece a Lumière; a loja existe para dar a ela um lugar
próprio para ver as peças com calma, fora do feed, e chamar a vendedora
com a peça já escolhida.

Compra pelo celular, quase sempre à noite. [INFERIDO do brief e do perfil]

## Product Purpose

Vitrine própria da Lumière | Moda & Estilo, marca de vestuário feminino de
Reserva-PR. Substitui o feed do Instagram como lugar de decisão: a peça
aparece grande, sozinha, sem a poluição de um marketplace.

Sucesso, nesta primeira versão, é a cliente sair do site já no WhatsApp com
a peça identificada. Pagamento online entra em uma fase seguinte.

## Positioning

Loja de bairro que se apresenta como casa de moda. O que nenhuma vizinha
copia de graça: a Lumière já tem uma identidade construída em torno da luz
— nome, logo de lâmpada dourada, "Vista-se de luz", "Revelamos a sua
essência". A loja leva isso ao literal: a peça é revelada pela iluminação,
não exibida por um card.

## Operating Context

- Venda acontece hoje pelo Instagram (@lumiere.modaestilo) e por grupo de
  WhatsApp linkado na bio.
- Atendimento é pessoa a pessoa; a vendedora negocia tamanho, cor e
  pagamento na conversa.
- Entrega própria em Imbaú e Telêmaco Borba, além de Reserva.
- Sem CNPJ, gateway ou catálogo estruturado confirmados neste momento.

## Capabilities and Constraints

- Site estático, sem servidor, sem carrinho, sem banco de dados.
- Todos os CTAs levam ao WhatsApp nesta fase; o ponto de integração de
  pagamento fica marcado no código para a fase seguinte.
- Sem fotos de produto disponíveis. Placeholders de luz em CSS ocupam o
  lugar, com o `<img>` real comentado no HTML.
- Deploy provável por Netlify ou GitHub Pages; o repositório já tem uma
  branch `gh-pages`.

## Brand Commitments

Vinculantes, vindos da marca real:

- Nome: **Lumière | Moda & Estilo**
- Tagline: **"Vista-se de luz."**
- Frase de apoio: "Revelamos a sua essência — com elegância"
- Logo existente: lâmpada dourada com silhueta feminina sobre preto
- Instagram: @lumiere.modaestilo
- Praça: Reserva - PR. Entregas em Imbaú e Telêmaco Borba.

Direção visual fixada pelo usuário no brief, que vence a rolagem de
direções da skill:

- Preto absoluto (#000000) e grafite profundo
- Acentos em bronze/dourado queimado e vermelho escuro cinematográfico
- Iluminação chiaroscuro; peças com fade to black
- Títulos em sans condensada pesada, caixa alta
- Preços e menus em monoespaçada técnica
- Grid de exposição, 1 a 2 peças por linha, sem card visível
- Ghost buttons; badges editoriais no lugar de tags de promoção

## Evidence on Hand

Real: nome, tagline, logo, cidade, praça de entrega, canais de venda —
todos lidos do perfil de Instagram enviado pelo usuário.

Ausente, e que não deve ser inventado: fotos de produto, catálogo real,
preços reais, depoimentos, número de clientes, prazos de entrega, política
de troca. As seis peças do catálogo inicial são **fictícias e rotuladas
como tal**, para serem substituídas pelo usuário.

O link do grupo de WhatsApp foi lido de uma captura de tela e **precisa ser
conferido pelo usuário** antes de ir ao ar.

## Product Principles

1. A peça é a protagonista; a interface recua para o preto.
2. A conversa é o checkout desta fase — todo caminho termina na vendedora.
3. Nada de número inventado: sem preço falso apresentado como real, sem
   prova social fabricada.
4. Celular primeiro; hover é enfeite, nunca requisito para ver preço.
5. A luz é a marca. Onde a interface precisar de ênfase, ela vem de
   iluminação, não de cor chapada.

## Accessibility & Inclusion

Contraste legível sobre preto absoluto — texto corrido nunca abaixo de
#8a8781 sobre #000. Foco de teclado sempre visível. `prefers-reduced-motion`
respeitado em toda a revelação por scroll. Preço e nome legíveis sem hover
em touch.

---
name: excalidraw-diagram
description: Gera arquivos .excalidraw editáveis por código — o JSON de elementos, o sistema de coordenadas, a ligação de setas a caixas e o texto ancorado dentro de forma. Use sempre que pedirem um diagrama editável, fluxograma, arquitetura de sistema, diagrama de sequência, mapa de banco de dados ou organograma para abrir no Excalidraw, quando alguém mandar um .excalidraw para alterar, ou quando disserem "faz um diagrama que eu quero poder mexer depois". Para uma imagem estática no estilo quadro branco, use a skill excalidraw-visuals.
---

# Diagramas do Excalidraw por código

Um `.excalidraw` é JSON: uma lista de elementos com posição, tamanho e estilo.
Escrever esse JSON à mão dá um arquivo que a pessoa abre, arrasta e edita —
diferente de uma imagem, que só dá para refazer.

O trabalho todo está em duas coisas: acertar as coordenadas e acertar as
ligações. O resto é preencher campos obrigatórios.

## O arquivo

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [],
  "appState": { "gridSize": null, "viewBackgroundColor": "#ffffff" },
  "files": {}
}
```

Todo elemento carrega este conjunto de campos. Faltando um, o Excalidraw pode
abrir mesmo assim, mas costuma reclamar ou desenhar errado:

```json
{
  "id": "caixa-1",
  "type": "rectangle",
  "x": 100, "y": 100, "width": 220, "height": 90,
  "angle": 0,
  "strokeColor": "#1e1e1e",
  "backgroundColor": "transparent",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 1,
  "opacity": 100,
  "groupIds": [],
  "frameId": null,
  "roundness": { "type": 3 },
  "seed": 1234567,
  "version": 1,
  "versionNonce": 1234567,
  "isDeleted": false,
  "boundElements": [],
  "updated": 1,
  "link": null,
  "locked": false
}
```

- `seed` e `versionNonce` são inteiros quaisquer — o traço "à mão" é sorteado
  a partir do `seed`. Use valores diferentes por elemento, senão formas iguais
  saem com o mesmo tremor e a folha parece impressa.
- `roughness`: 0 arquitetônico, 1 padrão, 2 bem esboçado.
- `roundness: { "type": 3 }` arredonda o retângulo; `null` deixa em canto vivo.
- `fillStyle`: `hachure` (rabiscado), `cross-hatch` ou `solid`. Só aparece se
  `backgroundColor` não for `transparent`.

## Coordenadas

- Origem no canto superior esquerdo, **y cresce para baixo**.
- `x`/`y` de uma forma é o canto superior esquerdo dela.
- Em setas e linhas, `x`/`y` é o ponto de partida e `points` é **relativo a
  ele**. O primeiro par é sempre `[0, 0]`:

```json
{
  "type": "arrow",
  "x": 320, "y": 145,
  "width": 120, "height": 0,
  "points": [[0, 0], [120, 0]]
}
```

`width`/`height` de uma seta devem bater com a extensão dos `points`. Não
batendo, a caixa de seleção fica deslocada da linha desenhada.

Para posicionar sem contar pixel na mão, trabalhe em faixas: uma coluna a cada
`320 px`, uma linha a cada `160 px`, caixas de `220 × 90`. Fica alinhado e
sobra espaço para as setas respirarem.

## Texto dentro de uma forma

É o ponto que mais sai errado. O texto não é desenhado por cima: ele é um
elemento próprio, **ancorado** na forma, e os dois precisam apontar um para o
outro.

```json
{
  "id": "texto-1",
  "type": "text",
  "x": 130, "y": 130,
  "width": 160, "height": 25,
  "text": "Servidor",
  "originalText": "Servidor",
  "fontSize": 20,
  "fontFamily": 1,
  "textAlign": "center",
  "verticalAlign": "middle",
  "containerId": "caixa-1",
  "lineHeight": 1.25,
  "baseline": 18,
  "…demais campos obrigatórios…"
}
```

E na forma:

```json
"boundElements": [{ "id": "texto-1", "type": "text" }]
```

`fontFamily`: `1` é a manuscrita (Excalifont/Virgil), `2` a sem-serifa, `3` a
monoespaçada. Quebre a linha você mesmo com `\n` quando o texto passar da
largura da caixa — o Excalidraw só requebra ao editar.

## Setas ligadas às caixas

Seta ligada acompanha a caixa quando a pessoa arrasta. Sem ligação, ela fica
para trás e o diagrama se desmancha no primeiro ajuste.

Na seta:

```json
"startBinding": { "elementId": "caixa-1", "focus": 0, "gap": 8 },
"endBinding":   { "elementId": "caixa-2", "focus": 0, "gap": 8 },
"startArrowhead": null,
"endArrowhead": "arrow"
```

E em **cada** caixa envolvida:

```json
"boundElements": [{ "id": "seta-1", "type": "arrow" }]
```

- `focus` vai de −1 a 1 e desloca o ponto de encontro ao longo da borda; `0`
  aponta para o centro.
- `gap` é a folga entre a ponta e a borda. 8 px lê bem.
- Ligação é mão dupla: se a caixa não listar a seta em `boundElements`,
  arrastar a caixa deixa a seta parada.

## Método

1. **Desenhe a grade antes do JSON.** Decida as colunas e linhas e escreva as
   coordenadas de cada caixa numa tabela. Corrigir posição depois, no JSON, é
   bem mais caro do que planejar.
2. **Gere com script, não à mão.** Uma função `caixa(id, x, y, texto)` que
   devolve o par forma + texto já ancorados elimina a classe inteira de erros
   de campo faltando. Um diagrama de dez caixas escrito à mão sempre tem um
   `boundElements` esquecido.
3. **Confira antes de entregar**: todo `containerId` aponta para uma forma
   existente; toda ligação aparece dos dois lados; nenhum `id` repetido;
   `width`/`height` das setas batem com os `points`.
4. **Abra o arquivo.** Excalidraw é tolerante e abre coisas quebradas sem
   avisar — o texto some, a seta fica no canto. Ver é a única verificação que
   vale.

## Paleta

Use as cores do próprio Excalidraw, para o arquivo continuar parecendo dele:

| Uso | Traço | Fundo |
| --- | --- | --- |
| Padrão | `#1e1e1e` | `transparent` |
| Azul | `#1971c2` | `#a5d8ff` |
| Verde | `#2f9e44` | `#b2f2bb` |
| Vermelho | `#e03131` | `#ffc9c9` |
| Amarelo | `#f08c00` | `#ffec99` |
| Roxo | `#6741d9` | `#d0bfff` |

Cor com significado: um estado, uma camada, um dono. Colorir para enfeitar
tira do leitor a informação que a cor poderia carregar.

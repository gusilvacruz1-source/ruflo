# Imbaú Imobiliária

Branch dedicada ao site da **Imbaú Imobiliária** — Raquel Domingues,
CRECI 27892, Imbaú/PR. Aqui não mora nenhum outro projeto.

```
imbau/          o site (React + Vite + Tailwind)
.agents/skills/ as skills usadas para construí-lo
.claude/skills/ os links que o Claude Code lê
```

Para mexer no site, comece por **[`imbau/README.md`](imbau/README.md)**: ele
explica onde ficam os textos, como publicar um imóvel novo, como trocar a
filmagem da visita e o que confirmar com a Raquel antes de publicar.

```bash
cd imbau
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

## Onde está no ar

| Endereço | O que é |
| --- | --- |
| `gusilvacruz1-source.github.io/ruflo/imbau/` | Prévia pública, publicada da branch `gh-pages`, pasta `imbau/` |
| `imobiliariaimbau.com.br` | Endereço final pretendido — ainda não apontado |

Para republicar a prévia: `npm run build` e copie `imbau/dist/` para a pasta
`imbau/` da branch `gh-pages`. As outras pastas de lá (`danber`, `lumiere`,
`margem`) e a BETIM da raiz são de outros projetos — não encoste nelas.

Para mandar o site para alguém sem subir nada:
`node tools/empacota-previa.mjs . previa.html` gera um HTML único, com tudo
embutido, que abre com dois cliques.

## Skills

As seis skills desta branch (`video-to-website`, `frontend-design`,
`layout-container-fix`, `excalidraw-diagram`, `excalidraw-visuals`,
`skill-builder`) ficam em `.agents/skills/`, com um link em `.claude/skills/`
apontando para lá — é o link que o Claude Code lê. O `skills-lock.json`
registra a procedência de cada uma.

A lista de skills é lida na abertura da sessão: uma skill nova só passa a
existir depois disso.

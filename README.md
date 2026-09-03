# ruflo

Repositório dos sites feitos para negócios de **Imbaú, PR**. Cada projeto vive
numa branch e é publicado numa pasta própria — esta branch não tem código, só o
mapa.

## Os sites

| Projeto | Código | No ar |
| --- | --- | --- |
| **Imbaú Imobiliária** | [`imobiliaria-imbau`](../../tree/imobiliaria-imbau) → `imbau/` | [/ruflo/imbau/](https://gusilvacruz1-source.github.io/ruflo/imbau/) |
| **Barbearia Danber** | [`claude/barbershop-interactive-site-ciazpf`](../../tree/claude/barbershop-interactive-site-ciazpf) (raiz) | [/ruflo/danber/](https://gusilvacruz1-source.github.io/ruflo/danber/) |
| **Lumière — Moda & Estilo** | [`claude/website-payment-setup-8yhz4b`](../../tree/claude/website-payment-setup-8yhz4b) → `lumiere/` | [/ruflo/lumiere/](https://gusilvacruz1-source.github.io/ruflo/lumiere/) |
| **MARGEM** | [`claude/website-payment-setup-8yhz4b`](../../tree/claude/website-payment-setup-8yhz4b) → `margem/` | [/ruflo/margem/](https://gusilvacruz1-source.github.io/ruflo/margem/) |
| **BETIM Mangueiras e Conexões** | [`claude/background-photo-website-nrloak`](../../tree/claude/background-photo-website-nrloak) (raiz) | [raiz do /ruflo/](https://gusilvacruz1-source.github.io/ruflo/) |
| **Lojinha Kerollay** | [`loja-kerollay`](../../tree/loja-kerollay) → `lojinha-kerollay/` | Netlify (ver `netlify.toml` da branch) |
| **Eloize Betim — Tatuagens** | [`loja-kerollay`](../../tree/loja-kerollay) → `elotattoos/` | Declara `elotattoos.com.br`; não está na `gh-pages` |

## Como o repositório funciona

**Uma branch por frente de trabalho.** Os nomes começados por `claude/` foram
gerados automaticamente e não dizem o que carregam — a tabela acima é a
tradução. Branches novas valem a pena nascer com o nome do negócio, como a
`imobiliaria-imbau`.

**Quase toda branch tem o site da BETIM na raiz.** É herança: as branches foram
cortadas umas das outras e o site da raiz veio junto. Só a `imobiliaria-imbau`
está limpa disso. Ao trabalhar num projeto, olhe a pasta dele, não a raiz.

**A publicação sai da `gh-pages`.** Ela guarda os sites prontos: a BETIM na
raiz e uma pasta por projeto. Para republicar um deles, copie o build para a
pasta correspondente e não encoste nas outras.

```bash
git worktree add /tmp/pages origin/gh-pages
cp -r <build>/* /tmp/pages/<pasta>/
cd /tmp/pages && git add <pasta> && git commit && git push origin HEAD:gh-pages
```

A **Lojinha Kerollay** é a exceção: sai do Netlify, que publica a pasta
`lojinha-kerollay/` da branch `loja-kerollay`, conforme o `netlify.toml` de lá.
Mexer na `gh-pages` não a afeta, e vice-versa.

## Skills

Algumas branches carregam skills do Claude Code em `.agents/skills/`, com links
em `.claude/skills/` e procedência no `skills-lock.json`. Elas valem só na
branch em que estão, e a lista é lida na abertura da sessão — skill nova só
passa a existir na sessão seguinte.

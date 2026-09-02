# Imbaú Imobiliária — landing page

Página única em React + Vite + Tailwind CSS, no estilo "alto luxo, moderno e
minimalista": bloco escuro imersivo no topo, vitrine de imóveis em cartões
grandes e quebra para um bloco claro na chamada final.

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # gera a pasta dist/, pronta para publicar
npm run preview  # confere o build antes de subir
```

O build usa caminhos relativos, então a pasta `dist/` funciona tanto na raiz do
domínio quanto dentro de um subdiretório.

## Onde mexer

Quase tudo que muda no dia a dia está em **`src/conteudo.js`**: telefone,
CRECI, redes, textos das seções, benefícios e a lista de imóveis. Os
componentes só leem esse arquivo.

### Publicar um imóvel novo

1. Coloque a foto em `public/imagens/` (JPG ou WebP, de preferência com pelo
   menos 1600 px de largura).
2. Copie um bloco de `imoveis` em `src/conteudo.js`, troque os textos e aponte
   `imagem` para o arquivo novo.
3. Ainda sem foto? Use `'imagens/imovel-sem-foto.svg'`.

Cada botão abre o WhatsApp com uma mensagem diferente, escrita em
`mensagens` — assim quem atende já sabe de onde veio o contato e sobre qual
imóvel a pessoa quer falar.

## Imagens

| Arquivo | O que é |
| --- | --- |
| `imagens/casa-210m2-*.webp`, `imagens/casa-122m2.webp`, `imagens/imovel-rural-1723m2.webp` | Fotos reais dos anúncios do perfil `@imobiliaria.imbau` |
| `imagens/hero-lago.svg` | Fundo da primeira dobra — cena ilustrativa, **não é um imóvel da carteira** |
| `imagens/imovel-sem-foto.svg` | Reserva para imóvel anunciado antes da sessão de fotos |
| `imagens/og.jpg` | Prévia que aparece ao compartilhar o link no WhatsApp |
| `marca/imbau-simbolo.png` | Símbolo da marca, recortado do logotipo original |

As fotos vieram de prints do Instagram, então estão em 828 px de largura. Se a
Raquel tiver os arquivos originais, vale substituir — a nitidez melhora bastante
nos cartões grandes.

O fundo da hero e a imagem de reserva são gerados por `tools/make-art.mjs`
(`node tools/make-art.mjs`). Se um dia entrar uma fotografia noturna de verdade,
é só trocar `hero.imagem` em `src/conteudo.js`.

## Antes de publicar

- [ ] Confirmar com a Raquel se os três imóveis seguem disponíveis.
- [ ] Trocar o domínio em `og:image` e no `link rel="canonical"` (`index.html`)
      se o endereço final não for `imobiliariaimbau.com.br`.
- [ ] Substituir as fotos pelos arquivos originais, se existirem.

## Movimento

- **Revelação no scroll** — os blocos sobem e aparecem uma vez só, via
  `IntersectionObserver` (`src/componentes/Movimento.jsx`).
- **Botão magnético** — no desktop o botão acompanha o cursor de leve e volta ao
  lugar; desligado em telas de toque.
- Tudo respeita `prefers-reduced-motion`: quem pede menos movimento no sistema
  recebe a página estática.

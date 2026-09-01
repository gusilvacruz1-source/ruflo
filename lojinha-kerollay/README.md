# Lojinha Kerollay — loja virtual

Site estático (HTML + CSS + JavaScript puro). Não precisa de servidor, banco de dados
nem conta em plataforma: é só hospedar os arquivos.

## Como funciona o pedido

1. A cliente monta o carrinho no site (o carrinho fica salvo no navegador dela).
2. Clica em **Finalizar no WhatsApp**.
3. O site monta a mensagem com os itens, quantidades e total e abre o WhatsApp da
   Kerollay — **(42) 98808-4236** — já com tudo escrito.

Exemplo da mensagem que chega:

```
Olá, Kerollay! 💕 Vim pelo site e quero fazer um pedido:

1. Bruma Fixadora Soft Matte
   2 x R$ 14,99 = R$ 29,98
2. Kit Victoria's Secret — Bare Vanilla
   1 x R$ 65,00 = R$ 65,00

*Total dos itens com preço: R$ 94,98*

Meu nome: Maria
Entrega: Combinar pelo WhatsApp
```

## Trocar a flor do fundo pela foto original

O fundo hoje usa um desenho em `img/flor.svg`. Para usar a foto da flor:

> Salve a imagem como **`img/flor.png`** — pronto. O CSS já procura por ela primeiro
> e só cai no desenho se o arquivo não existir. Não precisa mexer em código.

## Editar produtos e preços

Mexa **só** em `js/produtos.js`. Cada produto é um bloco assim:

```js
{
  id: 'gloss-cherry-bomb',      // texto único, sem espaço
  nome: 'Gloss Cherry Bomb',
  categoria: 'makes',           // makes | victoria | kits | personalizados
  preco: 19.99,                 // use null para "sob encomenda"
  desc: 'Gloss labial 5g...',
  detalhes: ['Super hidratante', 'Brilho laqueado'],
  tag: 'Novidade',              // selo na foto (ou null)
  img: null                     // 'img/cherry-bomb.jpg' quando tiver foto
}
```

- `preco: null` troca o botão para **Fazer orçamento** e avisa no carrinho que o
  valor entra no orçamento pelo WhatsApp.
- `img: null` desenha um card com a inicial do produto. Assim que você colocar as
  fotos reais na pasta `img/` e apontar o caminho, elas aparecem no lugar.

## Trocar o número do WhatsApp

No topo de `js/script.js`:

```js
const CONFIG = {
  whatsapp: '5542988084236',   // 55 + DDD + número, só dígitos
  ...
};
```

O número também aparece direto em `index.html` (botões e seção de contato).

## Publicar no Netlify (grátis)

O `netlify.toml` na raiz do repositório já aponta para esta pasta, então o
site do Netlify abre a loja direto na raiz.

1. Entre em **netlify.com** e faça login **com o GitHub**.
2. **Add new site → Import an existing project → GitHub →** repositório `ruflo`.
3. Em **Branch to deploy**, escolha `claude/grill-me-jpyv9r`
   (ou a branch para onde você tiver levado a loja).
4. **Não mexa** em "Build command" nem em "Publish directory" — o
   `netlify.toml` já preenche. Clique em **Deploy**.
5. Depois: **Site configuration → Change site name →** digite
   `lojinha-kerollay`.

O link fica **https://lojinha-kerollay.netlify.app**.

Se o Netlify disser que o nome já está em uso, tente `lojinhakerollay` ou
`lojinha-kerollay-imbau`.

A cada `git push` na branch escolhida, o Netlify republica sozinho.

### Domínio próprio (opcional)

Com um domínio comprado no registro.br (~R$ 40/ano), em
**Domain management → Add a domain** o link vira `lojinhakerollay.com.br`.

## Pendências

- [ ] Confirmar os preços dos kits marcados como `preco: null`
      (Nelô Puro Leite, Nelô Doce de Leite, Carolina Herrera 212 VIP Black,
      Asad Bourbon, O Boticário Malbec).
- [ ] Adicionar as fotos dos produtos em `img/` e preencher o campo `img`.
- [ ] Salvar a foto da flor como `img/flor.png`.

# Migrar a Lumière para plataforma com pagamento, estoque e frete

O site atual é estático: HTML, CSS e JavaScript no GitHub Pages, sem
servidor. Ele mostra as peças e manda a cliente para o WhatsApp, e faz isso
bem. O que ele **não pode** fazer, por arquitetura:

- **Receber pagamento.** O token do gateway ficaria visível no JavaScript,
  e qualquer pessoa poderia usar a conta da loja. A confirmação também
  precisa vir por webhook no servidor: a URL de retorno é só o navegador da
  cliente e dá para forjar.
- **Baixar estoque.** O problema não é guardar o número, é que duas
  clientes podem comprar a última peça ao mesmo tempo. Só um banco com
  operação atômica resolve. `localStorage` é por navegador: cada cliente
  tem o dela, não existe estoque compartilhado.
- **Calcular frete.** A API de frete exige token, mesmo problema do
  pagamento, e só funciona com peso e dimensões cadastrados por peça.

Por isso a escolha foi plataforma pronta.

## Qual plataforma

| | Nuvemshop | Loja Integrada |
|---|---|---|
| Customizar tema | Plano Impulso, R$ 139/mês | Plano pago, mais barato |
| O que libera | Código-fonte HTML, CSS e JS por FTP | Somente CSS |
| O design atual | Sobrevive inteiro | Não sobrevive |

O hero, a grade de cinco colunas e a faixa editorial são **estrutura**, não
cor. Com acesso só a CSS dá para repintar um tema da plataforma com o
dourado e a tipografia da Lumière, mas o layout seria o deles.

> Confirme os valores atuais no site de cada plataforma. Preço de plano
> muda, e o que está aqui é o que valia quando este texto foi escrito.

## Ordem das coisas

Fazer fora de ordem trava no meio. A sequência é esta:

1. **CNPJ.** Vender com pagamento online significa emitir nota fiscal.
   Sem CNPJ, a maioria dos gateways não libera conta de loja.
2. **Conta na plataforma**, no plano que permite customizar.
3. **Conta no gateway** (Mercado Pago, PagBank ou o próprio checkout da
   plataforma) e verificação de identidade. Leva 1 a 2 dias.
4. **Conta bancária** no mesmo CPF/CNPJ, para onde o dinheiro vai.
5. **Cadastro das peças**, com preço, estoque, peso e dimensões.
6. **Frete**: conectar Melhor Envio ou Correios, e cadastrar o CEP de
   origem em Reserva.
7. **Tabela própria para as três cidades.** Reserva, Imbaú e Telêmaco
   Borba são entrega dela, de carro. Frete calculado por transportadora
   nessas rotas sai caro e sem sentido. Toda plataforma aceita frete fixo
   por região; use isso para as três e deixe a calculadora para o resto do
   Brasil.
8. **Tema**, por último. Layout antes de ter produto é retrabalho.

## O que já está pronto neste repositório

- **`catalogo.csv`** — as dez peças com SKU, nome, categoria e o arquivo da
  foto. Abre no Excel ou no Google Sheets. As colunas vazias são o que só
  ela sabe.
- **`img/`** — as dez fotos já otimizadas em WebP, o logo com transparência,
  o vídeo do hero e a imagem de compartilhamento.
- O design, para ser portado como tema.

### O que falta ela preencher no catalogo.csv

| Coluna | Por quê |
|---|---|
| Preço | Sem isso não há venda |
| Estoque | Sem isso o estoque não baixa |
| Peso, Altura, Largura, Comprimento | **Sem isso nenhuma calculadora de frete funciona, em plataforma nenhuma** |
| Descrição | Opcional, mas ajuda a aparecer no Google |

Peso e dimensões são da **peça embalada**, não da peça solta. Vale pesar
uma vez cada tipo (vestido, casaco, calça) e repetir o valor.

Os nomes das dez peças foram escritos por mim a partir do que aparece em
cada foto. Não são os nomes oficiais da loja: troque antes de importar.

## O que fica do site atual

O site continua no ar em `gusilvacruz1-source.github.io/ruflo/lumiere/`.
Quando a loja na plataforma estiver pronta, ele pode virar a página de
apresentação da marca, apontando para a loja, ou ser aposentado. O domínio
próprio, se houver, aponta para um dos dois.

## Especificação do design, para portar o tema

Cores:

| Token | Valor | Uso |
|---|---|---|
| `--page` | `#ffffff` | fundo |
| `--blush` | `#f7efe9` | fundo da célula de produto e da faixa da marca |
| `--ink` | `#111111` | texto principal, 18.9:1 |
| `--ink-2` | `#6b6b6b` | texto secundário, 5.3:1 |
| `--brass` | `#7a5d28` | acento único, 6.2:1 |
| `--gold` | `#d8ab68` | dourado do hero, em área grande |
| `--gold-c` | `#f0d3a3` | ouro claro, texto miúdo sobre o vídeo |
| `--rule` | `#e6e0da` | fio de 1px |

Tipografia: **Bodoni Moda** itálico no logotipo, **Archivo** em todo o
resto. As duas estão auto-hospedadas em `fonts/`.

Estrutura: barra de aviso rolando, nav com categorias ao centro, hero em
faixa com o logo por cima, grade de cinco colunas com fios de 1px, faixa de
três fotos editoriais, faixa da marca em Bodoni, linhas de entrega.

O logo (`img/logo.webp`) tem transparência de verdade, mas **só funciona
sobre fundo escuro**: no claro o halo do brilho vira mancha cinza. Em área
clara, use o nome em texto.

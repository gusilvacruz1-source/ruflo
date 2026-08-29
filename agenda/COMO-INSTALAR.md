# Agenda na planilha do Google

Liga o agendamento do site a uma planilha sua. Depois disso o horário
que um cliente marcar some da lista para os próximos visitantes, e a
marcação cai na planilha com dia, hora, barbeiro, cliente e serviço.

Enquanto isso não estiver configurado o site continua funcionando: ele
mostra todos os horários e abre o WhatsApp, sem reservar nada.

---

## 1. Criar a planilha

1. Abra <https://sheets.new> (cria uma planilha em branco).
2. Dê um nome, por exemplo **Agenda Danber**.

Não precisa criar colunas — o código cria a aba `Agendamentos` com os
títulos certos na primeira vez que alguém marcar.

## 2. Colar o código

1. Na planilha, menu **Extensões → Apps Script**.
2. Apague todo o conteúdo que aparece no editor.
3. Cole o conteúdo do arquivo `Codigo.gs` (está nesta mesma pasta).
4. Clique no ícone de salvar.

## 3. Publicar

1. Botão **Implantar → Nova implantação**.
2. No engrenagem ao lado de "Selecione o tipo", escolha **App da Web**.
3. Preencha:
   - **Executar como:** Eu (seu e-mail)
   - **Quem pode acessar:** **Qualquer pessoa**
4. Clique em **Implantar**.

> **Atenção nesses dois pontos, que é onde todo mundo trava:**
>
> - "Quem pode acessar" precisa ser **Qualquer pessoa**, não "Qualquer
>   pessoa com Conta do Google". Com a segunda opção o site não
>   consegue consultar a agenda.
>
> - Na primeira vez o Google pede autorização e mostra um aviso de app
>   não verificado. É esperado, porque o app é seu e não passou por
>   revisão do Google. Clique em **Avançado → Acessar (não seguro)** e
>   depois em **Permitir**.

## 4. Copiar o endereço

No fim aparece **URL do app da Web**, algo como:

```
https://script.google.com/macros/s/AKfy...muito-longo.../exec
```

Copie esse endereço e me mande, ou cole você mesmo em `js/script.js`,
na linha:

```js
var AGENDA_URL = '';
```

Ficando:

```js
var AGENDA_URL = 'https://script.google.com/macros/s/AKfy.../exec';
```

---

## Como usar no dia a dia

A planilha tem uma linha por marcação:

| Marcado em | Data | Hora | Barbeiro | Cliente | Telefone | Serviço | Status |
|---|---|---|---|---|---|---|---|

- **Para cancelar um horário e liberá-lo de novo no site:** escreva
  `Cancelado` na coluna **Status** daquela linha. O horário volta a
  aparecer para os clientes em seguida.
- **Para bloquear um horário na mão** (almoço, médico, folga): crie uma
  linha preenchendo Data, Hora e Barbeiro. O site passa a mostrar
  aquele horário como reservado.
- **Quem escolheu "Tanto faz"** entra na planilha já com o nome do
  barbeiro que o sistema encaixou — o primeiro que estava livre naquele
  horário.

A planilha é sua e fica privada. O site só consegue ler os horários
ocupados e escrever linhas novas; os nomes dos clientes nunca aparecem
para quem visita o site.

## Se mudar o código depois

Não basta salvar: é preciso **Implantar → Gerenciar implantações →
ícone de lápis → Versão: Nova versão → Implantar**. O endereço continua
o mesmo.

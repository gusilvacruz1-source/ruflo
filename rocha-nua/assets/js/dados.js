/* =====================================================================
   DADOS.JS  ·  o conteúdo que muda fica todo aqui

   Este é o único arquivo que você precisa abrir para atualizar o site.
   Nada aqui está inventado: as listas nascem vazias de propósito, e a
   página mostra um estado vazio honesto enquanto estiverem assim.

   Preencha e salve. Não precisa mexer no HTML nem no CSS.
   ===================================================================== */

window.ROCHA = {

  /* -------------------------------------------------------------------
     AO VIVO
     Um bloco por música: o nome aparece POR CIMA do vídeo. Se for cover,
     ponha quem fez em "artista"; se for música da banda, troque por
     "autoral: true".

     Para trocar qual música é qual vídeo, basta inverter as duas linhas
     de "video" e "cartaz" — nada de código.
     ------------------------------------------------------------------- */
  aoVivo: [
    {
      musica: 'Vou Deixar',
      artista: 'Skank',
      video: 'assets/video/ao-vivo.mp4',
      cartaz: 'assets/img/ao-vivo-poster.webp',
    },
    {
      musica: 'Wicked Game',
      artista: 'Chris Isaak',
      video: 'assets/video/ao-vivo-2.mp4',
      cartaz: 'assets/img/ao-vivo-2-poster.webp',
    },
    {
      musica: 'Zóio de Lula',
      artista: 'Charlie Brown Jr.',
      video: 'assets/video/ao-vivo-3.mp4',
      cartaz: 'assets/img/ao-vivo-3-poster.webp',
    },
    {
      musica: 'Distraído na Escravidão',
      autoral: true,
      video: 'assets/video/ao-vivo-4.mp4',
      cartaz: 'assets/img/ao-vivo-4-poster.webp',
    },
  ],

  /* -------------------------------------------------------------------
     AGENDA
     "data" no formato AAAA-MM-DD (o site formata para português).
     Shows com data passada somem sozinhos da lista.

     Exemplo:
       { data: '2026-03-14', local: 'Nome do bar', cidade: 'Imbaú, PR',
         hora: '22h', link: '' },
     ------------------------------------------------------------------- */
  agenda: [],

  /* -------------------------------------------------------------------
     VÍDEOS
     Só o ID do vídeo do YouTube, não a URL inteira. O ID é o pedaço
     depois de "v=" ou depois de "youtu.be/".

     Exemplo:  https://www.youtube.com/watch?v=dQw4w9WgXcQ
     vira:     { id: 'dQw4w9WgXcQ', titulo: 'Nome do vídeo' },
     ------------------------------------------------------------------- */
  videos: [],

  /* -------------------------------------------------------------------
     CONTRATAÇÃO
     Enquanto whatsapp e email estiverem vazios, o site manda a pessoa
     para o direct do Instagram, que já existe e funciona.

     whatsapp: só números, com DDI e DDD. Ex.: '5542988084236'
     ------------------------------------------------------------------- */
  contato: {
    whatsapp: '',
    email: '',
    instagram: 'rocha.nua',
    youtube: 'https://youtube.com/@rochanuarockband'
  }

};

/**
 * BARBEARIA DANBER — agenda
 *
 * Roda dentro da planilha do Google (Extensões > Apps Script) e faz duas coisas:
 *   1. responde quais horários já estão marcados, pro site riscá-los;
 *   2. grava uma marcação nova, conferindo antes se o horário ainda está livre.
 *
 * Instalação: agenda/COMO-INSTALAR.md
 */

const VERSAO     = 2;   // confere se a implantação nova entrou no ar
const ABA        = 'Agendamentos';
const BARBEIROS  = ['Xandinho', 'Danilo', 'Adriel'];
const CANCELADO  = 'cancelado';

const COLUNAS = ['Marcado em', 'Data', 'Hora', 'Barbeiro', 'Cliente', 'Telefone', 'Serviço', 'Status'];

/* Índices das colunas (0 = coluna A) */
const C_DATA = 1, C_HORA = 2, C_BARB = 3, C_STATUS = 7;

/* ------------------------------------------------------------------ */
/* Leitura                                                             */
/* ------------------------------------------------------------------ */
function doGet(e) {
  try {
    const de  = (e.parameter.de  || '').slice(0, 10);
    const ate = (e.parameter.ate || '').slice(0, 10);

    /* ?acao=debug mostra como cada célula foi lida. Só data, hora e
       barbeiro — nome de cliente nunca sai daqui. */
    if (e.parameter.acao === 'debug') {
      const vis = aba().getDataRange().getDisplayValues().slice(1, 11);
      return responde({
        ok: true, versao: VERSAO,
        linhas: vis.map(function (l) {
          return {
            celula: { data: l[C_DATA], hora: l[C_HORA], barbeiro: l[C_BARB], status: l[C_STATUS] },
            lido:   { data: comoData(l[C_DATA]), hora: comoHora(l[C_HORA]) }
          };
        }),
        marcados: marcados(de, ate)
      });
    }

    return responde({ ok: true, versao: VERSAO, marcados: marcados(de, ate) });
  } catch (err) {
    return responde({ ok: false, erro: String(err) });
  }
}

function marcados(de, ate) {
  /* getDisplayValues devolve o texto exatamente como aparece na célula.
     Com getValues, uma célula de hora volta como objeto Date de 1899 e
     qualquer conversão de fuso desloca o horário em alguns minutos. */
  const vis = aba().getDataRange().getDisplayValues();
  const saida = [];

  for (let i = 1; i < vis.length; i++) {
    const data     = comoData(vis[i][C_DATA]);
    const hora     = comoHora(vis[i][C_HORA]);
    const barbeiro = comoTexto(vis[i][C_BARB]);
    const status   = comoTexto(vis[i][C_STATUS]).toLowerCase();

    if (!data || !hora || !barbeiro) continue;
    if (status === CANCELADO) continue;          // cancelado libera o horário
    if (de && data < de) continue;
    if (ate && data > ate) continue;

    saida.push(data + '|' + hora + '|' + barbeiro);
  }
  return saida;
}

/* ------------------------------------------------------------------ */
/* Escrita                                                             */
/* ------------------------------------------------------------------ */
function doPost(e) {
  /* O site manda o corpo como text/plain de propósito: assim o navegador
     não dispara a checagem de CORS, que o Apps Script não responde. */
  let p;
  try {
    p = JSON.parse(e.postData.contents);
  } catch (err) {
    return responde({ ok: false, erro: 'corpo inválido' });
  }

  const data     = comoData(p.data);
  const hora     = comoHora(p.hora);
  const pedido   = comoTexto(p.barbeiro);
  const cliente  = comoTexto(p.cliente).slice(0, 60);
  const telefone = comoTexto(p.telefone).slice(0, 30);
  const servico  = comoTexto(p.servico).slice(0, 60);

  if (!data || !hora || !servico) {
    return responde({ ok: false, erro: 'faltam dados' });
  }

  /* Sem a trava, dois clientes que confirmam no mesmo segundo gravariam
     os dois no mesmo horário. A trava põe um de cada vez. */
  const trava = LockService.getScriptLock();
  try {
    trava.waitLock(20000);
  } catch (err) {
    return responde({ ok: false, erro: 'ocupado, tente de novo' });
  }

  try {
    const ocupados = {};
    marcados(data, data).forEach(function (m) { ocupados[m] = true; });

    /* "Tanto faz" vira um barbeiro de verdade: o primeiro livre no horário. */
    let barbeiro = pedido;
    if (BARBEIROS.indexOf(barbeiro) === -1) {
      barbeiro = null;
      for (let i = 0; i < BARBEIROS.length; i++) {
        if (!ocupados[data + '|' + hora + '|' + BARBEIROS[i]]) { barbeiro = BARBEIROS[i]; break; }
      }
      if (!barbeiro) {
        return responde({ ok: false, motivo: 'lotado', erro: 'todos ocupados nesse horário' });
      }
    } else if (ocupados[data + '|' + hora + '|' + barbeiro]) {
      return responde({ ok: false, motivo: 'ocupado', erro: 'horário já foi marcado' });
    }

    aba().appendRow([new Date(), data, hora, barbeiro, cliente, telefone, servico, 'Confirmado']);
    return responde({ ok: true, versao: VERSAO, barbeiro: barbeiro });

  } finally {
    trava.releaseLock();
  }
}

/* ------------------------------------------------------------------ */
/* Apoio                                                               */
/* ------------------------------------------------------------------ */
function aba() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let a = planilha.getSheetByName(ABA);
  if (!a) {
    a = planilha.insertSheet(ABA);
    a.appendRow(COLUNAS);
    a.getRange(1, 1, 1, COLUNAS.length).setFontWeight('bold');
    a.setFrozenRows(1);
  }
  /* Sem isto o Sheets converte "2026-09-01" em data e "09:00" em hora.
     Como texto, o que é gravado é exatamente o que é lido de volta. */
  a.getRange('B:C').setNumberFormat('@');
  return a;
}

function comoTexto(v) {
  return (v === null || v === undefined) ? '' : String(v).trim();
}

/* Aceita 2026-09-01 e também 01/09/2026, que é como o Sheets mostra data
   em planilha configurada em português. Devolve sempre aaaa-mm-dd. */
function comoData(v) {
  const t = comoTexto(v);
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[1] + '-' + m[2] + '-' + m[3];
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
  return '';
}

/* Aceita 9:00, 09:00 e 09:00:00. Devolve sempre HH:mm. */
function comoHora(v) {
  const m = comoTexto(v).match(/^(\d{1,2}):(\d{2})/);
  return m ? ('0' + m[1]).slice(-2) + ':' + m[2] : '';
}

function responde(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

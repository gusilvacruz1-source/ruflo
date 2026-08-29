/**
 * BARBEARIA DANBER — agenda
 *
 * Este código roda dentro da planilha do Google (Extensões > Apps Script).
 * Ele faz duas coisas:
 *   1. responde quais horários já estão marcados, pro site apagá-los da lista;
 *   2. grava uma marcação nova, conferindo antes se o horário ainda está livre.
 *
 * As instruções de instalação estão em agenda/COMO-INSTALAR.md
 */

const ABA        = 'Agendamentos';
const BARBEIROS  = ['Xandinho', 'Danilo', 'Adriel'];
const CANCELADO  = 'cancelado';

/* Colunas da planilha, na ordem em que são escritas. */
const COLUNAS = ['Marcado em', 'Data', 'Hora', 'Barbeiro', 'Cliente', 'Telefone', 'Serviço', 'Status'];

/* ------------------------------------------------------------------ */
/* Leitura: quais horários já estão ocupados                           */
/* ------------------------------------------------------------------ */
function doGet(e) {
  try {
    const de  = (e.parameter.de  || '').slice(0, 10);
    const ate = (e.parameter.ate || '').slice(0, 10);
    return responde({ ok: true, marcados: marcados(de, ate) });
  } catch (err) {
    return responde({ ok: false, erro: String(err) });
  }
}

function marcados(de, ate) {
  const linhas = aba().getDataRange().getValues();
  const saida = [];

  for (let i = 1; i < linhas.length; i++) {
    const l = linhas[i];
    const data = texto(l[1]), hora = texto(l[2]), barbeiro = texto(l[3]);
    const status = texto(l[7]).toLowerCase();

    if (!data || !hora || !barbeiro) continue;
    if (status === CANCELADO) continue;              // horário cancelado volta a ficar livre
    if (de && data < de) continue;
    if (ate && data > ate) continue;

    saida.push(data + '|' + hora + '|' + barbeiro);
  }
  return saida;
}

/* ------------------------------------------------------------------ */
/* Escrita: grava a marcação                                           */
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

  const data     = texto(p.data).slice(0, 10);
  const hora     = texto(p.hora).slice(0, 5);
  const pedido   = texto(p.barbeiro);
  const cliente  = texto(p.cliente).slice(0, 60);
  const telefone = texto(p.telefone).slice(0, 30);
  const servico  = texto(p.servico).slice(0, 60);

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

    /* "Tanto faz" vira um barbeiro de verdade: o primeiro livre naquele horário. */
    let barbeiro = pedido;
    if (!barbeiro || BARBEIROS.indexOf(barbeiro) === -1) {
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
    return responde({ ok: true, barbeiro: barbeiro });

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
  return a;
}

/* Data pode voltar da planilha como texto ou como objeto Date, dependendo
   de como a célula foi preenchida. Normaliza os dois para texto. */
function texto(v) {
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v).trim();
}

function responde(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

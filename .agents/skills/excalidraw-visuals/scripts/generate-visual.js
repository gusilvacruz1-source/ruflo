#!/usr/bin/env node
/**
 * Gera uma imagem no estilo quadro branco (Excalidraw) a partir de uma
 * descrição de cena.
 *
 *   node generate-visual.js "três caixas ligadas por setas" --saida fluxo.png
 *   node generate-visual.js "…" --apenas-prompt
 *
 * Sem provedor configurado, use --apenas-prompt: o prompt final sai no
 * terminal, pronto para colar em qualquer ferramenta de imagem.
 */
import { writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const PREFIXO = `hand-drawn whiteboard sketch in the style of Excalidraw,
black marker on clean white background, rough uneven strokes,
simple geometric shapes, short handwritten labels,
flat — no shading, no gradients, no drop shadows,
generous white space, centered composition`;

const NEGATIVO = `photorealistic, 3D render, gradients, glossy, drop shadow,
stock photo, watermark, signature, dense paragraphs of text, cluttered`;

const ACENTO = process.env.VISUAL_ACENTO ?? 'warm amber (#f0b429)';

function argumentos(argv) {
  const cena = argv.find((a) => !a.startsWith('--'));
  const pega = (nome, padrao) => {
    const i = argv.indexOf(`--${nome}`);
    return i === -1 ? padrao : argv[i + 1];
  };
  return {
    cena,
    saida: pega('saida', 'visual.png'),
    proporcao: pega('proporcao', '16:9'),
    apenasPrompt: argv.includes('--apenas-prompt'),
  };
}

function montaPrompt({ cena, proporcao }) {
  return [
    PREFIXO,
    '',
    cena,
    '',
    `single accent color: ${ACENTO}, used only on the highlighted element.`,
    `aspect ratio ${proporcao}, wide margins.`,
  ].join('\n');
}

/**
 * Adaptador do provedor. O corpo da requisição muda de serviço para serviço
 * (Gemini / Nano Banana, kie.ai, e outros) e os contratos mudam com o tempo —
 * confira a documentação atual do seu antes de confiar nesta forma.
 *
 * Espera-se que devolva um Buffer com o PNG.
 */
async function envia(prompt) {
  const url = process.env.IMAGE_API_URL;
  const chave = process.env.IMAGE_API_KEY;
  const modelo = process.env.IMAGE_MODEL;

  if (!url || !chave) {
    throw new Error(
      'IMAGE_API_URL e IMAGE_API_KEY não configuradas. ' +
        'Rode com --apenas-prompt para obter o prompt e gerar por outro caminho.'
    );
  }

  const resposta = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${chave}`,
    },
    body: JSON.stringify({ model: modelo, prompt, negative_prompt: NEGATIVO }),
  });

  if (!resposta.ok) {
    throw new Error(`provedor respondeu ${resposta.status}: ${await resposta.text()}`);
  }

  const corpo = await resposta.json();
  // Dois formatos comuns: base64 embutido ou URL para baixar.
  const base64 = corpo?.data?.[0]?.b64_json ?? corpo?.image?.base64 ?? corpo?.b64_json;
  if (base64) return Buffer.from(base64, 'base64');

  const endereco = corpo?.data?.[0]?.url ?? corpo?.image?.url ?? corpo?.url;
  if (endereco) return Buffer.from(await (await fetch(endereco)).arrayBuffer());

  throw new Error(
    'não achei a imagem na resposta — ajuste a função envia() para o formato do seu provedor:\n' +
      JSON.stringify(corpo).slice(0, 400)
  );
}

const opcoes = argumentos(process.argv.slice(2));

if (!opcoes.cena) {
  console.error('uso: generate-visual.js "descrição da cena" [--saida arquivo.png] [--apenas-prompt]');
  process.exit(1);
}

const prompt = montaPrompt(opcoes);

if (opcoes.apenasPrompt) {
  console.log(prompt);
  console.log('\n--- negativo ---\n' + NEGATIVO);
  process.exit(0);
}

const imagem = await envia(prompt);
mkdirSync(dirname(opcoes.saida), { recursive: true });
await writeFile(opcoes.saida, imagem);

// O prompt fica ao lado da imagem: é o que mantém a próxima figura da série
// parecendo da mesma mão.
const aoLado = join(dirname(opcoes.saida), basename(opcoes.saida, '.png') + '.prompt.txt');
await writeFile(aoLado, prompt + '\n\n--- negativo ---\n' + NEGATIVO + '\n');

console.log(`imagem: ${opcoes.saida}`);
console.log(`prompt: ${aoLado}`);

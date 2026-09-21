"""Recorta foto de fundo branco no padrao do site: 720x720, RGBA, produto
centrado com folga.

Limiar simples de branco nao serve: o cabo de madeira e claro e o inox tem
realce quase branco, entao o produto ficaria furado. A saida e usar a
CONEXAO: o fundo encosta na borda da imagem, o produto nao. Marco tudo que e
quase branco, separo em regioes conectadas e so viram fundo as que tocam a
borda. O realce no meio da lamina fica preso dentro do produto e sobrevive.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

def recorta(entrada, saida, lado=720, folga=0.055, limiar=238, altura=None):
    """altura: forca a peca a ocupar exatamente esta altura em pixels. Serve
    para variacoes de cor do MESMO produto: se cada foto vier num tamanho, a
    peca pula de tamanho quando o cliente troca a cor na bolinha."""
    im = Image.open(entrada).convert('RGB')
    a = np.asarray(im).astype(np.int16)

    # LIMIAR TIRADO DA PROPRIA FOTO. Um valor fixo quebra nos dois extremos:
    # alto demais deixa sombra suave virar produto, baixo demais come peca
    # clara. A caneca BRANCA foi o caso limite - corpo em 236, fundo em 255,
    # e o limiar fixo de 238 comia metade dela. A borda da imagem e fundo por
    # definicao, entao ela mesma diz onde fica o corte.
    borda = np.concatenate([a[0, :], a[-1, :], a[:, 0], a[:, -1]])
    piso = int(np.median(borda.min(axis=1))) - 10
    limiar = max(limiar, piso)

    quase_branco = (a.min(axis=2) >= limiar) & (a.max(axis=2) - a.min(axis=2) <= 12)
    regioes, n = ndimage.label(quase_branco)
    borda = set(regioes[0, :]) | set(regioes[-1, :]) | set(regioes[:, 0]) | set(regioes[:, -1])
    borda.discard(0)
    fundo = np.isin(regioes, list(borda))

    # BURACOS FECHADOS. O vao da alca de uma caneca e fundo, mas nao toca a
    # borda da imagem: pela regra da conexao ele ficaria branco opaco, e foi
    # o que aconteceu na primeira tentativa. Nao da para simplesmente mandar
    # todo branco fechado virar fundo, senao uma peca branca some inteira.
    # O que separa um do outro e a TEXTURA: fundo de estudio e chapado, com
    # desvio padrao quase zero; superficie de produto tem sombreado. Entao um
    # buraco so vira fundo se for liso E da mesma cor da borda.
    cor_borda = a[fundo].mean(axis=0) if fundo.any() else np.array([255., 255., 255.])
    for r in range(1, n + 1):
        reg = regioes == r
        if fundo[reg].any() or reg.sum() < 40:
            continue
        px = a[reg]
        if px.std() < 2.0 and np.abs(px.mean(axis=0) - cor_borda).max() < 3.0:
            fundo |= reg

    alfa = np.where(fundo, 0, 255).astype(np.uint8)
    # tira pontinhos soltos que sobraram de sombra suave
    alfa = ndimage.binary_closing(alfa > 0, np.ones((3, 3))).astype(np.uint8) * 255
    alfa = np.asarray(Image.fromarray(alfa).filter(ImageFilter.GaussianBlur(0.6)))

    rgba = np.dstack([np.asarray(im), alfa])
    corte = Image.fromarray(rgba, 'RGBA')
    caixa = corte.getbbox()
    if not caixa:
        raise SystemExit('nada sobrou no recorte de ' + entrada)
    corte = corte.crop(caixa)

    util = int(lado * (1 - 2 * folga))
    if altura:
        # thumbnail so encolhe; aqui a peca pode precisar CRESCER para bater
        # com a irma de outra cor
        esc = altura / corte.height
        corte = corte.resize((max(1, round(corte.width * esc)), altura), Image.LANCZOS)
    else:
        corte.thumbnail((util, util), Image.LANCZOS)
    final = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    final.paste(corte, ((lado - corte.width) // 2, (lado - corte.height) // 2), corte)
    final.save(saida, quality=86, method=6)
    cob = (np.asarray(final)[:, :, 3] > 8).mean()
    print(f'{saida.split("/")[-1]}: {corte.width}x{corte.height} dentro de {lado}, '
          f'{cob*100:.0f}% de area util')

if __name__ == '__main__':
    recorta(sys.argv[1], sys.argv[2])

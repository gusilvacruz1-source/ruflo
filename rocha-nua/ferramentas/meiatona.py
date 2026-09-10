"""Retícula de meia-tona: transforma foto em ponto de impressa.

Saida bilevel (preto sobre branco). A cor nao vem daqui: vem do CSS,
por mistura sobre o fundo da faixa. Um arquivo serve faixa rubra e
faixa noite, so mudando o blend.
"""
import math, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageOps

def meiatona(src, dst, largura, passo=6, angulo=45, contraste=1.0,
             brilho=1.0, corte=None, ss=2, ganho=1.44):
    im = Image.open(src).convert('L')
    if corte:                       # (esq, topo, dir, baixo) em fracao
        w, h = im.size
        im = im.crop((int(w*corte[0]), int(h*corte[1]),
                      int(w*corte[2]), int(h*corte[3])))
    alt = round(im.height * largura / im.width)
    im = im.resize((largura, alt), Image.LANCZOS)
    im = ImageOps.autocontrast(im, cutoff=1)
    if contraste != 1.0: im = ImageEnhance.Contrast(im).enhance(contraste)
    if brilho    != 1.0: im = ImageEnhance.Brightness(im).enhance(brilho)

    w, h = im.size
    diag = int(math.hypot(w, h)) + passo * 4
    grande = Image.new('L', (diag, diag), 255)
    grande.paste(im, ((diag - w) // 2, (diag - h) // 2))
    rot = grande.rotate(angulo, resample=Image.BICUBIC, fillcolor=255)

    # media por celula sem laco: reamostra em BOX.
    celulas = diag // passo
    medias = rot.resize((celulas, celulas), Image.BOX).load()

    tela = Image.new('L', (diag * ss, diag * ss), 255)
    d = ImageDraw.Draw(tela)
    raio_max = passo * ss / 2 * ganho
    for cy in range(celulas):
        for cx in range(celulas):
            escuro = 1.0 - medias[cx, cy] / 255.0
            if escuro <= 0.012: continue
            r = raio_max * math.sqrt(escuro)
            x = (cx + .5) * passo * ss
            y = (cy + .5) * passo * ss
            d.ellipse([x - r, y - r, x + r, y + r], fill=0)

    tela = tela.resize((diag, diag), Image.LANCZOS)
    tela = tela.rotate(-angulo, resample=Image.BICUBIC, fillcolor=255)
    e, t = (diag - w) // 2, (diag - h) // 2
    out = tela.crop((e, t, e + w, t + h))

    # Volta a ser bilevel. O reduzir com LANCZOS suaviza a borda do ponto, e
    # meio-tom nao comprime: a mesma chapa sai com 373 KB em cinza contra
    # 20 KB em preto e branco puro. Toda chapa publicada e bilevel; sem esta
    # linha a ferramenta nao reproduz o que esta no site.
    out = out.point(lambda v: 0 if v < 128 else 255, 'L')

    out.convert('RGB').save(dst, 'WEBP', lossless=True, quality=100, method=6)
    return out.size

if __name__ == '__main__':
    # sys.argv chega tudo como texto; sem converter, `largura / im.width`
    # estoura com TypeError e a linha de comando do README nao roda.
    nums = {2: int, 3: int, 4: int, 5: float, 6: float}
    args = [a if i == 0 or i == 1 else nums.get(i, float)(a)
            for i, a in enumerate(sys.argv[1:])]
    print(meiatona(*args))

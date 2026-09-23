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

def recorta(entrada, saida, lado=720, folga=0.055, limiar=238, altura=None,
            represa=False, franja=2, sombra=0, vao_min=40, sombra_base=0.0,
            sombra_piso=205, desvio_max=1.2, desfranja=0, so_maior=False,
            limiar_fixo=None):
    """represa: usa a aresta como barreira do preenchimento. So e preciso
    quando a peca tem parte BRANCA encostando no fundo branco - a alca da
    caneca termica de 350 ml mede 255, igual ao fundo, e sem a represa ela
    sai rasgada. Ligada a toa, a represa deixa franja clara em volta.

    franja: quantas passadas comem a franja que a represa deixa. Com represa
    desligada nao ha franja para comer. Passadas demais atravessam areas
    lisas e claras da propria peca - furaram a tampa da 350 ml."""
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
    # limiar_fixo: o max() acima nunca deixa o corte cair abaixo de 238. Com
    # fundo branco ou o cinza 247 do Mercado Livre isso e o certo. Mas a foto
    # de detalhe do copo long neck laranja tem fundo 238-241 que escurece ate
    # 223 em volta da base: com o corte em 238 todo esse cinza virava produto
    # e o copo saia com um halo. Aqui o corte e dado na mao.
    if limiar_fixo is not None:
        limiar = limiar_fixo

    quase_branco = (a.min(axis=2) >= limiar) & (a.max(axis=2) - a.min(axis=2) <= 12)

    # ARESTA COMO BARREIRA. A alca BRANCA da caneca termica de 350 ml mede
    # exatamente 255, o mesmo valor do fundo: nenhum limiar separa dois
    # numeros iguais, e o preenchimento entrava pela alca e a rasgava.
    # Mas a aresta existe mesmo quando a cor nao muda - a peca tem contorno,
    # nem que seja de um nivel de cinza. Marcando a aresta como nao-fundo, ela
    # vira uma represa: o preenchimento vem da borda da imagem e para ali.
    if represa:
        g = a.mean(axis=2)
        aresta = np.hypot(ndimage.sobel(g, axis=1), ndimage.sobel(g, axis=0)) > 6
        quase_branco &= ~aresta

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
        if fundo[reg].any() or reg.sum() < vao_min:
            continue
        px = a[reg]
        # Duas peneiras, e as duas foram precisas.
        # O desvio separa fundo de superficie: fundo de estudio e chapado,
        # produto tem sombreado. Um realce do inox media 1,96 com o limite em
        # 2,0 e passava raspando; o vao da alca, que e fundo de verdade, mede
        # 0,75. Dai 1,2.
        # A AREA separa o que o desvio nao separa: na caneca BRANCA os realces
        # chapados tambem sao lisos E da cor do fundo (436 e 354 px), enquanto
        # o vao da alca tem 8.556. Por isso vao_min existe como parametro.
        # desvio_max: 1.2 vale para foto de estudio limpa. Print de anuncio
        # (Mercado Livre, JPEG recomprimido) tem ruido de compressao ate no
        # fundo liso: o vao da alca da garrafa de 800 ml com base de silicone
        # media 1.38 com a cor a 0.53 do fundo - era fundo, e ficava cinza
        # dentro da alca. Nesses prints, 1.6 com vao_min alto pra nao abrir
        # realce de metal.
        if px.std() < desvio_max and np.abs(px.mean(axis=0) - cor_borda).max() < 3.0:
            fundo |= reg

    # A represa cobra um preco: o anel de pixels da propria aresta nunca entra
    # no fundo, e sobra como franja clara em volta da peca. Aqui ela e comida
    # de volta - duas passadas de dilatacao que so avancam sobre quase-branco
    # SEM a barreira. Dois pixels e o suficiente para a franja e pouco demais
    # para estragar a alca branca, que e o que a represa protegia.
    # SOMBRA SUAVE. As fotos de estudio tem uma sombra de contato sob a peca
    # que desce de 255 ate uns 225 e nunca cruza o limiar do fundo: sobrava
    # como mancha clara colada na base. Ela e cinza e MUITO mais clara que
    # qualquer parte pintada da peca - o corpo da caneca cinza esta em 85 -,
    # entao alguns passos de crescimento sobre cinza claro a levam embora.
    # O piso de 205 serve para peca clara, onde ele e a unica coisa que impede
    # a limpeza de entrar na peca. No kit de garrafa PRETO nao ha nada claro na
    # peca, e a sombra de contato desce ate 155 - com o piso em 205 a dilatacao
    # parava no meio dela e sobrava uma cunha cinza colada na base do saco, bem
    # visivel sobre o card escuro. Baixar o piso so e seguro junto com
    # sombra_base, que limita a limpeza a faixa onde a sombra mora: no kit a
    # sombra comeca em y=466 de 520 e o aro de inox mais baixo das xicaras para
    # em y=460, entao sombra_base=0.11 passa entre os dois.
    if sombra:
        claro_cinza = ((a.min(axis=2) >= sombra_piso)
                       & (a.max(axis=2) - a.min(axis=2) <= 14))
        # Peca CLARA nao aceita a limpeza no quadro inteiro: o corpo da caneca
        # branca esta acima do piso de 205 e seria comido pelas beiradas. Mas a
        # sombra de contato mora EMBAIXO da peca, entao basta restringir a
        # limpeza a essa faixa. sombra_base=0.16 = so os 16% de baixo.
        if sombra_base:
            faixa = np.zeros(claro_cinza.shape, bool)
            faixa[int(claro_cinza.shape[0] * (1 - sombra_base)):, :] = True
            claro_cinza &= faixa
        for _ in range(sombra):
            fundo |= ndimage.binary_dilation(fundo) & claro_cinza

    if represa and franja:
        claro = (a.min(axis=2) >= limiar) & (a.max(axis=2) - a.min(axis=2) <= 12)
        for _ in range(franja):
            fundo |= ndimage.binary_dilation(fundo) & claro

    # NOTA sobre a franja que a represa deixa em peca clara: o anel e feito de
    # pixels de GRADIENTE, abaixo do limiar de claro, entao a dilatacao da
    # franja nao avanca sobre eles. Tentei encolher a silhueta em 1 e 2 px para
    # descartar o anel inteiro: funciona na peca, mas come a alca, que e fina e
    # perde metade da espessura. Nao ha parametro para isso porque nao houve
    # valor que servisse - em peca branca sobre fundo branco fica um contorno
    # claro fino na base, visivel so sobre card escuro.
    alfa = np.where(fundo, 0, 255).astype(np.uint8)
    # tira pontinhos soltos que sobraram de sombra suave
    alfa = ndimage.binary_closing(alfa > 0, np.ones((3, 3))).astype(np.uint8) * 255
    # so_maior: fica so a maior peca opaca. No print do copo long neck laranja
    # a sombra das fotos redondas ao lado deixava pontinhos soltos acima da
    # tampa. Desligado por padrao porque ha fotos com mais de uma peca separada
    # (kit com caixa e sacola), e ai todas tem que ficar.
    if so_maior:
        lab, n = ndimage.label(alfa > 0)
        if n > 1:
            tam = ndimage.sum(alfa > 0, lab, range(1, n + 1))
            alfa = np.where(lab == int(np.argmax(tam)) + 1, 255, 0).astype(np.uint8)
    # DESFRANJA. Peca escura sobre fundo claro deixa um contorno de pixels
    # meio-a-meio: na garrafa preta de 800 ml os 2 px da borda tinham brilho
    # 116 contra 37 do corpo, e sobre card escuro isso vira um fio branco em
    # volta da peca. Encolher a silhueta resolveria e comeria a alca (ver a
    # nota acima); aqui a silhueta fica igual e so a COR da faixa de borda e
    # trocada pela do pixel de dentro mais proximo. Desligado por padrao: em
    # peca clara a borda clara e a propria peca.
    rgb = np.asarray(im).copy()
    if desfranja:
        solido = alfa > 0
        miolo = ndimage.binary_erosion(solido, iterations=desfranja)
        if miolo.any():
            _, (iy, ix) = ndimage.distance_transform_edt(~miolo, return_indices=True)
            faixa = solido & ~miolo
            rgb[faixa] = rgb[iy[faixa], ix[faixa]]

    alfa = np.asarray(Image.fromarray(alfa).filter(ImageFilter.GaussianBlur(0.6)))

    rgba = np.dstack([rgb, alfa])
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
        # thumbnail so encolhe, e algumas fotos do fornecedor vem pequenas: a
        # caneca de 350 ml ocupava 271 px contra ~600 das ja cadastradas, e no
        # card apareceria pela metade do tamanho dos vizinhos. Aqui a peca
        # SEMPRE vai para a medida do quadro, crescendo se precisar.
        esc = min(util / corte.width, util / corte.height)
        corte = corte.resize((max(1, round(corte.width * esc)),
                              max(1, round(corte.height * esc))), Image.LANCZOS)
    final = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    final.paste(corte, ((lado - corte.width) // 2, (lado - corte.height) // 2), corte)
    final.save(saida, quality=86, method=6)
    cob = (np.asarray(final)[:, :, 3] > 8).mean()
    print(f'{saida.split("/")[-1]}: {corte.width}x{corte.height} dentro de {lado}, '
          f'{cob*100:.0f}% de area util')

if __name__ == '__main__':
    recorta(sys.argv[1], sys.argv[2])
# ---------------------------------------------------------------------------
# SEGUNDA ESTRATEGIA: silhueta pelo contorno.
#
# A de cima decide pelo brilho e acertou 13 das 15 fotos. Ela erra quando a
# peca tem parte TRANSLUCIDA: a tampa acrilica da caneca termica de 350 ml
# deixa o fundo branco passar, o preenchimento entra por ali e abre frestas
# no meio da tampa.
#
# Esta aqui fecha o contorno e preenche, entao a tampa fica protegida. Em
# troca ela tapa o vao da alca, que e reaberto por TAMANHO - o vao tem 8.656
# px e as frestas da tampa tem centenas.
#
# Nao substitui a primeira: em peca BRANCA ela funde a alca com o vao e o
# buraco some, e nos kits de churrasco deixa halo. Use conforme a peca:
#   corpo escuro + tampa translucida  -> corta()
#   o resto                           -> recorta()
# ---------------------------------------------------------------------------

def corta(entrada, saida, lado=720, folga=0.055, vao_min=3000, suavizar=1.0, sombra=0,
          sombra_piso=205):
    im = Image.open(entrada).convert('RGB')
    a = np.asarray(im).astype(np.int16)
    g = a.mean(axis=2)

    # silhueta pelo contorno: protege a tampa acrilica, que deixa o fundo
    # passar e por isso era lida como buraco
    arestas = np.hypot(ndimage.sobel(g, axis=1), ndimage.sobel(g, axis=0)) > 6
    cheio = ndimage.binary_fill_holes(ndimage.binary_closing(arestas, np.ones((7, 7))))
    lab, n = ndimage.label(cheio)
    tam = ndimage.sum(cheio, lab, range(1, n + 1))
    dentro = lab == (int(np.argmax(tam)) + 1)
    # a silhueta vem 1-2 px inflada pela propria aresta
    dentro = ndimage.binary_erosion(dentro, np.ones((3, 3)), iterations=2)

    # vao da alca: buraco GRANDE, liso e da cor da borda. O tamanho minimo e
    # o que separa o vao (8.656 px) das frestas da tampa (centenas de px)
    orla = np.concatenate([a[0, :], a[-1, :], a[:, 0], a[:, -1]])
    cor = orla.mean(axis=0)
    buracos, m = ndimage.label(~dentro)
    for r in range(1, m + 1):
        reg = buracos == r
        if reg[0, :].any() or reg[-1, :].any() or reg[:, 0].any() or reg[:, -1].any():
            continue
        if reg.sum() >= vao_min and a[reg].std() < 1.5 and np.abs(a[reg].mean(axis=0) - cor).max() < 4.0:
            dentro &= ~reg
    # e o vao pode ter sido tapado pelo fill_holes: reabre pelo brilho
    claro = (a.min(axis=2) >= 245) & (a.max(axis=2) - a.min(axis=2) <= 12)
    lab2, k = ndimage.label(claro & dentro)
    for r in range(1, k + 1):
        reg = lab2 == r
        if reg.sum() >= vao_min and a[reg].std() < 1.5:
            dentro &= ~reg

    # sombra de contato: cinza claro colado na base, que a silhueta abraca
    # junto. Cresce o lado de fora sobre cinza claro e ela sai.
    # sombra_piso: ver a nota em recorta(). Este parametro faltava aqui e a
    # linha abaixo ja o usava - corta(..., sombra=N) dava NameError desde
    # que o piso virou parametro.
    if sombra:
        claro_cinza = ((a.min(axis=2) >= sombra_piso)
                       & (a.max(axis=2) - a.min(axis=2) <= 14))
        fora = ~dentro
        for _ in range(sombra):
            fora |= ndimage.binary_dilation(fora) & claro_cinza
        dentro &= ~fora

    alfa = np.asarray(Image.fromarray((dentro * 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(suavizar)))
    corte = Image.fromarray(np.dstack([np.asarray(im), alfa]), 'RGBA')
    corte = corte.crop(corte.getbbox())
    util = int(lado * (1 - 2 * folga))
    e = min(util / corte.width, util / corte.height)
    corte = corte.resize((round(corte.width * e), round(corte.height * e)), Image.LANCZOS)
    f = Image.new('RGBA', (lado, lado), (0, 0, 0, 0))
    f.paste(corte, ((lado - corte.width) // 2, (lado - corte.height) // 2), corte)
    f.save(saida, quality=86, method=6)
    print(saida.split('/')[-1], corte.size)

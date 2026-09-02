#!/usr/bin/env python3
"""
Prepara fotos de celular ou de camera para o site.

Foto de celular tem 3 a 5 MB. Site nao aguenta isso: a cliente no 4G
desiste antes de carregar. Este script reduz cada foto para o tamanho
que a pagina realmente usa e grava em WebP, que costuma pesar entre um
terco e metade de um JPEG na mesma qualidade.

USO
    python3 ferramentas/otimizar-fotos.py <pasta-de-origem> <pasta-de-destino>

    # exemplos
    python3 ferramentas/otimizar-fotos.py ~/Downloads/fotos margem/img
    python3 ferramentas/otimizar-fotos.py ~/fotos lumiere/img --largura 1400

OPCOES
    --largura N   maior lado da imagem, em pixels (padrao 1600)
    --qualidade N 1 a 100 (padrao 82)
    --jpg         grava tambem um .jpg de reserva, para navegador antigo
    --prefixo X   renomeia a saida para X-01, X-02 e assim por diante

REQUISITO
    pip install Pillow
    # se as fotos forem .HEIC (iPhone), tambem:
    pip install pillow-heif
"""
import argparse, os, sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Falta a Pillow. Rode:  pip install Pillow")

# iPhone grava em HEIC; sem este plugin o script nao le esses arquivos
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIC = True
except ImportError:
    HEIC = False

EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.bmp', '.heic', '.heif'}


def achar_foto(im, limiar=30, corrida=60):
    """Devolve (topo, base) da faixa util de uma captura de tela.

    Captura de celular vem com barra de status em cima e barra de navegacao
    embaixo, ambas quase pretas. Nao basta cortar linhas escuras uma a uma:
    o relogio e os icones da barra de status criam picos de brilho no meio
    do preto, e o corte para cedo demais. Entao procuramos a faixa CONTINUA
    de linhas claras, com pelo menos `corrida` linhas seguidas.
    """
    cinza = im.convert('L')
    L, A = cinza.size
    px = cinza.load()
    passo = max(1, L // 60)
    brilho = [
        sum(px[x, y] for x in range(0, L, passo)) / len(range(0, L, passo))
        for y in range(A)
    ]

    melhor_ini = melhor_fim = ini = None
    melhor = 0
    for y, b in enumerate(brilho + [0.0]):
        if b >= limiar:
            if ini is None:
                ini = y
        elif ini is not None:
            if y - ini > melhor:
                melhor, melhor_ini, melhor_fim = y - ini, ini, y - 1
            ini = None

    if melhor < corrida:
        return 0, A - 1          # nao parece captura: nao corta nada

    # Guarda contra falso positivo. Uma foto normal pode comecar com teto
    # escuro de loja, e teto nao e barra de sistema.
    #
    # Usar o brilho MAXIMO nao serve: o relogio e os icones da barra de
    # status sao claros e estouram qualquer limite. A MEDIANA resolve,
    # porque poucas linhas de texto nao a deslocam. Medido nestas fotos:
    # barra de sistema tem mediana 15, teto escuro de loja tem 80.
    fora = list(range(0, melhor_ini)) + list(range(melhor_fim + 1, A))
    if fora:
        amostra = sorted(brilho[y] for y in fora)
        mediana = amostra[len(amostra) // 2]
        quase_preto = sum(1 for v in amostra if v < 25) / len(amostra)
        if mediana > 25 or quase_preto < 0.6:
            return 0, A - 1

    return melhor_ini, melhor_fim


def humano(n):
    for u in ('B', 'KB', 'MB', 'GB'):
        if n < 1024:
            return f"{n:.0f} {u}" if u == 'B' else f"{n:.1f} {u}"
        n /= 1024
    return f"{n:.1f} TB"


def main():
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument('origem')
    ap.add_argument('destino')
    ap.add_argument('--largura', type=int, default=1600)
    ap.add_argument('--qualidade', type=int, default=82)
    ap.add_argument('--jpg', action='store_true')
    ap.add_argument('--prefixo', default=None)
    ap.add_argument('--cortar-barras', action='store_true',
                    help='remove barra de status e de navegacao de captura de tela')
    a = ap.parse_args()

    if not os.path.isdir(a.origem):
        sys.exit(f"Pasta de origem nao existe: {a.origem}")
    os.makedirs(a.destino, exist_ok=True)

    arquivos = sorted(
        f for f in os.listdir(a.origem)
        if os.path.splitext(f)[1].lower() in EXTS
        and os.path.isfile(os.path.join(a.origem, f))
    )
    if not arquivos:
        sys.exit(f"Nenhuma imagem encontrada em {a.origem}")

    heic = [f for f in arquivos if os.path.splitext(f)[1].lower() in ('.heic', '.heif')]
    if heic and not HEIC:
        print(f"AVISO: {len(heic)} arquivo(s) .HEIC serao pulados.")
        print("       Para incluir, rode:  pip install pillow-heif\n")

    antes = depois = 0
    feitos = pulados = 0

    for i, nome in enumerate(arquivos, 1):
        origem = os.path.join(a.origem, nome)
        ext = os.path.splitext(nome)[1].lower()
        if ext in ('.heic', '.heif') and not HEIC:
            pulados += 1
            continue

        base = f"{a.prefixo}-{i:02d}" if a.prefixo else os.path.splitext(nome)[0]

        try:
            im = Image.open(origem)
            # respeita a rotacao gravada pelo celular, senao a foto sai deitada
            im = ImageOps.exif_transpose(im)

            corte = ''
            if a.cortar_barras:
                y0, y1 = achar_foto(im)
                if y0 > 0 or y1 < im.height - 1:
                    corte = f'  (cortou {y0}px em cima, {im.height - 1 - y1}px embaixo)'
                    im = im.crop((0, y0, im.width, y1 + 1))
            if im.mode not in ('RGB', 'RGBA'):
                im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
            im.thumbnail((a.largura, a.largura), Image.LANCZOS)

            tam_antes = os.path.getsize(origem)
            antes += tam_antes

            saida_webp = os.path.join(a.destino, base + '.webp')
            im.save(saida_webp, 'WEBP', quality=a.qualidade, method=6)
            tam_depois = os.path.getsize(saida_webp)

            if a.jpg:
                saida_jpg = os.path.join(a.destino, base + '.jpg')
                im.convert('RGB').save(saida_jpg, 'JPEG', quality=a.qualidade,
                                       optimize=True, progressive=True)
                tam_depois += os.path.getsize(saida_jpg)

            depois += tam_depois
            feitos += 1
            print(f"{i:3d}/{len(arquivos)}  {nome:<38} "
                  f"{humano(tam_antes):>9} -> {humano(tam_depois):>9}   {im.width}x{im.height}{corte}")
        except Exception as e:
            pulados += 1
            print(f"{i:3d}/{len(arquivos)}  {nome:<38} ERRO: {e}")

    print("\n" + "-" * 74)
    print(f"{feitos} imagem(ns) gravada(s) em {a.destino}" + (f", {pulados} pulada(s)" if pulados else ""))
    if feitos:
        print(f"total: {humano(antes)} -> {humano(depois)}  "
              f"({100 - depois * 100 / antes:.0f}% menor)")
        print(f"media por foto: {humano(depois / feitos)}")


if __name__ == '__main__':
    main()

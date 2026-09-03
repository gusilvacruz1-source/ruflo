#!/usr/bin/env bash
# Extrai a sequência de frames de um vídeo em dois conjuntos — desktop e
# celular — e avisa se o peso passar do teto.
#
#   extrai-frames.sh entrada.mp4 public/cena 160 [--inicio 2.0] [--fim 8.0]
#
# O número de frames é o do desktop; o celular recebe metade, porque lá o
# limite não é a banda, é a memória de imagem decodificada.

set -euo pipefail

if [ $# -lt 3 ]; then
  sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

ENTRADA=$1
SAIDA=$2
FRAMES=$3
shift 3

INICIO=""
FIM=""
LARGURA_DESKTOP=${LARGURA_DESKTOP:-1440}
LARGURA_MOBILE=${LARGURA_MOBILE:-800}
QUALIDADE=${QUALIDADE:-70}
TETO_DESKTOP_MB=${TETO_DESKTOP_MB:-6}
TETO_MOBILE_MB=${TETO_MOBILE_MB:-2.5}

while [ $# -gt 0 ]; do
  case $1 in
    --inicio) INICIO=$2; shift 2 ;;
    --fim)    FIM=$2;    shift 2 ;;
    *) echo "opção desconhecida: $1" >&2; exit 1 ;;
  esac
done

command -v ffmpeg  >/dev/null || { echo "ffmpeg não encontrado" >&2; exit 1; }
command -v ffprobe >/dev/null || { echo "ffprobe não encontrado" >&2; exit 1; }

DURACAO_TOTAL=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$ENTRADA")
: "${INICIO:=0}"
: "${FIM:=$DURACAO_TOTAL}"

TRECHO=$(awk -v a="$FIM" -v b="$INICIO" 'BEGIN { printf "%.4f", a - b }')
awk -v t="$TRECHO" 'BEGIN { if (t <= 0) exit 1 }' || {
  echo "o fim precisa vir depois do início" >&2; exit 1;
}

echo "vídeo: $(ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height -of csv=p=0:s=x "$ENTRADA") · ${DURACAO_TOTAL}s"
echo "trecho: ${INICIO}s → ${FIM}s (${TRECHO}s)"

extrai() {
  local nome=$1 largura=$2 frames=$3
  local destino="$SAIDA/$nome"
  local fps
  fps=$(awk -v f="$frames" -v t="$TRECHO" 'BEGIN { printf "%.6f", f / t }')

  rm -rf "$destino"
  mkdir -p "$destino"

  # -ss antes de -i busca rápido, pelo keyframe mais próximo. Se o primeiro
  # quadro sair fora do lugar, mova o -ss para depois do -i: lento e exato.
  ffmpeg -hide_banner -loglevel error -y \
    -ss "$INICIO" -to "$FIM" -i "$ENTRADA" \
    -vf "fps=${fps},scale=${largura}:-2:flags=lanczos" \
    -c:v libwebp -quality "$QUALIDADE" -compression_level 6 -preset picture \
    "$destino/%04d.webp"

  local contados peso
  contados=$(find "$destino" -name '*.webp' | wc -l | tr -d ' ')
  peso=$(du -sk "$destino" | cut -f1)
  echo "$nome: $contados frames · ${largura}px · $(awk -v k="$peso" 'BEGIN { printf "%.1f", k/1024 }') MB"
  echo "$peso"
}

PESO_DESKTOP=$(extrai desktop "$LARGURA_DESKTOP" "$FRAMES" | tail -1)
PESO_MOBILE=$(extrai mobile "$LARGURA_MOBILE" $((FRAMES / 2)) | tail -1)

avisa() {
  local nome=$1 peso_kb=$2 teto_mb=$3
  awk -v k="$peso_kb" -v t="$teto_mb" -v n="$nome" 'BEGIN {
    mb = k / 1024
    if (mb > t) {
      printf "\n  ⚠ %s passou do teto: %.1f MB (limite %.1f MB)\n", n, mb, t
      printf "    corte o trecho, feche o enquadramento ou reduza a largura —\n"
      printf "    baixar a qualidade abaixo de 60 faz aparecer banda no gradiente.\n"
    }
  }'
}

avisa desktop "$PESO_DESKTOP" "$TETO_DESKTOP_MB"
avisa mobile  "$PESO_MOBILE"  "$TETO_MOBILE_MB"

echo
echo "pronto. Ajuste 'total' de cada conjunto no JavaScript para o número de"
echo "frames impresso acima."

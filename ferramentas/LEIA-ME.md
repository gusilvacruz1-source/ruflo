# Ferramentas

## otimizar-fotos.py

Prepara fotos de celular ou de câmera para os sites deste repositório.

Foto de celular tem 3 a 5 MB. Site não aguenta isso: a cliente no 4G
desiste antes de carregar. O script reduz cada foto para o tamanho que a
página realmente usa e grava em WebP, que pesa entre um terço e metade de
um JPEG na mesma qualidade.

```bash
pip install Pillow
pip install pillow-heif      # só se as fotos forem .HEIC, do iPhone

python3 ferramentas/otimizar-fotos.py <origem> <destino>

# exemplos
python3 ferramentas/otimizar-fotos.py ~/Downloads/fotos margem/img
python3 ferramentas/otimizar-fotos.py ~/fotos lumiere/img --largura 1400 --jpg
```

Opções: `--largura` (maior lado em pixels, padrão 1600), `--qualidade`
(padrão 82), `--jpg` (grava também um JPEG de reserva), `--prefixo`
(renomeia a saída para `nome-01`, `nome-02` e assim por diante).

Ele respeita a rotação gravada pelo celular, então a foto não sai deitada.

Numa foto típica de 4032x3024 com 8,6 MB, a saída fica em torno de
1600px e cai mais de 90% de peso.

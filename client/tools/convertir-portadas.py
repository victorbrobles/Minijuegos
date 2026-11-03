#!/usr/bin/env python3
"""Convierte portadas PNG/JPG a WebP de 512 px (ideal para las tarjetas de la portada).

Uso (desde la carpeta client/):
    pip install pillow
    python tools/convertir-portadas.py            # convierte todo lo que haya en public/covers
    python tools/convertir-portadas.py nueva.png  # o solo un fichero

Los originales se mueven a client/covers-originales/ (fuera de public, así no se publican).
Después apunta el juego a '/covers/<nombre>.webp' en src/games/meta.js.
"""
import glob, os, shutil, sys
from PIL import Image

CARPETA = os.path.join('public', 'covers')
BACKUP = 'covers-originales'
LADO, CALIDAD = 512, 80

archivos = sys.argv[1:] or [f for ext in ('png', 'jpg', 'jpeg') for f in glob.glob(os.path.join(CARPETA, f'*.{ext}'))]
os.makedirs(BACKUP, exist_ok=True)
antes = despues = 0
for f in sorted(archivos):
    im = Image.open(f)
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    im.thumbnail((LADO, LADO), Image.LANCZOS)
    destino = os.path.join(CARPETA, os.path.splitext(os.path.basename(f))[0] + '.webp')
    im.save(destino, 'WEBP', quality=CALIDAD, method=6)
    antes += os.path.getsize(f); despues += os.path.getsize(destino)
    shutil.move(f, os.path.join(BACKUP, os.path.basename(f)))
    print('OK', destino)
if archivos:
    print(f'{antes/1e6:.1f} MB -> {despues/1e6:.2f} MB')
else:
    print('No hay imágenes que convertir.')

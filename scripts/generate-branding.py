"""Render the original AEON ribbon monogram without external dependencies."""
import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'assets' / 'images'
# Two rising ribbons form an open A: an original geometric mark, not the bank logo.
POLYGONS = [([(220, 730), (428, 294), (540, 294), (362, 730)], '#FFFFFF'),
            ([(488, 414), (563, 258), (804, 730), (644, 730)], '#FFFFFF'),
            ([(405, 622), (459, 510), (603, 510), (660, 622)], '#F07AB0')]

def rgb(color):
    return tuple(bytes.fromhex(color.lstrip('#')))

def inside(x, y, points):
    result = False
    j = len(points) - 1
    for i, (xi, yi) in enumerate(points):
        xj, yj = points[j]
        if (yi > y) != (yj > y) and x < (xj-xi)*(y-yi)/(yj-yi)+xi:
            result = not result
        j = i
    return result

def render(name, size, background, scale=1, mono=False):
    rows = bytearray()
    for y in range(size):
        rows.append(0)
        for x in range(size):
            samples = []
            for dy, dx in [(0.25,0.25),(0.25,0.75),(0.75,0.25),(0.75,0.75)]:
                px = ((x+dx)/size*1024-512)/scale+512
                py = ((y+dy)/size*1024-512)/scale+512
                color = (*rgb(background),255) if background else (0,0,0,0)
                for points, fill in POLYGONS:
                    if inside(px,py,points):
                        color = (*rgb('#FFFFFF' if mono else fill),255)
                samples.append(color)
            rows.extend(round(sum(s[c] for s in samples)/4) for c in range(4))
    def chunk(kind, data):
        return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data))
    (ROOT/name).write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(rows))+chunk(b'IEND',b''))

svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#A3195B"/>'
for points, fill in POLYGONS:
    svg += '<polygon points="'+ ' '.join(f'{x},{y}' for x,y in points) +f'" fill="{fill}"/>'
(ROOT/'aeon-mark.svg').write_text(svg+'</svg>\n')
render('icon.png',1024,'#A3195B')
render('android-icon-foreground.png',432,None,0.8)
render('android-icon-monochrome.png',432,None,0.8,True)
render('splash-icon.png',512,None)
render('favicon.png',64,'#A3195B')

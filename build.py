"""Build index.html (3D match viewer). Usage: python3 build.py   (the clip engine in src/p2.js..p3d.js is shared with the 2D rulebook animation)"""
import base64, os
d = os.path.dirname(os.path.abspath(__file__))
js = ''.join(open(f'{d}/src/{f}', encoding='utf-8').read() for f in ['p2.js','p3a.js','p3b.js','p3c.js','p3d.js','v3d.js'])
b64 = base64.b64encode(open(f'{d}/assets/field.jpg','rb').read()).decode()
body = open(f'{d}/src/v3d.html', encoding='utf-8').read() + '\n<script>\n' + js + '</script>\n'
page = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n' + body.replace('__B64__', b64) + '</body></html>\n'
open(f'{d}/index.html', 'w', encoding='utf-8').write(page)
print('wrote index.html')

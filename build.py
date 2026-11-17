"""src/ 폴더 → 공개용 단일 index.html. 실행: python3 build.py"""
import os
S = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
rd = lambda f: open(os.path.join(S, f), encoding='utf-8').read()
html = rd('index.html').replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + rd('styles.css') + '\n</style>')
for f in ['data/facts.js', 'data/menu.js', 'app.js']:
    html = html.replace('<script src="%s"></script>' % f, '<script>\n' + rd(f).replace('</script', '<\\/script') + '\n</script>')
open(os.path.join(os.path.dirname(S), 'index.html'), 'w', encoding='utf-8').write(html)
print('ok', len(html))

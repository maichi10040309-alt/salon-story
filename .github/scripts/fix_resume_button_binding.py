from pathlib import Path

p=Path('src/game-v03.js')
s=p.read_text()
old='document.querySelector(\'[data-action="resumeBusiness"]\')?.addEventListener(\'click\',resumeBusiness);'
new='document.querySelectorAll(\'[data-action="resumeBusiness"]\').forEach(button=>button.addEventListener(\'click\',resumeBusiness));'
if old not in s:
    raise SystemExit('resumeBusiness binding target not found')
s=s.replace(old,new,1)
p.write_text(s)

# Regression test: home can render more than one resume button, so every instance must be bound.
t=Path('tests/v06-systems.test.mjs')
ts_text=t.read_text()
marker='// Resume button duplicate binding regression.'
if marker not in ts_text:
    ts_text += '''\n\n// Resume button duplicate binding regression.\nconst resumeBindingSource=await readFile(new URL('../src/game-v03.js',import.meta.url),'utf8');\nassert.match(resumeBindingSource,/querySelectorAll\\(\\'\\[data-action="resumeBusiness"\\]\\'\\)\\.forEach/,'all resume buttons receive a click handler');\nassert.doesNotMatch(resumeBindingSource,/querySelector\\(\\'\\[data-action="resumeBusiness"\\]\\'\\)\\?\\.addEventListener/,'single-element resume binding is not used');\n'''
    t.write_text(ts_text)

from pathlib import Path
src=Path('.github/scripts/apply_endless.py').read_text()
src=src.replace('replacement="""','replacement=r"""',1).replace('endless_card="""','endless_card=r"""',1)
exec(compile(src,'.github/scripts/apply_endless.py','exec'))

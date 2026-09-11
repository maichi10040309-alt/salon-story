from pathlib import Path
src=Path('.github/scripts/apply_endless.py').read_text()
src=src.replace('replacement="""','replacement=r"""',1).replace('endless_card="""','endless_card=r"""',1)
old="if(endlessLegacy.customers[i]){endlessLegacy.customers[i].visits=10;endlessLegacy.customers[i].trust=95}"
new="if(endlessLegacy.customers[i]){endlessLegacy.customers[i].visits=10;endlessLegacy.customers[i].trust=95;if(!endlessLegacy.encounteredCustomers.includes(endlessLegacy.customers[i].id))endlessLegacy.encounteredCustomers.push(endlessLegacy.customers[i].id)}"
src=src.replace(old,new,1)
exec(compile(src,'.github/scripts/apply_endless.py','exec'))

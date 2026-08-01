REMOVE = rm -rf

init:
	npm install

serve:
	$(REMOVE) .angular
	npm run start --host=0.0.0.0

playground:
	$(REMOVE) .angular
	npm run dev

build-abbos:
	npm run build:abbos
	npm run abbos:yalc:publish

clean:
	$(REMOVE) dist
	$(REMOVE) tmp
	$(REMOVE) .angular

deep-clean:
	$(REMOVE) dist
	$(REMOVE) tmp
	$(REMOVE) .angular
	$(REMOVE) node_modules

format:
	npx prettier --write .

check-format:
	npx prettier --check .

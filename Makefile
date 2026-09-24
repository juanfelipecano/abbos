REMOVE = rm -rf

init:
	npm install

serve:
	$(REMOVE) .angular
	npm run start:host

playground:
	$(REMOVE) .angular
	$(REMOVE) dist
	npm run build:abbos
	npm run dev

build-abbos:
	$(REMOVE) .angular
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

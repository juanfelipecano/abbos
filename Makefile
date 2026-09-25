REMOVE = rm -rf

init:
	npm install

dev:
	$(MAKE) build-abbos
	@echo "Starting development server..."
	npm run start:host

serve:
	$(REMOVE) .angular
	npm run start:host

playground:
	$(REMOVE) .angular
	$(REMOVE) dist
	npm run build:abbos
	npm run dev

build-abbos:
	@echo "Removing .angular folder..."
	$(REMOVE) .angular
	@echo "Building abbos..."
	npm run build:abbos
	@echo "Publishing abbos to yalc..."
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

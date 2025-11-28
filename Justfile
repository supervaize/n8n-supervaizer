# Justfile for n8n-supervaizer

# Build the project
build:
    npm run build

# Run unit tests
test:
    npm test

# Lint the code
lint:
    npm run lint

# Fix linting issues
lint-fix:
    npm run lint:fix

# Link the package to n8n (assumes n8n is installed globally or in ~/.n8n)
link:
    npm link
    @echo "Now run 'npm link @supervaize/n8n-nodes-supervaizer' in your ~/.n8n/nodes directory"

# Install dependencies
install:
    npm install

# Watch mode for development
dev:
    npm run dev

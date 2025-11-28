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

    
##########################
# Deploy to npmjs.com    #
##########################

# login to npmjs.com
npm-login:
    npm login

# Deploy to npmjs.com
npm-deploy:
    npm test
    npm run build
    npm version patch
    npm publish --access public


##############
# DEV        #   
##############

# Watch mode for development
dev:
    npm run dev

# Start local n8n instance
docker:
    docker run -it --rm \
        --name n8n \
        -p 5678:5678 \
        -e GENERIC_TIMEZONE="UTC" \
        -e TZ="UTC" \
        -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
        -e N8N_RUNNERS_ENABLED=true \
        -v n8n_data:/home/node/.n8n \
        docker.n8n.io/n8nio/n8n

# Start local n8n instance with local node mounted for development
docker-dev:
    docker run -it --rm \
        --name n8n \
        -p 5678:5678 \
        -e GENERIC_TIMEZONE="UTC" \
        -e TZ="UTC" \
        -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
        -e N8N_RUNNERS_ENABLED=true \
        -v n8n_data:/home/node/.n8n \
        -v "$PWD":/home/node/.n8n/nodes/n8n-nodes-supervaizer \
        docker.n8n.io/n8nio/n8n
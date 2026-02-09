#!/bin/bash

echo "=== PHOENIX PME GITHUB UPDATE STRATEGY ==="
echo ""

# Step 1: Check current state
echo "1. Checking current git status..."
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository"
    echo "   Initializing git..."
    git init
fi

# Step 2: Add remote if not exists
echo ""
echo "2. Configuring remote repository..."
if ! git remote | grep -q "origin"; then
    echo "   Adding remote: https://github.com/PhoenixPME/coreum-pme.git"
    git remote add origin https://github.com/PhoenixPME/coreum-pme.git
else
    echo "✅ Remote already configured"
    git remote -v
fi

# Step 3: Pull latest changes first
echo ""
echo "3. Pulling latest changes from GitHub..."
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "No existing branch to pull from"

# Step 4: Create .gitignore if not exists
echo ""
echo "4. Ensuring proper .gitignore..."
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'GITIGNORE'
# Logs
*.log
backend.log
frontend.log
apps/backend/backend.log
apps/frontend/frontend.log
logs/
*.log.*

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/

# Binaries (should NOT be in git)
junod
osmosisd
starsd
wasmd
*.tar.gz
*.d
*.so

# Build artifacts
target/
dist/
build/
out/
*.wasm

# OS files
.DS_Store
Thumbs.db
.desktop
*.swp
*.swo

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Temporary files
tmp/
temp/

# Data files (except sample/example data)
data/metal_prices_backup.json
data/last_fetch.txt

# Local chain data
.local-chain/
mock_contract.js
GITIGNORE
    echo "✅ Created .gitignore"
else
    echo "✅ .gitignore already exists"
fi

# Step 5: Stage Phoenix PME files
echo ""
echo "5. Staging Phoenix PME Auction Platform files..."

# Core Phoenix PME files
echo "   Adding apps/ (auction platform)..."
git add apps/

echo "   Adding data/ (market data)..."
mkdir -p data
git add data/

echo "   Adding scripts/ (automation scripts)..."
git add scripts/

echo "   Adding documentation..."
find . -name "*.md" -type f | xargs git add 2>/dev/null || true

echo "   Adding configuration files..."
git add .gitignore *.sh 2>/dev/null || true

# Step 6: Check what will be committed
echo ""
echo "6. Files to be committed:"
git status --short

echo ""
echo "=== READY FOR COMMIT ==="
echo ""
echo "To commit these changes:"
echo "  git commit -m '🚀 Deploy Phoenix PME Auction Platform v1.0"
echo ""
echo "Features:"
echo "• Precious metals auction platform"
echo "• Buy Now & bidding system"
echo "• Seller-set grading premiums"
echo "• Blockchain integration ready"
echo "• 1.5% platform fee structure"
echo "• Professional trading interface"
echo "• Real market data integration'"
echo ""
echo "Then push to GitHub:"
echo "  git push -u origin main"
echo ""
echo "If you get an error about unrelated histories:"
echo "  git push -u origin main --force"
echo ""
echo "=== ALTERNATIVE: CREATE NEW BRANCH ==="
echo ""
echo "For safer updates, create a feature branch:"
echo "  git checkout -b phoenix-pme-auction-platform"
echo "  git commit -m 'Add auction platform'"
echo "  git push -u origin phoenix-pme-auction-platform"
echo "  # Then create Pull Request on GitHub"

#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║        PHOENIX PME - GITHUB UPDATE TOOL                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored status
print_status() {
    echo -e "${BLUE}[STATUS]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Initialize git if needed
print_status "Step 1: Checking git repository..."
if [ ! -d ".git" ]; then
    print_warning "Not a git repository. Initializing..."
    git init
    if [ $? -eq 0 ]; then
        print_success "Git repository initialized"
    else
        print_error "Failed to initialize git"
        exit 1
    fi
else
    print_success "Already a git repository"
fi

# Step 2: Configure remote
print_status "Step 2: Configuring remote repository..."
if ! git remote | grep -q "origin"; then
    print_status "Adding remote: https://github.com/PhoenixPME/coreum-pme.git"
    git remote add origin https://github.com/PhoenixPME/coreum-pme.git
    print_success "Remote added"
else
    REMOTE_URL=$(git remote get-url origin)
    print_success "Remote already configured: $REMOTE_URL"
fi

# Step 3: Pull latest changes
print_status "Step 3: Pulling latest changes from GitHub..."
print_warning "This might overwrite local changes if there are conflicts"
echo -n "Continue? (y/n): "
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    git fetch origin
    # Try to pull main, then master
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || {
        print_warning "No existing branch to pull from. Starting fresh."
    }
    print_success "Pull completed"
else
    print_warning "Skipping pull. Make sure your changes don't conflict!"
fi

# Step 4: Ensure .gitignore exists
print_status "Step 4: Setting up .gitignore..."
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'GITIGNORE'
# ============================================
# PHOENIX PME - GIT IGNORE RULES
# ============================================

# ========== LOG FILES ==========
*.log
*.log.*
logs/
backend.log
frontend.log
apps/backend/backend.log
apps/frontend/frontend.log

# ========== NODE.JS ==========
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json

# ========== PYTHON ==========
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
*.egg-info/
dist/
build/

# ========== BINARIES ==========
# Blockchain binaries (do NOT commit)
junod
osmosisd
starsd
wasmd
*.tar.gz
*.d
*.so
*.wasm

# ========== BACKUP FILES ==========
backup/
*.bak
*.backup
*.old
*.tmp
temp/
tmp/

# ========== IDE & EDITOR ==========
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# ========== ENVIRONMENT ==========
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*
!.env.example

# ========== BUILD ARTIFACTS ==========
target/
dist/
build/
out/
.next/

# ========== DATA FILES ==========
data/metal_prices_backup.json
data/last_fetch.txt

# ========== LOCAL TESTING ==========
.local-chain/
mock_contract.js
test-everything.sh
GITIGNORE
    print_success ".gitignore created"
else
    print_success ".gitignore already exists"
fi

# Step 5: Stage Phoenix PME files
print_status "Step 5: Staging Phoenix PME Auction Platform files..."

# Clean up backup files first
print_status "Removing backup files from staging..."
find . -path "*/backup/*" -type f | while read -r file; do
    git rm --cached "$file" 2>/dev/null || true
done

# Add essential Phoenix PME directories
print_status "Adding apps/ directory (auction platform)..."
git add apps/

print_status "Adding scripts/ directory (automation)..."
git add scripts/

print_status "Adding data/ directory (market data)..."
mkdir -p data
touch data/.gitkeep  # Ensure directory is tracked
git add data/

print_status "Adding documentation files..."
find . -name "*.md" -type f ! -path "*/node_modules/*" ! -path "*/backup/*" -exec git add {} \; 2>/dev/null || true

print_status "Adding configuration files..."
git add .gitignore *.sh 2>/dev/null || true

print_status "Adding README files..."
[ -f "README.md" ] && git add README.md
[ -f "README_PHOENIX_PME.md" ] && git add README_PHOENIX_PME.md
[ -f "PHOENIX_PME_GUIDE.md" ] && git add PHOENIX_PME_GUIDE.md

# Step 6: Show what will be committed
print_status "Step 6: Review changes to be committed..."
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                   CHANGES TO COMMIT                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
git status --short
echo ""

# Step 7: Ask for commit message
print_status "Step 7: Ready to commit and push"
echo ""
echo "Suggested commit message:"
echo "🚀 Deploy Phoenix PME Auction Platform v1.0"
echo ""
echo "Features included:"
echo "• Precious metals auction platform (not exchange)"
echo "• Buy Now & bidding system"
echo "• Seller-set grading premiums (PCGS/NGC)"
echo "• Blockchain integration ready (Coreum)"
echo "• 1.5% platform fee structure"
echo "• Real market data integration"
echo "• Professional auction interface"
echo ""
echo -n "Enter commit message (or press Enter for suggested): "
read -r commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="🚀 Deploy Phoenix PME Auction Platform v1.0

• Precious metals auction platform (not exchange)
• Buy Now & bidding system  
• Seller-set grading premiums (PCGS/NGC)
• Blockchain integration ready (Coreum)
• 1.5% platform fee structure
• Real market data integration
• Professional auction interface"
fi

# Step 8: Commit
print_status "Committing changes..."
git commit -m "$commit_msg"
if [ $? -eq 0 ]; then
    print_success "Commit successful!"
else
    print_error "Commit failed. Check for errors above."
    exit 1
fi

# Step 9: Push to GitHub
print_status "Step 8: Pushing to GitHub..."
echo ""
echo "⚠️ WARNING: This will push to: $(git remote get-url origin)"
echo -n "Continue with push? (y/n): "
read -r push_response
if [[ "$push_response" =~ ^[Yy]$ ]]; then
    # Try to push to main, fall back to master
    if git push -u origin main; then
        print_success "Successfully pushed to main branch!"
    elif git push -u origin master; then
        print_success "Successfully pushed to master branch!"
    else
        print_warning "Push failed. Trying force push..."
        echo -n "Force push? (y/n): "
        read -r force_response
        if [[ "$force_response" =~ ^[Yy]$ ]]; then
            git push -u origin main --force || git push -u origin master --force
            print_success "Force push completed"
        else
            print_warning "Push aborted. You can push manually later."
        fi
    fi
else
    print_warning "Push skipped. You can push manually with:"
    echo "  git push -u origin main"
fi

# Step 10: Final instructions
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    UPDATE COMPLETE                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
print_success "Phoenix PME Auction Platform is ready for GitHub!"
echo ""
echo "🔗 View your repository:"
echo "   https://github.com/PhoenixPME/coreum-pme"
echo ""
echo "🌐 Test your platform locally:"
echo "   ./start-phoenix-pme.sh"
echo "   http://localhost:3000"
echo ""
echo "📁 Key files uploaded:"
echo "   • apps/frontend/public/index.html (Auction Interface)"
echo "   • apps/backend/reliable-server.js (Backend API)"
echo "   • scripts/data_fetcher/ (Market data automation)"
echo "   • Various .md documentation files"
echo ""
echo "🔄 To make further updates:"
echo "   1. Make your changes"
echo "   2. git add ."
echo "   3. git commit -m 'Your message'"
echo "   4. git push"
echo ""
echo "🎉 Your blockchain precious metals auction platform is now on GitHub!"

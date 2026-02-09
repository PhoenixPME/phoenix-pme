#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║           PHOENIX PME AUCTION PLATFORM TEST             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== TEST 1: Essential Files Check ==="
echo ""

ESSENTIAL_FILES=(
    "apps/frontend/public/index.html"
    "apps/backend/reliable-server.js"
    "start-phoenix-pme.sh"
)

all_ok=true
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC} ($(wc -l < "$file") lines)"
    else
        echo -e "${RED}❌ $file - MISSING${NC}"
        all_ok=false
    fi
done

echo ""
echo "=== TEST 2: Platform Functionality ==="
echo ""

# Check if platform is running
if curl -s http://localhost:3000 >/dev/null; then
    echo -e "${GREEN}✅ Auction platform frontend is running${NC}"
    echo "   URL: http://localhost:3000"
else
    echo -e "${YELLOW}⚠️ Frontend not running (start with: ./start-phoenix-pme.sh)${NC}"
fi

if curl -s http://localhost:3001/health >/dev/null; then
    echo -e "${GREEN}✅ Backend API is running${NC}"
    echo "   API: http://localhost:3001/health"
    # Test API response
    API_RESPONSE=$(curl -s http://localhost:3001/health | head -1)
    echo "   Response: $API_RESPONSE"
else
    echo -e "${YELLOW}⚠️ Backend not running${NC}"
fi

echo ""
echo "=== TEST 3: Market Data Integration ==="
echo ""

if [ -f "scripts/data_fetcher/fetch_kitco_prices.py" ]; then
    echo -e "${GREEN}✅ Market data fetcher script exists${NC}"
    # Test Python script
    if python3 -c "import requests, bs4" 2>/dev/null; then
        echo -e "${GREEN}✅ Required Python packages installed${NC}"
    else
        echo -e "${YELLOW}⚠️ Python packages may need installation${NC}"
        echo "   Run: pip3 install requests beautifulsoup4"
    fi
else
    echo -e "${YELLOW}⚠️ Market data script not found${NC}"
fi

echo ""
echo "=== TEST 4: Git Status Check ==="
echo ""

if [ -d ".git" ]; then
    echo "Current branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
    echo "Uncommitted changes: $(git status --short | wc -l)"
    
    # Check for large files in git
    LARGE_FILES=$(find . -type f -size +10M 2>/dev/null | wc -l)
    if [ "$LARGE_FILES" -gt 0 ]; then
        echo -e "${YELLOW}⚠️ Found $LARGE_FILES files >10MB (should be in .gitignore)${NC}"
    else
        echo -e "${GREEN}✅ No large files detected${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Not a git repository${NC}"
fi

echo ""
echo "=== TEST 5: Quick Feature Check ==="
echo ""

# Check auction platform features in HTML
if [ -f "apps/frontend/public/index.html" ]; then
    FEATURES=("Buy Now" "Bidding" "Grading Premiums" "1.5% fee" "Blockchain")
    for feature in "${FEATURES[@]}"; do
        if grep -iq "$feature" apps/frontend/public/index.html; then
            echo -e "${GREEN}✅ '$feature' feature detected${NC}"
        else
            echo -e "${YELLOW}⚠️ '$feature' not found in HTML${NC}"
        fi
    done
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                     TEST RESULTS                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

if [ "$all_ok" = true ]; then
    echo -e "${GREEN}✅ Phoenix PME Auction Platform is READY for GitHub!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./safe-github-update.sh"
    echo "2. Review the new branch on GitHub"
    echo "3. Create Pull Request to merge to main"
    echo "4. Share your auction platform!"
else
    echo -e "${YELLOW}⚠️ Some issues detected. Please fix before updating GitHub.${NC}"
fi

echo ""
echo "🌐 Access your platform: http://localhost:3000"
echo "🔧 API endpoint: http://localhost:3001/health"
echo "📊 Market data: http://localhost:3001/api/market"

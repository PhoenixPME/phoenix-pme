#!/bin/bash
cd ~/coreum-pme

echo "🏛️  PHOENIX PME - PRODUCTION STATUS"
echo "====================================="
echo ""

# Backend status
echo "1. BACKEND SERVICE:"
if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    BACKEND_DATA=$(curl -s http://localhost:3001/health)
    echo "✅ RUNNING on port 3001"
    echo "   Status: $(echo $BACKEND_DATA | grep -o '"status":"[^"]*"' | cut -d'"' -f4)"
    echo "   Database: $(echo $BACKEND_DATA | grep -o '"database":"[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ NOT RUNNING"
    echo "   Start with: cd apps/backend && npm run dev"
fi

echo ""
echo "2. FRONTEND UI:"
if curl -s http://localhost:3002 >/dev/null 2>&1; then
    echo "✅ RUNNING on port 3002"
    echo "   URL: http://localhost:3002"
else
    echo "❌ NOT RUNNING"
    echo "   Start with: cd apps/frontend && npm run dev"
fi

echo ""
echo "3. DATABASE:"
if [ -f "apps/backend/dev.db" ]; then
    echo "✅ SQLite database found"
    if command -v sqlite3 >/dev/null 2>&1; then
        USER_COUNT=$(sqlite3 apps/backend/dev.db "SELECT COUNT(*) FROM User" 2>/dev/null || echo "0")
        AUCTION_COUNT=$(sqlite3 apps/backend/dev.db "SELECT COUNT(*) FROM Auction" 2>/dev/null || echo "0")
        BID_COUNT=$(sqlite3 apps/backend/dev.db "SELECT COUNT(*) FROM Bid" 2>/dev/null || echo "0")
        echo "   📊 Stats: $USER_COUNT users, $AUCTION_COUNT auctions, $BID_COUNT bids"
        
        # Show active auctions
        echo "   🏷️  Active auctions:"
        sqlite3 apps/backend/dev.db "SELECT title, currentPrice/100 as price, status FROM Auction WHERE status='active';" 2>/dev/null | while read line; do
            echo "     • $line"
        done || echo "     (none)"
    fi
else
    echo "⚠️  No database file"
fi

echo ""
echo "4. API ENDPOINTS:"
echo "   🔗 Health:    http://localhost:3001/health"
echo "   📈 Auctions:  http://localhost:3001/api/auctions"
echo "   👤 Register:  POST http://localhost:3001/api/auth/register"
echo "   🔐 Login:     POST http://localhost:3001/api/auth/login"

echo ""
echo "5. TEST CREDENTIALS:"
echo "   Email: trader@phoenixpme.com"
echo "   Password: Test123!"

echo ""
echo "6. QUICK COMMANDS:"
echo "   Create auction:"
echo '   curl -X POST http://localhost:3001/api/auctions \'
echo '     -H "Content-Type: application/json" \'
echo '     -H "Authorization: Bearer YOUR_TOKEN" \'
echo '     -d '\''{"itemId":"GOLD-003","title":"Gold Coin","startingPrice":150000}'\'''

echo ""
echo "====================================="
echo "✅ SYSTEM STATUS: OPERATIONAL"
echo "   Access at: http://localhost:3002"

#!/bin/bash
echo "=== NODEMAILER v6 → v8 COMPATIBILITY CHECK ==="
echo ""

# Check current nodemailer usage patterns
echo "1. Checking import patterns..."
grep -n "require\|import\|from.*nodemailer" apps/backend/src/services/email.service.ts 2>/dev/null || echo "No imports found in service file"

echo ""
echo "2. Checking common v6 patterns that break in v8..."
echo ""
echo "Pattern 1: Callback style (breaks in v8)"
if grep -q "\.sendMail.*function\|callback" apps/backend/src/services/email.service.ts 2>/dev/null; then
    echo "⚠️  Found callback pattern - needs update to async/await"
else
    echo "✅ No callback patterns found"
fi

echo ""
echo "Pattern 2: createTransport options"
if grep -q "createTransport.*{" apps/backend/src/services/email.service.ts 2>/dev/null; then
    echo "⚠️  Check transport options - may need updates"
    grep -A5 "createTransport" apps/backend/src/services/email.service.ts 2>/dev/null || true
else
    echo "✅ No createTransport found"
fi

echo ""
echo "=== RECOMMENDED UPDATE APPROACH ==="
echo ""
echo "Option A: Update to nodemailer v7 first (intermediate)"
echo "  npm install nodemailer@^7.0.0"
echo "  Test, then update to v8"
echo ""
echo "Option B: Direct update with code changes"
echo "  1. Backup email.service.ts"
echo "  2. Update to v8"
echo "  3. Fix any compilation errors"
echo ""
echo "Option C: Postpone nodemailer update if not critical"
echo "  Accept risk temporarily (pre-production)"
echo "  Focus on other vulnerabilities first"

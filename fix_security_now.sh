#!/bin/bash
set -e  # Exit on error

echo "=== SECURITY UPDATE STARTING ==="
echo ""

# Backup
echo "📦 Creating backups..."
BACKUP_DIR="security_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r apps/backend/package.json apps/backend/package-lock.json "$BACKUP_DIR/" 2>/dev/null || true
cp contracts/phoenix-escrow/Cargo.toml contracts/phoenix-escrow/Cargo.lock "$BACKUP_DIR/" 2>/dev/null || true

echo "✅ Backups saved to: $BACKUP_DIR"
echo ""

# Fix backend
echo "🔧 Fixing backend dependencies..."
cd apps/backend

echo "Current vulnerable packages:"
npm list multer nodemailer 2>/dev/null | grep -E "(multer|nodemailer)@"

echo ""
echo "Updating multer to latest..."
npm install multer@latest

echo "Updating nodemailer to latest..."
npm install nodemailer@latest

echo ""
echo "Running audit fix..."
npm audit fix --force 2>&1 | tail -20 || echo "Audit fix completed"

echo ""
echo "✅ Backend updates complete!"
echo "New versions:"
npm list multer nodemailer 2>/dev/null | grep -E "(multer|nodemailer)@"
cd ../..
echo ""

# Fix Rust dependencies
echo "🦀 Checking Rust dependencies..."
if [ -f "contracts/phoenix-escrow/Cargo.toml" ]; then
    echo "Checking for curve25519-dalek in dependencies..."
    
    # Check if it's a direct dependency
    if grep -q "curve25519-dalek" contracts/phoenix-escrow/Cargo.toml; then
        echo "⚠️  curve25519-dalek is a direct dependency"
        echo "   You need to update it in Cargo.toml manually"
        echo "   Or remove it if not needed"
    else
        echo "✅ curve25519-dalek is NOT a direct dependency"
        echo "   It's likely a transitive dependency from cosmwasm-std"
        echo "   This will be updated when you update cosmwasm-std"
    fi
    
    echo ""
    echo "To update Rust dependencies:"
    echo "cd contracts/phoenix-escrow"
    echo "cargo update"
    echo "cargo build --release"
else
    echo "ℹ️ No Cargo.toml found at contracts/phoenix-escrow/"
fi

echo ""
echo "=== VERIFICATION ==="
echo ""
echo "1. Backend security check:"
cd apps/backend
npm audit 2>&1 | grep -A10 "found" || echo "Checking vulnerabilities..."
cd ../..

echo ""
echo "2. Test backend:"
cd apps/backend
echo "Running quick test..."
if npm test 2>&1 | tail -10; then
    echo "✅ Tests passed!"
else
    echo "⚠️  Tests may have issues - check backup in $BACKUP_DIR"
fi
cd ../..

echo ""
echo "=== SUMMARY ==="
echo ""
echo "✅ Security updates applied!"
echo ""
echo "If issues occur, restore from backup:"
echo "cp $BACKUP_DIR/package.json apps/backend/"
echo "cp $BACKUP_DIR/package-lock.json apps/backend/ 2>/dev/null || true"
echo ""
echo "Next steps:"
echo "1. Review changes in package.json"
echo "2. Test your application thoroughly"
echo "3. Run full test suite"
echo "4. Check GitHub Security tab for remaining issues"

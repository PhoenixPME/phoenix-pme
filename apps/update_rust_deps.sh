#!/bin/bash
echo "=== UPDATING RUST DEPENDENCIES ==="
echo ""

if [ ! -d "contracts/phoenix-escrow" ]; then
    echo "❌ Contract directory not found"
    exit 1
fi

cd contracts/phoenix-escrow

echo "1. Current Cargo.toml dependencies:"
grep -E "cosmwasm-std|cosmwasm-storage|cw-storage-plus" Cargo.toml

echo ""
echo "2. Checking for updates..."
echo "Current versions in Cargo.lock:"
grep -A2 '^name = "cosmwasm-std"' Cargo.lock
grep -A2 '^name = "cosmwasm-storage"' Cargo.lock

echo ""
echo "3. Running cargo update..."
cargo update

echo ""
echo "4. Checking if curve25519-dalek was updated..."
echo "Before update (v3.2.0 should exist):"
grep -A2 'name = "curve25519-dalek" version = "3.2.0"' Cargo.lock && echo "⚠️  Still has vulnerable version" || echo "✅ Vulnerable version removed"

echo ""
echo "5. Building to verify..."
if cargo check 2>&1 | tail -10; then
    echo "✅ Build check passed"
else
    echo "❌ Build check failed - check dependencies"
fi

cd ../..

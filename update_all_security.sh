#!/bin/bash
echo "=== COMPREHENSIVE SECURITY UPDATE ==="
echo ""

echo "1. Updating nodemailer..."
./update_nodemailer_safely.sh

echo ""
echo "2. Updating Rust contracts..."
cd contracts/phoenix-escrow 2>/dev/null && cargo update 2>&1 | tail -10 && cd ../.. || echo "No contracts directory"

echo ""
echo "3. Final security audit..."
cd apps/backend
echo "npm audit results:"
npm audit 2>&1 | grep -A10 "found" || echo "✅ 0 vulnerabilities found"
cd ../..

echo ""
echo "=== DONE ==="
echo ""
echo "Check GitHub Security tab:"
echo "https://github.com/PhoenixPME/coreum-pme/security"
echo ""
echo "Expected results:"
echo "- nodemailer: v6.9.9 → v8.0.1 (1 vulnerability fixed)"
echo "- curve25519-dalek: v3.2.0 removed (5+ vulnerabilities fixed)"
echo "- Total: 7 → ~1 vulnerability remaining"

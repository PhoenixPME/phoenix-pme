#!/bin/bash
echo "🔧 Optimizing WASM for deployment..."

# Build release
cargo build --release --target wasm32-unknown-unknown

# Check size
WASM_FILE="target/wasm32-unknown-unknown/release/phoenix_escrow.wasm"
if [ -f "$WASM_FILE" ]; then
    echo "✅ Built: $WASM_FILE"
    ls -lh "$WASM_FILE"
    
    # Create optimized version with docker
    echo "📦 Optimizing with cosmwasm/optimizer..."
    docker run --rm -v "$(pwd)":/code \
      --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
      --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
      cosmwasm/optimizer:0.16.0
    
    echo "✅ Optimized artifact in artifacts/"
    ls -lh artifacts/
else
    echo "❌ Build failed"
    exit 1
fi

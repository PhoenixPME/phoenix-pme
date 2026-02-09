#!/bin/bash
# This is a test wallet that might already be initialized
TEST_MNEMONIC="welcome welcome welcome welcome welcome welcome welcome welcome welcome welcome welcome welcome"
TEST_NAME="test-initialized"

echo "Importing test wallet..."
echo "$TEST_MNEMONIC" | ./osmosisd keys add $TEST_NAME --recover --keyring-backend test

echo ""
echo "Getting address..."
TEST_ADDR=$(./osmosisd keys show $TEST_NAME --keyring-backend test | grep address | awk '{print $3}')
echo "Test address: $TEST_ADDR"

echo ""
echo "Checking balance..."
./osmosisd query bank balances "$TEST_ADDR" --node https://rpc.testnet.osmosis.zone:443

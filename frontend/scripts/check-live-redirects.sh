#!/bin/bash

echo "Checking Live Site Loto URL Redirects"
echo "======================================"
echo ""

echo "1. Root-level: /loto-germania"
curl -sI "https://cazinou.io/loto-germania" | grep -i "location:"
echo ""

echo "2. Root-level: /loto-irlanda"
curl -sI "https://cazinou.io/loto-irlanda" | grep -i "location:"
echo ""

echo "3. Old structure: /loto-online-keno/loto-germania"
STATUS=$(curl -sI "https://cazinou.io/loto-online-keno/loto-germania" | head -1)
echo "$STATUS"
echo ""

echo "4. Old structure main: /loto-online-keno"
STATUS=$(curl -sI "https://cazinou.io/loto-online-keno" | head -1)
LOCATION=$(curl -sI "https://cazinou.io/loto-online-keno" | grep -i "location:")
echo "$STATUS"
if [ -n "$LOCATION" ]; then
  echo "$LOCATION"
fi
echo ""

echo "5. New structure: /loto/belgia-6-45-si-keno-20-70"
STATUS=$(curl -sI "https://cazinou.io/loto/belgia-6-45-si-keno-20-70" | head -1)
echo "$STATUS"

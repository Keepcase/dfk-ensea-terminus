#!/bin/sh
set -e

cd /workspace

# Install dependencies if node_modules is empty or package.json changed
if [ ! -f "node_modules/.package-lock.json" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  echo "Installing dependencies..."
  npm install --ignore-scripts
fi

echo "==================================="
echo " Ensea Terminus dev container is ready"
echo "==================================="
echo ""
echo " Commands:"
echo "   npm run dev      - Start dev server (http://localhost:5173)"
echo "   npm run build    - Production build"
echo "   npm test         - Run tests"
echo "   npm run lint     - Lint with ESLint"
echo "   npm run format   - Format with Prettier"
echo ""
echo " Testnet:"
echo "   VITE_NETWORK=testnet npm run dev"
echo ""

# Keep container alive
tail -f /dev/null

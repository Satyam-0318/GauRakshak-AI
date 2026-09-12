#!/usr/bin/env bash
set -e

# Add locally installed node to PATH if present
if [ -d "$HOME/.local/node/bin" ]; then
  export PATH="$HOME/.local/node/bin:$PATH"
fi

echo "========================================================"
echo " Starting GauRakshak AI Diagnostic Platform"
echo "========================================================"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 1. Start FastAPI backend on port 8000
echo "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ..."
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Trap signals to clean up background processes on exit
cleanup() {
  echo -e "\nStopping GauRakshak AI services..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 2. Start Vite React Frontend on port 5173
echo "[2/2] Launching React + Tailwind Frontend on http://localhost:5173 ..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo " 🐄 GauRakshak AI is LIVE and ready!"
echo " 🌐 Frontend UI:     http://localhost:5173"
echo " ⚡ Backend API:      http://127.0.0.1:8000"
echo " 📖 API Docs (Docs): http://127.0.0.1:8000/docs"
echo "========================================================"
echo "Press Ctrl+C to stop both servers."

wait

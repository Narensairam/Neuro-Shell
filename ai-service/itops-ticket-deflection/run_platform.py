import subprocess
import sys
import os
import time
import socket
from pathlib import Path

def kill_port(port):
    """Forcefully kill any process listening on the given port (Windows)."""
    try:
        output = subprocess.check_output(f'netstat -ano | findstr LISTENING | findstr :{port}', shell=True).decode()
        for line in output.strip().split('\n'):
            parts = line.split()
            if parts:
                pid = parts[-1]
                print(f"Cleaning up hanging process {pid} on port {port}...")
                subprocess.run(f'taskkill /F /PID {pid}', shell=True, capture_output=True)
    except Exception:
        pass # Port probably already free

def launch():
    print("="*60)
    print("      SHELL AI EOS | UNIFIED PLATFORM LAUNCHER")
    print("="*60)

    project_root = Path(__file__).parent.resolve()
    backend_dir = project_root / "backend"
    frontend_dir = project_root / "frontend"

    # 1. Check dependencies
    print("\n[1/3] Checking environment...")
    
    # Check if frontend node_modules exists
    if not (frontend_dir / "node_modules").exists():
        print("Warning: frontend/node_modules not found. You may need to run 'npm install' in the frontend directory.")

    # 2. Start Backend
    # Step 1: Clean ports
    kill_port(8000)
    kill_port(3000)

    print("[2/3] Starting FastAPI Backend on port 8000...")
    # Use -u for unbuffered output to ensure logs appear immediately
    # Force 127.0.0.1 binding via environment variable or command line if supported by your main.py
    backend_proc = subprocess.Popen(
        [sys.executable, "-u", str(backend_dir / "main.py")],
        cwd=project_root,
        env={**os.environ, "HOST": "127.0.0.1"},
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
    )
    
    # Wait for backend to start
    time.sleep(2)
    if backend_proc.poll() is not None:
        print("Error: Backend failed to start.")
        out, _ = backend_proc.communicate()
        print(out)
        return

    # 3. Start Frontend
    print("[3/3] Starting Next.js Frontend on port 3000...")
    try:
        frontend_proc = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            shell=True # For Windows
        )
    except Exception as e:
        print(f"Error starting frontend: {e}")
        backend_proc.terminate()
        return

    print("\n" + "="*60)
    print("PLATFORM READY")
    print("="*60)
    print(f"API Backend: http://localhost:8000")
    print(f"EOS Interface: http://localhost:3000")
    print("="*60)
    print("\nPress Ctrl+C to shut down both services.")

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("\nBackend process exited.")
                break
            if frontend_proc.poll() is not None:
                print("\nFrontend process exited.")
                break
    except KeyboardInterrupt:
        print("\nShutting down services...")
    finally:
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Cleanup complete.")

if __name__ == "__main__":
    launch()

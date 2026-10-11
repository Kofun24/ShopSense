"""ShopSense - Application Startup Script
Starts both the FastAPI Backend (port 8000) and the React Frontend (port 5173).
Press Ctrl+C to terminate both services cleanly.
"""
import os
import sys
import time
import shutil
import signal
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = ROOT_DIR / "frontend-react"
MODELS_DIR = ROOT_DIR / "models"


def find_python():
    """Locate the best python executable (prefer .venv)."""
    if os.name == "nt":
        venv_py = ROOT_DIR / ".venv" / "Scripts" / "python.exe"
    else:
        venv_py = ROOT_DIR / ".venv" / "bin" / "python"

    if venv_py.exists():
        return str(venv_py)
    return sys.executable


def find_npm():
    """Locate npm executable."""
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    path = shutil.which(npm_cmd) or shutil.which("npm")
    if not path:
        print("[!] Warning: 'npm' was not found in PATH.")
    return path or ("npm.cmd" if os.name == "nt" else "npm")


def check_prerequisites(python_exe: str):
    """Verify essential files and tools before launching."""
    model_file = MODELS_DIR / "final_model.joblib"
    if not model_file.exists():
        print(f"[!] Warning: Model artefact not found at {model_file}")
        print("    Run: python notebooks/03_modelling.ipynb or ensure final_model.joblib is present.")

    if not FRONTEND_DIR.exists():
        print(f"[!] Error: Frontend directory '{FRONTEND_DIR}' does not exist.")
        sys.exit(1)


def main():
    print("=" * 70)
    print("  ShopSense - Online Shopper Purchase Intent Prediction System")
    print("=" * 70)

    python_exe = find_python()
    npm_cmd = find_npm()

    check_prerequisites(python_exe)

    print(f"[*] Python Interpreter : {python_exe}")
    print(f"[*] Frontend Directory  : {FRONTEND_DIR}")
    print(f"[*] Starting Backend on http://127.0.0.1:8000 ...")
    print(f"[*] Starting Frontend on http://localhost:5173 ...")
    print("-" * 70)

    backend_proc = None
    frontend_proc = None

    try:
        # 1. Start FastAPI Backend
        backend_cmd = [
            python_exe,
            "-m",
            "uvicorn",
            "backend.api:app",
            "--host",
            "127.0.0.1",
            "--port",
            "8000",
            "--reload",
        ]
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=str(ROOT_DIR),
        )

        time.sleep(1)

        # 2. Start React Frontend (Vite dev server)
        frontend_cmd = [npm_cmd, "run", "dev"]
        frontend_proc = subprocess.Popen(
            frontend_cmd,
            cwd=str(FRONTEND_DIR),
            shell=(os.name == "nt"),
        )

        print("\n" + "=" * 70)
        print("  SERVICES RUNNING:")
        print("  - Web Application: http://localhost:5173")
        print("  - Backend API:    http://127.0.0.1:8000")
        print("  - API Swagger UI: http://127.0.0.1:8000/docs")
        print("=" * 70)
        print("  Press Ctrl+C to shut down all services gracefully.\n")

        # Monitor processes
        while True:
            if backend_proc.poll() is not None:
                print(f"[!] Backend process exited with code {backend_proc.returncode}")
                break
            if frontend_proc.poll() is not None:
                print(f"[!] Frontend process exited with code {frontend_proc.returncode}")
                break
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[*] Shutdown signal received (Ctrl+C). Terminating servers...")

    finally:
        # Graceful cleanup
        if backend_proc and backend_proc.poll() is None:
            print("[*] Stopping Backend server...")
            try:
                backend_proc.terminate()
                backend_proc.wait(timeout=3)
            except Exception:
                backend_proc.kill()

        if frontend_proc and frontend_proc.poll() is None:
            print("[*] Stopping Frontend server...")
            try:
                if os.name == "nt":
                    subprocess.run(
                        ["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)],
                        capture_output=True,
                    )
                else:
                    frontend_proc.terminate()
                    frontend_proc.wait(timeout=3)
            except Exception:
                frontend_proc.kill()

        print("[*] All ShopSense services stopped cleanly. Goodbye!")


if __name__ == "__main__":
    main()

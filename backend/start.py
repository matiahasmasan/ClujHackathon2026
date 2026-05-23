#!/usr/bin/env python
"""
Backend startup script for ClujHackathon2026 API
Run this to start the FastAPI backend server
"""

import subprocess
import sys
import os

def main():
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    print("🚀 Starting ClujHackathon2026 API Backend...")
    print(f"📁 Working directory: {os.getcwd()}")
    print()
    
    try:
        # Start uvicorn
        subprocess.run(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
            check=True
        )
    except KeyboardInterrupt:
        print("\n✅ Backend stopped by user")
    except FileNotFoundError:
        print("❌ Error: Python or uvicorn not found")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: Failed to start backend: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

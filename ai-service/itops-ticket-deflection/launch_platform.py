#!/usr/bin/env python3
"""
Shell AI EOS | Unified Platform Launcher
Handles environment setup, dependency installation, and service startup
"""

import subprocess
import sys
import os
import time
import platform
import shutil
from pathlib import Path


class PlatformLauncher:
    def __init__(self):
        self.project_root = Path(__file__).parent.resolve()
        self.backend_dir = self.project_root / "backend"
        self.frontend_dir = self.project_root / "frontend"
        self.python_exe = sys.executable
        self.os_type = platform.system()
        
    def print_section(self, title):
        """Print formatted section headers"""
        print("\n" + "="*70)
        print(f"  {title}")
        print("="*70)
    
    def check_command(self, cmd, name):
        """Check if a command is available"""
        result = shutil.which(cmd)
        status = "✓ Found" if result else "✗ Not found"
        print(f"  {name:20} {status}")
        return result is not None
    
    def run_command(self, cmd, cwd=None, shell=False, description=""):
        """Run a command with error handling"""
        try:
            if description:
                print(f"\n  → {description}...")
            
            result = subprocess.run(
                cmd,
                cwd=cwd,
                shell=shell,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode != 0:
                print(f"  ✗ Error: {result.stderr[:200]}")
                return False
            
            if description:
                print(f"  ✓ {description} completed")
            return True
            
        except subprocess.TimeoutExpired:
            print(f"  ✗ Timeout: Command took too long")
            return False
        except Exception as e:
            print(f"  ✗ Exception: {str(e)}")
            return False
    
    def check_dependencies(self):
        """Check system dependencies"""
        self.print_section("1️⃣  CHECKING DEPENDENCIES")
        
        has_python = self.check_command(self.python_exe, "Python")
        has_npm = self.check_command("npm", "Node.js/npm")
        
        if not has_python:
            print("\n  ✗ Python not found. Please install Python 3.9+")
            return False
        
        if not has_npm:
            print("\n  ✗ Node.js/npm not found. Please install from https://nodejs.org/")
            return False
        
        print("\n  ✓ All dependencies found!")
        return True
    
    def setup_python_environment(self):
        """Install Python dependencies"""
        self.print_section("2️⃣  SETTING UP PYTHON ENVIRONMENT")
        
        req_file = self.project_root / "requirements.txt"
        if not req_file.exists():
            print(f"  ✗ requirements.txt not found at {req_file}")
            return False
        
        print(f"  Installing packages from requirements.txt...")
        cmd = [self.python_exe, "-m", "pip", "install", "-q", "-r", str(req_file)]
        
        if not self.run_command(cmd, cwd=self.project_root, description="Installing Python dependencies"):
            print("  ⚠ Warning: Some packages may not have installed properly")
            # Don't return False - try to continue anyway
        
        return True
    
    def setup_node_environment(self):
        """Install Node.js dependencies"""
        self.print_section("3️⃣  SETTING UP NODE.JS ENVIRONMENT")
        
        package_file = self.frontend_dir / "package.json"
        if not package_file.exists():
            print(f"  ✗ package.json not found at {package_file}")
            return False
        
        if not (self.frontend_dir / "node_modules").exists():
            print(f"  Installing Node packages...")
            if not self.run_command(["npm", "install"], cwd=self.frontend_dir, description="Installing npm dependencies"):
                print("  ✗ npm install failed")
                return False
        else:
            print(f"  ✓ node_modules already installed")
        
        return True
    
    def start_backend(self):
        """Start FastAPI backend"""
        self.print_section("4️⃣  STARTING FASTAPI BACKEND")
        
        main_file = self.backend_dir / "main.py"
        if not main_file.exists():
            print(f"  ✗ Backend main.py not found at {main_file}")
            return None
        
        print(f"  Starting FastAPI server on http://localhost:8000...")
        print(f"  API Docs: http://localhost:8000/docs")
        
        try:
            proc = subprocess.Popen(
                [self.python_exe, str(main_file)],
                cwd=self.project_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # Wait for backend to start
            time.sleep(3)
            
            if proc.poll() is not None:
                print("  ✗ Backend failed to start")
                try:
                    output, _ = proc.communicate(timeout=1)
                    print(f"  Error output: {output[:500]}")
                except:
                    pass
                return None
            
            print("  ✓ Backend started successfully")
            return proc
            
        except Exception as e:
            print(f"  ✗ Failed to start backend: {e}")
            return None
    
    def start_frontend(self):
        """Start Next.js frontend"""
        self.print_section("5️⃣  STARTING NEXT.JS FRONTEND")
        
        print(f"  Starting Next.js dev server on http://localhost:3000...")
        
        try:
            # Use appropriate shell setting based on OS
            shell_flag = True if self.os_type == "Windows" else False
            
            proc = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=self.frontend_dir,
                shell=shell_flag,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            # Wait for frontend to start
            time.sleep(4)
            
            if proc.poll() is not None:
                print("  ✗ Frontend failed to start")
                return None
            
            print("  ✓ Frontend started successfully")
            return proc
            
        except Exception as e:
            print(f"  ✗ Failed to start frontend: {e}")
            return None
    
    def show_summary(self):
        """Show startup summary"""
        self.print_section("✅ PLATFORM READY")
        
        print("""
  🌐 Web Interface:    http://localhost:3000
  🔌 API Backend:      http://localhost:8000
  📚 API Docs:         http://localhost:8000/docs
  
  Features Available:
    • ITSM (Ticket Management & Deflection)
    • OT Security (Threat & Anomaly Detection)
    • Shadow IT (Cloud App Discovery)
    • Predictive Monitoring (Failure Prediction)
    • Dashboard (System Health & KPIs)
  
  Press Ctrl+C to shut down all services.
        """)
    
    def launch(self):
        """Execute full platform launch"""
        print("""
╔════════════════════════════════════════════════════════════════════╗
║      SHELL AI EOS | INDUSTRIAL ITSM & AIOPS PLATFORM              ║
║                   Unified Platform Launcher                        ║
╚════════════════════════════════════════════════════════════════════╝
        """)
        
        # Check dependencies
        if not self.check_dependencies():
            print("\n✗ Please install missing dependencies and try again.")
            return False
        
        # Setup environments
        if not self.setup_python_environment():
            print("\n⚠ Warning: Python setup had issues, continuing anyway...")
        
        if not self.setup_node_environment():
            print("\n✗ Node.js setup failed. Cannot continue.")
            return False
        
        # Start services
        backend_proc = self.start_backend()
        if not backend_proc:
            print("\n✗ Backend startup failed. Check errors above.")
            return False
        
        frontend_proc = self.start_frontend()
        if not frontend_proc:
            print("\n✗ Frontend startup failed.")
            if backend_proc:
                backend_proc.terminate()
            return False
        
        # Show summary and wait
        self.show_summary()
        
        try:
            while True:
                time.sleep(1)
                
                # Check if processes died
                if backend_proc and backend_proc.poll() is not None:
                    print("\n✗ Backend process exited unexpectedly")
                    break
                
                if frontend_proc and frontend_proc.poll() is not None:
                    print("\n✗ Frontend process exited unexpectedly")
                    break
        
        except KeyboardInterrupt:
            print("\n\n⏹ Shutting down services...")
        
        finally:
            if backend_proc:
                backend_proc.terminate()
                backend_proc.wait(timeout=5)
            if frontend_proc:
                frontend_proc.terminate()
                frontend_proc.wait(timeout=5)
            
            print("✓ Cleanup complete. Goodbye!")
        
        return True


def main():
    """Main entry point"""
    launcher = PlatformLauncher()
    success = launcher.launch()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Automated build script that:
1. Builds the React app
2. Regenerates data.json
3. Restarts the server
"""
import subprocess
import sys
import os

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"\n{'='*60}")
    print(f"🔧 {description}")
    print(f"{'='*60}")
    result = subprocess.run(cmd, shell=True, capture_output=False)
    if result.returncode != 0:
        print(f"❌ Error: {description} failed")
        return False
    print(f"✅ {description} completed")
    return True

def main():
    # Step 1: Build the app
    if not run_command("npm run build", "Building React app"):
        sys.exit(1)
    
    # Step 2: Regenerate data.json
    if not run_command("python update_data.py", "Regenerating data.json"):
        sys.exit(1)
    
    print(f"\n{'='*60}")
    print("✅ Build complete!")
    print("📊 Dashboard ready at: http://localhost:8080")
    print("💡 Run 'python serve.py' to start the server")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()

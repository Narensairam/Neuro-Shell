import sys
import importlib

dependencies = [
    "pandas", "numpy", "sklearn", "faker", "fastapi", "uvicorn", "pydantic"
]

print("Checking dependencies...")
missing = []
for dep in dependencies:
    try:
        importlib.import_module(dep)
        print(f"  [OK] {dep}")
    except ImportError:
        print(f"  [MISSING] {dep}")
        missing.append(dep)

if missing:
    print(f"\nCRITICAL: Missing packages: {', '.join(missing)}")
    print("Please run: pip install -r requirements.txt")
else:
    print("\nAll dependencies found.")

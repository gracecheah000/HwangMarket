# this simple script extracts the ABI from the compiled json files and moves them into frontend/src/contracts/<contract name>-abi.json

import os
import json
from pathlib import Path

arr = os.listdir("build/contracts")
Path("frontend/src/contracts").mkdir(parents=True, exist_ok=True)

for fp in arr:
  with open(os.path.join("build/contracts", fp), 'r') as f:
    data = json.load(f)
    content = data["abi"]
    new_fp = f'frontend/src/contracts/{Path(fp).stem}-abi.json'
    with open(new_fp, "w") as out:
      out.write(json.dumps(content, indent=4))

print(f"✅ A total of {len(arr)} contract abis were copied over to frontend/src/contracts/<contract-name>-abi.json")
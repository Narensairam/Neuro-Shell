from __future__ import annotations

from dataclasses import dataclass
import numpy as np
import pandas as pd

@dataclass(frozen=True)
class ShadowSimConfig:
    devices: int = 25  # Will be randomized between 20-30
    shadow_ratio: float = 0.2
    seed: int = 11

LOCATIONS = ("on-prem", "cloud", "edge")

def generate_shadow_data(config: ShadowSimConfig = ShadowSimConfig()) -> pd.DataFrame:
    """
    Synthetic asset inventory + behavior for Shadow IT discovery.
    Upgraded for strict enterprise constraints:
    - 20-30 total devices
    - 2-6 shadow IT devices
    - Capped risk levels (5 High, 3 Med, 2 Low)
    """
    rng = np.random.default_rng(config.seed)
    
    # 1. Determine Dynamic Counts
    total_devices = int(rng.integers(20, 31))
    shadow_count = int(rng.integers(2, 7))  # 2 to 6
    managed_count = total_devices - shadow_count
    
    rows: list[dict] = []
    
    # 2. Risk Budget (Limits)
    high_limit = 5
    med_limit = 3
    low_limit = 2
    
    # Track current assignments
    high_allotted = 0
    med_allotted = 0
    low_allotted = 0

    # 3. Generate Managed Devices (Majority)
    for i in range(managed_count):
        # Managed devices are typically low-risk baseline
        base_net = float(rng.uniform(800, 3000))
        net = float(base_net + rng.uniform(-500, 500))
        freq = int(rng.integers(1, 25))
        
        # Occasional "Managed" risk (optional realism)
        risk_type = "Safe"
        score = int(rng.integers(5, 20))
        
        # Small chance of a managed device having a low/med risk (e.g. neglected updates)
        if rng.random() > 0.95 and low_allotted < low_limit:
            risk_type = "Low"
            score = 35
            low_allotted += 1
        
        rows.append({
            "device_id": f"managed_{i:03d}",
            "known": 1,
            "cpu_usage": float(rng.uniform(10, 35)),
            "network_activity": max(0.0, net),
            "access_frequency": freq,
            "location": str(rng.choice(LOCATIONS)),
            "risk_score": score
        })

    # 4. Generate Shadow IT Devices (Subsets)
    for i in range(shadow_count):
        # Shadow IT devices start with a base risk (+50 score implied)
        score = 50 
        
        # Decide Risk Level for this shadow device based on remaining budget
        if high_allotted < high_limit and rng.random() > 0.4:
            # High Risk Pattern
            net = float(rng.uniform(8500, 15000))
            freq = int(rng.integers(41, 90))
            score = int(rng.integers(81, 100))
            high_allotted += 1
        elif med_allotted < med_limit and rng.random() > 0.3:
            # Medium Risk Pattern
            net = float(rng.uniform(5000, 8000))
            freq = int(rng.integers(26, 40))
            score = int(rng.integers(41, 80))
            med_allotted += 1
        elif low_allotted < low_limit:
            # Low Risk Pattern
            net = float(rng.uniform(3000, 5000))
            freq = int(rng.integers(15, 25))
            score = int(rng.integers(26, 40))
            low_allotted += 1
        else:
            # Baseline Shadow Pattern (No extra flags)
            net = float(rng.uniform(1000, 3000))
            freq = int(rng.integers(5, 15))
            score = 30 # Even unmanaged can be low-risk if quiet
            
        rows.append({
            "device_id": f"shadow_{i:03d}",
            "known": 0,
            "cpu_usage": float(rng.uniform(15, 65)),
            "network_activity": net,
            "access_frequency": freq,
            "location": str(rng.choice(LOCATIONS)),
            "risk_score": score
        })

    # Combine and shuffle for a realistic inventory look
    df = pd.DataFrame(rows)
    return df.sample(frac=1, random_state=config.seed).reset_index(drop=True)

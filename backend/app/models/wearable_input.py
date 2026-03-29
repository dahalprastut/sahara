from pydantic import BaseModel
from typing import Optional

class WearableInput(BaseModel):
    rmssd: float
    nremhr: float
    resting_hr: float
    # ... rest of fields
    stai_score: Optional[float] = 45.0
    negative_affect: Optional[float] = 20.0
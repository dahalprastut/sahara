from fastapi import APIRouter
from app.models.wearable_input import WearableInput
from app.services.prediction_service import predict as run_prediction

router = APIRouter(prefix="/predict", tags=["prediction"])

@router.post("/")
def predict(data: WearableInput):
    return run_prediction(data.dict())
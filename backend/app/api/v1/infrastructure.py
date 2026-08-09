from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_infrastructure():
    return {"status": "infrastructure active"}

from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_audit():
    return {"status": "audit active"}

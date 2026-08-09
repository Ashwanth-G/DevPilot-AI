from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_repositories():
    return {"status": "repositories active"}

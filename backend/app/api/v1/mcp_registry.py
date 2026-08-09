from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_mcp_registry():
    return {"status": "mcp registry active"}

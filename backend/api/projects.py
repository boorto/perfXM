from fastapi import APIRouter

Project = APIRouter()

async def get_projects():
    return {"projects": [{"name": "project1"}, {"name": "project2"}]}
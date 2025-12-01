from fastapi import FastAPI
from api.projects import Project
from api.scripts import Script
from api.test_plan import Test_plan
from api.user_system import User_system
from api.slave_config import Slave_config
import uvicorn

app = FastAPI()

app.include_router(Project, prefix="/api/projects", tags=["Projects"])
app.include_router(Script, prefix="/api/script", tags=["Scripts"])
app.include_router(Test_plan, prefix="/api/script", tags=["Test_plan"])
app.include_router(User_system, prefix="/api/user_system", tags=["User_system"])
app.include_router(Slave_config, prefix="/api/slave_config", tags=["Slave_config"])



if __name__ == '__main__':
    uvicorn.run('main:app', host='127.0.0.1', port=8006,reload=True)
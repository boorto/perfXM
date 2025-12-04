from fastapi import FastAPI
from tortoise import Tortoise
from tortoise.contrib.fastapi import register_tortoise
from contextlib import asynccontextmanager

from config import TORTOISE_ORM, APP_NAME, APP_VERSION, DEBUG, IS_INIT_SCRIPT
from api.projects import Project
from api.scripts import Script
from api.test_plan import Test_plan
from api.user_system import User_system
from api.slave_config import Slave_config
import uvicorn

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    debug=DEBUG
)

# 注册 Tortoise ORM（使用迁移模式，不自动生成 schemas）
register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=False,  # 关闭自动生成，使用 aerich 迁移
    add_exception_handlers=True,
)

# 注册路由
app.include_router(Project, prefix="/api/projects", tags=["Projects"])
app.include_router(Script, prefix="/api/scripts", tags=["Scripts"])
app.include_router(Test_plan, prefix="/api/test-plans", tags=["Test Plans"])
app.include_router(User_system, prefix="/api/users", tags=["User Management"])
app.include_router(Slave_config, prefix="/api/slaves", tags=["Slave Configurations"])


if __name__ == '__main__':
    uvicorn.run('main:app', host='127.0.0.1', port=8006, reload=True)
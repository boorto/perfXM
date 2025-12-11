from fastapi import FastAPI
from tortoise import Tortoise
from tortoise.contrib.fastapi import register_tortoise
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import TORTOISE_ORM, APP_NAME, APP_VERSION, DEBUG, IS_INIT_SCRIPT

# 导入路由
from api.projects import Projects
from api.scripts import Scripts
from api.test_plan import TestPlans
from api.user_system import User_system
from api.roles import Roles
from api.slave_config import Slaves
from api.organizations import Organizations
import uvicorn

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    debug=DEBUG
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite 开发服务器
        "http://127.0.0.1:5173",
        "http://localhost:3000",  # 备用端口
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 Tortoise ORM（使用迁移模式，不自动生成 schemas）
register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=False,  # 关闭自动生成，使用 aerich 迁移
    add_exception_handlers=True,
)

# 注册路由
app.include_router(Projects, prefix="/api/projects", tags=["项目管理"])
app.include_router(Scripts, prefix="/api/scripts", tags=["脚本管理"])
app.include_router(TestPlans, prefix="/api/test-plans", tags=["测试计划"])
app.include_router(User_system, prefix="/api/users", tags=["用户管理"])
app.include_router(Roles, prefix="/api/users/system/roles", tags=["角色管理"])
app.include_router(Slaves, prefix="/api/slaves", tags=["负载机配置"])
app.include_router(Organizations, prefix="/api/organizations", tags=["组织管理"])


if __name__ == '__main__':
    uvicorn.run('main:app', host='127.0.0.1', port=8006, reload=True)
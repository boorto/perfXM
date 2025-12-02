from fastapi import FastAPI
from tortoise import Tortoise
from tortoise.contrib.fastapi import register_tortoise
from contextlib import asynccontextmanager

from api.projects import Project
from api.scripts import Script
from api.test_plan import Test_plan
from api.user_system import User_system
from api.slave_config import Slave_config
import uvicorn

# 数据库配置
TORTOISE_ORM = {
    "connections": {
        "default": "sqlite://db.sqlite3"  # 可以改为 MySQL/PostgreSQL
    },
    "apps": {
        "models": {
            "models": ["models", "aerich.models"],
            "default_connection": "default",
        },
    },
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化数据库
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()
    yield
    # 关闭时清理连接
    await Tortoise.close_connections()

app = FastAPI(lifespan=lifespan)

# 注册 Tortoise ORM
register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=True,
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
"""
配置文件
包含数据库配置、应用配置等
"""
import os
from typing import Dict, Any

# 数据库配置
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite://db.sqlite3")

TORTOISE_ORM = {
    "connections": {
        "default": DATABASE_URL
    },
    "apps": {
        "models": {
            "models": ["models", "aerich.models"],
            "default_connection": "default",
        },
    },
}

# JWT 配置
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 应用配置
APP_NAME = "PerfX Platform"
APP_VERSION = "1.0.0"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# 服务器配置
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8006"))

# 数据库连接池配置
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))

# 日志配置
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = os.getenv("LOG_FILE", None)

# 文件上传配置
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", str(100 * 1024 * 1024)))  # 100MB

# CORS 配置
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# 环境配置
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_INIT_SCRIPT = os.getenv("IS_INIT_SCRIPT", "False").lower() == "true"

def get_database_url() -> str:
    """获取数据库连接URL"""
    return DATABASE_URL

def is_development() -> bool:
    """判断是否为开发环境"""
    return ENVIRONMENT == "development"

def is_production() -> bool:
    """判断是否为生产环境"""
    return ENVIRONMENT == "production"

"""
安全认证模块
包含密码哈希、JWT 令牌等功能
"""
from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
import bcrypt
from passlib.context import CryptContext
import os

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT 配置
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    # bcrypt 密码长度限制为72字节
    if len(password) >= 72:
        password = password[:72]
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """验证令牌"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def create_refresh_token(data: dict):
    """创建刷新令牌"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)  # 7天有效期

    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_refresh_token(token: str) -> Optional[dict]:
    """验证刷新令牌"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None

# 权限检查装饰器
def require_permissions(permissions: Union[str, list]):
    """权限检查装饰器"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # 这里需要从请求上下文中获取用户信息
            # 检查用户是否有所需权限
            # 实际实现需要与 FastAPI 依赖注入配合
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# 默认权限配置
DEFAULT_PERMISSIONS = {
    "superadmin": [
        "user:create", "user:read", "user:update", "user:delete",
        "project:create", "project:read", "project:update", "project:delete",
        "role:create", "role:read", "role:update", "role:delete",
        "organize:create", "organize:read", "organize:update", "organize:delete",
        "script:create", "script:read", "script:update", "script:delete",
        "test_plan:create", "test_plan:read", "test_plan:update", "test_plan:delete",
        "slave:create", "slave:read", "slave:update", "slave:delete",
        "system:manage", "system:monitor"
    ],
    "project_manager": [
        "project:create", "project:read", "project:update",
        "user:read", "user:update",
        "script:create", "script:read", "script:update",
        "test_plan:create", "test_plan:read", "test_plan:update",
        "slave:read", "slave:update"
    ],
    "test_engineer": [
        "project:read",
        "script:read", "script:update",
        "test_plan:create", "test_plan:read", "test_plan:update",
        "slave:read"
    ],
    "developer": [
        "project:read",
        "script:create", "script:read", "script:update",
        "test_plan:read", "test_plan:update",
        "slave:read"
    ],
    "observer": [
        "project:read",
        "script:read",
        "test_plan:read",
        "slave:read"
    ]
}

def get_role_permissions(role_name: str) -> list:
    """获取角色权限列表"""
    return DEFAULT_PERMISSIONS.get(role_name, [])

def has_permission(user_permissions: list, required_permission: str) -> bool:
    """检查用户是否有指定权限"""
    return required_permission in user_permissions

def has_any_permission(user_permissions: list, required_permissions: list) -> bool:
    """检查用户是否有任意一个所需权限"""
    return any(perm in user_permissions for perm in required_permissions)

def has_all_permissions(user_permissions: list, required_permissions: list) -> bool:
    """检查用户是否有所有所需权限"""
    return all(perm in user_permissions for perm in required_permissions)


if __name__ == '__main__':
    print(get_password_hash("username123hahhahhahhahhahahhahahaah"))
    print(verify_password("username123hahhahhahhahhahahhahahaah","$2b$12$0PMC3sZRNSpUsEmLxvhwq.8R4EHV09oOh/43FzGwZ1NE0bA.aO/cy"))
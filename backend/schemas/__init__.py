# 导入所有 Pydantic 模式
from .user_schemas import *
from .project_schemas import *
from .role_schemas import *
from .organize_schemas import *
from .script_schemas import *
from .test_plan_schemas import *
from .slave_schemas import *
from .common_schemas import *

__all__ = [
    # User schemas
    "UserCreate", "UserUpdate", "UserResponse", "UserLogin", "UserPasswordChange",

    # Project schemas
    "ProjectCreate", "ProjectUpdate", "ProjectResponse", "ProjectMemberResponse",

    # Role schemas
    "RoleCreate", "RoleUpdate", "RoleResponse", "UserOrgRoleCreate", "UserOrgRoleResponse",

    # Organize schemas
    "OrganizeCreate", "OrganizeUpdate", "OrganizeResponse",

    # Script schemas
    "ScriptCreate", "ScriptUpdate", "ScriptResponse", "TestPlanScriptCreate",

    # Test Plan schemas
    "TestPlanCreate", "TestPlanUpdate", "TestPlanResponse", "TestPlanSlaveCreate",

    # Slave schemas
    "SlaveConfigCreate", "SlaveConfigUpdate", "SlaveConfigResponse",

    # Common schemas
    "PaginationParams", "PaginatedResponse", "ErrorResponse", "SuccessResponse"
]
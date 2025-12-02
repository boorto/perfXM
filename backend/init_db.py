"""
数据库初始化脚本
创建默认角色、管理员用户等基础数据
"""
import asyncio
import sys
import os
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from tortoise import Tortoise
from models import UserInfo, Role, Organize, UserOrgRole
from security import get_password_hash

TORTOISE_ORM = {
    "connections": {
        "default": "sqlite://db.sqlite3"
    },
    "apps": {
        "models": {
            "models": ["models", "aerich.models"],
            "default_connection": "default",
        },
    },
}

async def init_database():
    """初始化数据库"""
    # 连接数据库
    await Tortoise.init(config=TORTOISE_ORM)

    # 生成表结构
    await Tortoise.generate_schemas()
    print("✅ 数据库表结构生成完成")

    # 检查是否已有数据
    user_count = await UserInfo.all().count()
    if user_count > 0:
        print(f"⚠️  数据库已有 {user_count} 个用户，跳过初始化")
        await Tortoise.close_connections()
        return

    # 检查角色是否已存在
    role_count = await Role.all().count()
    if role_count > 0:
        print(f"⚠️  数据库已有 {role_count} 个角色，跳过初始化")
        await Tortoise.close_connections()
        return

    print("🚀 开始初始化基础数据...")

    # 创建默认角色
    roles_data = [
        {
            "name": "超级管理员",
            "description": "系统超级管理员，拥有所有权限",
            "permissions": [
                "user:create", "user:read", "user:update", "user:delete",
                "project:create", "project:read", "project:update", "project:delete",
                "role:create", "role:read", "role:update", "role:delete",
                "organize:create", "organize:read", "organize:update", "organize:delete",
                "script:create", "script:read", "script:update", "script:delete",
                "test_plan:create", "test_plan:read", "test_plan:update", "test_plan:delete",
                "slave:create", "slave:read", "slave:update", "slave:delete",
                "system:manage", "system:monitor"
            ],
            "is_system": True
        },
        {
            "name": "项目经理",
            "description": "项目经理，管理项目和团队",
            "permissions": [
                "project:create", "project:read", "project:update",
                "user:read", "user:update",
                "script:create", "script:read", "script:update",
                "test_plan:create", "test_plan:read", "test_plan:update",
                "slave:read", "slave:update"
            ],
            "is_system": True
        },
        {
            "name": "测试工程师",
            "description": "测试工程师，执行测试计划",
            "permissions": [
                "project:read",
                "script:read", "script:update",
                "test_plan:create", "test_plan:read", "test_plan:update",
                "slave:read"
            ],
            "is_system": True
        },
        {
            "name": "开发者",
            "description": "开发者，编写和上传脚本",
            "permissions": [
                "project:read",
                "script:create", "script:read", "script:update",
                "test_plan:read", "test_plan:update",
                "slave:read"
            ],
            "is_system": True
        },
        {
            "name": "观察者",
            "description": "观察者，只读权限",
            "permissions": [
                "project:read",
                "script:read",
                "test_plan:read",
                "slave:read"
            ],
            "is_system": True
        }
    ]

    created_roles = []
    for role_data in roles_data:
        role = await Role.create(**role_data)
        created_roles.append(role)
        print(f"✅ 创建角色: {role.name}")

    # 创建默认组织
    org_data = [
        {
            "name": "总公司",
            "description": "总公司",
            "level": 1,
            "sort_order": 1
        },
        {
            "name": "研发部",
            "description": "研发部门",
            "level": 2,
            "sort_order": 1
        },
        {
            "name": "测试部",
            "description": "测试部门",
            "level": 2,
            "sort_order": 2
        },
        {
            "name": "运维部",
            "description": "运维部门",
            "level": 2,
            "sort_order": 3
        }
    ]

    created_orgs = []
    for org in org_data:
        org_obj = await Organize.create(**org)
        created_orgs.append(org_obj)
        print(f"✅ 创建组织: {org['name']}")

    # 设置组织关系
    if len(created_orgs) >= 4:
        # 设置总公司为研发部、测试部、运维部的父级
        created_orgs[1].parent_id = created_orgs[0].id  # 研发部的父级是总公司
        created_orgs[2].parent_id = created_orgs[0].id  # 测试部的父级是总公司
        created_orgs[3].parent_id = created_orgs[0].id  # 运维部的父级是总公司

        await created_orgs[1].save()
        await created_orgs[2].save()
        await created_orgs[3].save()

        print("✅ 设置组织层级关系")

    # 创建超级管理员用户
    admin_user_data = {
        "username": "admin",
        "email": "admin@perfxm.com",
        "password_hash": get_password_hash("admin123"),  # 默认密码，生产环境请修改
        "real_name": "系统管理员",
        "is_active": True,
        "is_superuser": True
    }

    admin_user = await UserInfo.create(**admin_user_data)
    print(f"✅ 创建管理员用户: {admin_user.username}")

    # 给管理员分配角色
    if len(created_roles) > 0 and len(created_orgs) > 0:
        # 分配超级管理员角色
        await UserOrgRole.create(
            user=admin_user,
            organization=created_orgs[0],  # 总公司
            role=created_roles[0]  # 超级管理员
        )
        print(f"✅ 给用户 {admin_user.username} 分配角色: {created_roles[0].name}")

    # 创建测试用户
    test_user_data = [
        {
            "username": "pm_test",
            "email": "pm@perfxm.com",
            "password_hash": get_password_hash("pm123"),
            "real_name": "项目经理测试",
            "is_active": True,
            "is_superuser": False
        },
        {
            "username": "qa_test",
            "email": "qa@perfxm.com",
            "password_hash": get_password_hash("qa123"),
            "real_name": "测试工程师测试",
            "is_active": True,
            "is_superuser": False
        },
        {
            "username": "dev_test",
            "email": "dev@perfxm.com",
            "password_hash": get_password_hash("dev123"),
            "real_name": "开发者测试",
            "is_active": True,
            "is_superuser": False
        }
    ]

    for i, user_data in enumerate(test_user_data):
        user = await UserInfo.create(**user_data)
        print(f"✅ 创建测试用户: {user.username}")

        # 分配角色
        if i + 1 < len(created_roles) and i + 1 < len(created_orgs):
            await UserOrgRole.create(
                user=user,
                organization=created_orgs[i + 1],  # 不同部门
                role=created_roles[i + 1]  # 不同角色
            )
            print(f"✅ 给用户 {user.username} 分配角色: {created_roles[i + 1].name}")

    print("\n🎉 数据库初始化完成!")
    print("\n📋 默认账号信息:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("管理员: admin / admin123")
    print("项目经理: pm_test / pm123")
    print("测试工程师: qa_test / qa123")
    print("开发者: dev_test / dev123")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("⚠️  生产环境请及时修改默认密码!")

    await Tortoise.close_connections()

if __name__ == "__main__":
    print("🔧 开始初始化数据库...")
    asyncio.run(init_database())
    print("✅ 数据库初始化完成!")
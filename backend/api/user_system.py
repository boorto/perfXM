"""
用户系统 API
提供用户登录、注册、信息管理、角色管理等功能
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from pydantic import BaseModel, Field
from tortoise.exceptions import DoesNotExist

from models import UserInfo, Role, UserOrgRole, Organize
from security import (
    verify_password, 
    create_access_token, 
    create_refresh_token, 
    get_current_active_user,
    check_permissions,
    get_password_hash
)
from schemas.common_schemas import ResponseModel
from schemas.user_schemas import UserCreate, UserUpdate
from schemas.role_schemas import RoleCreate, RoleUpdate

User_system = APIRouter()


class LoginRequest(BaseModel):
    """登录请求"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class PasswordChangeRequest(BaseModel):
    """修改密码请求"""
    old_password: str = Field(..., description="旧密码")
    new_password: str = Field(..., min_length=6, description="新密码")


# ==================== 认证相关 ====================

@User_system.post("/login", response_model=ResponseModel, summary="用户登录")
async def login(login_data: LoginRequest):
    """用户登录"""
    # 查找用户
    user = await UserInfo.get_or_none(username=login_data.username)
    
    if not user:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    # 验证密码
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    # 检查用户是否激活
    if not user.is_active:
        raise HTTPException(status_code=403, detail="用户未激活")
    
    # 生成令牌
    token_data = {
        "user_id": user.id,
        "username": user.username,
        "is_superuser": user.is_superuser
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return {
        "code": 200,
        "message": "登录成功",
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "real_name": user.real_name,
                "phone": user.phone,
                "avatar": user.avatar,
                "is_superuser": user.is_superuser,
                "is_active": user.is_active
            }
        }
    }


@User_system.get("/me", response_model=ResponseModel, summary="获取当前用户信息")
async def get_current_user_info(current_user: UserInfo = Depends(get_current_active_user)):
    """获取当前用户信息"""
    return {
        "code": 200,
        "message": "success",
        "data": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "real_name": current_user.real_name,
            "phone": current_user.phone,
            "avatar": current_user.avatar,
            "is_superuser": current_user.is_superuser,
            "is_active": current_user.is_active,
            "created_at": current_user.created_at,
            "updated_at": current_user.updated_at
        }
    }


@User_system.post("/change-password", response_model=ResponseModel, summary="修改密码")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """修改当前用户密码"""
    # 验证旧密码
    if not verify_password(password_data.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="旧密码错误")
    
    # 更新密码
    current_user.password_hash = get_password_hash(password_data.new_password)
    await current_user.save()
    
    return {
        "code": 200,
        "message": "密码修改成功",
        "data": None
    }


# ==================== 用户管理 ====================

@User_system.get("", response_model=ResponseModel, summary="分页获取用户列表")
async def list_users(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    username: Optional[str] = Query(None, description="用户名筛选"),
    email: Optional[str] = Query(None, description="邮箱筛选"),
    is_active: Optional[bool] = Query(None, description="激活状态筛选"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取用户列表（分页）"""
    # 检查权限
    await check_permissions(["user:read"], current_user)
    
    # 构建查询条件
    query = UserInfo.filter(is_deleted=False)
    
    if username:
        query = query.filter(username__icontains=username)
    if email:
        query = query.filter(email__icontains=email)
    if is_active is not None:
        query = query.filter(is_active=is_active)
    
    # 计算总数
    total = await query.count()
    
    # 分页查询
    offset = (page - 1) * page_size
    users = await query.offset(offset).limit(page_size)
    
    # 获取用户的角色信息
    user_ids = [u.id for u in users]
    user_roles = await UserOrgRole.filter(
        user_id__in=user_ids,
        is_active=True
    ).prefetch_related('role')
    
    # 构建用户-角色映射（取第一个角色）
    user_role_map = {}
    for ur in user_roles:
        if ur.user_id not in user_role_map:
            user_role_map[ur.user_id] = {
                'org_id': ur.organization_id,
                'role_id': ur.role_id,
                'role_name': ur.role.name
            }
    
    # 构建响应数据
    items = []
    for user in users:
        role_info = user_role_map.get(user.id, {})
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "real_name": user.real_name,
            "phone": user.phone,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "org_id": role_info.get('org_id'),
            "role_id": role_info.get('role_id'),
            "role_name": role_info.get('role_name'),
            "last_login": user.last_login,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
        items.append(user_data)
    # 计算总页数
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "code": 200,
        "message": "success",
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "size": page_size,
            "pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }


@User_system.get("/{user_id}", response_model=ResponseModel, summary="获取用户详情")
async def get_user_detail(
    user_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取用户详情"""
    # 检查权限
    await check_permissions(["user:read"], current_user)
    
    user = await UserInfo.get_or_none(id=user_id, is_deleted=False)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 获取用户的组织角色
    user_org_roles = await UserOrgRole.filter(user_id=user_id, is_active=True).prefetch_related('organization', 'role')
    
    organizations = []
    org_id = None
    role_id = None
    role_name = None
    
    for uor in user_org_roles:
        organizations.append({
            "organization_id": uor.organization.id,
            "organization_name": uor.organization.name,
            "role_id": uor.role.id,
            "role_name": uor.role.name,
            "joined_at": uor.joined_at
        })
        # 取第一个作为主要组织和角色
        if org_id is None:
            org_id = uor.organization_id
            role_id = uor.role_id
            role_name = uor.role.name
    
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "real_name": user.real_name,
        "phone": user.phone,
        "avatar": user.avatar,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "org_id": org_id,
        "role_id": role_id,
        "role_name": role_name,
        "last_login": user.last_login,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "organizations": organizations
    }
    
    return {
        "code": 200,
        "message": "success",
        "data": user_data
    }


@User_system.post("", response_model=ResponseModel, summary="创建用户")
async def create_user(
    user_data: UserCreate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """创建用户"""
    # 检查权限
    await check_permissions(["user:create"], current_user)
    
    # 检查用户名是否已存在
    if await UserInfo.filter(username=user_data.username, is_deleted=False).exists():
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 检查邮箱是否已存在
    if await UserInfo.filter(email=user_data.email, is_deleted=False).exists():
        raise HTTPException(status_code=400, detail="邮箱已存在")
    
    # 创建用户
    user = await UserInfo.create(
        username=user_data.username,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        phone=user_data.phone,
        real_name=user_data.real_name,
        avatar=user_data.avatar,
        is_superuser=user_data.is_superuser
    )
    
    # 如果提供了组织和角色，创建关联
    role_name = None
    org_id = user_data.org_id
    role_id = user_data.role_id
    
    if org_id and role_id:
        await UserOrgRole.create(
            user_id=user.id,
            organization_id=org_id,
            role_id=role_id,
            is_active=True
        )
        # 获取角色名称
        role = await Role.get_or_none(id=role_id)
        if role:
            role_name = role.name
    
    return {
        "code": 200,
        "message": "操作成功",
        "data": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "real_name": user.real_name,
            "is_active": user.is_active,
            "role_id": role_id,
            "role_name": role_name,
            "created_at": user.created_at
        }
    }


@User_system.put("/{user_id}", response_model=ResponseModel, summary="更新用户")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """更新用户"""
    # 检查权限
    await check_permissions(["user:update"], current_user)
    
    # 获取用户
    user = await UserInfo.get_or_none(id=user_id, is_deleted=False)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 更新用户
    update_data = user_data.model_dump(exclude_unset=True)
    await user.update_from_dict(update_data).save()
    await user.refresh_from_db()
    
    return {
        "code": 200,
        "message": "用户更新成功",
        "data": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "real_name": user.real_name,
            "is_active": user.is_active,
            "updated_at": user.updated_at
        }
    }


@User_system.delete("/{user_id}", response_model=ResponseModel, summary="删除用户")
async def delete_user(
    user_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """删除用户（软删除）"""
    # 检查权限
    await check_permissions(["user:delete"], current_user)
    
    # 获取用户
    user = await UserInfo.get_or_none(id=user_id, is_deleted=False)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 不能删除自己
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="不能删除自己")
    
    # 软删除
    user.is_deleted = True
    await user.save()
    
    return {
        "code": 200,
        "message": "用户删除成功",
        "data": None
    }

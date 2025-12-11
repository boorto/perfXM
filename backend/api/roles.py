"""
角色管理 API
提供角色的 CRUD 操作
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from tortoise.exceptions import DoesNotExist

from models import Role, Organize
from security import get_current_active_user, check_permissions
from schemas.common_schemas import ResponseModel
from schemas.role_schemas import RoleCreate, RoleUpdate

Roles = APIRouter()


# ==================== 角色管理 ====================

@Roles.get("", response_model=ResponseModel, summary="获取角色列表")
async def list_roles(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    name: Optional[str] = Query(None, description="角色名称筛选"),
    org_id: Optional[int] = Query(None, description="组织ID筛选"),
    current_user = Depends(get_current_active_user)
):
    """获取角色列表（分页）"""
    # 检查权限
    await check_permissions(["role:read"], current_user)
    
    # 构建查询条件
    query = Role.filter(is_deleted=False)
    
    if name:
        query = query.filter(name__icontains=name)
    if org_id is not None:
        query = query.filter(org_id=org_id)
    
    # 计算总数
    total = await query.count()
    
    # 分页查询
    roles = await query.offset((page - 1) * page_size).limit(page_size)
    
    # 获取所有唯一的组织ID
    org_ids = {role.org_id for role in roles if role.org_id}
    
    # 批量获取组织信息
    orgs_dict = {}
    if org_ids:
        orgs = await Organize.filter(id__in=list(org_ids))
        orgs_dict = {org.id: org.name for org in orgs}
    
    roles_data = []
    for role in roles:
        role_dict = {
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "permissions": role.permissions,
            "is_system": role.is_system,
            "org_id": role.org_id,
            "org_name": orgs_dict.get(role.org_id) if role.org_id else None,
            "created_at": role.created_at,
            "updated_at": role.updated_at
        }
        roles_data.append(role_dict)
    
    # 计算总页数
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "code": 200,
        "message": "success",
        "data": {
            "items": roles_data,
            "total": total,
            "page": page,
            "size": page_size,
            "pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }


@Roles.get("/{role_id}", response_model=ResponseModel, summary="获取角色详情")
async def get_role_detail(
    role_id: int,
    current_user = Depends(get_current_active_user)
):
    """获取角色详情"""
    # 检查权限
    await check_permissions(["role:read"], current_user)
    
    role = await Role.get_or_none(id=role_id, is_deleted=False)
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    # 获取组织信息
    org_name = None
    if role.org_id:
        org = await Organize.get_or_none(id=role.org_id)
        if org:
            org_name = org.name
    
    role_data = {
        "id": role.id,
        "name": role.name,
        "description": role.description,
        "permissions": role.permissions,
        "is_system": role.is_system,
        "org_id": role.org_id,
        "org_name": org_name,
        "created_at": role.created_at,
        "updated_at": role.updated_at
    }
    
    return {
        "code": 200,
        "message": "success",
        "data": role_data
    }


@Roles.post("", response_model=ResponseModel, summary="创建角色")
async def create_role(
    role_data: RoleCreate,
    current_user = Depends(get_current_active_user)
):
    """创建角色"""
    # 检查权限
    await check_permissions(["role:create"], current_user)
    
    # 检查角色名称是否已存在
    if await Role.filter(name=role_data.name, is_deleted=False).exists():
        raise HTTPException(status_code=400, detail="角色名称已存在")
    
    # 创建角色
    role = await Role.create(**role_data.model_dump())
    
    # 获取组织信息
    org_name = None
    if role.org_id:
        org = await Organize.get_or_none(id=role.org_id)
        if org:
            org_name = org.name
    
    return {
        "code": 200,
        "message": "操作成功",
        "data": {
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "permissions": role.permissions,
            "is_system": role.is_system,
            "org_id": role.org_id,
            "org_name": org_name,
            "created_at": role.created_at
        }
    }


@Roles.put("/{role_id}", response_model=ResponseModel, summary="更新角色")
async def update_role(
    role_id: int,
    role_data: RoleUpdate,
    current_user = Depends(get_current_active_user)
):
    """更新角色"""
    # 检查权限
    await check_permissions(["role:update"], current_user)
    
    # 获取角色
    role = await Role.get_or_none(id=role_id, is_deleted=False)
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    # 系统角色不能修改
    if role.is_system:
        raise HTTPException(status_code=400, detail="系统角色不能修改")
    
    # 检查角色名称是否已存在（排除当前角色）
    if role_data.name:
        existing_role = await Role.filter(
            name=role_data.name, 
            is_deleted=False
        ).exclude(id=role_id).exists()
        if existing_role:
            raise HTTPException(status_code=400, detail="角色名称已存在")
    
    # 更新角色
    update_data = role_data.model_dump(exclude_unset=True)
    await role.update_from_dict(update_data).save()
    await role.refresh_from_db()
    
    # 获取组织信息
    org_name = None
    if role.org_id:
        org = await Organize.get_or_none(id=role.org_id)
        if org:
            org_name = org.name
    
    return {
        "code": 200,
        "message": "角色更新成功",
        "data": {
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "permissions": role.permissions,
            "org_id": role.org_id,
            "org_name": org_name,
            "updated_at": role.updated_at
        }
    }


@Roles.delete("/{role_id}", response_model=ResponseModel, summary="删除角色")
async def delete_role(
    role_id: int,
    current_user = Depends(get_current_active_user)
):
    """删除角色（软删除）"""
    # 检查权限
    await check_permissions(["role:delete"], current_user)
    
    # 获取角色
    role = await Role.get_or_none(id=role_id, is_deleted=False)
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    # 系统角色不能删除
    if role.is_system:
        raise HTTPException(status_code=400, detail="系统角色不能删除")
    
    # 软删除
    role.is_deleted = True
    await role.save()
    
    return {
        "code": 200,
        "message": "角色删除成功",
        "data": None
    }

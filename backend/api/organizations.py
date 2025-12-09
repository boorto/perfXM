"""
组织管理 API
提供组织的 CRUD 操作、层级结构查询等功能
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from tortoise.exceptions import DoesNotExist

from models import Organize, UserInfo, UserOrgRole
from schemas.organize_schemas import (
    OrganizeCreate,
    OrganizeUpdate,
    OrganizeResponse,
    OrganizeDetailResponse,
    OrganizeTreeResponse
)
from schemas.common_schemas import ResponseModel
from security import get_current_active_user, check_permissions

Organizations = APIRouter()


# 辅助函数
async def check_organization_access(organization_id: int, current_user: UserInfo) -> Organize:
    """
    检查组织是否存在以及用户是否有访问权限
    
    Args:
        organization_id: 组织ID
        current_user: 当前用户
        
    Returns:
        Organize: 组织对象
        
    Raises:
        HTTPException: 组织不存在或无权访问
    """
    # 检查组织是否存在
    org = await Organize.get_or_none(id=organization_id, is_deleted=False)
    if not org:
        raise HTTPException(status_code=404, detail="组织不存在")
    
    # 非超级管理员检查权限
    if not current_user.is_superuser:
        user_org_roles = await UserOrgRole.filter(user=current_user, is_active=True).values_list('organization_id', flat=True)
        if organization_id not in user_org_roles:
            raise HTTPException(status_code=403, detail="无权访问该组织")
    
    return org


@Organizations.get("", response_model=ResponseModel, summary="分页获取组织")
async def list_organizations(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    name: Optional[str] = Query(None, description="组织名称筛选"),
    level: Optional[int] = Query(None, description="层级筛选"),
    parent_id: Optional[int] = Query(None, description="父级组织ID筛选"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取组织列表（分页）"""
    # 构建查询条件
    query = Organize.filter(is_deleted=False)
    
    if name:
        query = query.filter(name__icontains=name)
    if level is not None:
        query = query.filter(level=level)
    if parent_id is not None:
        query = query.filter(parent_id=parent_id)
    
    # 非超级管理员只能看到自己所属的组织
    if not current_user.is_superuser:
        user_org_roles = await UserOrgRole.filter(user=current_user, is_active=True).values_list('organization_id', flat=True)
        query = query.filter(id__in=user_org_roles)
    
    # 计算总数
    total = await query.count()
    
    # 分页查询
    offset = (page - 1) * page_size
    organizations = await query.offset(offset).limit(page_size).prefetch_related('manager_id')
    
    # 构建响应数据
    items = []
    for org in organizations:
        org_data = {
            "id": org.id,
            "name": org.name,
            "description": org.description,
            "parent_id": org.parent_id,
            "manager_id": org.manager_id.id if org.manager_id else None,
            "level": org.level,
            "sort_order": org.sort_order,
            "created_at": org.created_at,
            "updated_at": org.updated_at
        }
        items.append(org_data)
    
    # 计算总页数
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "code": 200,
        "message": "success",
        "data":{
            "items": items,
            "total": total,
            "page": page,
            "size": page_size,
            "pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    }


@Organizations.get("/tree", response_model=ResponseModel, summary="获取组织树")
async def get_organization_tree(
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取组织树形结构"""
    # 获取所有未删除的组织
    if current_user.is_superuser:
        # 获取组织未删除关联的用户信息，按sort_order排序；prefetch_related访问关联字段
        organizations = await Organize.filter(is_deleted=False).prefetch_related('manager_id').order_by('sort_order')
    else:
        # 非超级管理员只能看到自己所属的组织
        # values_list只查询特定字段的值，返回一个元组列表[(1,), (2,), (3,)]
        # lat=True获取单个字段的扁平化列表[1, 2, 3]
        user_org_roles = await UserOrgRole.filter(user=current_user, is_active=True).values_list('organization_id', flat=True)
        organizations = await Organize.filter(id__in=user_org_roles, is_deleted=False).prefetch_related('manager_id').order_by('sort_order')

    # 构建组织字典
    org_dict = {}
    for org in organizations:
        org_dict[org.id] = {
            "id": org.id,
            "name": org.name,
            "level": org.level,
            "parent_id": org.parent_id,
            "manager": {
                "id": org.manager_id.id,
                "username": org.manager_id.username,
                "real_name": org.manager_id.real_name
            } if org.manager_id else None,
            "children": []
        }
    # 构建树形结构
    tree = []
    for org_id, org_data in org_dict.items():

        # 找到父级组织
        if org_data["parent_id"] is None:
            tree.append(org_data)
        # 找到子级组织
        elif org_data["parent_id"] in org_dict:
            # 添加子级组织
            org_dict[org_data["parent_id"]]["children"].append(org_data)
    
    return {
        "code": 200,
        "message": "success",
        "data": tree
    }


@Organizations.get("/{organization_id}", response_model=ResponseModel, summary="获取组织详情")
async def get_organization_detail(
    organization_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取组织详情"""
    # 检查组织存在性和访问权限
    org = await check_organization_access(organization_id, current_user)
    await org.fetch_related('manager_id')
    
    # 获取父级组织
    parent = None
    if org.parent_id:
        parent_org = await Organize.get_or_none(id=org.parent_id, is_deleted=False)
        if parent_org:
            parent = {
                "id": parent_org.id,
                "name": parent_org.name,
                "level": parent_org.level
            }
    
    # 获取子级组织
    children_orgs = await Organize.filter(parent_id=organization_id, is_deleted=False).order_by('sort_order')
    children = [
        {
            "id": child.id,
            "name": child.name,
            "level": child.level,
            "sort_order": child.sort_order
        }
        for child in children_orgs
    ]
    
    # 获取组织成员
    user_org_roles = await UserOrgRole.filter(organization_id=organization_id, is_active=True).prefetch_related('user', 'role')
    members = [
        {
            "user_id": uor.user.id,
            "username": uor.user.username,
            "real_name": uor.user.real_name,
            "email": uor.user.email,
            "role_id": uor.role.id,
            "role_name": uor.role.name,
            "joined_at": uor.joined_at
        }
        for uor in user_org_roles
    ]
    
    # 统计信息
    stats = {
        "total_members": len(members),
        "total_children": len(children),
        "total_descendants": await count_descendants(organization_id)
    }
    
    org_data = {
        "id": org.id,
        "name": org.name,
        "description": org.description,
        "parent_id": org.parent_id,
        "manager_id": org.manager_id.id if org.manager_id else None,
        "level": org.level,
        "sort_order": org.sort_order,
        "created_at": org.created_at,
        "updated_at": org.updated_at,
        "parent": parent,
        "manager": {
            "id": org.manager_id.id,
            "username": org.manager_id.username,
            "real_name": org.manager_id.real_name,
            "email": org.manager_id.email
        } if org.manager_id else None,
        "children": children,
        "members": members,
        "stats": stats
    }
    
    return {
        "code": 200,
        "message": "success",
        "data": org_data
    }


@Organizations.post("", response_model=ResponseModel, summary="创建组织")
async def create_organization(
    org_data: OrganizeCreate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """创建组织"""
    # 检查权限 有创建权限的用户才能创建组织
    await check_permissions(["organize:create"], current_user)
    
    # 处理特殊值：0 表示 None
    create_data = org_data.model_dump()
    if create_data.get('parent_id') == 0:
        create_data['parent_id'] = None
    if create_data.get('manager_id') == 0:
        create_data['manager_id'] = None

    if await Organize.get_or_none(name=org_data.name):
        raise HTTPException(status_code=400, detail="组织名称已存在")
    # 检查父级组织是否存在，默认只有一个父组织
    if create_data.get('parent_id'):
        parent = await Organize.get_or_none(id=create_data['parent_id'], is_deleted=False)
        if not parent:
            raise HTTPException(status_code=400, detail="父级组织不存在")
        # 自动设置层级为父级+1
        create_data['level'] = parent.level + 1
    
    # 检查管理员是否存在，只有管理员可以创建组织
    if create_data.get('manager_id'):
        manager = await UserInfo.get_or_none(id=create_data['manager_id'], is_active=True)
        if not manager:
            raise HTTPException(status_code=400, detail="管理员用户不存在")
    
    # 创建组织
    org = await Organize.create(**create_data)
    
    return {
        "code": 200,
        "message": "操作成功",
        "data": {
            "id": org.id,
            "name": org.name,
            "description": org.description,
            "parent_id": org.parent_id,
            "manager_id": org.manager_id.id if org.manager_id else None,
            "level": org.level,
            "sort_order": org.sort_order,
            "created_at": org.created_at,
            "updated_at": org.updated_at
        }
    }


@Organizations.put("/{organization_id}", response_model=ResponseModel, summary="更新组织")
async def update_organization(
    organization_id: int,
    org_data: OrganizeUpdate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """更新组织"""
    # 检查权限
    await check_permissions(["organize:update"], current_user)
    
    # 获取组织
    try:
        org = await Organize.get(id=organization_id, is_deleted=False)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="组织不存在")
    
    # 检查父级组织
    if org_data.parent_id is not None:
        if org_data.parent_id == organization_id:
            raise HTTPException(status_code=400, detail="不能将组织设置为自己的父级")
        
        if org_data.parent_id != 0:  # 0 表示设置为顶级组织
            parent = await Organize.get_or_none(id=org_data.parent_id, is_deleted=False)
            if not parent:
                raise HTTPException(status_code=400, detail="父级组织不存在")
    
    # 检查管理员
    if org_data.manager_id is not None:
        if org_data.manager_id != 0:  # 0 表示移除管理员
            manager = await UserInfo.get_or_none(id=org_data.manager_id, is_active=True)
            if not manager:
                raise HTTPException(status_code=400, detail="管理员用户不存在")
    
    # 更新组织
    update_data = org_data.model_dump(exclude_unset=True)
    
    # 处理特殊值
    if 'parent_id' in update_data and update_data['parent_id'] == 0:
        update_data['parent_id'] = None
    if 'manager_id' in update_data and update_data['manager_id'] == 0:
        update_data['manager_id'] = None
    
    await org.update_from_dict(update_data).save()
    
    # 重新加载以获取最新数据
    await org.refresh_from_db()
    
    return {
        "code": 200,
        "message": "组织更新成功",
        "data": {
            "id": org.id,
            "name": org.name,
            "description": org.description,
            "parent_id": org.parent_id,
            "manager_id": org.manager_id_id if hasattr(org, 'manager_id_id') else None,
            "level": org.level,
            "sort_order": org.sort_order,
            "updated_at": org.updated_at
        }
    }


@Organizations.delete("/{organization_id}", response_model=ResponseModel, summary="删除组织")
async def delete_organization(
    organization_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """删除组织（软删除）"""
    # 检查权限
    await check_permissions(["organize:delete"], current_user)
    
    # 获取组织
    try:
        org = await Organize.get(id=organization_id, is_deleted=False)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="组织不存在")
    
    # 检查是否有子组织
    children_count = await Organize.filter(parent_id=organization_id, is_deleted=False).count()
    if children_count > 0:
        raise HTTPException(status_code=400, detail="该组织下还有子组织，无法删除")
    
    # 软删除
    org.is_deleted = True
    await org.save()
    
    return {
        "code": 200,
        "message": "组织删除成功",
        "data": None
    }


@Organizations.get("/{organization_id}/children", response_model=ResponseModel, summary="获取组织子组织")
async def get_organization_children(
    organization_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取组织的直接子组织"""
    # 检查组织存在性和访问权限
    await check_organization_access(organization_id, current_user)
    
    # 获取子组织
    children = await Organize.filter(parent_id=organization_id, is_deleted=False).prefetch_related('manager_id').order_by('sort_order')
    
    children_data = [
        {
            "id": child.id,
            "name": child.name,
            "description": child.description,
            "level": child.level,
            "sort_order": child.sort_order,
            "manager": {
                "id": child.manager_id.id,
                "username": child.manager_id.username,
                "real_name": child.manager_id.real_name
            } if child.manager_id else None,
            "created_at": child.created_at
        }
        for child in children
    ]
    
    return {
        "code": 200,
        "message": "success",
        "data": children_data
    }


@Organizations.get("/{organization_id}/users", response_model=ResponseModel, summary="获取组织下的用户")
async def get_organization_users(
    organization_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取组织的所有用户"""
    # 检查组织存在性和访问权限
    await check_organization_access(organization_id, current_user)
    
    # 获取组织用户
    user_org_roles = await UserOrgRole.filter(organization_id=organization_id, is_active=True).prefetch_related('user', 'role')
    
    users_data = [
        {
            "user_id": uor.user.id,
            "username": uor.user.username,
            "real_name": uor.user.real_name,
            "email": uor.user.email,
            "is_active": uor.user.is_active,
            "role": {
                "id": uor.role.id,
                "name": uor.role.name,
                "description": uor.role.description
            },
            "joined_at": uor.joined_at
        }
        for uor in user_org_roles
    ]
    
    return {
        "code": 200,
        "message": "success",
        "data": users_data
    }


# 辅助函数
async def count_descendants(organization_id: int) -> int:
    """递归计算所有后代组织数量"""
    children = await Organize.filter(parent_id=organization_id, is_deleted=False).values_list('id', flat=True)
    count = len(children)
    
    for child_id in children:
        count += await count_descendants(child_id)
    
    return count

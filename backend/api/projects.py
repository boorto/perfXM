"""
项目管理 API
提供项目的 CRUD 操作、成员管理等功能
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from tortoise.exceptions import DoesNotExist

from models import Project, UserInfo, ProjectMember, Script
from schemas.project_schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectDetailResponse
)
from schemas.common_schemas import ResponseModel
from security import get_current_active_user, check_permissions

Projects = APIRouter()


# 辅助函数
async def check_project_access(project_id: int, current_user: UserInfo) -> Project:
    """
    检查项目是否存在以及用户是否有访问权限
    
    Args:
        project_id: 项目ID
        current_user: 当前用户
        
    Returns:
        Project: 项目对象
        
    Raises:
        HTTPException: 项目不存在或无权访问
    """
    # 检查项目是否存在
    project = await Project.get_or_none(id=project_id, is_deleted=False)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    # 非超级管理员检查权限
    if not current_user.is_superuser:
        # 检查用户是否是项目成员或项目经理
        is_member = await ProjectMember.filter(
            project_id=project_id,
            user_id=current_user.id,
            is_active=True
        ).exists()
        
        is_manager = project.manager_id_id == current_user.id if hasattr(project, 'manager_id_id') else False
        
        if not is_member and not is_manager:
            raise HTTPException(status_code=403, detail="无权访问该项目")
    
    return project


@Projects.get("", response_model=ResponseModel, summary="分页获取项目列表")
async def list_projects(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    name: Optional[str] = Query(None, description="项目名称筛选"),
    status: Optional[str] = Query(None, description="项目状态筛选"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取项目列表（分页）"""
    # 构建查询条件
    query = Project.filter(is_deleted=False)
    
    if name:
        query = query.filter(name__icontains=name)
    if status:
        query = query.filter(status=status)
    
    # 非超级管理员只能看到自己参与的项目
    if not current_user.is_superuser:
        # 获取用户作为成员的项目
        member_project_ids = await ProjectMember.filter(
            user_id=current_user.id,
            is_active=True
        ).values_list('project_id', flat=True)
        
        # 获取用户作为经理的项目
        manager_project_ids = await Project.filter(
            manager_id=current_user.id,
            is_deleted=False
        ).values_list('id', flat=True)
        
        # 合并两个列表
        accessible_project_ids = list(set(member_project_ids) | set(manager_project_ids))
        query = query.filter(id__in=accessible_project_ids)
    
    # 计算总数
    total = await query.count()
    
    # 分页查询
    offset = (page - 1) * page_size
    projects = await query.offset(offset).limit(page_size).prefetch_related('manager_id')
    
    # 构建响应数据
    items = []
    for project in projects:
        project_data = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "manager_id": project.manager_id_id if hasattr(project, 'manager_id_id') else None,
            "created_at": project.created_at,
            "updated_at": project.updated_at
        }
        items.append(project_data)
    
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


@Projects.get("/{project_id}", response_model=ResponseModel, summary="获取项目详情")
async def get_project_detail(
    project_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取项目详情"""
    # 检查项目存在性和访问权限
    project = await check_project_access(project_id, current_user)
    await project.fetch_related('manager_id')
    
    # 获取项目成员
    members = await ProjectMember.filter(project_id=project_id, is_active=True).prefetch_related('user', 'role')
    members_data = [
        {
            "user_id": member.user.id,
            "username": member.user.username,
            "real_name": member.user.real_name,
            "role_id": member.role.id,
            "role_name": member.role.name,
            "joined_at": member.joined_at
        }
        for member in members
    ]
    
    # 获取项目脚本数量
    scripts_count = await Script.filter(project_id=project_id, is_deleted=False).count()
    
    project_data = {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "manager_id": project.manager_id.id if project.manager_id else None,
        "manager": {
            "id": project.manager_id.id,
            "username": project.manager_id.username,
            "real_name": project.manager_id.real_name,
            "email": project.manager_id.email
        } if project.manager_id else None,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "members": members_data,
        "stats": {
            "total_members": len(members_data),
            "total_scripts": scripts_count
        }
    }
    
    return {
        "code": 200,
        "message": "success",
        "data": project_data
    }


@Projects.post("", response_model=ResponseModel, summary="创建项目")
async def create_project(
    project_data: ProjectCreate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """创建项目"""
    # 检查权限
    await check_permissions(["project:create"], current_user)
    
    # 检查项目名称是否已存在
    if await Project.filter(name=project_data.name, is_deleted=False).exists():
        raise HTTPException(status_code=400, detail="项目名称已存在")
    
    # 检查项目经理是否存在
    manager = await UserInfo.get_or_none(id=project_data.manager_id, is_active=True)
    if not manager:
        raise HTTPException(status_code=400, detail="项目经理不存在")
    
    # 创建项目
    project = await Project.create(
        name=project_data.name,
        description=project_data.description,
        status=project_data.status,
        manager_id=manager
    )
    
    return {
        "code": 200,
        "message": "操作成功",
        "data": {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "manager_id": manager.id,
            "created_at": project.created_at,
            "updated_at": project.updated_at
        }
    }


@Projects.put("/{project_id}", response_model=ResponseModel, summary="更新项目")
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """更新项目"""
    # 检查权限
    await check_permissions(["project:update"], current_user)
    
    # 获取项目
    project = await Project.get_or_none(id=project_id, is_deleted=False)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    # 检查项目经理
    if project_data.manager_id is not None:
        manager = await UserInfo.get_or_none(id=project_data.manager_id, is_active=True)
        if not manager:
            raise HTTPException(status_code=400, detail="项目经理不存在")
    
    # 更新项目
    update_data = project_data.model_dump(exclude_unset=True)
    await project.update_from_dict(update_data).save()
    await project.refresh_from_db()
    
    return {
        "code": 200,
        "message": "项目更新成功",
        "data": {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "manager_id": project.manager_id_id if hasattr(project, 'manager_id_id') else None,
            "updated_at": project.updated_at
        }
    }


@Projects.delete("/{project_id}", response_model=ResponseModel, summary="删除项目")
async def delete_project(
    project_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """删除项目（软删除）"""
    # 检查权限
    await check_permissions(["project:delete"], current_user)
    
    # 获取项目
    project = await Project.get_or_none(id=project_id, is_deleted=False)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    # 检查是否有关联的脚本
    scripts_count = await Script.filter(project_id=project_id, is_deleted=False).count()
    if scripts_count > 0:
        raise HTTPException(status_code=400, detail=f"该项目下还有 {scripts_count} 个脚本，无法删除")
    
    # 软删除
    project.is_deleted = True
    await project.save()
    
    return {
        "code": 200,
        "message": "项目删除成功",
        "data": None
    }


@Projects.get("/{project_id}/members", response_model=ResponseModel, summary="获取项目成员")
async def get_project_members(
    project_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取项目的所有成员"""
    # 检查项目存在性和访问权限
    await check_project_access(project_id, current_user)
    
    # 获取项目成员
    members = await ProjectMember.filter(project_id=project_id, is_active=True).prefetch_related('user', 'role')
    
    members_data = [
        {
            "id": member.id,
            "user_id": member.user.id,
            "username": member.user.username,
            "real_name": member.user.real_name,
            "email": member.user.email,
            "is_active": member.user.is_active,
            "role": {
                "id": member.role.id,
                "name": member.role.name,
                "description": member.role.description
            },
            "joined_at": member.joined_at
        }
        for member in members
    ]
    
    return {
        "code": 200,
        "message": "success",
        "data": members_data
    }
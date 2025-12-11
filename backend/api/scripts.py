"""
脚本管理 API
提供脚本的 CRUD 操作
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from fastapi.responses import FileResponse
from tortoise.exceptions import DoesNotExist
from pathlib import Path
from datetime import datetime
import os
from models import Script, UserInfo, Project, ProjectMember
from schemas.script_schemas import (
    ScriptCreate,
    ScriptUpdate,
    ScriptResponse,
    ScriptDetailResponse
)
from schemas.common_schemas import ResponseModel
from security import get_current_active_user, check_permissions

Scripts = APIRouter()


# 辅助函数
async def check_script_access(script_id: int, current_user: UserInfo) -> Script:
    """
    检查脚本是否存在以及用户是否有访问权限
    
    Args:
        script_id: 脚本ID
        current_user: 当前用户
        
    Returns:
        Script: 脚本对象
        
    Raises:
        HTTPException: 脚本不存在或无权访问
    """
    # 检查脚本是否存在
    script = await Script.get_or_none(id=script_id, is_deleted=False)
    if not script:
        raise HTTPException(status_code=404, detail="脚本不存在")
    
    # 非超级管理员检查权限
    if not current_user.is_superuser:
        # 检查用户是否是脚本作者
        is_author = script.author_id_id == current_user.id if hasattr(script, 'author_id_id') else False
        
        # 检查用户是否是项目成员
        is_project_member = await ProjectMember.filter(
            project_id=script.project_id_id if hasattr(script, 'project_id_id') else script.project_id,
            user_id=current_user.id,
            is_active=True
        ).exists()
        
        if not is_author and not is_project_member:
            raise HTTPException(status_code=403, detail="无权访问该脚本")
    
    return script


@Scripts.get("", response_model=ResponseModel, summary="分页获取脚本列表")
async def list_scripts(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    name: Optional[str] = Query(None, description="脚本名称筛选"),
    project_id: Optional[int] = Query(None, description="项目ID筛选"),
    script_type: Optional[str] = Query(None, description="脚本类型筛选"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取脚本列表（分页）"""
    # 构建查询条件
    query = Script.filter(is_deleted=False)
    
    if name:
        query = query.filter(name__icontains=name)
    if project_id:
        query = query.filter(project_id=project_id)
    if script_type:
        query = query.filter(script_type=script_type)
    
    # 非超级管理员只能看到自己项目的脚本
    if not current_user.is_superuser:
        # 获取用户参与的项目
        member_project_ids = await ProjectMember.filter(
            user_id=current_user.id,
            is_active=True
        ).values_list('project_id', flat=True)
        
        # 获取用户作为经理的项目
        manager_project_ids = await Project.filter(
            manager_id=current_user.id,
            is_deleted=False
        ).values_list('id', flat=True)
        
        accessible_project_ids = list(set(member_project_ids) | set(manager_project_ids))
        query = query.filter(project_id__in=accessible_project_ids)
    
    # 计算总数
    total = await query.count()
    
    # 分页查询
    offset = (page - 1) * page_size
    scripts = await query.offset(offset).limit(page_size).prefetch_related('author_id', 'project_id')
    
    # 构建响应数据
    items = []
    for script in scripts:
        script_data = {
            "id": script.id,
            "name": script.name,
            "file_path": script.file_path,
            "file_size": script.file_size,
            "script_version": script.script_version,
            "script_type": script.script_type,
            "description": script.description,
            "author_id": script.author_id.id if script.author_id else None,
            "project_id": script.project_id.id if script.project_id else None,
            "is_active": script.is_active,
            "created_at": script.created_at,
            "updated_at": script.updated_at
        }
        items.append(script_data)
    
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


@Scripts.get("/{script_id}", response_model=ResponseModel, summary="获取脚本详情")
async def get_script_detail(
    script_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取脚本详情"""
    # 检查脚本存在性和访问权限
    script = await check_script_access(script_id, current_user)
    await script.fetch_related('author_id', 'project_id')
    
    script_data = {
        "id": script.id,
        "name": script.name,
        "file_path": script.file_path,
        "file_size": script.file_size,
        "script_version": script.script_version,
        "script_type": script.script_type,
        "description": script.description,
        "is_active": script.is_active,
        "created_at": script.created_at,
        "updated_at": script.updated_at,
        "author": {
            "id": script.author_id.id,
            "username": script.author_id.username,
            "real_name": script.author_id.real_name
        } if script.author_id else None,
        "project": {
            "id": script.project_id.id,
            "name": script.project_id.name,
            "status": script.project_id.status
        } if script.project_id else None
    }
    
    return {
        "code": 200,
        "message": "success",
        "data": script_data
    }


@Scripts.post("/{script_id}/download", summary="下载脚本文件")
async def download_script(
    script_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """下载脚本文件"""
    
    # 检查脚本存在性和访问权限
    script = await check_script_access(script_id, current_user)
    
    # 检查文件是否存在
    file_path = Path(script.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="脚本文件不存在")
    
    # 使用脚本名称 + 文件扩展名（去掉时间戳）
    # 例如: zhiwen.jmx 而不是 zhiwen_20251210_123456.jmx
    file_extension = file_path.suffix  # 例如 .jmx
    download_filename = f"{script.name}{file_extension}"
    
    # 返回文件
    return FileResponse(
        path=str(file_path),
        filename=download_filename,
        media_type='application/octet-stream'
    )


@Scripts.post("", response_model=ResponseModel, summary="创建脚本（支持文件上传）")
async def create_script(
    name: str = Form(..., description="脚本名称"),
    description: Optional[str] = Form(None, description="脚本描述"),
    script_version: str = Form(default="1.0.0", description="脚本版本"),
    script_type: str = Form(default="python", description="脚本类型"),
    project_id: int = Form(..., description="所属项目ID"),
    author_id: Optional[int] = Form(None, description="作者ID"),
    file: UploadFile = File(..., description="脚本文件"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """创建脚本（支持文件上传）"""
    # 检查权限
    await check_permissions(["script:create"], current_user)
    
    # 检查项目是否存在
    project = await Project.get_or_none(id=project_id, is_deleted=False)
    if not project:
        raise HTTPException(status_code=400, detail="项目不存在")
    
    # 检查作者是否存在
    if author_id:
        author = await UserInfo.get_or_none(id=author_id, is_active=True)
        if not author:
            raise HTTPException(status_code=400, detail="作者不存在")
    else:
        author = current_user
        author_id = current_user.id
    
    # 创建上传目录
    upload_dir = Path("uploads/scripts")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # 生成唯一文件名
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = Path(file.filename).suffix
    unique_filename = f"{name}_{timestamp}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # 保存文件
    content = await file.read()
    file_size = len(content)
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # 创建脚本记录
    script = await Script.create(
        name=name,
        file_path=str(file_path),
        file_size=file_size,
        script_version=script_version,
        script_type=script_type,
        description=description,
        author_id=author,
        project_id=project
    )
    
    return {
        "code": 200,
        "message": "操作成功",
        "data": {
            "id": script.id,
            "name": script.name,
            "file_path": script.file_path,
            "file_size": script.file_size,
            "script_version": script.script_version,
            "script_type": script.script_type,
            "description": script.description,
            "author_id": author_id,
            "project_id": project_id,
            "is_active": script.is_active,
            "created_at": script.created_at
        }
    }



@Scripts.put("/{script_id}", response_model=ResponseModel, summary="更新脚本")
async def update_script(
    script_id: int,
    script_data: ScriptUpdate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """更新脚本"""
    # 检查权限
    await check_permissions(["script:update"], current_user)
    
    # 获取脚本
    script = await Script.get_or_none(id=script_id, is_deleted=False)
    if not script:
        raise HTTPException(status_code=404, detail="脚本不存在")
    
    # 更新脚本
    update_data = script_data.model_dump(exclude_unset=True)
    await script.update_from_dict(update_data).save()
    await script.refresh_from_db()
    
    return {
        "code": 200,
        "message": "脚本更新成功",
        "data": {
            "id": script.id,
            "name": script.name,
            "file_path": script.file_path,
            "script_version": script.script_version,
            "script_type": script.script_type,
            "description": script.description,
            "is_active": script.is_active,
            "updated_at": script.updated_at
        }
    }


@Scripts.delete("/{script_id}", response_model=ResponseModel, summary="删除脚本")
async def delete_script(
    script_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """删除脚本（软删除）"""
    # 检查权限
    await check_permissions(["script:delete"], current_user)
    
    # 获取脚本
    script = await Script.get_or_none(id=script_id, is_deleted=False)
    if not script:
        raise HTTPException(status_code=404, detail="脚本不存在")
    
    # 软删除
    script.is_deleted = True
    await script.save()
    
    return {
        "code": 200,
        "message": "脚本删除成功",
        "data": None
    }

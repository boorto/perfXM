"""
负载机配置管理 API
提供负载机的 CRUD 操作和状态管理
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime

from models import SlaveConfig, UserInfo
from schemas.slave_schemas import (
    SlaveConfigCreate,
    SlaveConfigUpdate,
    SlaveConfigResponse
)
from schemas.common_schemas import ResponseModel
from security import get_current_active_user, check_permissions

Slaves = APIRouter()


@Slaves.get("", response_model=ResponseModel, summary="分页获取负载机列表")
async def list_slaves(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    name: Optional[str] = Query(None, description="负载机名称筛选"),
    status: Optional[str] = Query(None, description="状态筛选"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取负载机列表（分页）"""
    # 构建查询条件
    query = SlaveConfig.filter(is_deleted=False)
    
    if name:
        query = query.filter(name__icontains=name)
    if status:
        query = query.filter(status=status)
    
    # 计算总数
    total = await query.count()
    
    # 分页查询
    offset = (page - 1) * page_size
    slaves = await query.offset(offset).limit(page_size)
    
    # 构建响应数据
    items = []
    for slave in slaves:
        slave_data = {
            "id": slave.id,
            "name": slave.name,
            "description": slave.description,
            "ip_address": slave.ip_address,
            "port": slave.port,
            "status": slave.status,
            "cpu_usage": slave.cpu_usage,
            "memory_usage": slave.memory_usage,
            "disk_usage": slave.disk_usage,
            "last_heartbeat": slave.last_heartbeat,
            "max_concurrent_tasks": slave.max_concurrent_tasks,
            "current_tasks": slave.current_tasks,
            "is_active": slave.is_active,
            "created_at": slave.created_at,
            "updated_at": slave.updated_at
        }
        items.append(slave_data)
    
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


@Slaves.get("/{slave_id}", response_model=ResponseModel, summary="获取负载机详情")
async def get_slave_detail(
    slave_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取负载机详情"""
    slave = await SlaveConfig.get_or_none(id=slave_id, is_deleted=False)
    if not slave:
        raise HTTPException(status_code=404, detail="负载机不存在")
    
    slave_data = {
        "id": slave.id,
        "name": slave.name,
        "description": slave.description,
        "ip_address": slave.ip_address,
        "port": slave.port,
        "username": slave.username,
        "auth_type": slave.auth_type,
        "tags": slave.tags,
        "status": slave.status,
        "cpu_usage": slave.cpu_usage,
        "memory_usage": slave.memory_usage,
        "disk_usage": slave.disk_usage,
        "last_heartbeat": slave.last_heartbeat,
        "max_concurrent_tasks": slave.max_concurrent_tasks,
        "current_tasks": slave.current_tasks,
        "is_active": slave.is_active,
        "created_at": slave.created_at,
        "updated_at": slave.updated_at
    }
    
    return {
        "code": 200,
        "message": "success",
        "data": slave_data
    }


@Slaves.post("", response_model=ResponseModel, summary="创建负载机配置")
async def create_slave(
    slave_data: SlaveConfigCreate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """创建负载机配置"""
    # 检查权限
    await check_permissions(["slave:create"], current_user)
    
    # 检查IP和端口是否已存在
    existing = await SlaveConfig.filter(
        ip_address=slave_data.ip_address,
        port=slave_data.port,
        is_deleted=False
    ).exists()
    if existing:
        raise HTTPException(status_code=400, detail="该IP和端口的负载机已存在")
    
    # 创建负载机
    slave = await SlaveConfig.create(**slave_data.model_dump())
    
    return {
        "code": 200,
        "message": "操作成功",
        "data": {
            "id": slave.id,
            "name": slave.name,
            "ip_address": slave.ip_address,
            "port": slave.port,
            "status": slave.status,
            "created_at": slave.created_at
        }
    }


@Slaves.put("/{slave_id}", response_model=ResponseModel, summary="更新负载机配置")
async def update_slave(
    slave_id: int,
    slave_data: SlaveConfigUpdate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """更新负载机配置"""
    # 检查权限
    await check_permissions(["slave:update"], current_user)
    
    # 获取负载机
    slave = await SlaveConfig.get_or_none(id=slave_id, is_deleted=False)
    if not slave:
        raise HTTPException(status_code=404, detail="负载机不存在")
    
    # 更新负载机
    update_data = slave_data.model_dump(exclude_unset=True)
    await slave.update_from_dict(update_data).save()
    await slave.refresh_from_db()
    
    return {
        "code": 200,
        "message": "负载机更新成功",
        "data": {
            "id": slave.id,
            "name": slave.name,
            "ip_address": slave.ip_address,
            "port": slave.port,
            "status": slave.status,
            "updated_at": slave.updated_at
        }
    }


@Slaves.delete("/{slave_id}", response_model=ResponseModel, summary="删除负载机配置")
async def delete_slave(
    slave_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """删除负载机配置（软删除）"""
    # 检查权限
    await check_permissions(["slave:delete"], current_user)
    
    # 获取负载机
    slave = await SlaveConfig.get_or_none(id=slave_id, is_deleted=False)
    if not slave:
        raise HTTPException(status_code=404, detail="负载机不存在")
    
    # 软删除
    slave.is_deleted = True
    await slave.save()
    
    return {
        "code": 200,
        "message": "负载机删除成功",
        "data": None
    }


@Slaves.get("/{slave_id}/status", response_model=ResponseModel, summary="获取负载机状态")
async def get_slave_status(
    slave_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取负载机实时状态"""
    slave = await SlaveConfig.get_or_none(id=slave_id, is_deleted=False)
    if not slave:
        raise HTTPException(status_code=404, detail="负载机不存在")
    
    status_data = {
        "id": slave.id,
        "name": slave.name,
        "status": slave.status,
        "cpu_usage": slave.cpu_usage,
        "memory_usage": slave.memory_usage,
        "disk_usage": slave.disk_usage,
        "last_heartbeat": slave.last_heartbeat,
        "current_tasks": slave.current_tasks,
        "max_concurrent_tasks": slave.max_concurrent_tasks,
        "is_active": slave.is_active,
        "availability": "可用" if slave.current_tasks < slave.max_concurrent_tasks else "繁忙"
    }
    
    return {
        "code": 200,
        "message": "success",
        "data": status_data
    }

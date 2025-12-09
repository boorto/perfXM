"""
测试计划管理 API
提供测试计划的 CRUD 操作和执行管理
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
import uuid

from models import TestPlan, UserInfo, Project, ProjectMember
from schemas.test_plan_schemas import (
    TestPlanCreate,
    TestPlanUpdate,
    TestPlanResponse
)
from schemas.common_schemas import ResponseModel
from security import get_current_active_user, check_permissions

TestPlans = APIRouter()


# 辅助函数
async def check_test_plan_access(test_plan_id: int, current_user: UserInfo) -> TestPlan:
    """
    检查测试计划是否存在以及用户是否有访问权限
    
    Args:
        test_plan_id: 测试计划ID
        current_user: 当前用户
        
    Returns:
        TestPlan: 测试计划对象
        
    Raises:
        HTTPException: 测试计划不存在或无权访问
    """
    # 检查测试计划是否存在
    test_plan = await TestPlan.get_or_none(id=test_plan_id, is_deleted=False)
    if not test_plan:
        raise HTTPException(status_code=404, detail="测试计划不存在")
    
    # 非超级管理员检查权限
    if not current_user.is_superuser:
        # 检查用户是否是创建者
        is_creator = test_plan.creator_id_id == current_user.id if hasattr(test_plan, 'creator_id_id') else False
        
        # 检查用户是否是项目成员
        is_project_member = await ProjectMember.filter(
            project_id=test_plan.project_id_id if hasattr(test_plan, 'project_id_id') else test_plan.project_id,
            user_id=current_user.id,
            is_active=True
        ).exists()
        
        if not is_creator and not is_project_member:
            raise HTTPException(status_code=403, detail="无权访问该测试计划")
    
    return test_plan


@TestPlans.get("", response_model=ResponseModel, summary="分页获取测试计划列表")
async def list_test_plans(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    name: Optional[str] = Query(None, description="测试计划名称筛选"),
    project_id: Optional[int] = Query(None, description="项目ID筛选"),
    status: Optional[str] = Query(None, description="状态筛选"),
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取测试计划列表（分页）"""
    # 构建查询条件
    query = TestPlan.filter(is_deleted=False)
    
    if name:
        query = query.filter(name__icontains=name)
    if project_id:
        query = query.filter(project_id=project_id)
    if status:
        query = query.filter(status=status)
    
    # 非超级管理员只能看到自己项目的测试计划
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
    test_plans = await query.offset(offset).limit(page_size).prefetch_related('project_id', 'creator_id')
    
    # 构建响应数据
    items = []
    for plan in test_plans:
        plan_data = {
            "id": plan.id,
            "name": plan.name,
            "description": plan.description,
            "project_id": plan.project_id.id if plan.project_id else None,
            "creator_id": plan.creator_id.id if plan.creator_id else None,
            "status": plan.status,
            "priority": plan.priority,
            "scheduled_start": plan.scheduled_start,
            "scheduled_end": plan.scheduled_end,
            "total_cases": plan.total_cases,
            "passed_cases": plan.passed_cases,
            "failed_cases": plan.failed_cases,
            "is_active": plan.is_active,
            "created_at": plan.created_at,
            "updated_at": plan.updated_at
        }
        items.append(plan_data)
    
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


@TestPlans.get("/{test_plan_id}", response_model=ResponseModel, summary="获取测试计划详情")
async def get_test_plan_detail(
    test_plan_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """获取测试计划详情"""
    # 检查测试计划存在性和访问权限
    plan = await check_test_plan_access(test_plan_id, current_user)
    await plan.fetch_related('project_id', 'creator_id')
    
    # 计算进度
    progress = 0
    if plan.total_cases > 0:
        progress = round((plan.passed_cases + plan.failed_cases) / plan.total_cases * 100, 2)
    
    plan_data = {
        "id": plan.id,
        "name": plan.name,
        "description": plan.description,
        "status": plan.status,
        "priority": plan.priority,
        "scheduled_start": plan.scheduled_start,
        "scheduled_end": plan.scheduled_end,
        "actual_start": plan.actual_start,
        "actual_end": plan.actual_end,
        "total_cases": plan.total_cases,
        "passed_cases": plan.passed_cases,
        "failed_cases": plan.failed_cases,
        "is_active": plan.is_active,
        "created_at": plan.created_at,
        "updated_at": plan.updated_at,
        "project": {
            "id": plan.project_id.id,
            "name": plan.project_id.name,
            "status": plan.project_id.status
        } if plan.project_id else None,
        "creator": {
            "id": plan.creator_id.id,
            "username": plan.creator_id.username,
            "real_name": plan.creator_id.real_name
        } if plan.creator_id else None,
        "progress": {
            "percentage": progress,
            "total": plan.total_cases,
            "passed": plan.passed_cases,
            "failed": plan.failed_cases,
            "pending": plan.total_cases - plan.passed_cases - plan.failed_cases
        }
    }
    
    return {
        "code": 200,
        "message": "success",
        "data": plan_data
    }


@TestPlans.post("", response_model=ResponseModel, summary="创建测试计划")
async def create_test_plan(
    plan_data: TestPlanCreate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """创建测试计划"""
    # 检查权限
    await check_permissions(["test_plan:create"], current_user)

    # 检查测试计划名称是否已存在
    if await TestPlan.filter(name=plan_data.name).exists():
        raise HTTPException(status_code=400, detail="测试计划名称已存在")
    
    # 检查项目是否存在
    project = await Project.get_or_none(id=plan_data.project_id, is_deleted=False)
    if not project:
        raise HTTPException(status_code=400, detail="项目不存在")
    
    # 检查创建者是否存在
    creator = await UserInfo.get_or_none(id=plan_data.creator_id, is_active=True)
    if not creator:
        raise HTTPException(status_code=400, detail="创建者不存在")
    
    # 创建测试计划
    plan = await TestPlan.create(
        name=plan_data.name,
        description=plan_data.description,
        project_id=project,
        creator_id=creator,
        status=plan_data.status,
        priority=plan_data.priority,
        scheduled_start=plan_data.scheduled_start,
        scheduled_end=plan_data.scheduled_end
    )
    
    return {
        "code": 200,
        "message": "操作成功",
        "data": {
            "id": plan.id,
            "name": plan.name,
            "description": plan.description,
            "project_id": project.id,
            "creator_id": creator.id,
            "status": plan.status,
            "priority": plan.priority,
            "created_at": plan.created_at
        }
    }


@TestPlans.put("/{test_plan_id}", response_model=ResponseModel, summary="更新测试计划")
async def update_test_plan(
    test_plan_id: int,
    plan_data: TestPlanUpdate,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """更新测试计划"""
    # 检查权限
    await check_permissions(["test_plan:update"], current_user)

    # 检查测试计划名称是否已存在
    if await TestPlan.filter(name=plan_data.name).exists():
        raise HTTPException(status_code=400, detail="测试计划名称已存在")
    
    # 获取测试计划
    plan = await TestPlan.get_or_none(id=test_plan_id, is_deleted=False)
    if not plan:
        raise HTTPException(status_code=404, detail="测试计划不存在")
    
    # 更新测试计划
    update_data = plan_data.model_dump(exclude_unset=True)
    await plan.update_from_dict(update_data).save()
    await plan.refresh_from_db()
    
    return {
        "code": 200,
        "message": "测试计划更新成功",
        "data": {
            "id": plan.id,
            "name": plan.name,
            "status": plan.status,
            "priority": plan.priority,
            "updated_at": plan.updated_at
        }
    }


@TestPlans.delete("/{test_plan_id}", response_model=ResponseModel, summary="删除测试计划")
async def delete_test_plan(
    test_plan_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """删除测试计划（软删除）"""
    # 检查权限
    await check_permissions(["test_plan:delete"], current_user)
    
    # 获取测试计划
    plan = await TestPlan.get_or_none(id=test_plan_id, is_deleted=False)
    if not plan:
        raise HTTPException(status_code=404, detail="测试计划不存在")
    
    # 软删除
    plan.is_deleted = True
    await plan.save()
    
    return {
        "code": 200,
        "message": "测试计划删除成功",
        "data": None
    }


@TestPlans.post("/{test_plan_id}/execute", response_model=ResponseModel, summary="执行测试计划")
async def execute_test_plan(
    test_plan_id: int,
    current_user: UserInfo = Depends(get_current_active_user)
):
    """执行测试计划"""
    # 检查权限
    await check_permissions(["test_plan:execute"], current_user)
    
    # 获取测试计划
    plan = await check_test_plan_access(test_plan_id, current_user)
    
    # 检查测试计划状态
    if plan.status == "completed":
        raise HTTPException(status_code=400, detail="测试计划已完成，无法再次执行")
    
    # 更新测试计划状态
    plan.status = "active"
    plan.actual_start = datetime.now()
    await plan.save()
    
    # 生成执行ID
    execution_id = str(uuid.uuid4())
    
    return {
        "code": 200,
        "message": "测试计划已开始执行",
        "data": {
            "execution_id": execution_id,
            "test_plan_id": plan.id,
            "test_plan_name": plan.name,
            "status": plan.status,
            "start_time": plan.actual_start,
            "message": "测试计划执行已启动，请等待执行结果"
        }
    }

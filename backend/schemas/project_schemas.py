from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class ProjectBase(BaseModel):
    """项目基础信息"""
    name: str = Field(..., min_length=1, max_length=100, description="项目名称")
    description: Optional[str] = Field(None, description="项目描述")
    status: str = Field(default="active", description="项目状态")

class ProjectCreate(ProjectBase):
    """创建项目"""
    manager_id: int = Field(..., description="项目经理ID")

class ProjectUpdate(BaseModel):
    """更新项目"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="项目名称")
    description: Optional[str] = Field(None, description="项目描述")
    status: Optional[str] = Field(None, description="项目状态")
    manager_id: Optional[int] = Field(None, description="项目经理ID")

class ProjectResponse(ProjectBase):
    """项目响应"""
    id: int = Field(..., description="项目ID")
    manager_id: int = Field(..., description="项目经理ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

class ProjectDetailResponse(ProjectResponse):
    """项目详情响应"""
    manager: dict = Field(..., description="项目经理信息")
    members: List[dict] = Field(default_factory=list, description="项目成员列表")
    scripts: List[dict] = Field(default_factory=list, description="项目脚本列表")
    test_plans: List[dict] = Field(default_factory=list, description="测试计划列表")

class ProjectMemberCreate(BaseModel):
    """添加项目成员"""
    user_id: int = Field(..., description="用户ID")
    role_id: int = Field(..., description="角色ID")

class ProjectMemberUpdate(BaseModel):
    """更新项目成员"""
    role_id: Optional[int] = Field(None, description="角色ID")
    is_active: Optional[bool] = Field(None, description="是否激活")

class ProjectMemberResponse(BaseModel):
    """项目成员响应"""
    id: int = Field(..., description="成员关系ID")
    project_id: int = Field(..., description="项目ID")
    user_id: int = Field(..., description="用户ID")
    role_id: int = Field(..., description="角色ID")
    is_active: bool = Field(..., description="是否激活")
    joined_at: datetime = Field(..., description="加入时间")

class ProjectStatsResponse(BaseModel):
    """项目统计响应"""
    total_projects: int = Field(..., description="总项目数")
    active_projects: int = Field(..., description="活跃项目数")
    completed_projects: int = Field(..., description="已完成项目数")
    archived_projects: int = Field(..., description="已归档项目数")
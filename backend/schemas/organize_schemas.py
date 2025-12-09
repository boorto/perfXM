from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class OrganizeBase(BaseModel):
    """组织基础信息"""
    name: str = Field(..., min_length=1, max_length=100, description="组织名称")
    description: Optional[str] = Field(None, description="组织描述")
    parent_id: Optional[int] = Field(None, description="父级组织ID")
    manager_id: Optional[int] = Field(None, description="组织管理员ID")
    level: int = Field(default=1, description="组织层级")
    sort_order: int = Field(default=0, description="排序顺序")

class OrganizeCreate(OrganizeBase):
    """创建组织"""

class OrganizeUpdate(BaseModel):
    """更新组织"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="组织名称")
    description: Optional[str] = Field(None, description="组织描述")
    parent_id: Optional[int] = Field(None, description="父级组织ID")
    manager_id: Optional[int] = Field(None, description="组织管理员ID")
    level: Optional[int] = Field(None, description="组织层级")
    sort_order: Optional[int] = Field(None, description="排序顺序")

class OrganizeResponse(OrganizeBase):
    """组织响应"""
    id: int = Field(..., description="组织ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

class OrganizeDetailResponse(OrganizeResponse):
    """组织详情响应"""
    parent: Optional[dict] = Field(None, description="父级组织信息")
    manager: Optional[dict] = Field(None, description="管理员信息")
    children: List[dict] = Field(default_factory=list, description="子级组织列表")
    members: List[dict] = Field(default_factory=list, description="组织成员列表")
    stats: dict = Field(default_factory=dict, description="组织统计信息")

class OrganizeTreeResponse(BaseModel):
    """组织树响应"""
    id: int = Field(..., description="组织ID")
    name: str = Field(..., description="组织名称")
    level: int = Field(..., description="层级")
    parent_id: Optional[int] = Field(None, description="父级ID")
    manager: Optional[dict] = Field(None, description="管理员")
    children: List['OrganizeTreeResponse'] = Field(default_factory=list, description="子级组织")

# 解决前向引用
OrganizeTreeResponse.model_rebuild()
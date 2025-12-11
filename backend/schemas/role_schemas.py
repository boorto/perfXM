from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class RoleBase(BaseModel):
    """角色基础信息"""
    name: str = Field(..., min_length=1, max_length=50, description="角色名称")
    description: Optional[str] = Field(None, description="角色描述")
    permissions: List[str] = Field(default_factory=list, description="权限列表")
    is_system: bool = Field(default=False, description="是否系统角色")
    org_id: Optional[int] = Field(None, description="所属组织ID")

class RoleCreate(RoleBase):
    """创建角色"""

class RoleUpdate(BaseModel):
    """更新角色"""
    name: Optional[str] = Field(None, min_length=1, max_length=50, description="角色名称")
    description: Optional[str] = Field(None, description="角色描述")
    permissions: Optional[List[str]] = Field(None, description="权限列表")
    org_id: Optional[int] = Field(None, description="所属组织ID")

class RoleResponse(RoleBase):
    """角色响应"""
    id: int = Field(..., description="角色ID")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

class UserOrgRoleCreate(BaseModel):
    """分配用户组织角色"""
    user_id: int = Field(..., description="用户ID")
    organization_id: int = Field(..., description="组织ID")
    role_id: int = Field(..., description="角色ID")

class UserOrgRoleUpdate(BaseModel):
    """更新用户组织角色"""
    role_id: Optional[int] = Field(None, description="角色ID")
    is_active: Optional[bool] = Field(None, description="是否激活")

class UserOrgRoleResponse(BaseModel):
    """用户组织角色响应"""
    id: int = Field(..., description="关系ID")
    user_id: int = Field(..., description="用户ID")
    organization_id: int = Field(..., description="组织ID")
    role_id: int = Field(..., description="角色ID")
    is_active: bool = Field(..., description="是否激活")
    joined_at: datetime = Field(..., description="加入时间")

class PermissionList(BaseModel):
    """权限列表响应"""
    permissions: List[str] = Field(..., description="权限名称列表")
    permission_groups: dict = Field(..., description="权限分组")
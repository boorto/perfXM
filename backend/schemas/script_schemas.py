from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class ScriptBase(BaseModel):
    """脚本基础信息"""
    name: str = Field(..., min_length=1, max_length=100, description="脚本名称")
    file_path: str = Field(..., max_length=255, description="脚本路径")
    script_version: str = Field(default="1.0.0", max_length=50, description="脚本版本")
    script_type: str = Field(default="python", max_length=20, description="脚本类型")
    description: Optional[str] = Field(None, description="脚本描述")
    author_id: Optional[int] = Field(None, description="作者ID")
    project_id: int = Field(..., description="所属项目ID")

class ScriptCreate(ScriptBase):
    """创建脚本"""

class ScriptUpdate(BaseModel):
    """更新脚本"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="脚本名称")
    file_path: Optional[str] = Field(None, max_length=255, description="脚本路径")
    script_version: Optional[str] = Field(None, max_length=50, description="脚本版本")
    script_type: Optional[str] = Field(None, max_length=20, description="脚本类型")
    description: Optional[str] = Field(None, description="脚本描述")
    is_active: Optional[bool] = Field(None, description="是否激活")

class ScriptResponse(ScriptBase):
    """脚本响应"""
    id: int = Field(..., description="脚本ID")
    file_size: Optional[int] = Field(None, description="脚本大小")
    is_active: bool = Field(..., description="是否激活")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

class ScriptDetailResponse(ScriptResponse):
    """脚本详情响应"""
    author: Optional[dict] = Field(None, description="作者信息")
    project: dict = Field(..., description="项目信息")
    test_plans: List[dict] = Field(default_factory=list, description="关联的测试计划")

class TestPlanScriptCreate(BaseModel):
    """测试计划-脚本关联"""
    script_id: int = Field(..., description="脚本ID")
    execution_order: int = Field(default=1, description="执行顺序")
    is_enabled: bool = Field(default=True, description="是否启用")

class TestPlanScriptUpdate(BaseModel):
    """更新测试计划-脚本关联"""
    execution_order: Optional[int] = Field(None, description="执行顺序")
    is_enabled: Optional[bool] = Field(None, description="是否启用")

class TestPlanScriptResponse(BaseModel):
    """测试计划-脚本关联响应"""
    id: int = Field(..., description="关联ID")
    test_plan_id: int = Field(..., description="测试计划ID")
    script_id: int = Field(..., description="脚本ID")
    execution_order: int = Field(..., description="执行顺序")
    is_enabled: bool = Field(..., description="是否启用")
    created_at: datetime = Field(..., description="创建时间")

class ScriptUploadResponse(BaseModel):
    """脚本上传响应"""
    file_id: str = Field(..., description="文件ID")
    file_name: str = Field(..., description="文件名")
    file_size: int = Field(..., description="文件大小")
    file_path: str = Field(..., description="文件路径")
    upload_time: datetime = Field(..., description="上传时间")
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class TestPlanBase(BaseModel):
    """测试计划基础信息"""
    name: str = Field(..., min_length=1, max_length=100, description="测试计划名称")
    description: Optional[str] = Field(None, description="测试计划描述")
    project_id: int = Field(..., description="所属项目ID")
    creator_id: int = Field(..., description="创建者ID")
    status: str = Field(default="draft", description="状态")
    priority: str = Field(default="medium", description="优先级")
    scheduled_start: Optional[datetime] = Field(None, description="计划开始时间")
    scheduled_end: Optional[datetime] = Field(None, description="计划结束时间")

class TestPlanCreate(TestPlanBase):
    """创建测试计划"""

class TestPlanUpdate(BaseModel):
    """更新测试计划"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="测试计划名称")
    description: Optional[str] = Field(None, description="测试计划描述")
    status: Optional[str] = Field(None, description="状态")
    priority: Optional[str] = Field(None, description="优先级")
    scheduled_start: Optional[datetime] = Field(None, description="计划开始时间")
    scheduled_end: Optional[datetime] = Field(None, description="计划结束时间")
    is_active: Optional[bool] = Field(None, description="是否激活")

class TestPlanResponse(TestPlanBase):
    """测试计划响应"""
    id: int = Field(..., description="测试计划ID")
    actual_start: Optional[datetime] = Field(None, description="实际开始时间")
    actual_end: Optional[datetime] = Field(None, description="实际结束时间")
    total_cases: int = Field(..., description="总用例数")
    passed_cases: int = Field(..., description="通过用例数")
    failed_cases: int = Field(..., description="失败用例数")
    is_active: bool = Field(..., description="是否激活")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

class TestPlanDetailResponse(TestPlanResponse):
    """测试计划详情响应"""
    project: dict = Field(..., description="项目信息")
    creator: dict = Field(..., description="创建者信息")
    scripts: List[dict] = Field(default_factory=list, description="脚本列表")
    slaves: List[dict] = Field(default_factory=list, description="从机列表")
    progress: dict = Field(default_factory=dict, description="执行进度")

class TestPlanSlaveCreate(BaseModel):
    """测试计划-从机关联"""
    slave_id: int = Field(..., description="从机ID")

class TestPlanSlaveResponse(BaseModel):
    """测试计划-从机关联响应"""
    id: int = Field(..., description="关联ID")
    test_plan_id: int = Field(..., description="测试计划ID")
    slave_id: int = Field(..., description="从机ID")
    is_active: bool = Field(..., description="是否激活")
    assigned_at: datetime = Field(..., description="分配时间")

class TestPlanExecutionCreate(BaseModel):
    """测试计划执行"""
    test_plan_id: int = Field(..., description="测试计划ID")
    scheduled_start: Optional[datetime] = Field(None, description="计划开始时间")

class TestPlanExecutionResponse(BaseModel):
    """测试计划执行响应"""
    execution_id: str = Field(..., description="执行ID")
    test_plan: dict = Field(..., description="测试计划信息")
    status: str = Field(..., description="执行状态")
    start_time: datetime = Field(..., description="开始时间")
    end_time: Optional[datetime] = Field(None, description="结束时间")
    progress: float = Field(..., description="执行进度")
    results: List[dict] = Field(default_factory=list, description="执行结果")

class TestPlanStatsResponse(BaseModel):
    """测试计划统计响应"""
    total_plans: int = Field(..., description="总测试计划数")
    draft_plans: int = Field(..., description="草稿计划数")
    active_plans: int = Field(..., description="活跃计划数")
    completed_plans: int = Field(..., description="已完成计划数")
    failed_plans: int = Field(..., description="失败计划数")
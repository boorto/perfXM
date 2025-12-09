from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class SlaveConfigBase(BaseModel):
    """从机配置基础信息"""
    name: str = Field(..., min_length=1, max_length=100, description="从机名称")
    description: Optional[str] = Field(None, description="描述")
    ip_address: str = Field(..., description="IP地址")
    port: int = Field(..., ge=1, le=65535, description="端口号")
    username: Optional[str] = Field(None, max_length=50, description="登录用户名")
    auth_type: str = Field(default="password", description="认证类型")
    tags: List[str] = Field(default_factory=list, description="标签列表")
    max_concurrent_tasks: int = Field(default=5, ge=1, description="最大并发任务数")

class SlaveConfigCreate(SlaveConfigBase):
    """创建从机配置"""
    auth_value: str = Field(..., description="认证值(密码/密钥/令牌)")

class SlaveConfigUpdate(BaseModel):
    """更新从机配置"""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="从机名称")
    description: Optional[str] = Field(None, description="描述")
    ip_address: Optional[str] = Field(None, description="IP地址")
    port: Optional[int] = Field(None, ge=1, le=65535, description="端口号")
    username: Optional[str] = Field(None, max_length=50, description="登录用户名")
    auth_type: Optional[str] = Field(None, description="认证类型")
    auth_value: Optional[str] = Field(None, description="认证值")
    tags: Optional[List[str]] = Field(None, description="标签列表")
    max_concurrent_tasks: Optional[int] = Field(None, ge=1, description="最大并发任务数")
    is_active: Optional[bool] = Field(None, description="是否激活")

class SlaveConfigResponse(SlaveConfigBase):
    """从机配置响应"""
    id: int = Field(..., description="从机ID")
    status: str = Field(..., description="状态")
    cpu_usage: Optional[float] = Field(None, description="CPU使用率")
    memory_usage: Optional[float] = Field(None, description="内存使用率")
    disk_usage: Optional[float] = Field(None, description="磁盘使用率")
    last_heartbeat: Optional[datetime] = Field(None, description="最后心跳时间")
    current_tasks: int = Field(..., description="当前任务数")
    is_active: bool = Field(..., description="是否激活")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")

class SlaveConfigDetailResponse(SlaveConfigResponse):
    """从机配置详情响应"""
    test_plans: List[dict] = Field(default_factory=list, description="关联的测试计划")
    task_history: List[dict] = Field(default_factory=list, description="任务历史")
    system_info: Optional[Dict[str, Any]] = Field(None, description="系统信息")

class SlaveHeartbeatCreate(BaseModel):
    """从机心跳"""
    slave_id: int = Field(..., description="从机ID")
    status: str = Field(..., description="状态")
    cpu_usage: Optional[float] = Field(None, ge=0, le=100, description="CPU使用率")
    memory_usage: Optional[float] = Field(None, ge=0, le=100, description="内存使用率")
    disk_usage: Optional[float] = Field(None, ge=0, le=100, description="磁盘使用率")
    current_tasks: int = Field(default=0, ge=0, description="当前任务数")

class SlaveHeartbeatResponse(BaseModel):
    """从机心跳响应"""
    success: bool = Field(..., description="心跳是否成功")
    message: str = Field(..., description="响应消息")
    next_heartbeat: int = Field(..., description="下次心跳间隔(秒)")

class SlaveTaskAssign(BaseModel):
    """分配从机任务"""
    test_plan_id: int = Field(..., description="测试计划ID")
    script_id: int = Field(..., description="脚本ID")
    task_priority: str = Field(default="normal", description="任务优先级")

class SlaveTaskResponse(BaseModel):
    """从机任务响应"""
    task_id: str = Field(..., description="任务ID")
    test_plan: dict = Field(..., description="测试计划信息")
    script: dict = Field(..., description="脚本信息")
    status: str = Field(..., description="任务状态")
    created_at: datetime = Field(..., description="创建时间")
    started_at: Optional[datetime] = Field(None, description="开始时间")
    completed_at: Optional[datetime] = Field(None, description="完成时间")

class SlaveStatsResponse(BaseModel):
    """从机统计响应"""
    total_slaves: int = Field(..., description="总从机数")
    online_slaves: int = Field(..., description="在线从机数")
    offline_slaves: int = Field(..., description="离线从机数")
    maintenance_slaves: int = Field(..., description="维护从机数")
    avg_cpu_usage: float = Field(..., description="平均CPU使用率")
    avg_memory_usage: float = Field(..., description="平均内存使用率")
    total_tasks: int = Field(..., description="总任务数")
    active_tasks: int = Field(..., description="活跃任务数")
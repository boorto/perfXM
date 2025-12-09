from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel, Field
from datetime import datetime

T = TypeVar('T')

class PaginationParams(BaseModel):
    """分页参数"""
    page: int = Field(default=1, ge=1, description="页码")
    size: int = Field(default=20, ge=1, le=100, description="每页数量")
    search: Optional[str] = Field(default=None, description="搜索关键词")

class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应"""
    code: int = Field(default=200, description="状态码")
    message: str = Field(default="success", description="响应消息")
    items: List[T] = Field(description="数据列表")
    total: int = Field(description="总数量")
    page: int = Field(description="当前页码")
    size: int = Field(description="每页数量")
    pages: int = Field(description="总页数")
    has_next: bool = Field(description="是否有下一页")
    has_prev: bool = Field(description="是否有上一页")

class BaseResponse(BaseModel):
    """基础响应模型"""
    code: int = Field(default=200, description="状态码")
    message: str = Field(default="success", description="响应消息")
    timestamp: datetime = Field(default_factory=datetime.now, description="响应时间")

class SuccessResponse(BaseResponse):
    """成功响应"""
    success: bool = Field(default=True, description="是否成功")

class ErrorResponse(BaseResponse):
    """错误响应"""
    success: bool = Field(default=False, description="是否成功")
    error_code: Optional[str] = Field(default=None, description="错误代码")
    details: Optional[dict] = Field(default=None, description="错误详情")

class MessageResponse(BaseModel):
    """消息响应"""
    message: str = Field(description="响应消息")
    data: Optional[Any] = Field(default=None, description="响应数据")

class ResponseModel(BaseModel):
    """通用响应模型"""
    code: int = Field(default=200, description="状态码")
    message: str = Field(default="success", description="响应消息")
    data: Optional[Any] = Field(default=None, description="响应数据")
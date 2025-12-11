from tortoise.models import Model
from tortoise import fields


class Role(Model):
    """角色模型"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=50, unique=True, description="角色名称")
    description = fields.TextField(null=True, description="角色描述")
    permissions = fields.JSONField(default=[], description="角色权限列表")
    is_system = fields.BooleanField(default=False, description="是否系统角色")
    org_id = fields.IntField(null=True, description="所属组织ID")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")
    is_deleted = fields.BooleanField(default=False, description="删除标志")

    class Meta:
        table = "roles"

    def __str__(self):
        return f"{self.name} ({'系统角色' if self.is_system else '自定义角色'})"
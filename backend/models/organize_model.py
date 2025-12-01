from tortoise.models import Model
from tortoise import fields


class Organize(Model):
    """组织架构模型"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100, description="组织名称")
    description = fields.TextField(null=True, description="组织描述")
    parent_id = fields.IntField(null=True, description="父级组织ID")
    manager_id = fields.ForeignKeyField('models.UserInfo', related_name='managed_organizations', null=True, description="组织管理员")
    level = fields.IntField(default=1, description="组织层级")
    sort_order = fields.IntField(default=0, description="排序顺序")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")
    is_deleted = fields.BooleanField(default=False, description="删除标志")

    class Meta:
        table = "organizations"

    def __str__(self):
        return f"{self.name} (Level: {self.level})"
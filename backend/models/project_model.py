from tortoise.models import Model
from tortoise import fields


class Project(Model):
    """项目信息模型"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100, description="项目名称")
    description = fields.TextField(null=True, description="项目描述")
    status = fields.CharField(max_length=20, default="active", description="项目状态")  # active, archived, deleted
    manager_id = fields.ForeignKeyField('models.UserInfo', related_name='managed_projects', description="项目经理")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")
    is_deleted = fields.BooleanField(default=False, description="删除标志")

    class Meta:
        table = "projects"

    def __str__(self):
        return f"{self.name} (Manager: {self.manager_id.username if self.manager_id else 'None'})"
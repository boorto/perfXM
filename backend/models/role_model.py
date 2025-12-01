from tortoise.models import Model
from tortoise import fields


class RoleInfo(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255,description="角色名称")
    description = fields.TextField(description="角色描述")
    created_at = fields.DatetimeField(auto_now_add=True,description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True,description="更新时间")
    user = fields.ManyToManyField('models.UserInfo', related_name='role',description="用户")
    del_flag = fields.BooleanField(default=False,description="删除标志")
    organize = fields.ManyToManyField('models.Organize', related_name='role',description="组织")
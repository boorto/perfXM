from tortoise.models import Model
from tortoise import fields

class UserInfo(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=255,description="用户名")
    password = fields.CharField(max_length=255,description="密码")
    created_at = fields.DatetimeField(auto_now_add=True,description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True,description="更新时间")

    project = fields.ReverseRelation['Project']
    role = fields.ReverseRelation['Role']
    organize = fields.ReverseRelation['Organize']
    del_flag = fields.BooleanField(default=False,description="删除标志")
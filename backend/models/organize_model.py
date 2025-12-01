from tortoise.models import Model
from tortoise import fields

class Organize(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255,description="组织名称")
    description = fields.TextField(description="组织描述")
    created_at = fields.DatetimeField(auto_now_add=True,description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True,description="更新时间")
    user = fields.ReverseRelation['UserInfo']
    role = fields.ReverseRelation['Role']
from tortoise.models import Model
from tortoise import fields


class Project(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255,description="项目名称")
    description = fields.TextField(description="项目描述")
    created_at = fields.DatetimeField(auto_now_add=True,description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True,description="更新时间")

    project_manager = fields.ReverseRelation['UserInfo']
    script = fields.ReverseRelation['Script']
    test_plan = fields.ReverseRelation['TestPlan']
    del_flag = fields.BooleanField(default=False,description="删除标志")
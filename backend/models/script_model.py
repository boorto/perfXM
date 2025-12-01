from tortoise.models import Model
from tortoise import fields


class Script(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255,description="脚本名称")
    file_path = fields.CharField(max_length=255, description="脚本路径")
    file_size = fields.IntField(description="脚本大小")
    script_version = fields.CharField(max_length=255,description="脚本版本")
    description = fields.TextField(description="脚本描述")
    created_at = fields.DatetimeField(auto_now_add=True,description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True,description="更新时间")

    project = fields.ForeignKeyField('models.Project', related_name='script',description="项目")
    test_plan = fields.ReverseRelation['TestPlan']
    del_flag = fields.BooleanField(default=False,description="删除标志")
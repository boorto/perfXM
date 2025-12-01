from tortoise.models import Model
from tortoise import fields

class SlaveConfig(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255,description="名称")
    description = fields.TextField(description="描述")
    created_at = fields.DatetimeField(auto_now_add=True,description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True,description="更新时间")
    slave_ip = fields.CharField(max_length=255,description="IP地址")
    slave_port = fields.IntField(description="端口")
    slave_tag = fields.CharField(max_length=255,description="标签")

    test_plan = fields.ReverseRelation['TestPlan']
    del_flag = fields.BooleanField(default=False,description="删除标记")
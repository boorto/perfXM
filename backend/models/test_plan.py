from tortoise.models import Model
from tortoise import fields

class TestPlan(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255,description="测试计划名称")
    description = fields.TextField(description="测试计划描述")
    project = fields.ForeignKeyField('models.Project', related_name='test_plan',description="项目")
    script = fields.ManyToManyField('models.Script', related_name='test_plan',description="脚本")
    slave = fields.ManyToManyField('models.Slave_config', related_name='test_plan',description="从机")
    created_at = fields.DatetimeField(auto_now_add=True,description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True,description="更新时间")
    user = fields.ForeignKeyField('models.UserInfo', related_name='test_plan',description="用户")
    del_flag = fields.BooleanField(default=False,description="删除标志")

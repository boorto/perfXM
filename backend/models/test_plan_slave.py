from tortoise.models import Model
from tortoise import fields


class TestPlanSlave(Model):
    """测试计划-从机关联模型"""
    id = fields.IntField(pk=True)
    test_plan = fields.ForeignKeyField('models.TestPlan', related_name='test_plan_slaves', description="测试计划")
    slave = fields.ForeignKeyField('models.SlaveConfig', related_name='test_plan_slaves', description="从机")
    assigned_at = fields.DatetimeField(auto_now_add=True, description="分配时间")
    is_active = fields.BooleanField(default=True, description="是否激活")

    class Meta:
        table = "test_plan_slaves"
        unique_together = (("test_plan", "slave"),)

    def __str__(self):
        return f"{self.test_plan.name} - {self.slave.name}"
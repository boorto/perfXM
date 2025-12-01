from tortoise.models import Model
from tortoise import fields


class TestPlanScript(Model):
    """测试计划-脚本关联模型"""
    id = fields.IntField(pk=True)
    test_plan = fields.ForeignKeyField('models.TestPlan', related_name='test_plan_scripts', description="测试计划")
    script = fields.ForeignKeyField('models.Script', related_name='test_plan_scripts', description="脚本")
    execution_order = fields.IntField(default=1, description="执行顺序")
    is_enabled = fields.BooleanField(default=True, description="是否启用")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")

    class Meta:
        table = "test_plan_scripts"
        unique_together = (("test_plan", "script"),)

    def __str__(self):
        return f"{self.test_plan.name} - {self.script.name} (Order: {self.execution_order})"
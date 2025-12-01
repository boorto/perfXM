from tortoise.models import Model
from tortoise import fields


class TestPlan(Model):
    """测试计划模型"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100, description="测试计划名称")
    description = fields.TextField(null=True, description="测试计划描述")
    project_id = fields.ForeignKeyField('models.Project', related_name='test_plans', description="所属项目")
    creator_id = fields.ForeignKeyField('models.UserInfo', related_name='created_test_plans', description="创建者")
    status = fields.CharField(max_length=20, default="draft", description="状态")  # draft, active, completed, cancelled
    priority = fields.CharField(max_length=10, default="medium", description="优先级")  # low, medium, high, urgent
    scheduled_start = fields.DatetimeField(null=True, description="计划开始时间")
    scheduled_end = fields.DatetimeField(null=True, description="计划结束时间")
    actual_start = fields.DatetimeField(null=True, description="实际开始时间")
    actual_end = fields.DatetimeField(null=True, description="实际结束时间")
    total_cases = fields.IntField(default=0, description="总用例数")
    passed_cases = fields.IntField(default=0, description="通过用例数")
    failed_cases = fields.IntField(default=0, description="失败用例数")
    is_active = fields.BooleanField(default=True, description="是否激活")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")
    is_deleted = fields.BooleanField(default=False, description="删除标志")

    class Meta:
        table = "test_plans"

    def __str__(self):
        return f"{self.name} ({self.status})"

from tortoise.models import Model
from tortoise import fields


class UserOrgRole(Model):
    """用户-组织-角色关联模型"""
    id = fields.IntField(pk=True)
    user = fields.ForeignKeyField('models.UserInfo', related_name='organization_roles', description="用户")
    organization = fields.ForeignKeyField('models.Organize', related_name='user_assignments', description="组织")
    role = fields.ForeignKeyField('models.Role', related_name='organization_assignments', description="角色")
    joined_at = fields.DatetimeField(auto_now_add=True, description="加入时间")
    is_active = fields.BooleanField(default=True, description="是否激活")

    class Meta:
        table = "user_organization_roles"
        unique_together = (("user", "organization", "role"),)

    def __str__(self):
        return f"{self.user.username} - {self.organization.name} - {self.role.name}"
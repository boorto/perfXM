from tortoise.models import Model
from tortoise import fields


class ProjectMember(Model):
    """用户-项目关联模型"""
    id = fields.IntField(pk=True)
    project = fields.ForeignKeyField('models.Project', related_name='members', description="所属项目")
    user = fields.ForeignKeyField('models.UserInfo', related_name='project_memberships', description="用户")
    role = fields.ForeignKeyField('models.Role', related_name='project_assignments', description="项目中的角色")
    joined_at = fields.DatetimeField(auto_now_add=True, description="加入时间")
    is_active = fields.BooleanField(default=True, description="是否激活")

    class Meta:
        table = "project_members"
        unique_together = (("project", "user"),)

    def __str__(self):
        return f"{self.user.username} - {self.project.name} ({self.role.name})"
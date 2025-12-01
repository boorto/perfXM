from tortoise.models import Model
from tortoise import fields


class Script(Model):
    """脚本模型"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100, description="脚本名称")
    file_path = fields.CharField(max_length=255, description="脚本路径")
    file_size = fields.IntField(null=True, description="脚本大小(字节)")
    script_version = fields.CharField(max_length=50, default="1.0.0", description="脚本版本")
    description = fields.TextField(null=True, description="脚本描述")
    script_type = fields.CharField(max_length=20, default="python", description="脚本类型")  # python, shell, powershell
    author_id = fields.ForeignKeyField('models.UserInfo', related_name='scripts', null=True, description="作者")
    project_id = fields.ForeignKeyField('models.Project', related_name='scripts', description="所属项目")
    is_active = fields.BooleanField(default=True, description="是否激活")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")
    is_deleted = fields.BooleanField(default=False, description="删除标志")

    class Meta:
        table = "scripts"

    def __str__(self):
        return f"{self.name} v{self.script_version} ({self.script_type})"
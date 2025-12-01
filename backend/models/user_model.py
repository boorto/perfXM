from tortoise.models import Model
from tortoise import fields


class UserInfo(Model):
    """用户信息模型"""
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True, description="用户名")
    email = fields.CharField(max_length=100, unique=True, description="邮箱")
    password_hash = fields.CharField(max_length=255, description="密码哈希")
    phone = fields.CharField(max_length=20, null=True, description="手机号")
    real_name = fields.CharField(max_length=50, null=True, description="真实姓名")
    avatar = fields.CharField(max_length=255, null=True, description="头像URL")
    is_active = fields.BooleanField(default=True, description="是否激活")
    is_superuser = fields.BooleanField(default=False, description="是否超级用户")
    last_login = fields.DatetimeField(null=True, description="最后登录时间")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")
    is_deleted = fields.BooleanField(default=False, description="删除标志")

    class Meta:
        table = "users"

    def __str__(self):
        return f"{self.username} ({self.email})"
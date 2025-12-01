from tortoise.models import Model
from tortoise import fields


class SlaveConfig(Model):
    """从机配置模型"""
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100, description="从机名称")
    description = fields.TextField(null=True, description="描述")
    ip_address = fields.CharField(max_length=45, description="IP地址")  # 支持IPv6
    port = fields.IntField(description="端口号")
    username = fields.CharField(max_length=50, null=True, description="登录用户名")
    auth_type = fields.CharField(max_length=20, default="password", description="认证类型")  # password, key, token
    auth_value = fields.CharField(max_length=255, null=True, description="认证值(密码/密钥/令牌)")
    tags = fields.JSONField(default=[], description="标签列表")
    status = fields.CharField(max_length=20, default="online", description="状态")  # online, offline, maintenance
    cpu_usage = fields.FloatField(null=True, description="CPU使用率")
    memory_usage = fields.FloatField(null=True, description="内存使用率")
    disk_usage = fields.FloatField(null=True, description="磁盘使用率")
    last_heartbeat = fields.DatetimeField(null=True, description="最后心跳时间")
    max_concurrent_tasks = fields.IntField(default=5, description="最大并发任务数")
    current_tasks = fields.IntField(default=0, description="当前任务数")
    is_active = fields.BooleanField(default=True, description="是否激活")
    created_at = fields.DatetimeField(auto_now_add=True, description="创建时间")
    updated_at = fields.DatetimeField(auto_now=True, description="更新时间")
    is_deleted = fields.BooleanField(default=False, description="删除标志")

    class Meta:
        table = "slave_configs"

    def __str__(self):
        return f"{self.name} ({self.ip_address}:{self.port}) - {self.status}"
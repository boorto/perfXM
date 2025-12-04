#!/usr/bin/env python3
"""
项目初始化脚本
一键完成数据库迁移和数据初始化
"""
import sys
import os
import subprocess
from pathlib import Path

def run_command(cmd, description=""):
    """运行命令并显示结果"""
    print(f"\n {description}")
    print(f"执行: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

    if result.returncode == 0:
        print(f" 成功: {result.stdout}")
        return True
    else:
        print(f" 失败: {result.stderr}")
        return False

def setup_database():
    """完整的数据库初始化流程"""
    print(" 开始项目数据库初始化...")

    # 1. 生成数据库迁移（如果还没有）
    if not Path("migrations/models").exists():
        print("\n 初始化迁移系统...")
        if not run_command("aerich init-db", "生成初始数据库迁移"):
            return False
    else:
        print("\n 迁移系统已存在，跳过初始化")

    # 2. 应用迁移到数据库
    print("\n 应用数据库迁移...")
    if not run_command("aerich upgrade", "应用迁移"):
        return False

    # 3. 初始化基础数据
    print("\n 初始化基础数据...")
    if not run_command("python init_db.py", "创建默认角色和用户"):
        return False

    print("\n 数据库设置完成!")
    print("\n 默认账号信息:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("管理员: admin / admin123")
    print("项目经理: pm_test / pm123")
    print("测试工程师: qa_test / qa123")
    print("开发者: dev_test / dev123")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  生产环境请及时修改默认密码!")

    return True

def start_server():
    """启动开发服务器"""
    print("\n 启动开发服务器...")
    print("服务器地址: http://localhost:8006")
    print("API 文档: http://localhost:8006/docs")
    print("\n按 Ctrl+C 停止服务器")

    # 使用 uv 启动服务器
    os.execv("uv", ["uv", "run", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8006"])

def main():
    """主函数"""
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "init":
            setup_database()
        elif command == "start":
            start_server()
        elif command == "all":
            if setup_database():
                input("\n按 Enter 键启动服务器...")
                start_server()
        else:
            print("使用方法:")
            print("  python setup.py init   # 初始化数据库")
            print("  python setup.py start  # 启动服务器")
            print("  python setup.py all    # 初始化并启动服务器")
    else:
        print("PerfX Platform - 项目初始化工具")
        print("\n使用方法:")
        print("  python setup.py init   # 初始化数据库")
        print("  python setup.py start  # 启动服务器")
        print("  python setup.py all    # 初始化并启动服务器")
        print("\n示例:")
        print("  python setup.py all    # 推荐首次使用")

if __name__ == "__main__":
    main()
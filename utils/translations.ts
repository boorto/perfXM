
export const translations = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      loading: "Loading...",
      search: "Search...",
      actions: "Actions",
      status: "Status",
      download: "Download",
      preview: "Preview",
      description: "Description",
      run: "Run",
      stop: "Stop",
      logs: "Logs"
    },
    auth: {
      title: "Welcome Back",
      subtitle: "Enter your credentials to access the platform",
      username: "Username",
      password: "Password",
      login: "Sign In",
      logout: "Log Out",
      loggingIn: "Signing in...",
      error: "Invalid credentials",
      footer: "Protected by PerfX Security"
    },
    nav: {
      dashboard: "Dashboard",
      projects: "Projects",
      scenarios: "Scenarios",
      scripts: "Scripts",
      plans: "Test Plans",
      execution: "Execution",
      agents: "Machine Config",
      datasource: "Data Source",
      config: "System Config"
    },
    dashboard: {
      title: "Dashboard",
      activeUsers: "Active Users (VUS)",
      rps: "Requests / Sec",
      avgLatency: "Avg Latency",
      errorRate: "Error Rate",
      realtimeThroughput: "Real-time Throughput (RPS)",
      latencyDist: "Latency Distribution",
      activeNodes: "Active Nodes Status",
      nodeName: "Agent Name",
      region: "Region",
      cpu: "CPU",
      memory: "Memory"
    },
    projects: {
      title: "Project Management",
      add: "New Project",
      table: {
        name: "Project Name",
        desc: "Description",
        owner: "Owner",
        created: "Created At",
        status: "Status",
        actions: "Actions"
      },
      modal: {
        titleAdd: "Create Project",
        titleEdit: "Edit Project",
        nameLabel: "Project Name",
        descLabel: "Description",
        ownerLabel: "Owner",
        statusLabel: "Status"
      },
      status: {
        active: "Active",
        archived: "Archived"
      }
    },
    scripts: {
      title: "JMeter Scripts",
      upload: "Upload Script",
      projects: "Projects",
      allProjects: "All Projects",
      table: {
        name: "Script Name",
        version: "Version",
        size: "Size",
        updated: "Last Updated",
        project: "Project",
        actions: "Actions"
      },
      modal: {
        title: "Upload JMeter Script (.jmx)",
        projectLabel: "Project Name",
        versionLabel: "Version (e.g., v1.0.0)",
        fileLabel: "Script File",
        dropText: "Drag & drop .jmx file here, or click to select",
        descLabel: "Description"
      },
      preview: "File Preview"
    },
    plans: {
      title: "Test Plans",
      add: "New Test Plan",
      subtitle: "Orchestrate distributed load tests with associated projects, scripts, and agents",
      table: {
        name: "Plan Name",
        project: "Project",
        config: "Load Profile",
        lastRun: "Last Run",
        status: "Status"
      },
      status: {
        draft: "Draft",
        running: "Running",
        completed: "Completed",
        failed: "Failed"
      },
      modal: {
        title: "Create Test Plan",
        step1: "Basic Info",
        step2: "Select Scripts",
        step3: "Select Agents",
        step4: "Load Config",
        nameLabel: "Plan Name",
        projectLabel: "Project",
        threadsLabel: "Total Threads (VU)",
        durationLabel: "Duration (seconds)",
        rampUpLabel: "Ramp-up Time (seconds)"
      },
      execution: {
        initializing: "Initializing Cluster...",
        running: "Test Executing",
        progress: "Execution Progress",
        logs: "Live Execution Logs"
      }
    },
    execution: {
      title: "Execution Monitor",
      pause: "Pause",
      resume: "Resume",
      stop: "Stop Test",
      console: "Console Output - Agent Stream",
      running: "Running",
      waiting: "Waiting for execution start..."
    },
    agents: {
      title: "JMeter Cluster Config",
      subtitle: "Configure Master Controller and Load Generators for distributed testing",
      addAgent: "Add Machine",
      checkConn: "Check Connectivity",
      table: {
        name: "Name",
        role: "Role",
        endpoint: "Endpoint (IP:Port)",
        status: "Status",
        resources: "Resources",
        maxThreads: "Max Threads",
        actions: "Actions"
      },
      roles: {
        master: "Master (Controller)",
        slave: "Slave (Generator)"
      },
      status: {
        idle: "Idle",
        busy: "Running",
        offline: "Offline"
      },
      modal: {
        titleAdd: "Add Machine",
        titleEdit: "Edit Machine",
        roleLabel: "Node Role",
        nameLabel: "Machine Name",
        ipLabel: "IP Address",
        portLabel: "JMeter Port (Default 1099)",
        regionLabel: "Region",
        threadsLabel: "Max Threads Capacity",
        tagsLabel: "Tags (comma separated)"
      }
    },
    config: {
      title: "System Configuration",
      menu: {
        users: "User Management",
        roles: "Role Management",
        orgs: "Organization Management"
      },
      users: {
        add: "Add User",
        username: "Username",
        email: "Email",
        role: "Role",
        org: "Organization",
        lastLogin: "Last Login",
        modal: {
          titleAdd: "Add User",
          titleEdit: "Edit User",
          password: "Password"
        }
      },
      roles: {
        add: "Add Role",
        name: "Role Name",
        permissions: "Menu Permissions",
        modal: {
          titleAdd: "Create Role",
          titleEdit: "Edit Role",
          selectPerms: "Select Accessible Modules"
        }
      },
      orgs: {
        add: "Add Organization",
        name: "Org Name",
        code: "Org Code",
        created: "Created Date",
        modal: {
          titleAdd: "Create Organization",
          titleEdit: "Edit Organization"
        }
      }
    }
  },
  zh: {
    common: {
      save: "保存",
      cancel: "取消",
      delete: "删除",
      edit: "编辑",
      loading: "加载中...",
      search: "搜索...",
      actions: "操作",
      status: "状态",
      download: "下载",
      preview: "预览",
      description: "描述",
      run: "执行",
      stop: "停止",
      logs: "日志"
    },
    auth: {
      title: "欢迎回来",
      subtitle: "请输入您的账号密码以访问平台",
      username: "用户名",
      password: "密码",
      login: "登录",
      logout: "退出登录",
      loggingIn: "登录中...",
      error: "用户名或密码错误",
      footer: "由 PerfX Security 提供保护"
    },
    nav: {
      dashboard: "监控看板",
      projects: "项目管理",
      scenarios: "场景编排",
      scripts: "脚本管理",
      plans: "测试计划",
      execution: "实时压测",
      agents: "压测机配置",
      datasource: "数据源",
      config: "系统配置"
    },
    dashboard: {
      title: "监控看板",
      activeUsers: "活跃用户 (VU)",
      rps: "每秒请求 (RPS)",
      avgLatency: "平均响应时间",
      errorRate: "错误率",
      realtimeThroughput: "实时吞吐量 (RPS)",
      latencyDist: "响应时间分布",
      activeNodes: "节点状态监控",
      nodeName: "节点名称",
      region: "区域",
      cpu: "CPU使用率",
      memory: "内存使用率"
    },
    projects: {
      title: "项目管理",
      add: "新建项目",
      table: {
        name: "项目名称",
        desc: "描述",
        owner: "负责人",
        created: "创建时间",
        status: "状态",
        actions: "操作"
      },
      modal: {
        titleAdd: "创建新项目",
        titleEdit: "编辑项目",
        nameLabel: "项目名称",
        descLabel: "项目描述",
        ownerLabel: "项目负责人",
        statusLabel: "状态"
      },
      status: {
        active: "进行中",
        archived: "已归档"
      }
    },
    scripts: {
      title: "JMeter 脚本库",
      upload: "上传脚本",
      projects: "项目列表",
      allProjects: "所有项目",
      table: {
        name: "脚本名称",
        version: "版本号",
        size: "文件大小",
        updated: "更新时间",
        project: "所属项目",
        actions: "操作"
      },
      modal: {
        title: "上传 JMeter 脚本 (.jmx)",
        projectLabel: "所属项目",
        versionLabel: "版本 (例如 v1.0.0)",
        fileLabel: "脚本文件",
        dropText: "拖拽 .jmx 文件到此处，或点击选择",
        descLabel: "描述信息"
      },
      preview: "文件预览"
    },
    plans: {
      title: "测试计划管理",
      add: "新建测试计划",
      subtitle: "编排分布式压测任务，关联项目、脚本与压测集群",
      table: {
        name: "计划名称",
        project: "所属项目",
        config: "压测配置",
        lastRun: "最近执行",
        status: "当前状态"
      },
      status: {
        draft: "草稿",
        running: "执行中",
        completed: "已完成",
        failed: "失败"
      },
      modal: {
        title: "创建测试计划",
        step1: "基本信息",
        step2: "选择脚本",
        step3: "选择压测机",
        step4: "压力配置",
        nameLabel: "计划名称",
        projectLabel: "关联项目",
        threadsLabel: "总线程数 (VU)",
        durationLabel: "持续时间 (秒)",
        rampUpLabel: "Ramp-up 时间 (秒)"
      },
      execution: {
        initializing: "正在初始化集群...",
        running: "压测执行中",
        progress: "执行进度",
        logs: "实时执行日志"
      }
    },
    execution: {
      title: "实时压测监控",
      pause: "暂停",
      resume: "继续",
      stop: "停止测试",
      console: "控制台输出 - 节点日志流",
      running: "运行中",
      waiting: "等待执行开始..."
    },
    agents: {
      title: "压测集群配置",
      subtitle: "配置 JMeter 分布式压测的主控机 (Master) 与负载机 (Slave)",
      addAgent: "新增机器",
      checkConn: "检测连通性",
      table: {
        name: "机器名称",
        role: "角色",
        endpoint: "连接地址 (IP:Port)",
        status: "运行状态",
        resources: "资源监控",
        maxThreads: "最大线程数",
        actions: "操作"
      },
      roles: {
        master: "Master (主控机)",
        slave: "Slave (负载机)"
      },
      status: {
        idle: "空闲",
        busy: "压测中",
        offline: "离线"
      },
      modal: {
        titleAdd: "新增压测机器",
        titleEdit: "编辑压测机器",
        roleLabel: "节点角色",
        nameLabel: "机器名称",
        ipLabel: "IP 地址",
        portLabel: "JMeter 端口 (默认 1099)",
        regionLabel: "部署区域",
        threadsLabel: "最大支持线程数",
        tagsLabel: "标签 (逗号分隔)"
      }
    },
    config: {
      title: "系统配置",
      menu: {
        users: "用户管理",
        roles: "角色管理",
        orgs: "组织管理"
      },
      users: {
        add: "新增用户",
        username: "用户名",
        email: "邮箱",
        role: "角色",
        org: "所属组织",
        lastLogin: "最后登录",
        modal: {
          titleAdd: "新增用户",
          titleEdit: "编辑用户",
          password: "密码"
        }
      },
      roles: {
        add: "新增角色",
        name: "角色名称",
        permissions: "菜单权限",
        modal: {
          titleAdd: "创建角色",
          titleEdit: "编辑角色",
          selectPerms: "选择可见菜单"
        }
      },
      orgs: {
        add: "新增组织",
        name: "组织名称",
        code: "组织代码",
        created: "创建日期",
        modal: {
          titleAdd: "创建组织",
          titleEdit: "编辑组织"
        }
      }
    }
  }
};

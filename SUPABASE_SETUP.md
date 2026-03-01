# Supabase 配置指南

## 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com) 并注册/登录
2. 点击 "New Project" 创建新项目
3. 填写项目名称和密码，等待项目创建完成（约 2 分钟）

## 2. 获取 API 密钥

1. 在项目控制台左侧菜单点击 "Project Settings"
2. 选择 "API" 标签页
3. 复制以下两个值：
   - **URL**: `https://your-project.supabase.co`
   - **anon public**: `eyJhbG...` (以 eyJ 开头的公钥)

## 3. 配置环境变量

1. 复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 填入你的 Supabase 配置：
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. 创建数据库表

在 Supabase 控制台中，进入 "SQL Editor"，执行以下 SQL：

```sql
-- 创建任务表
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('work', 'study', 'life', 'other')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略（RLS）
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的任务
CREATE POLICY "Users can view own tasks" 
  ON tasks FOR SELECT 
  USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的任务
CREATE POLICY "Users can insert own tasks" 
  ON tasks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的任务
CREATE POLICY "Users can update own tasks" 
  ON tasks FOR UPDATE 
  USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的任务
CREATE POLICY "Users can delete own tasks" 
  ON tasks FOR DELETE 
  USING (auth.uid() = user_id);

-- 创建索引优化查询
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## 5. 配置认证设置（可选）

如果需要邮件验证：

1. 在控制台左侧菜单点击 "Authentication"
2. 选择 "Providers" 标签页
3. 配置 "Email" 提供商
4. 可以关闭 "Confirm email" 以简化注册流程（开发环境推荐）

## 6. 本地开发

安装依赖并启动：

```bash
cd "d:/Desktop/Codebuddy Files/task-reminder-app"
npm install
npm run dev
```

访问 http://localhost:5173 查看应用

## 7. 部署到 Vercel

### 7.1 配置环境变量

在 Vercel 项目设置中添加环境变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 7.2 配置 Supabase 认证回调

在 Supabase 控制台 -> Authentication -> URL Configuration 中：

- **Site URL**: 你的生产域名（如 `https://your-app.vercel.app`）
- **Redirect URLs**: 添加 `https://your-app.vercel.app/**`

### 7.3 部署

运行 PowerShell 脚本 `部署到Vercel.ps1`，按提示操作即可。

## 常见问题

### 1. CORS 错误
在 Supabase 控制台 -> API -> Settings 中检查 "Site URL" 和 "Additional Redirect URLs" 是否包含你的域名。

### 2. 注册后无法登录
如果开启了邮箱验证，需要检查邮件。开发环境建议关闭邮箱验证。

### 3. 数据显示不正确
检查 RLS 策略是否正确配置，以及 user_id 是否正确关联到当前登录用户。

### 4. npm install 报错
如果安装依赖时出错，尝试：
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

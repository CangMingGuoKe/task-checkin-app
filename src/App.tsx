import { useState } from 'react'
import { ConfigProvider, Layout, Space, Tabs } from 'tdesign-react'
import { 
  HomeIcon, 
  ChartIcon 
} from 'tdesign-icons-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './components/AuthPage'
import UserHeader from './components/UserHeader'
import StatsDashboard from './components/StatsDashboard'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import type { Task } from './types/task'
import './App.css'

// 主应用内容（已登录状态）
function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [taskFormVisible, setTaskFormVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0)

  // 处理添加任务
  const handleAddTask = () => {
    setEditingTask(null)
    setTaskFormVisible(true)
  }

  // 处理编辑任务
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskFormVisible(true)
  }

  // 处理任务变更（刷新统计）
  const handleTaskChange = () => {
    setStatsRefreshTrigger(prev => prev + 1)
  }

  return (
    <ConfigProvider>
      <Layout className="min-h-screen bg-gray-50">
        <UserHeader />
        
        <Layout.Content className="p-6 max-w-7xl mx-auto">
          <Tabs 
            value={activeTab} 
            onChange={setActiveTab}
            className="mb-6"
          >
            <Tabs.TabPanel 
              value="dashboard" 
              label={
                <Space size="small">
                  <ChartIcon />
                  <span>数据统计</span>
                </Space>
              }
            />
            <Tabs.TabPanel 
              value="tasks" 
              label={
                <Space size="small">
                  <HomeIcon />
                  <span>任务管理</span>
                </Space>
              }
            />
          </Tabs>

          {activeTab === 'dashboard' && (
            <StatsDashboard refreshTrigger={statsRefreshTrigger} />
          )}

          {activeTab === 'tasks' && (
            <TaskList 
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onStatsUpdate={handleTaskChange}
            />
          )}
        </Layout.Content>

        {/* 页脚 */}
        <Layout.Footer className="text-center py-4 text-gray-500 border-t border-gray-200">
          任务打卡系统 | 基于 React + Supabase 构建
        </Layout.Footer>

        {/* 任务表单弹窗 */}
        <TaskForm
          visible={taskFormVisible}
          task={editingTask}
          onClose={() => setTaskFormVisible(false)}
          onSuccess={handleTaskChange}
        />
      </Layout>
    </ConfigProvider>
  )
}

// 应用根组件
function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  return user ? <MainApp /> : <AuthPage />
}

// 应用入口
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

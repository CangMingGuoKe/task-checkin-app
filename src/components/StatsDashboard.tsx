import { useState, useEffect } from 'react'
import { 
  Card, 
  Typography, 
  Space, 
  Row, 
  Col,
  Loading,
  Badge
} from 'tdesign-react'
import { 
  CheckCircleIcon,
  TimeIcon,
  ChartIcon,
  FireIcon
} from 'tdesign-icons-react'
import { taskService } from '../services/taskService'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../types/task'

// 统计面板组件
interface StatsDashboardProps {
  refreshTrigger?: number  // 用于触发刷新
}

export default function StatsDashboard({ refreshTrigger }: StatsDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
    todayCompleted: 0,
    todayTotal: 0
  })
  const [streak, setStreak] = useState(0)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [priorityData, setPriorityData] = useState<any[]>([])

  // 加载统计数据
  const loadStats = async () => {
    setLoading(true)
    try {
      // 基础统计
      const taskStats = await taskService.getTaskStats()
      setStats(taskStats)

      // 连续打卡天数
      const streakDays = await taskService.getStreak()
      setStreak(streakDays)

      // 周数据
      const weekly = await taskService.getWeeklyStats()
      setWeeklyData(weekly)

      // 获取任务列表以计算分类和优先级分布
      const tasks = await taskService.getTasks()
      
      // 分类统计
      const categoryCount: Record<string, number> = {}
      tasks.forEach(task => {
        categoryCount[task.category] = (categoryCount[task.category] || 0) + 1
      })
      setCategoryData(
        Object.entries(categoryCount).map(([key, value]) => ({
          name: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG]?.label || key,
          value,
          color: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG]?.color || '#999'
        }))
      )

      // 优先级统计
      const priorityCount: Record<string, number> = {}
      tasks.forEach(task => {
        priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1
      })
      setPriorityData(
        Object.entries(priorityCount).map(([key, value]) => ({
          name: PRIORITY_CONFIG[key as keyof typeof PRIORITY_CONFIG]?.label || key,
          value,
          color: PRIORITY_CONFIG[key as keyof typeof PRIORITY_CONFIG]?.color || '#999'
        }))
      )
    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [refreshTrigger])

  // 统计卡片组件
  const StatCard = ({ 
    title, 
    value, 
    subtext, 
    icon, 
    color 
  }: { 
    title: string
    value: string | number
    subtext?: string
    icon: React.ReactNode
    color: string 
  }) => (
    <Card className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <Typography.Text className="text-gray-500">{title}</Typography.Text>
          <Typography.Title level={2} className="!mt-2 !mb-1">
            {value}
          </Typography.Title>
          {subtext && (
            <Typography.Text className="text-gray-400 text-sm">
              {subtext}
            </Typography.Text>
          )}
        </div>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
    </Card>
  )

  return (
    <Loading loading={loading}>
      <Space direction="vertical" size="large" className="w-full">
        {/* 今日概览 */}
        <Typography.Title level={4}>今日概览</Typography.Title>
        <Row gutter={[16, 16]}>
          <Col span={6} xs={12} sm={6}>
            <StatCard
              title="今日完成"
              value={stats.todayCompleted}
              subtext={`共 ${stats.todayTotal} 个任务`}
              icon={<CheckCircleIcon />}
              color="#00A870"
            />
          </Col>
          <Col span={6} xs={12} sm={6}>
            <StatCard
              title="连续打卡"
              value={`${streak} 天`}
              subtext="保持好习惯！"
              icon={<FireIcon />}
              color="#ED7B2F"
            />
          </Col>
          <Col span={6} xs={12} sm={6}>
            <StatCard
              title="总完成率"
              value={`${stats.completionRate}%`}
              subtext={`${stats.completed} / ${stats.total}`}
              icon={<ChartIcon />}
              color="#0052D9"
            />
          </Col>
          <Col span={6} xs={12} sm={6}>
            <StatCard
              title="待办任务"
              value={stats.pending}
              subtext="继续加油！"
              icon={<TimeIcon />}
              color="#E34D59"
            />
          </Col>
        </Row>

        {/* 图表区域 */}
        <Row gutter={[16, 16]}>
          <Col span={12} xs={24} sm={12}>
            <Card title="过去7天完成情况">
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#00A870" name="已完成" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" fill="#E3E6EB" name="总任务" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col span={6} xs={24} sm={6}>
            <Card title="任务分类分布">
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {categoryData.map(item => (
                  <Badge 
                    key={item.name} 
                    color={item.color} 
                    text={`${item.name} (${item.value})`}
                  />
                ))}
              </div>
            </Card>
          </Col>
          <Col span={6} xs={24} sm={6}>
            <Card title="优先级分布">
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {priorityData.map(item => (
                  <Badge 
                    key={item.name} 
                    color={item.color} 
                    text={`${item.name} (${item.value})`}
                  />
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </Space>
    </Loading>
  )
}

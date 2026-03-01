// 任务分类
export type TaskCategory = 'work' | 'study' | 'life' | 'other'

// 任务优先级
export type TaskPriority = 'high' | 'medium' | 'low'

// 任务状态
export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  dueDate?: string
  completed: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// 创建任务请求
export interface CreateTaskRequest {
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  dueDate?: string
}

// 更新任务请求
export interface UpdateTaskRequest {
  title?: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  dueDate?: string
  completed?: boolean
}

// 任务筛选条件
export interface TaskFilter {
  category?: TaskCategory
  priority?: TaskPriority
  completed?: boolean
  search?: string
}

// 分类配置
export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; icon: string }> = {
  work: { label: '工作', color: '#0052D9', icon: 'briefcase' },
  study: { label: '学习', color: '#00A870', icon: 'book' },
  life: { label: '生活', color: '#ED7B2F', icon: 'home' },
  other: { label: '其他', color: '#999999', icon: 'more' }
}

// 优先级配置
export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: '高', color: '#E34D59' },
  medium: { label: '中', color: '#ED7B2F' },
  low: { label: '低', color: '#00A870' }
}

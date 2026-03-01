import { supabase } from '../lib/supabase'
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilter } from '../types/task'

// 任务服务 - 封装所有与任务相关的数据库操作
export const taskService = {
  // 获取当前用户的所有任务
  async getTasks(filter?: TaskFilter): Promise<Task[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // 应用筛选条件
    if (filter?.category) {
      query = query.eq('category', filter.category)
    }
    if (filter?.priority) {
      query = query.eq('priority', filter.priority)
    }
    if (filter?.completed !== undefined) {
      query = query.eq('completed', filter.completed)
    }
    if (filter?.search) {
      query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('获取任务失败:', error)
      throw error
    }

    return data?.map(item => this.transformFromDB(item)) || []
  },

  // 获取单个任务
  async getTask(id: string): Promise<Task | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // 未找到
      throw error
    }

    return data ? this.transformFromDB(data) : null
  },

  // 创建任务
  async createTask(request: CreateTaskRequest): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: user.id,
        title: request.title,
        description: request.description || null,
        category: request.category,
        priority: request.priority,
        due_date: request.dueDate || null,
        completed: false
      }])
      .select()
      .single()

    if (error) {
      console.error('创建任务失败:', error)
      throw error
    }

    return this.transformFromDB(data)
  },

  // 更新任务
  async updateTask(id: string, request: UpdateTaskRequest): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const updateData: any = {}
    if (request.title !== undefined) updateData.title = request.title
    if (request.description !== undefined) updateData.description = request.description || null
    if (request.category !== undefined) updateData.category = request.category
    if (request.priority !== undefined) updateData.priority = request.priority
    if (request.dueDate !== undefined) updateData.due_date = request.dueDate || null
    if (request.completed !== undefined) {
      updateData.completed = request.completed
      updateData.completed_at = request.completed ? new Date().toISOString() : null
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('更新任务失败:', error)
      throw error
    }

    return this.transformFromDB(data)
  },

  // 删除任务
  async deleteTask(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('删除任务失败:', error)
      throw error
    }
  },

  // 切换任务完成状态
  async toggleTaskComplete(id: string, completed: boolean): Promise<Task> {
    return this.updateTask(id, { completed })
  },

  // 获取任务统计数据
  async getTaskStats(): Promise<{
    total: number
    completed: number
    pending: number
    completionRate: number
    todayCompleted: number
    todayTotal: number
  }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    // 获取所有任务
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw error

    const total = tasks?.length || 0
    const completed = tasks?.filter(t => t.completed).length || 0
    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // 今日任务统计
    const today = new Date().toISOString().split('T')[0]
    const todayTasks = tasks?.filter(t => {
      const taskDate = t.created_at?.split('T')[0]
      return taskDate === today || t.due_date === today
    }) || []
    const todayCompleted = todayTasks.filter(t => t.completed).length
    const todayTotal = todayTasks.length

    return {
      total,
      completed,
      pending,
      completionRate,
      todayCompleted,
      todayTotal
    }
  },

  // 获取连续打卡天数
  async getStreak(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('completed_at')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })

    if (error) throw error
    if (!tasks || tasks.length === 0) return 0

    // 计算连续天数
    const completedDates = tasks
      .map(t => t.completed_at?.split('T')[0])
      .filter(Boolean)
      .filter((date, index, arr) => arr.indexOf(date) === index) // 去重
      .sort().reverse()

    if (completedDates.length === 0) return 0

    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < completedDates.length; i++) {
      const date = new Date(completedDates[i])
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === i || (i === 0 && diffDays === 1)) {
        streak++
      } else if (diffDays > i) {
        break
      }
    }

    return streak
  },

  // 获取过去7天的完成数据（用于图表）
  async getWeeklyStats(): Promise<{ date: string; completed: number; total: number }[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('用户未登录')

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('created_at, completed, completed_at')
      .eq('user_id', user.id)

    if (error) throw error

    // 生成过去7天的日期
    const result: { date: string; completed: number; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayTasks = tasks?.filter(t => {
        const taskDate = t.created_at?.split('T')[0]
        return taskDate === dateStr
      }) || []

      result.push({
        date: dateStr.slice(5), // 显示 MM-DD
        completed: dayTasks.filter(t => t.completed).length,
        total: dayTasks.length
      })
    }

    return result
  },

  // 数据库字段到前端类型的转换
  transformFromDB(data: any): Task {
    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      dueDate: data.due_date,
      completed: data.completed,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }
}

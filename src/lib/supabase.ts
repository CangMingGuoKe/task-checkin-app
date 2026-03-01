import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库表类型定义
export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  category: 'work' | 'study' | 'life' | 'other'
  priority: 'high' | 'medium' | 'low'
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type UserProfile = {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

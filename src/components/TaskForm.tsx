import { useState, useEffect } from 'react'
import { 
  Dialog, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Textarea,
  Button,
  Space,
  MessagePlugin
} from 'tdesign-react'
import { taskService } from '../services/taskService'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task'
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../types/task'

// 任务表单组件属性
interface TaskFormProps {
  visible: boolean
  task?: Task | null  // 如果传入则表示编辑模式
  onClose: () => void
  onSuccess: () => void
}

export default function TaskForm({ visible, task, onClose, onSuccess }: TaskFormProps) {
  const isEdit = !!task
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    category: 'work',
    priority: 'medium',
    dueDate: undefined
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 当任务变化时更新表单
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate
      })
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'work',
        priority: 'medium',
        dueDate: undefined
      })
    }
    setErrors({})
  }, [task, visible])

  // 验证表单
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title?.trim()) {
      newErrors.title = '请输入任务标题'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      if (isEdit && task) {
        await taskService.updateTask(task.id, formData as UpdateTaskRequest)
        MessagePlugin.success('任务已更新')
      } else {
        await taskService.createTask(formData)
        MessagePlugin.success('任务已创建')
      }
      onSuccess()
      onClose()
    } catch (error) {
      MessagePlugin.error(isEdit ? '更新失败' : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  // 分类选项
  const categoryOptions = Object.entries(CATEGORY_CONFIG).map(([value, config]) => ({
    label: config.label,
    value
  }))

  // 优先级选项
  const priorityOptions = Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
    label: config.label,
    value
  }))

  return (
    <Dialog
      header={isEdit ? '编辑任务' : '新建任务'}
      visible={visible}
      onClose={onClose}
      width={500}
      footer={
        <Space>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button theme="primary" loading={loading} onClick={handleSubmit}>
            {isEdit ? '保存' : '创建'}
          </Button>
        </Space>
      }
    >
      <Form className="mt-4">
        <Form.FormItem 
          label="任务标题" 
          required
          status={errors.title ? 'error' : undefined}
          tips={errors.title}
        >
          <Input
            placeholder="输入任务名称"
            value={formData.title}
            onChange={(v) => {
              setFormData({ ...formData, title: v })
              setErrors({ ...errors, title: '' })
            }}
          />
        </Form.FormItem>

        <Form.FormItem label="任务描述">
          <Textarea
            placeholder="添加任务详情（可选）"
            value={formData.description}
            onChange={(v) => setFormData({ ...formData, description: v })}
            rows={3}
          />
        </Form.FormItem>

        <div className="grid grid-cols-2 gap-4">
          <Form.FormItem label="分类" required>
            <Select
              value={formData.category}
              options={categoryOptions}
              onChange={(v) => setFormData({ ...formData, category: v as any })}
            />
          </Form.FormItem>

          <Form.FormItem label="优先级" required>
            <Select
              value={formData.priority}
              options={priorityOptions}
              onChange={(v) => setFormData({ ...formData, priority: v as any })}
            />
          </Form.FormItem>
        </div>

        <Form.FormItem label="截止日期">
          <DatePicker
            value={formData.dueDate}
            onChange={(v) => setFormData({ ...formData, dueDate: v as string })}
            placeholder="选择截止日期（可选）"
            format="YYYY-MM-DD"
          />
        </Form.FormItem>
      </Form>
    </Dialog>
  )
}

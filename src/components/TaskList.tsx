import { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  Typography, 
  Space, 
  Tag, 
  Checkbox,
  Dropdown,
  MessagePlugin,
  Empty,
  Input
} from 'tdesign-react'
import { 
  AddIcon,
  MoreIcon,
  EditIcon,
  DeleteIcon,
  CalendarIcon,
  SearchIcon
} from 'tdesign-icons-react'
import { taskService } from '../services/taskService'
import type { Task, TaskCategory, TaskPriority, TaskFilter } from '../types/task'
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../types/task'

// 任务列表组件属性
interface TaskListProps {
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onStatsUpdate: () => void
}

export default function TaskList({ onAddTask, onEditTask, onStatsUpdate }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<TaskFilter>({})

  // 加载任务列表
  const loadTasks = async () => {
    setLoading(true)
    try {
      const data = await taskService.getTasks(filter)
      setTasks(data)
    } catch (error) {
      MessagePlugin.error('加载任务失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [filter])

  // 切换任务完成状态
  const handleToggleComplete = async (task: Task) => {
    try {
      await taskService.toggleTaskComplete(task.id, !task.completed)
      MessagePlugin.success(task.completed ? '任务已恢复' : '任务已完成！')
      loadTasks()
      onStatsUpdate()
    } catch (error) {
      MessagePlugin.error('操作失败')
    }
  }

  // 删除任务
  const handleDelete = async (task: Task) => {
    if (!confirm('确定要删除这个任务吗？')) return
    
    try {
      await taskService.deleteTask(task.id)
      MessagePlugin.success('任务已删除')
      loadTasks()
      onStatsUpdate()
    } catch (error) {
      MessagePlugin.error('删除失败')
    }
  }

  // 获取优先级标签
  const getPriorityTag = (priority: TaskPriority) => {
    return (
      <Tag 
        variant="light" 
        theme={priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'success'}
        size="small"
      >
        {PRIORITY_CONFIG[priority].label}
      </Tag>
    )
  }

  // 获取分类标签
  const getCategoryTag = (category: TaskCategory) => {
    const config = CATEGORY_CONFIG[category]
    return (
      <Tag 
        variant="light" 
        style={{ backgroundColor: config.color + '20', color: config.color }}
        size="small"
      >
        {config.label}
      </Tag>
    )
  }

  // 操作菜单
  const getDropdownOptions = (task: Task) => [
    {
      content: '编辑',
      value: 'edit',
      prefixIcon: <EditIcon />
    },
    {
      content: '删除',
      value: 'delete',
      prefixIcon: <DeleteIcon />,
      theme: 'error'
    }
  ]

  const handleDropdownClick = (value: string, task: Task) => {
    if (value === 'edit') {
      onEditTask(task)
    } else if (value === 'delete') {
      handleDelete(task)
    }
  }

  return (
    <Card className="shadow-sm">
      {/* 头部工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Typography.Title level={4} className="!mb-0">我的任务</Typography.Title>
        
        <Space>
          <Input
            placeholder="搜索任务..."
            prefixIcon={<SearchIcon />}
            value={filter.search}
            onChange={(v) => setFilter({ ...filter, search: v })}
            clearable
          />
          <Button theme="primary" icon={<AddIcon />} onClick={onAddTask}>
            新建任务
          </Button>
        </Space>
      </div>

      {/* 筛选器 */}
      <Space className="mb-4 flex-wrap">
        <Button 
          variant={!filter.category ? 'base' : 'outline'}
          theme={!filter.category ? 'primary' : 'default'}
          size="small"
          onClick={() => setFilter({ ...filter, category: undefined })}
        >
          全部分类
        </Button>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <Button 
            key={key}
            variant={filter.category === key ? 'base' : 'outline'}
            theme={filter.category === key ? 'primary' : 'default'}
            size="small"
            onClick={() => setFilter({ ...filter, category: key as TaskCategory })}
          >
            {config.label}
          </Button>
        ))}
      </Space>

      <Space className="mb-6">
        <Button 
          variant={filter.completed === undefined ? 'base' : 'outline'}
          theme={filter.completed === undefined ? 'primary' : 'default'}
          size="small"
          onClick={() => setFilter({ ...filter, completed: undefined })}
        >
          全部
        </Button>
        <Button 
          variant={filter.completed === false ? 'base' : 'outline'}
          theme={filter.completed === false ? 'primary' : 'default'}
          size="small"
          onClick={() => setFilter({ ...filter, completed: false })}
        >
          进行中
        </Button>
        <Button 
          variant={filter.completed === true ? 'base' : 'outline'}
          theme={filter.completed === true ? 'primary' : 'default'}
          size="small"
          onClick={() => setFilter({ ...filter, completed: true })}
        >
          已完成
        </Button>
      </Space>

      {/* 任务列表 */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Empty description="暂无任务，点击上方按钮创建" />
        ) : (
          tasks.map(task => (
            <div 
              key={task.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                task.completed 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Typography.Text 
                      strong 
                      className={task.completed ? 'line-through text-gray-400' : ''}
                    >
                      {task.title}
                    </Typography.Text>
                    {getCategoryTag(task.category)}
                    {getPriorityTag(task.priority)}
                  </div>
                  
                  {task.description && (
                    <Typography.Text className="text-gray-500 text-sm mt-1 block">
                      {task.description}
                    </Typography.Text>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <CalendarIcon />
                        截止: {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                      </span>
                    )}
                    <span>创建于: {new Date(task.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>

                <Dropdown 
                  options={getDropdownOptions(task)}
                  onClick={(v) => handleDropdownClick(v as string, task)}
                  placement="bottom-right"
                >
                  <Button variant="text" shape="square" icon={<MoreIcon />} />
                </Dropdown>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

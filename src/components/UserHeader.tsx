import { 
  Layout, 
  Button, 
  Typography, 
  Space, 
  Dropdown, 
  Avatar,
  MessagePlugin,
  Badge
} from 'tdesign-react'
import { 
  UserIcon, 
  LogoutIcon, 
  SettingIcon,
  CheckCircleFilledIcon
} from 'tdesign-icons-react'
import { useAuth } from '../contexts/AuthContext'

// 用户头部组件
export default function UserHeader() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      MessagePlugin.error('登出失败')
    } else {
      MessagePlugin.success('已登出')
    }
  }

  // 下拉菜单选项
  const dropdownOptions = [
    {
      content: '账号设置',
      value: 'settings',
      prefixIcon: <SettingIcon />
    },
    {
      content: '退出登录',
      value: 'logout',
      prefixIcon: <LogoutIcon />,
      theme: 'error'
    }
  ]

  const handleDropdownClick = (value: string) => {
    if (value === 'logout') {
      handleSignOut()
    } else if (value === 'settings') {
      MessagePlugin.info('设置功能开发中...')
    }
  }

  return (
    <Layout.Header className="bg-white border-b border-gray-200 px-6">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
        {/* Logo */}
        <Space>
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <CheckCircleFilledIcon className="text-white text-xl" />
          </div>
          <Typography.Title level={4} className="!mb-0">
            任务打卡系统
          </Typography.Title>
        </Space>

        {/* 用户信息 */}
        <Space>
          <Dropdown
            options={dropdownOptions}
            onClick={handleDropdownClick}
            placement="bottom-right"
          >
            <Button variant="text">
              <Space>
                <Avatar 
                  icon={<UserIcon />} 
                  size="small"
                  style={{ backgroundColor: '#0052D9' }}
                />
                <Typography.Text>
                  {user?.email?.split('@')[0] || '用户'}
                </Typography.Text>
              </Space>
            </Button>
          </Dropdown>
        </Space>
      </div>
    </Layout.Header>
  )
}

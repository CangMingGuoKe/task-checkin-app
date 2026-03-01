import { useState } from 'react'
import { 
  Card, 
  Input, 
  Button, 
  Typography, 
  Space, 
  MessagePlugin,
  Tabs,
  Form,
  Loading
} from 'tdesign-react'
import { 
  UserIcon, 
  LockOnIcon, 
  MailIcon,
  CheckCircleFilledIcon 
} from 'tdesign-icons-react'
import { useAuth } from '../contexts/AuthContext'

// 认证页面组件 - 包含登录和注册功能
export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  // 登录表单数据
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  // 注册表单数据
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  // 表单验证错误
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 处理登录
  const handleLogin = async () => {
    const newErrors: Record<string, string> = {}
    
    if (!loginForm.email) newErrors.loginEmail = '请输入邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      newErrors.loginEmail = '请输入有效的邮箱地址'
    }
    
    if (!loginForm.password) newErrors.loginPassword = '请输入密码'
    else if (loginForm.password.length < 6) newErrors.loginPassword = '密码至少6位'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    const { error } = await signIn(loginForm.email, loginForm.password)
    setLoading(false)

    if (error) {
      MessagePlugin.error('登录失败：' + error.message)
    } else {
      MessagePlugin.success('登录成功！')
    }
  }

  // 处理注册
  const handleRegister = async () => {
    const newErrors: Record<string, string> = {}
    
    if (!registerForm.email) newErrors.registerEmail = '请输入邮箱'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      newErrors.registerEmail = '请输入有效的邮箱地址'
    }
    
    if (!registerForm.password) newErrors.registerPassword = '请输入密码'
    else if (registerForm.password.length < 6) {
      newErrors.registerPassword = '密码至少6位'
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    const { error } = await signUp(registerForm.email, registerForm.password)
    setLoading(false)

    if (error) {
      MessagePlugin.error('注册失败：' + error.message)
    } else {
      MessagePlugin.success('注册成功！请查看邮箱完成验证（如未收到可直接登录）')
      setActiveTab('login')
      setLoginForm({ ...loginForm, email: registerForm.email })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <Loading loading={loading}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircleFilledIcon className="text-white text-3xl" />
            </div>
            <Typography.Title level={3}>任务打卡系统</Typography.Title>
            <Typography.Text className="text-gray-500">
              养成好习惯，从每日打卡开始
            </Typography.Text>
          </div>

          <Tabs 
            value={activeTab} 
            onChange={(v) => setActiveTab(v as 'login' | 'register')}
            className="mb-6"
          >
            <Tabs.TabPanel value="login" label="登录" />
            <Tabs.TabPanel value="register" label="注册" />
          </Tabs>

          {activeTab === 'login' && (
            <Space direction="vertical" size="large" className="w-full">
              <Form className="w-full">
                <Form.FormItem 
                  label="邮箱" 
                  status={errors.loginEmail ? 'error' : undefined}
                  tips={errors.loginEmail}
                >
                  <Input
                    prefixIcon={<MailIcon />}
                    placeholder="请输入邮箱"
                    value={loginForm.email}
                    onChange={(v) => {
                      setLoginForm({ ...loginForm, email: v })
                      setErrors({ ...errors, loginEmail: '' })
                    }}
                    onEnter={handleLogin}
                  />
                </Form.FormItem>

                <Form.FormItem 
                  label="密码" 
                  status={errors.loginPassword ? 'error' : undefined}
                  tips={errors.loginPassword}
                >
                  <Input
                    type="password"
                    prefixIcon={<LockOnIcon />}
                    placeholder="请输入密码"
                    value={loginForm.password}
                    onChange={(v) => {
                      setLoginForm({ ...loginForm, password: v })
                      setErrors({ ...errors, loginPassword: '' })
                    }}
                    onEnter={handleLogin}
                  />
                </Form.FormItem>
              </Form>

              <Button 
                theme="primary" 
                size="large" 
                block 
                onClick={handleLogin}
              >
                登录
              </Button>

              <div className="text-center">
                <Typography.Text className="text-gray-500">
                  还没有账号？
                </Typography.Text>
                <Button 
                  variant="text" 
                  onClick={() => setActiveTab('register')}
                >
                  立即注册
                </Button>
              </div>
            </Space>
          )}

          {activeTab === 'register' && (
            <Space direction="vertical" size="large" className="w-full">
              <Form className="w-full">
                <Form.FormItem 
                  label="邮箱" 
                  status={errors.registerEmail ? 'error' : undefined}
                  tips={errors.registerEmail}
                >
                  <Input
                    prefixIcon={<MailIcon />}
                    placeholder="请输入邮箱"
                    value={registerForm.email}
                    onChange={(v) => {
                      setRegisterForm({ ...registerForm, email: v })
                      setErrors({ ...errors, registerEmail: '' })
                    }}
                  />
                </Form.FormItem>

                <Form.FormItem 
                  label="密码" 
                  status={errors.registerPassword ? 'error' : undefined}
                  tips={errors.registerPassword}
                >
                  <Input
                    type="password"
                    prefixIcon={<LockOnIcon />}
                    placeholder="至少6位密码"
                    value={registerForm.password}
                    onChange={(v) => {
                      setRegisterForm({ ...registerForm, password: v })
                      setErrors({ ...errors, registerPassword: '' })
                    }}
                  />
                </Form.FormItem>

                <Form.FormItem 
                  label="确认密码" 
                  status={errors.confirmPassword ? 'error' : undefined}
                  tips={errors.confirmPassword}
                >
                  <Input
                    type="password"
                    prefixIcon={<LockOnIcon />}
                    placeholder="再次输入密码"
                    value={registerForm.confirmPassword}
                    onChange={(v) => {
                      setRegisterForm({ ...registerForm, confirmPassword: v })
                      setErrors({ ...errors, confirmPassword: '' })
                    }}
                    onEnter={handleRegister}
                  />
                </Form.FormItem>
              </Form>

              <Button 
                theme="primary" 
                size="large" 
                block 
                onClick={handleRegister}
              >
                注册
              </Button>

              <div className="text-center">
                <Typography.Text className="text-gray-500">
                  已有账号？
                </Typography.Text>
                <Button 
                  variant="text" 
                  onClick={() => setActiveTab('login')}
                >
                  直接登录
                </Button>
              </div>
            </Space>
          )}
        </Loading>
      </Card>
    </div>
  )
}

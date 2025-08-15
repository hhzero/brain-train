'use client'
import { useTranslations } from 'next-intl'
import Button from '../components/Button'
import { Link } from '@/navigation'

/**
 * 按钮测试页面
 * 用于隔离和诊断按钮点击问题
 */
export default function TestButtons() {
  const t = useTranslations('')

  // 测试点击处理函数
  const handleTestClick = () => {
    console.log('🎯 测试按钮被点击了！')
    alert('按钮点击成功！')
  }

  const handleSimpleClick = () => {
    console.log('🎯 简单按钮被点击了！')
    alert('简单按钮点击成功！')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          按钮点击测试页面
        </h1>
        
        <div className="space-y-8">
          {/* 测试1: 原始HTML按钮 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">测试1: 原始HTML按钮</h2>
            <button 
              onClick={handleSimpleClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              style={{ zIndex: 9999, position: 'relative' }}
            >
              原始HTML按钮
            </button>
          </section>

          {/* 测试2: 自定义Button组件 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">测试2: 自定义Button组件</h2>
            <Button 
              onClick={handleTestClick}
              variant="primary"
              size="large"
              className="relative"
              style={{ zIndex: 9999 }}
            >
              自定义Button组件
            </Button>
          </section>

          {/* 测试3: Link包装的Button */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">测试3: Link包装的Button</h2>
            <Link href="/attention" style={{ zIndex: 9999, position: 'relative' }}>
              <Button 
                variant="magic"
                size="large"
                className="relative"
              >
                Link包装的Button
              </Button>
            </Link>
          </section>

          {/* 测试4: 不同z-index的按钮 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">测试4: 不同z-index的按钮</h2>
            <div className="space-x-4">
              <Button 
                onClick={handleTestClick}
                variant="success"
                className="relative"
                style={{ zIndex: 1 }}
              >
                z-index: 1
              </Button>
              <Button 
                onClick={handleTestClick}
                variant="warning"
                className="relative"
                style={{ zIndex: 10 }}
              >
                z-index: 10
              </Button>
              <Button 
                onClick={handleTestClick}
                variant="danger"
                className="relative"
                style={{ zIndex: 9999 }}
              >
                z-index: 9999
              </Button>
            </div>
          </section>

          {/* 测试5: 禁用状态测试 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">测试5: 禁用状态测试</h2>
            <div className="space-x-4">
              <Button 
                onClick={handleTestClick}
                variant="primary"
                disabled={false}
              >
                启用按钮
              </Button>
              <Button 
                onClick={handleTestClick}
                variant="secondary"
                disabled={true}
              >
                禁用按钮
              </Button>
            </div>
          </section>

          {/* 测试6: 加载状态测试 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">测试6: 加载状态测试</h2>
            <div className="space-x-4">
              <Button 
                onClick={handleTestClick}
                variant="primary"
                loading={false}
              >
                正常按钮
              </Button>
              <Button 
                onClick={handleTestClick}
                variant="secondary"
                loading={true}
              >
                加载中按钮
              </Button>
            </div>
          </section>

          {/* 调试信息 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">调试信息</h2>
            <div className="text-sm space-y-2">
              <p>• 请打开浏览器开发者工具查看控制台输出</p>
              <p>• 点击按钮时应该看到控制台日志和弹窗</p>
              <p>• 如果没有反应，请检查元素层级和事件绑定</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
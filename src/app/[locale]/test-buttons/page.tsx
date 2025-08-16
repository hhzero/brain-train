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
    alert(t('testButtons.buttonClickSuccess'))
  }

  const handleSimpleClick = () => {
    console.log('🎯 简单按钮被点击了！')
    alert(t('testButtons.simpleButtonClickSuccess'))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {t('testButtons.title')}
        </h1>
        
        <div className="space-y-8">
          {/* 测试1: 原始HTML按钮 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('testButtons.test1Title')}</h2>
            <button 
              onClick={handleSimpleClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              style={{ zIndex: 9999, position: 'relative' }}
            >
              {t('testButtons.rawHtmlButton')}
            </button>
          </section>

          {/* 测试2: 自定义Button组件 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('testButtons.test2Title')}</h2>
            <Button 
              onClick={handleTestClick}
              variant="primary"
              size="large"
              className="relative"
              style={{ zIndex: 9999 }}
            >
              {t('testButtons.customButtonComponent')}
            </Button>
          </section>

          {/* 测试3: Link包装的Button */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('testButtons.test3Title')}</h2>
            <Link href="/attention" style={{ zIndex: 9999, position: 'relative' }}>
              <Button 
                variant="magic"
                size="large"
                className="relative"
              >
                {t('testButtons.linkWrappedButton')}
              </Button>
            </Link>
          </section>

          {/* 测试4: 不同z-index的按钮 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('testButtons.test4Title')}</h2>
            <div className="space-x-4">
              <Button 
                onClick={handleTestClick}
                variant="success"
                className="relative"
                style={{ zIndex: 1 }}
              >
                {t('testButtons.zIndex1')}
              </Button>
              <Button 
                onClick={handleTestClick}
                variant="warning"
                className="relative"
                style={{ zIndex: 10 }}
              >
                {t('testButtons.zIndex10')}
              </Button>
              <Button 
                onClick={handleTestClick}
                variant="danger"
                className="relative"
                style={{ zIndex: 9999 }}
              >
                {t('testButtons.zIndex9999')}
              </Button>
            </div>
          </section>

          {/* 测试5: 禁用状态测试 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('testButtons.test5Title')}</h2>
            <div className="space-x-4">
              <Button 
                onClick={handleTestClick}
                variant="primary"
                disabled={false}
              >
                {t('testButtons.enabledButton')}
              </Button>
              <Button 
                onClick={handleTestClick}
                variant="secondary"
                disabled={true}
              >
                {t('testButtons.disabledButton')}
              </Button>
            </div>
          </section>

          {/* 测试6: 加载状态测试 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('testButtons.test6Title')}</h2>
            <div className="space-x-4">
              <Button 
                onClick={handleTestClick}
                variant="primary"
                loading={false}
              >
                {t('testButtons.normalButton')}
              </Button>
              <Button 
                onClick={handleTestClick}
                variant="secondary"
                loading={true}
              >
                {t('testButtons.loadingButton')}
              </Button>
            </div>
          </section>

          {/* 调试信息 */}
          <section className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">{t('testButtons.debugInfo')}</h2>
            <div className="text-sm space-y-2">
              <p>• {t('testButtons.debugTip1')}</p>
              <p>• {t('testButtons.debugTip2')}</p>
              <p>• {t('testButtons.debugTip3')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
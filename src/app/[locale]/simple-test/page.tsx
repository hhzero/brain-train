'use client'
import { useTranslations } from 'next-intl'
import Button from '../components/Button'

/**
 * 简化的按钮测试页面
 * 用于隔离DOM问题
 */
export default function SimpleTest() {
  const t = useTranslations('')
  
  const handleClick = () => {
    console.log(t('simpleTest.buttonClickLog'))
    alert(t('simpleTest.buttonClickSuccess'))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">{t('simpleTest.title')}</h1>
      
      <div className="space-y-4">
        <button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {t('simpleTest.rawHtmlButton')}
        </button>
        
        <Button 
          onClick={handleClick}
          variant="primary"
        >
          {t('simpleTest.customButtonComponent')}
        </Button>
      </div>
    </div>
  )
}
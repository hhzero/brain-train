'use client'
import Button from '../components/Button'

/**
 * 简化的按钮测试页面
 * 用于隔离DOM问题
 */
export default function SimpleTest() {
  const handleClick = () => {
    console.log('🎯 按钮被点击了！')
    alert('按钮点击成功！')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">简化测试页面</h1>
      
      <div className="space-y-4">
        <button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          原始HTML按钮
        </button>
        
        <Button 
          onClick={handleClick}
          variant="primary"
        >
          自定义Button组件
        </Button>
      </div>
    </div>
  )
}
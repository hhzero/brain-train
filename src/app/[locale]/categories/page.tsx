'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'

// 分类页面组件
export default function Categories() {
  // 保存所有类别数据
  const [categories, setCategories] = useState<any[]>([])
  // 保存每个类别的展开/收起状态，key为类别索引，value为true表示展开
  const [openMap, setOpenMap] = useState<{ [key: number]: boolean }>({})
  // 路由对象，用于页面跳转
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  // 页面加载时，异步获取 public/data/data.json 文件内容
  useEffect(() => {
    // 根据当前语言加载对应的数据文件
    fetch(`/data/data.${locale}.json`)
      .then(res => res.json())
      .then(data => {
        // data 是一个对象，key为类别名，value为类别对象
        // 需要转成数组结构，方便渲染
        const arr = Object.values(data)
        setCategories(arr)
      })
      .catch(err => {
        console.error('加载数据失败:', err)
      })
  }, [locale])

  // 切换某个类别的展开/收起状态
  const toggleCategory = (idx: number) => {
    setOpenMap(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-12 text-4xl font-bold text-center text-gray-800'
        >
          {locale === 'zh' ? '分类训练' : locale === 'en' ? 'Categories' : 'カテゴリー'}
        </motion.h1>
        
        <div className='space-y-6'>
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className='group rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300'
            >
              <div
                className='flex items-center justify-between cursor-pointer select-none'
                onClick={() => toggleCategory(idx)}
              >
                <div className='flex items-center space-x-3'>
                  <div className='w-2 h-8 bg-primary rounded-full'></div>
                  <h2 className='text-2xl font-semibold text-gray-800 group-hover:text-primary transition-colors'>
                    {cat.name[locale]}
                  </h2>
                </div>
                <motion.span
                  animate={{ rotate: openMap[idx] ? 180 : 0 }}
                  className='text-gray-400 group-hover:text-primary transition-colors'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </motion.span>
              </div>

              <AnimatePresence>
                {openMap[idx] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className='mt-6 space-y-4 overflow-hidden'
                  >
                    {cat.list && cat.list.length > 0 ? (
                      cat.list.map((item: any) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.02 }}
                          className='flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors'
                        >
                          <div className='flex-1'>
                            <div className='font-medium text-gray-800'>{item.name[locale]}</div>
                            {item.description && (
                              <div className='text-sm text-gray-500 mt-1'>{item.description[locale]}</div>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='ml-4 rounded-lg bg-primary px-6 py-2 text-white font-medium hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg'
                            onClick={() => router.push(item.link)}
                          >
                            {locale === 'zh' ? '开始训练' : locale === 'en' ? 'Start Training' : 'トレーニング開始'}
                          </motion.button>
                        </motion.div>
                      ))
                    ) : (
                      <div className='text-center py-8 text-gray-400'>
                        {locale === 'zh' ? '暂无训练项目' : locale === 'en' ? 'No training items' : 'トレーニング項目なし'}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 
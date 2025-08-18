import { useTranslations } from 'next-intl'

export default function About() {
  const t = useTranslations('')
  return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <div
        className="text-gray-300 text-lg md:text-2xl shadow-lg bg-black/20 rounded-xl px-8 py-6 backdrop-blur-md max-w-2xl mx-auto text-center"
      >
        {t('about')}
      </div>
    </div>
  )
}

import { useTranslations } from 'next-intl'

export default function About() {
  const t = useTranslations('')
  return (
    <div className="flex justify-center items-center min-h-[40vh]">
      <div
        className="text-gray-300 text-lg md:text-2xl shadow-lg bg-black/20 rounded-xl px-8 py-6 backdrop-blur-md max-w-2xl mx-auto text-center"
      >
        {t('This_is_a_simple_about_page_just_to_show_how_you_can_use_the_internationalization_in_different_pages')}
      </div>
    </div>
  )
}

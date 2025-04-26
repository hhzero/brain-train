import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  rounded?: boolean
  size?: 'small' | 'medium' | 'large'
  type?: 'button' | 'submit' | 'reset'
  onBlur?: () => void
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  onClick,
  variant = 'primary',
  rounded = false,
  size = 'medium',
  type = 'button',
  onBlur
}) => {
  let sizeClasses = ''
  switch (size) {
    case 'small':
      sizeClasses = 'px-3 py-1 text-sm'
      break
    case 'medium':
      sizeClasses = 'px-4 py-2'
      break
    case 'large':
      sizeClasses = 'px-6 py-3 text-lg'
      break
  }

  let variantClasses = ''
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-cyan-600 text-white hover:bg-cyan-700'
      break
    case 'secondary':
      variantClasses = 'bg-gray-800 bg-opacity-50 text-cyan-300 hover:bg-gray-700 border border-cyan-700'
      break
  }

  return (
    <button
      type={type}
      onClick={onClick}
      onBlur={onBlur}
      className={`${sizeClasses} ${variantClasses} ${
        rounded ? 'rounded-full' : 'rounded-md'
      } transition-colors duration-300 ${className}`}
    >
      {children}
    </button>
  )
}

export default Button

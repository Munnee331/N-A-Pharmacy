import { cn } from '../../utils/cn'

// Vertical padding scale
const pyClasses = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16 lg:py-24',
  xl: 'py-24 lg:py-32',
}

/**
 * Layout wrapper that enforces consistent max-width, horizontal padding,
 * and optional vertical spacing across all pages.
 *
 * @param {object} props
 * @param {React.ElementType} props.as - Semantic HTML element (default: 'section')
 * @param {'sm'|'md'|'lg'|'xl'} props.py - Vertical padding preset (default: 'md')
 * @param {string} props.className
 * @param {React.ReactNode} props.children
 */
export default function SectionContainer({
  as: Tag = 'section',
  py = 'md',
  className,
  children,
  ...rest
}) {
  return (
    <Tag
      className={cn(
        'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        pyClasses[py],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

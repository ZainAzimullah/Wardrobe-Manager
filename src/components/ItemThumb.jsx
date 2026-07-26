import { colourStyle } from '../utils/colours'

const SIZE_CLASSES = {
  xs: 'w-5 h-5',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
}

// Renders the saved photo when present; falls back to the existing colour
// swatch otherwise. This keeps every screen working unchanged for items
// that predate photo upload.
export default function ItemThumb({ item, size = 'md', shape = 'circle', className = '' }) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md
  const shapeClass = shape === 'square' ? 'rounded-xl' : 'rounded-full'

  if (item?.photo) {
    return (
      <img
        src={item.photo}
        alt={item.name || 'Clothing item photo'}
        className={`${sizeClass} ${shapeClass} object-cover flex-shrink-0 border border-gray-100 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} ${shapeClass} flex-shrink-0 ${className}`}
      style={colourStyle(item?.colour)}
    />
  )
}

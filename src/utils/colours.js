export const COLOURS = ['White', 'Black', 'Navy', 'Grey', 'Brown', 'Green', 'Blue', 'Red', 'Other']

const HEX = {
  White: '#FFFFFF',
  Black: '#111827',
  Navy: '#1B2A4A',
  Grey: '#6B7280',
  Brown: '#78350F',
  Green: '#15803D',
  Blue: '#1D4ED8',
  Red: '#DC2626',
  Other: '#E5E7EB',
}

export function colourStyle(colour) {
  const bg = HEX[colour] || '#E5E7EB'
  const needsBorder = colour === 'White' || colour === 'Other' || !HEX[colour]
  return {
    backgroundColor: bg,
    border: needsBorder ? '1px solid #D1D5DB' : 'none',
  }
}

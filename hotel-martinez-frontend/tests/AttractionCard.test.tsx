import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, jest } from '@jest/globals'
import AttractionCard from '../src/components/AttractionCard'
import type { Attraction } from '../src/types/local'

const sampleAttraction: Attraction = {
  id: 'attr-test-1',
  name: 'Test Place',
  slug: 'test-place',
  shortDescription: 'Short description',
  description: 'Long description',
  category: 'culture',
  tags: ['museum'],
  coords: { lat: 43.5, lng: 7.0 },
  distanceKm: 1.2,
  priceType: 'budget',
  openingHours: {
    monday: '09:00-18:00',
    tuesday: '09:00-18:00',
    wednesday: '09:00-18:00',
    thursday: '09:00-18:00',
    friday: '09:00-18:00',
    saturday: '10:00-18:00',
    sunday: '10:00-18:00',
  },
  rating: 4.6,
  popularity: 82,
  images: ['https://example.com/image.jpg'],
  partnerContact: {
    phone: '+33 1 11 11 11',
    email: 'sample@example.com',
  },
}

describe('AttractionCard', () => {
  it('calls favorite handler when button is clicked', () => {
    const onToggleFavorite = jest.fn()

    render(
      <AttractionCard
        attraction={sampleAttraction}
        isFavorite={false}
        viewMode="grid"
        onToggleFavorite={onToggleFavorite}
        onOpenDetails={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /добавить в избранное/i }))
    expect(onToggleFavorite).toHaveBeenCalledWith('attr-test-1')
  })
})

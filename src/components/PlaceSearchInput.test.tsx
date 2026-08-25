import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PlaceSearchInput } from './PlaceSearchInput'

describe('PlaceSearchInput', () => {
  it('offers searchable Indian place suggestions and reports an exact selection', () => {
    const onPlaceSelect = vi.fn()
    render(<PlaceSearchInput aria-label="Place" onPlaceSelect={onPlaceSelect} />)
    const input = screen.getByLabelText('Place')
    const list = document.getElementById(input.getAttribute('list') ?? '')

    expect(list?.querySelector('option[value="Bengaluru"]')).not.toBeNull()
    fireEvent.change(input, { target: { value: 'Bengaluru' } })
    expect(onPlaceSelect).toHaveBeenCalledWith(expect.objectContaining({ district: 'Bengaluru Urban', state: 'Karnataka' }))
  })

  it('allows a free-form village that is not in the suggestion catalogue', () => {
    render(<PlaceSearchInput aria-label="Free-form place" />)
    const input = screen.getByLabelText('Free-form place')
    fireEvent.change(input, { target: { value: 'My village' } })
    expect(input).toHaveValue('My village')
  })
})

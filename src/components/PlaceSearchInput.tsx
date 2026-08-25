'use client'

import { forwardRef, useId, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { findIndianPlace, indianPlaces, type IndianPlace } from '../data/indian-places'

interface PlaceSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'list'> {
  onPlaceSelect?: (place: IndianPlace) => void
}

export const PlaceSearchInput = forwardRef<HTMLInputElement, PlaceSearchInputProps>(function PlaceSearchInput(
  { onChange, onPlaceSelect, ...props },
  ref,
) {
  const listId = `indian-places-${useId().replaceAll(':', '')}`

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event)
    const place = findIndianPlace(event.currentTarget.value)
    if (place) onPlaceSelect?.(place)
  }

  return <span className="place-search">
    <span className="place-search__icon" aria-hidden="true">⌕</span>
    <input {...props} ref={ref} list={listId} onChange={handleChange} />
    <datalist id={listId}>
      {indianPlaces.map((place) => <option key={`${place.name}-${place.state}`} value={place.name}>{place.district}, {place.state}</option>)}
    </datalist>
  </span>
})

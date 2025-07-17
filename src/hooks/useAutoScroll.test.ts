import { renderHook } from '@testing-library/react'
import useAutoScroll from '@/hooks/useAutoScroll'
import React from 'react'

/** Simple component to obtain ref */

const createRef = () => {
  const div = document.createElement('div')
  return {
    element: div,
    ref: { current: div } as React.RefObject<HTMLDivElement>,
  }
}

describe('useAutoScroll', () => {
  test('calls scrollIntoView when dependency changes', () => {
    const { element, ref } = createRef()
    const spy = jest.fn()
    element.scrollIntoView = spy

    const { rerender } = renderHook(({ dep }) => useAutoScroll(dep, ref), {
      initialProps: { dep: 1 },
    })
    expect(spy).toHaveBeenCalledTimes(1)

    rerender({ dep: 2 })
    expect(spy).toHaveBeenCalledTimes(2)
  })

  test('does not throw when ref is null', () => {
    const ref = { current: null } as unknown as React.RefObject<HTMLDivElement>
    renderHook(() => useAutoScroll(1, ref))
    // no scrollIntoView call possible
  })
})

import { useEffect } from 'react'

const useAutoScroll = (
  dependency: any,
  ref: React.RefObject<HTMLDivElement | null>
) => {
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [dependency, ref])
}

export default useAutoScroll

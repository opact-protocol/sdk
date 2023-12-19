export const debounce = (fn: any, time: number) => {
  let timeoutId: any

  return wrapper

  function wrapper (...args: any) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      timeoutId = null
      fn(...args)
    }, time)
  }
}

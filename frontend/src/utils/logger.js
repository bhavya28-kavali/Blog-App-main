export const log = (...args) => {
  if (import.meta.env.MODE !== 'production') console.log(...args)
}

export const logError = (...args) => {
  if (import.meta.env.MODE !== 'production') console.error(...args)
}

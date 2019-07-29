export default function (currentMode = null) {
  if (currentMode) return 'print'

  if (document.documentElement.clientWidth >= 820) {
    return 'desktop'
  }
  return 'mobile'
}

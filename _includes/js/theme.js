const themeKey = 'theme-preference';

const onClick = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  setPreference();
}

const getColorPreference = () => {
  if (localStorage.getItem(themeKey)) return localStorage.getItem(themeKey)
  else return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const setPreference = () => {
  localStorage.setItem(themeKey, theme.value)
  reflectPreference()
}

const reflectPreference = () => {
  document.firstElementChild.setAttribute('data-theme', theme.value)
  document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value)
}

const theme = {
  value: getColorPreference(),
}

reflectPreference()

window.onload = () => {
  reflectPreference()

  document.querySelector('#theme-toggle').addEventListener('click', onClick)
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({matches:isDark}) => {
  theme.value = isDark ? 'dark' : 'light'
  setPreference()
})
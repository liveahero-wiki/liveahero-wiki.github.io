const themeKey = 'theme-preference';

const getColorPreference = () => {
  if (localStorage.getItem(themeKey)) return localStorage.getItem(themeKey);
  else return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const setPreference = () => {
  localStorage.setItem(themeKey, theme.value);
  reflectPreference();
};

const reflectPreference = () => {
  document.firstElementChild.setAttribute('data-theme', theme.value);
  document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value);
};

const theme = {
  value: getColorPreference(),
};

reflectPreference();

document.addEventListener('DOMContentLoaded', () => {
  reflectPreference();

  document.querySelector('#theme-toggle').addEventListener('click', () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    setPreference();
  });
};

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({matches:isDark}) => {
  theme.value = isDark ? 'dark' : 'light';
  setPreference();
});
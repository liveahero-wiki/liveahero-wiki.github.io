// The preview shows what the contributor is typing inside the editor dialog, so the html is cleaned first: no scripts,
// frames, event handlers or javascript: links, even though the guard already refuses to submit such markup.

const DROP = 'script, iframe, object, embed, link, meta, base, form, noscript, style'

export function sanitizePreview(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}`, 'text/html')
  doc.querySelectorAll(DROP).forEach((el) => el.remove())
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase().replace(/[\u0000- ]+/g, '')
      if (name.startsWith('on') || name === 'srcdoc' || name === 'style' || ((name === 'href' || name === 'src' || name === 'xlink:href' || name === 'action' || name === 'formaction') && /^(?:javascript|data|vbscript):/.test(value) && !/^data:image\/(?:png|jpe?g|gif|webp);/.test(value))) {
        el.removeAttribute(attr.name)
      }
    }
    if (el.tagName === 'A') {
      // the preview is inert: in-page anchors do nothing (the page behind the dialog must not scroll), other links open in a new tab
      if (el.getAttribute('href')?.startsWith('#')) el.removeAttribute('href')
      else {
        el.setAttribute('target', '_blank')
        el.setAttribute('rel', 'noopener noreferrer')
      }
    }
  })
  return doc.body.innerHTML
}

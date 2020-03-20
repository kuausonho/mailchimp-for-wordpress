const mc4wp = window.mc4wp || {}

// init conditional element logic
require('./forms/conditional-elements.js')

// rewrite early-hooked listeners for backwards compatibility
for (let i = 0; i < mc4wp.listeners.length; i++) {
  const l = mc4wp.listeners[i]
  document.addEventListener('mc4wp.' + l.event, l.callback)
}

function trigger (el, evtName, args) {
  document.dispatchEvent(new CustomEvent('mc4wp.' + evtName, args))
}

document.addEventListener('submit', (evt) => {
  const el = evt.target
  if (!el || !el.className || el.className.indexOf('mc4wp-form') === -1) {
    return
  }

  trigger(el, 'submitted')
})

mc4wp.forms = {
  trigger
}

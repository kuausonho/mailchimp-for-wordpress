import scrollToElement from './misc/scroll-to-element.js'
const submittedForm = window.mc4wp_submitted_form
const forms = window.mc4wp.forms
const populate = require('populate.js')

function handleFormRequest (el, evtName, errors, data) {

  const trigger = (evtName, args) => {
    forms.trigger(el, args[0].id + '.' + evtName, args)
    forms.trigger(el, evtName, args)
  }
  const timeStart = Date.now()
  const pageHeight = document.body.clientHeight

  // re-populate form if an error occurred
  if (errors) {
    populate(el, data)
  }

  // scroll to form
  if (window.scrollY <= 10 && submittedForm.auto_scroll) {
    scrollToElement(el)
  }

  // trigger events on window.load so all other scripts have loaded
  window.addEventListener('load', function () {
    const form = {
      name: el.getAttribute('data-name'),
      id: el.getAttribute('data-id')
    }

    trigger('submitted', [form])

    if (errors) {
      trigger('error', [form, errors])
    } else {
      // form was successfully submitted
      trigger('success', [form, data])

      // subscribed / unsubscribed
      trigger(evtName, [form, data])

      // for BC: always trigger "subscribed" event when firing "updated_subscriber" event
      if (evtName === 'updated_subscriber') {
        trigger('subscribed', [form, data, true])
      }
    }

    // scroll to form again if page height changed since last scroll, eg because of slow loading images
    // (only if load didn't take too long to prevent overtaking user scroll)
    const timeElapsed = Date.now() - timeStart
    if (submittedForm.auto_scroll && timeElapsed > 1000 && timeElapsed < 2000 && document.body.clientHeight !== pageHeight) {
      scrollToElement(el)
    }
  })
}

if (submittedForm) {
  handleFormRequest(document.getElementById(submittedForm.element_id), submittedForm.event, submittedForm.errors, submittedForm.data)
}

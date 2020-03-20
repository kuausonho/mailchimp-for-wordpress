(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var mc4wp = window.mc4wp || {}; // init conditional element logic

require('./forms/conditional-elements.js'); // rewrite early-hooked listeners for backwards compatibility


for (var i = 0; i < mc4wp.listeners.length; i++) {
  var l = mc4wp.listeners[i];
  document.addEventListener('mc4wp.' + l.event, l.callback);
}

function trigger(el, evtName, args) {
  document.dispatchEvent(new CustomEvent('mc4wp.' + evtName, args));
}

document.addEventListener('submit', function (evt) {
  var el = evt.target;

  if (!el || !el.className || el.className.indexOf('mc4wp-form') === -1) {
    return;
  }

  trigger(el, 'submitted');
});
mc4wp.forms = {
  trigger: trigger
};

},{"./forms/conditional-elements.js":2}],2:[function(require,module,exports){
"use strict";

function getFieldValues(form, fieldName) {
  var values = [];
  var inputs = form.querySelectorAll('input[name="' + fieldName + '"],select[name="' + fieldName + '"],textarea[name="' + fieldName + '"]');

  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];

    if ((input.type === 'radio' || input.type === 'checkbox') && !input.checked) {
      continue;
    }

    values.push(input.value);
  }

  return values;
}

function findForm(element) {
  var bubbleElement = element;

  while (bubbleElement.parentElement) {
    bubbleElement = bubbleElement.parentElement;

    if (bubbleElement.tagName === 'FORM') {
      return bubbleElement;
    }
  }

  return null;
}

function toggleElement(el) {
  var show = !!el.getAttribute('data-show-if');
  var conditions = show ? el.getAttribute('data-show-if').split(':') : el.getAttribute('data-hide-if').split(':');
  var fieldName = conditions[0];
  var expectedValues = (conditions.length > 1 ? conditions[1] : '*').split('|');
  var form = findForm(el);
  var values = getFieldValues(form, fieldName); // determine whether condition is met

  var conditionMet = false;

  for (var i = 0; i < values.length; i++) {
    var value = values[i]; // condition is met when value is in array of expected values OR expected values contains a wildcard and value is not empty

    conditionMet = expectedValues.indexOf(value) > -1 || expectedValues.indexOf('*') > -1 && value.length > 0;

    if (conditionMet) {
      break;
    }
  } // toggle element display


  if (show) {
    el.style.display = conditionMet ? '' : 'none';
  } else {
    el.style.display = conditionMet ? 'none' : '';
  } // find all inputs inside this element and toggle [required] attr (to prevent HTML5 validation on hidden elements)


  var inputs = el.querySelectorAll('input,select,textarea');
  [].forEach.call(inputs, function (el) {
    if ((conditionMet || show) && el.getAttribute('data-was-required')) {
      el.required = true;
      el.removeAttribute('data-was-required');
    }

    if ((!conditionMet || !show) && el.required) {
      el.setAttribute('data-was-required', 'true');
      el.required = false;
    }
  });
} // evaluate conditional elements globally


function evaluate() {
  var elements = document.querySelectorAll('.mc4wp-form [data-show-if],.mc4wp-form [data-hide-if]');
  [].forEach.call(elements, toggleElement);
} // re-evaluate conditional elements for change events on forms


function handleInputEvent(evt) {
  if (!evt.target || !evt.target.form || evt.target.form.className.indexOf('mc4wp-form') < 0) {
    return;
  }

  var form = evt.target.form;
  var elements = form.querySelectorAll('[data-show-if],[data-hide-if]');
  [].forEach.call(elements, toggleElement);
}

document.addEventListener('keyup', handleInputEvent, true);
document.addEventListener('change', handleInputEvent, true);
document.addEventListener('mc4wp-refresh', evaluate, true);
window.addEventListener('load', evaluate);
evaluate();

},{}]},{},[1]);

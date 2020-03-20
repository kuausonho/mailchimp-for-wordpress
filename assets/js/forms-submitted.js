(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _scrollToElement = _interopRequireDefault(require("./misc/scroll-to-element.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var submittedForm = window.mc4wp_submitted_form;
var forms = window.mc4wp.forms;

var populate = require('populate.js');

function handleFormRequest(el, evtName, errors, data) {
  var trigger = function trigger(evtName, args) {
    forms.trigger(el, args[0].id + '.' + evtName, args);
    forms.trigger(el, evtName, args);
  };

  var timeStart = Date.now();
  var pageHeight = document.body.clientHeight; // re-populate form if an error occurred

  if (errors) {
    populate(el, data);
  } // scroll to form


  if (window.scrollY <= 10 && submittedForm.auto_scroll) {
    (0, _scrollToElement["default"])(el);
  } // trigger events on window.load so all other scripts have loaded


  window.addEventListener('load', function () {
    var form = {
      name: el.getAttribute('data-name'),
      id: el.getAttribute('data-id')
    };
    trigger('submitted', [form]);

    if (errors) {
      trigger('error', [form, errors]);
    } else {
      // form was successfully submitted
      trigger('success', [form, data]); // subscribed / unsubscribed

      trigger(evtName, [form, data]); // for BC: always trigger "subscribed" event when firing "updated_subscriber" event

      if (evtName === 'updated_subscriber') {
        trigger('subscribed', [form, data, true]);
      }
    } // scroll to form again if page height changed since last scroll, eg because of slow loading images
    // (only if load didn't take too long to prevent overtaking user scroll)


    var timeElapsed = Date.now() - timeStart;

    if (submittedForm.auto_scroll && timeElapsed > 1000 && timeElapsed < 2000 && document.body.clientHeight !== pageHeight) {
      (0, _scrollToElement["default"])(el);
    }
  });
}

if (submittedForm) {
  handleFormRequest(document.getElementById(submittedForm.element_id), submittedForm.event, submittedForm.errors, submittedForm.data);
}

},{"./misc/scroll-to-element.js":2,"populate.js":3}],2:[function(require,module,exports){
"use strict";

function scrollTo(element) {
  var x = window.pageXOffset || document.documentElement.scrollLeft;
  var y = calculateScrollOffset(element);
  window.scrollTo(x, y);
}

function calculateScrollOffset(elem) {
  var body = document.body;
  var html = document.documentElement;
  var elemRect = elem.getBoundingClientRect();
  var clientHeight = html.clientHeight;
  var documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
  var scrollPosition = elemRect.bottom - clientHeight / 2 - elemRect.height / 2;
  var maxScrollPosition = documentHeight - clientHeight;
  return Math.min(scrollPosition + window.pageYOffset, maxScrollPosition);
}

module.exports = scrollTo;

},{}],3:[function(require,module,exports){

/**
 * Populate form fields from a JSON object.
 *
 * @param form object The form element containing your input fields.
 * @param data array JSON data to populate the fields with.
 * @param basename string Optional basename which is added to `name` attributes
 */
function populate(form, data, basename) {
	for (var key in data) {
		if (! data.hasOwnProperty(key)) {
			continue;
		}

		var name = key;
		var value = data[key];

        if ('undefined' === typeof value) {
            value = '';
        }

        if (null === value) {
            value = '';
        }

		// handle array name attributes
		if (typeof(basename) !== "undefined") {
			name = basename + "[" + key + "]";
		}

		if (value.constructor === Array) {
			name += '[]';
		} else if(typeof value == "object") {
			populate(form, value, name);
			continue;
		}

		// only proceed if element is set
		var element = form.elements.namedItem(name);
		if (! element) {
			continue;
		}

		var type = element.type || element[0].type;

		switch(type ) {
			default:
				element.value = value;
				break;

			case 'radio':
			case 'checkbox':
				for (var j=0; j < element.length; j++) {
					element[j].checked = (value.indexOf(element[j].value) > -1);
				}
				break;

			case 'select-multiple':
				var values = value.constructor == Array ? value : [value];

				for(var k = 0; k < element.options.length; k++) {
					element.options[k].selected |= (values.indexOf(element.options[k].value) > -1 );
				}
				break;

			case 'select':
			case 'select-one':
				element.value = value.toString() || value;
				break;

			case 'date':
      			element.value = new Date(value).toISOString().split('T')[0];	
				break;
		}

	}
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = populate;
} 
},{}]},{},[1]);

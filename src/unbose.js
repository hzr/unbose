var Unbose = (function(window, document) {
/**
 * Class: Unbose
 *
 * Subject can be a CSS selector (string), array (presumed to be of elements),
 * element, document fragment or an Unbose object.
 *
 */
function Unbose(subject, context) {
    if (! (this instanceof Unbose)) {
        return new Unbose(subject, context);
    }

    /**
     * Variable: length
     *
     * The number of elements in the Unbose object
     */
    this.length = 0;
    this._elements = [];

    if (!subject) { return this; }

    // "body" is common and there's only one, so optimize for it
    if (subject == "body" && !context && document.body) {
        this._elements[0] = this[0] = document.body;
        this.length = 1;
        return this;
    }

    if (typeof subject == "string") {
        this._elements = slice.call((context || document).querySelectorAll(subject));
    }
    else if (Array.isArray(subject)) {
        this._elements = subject;
    }
    else if (subject.nodeType == 1 /*ELEMENT*/ || subject.nodeType == 9 /*DOCUMENT_NODE*/) {
        this._elements[0] = this[0] = subject;
        this.length = 1;
        return this;
    }
    else if (subject.nodeType == 3 /*TEXT_NODE*/) {
        this._elements[0] = this[0] = subject.parentNode;
        this.length = 1;
        return this;
    }
    else if (subject.nodeType == 11 /*DOCUMENT_FRAGMENT_NODE*/) {
        var child = subject.firstChild;
        while (child) {
            if (child.nodeType == 1 /*ELEMENT*/) {
                this._elements.push(child);
            }
            child = child.nextSibling;
        }
    }
    else if (subject._elements != null) {
        this._elements = subject._elements;
    }
    else if (isFunction(subject)) {
        // Fails in Webkit if there's nothing after <head>, so make sure
        // there's always something explicit in <body>
        document.addEventListener("DOMContentLoaded", function ready(event) {
            subject(event);
        }, false);
    }

    // TODO: do something sane with Unbose(window). It should at least support width()/height()

    var eles = [];
    this._elements.forEach(function(ele) {
        if (eles.indexOf(ele) == -1) { // Filter duplicates
            eles[eles.length] = this[eles.length] = ele;
        }
    }, this);
    this._elements = eles;
    this.length = eles.length;
};

// http://www.whatwg.org/specs/web-apps/current-work/#space-character
var SPACE_CHARS = /[\x20\x09\x0A\x0C\x0D]+/g;
// TODO: there are more of these properties, find them all
var UNITLESS_PROPERTIES = ["font-weight", "line-height", "opacity", "z-index"];
var VENDOR_PREFIXES = ["moz", "ms", "o", "webkit"];

// Cache some methods
var toString = Object.prototype.toString;
var slice = Array.prototype.slice;
var forEach = Array.prototype.forEach;

/**
 * Group: Helpers
 *
 */
Unbose.helpers = {
    /**
     * Method: expandName
     *
     * Parameters:
     *
     *   name - The event name
     *
     * Expands an event name for use with on():
     * "transitionEnd" -> "transitionEnd mozTransitionEnd msTransitionEnd oTransitionEnd webkitTransitionEnd"
     */
    expandName: function(name) {
        return VENDOR_PREFIXES.reduce(function(prev, next) {
            return prev + " " + next + name[0].toUpperCase() + name.slice(1);
        }, [name]);
    }
};

/**
 * Group: Support
 *
 */
Unbose.support = {
    /**
     * Boolean: classList
     *
     * Whether or not the user-agent support classList for elements
     */
    classList: (function() {
        return !!document.createElement("a").classList;
    })()
};

Unbose.prototype = {
    toString: function() {
        return "[object Unbose]";
    },

    _debug: function() {
        var ret = [];
        this.forEach(function(el) {
            ret.push(
                el.name() +
                (el.attr("id") ? "#" + el.attr("id") : "") +
                (el.attr("class") ? "." + el.attr("class").replace(/ /g, ".") : "")
            );
        });
        return "Length: " + this.length + "\n" +
               "Elements: " + ret.join(", ");
    },


    /**
     * Group: Events
     *
     * Methods for handling event
     */

    /**
     * Method: on
     *
     * Add event listeners to all elements in the set.
     *
     * Parameters:
     *
     *   types - Type of the event. To add multiple event handlers,
     *           separate them with a space.
     *   handler - Function called when event occurs
     *   capture - Use capturing
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    on: function(types, handler, capture) {
        types.split(" ").forEach(function(type) {
            this._elements.forEach(function(ele) {
                ele.addEventListener(type, handler, capture || false);
            });
        }, this);
        return this;
    },

    /**
     * Method: unbind
     *
     * Remove event listeners for all elements in the set.
     *
     * Parameters:
     *
     *   types - Type of the event. To add multiple event handlers,
     *           separate them with a space.
     *   handler - Function called when event occurs
     *   capture - Use capturing
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    unbind: function(types, handler, capture) {
        types.split(" ").forEach(function(type) {
            this._elements.forEach(function(ele) {
                ele.removeEventListener(type, handler, capture || false);
            });
        }, this);
        return this;
    },

    /**
     * Method: once
     *
     * Add an event listener to all elements in the set that will be called once
     * and then removed. If multiple events are supplied, all will be removed once
     * one of them is triggered.
     *
     * Parameters:
     *
     *   types - Type of the event. To attach multiple event handlers,
     *           separate them with a space.
     *   handler - Function called when event occurs
     *   capture - Use capturing
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    once: function(types, handler, capture) {
        function runOnce(event) {
            types.split(" ").forEach(function(type) {
                this.removeEventListener(type, runOnce, capture);
            }, this);
            handler.call(this, event);
        }
        return this.on(types, runOnce, capture);
    },

    /**
     * Method: delegate
     *
     * Delegate events to child elements.
     *
     * Parameters:
     *
     *   types - Type of the event. To attach multiple event handlers,
     *           separate them with a space.
     *   selector - The elements to delegate events to
     *   handler - Function called when the event occurs
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    delegate: function(types, selector, handler) {
        return this.on(types, function(event) {
            var target = new Unbose(event.target).closest(selector)[0];
            if (target) {
                handler.call(target, event);
            }
        });
    },


    // TODO: method to undelegate events


    /**
     * Group: Finding and traversing
     *
     * Methods for finding elements and traversing the DOM
     */

    /**
     * Method: add
     *
     * Adds additional elements to the set.
     *
     * Parameters:
     *
     *   eles - The elements to insert. Can be a selector, an element,
     *          or an Unbose object
     *
     * Returns:
     *
     *   An Unbose object
     *
     * TODO:
     *
     *   Should maybe filter out duplicates here, e.g. if body is added twice.
     *   Should probably also have an index parameter to insert stuff at a
     *   specific position.
     */
    add: function(eles) {
        // FIXME: this is wrong, send it through Unbose instead
        this._elements = this._elements.concat(new Unbose(eles)._elements);
        this.length = this._elements.length;
        return this;
    },

    /**
     * Method: forEach
     *
     * Call a function for all elements in the set.
     *
     * Parameters:
     *
     *   callback - The function to call. The signature is
     *              callback(unboseElement, index, array). Inside the callback,
     *              `this` points to the DOM element.
     *   context - (optional) The value of `this` for the function calls
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    forEach: function(callback, context) {
        this._elements.forEach(function(ele, idx, array) {
            callback.call(context || ele, new Unbose(ele), idx, array);
        });
        return this;
    },

    /**
     * Method: filter
     *
     * Filters the set of element by mathing them against the given selector.
     *
     * Parameters:
     *
     *   selector - The selector to filter the set against.
     *
     * Returns:
     *
     *   An Unbose object
     */
    filter: function(selector) {
        var eles = this._elements;
        if (selector != null) {
            eles = eles.filter(function(ele) {
                return new Unbose(ele).matchesSelector(selector);
            });
        }
        return new Unbose(eles);
    },

    /**
     * Method: find
     *
     * Find decendents of the elements that matches the given selector.
     *
     * Parameters:
     *
     *   selector - Selector used to find matching elements
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    find: function(selector) {
        var eles = [];
        this.forEach(function() {
            eles = eles.concat(new Unbose(selector, this)._elements);
        });
        return new Unbose(eles);
    },

    /**
     * Method: matchesSelector
     *
     * Check if an element matches a selector. Only checks the first
     * element in a set.
     *
     * Parameters:
     *
     *   selector - Selector to match the element against
     *
     * Returns:
     *
     *   True if the element matches the selector, false otherwise
     *
     */
    matchesSelector: function(selector) {
        return this[0].matchesSelector(selector);
    },

    /**
     * Method: name
     *
     * Get the element name of the first element in the set.
     *
     * Returns:
     *
     *   The name of the first element in the set. Name will always be lower
     *   case when returned.
     *
     */
    name: function() {
        return this[0] && this[0].nodeName.toLowerCase();
    },

    /**
     * Method: closest
     *
     * Get the closest element (current or ancestor) matching the
     * given filter.
     *
     * Parameters:
     *
     *   selector - A selector that filters the results
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <parent>
     *
     */
    closest: function(selector) {
        var eles = [];
        this._elements.forEach(function(ele) {
            while (ele && ele != document) {
                if (new Unbose(ele).matchesSelector(selector)) {
                    eles.push(ele);
                    break;
                }
                ele = ele.parentNode;
            }
        });
        return new Unbose(eles);
    },

    /**
     * Method: ancestors
     *
     * Find all ancestors, parent, grandparent and so on, matching the 
     * given selector, to the elements in the set.
     *
     * Parameters:
     *
     *   selector - A selector that filters the results
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <parent>, <closest>
     *
     */
    ancestors: function(selector) {
        var eles = [];
        this._elements.forEach(function(ele) {
            while ((ele = ele.parentNode) && ele != document) {
                eles.push(ele);
            }
        });
        return new Unbose(eles).filter(selector);
    },

    /**
     * Method: parent
     *
     * Get the elements parents. This applies to immediate parents, as
     * opposed to <ancestors>
     *
     * Parameters:
     *
     *   selector - A selector that filters the results
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <children>, <ancestors>
     *
     */
    parent: function(selector) {
        var eles = [];
        this._elements.forEach(function(ele) {
            ele = ele.parentNode;
            if (ele && ele != document) {
                eles.push(ele);
            }
        });
        return new Unbose(eles).filter(selector);
    },

    /**
     * Method: children
     *
     * Get the elements child elements.
     *
     * Parameters:
     *
     *   selector - A selector that filters the results
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <parent>
     *
     */
    children: function(selector) {
        var eles = [];
        this._elements.forEach(function(ele) {
            ele = ele.firstElementChild;
            while (ele) {
                eles.push(ele);
                ele = ele.nextElementSibling;
            }
        });
        return new Unbose(eles).filter(selector);
    },

    /**
     * Method: siblings
     *
     * Get the siblings of the elements in the set.
     *
     * Parameters:
     *
     *   selector - A selector that filters the results
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    siblings: function(selector) {
        var eles = [];
        this._elements.forEach(function(ele) {
            var child = ele.parentNode.firstElementChild;
            while (child) {
                if (child != ele) {
                    eles.push(child);
                }
                child = child.nextElementSibling;
            }
        });
        return new Unbose(eles).filter(selector);
    },

    /**
     * Method: first
     *
     * Get the first element in the set.
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <last>, <nth>
     *
     */
    first: function() {
        return new Unbose(this[0]);
    },

    /**
     * Method: last
     *
     * Get the last element in the set.
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <first>, <nth>
     *
     */
    last: function() {
        return new Unbose(this[this.length-1]);
    },

    /**
     * Method: prev
     *
     * Get the previous siblings of the elements in the set.
     *
     * Returns:
     *
     *   An Unbose object
     *
     * Parameters:
     *
     *   selector - A selector that filters the results
     *
     * See also:
     *
     *   <next>
     *
     */
    prev: function(selector) {
        var eles = [];
        this._elements.forEach(function(ele) {
            ele = ele.previousElementSibling;
            if (ele) { eles.push(ele); }
        });
        return new Unbose(eles).filter(selector);
    },

    /**
     * Method: next
     *
     * Get the next siblings of the elements in the set.
     *
     * Parameters:
     *
     *   selector - A selector that filters the results
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <prev>
     *
     */
    next: function(selector) {
        var eles = [];
        this._elements.forEach(function(ele) {
            ele = ele.nextElementSibling;
            if (ele) { eles.push(ele); }
        });
        return new Unbose(eles).filter(selector);
    },

    /**
     * Method: nth
     *
     * Returns the nth element in the set.
     *
     * Parameters:
     *
     *   index - The index of the element in the set
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <first>, <last>
     *
     */
    nth: function(index) {
        return new Unbose(this.elem(index));
    },

    /**
     * Method: elem
     *
     * Returns DOM elements. If the index parameter is given, returns the
     * nth element in the set. Otherwise, returns an array of all DOM elements
     * in the set.
     *
     * Parameters:
     *
     *   index - The index of the element in the set
     *
     * Returns:
     *
     *   A DOM element or an array of DOM elements
     *
     * Note:
     *
     *   Returns the internal array of elements.
     *
     */
    elem: function(index) {
        if (index < 0) { index = (index % this.length) + this.length; }
        return (index == null) ? this._elements : this[index];
    },

    /**
     * Method: slice
     *
     * Returns a subset of elements, starting with element `start` and upto
     * but not including element `end`. If the step parameter is provided,
     * every nth element in the subset will be returned, where n = `step`.
     * The slice method behaves like Array.prototype.slice with the added
     * behavior of steps.
     *
     * Parameters:
     *
     *   start - The start index
     *   end - (optional) The end index
     *   step - (optional) The step between each element (default is 1)
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    slice: function(start, end, step) {
        var eles = this._elements.slice(start, end);
        if (step) {
            eles = eles.filter(function(ele, idx) {
                return !(idx % step);
            });
        }
        return new Unbose(eles);
    },


    /**
     * Group: DOM
     *
     * Methods for manipulating and "querying" the DOM
     */

    /**
     * Method: hasClass
     *
     * Check if the elements in the set has a specific class.
     *
     * Parameters:
     *
     *   cls - The class name to check for
     *
     * Returns:
     *
     *   True if all the elements in the set has the class, false othwerwise
     *
     * See also:
     *
     *   <removeClass>, <addClass>, <toggleClass>
     *
     */
    hasClass: function(cls) {
        return this._elements.some(function(ele) {
            return ele.className.split(SPACE_CHARS).indexOf(cls) != -1;
        });
    },

    /**
     * Method: addClass
     *
     * Add a class to all elements in the set.
     *
     * Parameters:
     *
     *   cls - A space separated list of class names to add to the element
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <removeClass>, <hasClass>, <toggleClass>
     *
     */
    addClass: function(cls) {
        return this.forEach(function(ele) {
            if (!ele.hasClass(cls)) { this.className += " " + cls; }
        });
    },

    /**
     * Method: removeClass
     *
     * Removes a class from all elements in the set.
     *
     * Parameters:
     *
     *   cls - A space separated list of class names to remove from the element
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <addClass>, <hasClass>, <toggleClass>
     *
     */
    removeClass: function(cls) {
        var classes = cls.split(SPACE_CHARS);
        this._elements.forEach(function(ele) {
            ele.className = ele.className.split(SPACE_CHARS).filter(function(cls) {
                return classes.indexOf(cls) == -1;
            }).join(" ");
        });
        return this;
    },

    /**
     * Method: toggleClass
     *
     * Add class name if it's not set, remove it otherwise.
     *
     * Parameters:
     *
     *   cls - The class name to toggle
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <addClass>, <hasClass>, <removeClass>
     *
     */
    toggleClass: function(cls) {
        return this.forEach(function(ele) {
            cls.split(SPACE_CHARS).forEach(function(cls) {
                ele[ele.hasClass(cls) ? "removeClass" : "addClass"](cls);
            });
        });
    },

    /**
     * Method: append
     *
     * Append an element, an Unbose object or a template.
     * Append adds the element after the last child element.
     * append(thing) is a cleaner shorthand for insert(thing, true)
     *
     * Note that when appending an element to several elements, event
     * listeners will be removed.
     *
     * Parameters:
     *
     *   thing - Thing to add
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <insert>
     *
     */
    append: function(thing) {
        return this.insert(thing, true);
    },

    /**
     * Method: insert
     *
     * Insert an element, an Unbose object or a template.
     * By default, add it as the first child of the parent. If the
     * append argument is true, the element is appended as the last child
     * element instead.
     *
     * Note that when inserting an element to several elements, event
     * listeners will be removed.
     *
     * Parameters:
     *
     *   thing - Thing to add
     *   append - Append instead of insert
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    insert: function(thing, append) {
        if (isElement(thing)) {
            return this._insertElem(thing, append);
        }
        else if (Array.isArray(thing)) {
            return this._insertElem(eleFromTpl(thing), append);
        }
        else if (thing._elements != null) { // thing is an unbose object
            return thing._elements.forEach(function(e) {
                this._insertElem(e, append);
            }, this);
        }
        else {
            return this;
        }
    },

    /**
     * Private method: _insertElem
     *
     * Insert an element into all elements. If there are multiple elements
     * in the Unbose object, insert clones (this means that any event
     * listeners will be removed).
     *
     * Parameters:
     *
     *   newEle - Element to add
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    _insertElem: function(newEle, append) {
         this._elements.forEach(function(ele) {
             if (!append && ele.firstChild) {
                 this.length > 1 ?
                     ele.insertBefore(newEle.cloneNode(true), ele.firstChild) :
                     ele.insertBefore(newEle, ele.firstChild);
             }
             else {
                 this.length > 1 ?
                     ele.appendChild(newEle.cloneNode(true)) :
                     ele.appendChild(newEle);
             }
         }, this);
         return this;
     },

    /**
     * Method: attr
     *
     * Set or get an attribute value. If value is given, set it. If not,
     * just return current value. On getting, if the attribute does not
     * exist, returns undefined.
     *
     * Parameters:
     *
     *   name - Attribute to get or set
     *   val - (optional) Value to set to
     *
     * Returns:
     *
     *   An Unbose object or an attribute
     *
     * See also:
     *
     *   <removeAttr>
     *
     */
    attr: function(name, val) {
        if (val == null) {
            return this[0] && this[0].getAttribute(name);
        }
        else {
            return this._elements.forEach(function(ele) {
                ele.setAttribute(name, val);
            });
        }
    },

    /**
     * Method: removeAttr
     *
     * Remove an attribute from all the elements in the set.
     *
     * Parameters:
     *
     *   attr - The name of the attribute to remove
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     *   <attr>
     *
     */
    removeAttr: function(attr) {
        return this._elements.forEach(function(ele) {
            ele.removeAttribute(attr);
        });
    },

    /**
     * Method: empty
     *
     * Remove all children of the elements in the set.
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    empty: function() {
        return this.text("");
    },

    /**
     * Method: remove
     *
     * Remove the set of elements.
     *
     * Parameters:
     *
     *   selector - Only remove elements that matches the selector
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    remove: function(selector) {
        return this.filter(selector)._elements.forEach(function(ele) {
            var parent = ele.parentNode;
            if (parent) {
                parent.removeChild(ele);
            }
        });
    },

    /**
     * Method: text
     *
     * Set or get the text of elements. If the text argument is given, the
     * text content of all elements in the set is updated. If the text argument
     * is not given, it returns the text content of the first element in
     * the set.
     *
     * Parameters:
     *
     *   text - (optional) New text content
     *
     * Returns:
     *
     *   An Unbose object or a string
     *
     */
    text: function(text) {
        if (text == null) {
            return (this[0] && this[0].textContent) || "";
        }
        else {
            return this._elements.forEach(function(ele) {
                ele.textContent = text;
            });
        }
    },

    /**
     * Method: val
     *
     * Set or get the value of elements. If the val argument is given, the
     * value of all elements in the set is updated. If the val argument
     * is not given, it returns the value of the first element in the set.
     *
     * Parameters:
     *
     *   val - (optional) The value to set
     *
     * Returns:
     *
     *   An Unbose object
     *
     * TODO:
     *
     *   This might need some special-casing for some elements.
     *   Need to look into that.
     *
     */
    val: function(val) {
        if (val == null) {
            return this[0] && this[0].value;
        }
        else {
            return this._elements.forEach(function(ele) {
                ele.value = val;
            });
        }
    },

    /**
     * Method: data
     *
     * Associate arbitrary data with this element.
     *
     * Parameters:
     *
     *   name - The name to get or set
     *   val - (optional) The value of the property to set
     *
     * Returns:
     *
     *   If a value is set, it returns an Unbose object, otherwise,
     *   it returns the value.
     *
     */
    data: function(name, prop) {
        if (prop == null) {
            return this[0] && this[0]["unbose-" + name];
        }

        return this.forEach(function() {
            this["unbose-" + name] = prop;
        });
    },


    /**
     * Group: Style
     *
     * Methods for getting and setting style for elements
     */

    /**
     * Method: style
     *
     * Set or get a CSS property.
     *
     * Parameters:
     *
     *   attr - Name of style attribute
     *   value - (optional) new value of style attribute
     *
     * Returns:
     *
     *   An Unbose object or a string
     *
     */
    style: function(attr, value) {
        if (typeof attr == "object") {
            return this._setStyles(attr);
        }
        else if (value === undefined) {
            return this._getStyle(attr);
        }
        else {
            return this._setStyle(attr, value);
        }
    },

    /**
     * Private method: _getStyle
     *
     * Get the style value of the first element of the set
     *
     * Parameters:
     *
     *   prop - The name of the style attribute
     *
     * FIXME:
     *
     *   What if not in dom? Fall back to .style?
     *   Should there be any kind of normalization? colors are hex in
     *   opera and rgb in chrome/ff
     *
     */
    _getStyle: function(prop) {
        var ele = this[0];
        if (!ele) { return undefined; }
        return ele.ownerDocument.defaultView
                                .getComputedStyle(ele, null)
                                .getPropertyValue(prop);
    },

    /**
     * Private method: _setStyle
     *
     * Set the style for the elements in the set
     *
     * Parameters:
     *
     *   prop - The property to set
     *   value - The value of the property to set
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    _setStyle: function(prop, value) {
        if (+value === parseFloat(value) && UNITLESS_PROPERTIES.indexOf(prop) == -1) {
            // Gecko returns non-rounded values for getComputedStyle()
            // so round this before setting it.
            value = (+value | 0) + "px";
        }

        return this._elements.forEach(function(ele) {
            if (value != null) {
                ele.style.setProperty(prop, value, "important");
            }
            else {
                ele.style.removeProperty(prop);
            }
        });
    },

    /**
     * Private method: _setStyles
     *
     * Set several CSS properties at once.
     *
     * Parameters:
     *
     *   decls - An object of property/value pairs
     *
     * Returns:
     *
     *   An Unbose object
     */
    _setStyles: function(decls) {
        for (var prop in decls) {
            this._setStyle(prop, decls[prop]);
        }
        return this;
    },

    /**
     * Method: width
     *
     * Gets or sets the width of elements.
     *
     * Parameters:
     *
     *   value - (optional) Sets the width of the element
     *
     * Returns:
     *
     *   The width of the element, without padding and borders, in pixels
     *
     */
    width: function(value) {
        if (value == null) {
            if (!this[0]) { return 0; }
            return this._getDimensions().width -
                parseInt(this._getStyle("border-left-width"), 10) -
                parseInt(this._getStyle("border-right-width"), 10) -
                parseInt(this._getStyle("padding-left"), 10) -
                parseInt(this._getStyle("padding-right"), 10);
        }
        else {
            return this._setDimensions("width", value);
        }
    },

    /**
     * Method: height
     *
     * Gets or sets the height of elements.
     *
     * Parameters:
     *
     *   value - (optional) Sets the height of the element
     *
     * Returns:
     *
     *   The height of the element, without padding and borders, in pixels
     *
     */
    height: function(value) {
        if (value == null) {
            if (!this[0]) { return 0; }
            return this._getDimensions().height -
                parseInt(this._getStyle("border-top-width"), 10) -
                parseInt(this._getStyle("border-bottom-width"), 10) -
                parseInt(this._getStyle("padding-top"), 10) -
                parseInt(this._getStyle("padding-bottom"), 10);
        }
        else {
            return this._setDimensions("height", value);
        }
    },

    /**
     * Private method: _getDimensions
     *
     * Get the dimensions of the first element in the set.
     *
     * Returns:
     *
     *   An object with properties for top, right, bottom, left, height
     *   and width.
     *
     */
    _getDimensions: function() {
        var ele = this[0];
        var uele = new Unbose(ele);
        var rect = ele.getBoundingClientRect();
        // Elements with display: none has 0 as computed style for width
        // and height, so remove the display temporarily and hide it in
        // another way. This may be dangerous if something queries that
        // property in the meantime. Consider another approach.
        if (uele._getStyle("display") == "none") {
            var oldpos = uele.style("position");
            var oldvis = uele.style("visibility");
            // TODO: check if this is enough. Otherwise, position it outside the viewport
            uele._setStyles({"position": "absolute", "visibility": "hidden"}).show();
            rect = ele.getBoundingClientRect();
            uele._setStyles({"display": "none", "position": oldpos, "visibility": oldvis});
        }
        // XXX: Gecko seems to have a rounding error for top and bottom (at least).
        // Consider rounding these values.
        return {
            top: rect.top + window.scrollY,
            right: rect.right + window.scrollX,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            height: rect.height,
            width: rect.width
        };
    },

    /**
     * Private method: _setDimensions
     *
     * Sets the height or width of all elements in the set.
     *
     * Parameters:
     *
     *   prop - "height" or "width"
     *   val - The value to set
     *
     */
    _setDimensions: function(prop, val) {
        if (+val == parseFloat(val)) { val = (+val | 0) + "px"; }
        if (parseInt(val, 10) < 0) { val = 0; }
        return this._setStyle(prop, val);
    },

    /**
     * Method: hide
     *
     * Hides the elements.
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    hide: function() {
        return this.forEach(function(ele) {
            var olddisplay = ele._getStyle("display");
            if (olddisplay != "none") {
              ele.data("olddisplay", olddisplay)
                 ._setStyle("display", "none");
            }
        });
    },

    /**
     * Method: show
     *
     * Shows the elements.
     *
     * Parameters:
     *
     *   mode - (optional) the value for the CSS display property
     *
     * Returns:
     *
     *   An Unbose object
     *
     * fixme: should there me a map with default display modes for
     * elements? Setting it to blank fails for stuff that has display: none
     * set in their stylesheet.
     */
    show: function(mode) {
        return this.forEach(function(ele) {
            ele._setStyle("display", mode || ele.data("olddisplay") || "");
        });
    }
};

/**
 * Group: Static methods
 *
 * Static Unbose methods
 */
function eleFromTpl(tpl) {
    var index = 0;
    var ele = document.createDocumentFragment();
    if (typeof tpl[index] === "string") {
        ele = createElementWithAttrs(tpl[index]);
        index++;
        if (typeof tpl[index] === "object") {
            var props = tpl[index++];
            for (var key in props) {
                ele.setAttribute(key, props[key]);
            }
        }
    }

    var cur;
    // FIXME: what if data has something falsey?
    while ((cur = tpl[index++])) {
        if (typeof cur === "string") {
            ele.appendChild(document.createTextNode(cur));
        }
        else {
            ele.appendChild(eleFromTpl(cur));
        }
    }

    // flatten unneeded DocumentFragments
    if (ele.nodeType == 11 /*DOCUMENT_FRAGMENT_NODE*/ && ele.childNodes.length == 1) {
        ele = ele.firstChild;
    }
    return ele;

    function createElementWithAttrs(text) {
        var parts = text.split(/([#\.])/);
        var ele = document.createElement(parts.shift());
        var type, value;
        while ((type = parts.shift()) && (value = parts.shift())) {
            if (type == ".") {
                new Unbose(ele).addClass(value);
            }
            else {
                ele.id = value;
            }
        }
        return ele;
    }
};
Unbose.eleFromTpl = eleFromTpl;

/**
 * Group: Static helper methods
 *
 * Various helper methods
 */

/**
 * Method: Unbose.list
 *
 * Convert something to a list. Takes an arbitrary number of arguments.
 * Useful e.g. for converting the arguments object to an array to use
 * array methods.
 *
 * Parameters:
 *
 *   An arbitrary number of parameters
 *
 * Returns:
 *
 *   An array
 */
function list() {
    var ret = [];
    forEach.call(arguments, function(arg) {
        for (var i = 0, len = arg.length; i < len; i++) {
            ret.push(arg[i]);
        }
    });
    return ret;
};
Unbose.list = list;

/**
 * Method: Unbose.isFunction
 *
 * Check if an object is a function.
 *
 * Parameters:
 *
 *   obj - the object to check
 *
 * Returns:
 *
 *   boolean, true if object is a function. Otherwise false.
 *
 */
function isFunction(obj) {
    return !!(obj && toString.call(obj) === "[object Function]");
};
Unbose.isFunction = isFunction;

/**
 * Method: Unbose.isElement
 *
 * Check if an object is an element.
 *
 * Parameters:
 *
 *   obj - the object to check
 *
 * Returns:
 *
 *   boolean, true if object is an element. Otherwise false.
 *
 */
function isElement(obj) {
    return !!(obj && obj.nodeType == 1 /*ELEMENT_NODE*/);
};
Unbose.isElement = isElement;

/**
 * Method: Unbose.nop
 *
 * Empty function. Can be useful in cases where a function is required.
 *
 */
Unbose.nop = function() { /* op nop nop */ };

/**
 * Add Function.prototype.bind if it's not available
 * TODO: check this implementation against the spec.
 * Prototype for example does more funky stuff.
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function(context) {
        var method = this;
        var args = slice.call(arguments, 1);
        return function() {
            return method.apply(context, args.concat(slice.call(arguments, 0)));
        };
    };
}

if (!Element.prototype.matchesSelector) {
    Element.prototype.matchesSelector = (function() {
        var method = VENDOR_PREFIXES.map(function(prefix) {
                return Element.prototype[prefix + "MatchesSelector"];
            }).filter(function(method) {
                return method;
            })[0];

        return method || function(selector) {
            var eles = this.parentNode.querySelectorAll(selector);
            for (var i = 0, ele; ele = eles[i]; i++) {
                if (ele == this) {
                    return true;
                }
            }
            return false;
        };
    })();
}

return Unbose;
})(window, window.document);

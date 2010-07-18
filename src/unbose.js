(function(window, document, undefined) {
/**
 * Class: Unbose
 *
 * Subject can be a CSS selector (string), array (presumed to be of elements),
 * element, document fragment or an Unbose object.
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
        var eles = (context || document).querySelectorAll(subject);
        for (var i = 0, ele; ele = eles[i]; i++) {
            this._elements.push(ele);
        }
    }
    else if (isArray(subject)) {
        this._elements = subject;
    }
    else if (isElement(subject)) {
        this._elements[0] = this[0] = subject;
        this.length = 1;
        return this;
    }
    else if (subject.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
        var child = subject.firstChild;
        while (child) {
            if (isElement(child)) {
                this._elements.push(child);
            }
            child = child.nextElementSibling;
        }
    }
    else if (subject._elements !== undefined) {
        this._elements = subject._elements;
    }
    else if (isFunction(subject)) {
        // Fails in Webkit if there's nothing after <head>, so make sure
        // there's always something explicit in <body>
        document.addEventListener("DOMContentLoaded", function ready(event) {
            subject(event);
            // I wonder if this is necessary. jQuery does it, but shouldn't browser's themselves do it?
            document.removeEventListener("DOMContentLoaded", ready, false);
        }, false);
    }

    // TODO: handle Unbose(window|document)

    var i = 0;
    while (this[i] = this._elements[i]) { i++; }
    this.length = i;
};

window.Unbose = Unbose;

// http://www.whatwg.org/specs/web-apps/current-work/#space-character
var SPACE_CHARS = /[\x20\x09\x0A\x0C\x0D]+/g;
var NON_UNIT_PROPERTIES = ["fontWeight", "lineHeight", "opacity", "zIndex"];

// Cache some methods
var toString = Object.prototype.toString;
var slice = Array.prototype.slice;
var forEach = Array.prototype.forEach;

Unbose.prototype = {
    toString: function() {
        return "[object Unbose]";
    },


    /**
     * Group: Events
     *
     * Methods for handling event
     */

    /**
     * Method: on
     *
     * Add an event listener to all elements in the set.
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
    on: function(types, handler, capture) {
        types.split(" ").forEach(function(type) {
            this._elements.forEach(function(ele) {
                ele.addEventListener(type, handler, capture || false);
            });
        }, this);
        return this;
    },

    // TODO: method to remove events

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
        };
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
        if (typeof eles == "string") {
            eles = new Unbose(eles)._elements;
        }
        else if (eles._elements !== undefined) {
            eles = eles._elements;
        }
        else if (isElement(eles)) {
            eles = [eles];
        }
        this._elements = this._elements.concat(eles);
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
     * XXX:
     *
     *   Is it a good idea to let `this` point to the DOM element? It's a
     *   bit inconsistent. It's how jQuery does it though.
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
        if (selector !== undefined) {
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
        this._elements.forEach(function(ele) {
            eles = eles.concat(new Unbose(selector, ele)._elements);
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
     * Caveats:
     *
     *   This matcher is a lot less sophisticated than a native one would be.
     *   Currently the following selectors are supported:
     *
     *   - Universal selector (*)
     *   - Element names
     *   - Class names
     *   - IDs
     *   - Chains of the above
     *   - Multiple selectors separated by comma
     *
     *   Note also that classes ad IDs can only be matched by "." and "#" syntax.
     *   Attribute selectors ([]) are not supported.
     */
    matchesSelector: function(selector) {
        var selectors = selector.split(/\s*,\s*/);
        return selectors.some(matcher, this);

        function matcher(selector) {
            return this._elements.some(function(ele) {
                var parts = selector.split(/([#\.])/);
                var uele = new Unbose(ele);
                var type, value;
                var eleName = parts.shift().toLowerCase();

                // FIXME: won't work for e.g. *.class or *#id
                if (eleName == "*") {
                    return true;
                }
                if (!trim(selector) || (eleName && eleName != uele.name())) {
                    return false;
                }
                while ((type = parts.shift()) && (value = parts.shift())) {
                    if ((type == "." && !uele.hasClass(value)) ||
                        (type == "#" && uele.attr("id") != value))
                    {
                        return false;
                    }
                }
                return true;
            });
        }
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
     * Find all ancestors, matching the given selector, to the elements in the set.
     *
     * Parameters:
     *
     *   selector - A selector that filters the results
     *
     * Returns:
     *
     *   An Unbose object
     */
    ancestors: function(selector) {
        var eles = [];
        this._elements.forEach(function(ele) {
            ele = ele.parentNode;
            while (ele && ele != document) {
                if (eles.indexOf(ele) == -1) {
                    eles.push(ele);
                }
            }
        });
        return new Unbose(eles).filter(selector);
    },

    /**
     * Method: parent
     *
     * Get the elements parents.
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
     *   <children>
     *
     */
    parent: function(selector) {
        var eles = [];
        this._elements.forEach(function(ele) {
            ele = ele.parentNode;
            if (ele && ele != document && eles.indexOf(ele) == -1) {
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
                if (eles.indexOf(ele) == -1) {
                    eles.push(ele);
                }
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
                if (child != ele && eles.indexOf(child) == -1) {
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
        if (index < 0) { index = (index % this.length) + this.length; }
        return new Unbose(this[index]);
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
        return (index === undefined) ? this._elements : this[index];
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
        // Gecko does not treat `undefined` correctly for the end parameter
        // in Array.prototype.slice, so set it explicitly
        if (end === undefined) { end = this.length; }
        var eles = slice.call(this._elements, start, end);
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
        this._elements.forEach(function(ele) {
            if (!new Unbose(ele).hasClass(cls)) { ele.className += " " + cls; }
        });
        return this;
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
        this._elements.forEach(function(ele) {
            var uele = new Unbose(ele);
            uele[uele.hasClass(cls) ? "removeClass" : "addClass"](cls);
        });
        return this;
    },

    /**
     * Method: append
     *
     * Append an element, an Unbose object, a template or a zen
     * string. Append adds the element after the last child element.
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
     * Insert an element, an Unbose object, a template or a zen
     * string. By default, add it as the first child of the parent. If the
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
        else if (isArray(thing)) {
            return this._insertElem(eleFromTpl(thing), append);
        }
        else if (thing._elements !== undefined) {
            thing._elements.forEach(function(ele) {
                this._insertElem(ele, append);
            }, this);
            return this;
        }
        else if (typeof thing === "string") {
            return this._insertElem(eleFromTpl(tplFromZen(thing)), append);
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
        if (val === undefined) {
            return this[0] && this[0].getAttribute(name);
        }
        else {
            this._elements.forEach(function(ele) {
                ele.setAttribute(name, val);
            });
            return this;
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
        this._elements.forEach(function(ele) {
            ele.removeAttribute(attr);
        });
        return this;
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
        this._elements.forEach(function(ele) { ele.textContent = ""; });
        return this;
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
        this.filter(selector)._elements.forEach(function(ele) {
            var parent = ele.parentNode;
            if (parent) { parent.removeChild(ele); }
        });
        return this;
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
        if (text === undefined) {
            return (this[0] && this[0].textContent) || "";
        }
        else {
            this._elements.forEach(function(ele) { ele.textContent = text; });
            return this;
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
        if (val === undefined) {
            return this[0] && this[0].value;
        }
        else {
            this._elements.forEach(function(ele) { ele.value = val; });
            return this;
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
        if (prop === undefined) {
            return this[0] && this[0]["unbose-" + name];
        }

        this._elements.forEach(function(ele) {
            ele["unbose-" + name] = prop;
        });
        return this;
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
        // Normalize properties
        prop = prop.toLowerCase().replace(/-([a-z])/g, function(all, letter) {
            return letter.toUpperCase();
        });

        if (prop == "float") { prop = "cssFloat"; }

        if (+value === parseFloat(value) && NON_UNIT_PROPERTIES.indexOf(prop) == -1) {
            // Gecko returns non-rounded values for getComputedStyle()
            // so round this before setting it.
            value = (+value | 0) + "px";
        }

        this._elements.forEach(function(ele) {
            ele.style[prop] = value;
        });
        return this;
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
        var ele = this[0];
        if (value === undefined) {
            if (!ele) { return 0; }
            var uele = new Unbose(ele);
            return this._getDimensions().width -
                   parseInt(uele._getStyle("border-left-width")) -
                   parseInt(uele._getStyle("border-right-width")) -
                   parseInt(uele._getStyle("padding-left")) -
                   parseInt(uele._getStyle("padding-right"));
        }
        else if (ele) {
            this._setDimensions("width", value);
        }
        return this;
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
        var ele = this[0];
        if (value === undefined) {
            if (!ele) { return 0; }
            var uele = new Unbose(ele);
            return this._getDimensions().height -
                   parseInt(uele._getStyle("border-top-width")) -
                   parseInt(uele._getStyle("border-bottom-width")) -
                   parseInt(uele._getStyle("padding-top")) -
                   parseInt(uele._getStyle("padding-bottom"));
        }
        else if (ele) {
            this._setDimensions("height", value);
        }
        return this;
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
            uele._setStyles({"position": "absolute", "visbility": "hidden"}).show();
            rect = ele.getBoundingClientRect();
            uele._setStyles({"position": oldpos, "visibility": oldvis}).hide();
        }
        // XXX: Gecko seems to have a rounding error for top and bottom (at least).
        // Consider rounding these values.
        return {
            top: rect.top + window.scrollY,
            right: rect.right + window.scrollX,
            bottom: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            height: rect.bottom - rect.top,
            width: rect.right - rect.left
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
        if (parseInt(val) < 0) { val = 0; }
        this._elements.forEach(function(ele) { ele.style[prop] = val; });
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
        this._elements.forEach(function(ele) {
            var uele = new Unbose(ele);
            uele.data("olddisplay", uele.style("display"))
                .style("display", "none");
        });
        return this;
    },

    /**
     * Method: show
     *
     * Shows the elements.
     *
     * Parameters:
     *
     *   mode - (optional) the css display mode to use for the shown state.
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
        this._elements.forEach(function(ele) {
            ele.style.display = new Unbose(ele).data("olddisplay") || mode || "";
        });
        return this;
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
    if (ele.nodeType == Node.DOCUMENT_FRAGMENT_NODE && ele.childNodes.length == 1) {
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
 * Method: Unbose.tplFromZen
 *
 * Converts a template array to an element (NOT to an unbose object atm).
 */
function tplFromZen(zen) {
    return parse_zencode(zen);

    // Here's a whole bunch of private functions for doing the actual parsing.
    // fimxe: do whitespace cleanup at first instead of inside parser?

    // Main parsing entrypoint
    function parse_zencode(str) {
        var chars = str.replace("\n").split("");
        var ret = [];
        var n = 10;
        while (chars.length && --n) {
            ret = ret.concat((parse_expr(chars)));
        }
        return ret;
    }

    // Expression is top level zen element. tag or parens
    function parse_expr(chars) {
        consume_ws(chars);
        var ret;
        if (chars[0] == "(") {
            chars.shift();
            ret = parse_expr(chars);
            chars.shift(); // FIXME: Make sure it's ")"
        }
        else {
            ret = parse_tag(chars);
        }

        consume_ws(chars);
        var multiplier = get_multiplier(chars);
        consume_ws(chars);
        var siblings = parse_siblings(chars);
        consume_ws(chars);
        var children = parse_children(chars);

        if (ret.length == 2 && children.length) { // a set of siblings can't have children
            ret.push(children);
        }

        while (multiplier--) {
            siblings.unshift(ret);
        }

        return siblings.length ? siblings : ret;
    }

    // Parses a tag, obviously..
    function parse_tag(chars) {
        var name = consume_name(chars);
        var props = parse_props(chars);
        var current = [name, props];
        return current;
    }

    // Consume and return the multiplier if there is one
    function get_multiplier(chars) {
        var charsNum = "";
        if (chars.length && chars[0] == "*") {
            chars.shift();
        }

        while (chars.length && chars[0].match(/\d/)) {
            charsNum += chars.shift();
        }
        return parseInt(charsNum, 10) || 1;
    }

    // Parse siblings
    function parse_siblings(chars) {
        var ret = [];
        while (chars.length && chars[0] == "+") {
            chars.shift();
            ret.push(parse_expr(chars));
        }
        return ret;
    }

    // Parse children
    function parse_children(chars) {
        var ret = [];
        if (chars.length && chars[0] == ">") {
            chars.shift();
            ret = parse_expr(chars);
        }
        return ret;
    }

    /**
     * Consume and return anything alphanumeric, a-z,0-9
     */
    function consume_name(chars) {
        var s = "";
        while (chars.length && chars[0].match(/[a-zA-Z0-9-]/)) {
            s += chars.shift();
        }
        return s;
    }

    /**
     * Class names and IDs
     */
    function consume_class_or_id(chars) {
        var s = "";
        while (chars.length && chars[0].match(/[a-zA-Z0-9-_]/)) {
            s += chars.shift();
        }
        return s;
    }

    /**
     * Property values
     */
    function consume_value(chars) {
        var s = "";
        while (chars.length && chars[0].match(/[a-zA-Z0-9-_#\.\/]/)) {
            s += chars.shift();
        }
        return s;
    }

    /**
     * White space
     */
    function consume_ws(chars) {
        var s = "";
        while (chars.length && chars[0].match(/\s/)) {
            s += chars.shift();
        }
        return s;
    }

    // consume IDs, classnames and properties
    function parse_props(chars) {
        var props = {};

        while (chars.length) {
            var chr = chars.shift();
            if (chr == ".") {
                var className = consume_class_or_id(chars);
                props["class"] = props["class"] ?
                    props["class"] + " " + className :
                    className;
            }
            else if (chr == "#") {
                var id = consume_class_or_id(chars);
                props["id"] = id;
            }
            else if (chr == " ") {
                var name = consume_name(chars);
                if (!name) { // no valid name found
                    break; // presumably whitespace in zen for readability.
                }

                chars.shift(); // FIXME; make sure is always "="
                var value = consume_value(chars);
                props[name] = value;
            }
            else {
                chars.unshift(chr);
                break;
            }
        }
        return props;
    }
};
Unbose.tplFromZen = tplFromZen;

/**
 * Method: Unbose.eleFromZen
 *
 * Create an HTML element from a zencode string.
 *
 * Parameters:
 *
 *   zen - the string of zencode
 *
 * Returns:
 *
 *   HTMLElement
 *
 * See also:
 *
 *   <fromZen>
 *
 */
function eleFromZen(zen) {
    return Unbose.eleFromTpl(Unbose.tplFromZen(zen));
};
Unbose.eleFromZen = eleFromZen;

/**
 * Method: Unbose.fromZen
 *
 * Create an Unbose object from a zencode string.
 *
 * Parameters:
 *
 *   zen - the string of zencode
 *
 * Returns:
 *
 *   Unbose element of zencode
 *
 * See also:
 *
 *   <eleFromZen>
 *
 */
function fromZen(zen) {
    return new Unbose(Unbose.eleFromZen(zen));
};
Unbose.fromZen = fromZen;

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
 * Method: Unbose.isArray
 *
 * Check if an object is an array.
 *
 * Parameters:
 *
 *   obj - the object to check
 *
 * Returns:
 *
 *   boolean, true if object is an array. Otherwise false.
 *
 * Note:
 *
 *   Object.prototype.toString technique copied from:
 *   http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
 *
 */
var isArray = (function() {
    return Array.isArray || function isArray(obj) {
        return !!(obj && toString.call(obj) === "[object Array]");
    };
})();
Unbose.isArray = isArray;

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
    return !!(obj && obj.nodeType == Node.ELEMENT_NODE);
};
Unbose.isElement = isElement;

/**
 * Method: Unbose.trim
 *
 * Trim leading and trailing whitespace in a string.
 *
 * Parameters:
 *
 *   text - The text to be trimmed
 *
 * Returns:
 *
 *   The trimmed text
 *
 */
var trim = (function() {
    if (String.prototype.trim) {
        return function trim(text) {
            return String.prototype.trim.call(text);
        };
    }

    // Slightly modified version of Steven Levithan's super fast trim function
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    return function trim(str) {
        str = (str || "").replace(/^\s\s*/, "");
        var ws = /\s/;
        var i = str.length;
        while (ws.test(str.charAt(--i)));
        return str.slice(0, i + 1);
    };
})();
Unbose.trim = trim;

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
        var ele = document.createElement("div");
        return !!ele.classList;
    })()
};
})(window, window.document);


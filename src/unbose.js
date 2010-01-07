/**
 * Class: Unbose
 *
 * Subject can be string selector, array (presumed to be of elements),
 * element, Unbose object.
 */
function Unbose(subject, context) {
    if (! (this instanceof Unbose)) {
        return new Unbose(subject, context);
    }

    this.elements = [];

    if (typeof subject == "string") {
        var elems = (context || document).querySelectorAll(subject);
        for (var i = 0, e; e = elems[i]; i++) {
            this.elements.push(e);
        }
    }
    else if (subject instanceof Unbose) {
        this.elements = subject.elements;
    }
    else if (subject instanceof Array) {
        this.elements = subject;
    }
    else if (subject instanceof HTMLElement) {
        this.elements = [subject];
    }
    else if (subject instanceof DocumentFragment) {
        var child = subject.firstChild;
        while (child) {
            if (child.nodeType == Node.ELEMENT_NODE) {
                this.elements.push(child);
            }
            child = child.nextSibling;
        }
    }

    this.length = this.elements.length;
}

Unbose.prototype = {
    toString: function() {
        return "[object Unbose]";
    },


    /**
     * Group: Events
     *
     */

    /**
     * Method: click
     *
     * Adds a click event.
     * Shorthand for on("click", callback);
     *
     * Parameters:
     *
     *   callback - The class name to delete as a string.
     *   capturing - Use capturing.
     *
     * Returns:
     *
     *   The Unbose object
     *
     * See also:
     *
     *   <on>
     *
     */
    click: function(callback, capturing) {
        return this.on("click", callback, capturing);
    },

    /**
     * Method: on
     *
     * Add an event listener to the set of elements.
     *
     * Parameters:
     *
     *   name - Name of the event
     *   callback - Function called when event occurs
     *   capture - Use capturing
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    on: function(name, callback, capture) {
        this.elements.forEach(function(ele) {
            ele.addEventListener(name, callback, capture || false);
        });
        return this;
    },

    /**
     * Method: once
     *
     * Add an event listener to the set of elements that will be called once
     * and then removed.
     *
     * Parameters:
     *
     *   name - Name of the event
     *   callback - Function called when event occurs
     *   capture - Use capturing
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    once: function(name, callback, capture) {
        function cancelCb(evt) {
            evt.target.removeEventListener(name, cancelCb, capture || false);
            callback(evt);
        };
        return this.on(name, cancelCb, capture);
    },

    /**
     *
     */
    filter: function(fun, context) {
        return this.elements.filter(fun, context || this);
    },


    /**
     * Group: Finding and traversing
     */

    /**
     * Method: find
     *
     * Find decendents of the set of objects that match a selector
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
        return Unbose(selector, this.elements[0]);
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
    // Note: this method is currently limited to filtering on element names,
    // classes and IDs.
    matchesSelector: function(selector) {
        var parts = selector.split(/([#\.])/);
        var ele = this.elements[0];
        var type, value;
        if (parts.shift().toLowerCase() != ele.nodeName.toLowerCase()) {
            return false;
        }
        while ((type = parts.shift()) && (value = parts.shift())) {
            if (type == ".") {
                if (!Unbose(ele).hasClass(value)) {
                    return false;
                }
            }
            else {
                if (ele.id != value) {
                    return false;
                }
            }
        }
        return true;
    },

    /**
     * Method: forEach
     *
     * Call a function for all elements in the Unbose set
     *
     * Parameters:
     *
     *   func - The function to call
     *   context - (optional) context, the value of "this" for the function
     *             calls
     *
     * Returns:
     *
     *   An Unbose object
     *
     * Todo:
     *
     *   Should we pass ele or Unbose object to args?
     */
    forEach: function(func, context) {
        this.elements.forEach(func, context || this);
        return this;
    },

    /**
     * Method: name
     *
     * Get the element name of the first element in the set
     *
     * Returns:
     *
     *   The name of the first element in the set. Name will always be lower
     *   case when returned
     */
    name: function() {
        return this.elements[0] && this.elements[0].nodeName.toLowerCase();
    },

    /**
     * Method: parent
     *
     * Get the elements parents
     *
     * Parameters:
     *
     *   filter - A selector that filters the results
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
    parent: function(filter) {
        var parents = [];
        this.elements.forEach(function(ele) {
            var parent = ele.parentNode;
            if (parent && parents.indexOf(parent) == -1)
            {
                parents.push(parent);
            }
        });
        if (filter) {
            parents = parents.filter(function(ele) {
                return Unbose(ele).matchesSelector(filter);
            });
        }
        return Unbose(parents);
    },

    /**
     * Method: children
     *
     * Get the elements children
     *
     * Parameters:
     *
     *   filter - A selector that filters the results
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
    children: function(filter) {
        var children = [];
        this.elements.forEach(function(ele) {
            var child = ele.firstChild;
            while (child) {
                if (child.nodeType == Node.ELEMENT_NODE
                    && children.indexOf(child) == -1)
                {
                    children.push(child);
                }
                child = child.nextSibling;
            }
        });
        if (filter) {
            children = children.filter(function(ele) {
                return Unbose(ele).matchesSelector(filter);
            });
        }
        return Unbose(children);
    },

    /**
     * Method: siblings
     *
     * Get the siblings of the elements in the set
     *
     * Parameters:
     *
     *   filter - A selector that filters the results
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    siblings: function(filter) {
        var siblings = [];
        this.elements.forEach(function(ele) {
            var child = ele.parentNode.firstChild;
            while (child) {
                if (child != ele && child.nodeType == Node.ELEMENT_NODE
                    && siblings.indexOf(child) == -1)
                {
                    siblings.push(child);
                }
                child = child.nextSibling;
            }
        });
        if (filter) {
            siblings = siblings.filter(function(ele) {
                return Unbose(ele).matchesSelector(filter);
            });
        }
        return Unbose(siblings);
    },

    /**
     * Method: first
     *
     * Get the first element in the set
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     * <last>, <nth>
     *
     */
    first: function() {
        return Unbose(this.elements[0]);
    },

    /**
     * Method: last
     *
     * Get the last element in the set
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     * <first>, <nth>
     *
     */
    last: function() {
        return this.elements[this.elements.length-1];
    },

    /**
     * Method: prev
     *
     * Get the previous siblings of the elements in the set
     *
     * Returns:
     *
     *   An Unbose object
     *
     * Parameters:
     *
     *   filter - A selector that filters the results
     *
     * See also:
     *
     * <next>
     *
     */
    prev: function(filter) {
        var prevs = [];
        this.elements.forEach(function(ele) {
            var prev = ele.previousSibling;
            if (prev && prev.nodeType == Node.ELEMENT_NODE) {
                prevs.push(prev);
            }
        });
        if (filter) {
            prevs = prevs.filter(function(ele) {
                return Unbose(ele).matchesSelector(filter);
            });
        }
        return Unbose(prevs);
    },

    /**
     * Method: next
     *
     * Get the next siblings of the elements in the set
     *
     * Parameters:
     *
     *   filter - A selector that filters the results
     *
     * Returns:
     *
     *   An Unbose object
     *
     * See also:
     *
     * <prev>
     *
     */
    next: function(filter) {
        var nexts = [];
        this.elements.forEach(function(ele) {
            var next = ele.nextSibling;
            if (next && next.nodeType == Node.ELEMENT_NODE) {
                nexts.push(next);
            }
        });
        if (filter) {
            nexts = nexts.filter(function(ele) {
                return Unbose(ele).matchesSelector(filter);
            });
        }
        return Unbose(nexts);
    },

    /**
     * Method: closest
     *
     * Finds the closest element, ancestor or descendant, that matches the expression.
     *
     * Parameters:
     *
     *   expr - The expression for which to search for
     *
     * Returns:
     *
     *   An Unbose object
     *
     * Todo:
     *
     *   Not implemented
     *
     */
    closest: function(expr) {
        return this;
    },

    /**
     * Method: nth
     *
     * Returns the Unbose object for the nth element in the Unbose set
     *
     * Parameters:
     *
     *   index - index in the list
     *
     * Returns:
     *
     *   An Unbose object
     *
     * Example:
     *
     * Get the second h1 element in the document:
     * (example)
     * Unbose("h1").nth(1);
     * (end)
     *
     * See also:
     *
     * <first>, <last>
     *
     */
    nth: function(index) {
        return Unbose(this.elements[index]);
    },

    /**
     * Method: elem
     *
     * Gets an HTMLElement from the Unbose object, or an array of all
     * HTMLElements in the collection.
     *
     * Parameters:
     *
     *   index - The index of the element in the set
     *
     * Returns:
     *
     *   An HTMLElement
     *
     * Fixme:
     *
     *   Should the retval with no args be the array or a copy of it?
     *
     */
    elem: function(index) {
        return (index === undefined) ? this.elements : this.elements[index];
    },


    /**
     * Group: DOM
     *
     */

    /**
     * Method: append
     *
     * Append an element, an unbose object, a template or a zen string
     *
     * Parameters:
     *
     *   thing - Thing to add
     *
     * Returns:
     *
     *   The Unbose object
     *
     * See also:
     *
     *   <appendElem>, <appendTpl>, <appendUnbose>, <appendZen>
     *
     */
     append: function(thing) {
         //todo
         return this;
     },

    /**
     * Method: appendElem
     *
     * Append an element to all elements. If there are multiple elements
     * in the Unbose object, append clones.
     *
     * Parameters:
     *
     *   newEle - Element to add
     *
     * Returns:
     *
     *   The Unbose object
     *
     */
     appendElem: function(newEle) {
         this.elements.forEach(function(ele) {
             ele.appendChild(newEle.cloneNode(true));
         });
         return this;
     },

    /**
     * Method: appendTpl
     *
     * Append elements from a template to all elements
     *
     * Parameters:
     *
     *   tpl - Template array
     *
     * Returns:
     *
     *   The Unbose object
     *
     */
     appendTpl: function(tpl) {
         var newEle = Unbose.eleFromTpl(tpl);
         this.appendElem(newEle);
         return this;
     },

    /**
     * Method: appendUnbose
     *
     * Append an element to all elements. If there are multiple elements
     * in the Unbose object, append clones.
     *
     * Parameters:
     *
     *   ele - Element to add
     *
     * Returns:
     *
     *   The Unbose object
     *
     */
     appendUnbose: function (ubobj) {
         ubobj.elem().forEach(function(ele) {
             this.appendElem(ele);
         });
         return this;
     },

    /**
     *
     * Method: appendZen
     *
     * Append elements from a zencoding string
     *
     * Parameters:
     *
     *   tpl - Template array
     *
     * Returns:
     *
     *   The Unbose object
     *
     */
     appendZen: function (zen) {
         var tpl = Unbose.tplFromZen(zen);
         this.appendTpl(tpl);
         return this;
     },

    /**
     * Method: attr
     *
     * Set or get an attribute value. If value is given, set it. Of not,
     * just return current value.
     *
     * Parameters:
     *
     *   name - Attribute to get or set
     *   val - (optional) Value to set to
     *
     * Returns:
     *
     *   The Unbose object or an attribute
     *
     * See also:
     *
     *   <getAttr>, <setAttr>
     *
     */
    attr: function(name, val) {
        return (val === undefined) ? this.getAttr(name) : this.setAttr(name, val);
    },

    /**
     * Method: getAttr
     *
     * Get the value of an attribute
     *
     * Parameters:
     *
     *   name - Name of the attribute to get
     *
     * Returns:
     *
     *  The value of the attribute. If attribute does not exist, returns
     *  undefined.
     *
     * Example:
     *
     * Set the src of an image
     * (example)
     * Unbose("#logo").attr("src", "logo.png");
     * (end)
     *
     */
    getAttr: function(name) {
        return this.elements[0].getAttribute(name) || this.elements[0][name];
    },

    /**
     * Method: setAttr
     *
     * Set the value of an attribute
     *
     * Parameters:
     *
     *   name - Name of the attribute to set
     *   val - The value of the attribute
     *
     * Returns:
     *
     *  The Unbose object
     *
     */
    setAttr: function(name, val) {
        this.elements.forEach(function(ele) {
            ele.setAttribute(name, val);
        });
        return this;
    },


    /**
     * Method: empty
     *
     * Remove all children of the element, or of all elements in the set.
     *
     * Returns:
     *
     *   The Unbose object
     *
     */
    empty: function() {
        this.elements.forEach(function(ele) {
            while (ele.firstChild) { ele.removeChild(ele.firstChild); }
        });
        return this;
    },

    /**
     * Method: remove
     *
     * Remove the set of elements
     *
     * Returns:
     *
     *   The Unbose object
     *
     * Todo:
     *
     *   Support expression arg
     */
    remove: function() {
        this.elements.forEach(function(ele) {
            if (ele.parentNode) { ele.parentNode.removeChild(ele); }
        });
        return this;
    },

    /**
     * Method: text
     *
     * If argument is given, set text content of elements. If not, return
     * text content instead. See <setText> and <getText>
     *
     * Parameters:
     *
     *   newText - (optional) new string
     *
     * Returns:
     *
     *   An Unbose object or a string
     *
     * See also:
     *
     * <getText>, <setText>
     *
     */
    text: function(newText) {
        return (newText === undefined) ? this.getText() : this.setText(newText);
    },

    /**
     * Method: getText
     *
     * Get the text content of the first element of the set
     *
     * Returns:
     *
     *   A string. If the element has no text content, an empty string.
     *
     */
    getText: function() {
        return this.elements[0].textContent || "";
    },

    /**
     * Method: setText
     *
     * Set the text content of the set of elements
     *
     * Parameters:
     *
     *   text - The text to set
     *
     * Returns:
     *
     *   The Unbose object
     *
     */
    setText: function(text) {
        this.forEach(function(ele) { ele.textContent = text; });
        return this;
    },

    /**
     * Method: val
     *
     * Set or get the value of the set of elements
     *
     * Parameters:
     *
     *   text - (optional) The text to set
     *
     * Returns:
     *
     *   The value of the Unbose object
     *
     * See also:
     *
     *   <getVal>, <setVal>
     *
     */
    val: function(val) {
        return (val === undefined) ? this.getVal() : this.setVal(val);
    },

    /**
     * Method: getVal
     *
     * get the value of the first element in the set
     *
     * Returns:
     *
     *   The value
     *
     * See also:
     *
     *   <val>, <setVal>
     *
     */
    getVal: function() {
        return this.elements[0].value;
    },

    /**
     * Method: setVal
     *
     * Set the value of the set of elements
     *
     * Parameters:
     *
     *   text - The value to set
     *
     * Returns:
     *
     *   The value of the Unbose object
     *
     * See also:
     *
     *   <val>, <setVal>
     *
     */
    setVal: function(val) {
        this.elements.forEach(function(ele) {
            ele.value = val;
        });
        return this;
    },

    /**
     * Method: data
     *
     * Associate arbitrary data with this element. The value
     * will be converted to a string.
     *
     * Parameters:
     *
     *   name - The name to get or to set a value forEach
     *   val - The value to setAttribute
     *
     * Returns:
     *
     *   If a value is set, it returns an Unbose object, otherwise,
     *   it returns the value.
     */
    data: function(name, val) {
        if (val === undefined) {
            return this.elements[0].getAttribute("data-unbose-" + name);
        }

        this.elements.forEach(function(ele) {
            ele.setAttribute("data-unbose-" + name, val);
        });
        return this;
    },


    /**
     * Group: Style
     *
     */

    /**
     * Method: style
     *
     * Set or get a style attribute.
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
     * See also:
     *
     * <setStyle>, <getStyle>
     *
     */
    style: function(attr, value) {
        return (value === undefined) ? this.getStyle(attr) : this.setStyle(attr, value);
    },

    /**
     * Method: getStyle
     *
     * Get the style value of the first element of the set
     *
     * Parameters:
     *
     *   prop - The name of the style attribute
     *
     * Fixme:
     *
     *   Should it get from first or all? If all, how?
     *   What if not in dom? Fall back to .style?
     *   Should there be any kind of normalization? colors are hex in
     *   opera and rgb in chrome/ff
     *
     */
    getStyle: function(prop) {
        var ele = this.elements[0];
        return ele.ownerDocument.defaultView
                                .getComputedStyle(ele, null)
                                .getPropertyValue(prop);
    },

    /**
     * Method: setStyle
     *
     * Set the style for the elements in the set
     *
     * Parameters:
     *
     *   prop - The property to set
     *   value - The property's value
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    setStyle: function(prop, value) {
        prop = prop.replace(/-([a-z])/g, function(all, letter) {
            return letter.toUpperCase();
        });

        if (prop == "float") {
            prop = "cssFloat";
        }

        this.elements.forEach(function(ele) {
            ele.style[prop] = value;
        });
        return this;
    },

    /**
     * Method: width
     *
     * Gets or sets the width of the element
     *
     * Parameters:
     *
     *   value - Sets the width of the element (optional)
     *
     * Returns:
     *
     *   The width of the element, without padding and borders, in pixels
     *
     */
    width: function(value) {
        var ele = this.elements[0];
        if (value === undefined) {
            var uele = Unbose(ele);
            return ele.offsetWidth -
                   parseInt(uele.getStyle("border-left-width")) -
                   parseInt(uele.getStyle("border-right-width")) -
                   parseInt(uele.getStyle("padding-left")) -
                   parseInt(uele.getStyle("padding-right"));
        }
        else {
            if (+value === parseInt(value)) {
                value = parseInt(value) + "px";
            }
            if (parseInt(value) < 0) {
                value = 0;
            }
            ele.style.width = value;
        }
    },

    /**
     * Method: height
     *
     * Get the height of the element
     *
     * Parameters:
     *
     *   value - Sets the height of the element (optional)
     *
     * Returns:
     *
     *   The height of the element, without padding and borders, in pixels
     *
     */
    height: function(value) {
        var ele = this.elements[0];
        if (value === undefined) {
            var uele = Unbose(ele);
            return ele.offsetHeight -
                   parseInt(uele.getStyle("border-top-width")) -
                   parseInt(uele.getStyle("border-bottom-width")) -
                   parseInt(uele.getStyle("padding-top")) -
                   parseInt(uele.getStyle("padding-bottom"));
        }
        else {
            if (+value === parseInt(value)) {
                value = parseInt(value) + "px";
            }
            if (parseInt(value) < 0) {
                value = 0;
            }
            ele.style.height = value;
        }
    },

    /**
     * Method: hasClass
     *
     * Check if the elements in the set has a specific class
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
     *   <delClass>, <hasClass>, <toggleClass>
     *
     */
    hasClass: function(cls) {
        return this.elements.some(function(ele) {
            return ele.className.split(/\s+/).indexOf(cls) != -1;
        });
    },

    /**
     * Method: addClass
     *
     * Add a class to the element, or to all elements in the set
     *
     * Parameters:
     *
     *   cls - The class name to add as a string.
     *
     * Returns:
     *
     *   The Unbose object
     *
     * See also:
     *
     *   <delClass>, <hasClass>, <toggleClass>
     *
     */
    addClass: function(cls) {
        this.elements.forEach(function(ele) {
            if (!Unbose(ele).hasClass(cls)) {
                ele.className += " " + cls;
            }
        });
        return this;
    },

    /**
     * Method: delClass
     *
     * Removes a class from the element, or to all elements in the set
     *
     * Parameters:
     *
     *   cls - The class name to delete as a string.
     *
     * Returns:
     *
     *   The Unbose object
     *
     * See also:
     *
     *   <addClass>, <hasClass>, <toggleClass>
     *
     */
    delClass: function(cls) {
        var classes = cls.split(/\s+/);
        classes.forEach(function(cls) {
            this.elements.forEach(function(ele) {
                ele.className = (" " + ele.className + " ")
                                    .replace(/\s+/g, " ")
                                    .replace(" " + cls + " ", " ");
            });
        }, this);
        return this;
    },

    /**
     * Method: toggleClass
     *
     * Set class name if it's not set, unset it otherwise
     *
     * Parameters:
     *
     *   cls - The class name to toggle.
     *
     * Returns:
     *
     *   The Unbose object
     *
     * See also:
     *
     *   <addClass>, <hasClass>, <delClass>
     *
     */
    toggleClass: function(cls) {
        this.elements.forEach(function(ele) {
            Unbose(ele)[Unbose(ele).hasClass(cls) ? "delClass" : "addClass"](cls);
        });
        return this;
    },

    /**
     * Method: hide
     *
     * Hides the element or set of elements by setting the "display"
     * style property to none.
     *
     * Returns:
     *
     *   The Unbose object
     *
     */
    hide: function() {
        this.elements.forEach(function(ele) {
            Unbose(ele).data("olddisplay", Unbose(ele).style("display"))
                       .style("display", "none");
        });
        return this;
    },

    /**
     * Method: show
     *
     * Show an element by clearing its display style element.
     *
     * Returns:
     *
     *   The Unbose object
     *
     * Todo:
     *
     *   Not implemented
     *
     */
    show: function() {
        this.elements.forEach(function(ele) {
            ele.style.display = Unbose(ele).data("olddisplay") || "";
        });
        return this;
    }
};

// static methods:
Unbose.eleFromTpl = function(tpl) {
    var index = 0;
    var elem = document.createDocumentFragment();
    if (typeof tpl[index] === "string") {
        elem = createElementWithAttrs(tpl[index]);
        index++;
        if (typeof tpl[index] === "object") {
            var props = tpl[index++];
            for (var key in props) {
                elem.setAttribute(key, props[key]);
            }
        }
    }

    var cur;
    // fixme: what if data has something falsey?
    while (cur = (tpl[index++])) {
        if (typeof cur === "string") {
            elem.appendChild(document.createTextNode(cur));
        }
        else {
            elem.appendChild(this.eleFromTpl(cur));
        }
    }

    // flatten unneeded documentfragments
    if (elem instanceof DocumentFragment && elem.childNodes.length == 1) {
        elem = elem.firstChild;
    }
    return elem;

    function createElementWithAttrs(text) {
        var parts = text.split(/([#\.])/);
        var ele = document.createElement(parts.shift());
        var type, value;
        while ((type = parts.shift()) && (value = parts.shift())) {
            if (type == ".") {
                Unbose(ele).addClass(value);
            }
            else {
                ele.id = value;
            }
        }
        return ele;
    }
};

/**
 * Todo:
 *
 *   Arbitrary number of args
 */
Unbose.list = function(whatever) {
    var ret = [];
    for (var i = 0, l = whatever.length; i < l; i++) {
        ret.push(whatever[i]);
    }
};

/**
 * Static method: eleFromZen
 *
 * Converts a template array to an element (NOT to an unbose object atm)
 */
Unbose.tplFromZen = function(zen) {
    return parse_zencode(zen);

    // Here's a whole bunch of private functions for doing the actual parsing.


    // Main parsing entrypoint
    function parse_zencode(str) {
        var chars = str.split("");
        var ret = [];
        var n = 10;
        while (chars.length && --n) {
            ret = ret.concat((parse_expr(chars)));
        }
        return ret;
    }

    // Expression is top level zen element. tag or parens
    function parse_expr(chars) {
        var ret;
        if (chars[0] == "(") {
            chars.shift();
            ret = parse_expr(chars);
            chars.shift(); // fixme Make sure it's ")"
        }
        else {
            ret = parse_tag(chars);
        }

        var multiplier = get_multiplier(chars);
        var siblings = parse_siblings(chars);
        var children = parse_children(chars);

        if (ret.length == 2 && children.length) { // a set of sibligns can't have children
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

        while(chars.length && chars[0].match(/\d/)) {
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
     * Consume and return anything alphanumeric, a-z,0-9_-
     */
    function consume_name(chars) {
        var s = "";
        while (chars.length && chars[0].match(/[a-zA-Z0-9]/)) {
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
        while (chars.length && chars[0].match(/[a-zA-Z0-9-_#\.]/)) {
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
            else if(chr == "#") {
                var id = consume_class_or_id(chars);
                props["id"] = id;
            }
            else if(chr == " ") {
                var name = consume_name(chars);
                chars.shift(); // fixme. make sure is always "="
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

/**
 * Static method: eleFromZen
 *
 * Converts a zencode string to an element (NOT to an unbose object atm)
 */
Unbose.eleFromZen = function(zen) {
    return this.eleFromTpl(this.tplFromZen(zen));
};

// These are copied from jQuery
Unbose.isArray = function(obj) {
    return toString.call(obj) == "[object Array]";
}

Unbose.isFunction = function(obj) {
    return toString.call(obj) == "[object Function]";
}

Unbose.trim = function(text) {
    return (text || "").replace(/^\s+|\s+$/g, "");
}

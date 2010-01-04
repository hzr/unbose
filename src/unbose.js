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
        capture = capture || false;
        this.elements.forEach(function(ele) {
            ele.addEventListener(name, callback, capture);
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
        capture = capture || false;
        var cancelCb = function(evt) {
            evt.target.removeEventListener(name, arguments.callee, capture);
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
     *   function - The function to call
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
    forEach: function(fun, context) {
        this.elements.forEach(fun, context || this);
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
     * Returns the elements parents
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
    parent: function() {
        var parents = [];
        this.elements.forEach(function(ele) {
            var parent = ele.parentNode;
            if (parent && parents.indexOf(parent) == -1)
            {
                parents.push(parent);
            }
        });
        return Unbose(parents);
    },

    /**
     * Method: children
     *
     * Returns the elements children
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
    children: function(expr) {
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
        if (expr) {
            children = children.filter(function(ele) {
                return Unbose(ele).matchesSelector(expr);
            });
        }
        return Unbose(children);
    },

    /**
     * Method: siblings
     *
     * Get the siblings of the elements in the set
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    siblings: function(expr) {
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
        if (expr) {
            siblings = siblings.filter(function(ele) {
                return Unbose(ele).matchesSelector(expr);
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
     *   expr - An expression
     *
     * See also:
     *
     * <next>
     *
     */
    prev: function(expr) {
        var prevs = [];
        this.elements.forEach(function(ele) {
            var prev = ele.previousSibling;
            if (prev && prev.nodeType == Node.ELEMENT_NODE) {
                prevs.push(prev);
            }
        });
        if (expr) {
            prevs = prevs.filter(function(ele) {
                return Unbose(ele).matchesSelector(expr);
            });
        }
        return Unbose(prevs);
    },

    /**
     * Method: next
     *
     * Get the next siblings of the elements in the set
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
    next: function(expr) {
        var nexts = [];
        this.elements.forEach(function(ele) {
            var next = ele.nextSibling;
            if (next && next.nodeType == Node.ELEMENT_NODE) {
                nexts.push(next);
            }
        });
        if (expr) {
            nexts = nexts.filter(function(ele) {
                return Unbose(ele).matchesSelector(expr);
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
     * Get the second h1 tag in the document:
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
        if (index === undefined) {
            return this.elements;
        }
        else {
            return this.elements[index];
        }
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
        if (val === undefined) {
            return this.getAttr(name);
        }
        else {
            this.setAttr(name, val);
            return this;
        }
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
        if (newText === undefined) {
            return this.getText();
        }
        else {
            return this.setText(newText);
        }
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
        if (val!==undefined) {
            return this.setVal(val);
        }
        else {
            return this.getVal();
        }
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
        if (value === undefined){
            return this.getStyle(attr);
        }
        else {
            return this.setStyle(attr, value);
        }
    },

    /**
     * Method: getStyle
     *
     * Get the style value of the first element of the set
     *
     * Parameters:
     *
     *   attr - The name of the style attribute
     *
     * Fixme:
     *
     *   Should it get from first or all? If all, how?
     *   What if not in dom? Fall back to .style?
     *   Should there be any kind of normalization? colors are hex in
     *   opera and rgb in chrome/ff
     *
     */
    getStyle: function(attr) {
        var ele = this.elements[0];
        return ele.ownerDocument.defaultView
                                .getComputedStyle(ele, null)
                                .getPropertyValue(attr);
    },

    /**
     * Method: setStyle
     *
     * Set the style value of the first element of the set
     *
     */
    setStyle: function(name, value) {
        // fixme: check style name map
        this.forEach(function(ele) { ele.element.style[name] = value; });
        return this;
    },

    /**
     * Return the width of the element in pixels
     */
    width: function() {
        // todo
        return this;
    },

    /**
     * Method: height
     *
     * Get the height of the element, including borders and stuff
     *
     * Todo:
     *
     *   Not implemented
     *
     */
    height: function() {
        return this;
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
            return ele.className.split(" ").indexOf(cls) != -1;
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
                ele.className = ele.className + " " + cls;
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
                if (Unbose(ele).hasClass(cls)) {
                    ele.className = (" " + ele.className + " ").replace(" " + cls + " ", " ");
                }
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
            ele.style.display = "none";
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
        str = str.split("");
        var ret = [];
        var n = 10;
        while (str.length && --n) {
            ret = ret.concat((parse_expr(str)));
        }
        return ret;
    }

    // Expression is top level zen element. tag or parens
    function parse_expr(str) {
        var ret;
        if (str[0] == "(") {
            str.shift();
            ret = parse_expr(str);
            str.shift(); // fixme Make sure it's ")"
        }
        else {
            ret = parse_tag(str);
        }

        var multiplier = get_multiplier(str);
        var siblings = parse_siblings(str);
        var children = parse_children(str);

        if (ret.length == 2 && children.length) { // a set of sibligns can't have children
            ret.push(children);
        }

        while (multiplier--) {
            siblings.unshift(ret);
        }

        return siblings.length ? siblings : ret;
    }

    // Parses a tag, obviously..
    function parse_tag(str) {
        var name = consume_name(str);
        var props = parse_props(str);
        var current = [name, props];
        return current;
    }

    // Consume and return the multiplier if there is one
    function get_multiplier(str) {
        var strNum = "";
        if (str.length && str[0] == "*") {
            str.shift();
        }

        while(str.length && str[0].match(/\d/)) {
            strNum += str.shift();
        }
        return parseInt(strNum, 10) || 1;
    }

    // Parse siblings
    function parse_siblings(str) {
        var ret = [];

        while (str.length && str[0] == "+") {
            str.shift();
            ret.push(parse_expr(str));
        }
        return ret;
    }

    // Parse children
    function parse_children(str) {
        var ret = [];
        if (str.length && str[0] == ">") {
            str.shift();
            ret = parse_expr(str);
        }
        return ret;
    }

    /**
     * Consume and return anything alphanumeric, a-z,0-9_-
     */
    function consume_name(str) {
        var s = "";
        while (str.length && str[0].match(/[a-zA-Z0-9]/)) {
            s += str.shift();
        }
        return s;
    }

    /**
     * Class names and IDs
     */
    function consume_class_or_id(str) {
        var s = "";
        while (str.length && str[0].match(/[a-zA-Z0-9-_]/)) {
            s += str.shift();
        }
        return s;
    }

    /**
     * Property values
     */
    function consume_value(str) {
        var s = "";
        while (str.length && str[0].match(/[a-zA-Z0-9-_#\.]/)) {
            s += str.shift();
        }
        return s;
    }

    // consume IDs, classnames and properties
    function parse_props(str) {
        var props = {};

        while (str.length) {
            var chr = str.shift();
            if (chr == ".") {
                var className = consume_class_or_id(str);
                props["class"] = props["class"] ?
                    props["class"] + " " + className :
                    className;
            }
            else if(chr == "#") {
                var id = consume_class_or_id(str);
                props["id"] = id;
            }
            else if(chr == " ") {
                var name = consume_name(str);
                str.shift(); // fixme. make sure is always "="
                var value = consume_value(str);
                props[name] = value;
            }
            else {
                str.unshift(chr);
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


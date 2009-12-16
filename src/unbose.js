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
    this.element = {};

    if (typeof subject == "string") {
        var elems = (context || document).querySelectorAll(subject);
        for (var n=0, e; e=elems[n]; n++) {
            this.elements.push(e);
        }
    }
    else if (subject.nodeType) {
        this.elements = [subject];
    }
    else if (subject.toString() == "[object Unbose]") {
        this.elements = subject.elements;
    }
    else if (subject instanceof Array) {
        this.elements = subject;
    }
    this.length = this.elements.length;
    this.element = this.elements[0];
}


var instance_methods = {
    toString: function() {
        return "[object Unbose]";
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
     },

    /**
     * Method: attr
     *
     * Set or get an attribute value. If value is given, set it. Of not,
     * just return current value.
     *
     * Parameters:
     *
     *   key - Attribute to get or set
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
    attr: function(key, val) {
        if (val === undefined) {
            return this.getAttr(key);
        }
        else {
            this.setAttr(key, val);
            return this;
        }
    },


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
        this.on("click", callback, capturing);
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
        this.elements.forEach(function(ele) {
            if (Unbose(ele).hasClass(cls)) {
                ele.className = (" " + ele.className + " ").replace(" " + cls + " ", " ");
            }
        });
        return this;
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
     * Method: empty
     *
     *   Remove all children of the element, or of all elements in the set.
     *
     * Returns:
     *
     *   The Unbose object
     *
     */
    empty: function() {
        this.elements.forEach(function(ele) {
            while (ele.firstChild) { ele.removeChild(ele.firstChild) };
        });
        return this;
    },

    filter: function(fun, context) {
        return this.elements.filter(fun, context || this);
    },

    /**
     * Method: find
     *
     *   Find decendents of the set of objects that match a selector
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
        return Unbose(selector, this.element);
    },

    /**
     * Method: first
     *
     *   Returns the Unbose object for the first element in the Unbose set
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
     * Method: getAttr
     *
     * Get the value of an attribute
     *
     * Parameters:
     *
     *   name - Name of the property to get
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
        return this.element.getAttribute(name) || this.element[name];
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
     *   This should use getComputedStyle I guess?
     *   Should it get from first or all? If all, how?
     *
     */
    getStyle: function(attr) {
        return this.element.style[attr];
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
     * Todo:
     *
     */
    getText: function() {
        return this.element.textContent || "";
    },

    /**
     * Check if element has class cls
     */
    hasClass: function(cls) {
        return this.elements.some(function(ele) {
            return ele.className.split(" ").indexOf(cls) != -1;
        });
    },

    /**
     * Returns the height of the element in pixels.
     */
    height: function() {
        //todo
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
     * Returns the last element in the set.
     */
    last: function() {
        return this.elements[this.element.length-1];
    },

    name: function() {
        return this.element.nodeName;
    },

    next: function() {
        //todo
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

        this.elements.forEach(function(ele) {
            ele.addEventListener(evt, cancelCb, capture);
        });
    },

    parent: function() {
        return Unbose(this.element.parentNode || null);
    },

    prev: function() {
        //todo
    },

    setAttr: function(key, val) {
        this.elements.forEach(function(ele) {
            ele.setAttribute(key, val);
        });
        return this;
    },

    setStyle: function(name, value) {
        // fixme: check style name map
        this.forEach(function(ele) { ele.element.style[name] = value; });
        return this;
    },

    /**
     * Set the text content of the element or set of elements
     */
    setText: function(newText) {
        this.forEach(function(ele) { ele.element.textContent = newText; });
        return this;
    },

    setVal: function(key, val) {
        this.forEach(function(ele) { ele.element.setAttribute(key, val); });
        return this;
    },

    /**
     * Show an element by clearing its display style element.
     */
    show: function() {
        //todo
    },


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
     *     *
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
     * Set cls if it's not set, if it's set, unset it.
     */
    toggleClass: function(cls) {
        this.elements.forEach(function(ele) {
            Unbose(ele)[Unbose(ele).hasClass(cls) ? "delClass" : "addClass"](cls);
        });
    },

    /**
     * Return the width of the element in pixels
     */
    width: function() {
        //todo
    },

    /**
     * Return the element(s) siblings
     */
    siblings: function() {
        var siblings = [];
        this.elements.forEach(function(element) {
            var child = element.parentNode.firstChild;
            do {
                if (child != element && child.nodeType == 1) {
                    siblings.push(child);
                }
            } while (child = child.nextSibling);
        });
        return Unbose(siblings);
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
            for (key in props) {
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
    if (elem instanceof DocumentFragment && elem.childNodes.length==1) {
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
    for (var n=0, l=whatever.length; n<l; n++) {
        ret.push(whatever[n]);
    }
};

Unbose.tplFromZen = function(zen) {
    return parse_zencode(zen);

    // Here's a whole bunch of private functions for doing the actual parsing.

    function parse_zencode(str) {
        str = str.split("");
        var ret = [];
        var n=10;
        while (str.length && --n) {
            ret = ret.concat((parse_expr(str)));
        }
        return ret;
    }

    function parse_expr(str) {
        var ret;
        if (str[0] == "(") {
            str.shift();
            ret = parse_expr(str);
            str.shift(); // fixme Make sure it's ")"
        } else {
            ret = parse_tag(str);
        }

        var multiplier = get_multiplier(str);
        var siblings = parse_siblings(str);
        var children = parse_children(str);

        if (ret.length==2) { // something with children can't have children
            if (children.length) {
                ret.push(children);
            }
        }

        // fixme double digits
        if (multiplier > 1) {
            while (--multiplier) {
                siblings.unshift(ret);
            }
        }

        if (siblings.length) {
            siblings.unshift(ret);
            return siblings;
        }
        else {
            return ret;
        }
    }

    function parse_tag(str) {
        var name = consume_name(str);
        var props = parse_props(str);
        var current = [name, props];
        return current;
    }

    function get_multiplier(str) {
        var ret = 1;
        if (str.length && str[0]=="*") {
            str.shift();
            ret = parseInt(str.shift(), 10);
        }
        return ret;
    }

    function parse_siblings(str) {
        var ret = [];

        while (str.length && str[0] == "+") {
            str.shift();
            ret.push(parse_expr(str));
        }
        return ret;
    }

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

    function parse_props(str) {
        var props = {};

        while (str.length) {
            var chr = str.shift();
            if (chr == ".") {
                var className = consume_name(str);
                if ("class" in props) {
                    props["class"] = props["class"] + " " + className;
                } else {
                    props["class"] = className;
                }
            }
            else if(chr == "#") {
                var id = consume_name(str);
                props["id"] = id;
            }
            else if(chr == " ") {
                var name = consume_name(str);
                str.shift(); // fixme. make sure is always "="
                var value = consume_name(str);
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

Unbose.eleFromZen = function(zen) {
    return this.eleFromTpl(this.tplFromZen(zen));
};

Unbose.prototype = instance_methods;


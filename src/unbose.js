/**
 * Class: unbose
 *
 * Subject can be string selector, array (presumed to be of elements),
 * element, unbose object.
 */
function unbose(subject, context) {
    if (! (this instanceof unbose)) {
        return new unbose(subject, context);
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
    else if (subject.unbose) {
        this.elements = subject.elements;
    }
    this.length = this.elements.length;
    this.element = this.elements[0];
}


var instance_methods = {
    unbose: true, // typeof helper

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
     *   The unbose object
     *
     * See also:
     *
     *   <delClass>, <hasClass>, <toggleClass>
     *
     */
    addClass: function(cls) {
        this.elements.forEach(function(ele) {
            if (!unbose(ele).hasClass(cls)) {
                ele.className = ele.className + " " + cls;
            }
        });
        return this;
    },

    /**
     * Method: appendTemplate
     *
     * Append elements from a template to all elements
     *
     * Parameters:
     *
     *   tpl - Template array
     *
     * Returns:
     *
     *   The unbose object or an attribute
     *
     */
     appendTemplate: function (tpl) {
         var newEle = this.eleFromTpl(tpl);
         this.elements.forEach(function(ele) {
             ele.appendChild(newEle.clone(true));
         });
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
     *   The unbose object or an attribute
     *
     * See also:
     *
     *   <getAttr>, <setAttr>
     *
     */
    attr: function(key, val) {
        if (val===undefined) {
            return this.getAttr(key);
        } else {
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
     *   The unbose object
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
     *   The unbose object
     *
     * See also:
     *
     *   <addClass>, <hasClass>, <toggleClass>
     *
     */
    delClass: function(cls) {
        this.elements.forEach(function(ele) {
            if (unbose(ele).hasClass(cls)) {
                ele.className = (" " + ele.className + " ").replace(" " + cls + " ", " ");
            }
        });
        return this;
    },

    /**
     * Method: elem
     *
     * Gets an HTMLElement from the unbose object.
     *
     * Parameters:
     *
     *   index - The index of the element in the set
     *
     * Returns:
     *
     *   An HTMLElement
     *
     */
    elem: function(index) {
        return this.elements[index];
    },

    /**
     * Method: empty
     *
     *   Remove all children of the element, or of all elements in the set.
     *
     * Returns:
     *
     *   The unbose object
     *
     */
    empty: function() {
        this.element.forEach(function(ele){
            while(ele.firstChild(ele.removeChild(ele.firstChild)));
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
     *   An unbose object
     *
     */
    find: function(selector) {
        return unbose(selector, this.element);
    },

    /**
     * Method: first
     *
     *   Returns the unbose object for the first element in the unbose set
     *
     * Returns:
     *
     *   An unbose object
     *
     * See also:
     *
     * <last>, <nth>
     *
     */
    first: function() {
        return unbose(this.elements[0]);
    },

    /**
     * Method: forEach
     *
     * Call a function for all elements in the unbose set
     *
     * Parameters:
     *
     *   function - The function to call
     *   context - (optional) context, the value of "this" for the function
     *             calls
     *
     * Returns:
     *
     *   An unbose object
     *
     * Todo:
     *
     *   Should we pass ele or unbose object to args?
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
     * unbose("#logo").attr("src", "logo.png");
     * (end)
     *
     */
    getAttr: function(name) {
        return this.element.getAttribute(name) || this.element[name];
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
            return (" " + ele.className + " ").indexOf(" " + cls + " ") != -1;
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
     *   The unbose object
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
        return this.elements[this.element.length=1];
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
     * Returns the unbose object for the nth element in the unbose set
     *
     * Parameters:
     *
     *   index - index in the list
     *
     * Returns:
     *
     *   An unbose object
     *
     * Example:
     *
     * Get the second h1 tag in the document:
     * (example)
     * unbose("h1").nth(1);
     * (end)
     *
     * See also:
     *
     * <first>, <last>
     *
     */
    nth: function(index) {
        return unbose(this.elements[index]);
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
     *   An unbose object
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
     *   An unbose object
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
        return unbose(this.element.parentNode || null);
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
        this.forEach(function(item) {item.element.style[name] = value;});
        return this;
    },

    /**
     * Set the text content of the element or set of elements
     */
    setText: function(newText) {
        this.forEach(function(item) {item.element.textContent = newText;});
        return this;
    },

    setVal: function(key, val) {
        this.forEach(function(item) {item.element.setAttribute(key, val);});
        return this;
    },

    /**
     * Show an element by clearing its display style element.
     */
    show: function() {
        //todo
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
     *   An unbose object or a string
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
            var classes = ele.className.split(/\s+/);
            var index = classes.indexOf(cls);
            if (index != -1) {
                classes.splice(index, 1);
            }
            else {
                classes.push(cls);
            }
            ele.className = classes.join(" ");
        });
    },

    /**
     * Return the width of the element in pixels
     */
    width: function() {
        //todo
    }

};


// static methods:
unbose.eleFromTpl = function(tpl) {
    var index = 0;
    var elem = document.createDocumentFragment();
    if (typeof tpl[index] === "string") {
        elem = document.createElement(tpl[index]);
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
    while (cur=(tpl[index++])) {
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
};

/**
 * Todo:
 *
 *   Arbitrary number of args
 */
unbose.list = function(whatever) {
    var ret = [];
    for (var n=0, l=whatever.length; n<l; n++) {
        ret.push(whatever[n]);
    }
};



unbose.prototype = instance_methods;

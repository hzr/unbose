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

    this.elements = [];
    this.length = 0;

    if (!subject) { return this; }

    if (typeof subject == "string") {
        var eles = (context || document).querySelectorAll(subject);
        for (var i = 0, ele; ele = eles[i]; i++) {
            this.elements.push(ele);
        }
    }
    else if (Unbose.isArray(subject)) {
        this.elements = subject;
    }
    else if (subject.nodeType == Node.ELEMENT_NODE) {
        this.elements = [subject];
    }
    else if (subject.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
        var child = subject.firstChild;
        while (child) {
            if (child.nodeType == Node.ELEMENT_NODE) {
                this.elements.push(child);
            }
            child = child.nextSibling;
        }
    }
    else if (subject.toString() == "[object Unbose]") {
        this.elements = subject.elements;
    }
    else if (Unbose.isFunction(subject)) {
        // Fails in Webkit if there's nothing after <head>, so make sure
        // there's always something explicit in <body>
        document.addEventListener("DOMContentLoaded", function ready() {
            subject();
            // I wonder if this is neccessary. jQuery does it, but shouldn't browser's themselves do it?
            document.removeEventListener("DOMContentLoaded", ready, false);
        }, false);
    }

    // TODO: handle Unbose(window|document)

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
     *   name - Name of the event. To attach multiple event handlers,
     *          just separate them with a space.
     *   callback - Function called when event occurs
     *   capture - Use capturing
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    on: function(names, callback, capture) {
        names.split(" ").forEach(function(name) {
            this.elements.forEach(function(ele) {
                ele.addEventListener(name, callback, capture || false);
            });
        }, this);
        return this;
    },

    /**
     * Method: once
     *
     * Add an event listener to the set of elements that will be called once
     * and then removed. If multiple events supplied, all will be removed once
     * one of them is triggered.
     *
     * Parameters:
     *
     *   name - Name of the event. To attach multiple event handlers,
     *          just separate them with a space.
     *   callback - Function called when event occurs
     *   capture - Use capturing
     *
     * Returns:
     *
     *   An Unbose object
     *
     */
    once: function(names, callback, capture) {
        function cancelCb(evt) {
            names.split(" ").forEach(function(name) {
                this.removeEventListener(name, cancelCb, capture);
            }, this);
            callback.apply(this, arguments);
        };
        return this.on(names, cancelCb, capture);
    },

    /**
     *
     */
    filter: function(filter) {
        var eles = this.elements;
        if (filter !== undefined) {
            eles = eles.filter(function(ele) {
                return new Unbose(ele).matchesSelector(filter);
            });
        }
        return new Unbose(eles);
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
        return new Unbose(selector, this.elements[0]);
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
     *   - Element names
     *   - Class names
     *   - IDs
     *   - Chains of the above
     *   - Multiple selectors separated by comma
     *
     */
    matchesSelector: function(selector) {
        var selectors = selector.split(/\s*,\s*/);
        return selectors.some(matcher, this);

        function matcher(selector) {
            var parts = selector.split(/([#\.])/);
            var ele = this.elements[0];
            var type, value;
            var eleName = parts.shift().toLowerCase();

            if (!Unbose.trim(selector) || (eleName && eleName != ele.nodeName.toLowerCase())) {
                return false;
            }
            while ((type = parts.shift()) && (value = parts.shift())) {
                if ((type == "." && !new Unbose(ele).hasClass(value)) ||
                    (type == "#" && ele.id != value))
                {
                    return false;
                }
            }
            return true;
        }
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
     *
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
     *   case when returned.
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
            if (parent && parents.indexOf(parent) == -1) {
                parents.push(parent);
            }
        });
        return new Unbose(parents).filter(filter);
    },

    /**
     * Method: ancestor
     *
     * Get the closest ancestor matching filter.
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
    ancestor: function(filter) {
        var ancestor = [];
        this.elements.forEach(function(ele) {
            while ((ele = ele.parentNode)) {
                if (new Unbose(ele).matchesSelector(filter)) {
                    ancestor = ele;
                    break;
                }
            }
        });
        return new Unbose(ancestor);
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
        return new Unbose(children).filter(filter);
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
        return new Unbose(siblings).filter(filter);
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
     *   <last>, <nth>
     *
     */
    first: function() {
        return new Unbose(this.elements[0]);
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
     *   <first>, <nth>
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
        return new Unbose(prevs).filter(filter);
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
        return new Unbose(nexts).filter(filter);
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
        if (index < 0) { index = (index % this.length) + this.length; }
        return new Unbose(this.elements[index]);
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
        if (index < 0) { index = (index % this.length) + this.length; }
        return (index === undefined) ? this.elements : this.elements[index];
    },


    /**
     * Group: DOM
     *
     */

    /**
     * Method: append
     *
     * Append an element, an unbose object, a template or a zen
     * string. Append adds the element after the last child element.
     * append(thing) is a cleaner shorthand for insert(thing, true)
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
     *   <appendElem>, <appendTpl>, <appendUnbose>, <appendZen>, <insert>
     *
     */
    append: function(thing) {
        return this.insert(thing, true);
    },

    /**
     * Method: appendElem
     *
     * Append clones of element to all elements.
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
        return this.insertElem(newEle, true);
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
        return this.insertTpl(tpl, true);
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
    appendUnbose: function(ubobj) {
        return this.insertUnbose(ubobj, true);
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
        this.insertZen(zen, true);
    },

    /**
     * Method: insert
     *
     * Insert an element, an unbose object, a template or a zen
     * string. By default, add it as the first child of the parent. If the
     * append argument is true, the element is appended as the last child
     * element instead.
     *
     * Parameters:
     *
     *   thing - Thing to add
     *   append - append instead of insert
     *
     * Returns:
     *
     *   The Unbose object
     *
     * See also:
     *
     *   <insertElem>, <insertTpl>, <insertUnbose>, <insertZen>
     *   <appendElem>, <appendTpl>, <appendUnbose>, <appendZen>
     *
     */
    insert: function(thing, append) {
         if (Unbose.isElement(thing)) {
             return this.insertElem(thing, append);
         }
         else if (Unbose.isArray(thing)) {
             return this.insertTpl(thing, append);
         }
         else if (thing.toString() == "[object Unbose]") {
             this.insertUnbose(thing, append);
         }
         else if (typeof thing === "string") {
             this.insertZen(thing, append);
         }
         else {
             //fixme: return what?
         }
         return this;
     },

    /**
     * Method: insertElem
     *
     * Insert an element into all elements. If there are multiple elements
     * in the Unbose object, insert clones.
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
    insertElem: function(newEle, append) {
         this.elements.forEach(function(ele) {
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
     * Method: insertTpl
     *
     * Insert elements from a template to all elements
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
    insertTpl: function(tpl, append) {
        return this.insertElem(Unbose.eleFromTpl(tpl), append);
     },

    /**
     * Method: insertUnbose
     *
     * Insert an element in to all elements. If there are multiple elements
     * in the Unbose object, insert clones.
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
    insertUnbose: function(ubobj, append) {
         ubobj.elements.forEach(function(ele) {
             this.appendElem(ele, append);
         }, this);
         return this;
     },

    /**
     * Method: insertZen
     *
     * insert elements from a zencoding string
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
    insertZen: function (zen, append) {
        return this.insertTpl(Unbose.tplFromZen(zen), append);
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
        return (this.elements[0] && this.elements[0].getAttribute(name) || this.elements[0][name]) || undefined;
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
     *   text - (optional) new string
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
    text: function(text) {
        return (text === undefined) ? this.getText() : this.setText(text);
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
        return (this.elements[0] && this.elements[0].textContent) || "";
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
        this.elements.forEach(function(ele) { ele.textContent = text; });
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
        return this.elements[0] && this.elements[0].value;
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
            return (this.elements[0] && this.elements[0].getAttribute("data-unbose-" + name)) || undefined;
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
        if (!ele) { return undefined; }
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
        // Normalize properties
        prop = prop.toLowerCase().replace(/-([a-z])/g, function(all, letter) {
            return letter.toUpperCase();
        });

        if (prop == "float") {
            prop = "cssFloat";
        }

        if (+value === parseFloat(value) && ["fontWeight", "lineHeight", "opacity", "zIndex"].indexOf(prop) == -1) {
            value = (+value | 0) + "px";
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
            if (!ele) { return 0; }
            var uele = new Unbose(ele);
            return ele.offsetWidth -
                   parseInt(uele.getStyle("border-left-width")) -
                   parseInt(uele.getStyle("border-right-width")) -
                   parseInt(uele.getStyle("padding-left")) -
                   parseInt(uele.getStyle("padding-right"));
        }
        else if (ele) {
            if (+value === parseFloat(value)) {
                value = (+value | 0) + "px";
            }
            if (parseInt(value) < 0) {
                value = 0;
            }
            ele.style.width = value;
        }
        return this;
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
            if (!ele) { return 0; }
            var uele = new Unbose(ele);
            return ele.offsetHeight -
                   parseInt(uele.getStyle("border-top-width")) -
                   parseInt(uele.getStyle("border-bottom-width")) -
                   parseInt(uele.getStyle("padding-top")) -
                   parseInt(uele.getStyle("padding-bottom"));
        }
        else if (ele) {
            if (+value === parseFloat(value)) {
                value = (+value | 0) + "px";
            }
            if (parseInt(value) < 0) {
                value = 0;
            }
            ele.style.height = value;
        }
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
            return ele.className.split(/\s+/).indexOf(cls) != -1;
        });
    },

    /**
     * Method: addClass
     *
     * Add a class or classes to the element, or to all elements in the set
     *
     * Parameters:
     *
     *   cls - The class name to add as a string.
     *   cls2 - Any number of optional addition class name parameters to add
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
    addClass: function(/* multiple arguments */) {
        var classes = Array.prototype.join.call(arguments, " ")
                           .replace(/^\s+|\s+$/g, "")
                           .split(/\s+/);
        this.elements.forEach(function(ele) {
            var className = ele.className;
            classes.forEach(function(cls) {
                if (!new Unbose(ele).hasClass(cls)) {
                    className += " " + cls;
                }
            });
            ele.className = className;
        });
        return this;
    },

    /**
     * Method: delClass
     *
     * Removes a class or classes from the element, or from all elements in the set
     *
     * Parameters:
     *
     *   cls - The class name to delete as a string.
     *   cls2 - Any number of optional addition class name parameters to delete also
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
    delClass: function(/* multiple arguments */) {
        var classes = Array.prototype.join.call(arguments, " ")
                           .replace(/^\s+|\s+$/g,"")
                           .split(/\s+/);
        this.elements.forEach(function(ele) {
            var className = (" " + ele.className + " ").replace(/\s+/g, " ");
            classes.forEach(function(cls) {
                className = className.replace(" " + cls + " ", " ");
            });
            ele.className = className.replace(/^\s+|\s$/g, "");
        });
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
            var uele = new Unbose(ele);
            uele[uele.hasClass(cls) ? "delClass" : "addClass"](cls);
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
            var uele = new Unbose(ele);
            uele.data("olddisplay", uele.style("display"))
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
            ele.style.display = new Unbose(ele).data("olddisplay") || "";
        });
        return this;
    }
};


/**
 * Group: Static methods
 *
 */

Unbose.eleFromTpl = function(tpl) {
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
    // fixme: what if data has something falsey?
    while (cur = (tpl[index++])) {
        if (typeof cur === "string") {
            ele.appendChild(document.createTextNode(cur));
        }
        else {
            ele.appendChild(Unbose.eleFromTpl(cur));
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
 * Method: tplFromZen (static)
 *
 * Converts a template array to an element (NOT to an unbose object atm)
 */
Unbose.tplFromZen = function(zen) {
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
            chars.shift(); // fixme Make sure it's ")"
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
 * Method: eleFromZen (static)
 *
 * Create an html element from a zencode string
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
 * <fromZen>
 *
 */
Unbose.eleFromZen = function(zen) {
    return Unbose.eleFromTpl(Unbose.tplFromZen(zen));
};

/**
 * Method: fromZen (static)
 *
 * Create an unbose object from a zencode string
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
 * <eleFromZen>
 *
 */
Unbose.fromZen = function(zen) {
    return new Unbose(Unbose.eleFromZen(zen));
};

/**
 * Method: isArray (static)
 *
 * Check if an object is an array
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
 *   Copied from:
 *   http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
 *
 */
Unbose.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
};
// Use native Array.isArray if available
if (Array.isArray) {
    Unbose.isArray = Array.isArray;
}

/**
 * Method: isFunction (static)
 *
 * Check if an object is a function
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
Unbose.isFunction = function(obj) {
    return Object.prototype.toString.call(obj) === "[object Function]";
};

/**
 * Method: isElement (static)
 *
 * Check if an object is an element
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
Unbose.isElement = function(obj) {
    return !!(obj && obj.nodeType == Node.ELEMENT_NODE);
};

/**
 * Method: trim (static)
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
Unbose.trim = function(text) {
    return (text || "").replace(/^\s+|\s+$/g, "");
};

if (String.prototype.trim) {
    Unbose.trim = function(text) {
        return String.prototype.trim.call(text);
    };
}

/**
 * Method: nop (static)
 *
 * Empty function. Can be useful in cases where a function is required.
 *
 */
Unbose.nop = function() { };

if (!Function.prototype.bind) {
    // TODO: check this implementation against the spec.
    // Prototype for example does more funky stuff.
    Function.prototype.bind = function(context) {
        var method = this, args = Array.prototype.slice.call(arguments, 1);
        return function() {
            return method.apply(context, args);
        }
    }
}


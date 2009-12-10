

operations = {
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

    attr: function(key, val) {
        if (val===undefined) {
            return this.getAttr(key);
        } else {
            this.setAttr(key, val);
            return this;
        }
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
     */
    forEach: function(fun, context) {
        this.elements.forEach(fun, context || this);
        return this;
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
     * Hides the element or set of elements by setting the "display"
     * style property to none.
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
     * See also:
     *
     * <first>, <last>
     *
     */
    nth: function(index) {
        return unbose(this.elements[index]);
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


/**
 * Main entrypoint
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

    //alert(subject + " " + subject.constructor)

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

unbose.prototype = operations;

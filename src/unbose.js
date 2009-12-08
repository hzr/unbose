

operations = {
    unbose: true, // typeof helper

    /**
     * Add a class to the element, or to all elements in the set
     */
    addClass: function(cls) {
        this.elements.forEach(function(ele) {
            var classes = ele.className.split(/\s+/);
            if (classes.indexOf(cls) == -1) {
                classes.push(cls);
                ele.className = classes.join(" ");
            }
        });
        return this;
    },

    /**
     * Remove a class from the element, or all elements in the set
     */
    delClass: function(cls) {
        this.elements.forEach(function(ele) {
            var classes = ele.className.split(/\s+/);
            var index = classes.indexOf(cls);
            if (index != -1) {
                classes.splice(index, 1);
                ele.className = classes.join(" ");
            }
        });
        return this;
    },

    /**
     * Return the html element at index
     */
    elem: function(index) {
        return this.elements[0].element;
    },

    filter: function(fun, context) {
        return this.elements.filter(fun, context || this);
    },

    find: function(selector) {
        // fixme
        return new unbose(selector, this.element);
    },

    /**
     * Returns an unbose object wrapping the first element in the set.
     */
    first: function() {
        return this.elements[0];
    },

    getText: function() {
        return this.element.textContent;
    },

    forEach: function(fun, context) {
        this.elements.forEach(fun, context || this);
        return this;
    },

    /**
     * Check if element has class cls
     */
    hasClass: function(cls) {
        var hasClassFun = function(ele) {
            var classes = ele.className.split(/\s+/);
            return classes.indexOf(cls) > -1;
        };
        return this.elements.some(hasClassFun);
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
            ele.element.style.display = "none";
        });
        return this;
    },

    /**
     * Returns the last element in the set.
     */
    last: function() {
        return this.elements[this.element.length=1];
    },

    next: function() {
        //todo
    },

    /**
     * Returns the nth element in the set
     */
    nth: function(index) {
        return this.elements[index];
    },

    prev: function() {
        //todo
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
        //todo
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

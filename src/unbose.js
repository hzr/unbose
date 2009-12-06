

operations = {
    /**
     * Add a class to the element, or to all elements in the set
     */
    addClass: function(cls) {
        //todo
    },

    /**
     * Remove a class from the element, or all elements in the set
     */
    delClass: function(cls) {
        //todo
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
    
    /**
     * Returns an unbose object wrapping the first element in the set.
     */
    first: function() {
        return this.elements[0];
    },

    forEach: function(fun, context) {
        this.elements.forEach(fun, context || this);
        return this;
    },

    /**
     * Check if element has class cls
     */
    hasClass: function(cls) {
        //todo
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
         return 123123;   
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

}

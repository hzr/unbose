/**
 * zennode. js version of zencode
 */

function parse_zencode(str) {
    str = str.split("");
    var ret = [];
    var n=10;
    while (str.length && --n) {
        ret = ret.concat((parse_tag(str)));
    }
    return ret;
}

function parse_tag(str, ret) {
    var name = consume_name(str);
    var props = parse_props(str);
    var multiplier = get_multiplier(str);
    var children = parse_children(str);
    var siblings = parse_siblings(str);
    var current = [name, props];

    if (children.length) {
        current.push(children);
    }

    // fixme double digits
    if (multiplier > 1) {
        while (--multiplier) {
            siblings.unshift(current);
        }
    }

    if (siblings.length) {
        siblings.unshift(current);
        return siblings;
    }
    else {
        return current;
    }
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
        ret.push(parse_tag(str));
    }
    return ret;
}

function parse_children(str) {
    var ret = [];
    if (str.length && str[0] == ">") {
        str.shift();
        ret = parse_tag(str);
    }
    return ret;
}

/**
 * Cosume and return anything alphanumeric, a-z,0-9_-
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


function build_nodes(data) {
  var index = 0;
    var elem = document.createDocumentFragment();
    if (typeof data[index] === "string") {
        elem = document.createElement(data[index]); // heh
        index++;
        if (typeof data[index] === "object") {
            var props = data[index++];
            for (key in props) {
                elem.setAttribute(key, props[key]);
            }
        }
    }

    var cur;
    // fixme: what if data has something falsey?
    while (cur=(data[index++])) {
        if (typeof cur === "string") {
            elem.appendChild(document.createTextNode(cur));
        }
        else {
            elem.appendChild(build_nodes(cur));
        }
    }

    // flatten unneeded documentfragments
    if (elem instanceof DocumentFragment && elem.childNodes.length==1) {
        elem = elem.firstChild;
    }
    return elem;


}

// old version in case the new turns out broken
function build_nodes2(data) {
    alert("aaa " +JSON.stringify(data))
    var elem = document.createDocumentFragment();
    if (typeof data[0] === "string") {
        alert("NAIE" + data[0])
        elem = document.createElement(data.shift());
        if (typeof data[0] === "object") {
            var props = data.shift();
            for (key in props) {
                elem.setAttribute(key, props[key]);
            }
        }
    }
    
    var cur;
    
    while (cur=data.shift()) {
        if (typeof cur === "string") {
            elem.appendChild(document.createTextNode(cur));
        }
        else {
            elem.appendChild(build_nodes(cur));
        }
    }
    
    // alert("aaa " +(elem.childNodes.length))
    // flatten unneeded documentfragments
    if (elem instanceof DocumentFragment && elem.childNodes.length==1) {
        elem = elem.firstChild;
    }
    
    
    return elem;
}


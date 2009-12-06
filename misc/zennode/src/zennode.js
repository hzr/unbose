/**
 * zennode. js version of zencode
 */

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
        elem = document.createElement(data[index]);
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

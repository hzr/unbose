Design  goals:

- No dependencies
  - But extra features if you add them, like getJSON etc.
- Lives well along side other libs, explicit init possible
- Autodocumenting

Features:

dom
    val([newval])
    attr(name [, val]
    text([newtext])
    find(selector)
    append(ele)
    replace(ele)

selection:
    first()
    last()
    nth()
    elem()
    next
    prev

style:
    hide()
    show()
    style(name, value)
    addClass(class, *)
    hasClass(class, *)
    delClass(class, *)
    toggleClass(oldclass, newclass)
    height()
    width()



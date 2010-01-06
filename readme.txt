Design  goals:

- No dependencies
  - But extra features if you add them, like getJSON etc.
- Lives well along side other libs, explicit init possible


Features:

dom
x    val([newval])
x    attr(name [, val]
x    text([newtext])
x    find(selector)
x    append(ele)
    replace(ele)

selection:
x    first()
x    last()
x    nth()
x    elem()
x    next()
x    prev()

style:
x    hide()
x    show()
x    style(name, value)
x    addClass(class, *)
x    hasClass(class, *)
x    delClass(class, *)
x    toggleClass(class)
x    height()
x    width()



To build docs install naturaldocs and call it as follows:

naturaldocs -r -ro -i src/ -o html docs/ -p /tmp/unbosedocs

The /tmp/unbosedocs must exist


Notes:

Should support css transitions, if any special care is needed.
Should support anims using classes as anim rules. Like http://berniecode.com/writing/animator.html


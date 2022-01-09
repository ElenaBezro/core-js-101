/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  return Object.setPrototypeOf(obj, proto);
}

// enum of supported CSS selector types
const SELECTOR = Object.freeze({
  ELEMENT: 'element',
  ID: 'id',
  CLASS: 'class',
  ATTR: 'attribute',
  PSEUDO_ELEMENT: 'pseudo-element',
  PSEUDO_CLASS: 'pseudo-class',
});

// selector types which can be used only once
const SINGLE_SELECTORS = Object.freeze([SELECTOR.ID, SELECTOR.ELEMENT, SELECTOR.PSEUDO_ELEMENT]);

// expected selector order
const SELECTOR_ORDER = Object.freeze([
  SELECTOR.ELEMENT,
  SELECTOR.ID,
  SELECTOR.CLASS,
  SELECTOR.ATTR,
  SELECTOR.PSEUDO_CLASS,
  SELECTOR.PSEUDO_ELEMENT,
]);

class CssSelector {
  constructor() {
    this.strValue = '';

    this.lastSelector = undefined;
  }

  validate(selector) {
    if (this.lastSelector === selector && SINGLE_SELECTORS.includes(selector)) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }

    const lastSelectorIndex = SELECTOR_ORDER.indexOf(this.lastSelector);
    const newSelectorIndex = SELECTOR_ORDER.indexOf(selector);
    const isOrderViolated = newSelectorIndex < lastSelectorIndex;
    if (isOrderViolated) {
      throw new Error(
        `Selector parts should be arranged in the following order: ${SELECTOR_ORDER.join(', ')}`,
      );
    }
  }

  element(value) {
    const type = SELECTOR.ELEMENT;
    this.validate(type);

    this.strValue += value;
    this.lastSelector = type;

    return this;
  }

  id(value) {
    const type = SELECTOR.ID;
    this.validate(type);

    this.strValue += `#${value}`;
    this.lastSelector = type;

    return this;
  }

  class(value) {
    const type = SELECTOR.CLASS;
    this.validate(type);

    this.strValue += `.${value}`;
    this.lastSelector = type;

    return this;
  }

  attr(value) {
    const type = SELECTOR.ATTR;
    this.validate(type);

    this.strValue += `[${value}]`;
    this.lastSelector = type;

    return this;
  }

  pseudoClass(value) {
    const type = SELECTOR.PSEUDO_CLASS;
    this.validate(type);

    this.strValue += `:${value}`;
    this.lastSelector = type;

    return this;
  }

  pseudoElement(value) {
    const type = SELECTOR.PSEUDO_ELEMENT;
    this.validate(type);

    this.strValue += `::${value}`;
    this.lastSelector = type;

    return this;
  }

  stringify() {
    return this.strValue;
  }
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
const cssSelectorBuilder = {
  element(value) {
    return new CssSelector().element(value);
  },

  id(value) {
    return new CssSelector().id(value);
  },

  class(value) {
    return new CssSelector().class(value);
  },

  attr(value) {
    return new CssSelector().attr(value);
  },

  pseudoClass(value) {
    return new CssSelector().pseudoClass(value);
  },

  pseudoElement(value) {
    return new CssSelector().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return {
      stringify: () => `${selector1.stringify()} ${combinator} ${selector2.stringify()}`,
    };
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};

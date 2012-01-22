
/*
impress.coffee

impress.coffee is rewrite of the javascript based presentation tool impress.js
by Bartek Szopka (@bartaz).

The main purpoise of this rewrite is not to replace impress.js but to teach me
some coffee script. The goal is to make a completely compatible version of
impress.js in coffeescript.

MIT Licensed.

Copyright 2012 Moritz Grauel (@mo_gr)
*/

/*
helper functions
*/

(function() {
  var $$, active, byId, canvas, css, current, data, getElementFromUrl, hashTimeout, idx, impress, impressSupported, memory, pfx, prefixes, props, rotate, scale, select, selectNext, selectPrev, step, stepData, steps, styleDummy, toArray, translate, ua, _len;

  styleDummy = document.createElement('dummy').style;

  prefixes = ["Webkit", "Moz", "O", "ms", "Khtml"];

  memory = {};

  pfx = function(prop) {
    var i, props, ucProp, _i, _len;
    if (!(memory[prop] != null)) {
      ucProp = prop[0].toUpperCase() + prop.substr(1);
      props = (prop + " " + prefixes.join(ucProp + " ") + ucProp).split(" ");
      memory[prop] = null;
      for (_i = 0, _len = props.length; _i < _len; _i++) {
        i = props[_i];
        if (styleDummy[i] !== void 0) {
          memory[prop] = i;
          break;
        }
      }
    }
    return memory[prop];
  };

  byId = function(id) {
    return document.getElementById(id);
  };

  toArray = function(a) {
    return Array.prototype.slice.call(a);
  };

  $$ = function(selector, context) {
    if (context == null) context = document;
    return toArray(context.querySelectorAll(selector));
  };

  css = function(el, props) {
    var styleKey, value;
    for (styleKey in props) {
      value = props[styleKey];
      el.style[pfx(styleKey)] = value;
    }
    return el;
  };

  translate = function(t) {
    return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
  };

  rotate = function(r, revert) {
    var rX, rY, rZ;
    rX = " rotateX(" + r.x + "deg) ";
    rY = " rotateY(" + r.y + "deg) ";
    rZ = " rotateZ(" + r.z + "deg) ";
    if (revert) {
      return rZ + rY + rX;
    } else {
      return rX + rY + rZ;
    }
  };

  scale = function(s) {
    return " scale(" + s + ") ";
  };

  /*
  check support
  */

  ua = navigator.userAgent.toLowerCase();

  impressSupported = ua.search(/(iphone)|(ipod)|(ipad)|(android)/) === -1;

  /*
  DOM Elements
  */

  impress = byId("impress");

  impress.className = impressSupported ? "" : "impress-not-supported";

  canvas = document.createElement("div");

  canvas.className = "canvas";

  toArray(impress.childNodes).forEach(function(slide) {
    return canvas.appendChild(slide);
  });

  impress.appendChild(canvas);

  steps = $$(".step", impress);

  /*
  Setup
  */

  document.documentElement.style.height = "100%";

  css(document.body, {
    height: "100%",
    overflow: "hidden"
  });

  props = {
    position: "absolute",
    transformOrigin: "top left",
    transition: "all 0s ease-in-out",
    transformStyle: "preserve-3d"
  };

  css(impress, props);

  css(impress, {
    top: "50%",
    left: "50%",
    perspective: "1000px"
  });

  css(canvas, props);

  current = {
    translate: {
      x: 0,
      y: 0,
      z: 0
    },
    rotate: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: 1
  };

  /*
  position the slides on the canvas
  */

  for (idx = 0, _len = steps.length; idx < _len; idx++) {
    step = steps[idx];
    data = step.dataset;
    stepData = {
      translate: {
        x: data.x || 0,
        y: data.y || 0,
        z: data.z || 0
      },
      rotate: {
        x: data.rotateX || 0,
        y: data.rotateY || 0,
        z: data.rotateZ || data.rotate || 0
      },
      scale: data.scale || 1
    };
    step.stepData = stepData;
    console.log("step " + step + " and idx " + idx);
    if (!step.id) step.id = "step-" + idx;
    console.log("step " + step + " and id " + step.id);
    css(step, {
      position: "absolute",
      transform: "translate(-50%,-50%)" + translate(stepData.translate) + rotate(stepData.rotate) + scale(stepData.scale),
      transformStyle: "preserve-3d"
    });
  }

  /*
  make a given step active
  */

  active = null;

  hashTimeout = null;

  select = function(el) {
    var duration, target, zoomin;
    if (!((el != null) || (el.stepData != null) || el === active)) return false;
    window.scrollTo(0, 0);
    step = el.stepData;
    if (active != null) active.classList.remove("active");
    el.classList.add("active");
    impress.className = "step-" + el.id;
    window.clearTimeout(hashTimeout);
    hashTimeout = window.setTimeout(function() {
      return window.location.hash = "#/" + el.id;
    }, 1000);
    target = {
      rotate: {
        x: -parseInt(step.rotate.x, 10),
        y: -parseInt(step.rotate.y, 10),
        z: -parseInt(step.rotate.z, 10)
      },
      translate: {
        x: -step.translate.x,
        y: -step.translate.y,
        z: -step.translate.z
      },
      scale: 1 / parseFloat(step.scale)
    };
    zoomin = target.scale >= current.scale;
    duration = active ? "1s" : "0";
    css(impress, {
      perspective: step.scale * 1000 + "px",
      transform: scale(target.scale),
      transitionDuration: duration,
      transitionDelay: zoomin ? "500ms" : "0ms"
    });
    css(canvas, {
      transform: rotate(target.rotate, true) + translate(target.translate),
      transitionDuration: duration,
      transitionDelay: zoomin ? "0ms" : "500ms"
    });
    current = target;
    return active = el;
  };

  selectPrev = function() {
    var prev;
    prev = steps.indexOf(active) - 1;
    prev = prev >= 0 ? steps[prev] : steps[steps.length - 1];
    return select(prev);
  };

  selectNext = function() {
    var next;
    next = steps.indexOf(active) + 1;
    next = next < steps.length ? steps[next] : steps[0];
    return select(next);
  };

  /*
  Event Listener
  */

  document.addEventListener("keydown", function(event) {
    var _ref, _ref2;
    if ((_ref = event.keyCode) === 33 || _ref === 37 || _ref === 38) {
      selectPrev();
      event.preventDefault();
    }
    if ((_ref2 = event.keyCode) === 9 || _ref2 === 32 || _ref2 === 34 || _ref2 === 39 || _ref2 === 40) {
      selectNext();
      return event.preventDefault();
    }
  }, false);

  getElementFromUrl = function() {
    return byId(window.location.hash.replace(/^#\/?/, ""));
  };

  window.addEventListener("hashchange", function() {
    return select(getElementFromUrl());
  }, false);

  select(getElementFromUrl() || steps[0]);

}).call(this);

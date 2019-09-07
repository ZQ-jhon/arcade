var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../libs/core/enums.d.ts"/>
var pxsim;
(function (pxsim) {
    var Key;
    (function (Key) {
        Key[Key["None"] = 0] = "None";
        Key[Key["Left"] = 1] = "Left";
        Key[Key["Up"] = 2] = "Up";
        Key[Key["Right"] = 3] = "Right";
        Key[Key["Down"] = 4] = "Down";
        Key[Key["A"] = 5] = "A";
        Key[Key["B"] = 6] = "B";
    })(Key = pxsim.Key || (pxsim.Key = {}));
    function mapKey(which) {
        switch (which) {
            case 65: // A
            case 37:// Left arrow
                return Key.Left;
            case 87: // W
            case 38:// Up arrow
                return Key.Up;
            case 68: // D
            case 39:// right arrow
                return Key.Right;
            case 83: // S
            case 40:// down arrow
                return Key.Down;
            case 32: // Space
            case 81: // Q
            case 90:// Z
                return Key.A;
            case 13: // Enter
            case 88: // X
            case 69:// E
                return Key.B;
            // Player two (see the local-multiplayer package)
            case 74:// J
                return Key.Left + 7;
            case 73:// I
                return Key.Up + 7;
            case 76:// L
                return Key.Right + 7;
            case 75:// K
                return Key.Down + 7;
            case 85:// U
                return Key.A + 7;
            case 79:// O
                return Key.B + 7;
            default: return Key.None;
        }
    }
    pxsim.mapKey = mapKey;
    function pauseAsync(ms) {
        return Promise.delay(ms);
    }
    pxsim.pauseAsync = pauseAsync;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        function registerWithDal(id, evid, handler, mode) {
            if (mode === void 0) { mode = 0; }
            pxsim.board().bus.listen(id, evid, handler);
        }
        pxtcore.registerWithDal = registerWithDal;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var game;
    (function (game) {
        function takeScreenshot() {
            var b = pxsim.board();
            b.tryScreenshot();
        }
        game.takeScreenshot = takeScreenshot;
    })(game = pxsim.game || (pxsim.game = {}));
})(pxsim || (pxsim = {}));
var svgUtil;
(function (svgUtil) {
    var PatternUnits;
    (function (PatternUnits) {
        PatternUnits[PatternUnits["userSpaceOnUse"] = 0] = "userSpaceOnUse";
        PatternUnits[PatternUnits["objectBoundingBox"] = 1] = "objectBoundingBox";
    })(PatternUnits = svgUtil.PatternUnits || (svgUtil.PatternUnits = {}));
    var LengthUnit;
    (function (LengthUnit) {
        LengthUnit[LengthUnit["em"] = 0] = "em";
        LengthUnit[LengthUnit["ex"] = 1] = "ex";
        LengthUnit[LengthUnit["px"] = 2] = "px";
        LengthUnit[LengthUnit["in"] = 3] = "in";
        LengthUnit[LengthUnit["cm"] = 4] = "cm";
        LengthUnit[LengthUnit["mm"] = 5] = "mm";
        LengthUnit[LengthUnit["pt"] = 6] = "pt";
        LengthUnit[LengthUnit["pc"] = 7] = "pc";
        LengthUnit[LengthUnit["percent"] = 8] = "percent";
    })(LengthUnit = svgUtil.LengthUnit || (svgUtil.LengthUnit = {}));
    var BaseElement = /** @class */ (function () {
        function BaseElement(type) {
            this.el = elt(type);
        }
        BaseElement.prototype.attr = function (attributes) {
            for (var at in attributes) {
                this.setAttribute(at, attributes[at]);
            }
            return this;
        };
        BaseElement.prototype.setAttribute = function (name, value) {
            this.el.setAttribute(name, value.toString());
            return this;
        };
        BaseElement.prototype.id = function (id) {
            return this.setAttribute("id", id);
        };
        BaseElement.prototype.setClass = function () {
            var classes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classes[_i] = arguments[_i];
            }
            return this.setAttribute("class", classes.join(" "));
        };
        BaseElement.prototype.appendClass = function (className) {
            this.el.classList.add(className);
            return this;
        };
        BaseElement.prototype.removeClass = function (className) {
            this.el.classList.remove(className);
        };
        BaseElement.prototype.title = function (text) {
            if (!this.titleElement) {
                this.titleElement = elt("title");
                // Title has to be the first child in the DOM
                if (this.el.firstChild) {
                    this.el.insertBefore(this.titleElement, this.el.firstChild);
                }
                else {
                    this.el.appendChild(this.titleElement);
                }
            }
            this.titleElement.textContent = text;
        };
        BaseElement.prototype.setVisible = function (visible) {
            return this.setAttribute("visibility", visible ? "visible" : "hidden");
        };
        return BaseElement;
    }());
    svgUtil.BaseElement = BaseElement;
    var DrawContext = /** @class */ (function (_super) {
        __extends(DrawContext, _super);
        function DrawContext() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DrawContext.prototype.draw = function (type) {
            var el = drawable(type /*FIXME?*/);
            this.el.appendChild(el.el);
            return el;
        };
        DrawContext.prototype.element = function (type, cb) {
            cb(this.draw(type /*FIXME?*/));
            return this;
        };
        DrawContext.prototype.group = function () {
            var g = new Group();
            this.el.appendChild(g.el);
            return g;
        };
        DrawContext.prototype.appendChild = function (child) {
            this.el.appendChild(child.el);
        };
        return DrawContext;
    }(BaseElement));
    svgUtil.DrawContext = DrawContext;
    var SVG = /** @class */ (function (_super) {
        __extends(SVG, _super);
        function SVG(parent) {
            var _this = _super.call(this, "svg") || this;
            if (parent) {
                parent.appendChild(_this.el);
            }
            return _this;
        }
        SVG.prototype.define = function (cb) {
            if (!this.defs) {
                this.defs = new DefsElement(this.el);
            }
            cb(this.defs);
            return this;
        };
        return SVG;
    }(DrawContext));
    svgUtil.SVG = SVG;
    var Group = /** @class */ (function (_super) {
        __extends(Group, _super);
        function Group(parent) {
            var _this = _super.call(this, "g") || this;
            if (parent) {
                parent.appendChild(_this.el);
            }
            return _this;
        }
        Group.prototype.translate = function (x, y) {
            this.left = x;
            this.top = y;
            return this.updateTransform();
        };
        Group.prototype.scale = function (factor) {
            this.scaleFactor = factor;
            return this.updateTransform();
        };
        Group.prototype.updateTransform = function () {
            var transform = "";
            if (this.left != undefined) {
                transform += "translate(" + this.left + " " + this.top + ")";
            }
            if (this.scaleFactor != undefined) {
                transform += " scale(" + this.scaleFactor + ")";
            }
            this.setAttribute("transform", transform);
            return this;
        };
        return Group;
    }(DrawContext));
    svgUtil.Group = Group;
    var Pattern = /** @class */ (function (_super) {
        __extends(Pattern, _super);
        function Pattern() {
            return _super.call(this, "pattern") || this;
        }
        Pattern.prototype.units = function (kind) {
            return this.setAttribute("patternUnits", kind === PatternUnits.objectBoundingBox ? "objectBoundingBox" : "userSpaceOnUse");
        };
        Pattern.prototype.contentUnits = function (kind) {
            return this.setAttribute("patternContentUnits", kind === PatternUnits.objectBoundingBox ? "objectBoundingBox" : "userSpaceOnUse");
        };
        Pattern.prototype.size = function (width, height) {
            this.setAttribute("width", width);
            this.setAttribute("height", height);
            return this;
        };
        return Pattern;
    }(DrawContext));
    svgUtil.Pattern = Pattern;
    var DefsElement = /** @class */ (function (_super) {
        __extends(DefsElement, _super);
        function DefsElement(parent) {
            var _this = _super.call(this, "defs") || this;
            parent.appendChild(_this.el);
            return _this;
        }
        DefsElement.prototype.create = function (type, id) {
            var el;
            switch (type) {
                case "path":
                    el = new Path();
                    break;
                case "pattern":
                    el = new Pattern();
                    break;
                case "radialGradient":
                    el = new RadialGradient();
                    break;
                case "linearGradient":
                    el = new LinearGradient();
                    break;
                default: el = new BaseElement(type);
            }
            el.id(id);
            this.el.appendChild(el.el);
            return el;
        };
        return DefsElement;
    }(BaseElement));
    svgUtil.DefsElement = DefsElement;
    var Drawable = /** @class */ (function (_super) {
        __extends(Drawable, _super);
        function Drawable() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Drawable.prototype.at = function (x, y) {
            this.setAttribute("x", x);
            this.setAttribute("y", y);
            return this;
        };
        Drawable.prototype.moveTo = function (x, y) {
            return this.at(x, y);
        };
        Drawable.prototype.fill = function (color, opacity) {
            this.setAttribute("fill", color);
            if (opacity != undefined) {
                this.opacity(opacity);
            }
            return this;
        };
        Drawable.prototype.opacity = function (opacity) {
            return this.setAttribute("fill-opacity", opacity);
        };
        Drawable.prototype.stroke = function (color, width) {
            this.setAttribute("stroke", color);
            if (width != undefined) {
                this.strokeWidth(width);
            }
            return this;
        };
        Drawable.prototype.strokeWidth = function (width) {
            return this.setAttribute("stroke-width", width);
        };
        Drawable.prototype.strokeOpacity = function (opacity) {
            return this.setAttribute("stroke-opacity", opacity);
        };
        Drawable.prototype.onDown = function (handler) {
            svgUtil.events.down(this.el, handler);
            return this;
        };
        Drawable.prototype.onUp = function (handler) {
            svgUtil.events.up(this.el, handler);
            return this;
        };
        Drawable.prototype.onMove = function (handler) {
            svgUtil.events.move(this.el, handler);
            return this;
        };
        Drawable.prototype.onEnter = function (handler) {
            svgUtil.events.enter(this.el, handler);
            return this;
        };
        Drawable.prototype.onLeave = function (handler) {
            svgUtil.events.leave(this.el, handler);
            return this;
        };
        Drawable.prototype.onClick = function (handler) {
            svgUtil.events.click(this.el, handler);
            return this;
        };
        return Drawable;
    }(DrawContext));
    svgUtil.Drawable = Drawable;
    var Text = /** @class */ (function (_super) {
        __extends(Text, _super);
        function Text(text) {
            var _this = _super.call(this, "text") || this;
            if (text != undefined) {
                _this.text(text);
            }
            return _this;
        }
        Text.prototype.text = function (text) {
            this.el.textContent = text;
            return this;
        };
        Text.prototype.fontFamily = function (family) {
            return this.setAttribute("font-family", family);
        };
        Text.prototype.fontSize = function (size, units) {
            return this.setAttribute("font-size", lengthWithUnits(size, units));
        };
        Text.prototype.alignmentBaseline = function (type) {
            return this.setAttribute("alignment-baseline", type);
        };
        Text.prototype.anchor = function (type) {
            return this.setAttribute("text-anchor", type);
        };
        return Text;
    }(Drawable));
    svgUtil.Text = Text;
    var Rect = /** @class */ (function (_super) {
        __extends(Rect, _super);
        function Rect() {
            return _super.call(this, "rect") || this;
        }
        ;
        Rect.prototype.width = function (width, unit) {
            if (unit === void 0) { unit = LengthUnit.px; }
            return this.setAttribute("width", lengthWithUnits(width, unit));
        };
        Rect.prototype.height = function (height, unit) {
            if (unit === void 0) { unit = LengthUnit.px; }
            return this.setAttribute("height", lengthWithUnits(height, unit));
        };
        Rect.prototype.corner = function (radius) {
            return this.corners(radius, radius);
        };
        Rect.prototype.corners = function (rx, ry) {
            this.setAttribute("rx", rx);
            this.setAttribute("ry", ry);
            return this;
        };
        Rect.prototype.size = function (width, height, unit) {
            if (unit === void 0) { unit = LengthUnit.px; }
            this.width(width, unit);
            this.height(height, unit);
            return this;
        };
        return Rect;
    }(Drawable));
    svgUtil.Rect = Rect;
    var Circle = /** @class */ (function (_super) {
        __extends(Circle, _super);
        function Circle() {
            return _super.call(this, "circle") || this;
        }
        Circle.prototype.at = function (cx, cy) {
            this.setAttribute("cx", cx);
            this.setAttribute("cy", cy);
            return this;
        };
        Circle.prototype.radius = function (r) {
            return this.setAttribute("r", r);
        };
        return Circle;
    }(Drawable));
    svgUtil.Circle = Circle;
    var Ellipse = /** @class */ (function (_super) {
        __extends(Ellipse, _super);
        function Ellipse() {
            return _super.call(this, "ellipse") || this;
        }
        Ellipse.prototype.at = function (cx, cy) {
            this.setAttribute("cx", cx);
            this.setAttribute("cy", cy);
            return this;
        };
        Ellipse.prototype.radius = function (rx, ry) {
            this.setAttribute("rx", rx);
            this.setAttribute("ry", ry);
            return this;
        };
        return Ellipse;
    }(Drawable));
    var Line = /** @class */ (function (_super) {
        __extends(Line, _super);
        function Line() {
            return _super.call(this, "line") || this;
        }
        Line.prototype.at = function (x1, y1, x2, y2) {
            this.from(x1, y1);
            if (x2 != undefined && y2 != undefined) {
                this.to(x2, y2);
            }
            return this;
        };
        Line.prototype.from = function (x1, y1) {
            this.setAttribute("x1", x1);
            this.setAttribute("y1", y1);
            return this;
        };
        Line.prototype.to = function (x2, y2) {
            this.setAttribute("x2", x2);
            this.setAttribute("y2", y2);
            return this;
        };
        return Line;
    }(Drawable));
    svgUtil.Line = Line;
    var PolyElement = /** @class */ (function (_super) {
        __extends(PolyElement, _super);
        function PolyElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PolyElement.prototype.points = function (points) {
            return this.setAttribute("points", points);
        };
        PolyElement.prototype.with = function (points) {
            return this.points(points.map(function (_a) {
                var x = _a.x, y = _a.y;
                return x + " " + y;
            }).join(","));
        };
        return PolyElement;
    }(Drawable));
    svgUtil.PolyElement = PolyElement;
    var Polyline = /** @class */ (function (_super) {
        __extends(Polyline, _super);
        function Polyline() {
            return _super.call(this, "polyline") || this;
        }
        return Polyline;
    }(PolyElement));
    svgUtil.Polyline = Polyline;
    var Polygon = /** @class */ (function (_super) {
        __extends(Polygon, _super);
        function Polygon() {
            return _super.call(this, "polygon") || this;
        }
        return Polygon;
    }(PolyElement));
    svgUtil.Polygon = Polygon;
    var Path = /** @class */ (function (_super) {
        __extends(Path, _super);
        function Path() {
            var _this = _super.call(this, "path") || this;
            _this.d = new PathContext();
            return _this;
        }
        Path.prototype.update = function () {
            return this.setAttribute("d", this.d.toAttribute());
        };
        Path.prototype.path = function (cb) {
            cb(this.d);
            return this.update();
        };
        return Path;
    }(Drawable));
    svgUtil.Path = Path;
    var Gradient = /** @class */ (function (_super) {
        __extends(Gradient, _super);
        function Gradient() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Gradient.prototype.units = function (kind) {
            return this.setAttribute("gradientUnits", kind === PatternUnits.objectBoundingBox ? "objectBoundingBox" : "userSpaceOnUse");
        };
        Gradient.prototype.stop = function (offset, color, opacity) {
            var s = elt("stop");
            s.setAttribute("offset", offset + "%");
            if (color != undefined) {
                s.setAttribute("stop-color", color);
            }
            if (opacity != undefined) {
                s.setAttribute("stop-opacity", opacity);
            }
            this.el.appendChild(s);
            return this;
        };
        return Gradient;
    }(BaseElement));
    svgUtil.Gradient = Gradient;
    var LinearGradient = /** @class */ (function (_super) {
        __extends(LinearGradient, _super);
        function LinearGradient() {
            return _super.call(this, "linearGradient") || this;
        }
        LinearGradient.prototype.start = function (x1, y1) {
            this.setAttribute("x1", x1);
            this.setAttribute("y1", y1);
            return this;
        };
        LinearGradient.prototype.end = function (x2, y2) {
            this.setAttribute("x2", x2);
            this.setAttribute("y2", y2);
            return this;
        };
        return LinearGradient;
    }(Gradient));
    svgUtil.LinearGradient = LinearGradient;
    var RadialGradient = /** @class */ (function (_super) {
        __extends(RadialGradient, _super);
        function RadialGradient() {
            return _super.call(this, "radialGradient") || this;
        }
        RadialGradient.prototype.center = function (cx, cy) {
            this.setAttribute("cx", cx);
            this.setAttribute("cy", cy);
            return this;
        };
        RadialGradient.prototype.focus = function (fx, fy, fr) {
            this.setAttribute("fx", fx);
            this.setAttribute("fy", fy);
            this.setAttribute("fr", fr);
            return this;
        };
        RadialGradient.prototype.radius = function (r) {
            return this.setAttribute("r", r);
        };
        return RadialGradient;
    }(Gradient));
    svgUtil.RadialGradient = RadialGradient;
    function elt(type) {
        var el = document.createElementNS("http://www.w3.org/2000/svg", type);
        return el;
    }
    function drawable(type) {
        switch (type) {
            case "text": return new Text();
            case "circle": return new Circle();
            case "rect": return new Rect();
            case "line": return new Line();
            case "polygon": return new Polygon();
            case "polyline": return new Polyline();
            case "path": return new Path();
            default: return new Drawable(type);
        }
    }
    var PathContext = /** @class */ (function () {
        function PathContext() {
            this.ops = [];
        }
        PathContext.prototype.clear = function () {
            this.ops = [];
        };
        PathContext.prototype.moveTo = function (x, y) {
            return this.op("M", x, y);
        };
        PathContext.prototype.moveBy = function (dx, dy) {
            return this.op("m", dx, dy);
        };
        PathContext.prototype.lineTo = function (x, y) {
            return this.op("L", x, y);
        };
        PathContext.prototype.lineBy = function (dx, dy) {
            return this.op("l", dx, dy);
        };
        PathContext.prototype.cCurveTo = function (c1x, c1y, c2x, c2y, x, y) {
            return this.op("C", c1x, c1y, c2x, c2y, x, y);
        };
        PathContext.prototype.cCurveBy = function (dc1x, dc1y, dc2x, dc2y, dx, dy) {
            return this.op("c", dc1x, dc1y, dc2x, dc2y, dx, dy);
        };
        PathContext.prototype.qCurveTo = function (cx, cy, x, y) {
            return this.op("Q", cx, cy, x, y);
        };
        PathContext.prototype.qCurveBy = function (dcx, dcy, dx, dy) {
            return this.op("q", dcx, dcy, dx, dy);
        };
        PathContext.prototype.sCurveTo = function (cx, cy, x, y) {
            return this.op("S", cx, cy, x, y);
        };
        PathContext.prototype.sCurveBy = function (dcx, dcy, dx, dy) {
            return this.op("s", dcx, dcy, dx, dy);
        };
        PathContext.prototype.tCurveTo = function (x, y) {
            return this.op("T", x, y);
        };
        PathContext.prototype.tCurveBy = function (dx, dy) {
            return this.op("t", dx, dy);
        };
        PathContext.prototype.arcTo = function (rx, ry, xRotate, large, sweepClockwise, x, y) {
            return this.op("A", rx, ry, xRotate, large ? 1 : 0, sweepClockwise ? 1 : 0, x, y);
        };
        PathContext.prototype.close = function () {
            return this.op("z");
        };
        PathContext.prototype.toAttribute = function () {
            return this.ops.map(function (op) { return op.op + " " + op.args.join(" "); }).join(" ");
        };
        PathContext.prototype.op = function (op) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.ops.push({
                op: op,
                args: args
            });
            return this;
        };
        return PathContext;
    }());
    svgUtil.PathContext = PathContext;
    function lengthWithUnits(value, unit) {
        switch (unit) {
            case LengthUnit.em: return value + "em";
            case LengthUnit.ex: return value + "ex";
            case LengthUnit.px: return value + "px";
            case LengthUnit.in: return value + "in";
            case LengthUnit.cm: return value + "cm";
            case LengthUnit.mm: return value + "mm";
            case LengthUnit.pt: return value + "pt";
            case LengthUnit.pc: return value + "pc";
            case LengthUnit.percent: return value + "%";
            default: return value.toString();
        }
    }
})(svgUtil || (svgUtil = {}));
(function (svgUtil) {
    var events;
    (function (events) {
        function isTouchEnabled() {
            return typeof window !== "undefined" &&
                ('ontouchstart' in window // works on most browsers
                    || (navigator && navigator.maxTouchPoints > 0)); // works on IE10/11 and Surface);
        }
        events.isTouchEnabled = isTouchEnabled;
        function hasPointerEvents() {
            return typeof window != "undefined" && !!window.PointerEvent;
        }
        events.hasPointerEvents = hasPointerEvents;
        function down(el, handler) {
            if (hasPointerEvents()) {
                el.addEventListener("pointerdown", handler);
            }
            else if (isTouchEnabled()) {
                el.addEventListener("mousedown", handler);
                el.addEventListener("touchstart", handler);
            }
            else {
                el.addEventListener("mousedown", handler);
            }
        }
        events.down = down;
        function up(el, handler) {
            if (hasPointerEvents()) {
                el.addEventListener("pointerup", handler);
            }
            else if (isTouchEnabled()) {
                el.addEventListener("mouseup", handler);
            }
            else {
                el.addEventListener("mouseup", handler);
            }
        }
        events.up = up;
        function enter(el, handler) {
            if (hasPointerEvents()) {
                el.addEventListener("pointerover", function (e) {
                    handler(!!(e.buttons & 1));
                });
            }
            else if (isTouchEnabled()) {
                el.addEventListener("touchstart", function (e) {
                    handler(true);
                });
            }
            else {
                el.addEventListener("mouseover", function (e) {
                    handler(!!(e.buttons & 1));
                });
            }
        }
        events.enter = enter;
        function leave(el, handler) {
            if (hasPointerEvents()) {
                el.addEventListener("pointerleave", handler);
            }
            else if (isTouchEnabled()) {
                el.addEventListener("touchend", handler);
            }
            else {
                el.addEventListener("mouseleave", handler);
            }
        }
        events.leave = leave;
        function move(el, handler) {
            if (hasPointerEvents()) {
                el.addEventListener("pointermove", handler);
            }
            else if (isTouchEnabled()) {
                el.addEventListener("touchmove", handler);
            }
            else {
                el.addEventListener("mousemove", handler);
            }
        }
        events.move = move;
        function click(el, handler) {
            el.addEventListener("click", handler);
        }
        events.click = click;
    })(events = svgUtil.events || (svgUtil.events = {}));
})(svgUtil || (svgUtil = {}));
(function (svgUtil) {
    var helpers;
    (function (helpers) {
        var CenteredText = /** @class */ (function (_super) {
            __extends(CenteredText, _super);
            function CenteredText() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            CenteredText.prototype.at = function (cx, cy) {
                this.cx = cx;
                this.cy = cy;
                this.rePosition();
                return this;
            };
            CenteredText.prototype.text = function (text, fontSizePixels) {
                if (fontSizePixels === void 0) { fontSizePixels = 12; }
                _super.prototype.text.call(this, text);
                this.fontSizePixels = fontSizePixels;
                this.setAttribute("font-size", fontSizePixels + "px");
                this.rePosition();
                return this;
            };
            CenteredText.prototype.rePosition = function () {
                if (this.cx == undefined || this.cy == undefined || this.fontSizePixels == undefined) {
                    return;
                }
                this.setAttribute("x", this.cx);
                this.setAttribute("y", this.cy);
                this.setAttribute("text-anchor", "middle");
                this.setAttribute("alignment-baseline", "middle");
            };
            return CenteredText;
        }(svgUtil.Text));
        helpers.CenteredText = CenteredText;
    })(helpers = svgUtil.helpers || (svgUtil.helpers = {}));
})(svgUtil || (svgUtil = {}));
/// <reference path="./svg.ts" />
var pxsim;
(function (pxsim) {
    var s = svgUtil;
    var COMPONENT_WIDTH = 60;
    var PADDING = 5;
    var D_PAD_SVG_WIDTH = 23.813;
    var BUTTON_SVG_WIDTH = 13.533;
    pxsim.MENU_RESET_ASPECT_RATIO = 45 / 120;
    var ControlPad = /** @class */ (function () {
        function ControlPad(parent) {
            var _this = this;
            this.keys = [];
            this.dPadRoot = new s.SVG(parent);
            this.buttonsRoot = new s.SVG(parent);
            this.reset = new s.SVG(parent);
            this.menu = new s.SVG(parent);
            this.buildDom();
            var clearBtns = function () {
                for (var _i = 0, _a = _this.keys; _i < _a.length; _i++) {
                    var k = _a[_i];
                    if (k.isDown) {
                        k.isDown = false;
                        pxsim.board().handleKeyEvent(k.key, k.isDown);
                    }
                }
            };
            pxsim.svg.buttonEvents(parent, function (ev) { return _this.btnEvent(ev); }, function (ev) { return _this.btnEvent(ev); }, clearBtns);
        }
        ControlPad.prototype.btnEvent = function (ev) {
            var inside = null;
            var close = [];
            if (!document.hasFocus())
                window.focus();
            var x = ev.pageX;
            var y = ev.pageY;
            var inRect = function (r) {
                return (r.left <= x && ev.pageX <= r.right &&
                    r.top <= y && y <= r.bottom);
            };
            for (var _i = 0, _a = this.keys; _i < _a.length; _i++) {
                var k = _a[_i];
                var r = k.el.getBoundingClientRect();
                if (inRect(r)) {
                    inside = k;
                }
                var dx = (r.left + r.right) / 2 - x;
                var dy = (r.top + r.bottom) / 2 - y;
                var d = dx * dx + dy * dy;
                k.dist = d;
                if (d < r.width * r.width * 3) {
                    close.push(k);
                }
            }
            if (inside)
                close = [inside];
            if (close.length > 2) {
                close.sort(function (a, b) { return a.dist - b.dist; });
                close = close.slice(0, 2);
            }
            if (close.length == 0) {
                if (inRect(pxsim.board().canvas.getBoundingClientRect()))
                    close = this.keys.filter(function (k) { return k.key == pxsim.Key.A; });
            }
            for (var _b = 0, _c = this.keys; _b < _c.length; _b++) {
                var k = _c[_b];
                var isDown = close.indexOf(k) >= 0;
                if (isDown != k.isDown) {
                    k.isDown = isDown;
                    pxsim.board().handleKeyEvent(k.key, k.isDown);
                }
            }
            ev.preventDefault();
        };
        ControlPad.prototype.mirrorKey = function (key, down, realEvent) {
            switch (key) {
                case pxsim.Key.Up:
                    this.setOverlayState(this.up, down);
                    break;
                case pxsim.Key.Right:
                    this.setOverlayState(this.right, down);
                    break;
                case pxsim.Key.Down:
                    this.setOverlayState(this.down, down);
                    break;
                case pxsim.Key.Left:
                    this.setOverlayState(this.left, down);
                    break;
                case pxsim.Key.A:
                    this.setOverlayState(this.primary, down);
                    break;
                case pxsim.Key.B:
                    this.setOverlayState(this.secondary, down);
                    break;
                default:
                    break;
            }
        };
        ControlPad.prototype.moveDPad = function (left, top, width) {
            this.dPadRoot.el.style.position = "absolute";
            this.dPadRoot.el.style.left = left + "px";
            this.dPadRoot.el.style.top = top + "px";
            this.dPadRoot.setAttribute("height", width).setAttribute("width", width);
            var scale = width / (D_PAD_SVG_WIDTH + PADDING * 2);
            this.dPad.scale(scale);
            this.dPad.translate(PADDING * scale, PADDING * scale);
        };
        ControlPad.prototype.moveButtons = function (left, top, width) {
            this.buttonsRoot.el.style.position = "absolute";
            this.buttonsRoot.el.style.left = left + "px";
            this.buttonsRoot.el.style.top = top + "px";
            this.buttonsRoot.setAttribute("height", width).setAttribute("width", width);
            var scale = width / ((BUTTON_SVG_WIDTH * 2) + PADDING * 2);
            this.buttons.scale(scale);
            this.buttons.translate(PADDING * scale, PADDING * scale);
        };
        ControlPad.prototype.moveReset = function (left, top, width) {
            this.reset.el.setAttribute("width", width + "px");
            this.reset.el.setAttribute("height", (width * pxsim.MENU_RESET_ASPECT_RATIO) + "px");
            this.reset.el.style.position = "absolute";
            this.reset.el.style.left = left + "px";
            this.reset.el.style.top = top + "px";
        };
        ControlPad.prototype.moveMenu = function (left, top, width) {
            this.menu.el.setAttribute("width", width + "px");
            this.menu.el.setAttribute("height", (width * pxsim.MENU_RESET_ASPECT_RATIO) + "px");
            this.menu.el.style.position = "absolute";
            this.menu.el.style.left = left + "px";
            this.menu.el.style.top = top + "px";
        };
        ControlPad.prototype.buildDom = function () {
            this.drawDirectionalPad();
            this.drawButtonGroup();
            this.drawMenuReset(this.reset, pxsim.svg.resetButton);
            this.drawMenuReset(this.menu, pxsim.svg.menuButton);
            this.reset.el.addEventListener("click", function () {
                pxsim.Runtime.postMessage({
                    type: "simulator",
                    command: "restart"
                });
            });
            this.moveDPad(0, 0, COMPONENT_WIDTH);
            this.moveButtons(0, 0, COMPONENT_WIDTH);
        };
        ControlPad.prototype.drawMenuReset = function (parent, el) {
            parent.el.appendChild(el.cloneNode(true));
            var overlay = parent.draw("rect")
                .setClass("controller-button-overlay")
                .width(100, s.LengthUnit.percent)
                .height(100, s.LengthUnit.percent)
                .fill("black", 0)
                .corners(10, 10);
        };
        ControlPad.prototype.drawDirectionalPad = function () {
            this.dPad = this.dPadRoot.group();
            this.dPad.el.appendChild(pxsim.svg.dPad.cloneNode(true));
            // Draw the real touch pads
            var unit = D_PAD_SVG_WIDTH / 3;
            this.up = this.drawTouchPad(this.dPad, unit, 0, unit, unit);
            this.bindPadEvents(this.up, pxsim.Key.Up);
            this.right = this.drawTouchPad(this.dPad, 2 * unit, unit, unit, unit);
            this.bindPadEvents(this.right, pxsim.Key.Right);
            this.down = this.drawTouchPad(this.dPad, unit, 2 * unit, unit, unit);
            this.bindPadEvents(this.down, pxsim.Key.Down);
            this.left = this.drawTouchPad(this.dPad, 0, unit, unit, unit);
            this.bindPadEvents(this.left, pxsim.Key.Left);
        };
        ControlPad.prototype.drawTouchPad = function (parent, x, y, width, height) {
            var pad = parent.draw("rect")
                .setClass("controller-button-overlay")
                .at(x, y)
                .corners(1, 1)
                .fill("black", 0)
                .size(width, height);
            return pad;
        };
        ControlPad.prototype.bindPadEvents = function (pad, target) {
            this.keys.push({ el: pad.el, key: target });
        };
        ControlPad.prototype.drawButtonGroup = function () {
            this.buttons = this.buttonsRoot.group();
            var unit = BUTTON_SVG_WIDTH * 2 / 3;
            this.primary = this.drawButton("A", 2.25 * unit, unit, pxsim.Key.A);
            this.secondary = this.drawButton("B", 0.75 * unit, 2.25 * unit, pxsim.Key.B);
        };
        ControlPad.prototype.drawButton = function (symbol, cx, cy, key) {
            var r = (BUTTON_SVG_WIDTH * 2 / 3) * 0.75;
            var buttonDom = symbol === "A" ? pxsim.svg.aButton.cloneNode(true) : pxsim.svg.bButton.cloneNode(true);
            var buttonG = this.buttons.group();
            buttonG.el.appendChild(buttonDom);
            var overlay = buttonG.draw("circle")
                .setClass("controller-button-overlay")
                .at(r, r)
                .radius(r)
                .fill("black", 0);
            buttonG.translate(cx - r, cy - r);
            this.bindPadEvents(overlay, key);
            return overlay;
        };
        ControlPad.prototype.setOverlayState = function (overlay, down) {
            if (down) {
                overlay.setClass("controller-button-overlay pressed");
            }
            else {
                overlay.setClass("controller-button-overlay");
            }
        };
        return ControlPad;
    }());
    pxsim.ControlPad = ControlPad;
})(pxsim || (pxsim = {}));
var DAL;
(function (DAL) {
    DAL.DEVICE_PIN_EVENT_NONE = 0;
    DAL.DEVICE_PIN_EVENT_ON_EDGE = 1;
    DAL.DEVICE_PIN_EVENT_ON_PULSE = 2;
    DAL.DEVICE_PIN_EVENT_ON_TOUCH = 3;
    DAL.DEVICE_PIN_EVT_RISE = 2;
    DAL.DEVICE_PIN_EVT_FALL = 3;
    DAL.DEVICE_PIN_EVT_PULSE_HI = 4;
    DAL.DEVICE_PIN_EVT_PULSE_LO = 5;
})(DAL || (DAL = {}));
var pxsim;
(function (pxsim) {
    var PlayerNumber;
    (function (PlayerNumber) {
        PlayerNumber[PlayerNumber["One"] = 1] = "One";
        PlayerNumber[PlayerNumber["Two"] = 2] = "Two";
        PlayerNumber[PlayerNumber["Three"] = 3] = "Three";
        PlayerNumber[PlayerNumber["Four"] = 4] = "Four";
    })(PlayerNumber || (PlayerNumber = {}));
    var init = false;
    var connected = false;
    var all = {};
    var player = PlayerNumber.One;
    function initGamepad() {
        if (init)
            return;
        init = true;
        window.addEventListener("gamepadconnected", function (e) {
            if (connected)
                return;
            connected = true;
            setInterval(function () {
                onUpdate();
            }, 20);
        });
    }
    pxsim.initGamepad = initGamepad;
    function onUpdate() {
        var g = navigator.getGamepads();
        if (g) {
            for (var i = 0; i < g.length; i++) {
                var gamepad = g[i];
                if (gamepad && gamepad.buttons && gamepad.buttons.length) {
                    var ctrl = getState(gamepad);
                    updateState(ctrl, pxsim.Key.A, 0, gamepad);
                    updateState(ctrl, pxsim.Key.B, 1, gamepad);
                    updateState(ctrl, pxsim.Key.Up, 12, gamepad, 1, false);
                    updateState(ctrl, pxsim.Key.Down, 13, gamepad, 1, true);
                    updateState(ctrl, pxsim.Key.Left, 14, gamepad, 0, false);
                    updateState(ctrl, pxsim.Key.Right, 15, gamepad, 0, true);
                }
            }
        }
    }
    pxsim.onUpdate = onUpdate;
    function getState(gamepad) {
        if (all[gamepad.index])
            return all[gamepad.index];
        var newState = { state: {}, player: player };
        all[gamepad.index] = newState;
        player++;
        return newState;
    }
    function updateState(ctrl, key, buttonIndex, gamepad, axis, axisPositive) {
        var pressed = gamepad.buttons[buttonIndex].pressed;
        if (axis != undefined && gamepad.axes && gamepad.axes[axis]) {
            var value = gamepad.axes[axis];
            if (Math.abs(value) > 0.5) {
                pressed = pressed || (axisPositive === value > 0);
            }
        }
        var old = ctrl.state[key];
        if (old != pressed) {
            ctrl.state[key] = pressed;
            pxsim.board().handleKeyEvent(key + (7 * (ctrl.player - 1)), pressed);
        }
    }
})(pxsim || (pxsim = {}));
var KEY_UP = 2048;
var KEY_DOWN = 2049;
var INTERNAL_KEY_UP = 2050;
var INTERNAL_KEY_DOWN = 2051;
var SYSTEM_KEY_UP = 2052;
var SYSTEM_KEY_DOWN = 2053;
var KEY_REPEAT = 2054;
var SYSTEM_KEY_REPEAT = 2055;
/// <reference path="../node_modules/pxt-core/built/pxtsim.d.ts"/>
/// <reference path="../node_modules/pxt-common-packages/libs/controller/enums.ts"/>
var pxsim;
(function (pxsim) {
    var forcedUpdateLoop;
    /**
     * This function gets called each time the program restarts
     */
    pxsim.initCurrentRuntime = function () {
        pxsim.runtime.board = new Board();
        pxsim.initGamepad();
        if (!forcedUpdateLoop) {
            // this is used to force screen update if game loop is stuck or not set up properly
            forcedUpdateLoop = setInterval(function () {
                //board().screenState.maybeForceUpdate()
            }, 100);
            var body = document.getElementById("root");
            window.onfocus = function () {
                indicateFocus(true);
            };
            window.onblur = function () {
                indicateFocus(false);
            };
            window.onkeydown = function (e) {
                var b = board();
                if (b)
                    b.setKey((typeof e.which == "number") ? e.which : e.keyCode, true, e);
            };
            window.onkeyup = function (e) {
                var b = board();
                if (b)
                    b.setKey((typeof e.which == "number") ? e.which : e.keyCode, false, e);
            };
        }
    };
    /**
     * Gets the current 'board', eg. program state.
     */
    function board() {
        return pxsim.runtime.board;
    }
    pxsim.board = board;
    var openMeInMakeCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAACBAgMAAACA" +
        "3hMIAAAACVBMVEX///+rq6sAAACQF3jzAAAAdklEQVQY05WQsQ2FMAxE3/8KDZUp2CcjMBIlYorUTIntuLA" +
        "UCcHpFRfp4kuMaqqIKGa61kpxfqgis4ghKYOzMipl+pCqfpjzcFHCfOjaUtfmXViLeLVExgIljuN70jYcyH" +
        "PUhAosRi969a920E7azHWx/zvm4QZrZxQ87RClwwAAAABJRU5ErkJggg==";
    function loadImageAsync(url) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.src = url;
            img.onload = function () {
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas);
            };
            img.onerror = function () {
                reject(new Error("Cannot load image"));
            };
        });
    }
    pxsim.loadImageAsync = loadImageAsync;
    /**
     * Represents the entire state of the executing program.
     * Do not store state anywhere else!
     */
    var Board = /** @class */ (function (_super) {
        __extends(Board, _super);
        function Board() {
            var _this = _super.call(this) || this;
            _this.startTime = Date.now();
            _this.lastKey = 0;
            _this.lastScreenshotTime = 0;
            _this.bus = new pxsim.EventBus(pxsim.runtime);
            _this.screenState = new pxsim.ScreenState(null);
            _this.audioState = new pxsim.AudioState();
            return _this;
        }
        Board.prototype.getDefaultPitchPin = function () {
            return undefined;
        };
        Board.prototype.setKey = function (which, isPressed, e) {
            var k = pxsim.mapKey(which);
            if (k) {
                this.handleKeyEvent(k, isPressed);
                e.preventDefault();
            }
        };
        Board.prototype.handleKeyEvent = function (key, isPressed) {
            this.lastKey = Date.now();
            this.bus.queue(isPressed ? INTERNAL_KEY_DOWN : INTERNAL_KEY_UP, key);
            this.bus.queue(isPressed ? INTERNAL_KEY_DOWN : INTERNAL_KEY_UP, 0); // "any" key
            if (this.controls) {
                this.controls.mirrorKey(key, isPressed);
            }
        };
        Board.prototype.receiveMessage = function (msg) {
            if (msg.type == "screenshot")
                this.screenshotAsync(msg.title || pxsim.title || "...")
                    .then(function (img) {
                    pxsim.Runtime.postMessage({ type: "screenshot", data: img });
                });
        };
        Board.prototype.screenshotAsync = function (title) {
            var w = this.screenState.width;
            var h = this.screenState.height;
            var work = document.createElement("canvas");
            var border = 16;
            var bottom = 32;
            work.width = w + border * 2;
            work.height = h + border * 2 + bottom;
            var ctx = work.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, work.width, work.height);
            var id = ctx.getImageData(border, border, w, h);
            if (this.lastScreenshot)
                new Uint32Array(id.data.buffer).set(this.lastScreenshot);
            else
                new Uint32Array(id.data.buffer).fill(0xff000000);
            ctx.putImageData(id, border, border);
            var lblTop = 2 * border + h + 4;
            ctx.fillStyle = 'black';
            ctx.font = '13px sans-serif';
            ctx.fillText(title, border, lblTop, w);
            return loadImageAsync(openMeInMakeCode)
                .then(function (openme) {
                ctx.drawImage(openme, border + w + 3, border);
                return work.toDataURL("image/png");
            });
        };
        Board.prototype.tryScreenshot = function () {
            var now = Date.now();
            // if there was a key since last screenshot and at least 100ms ago,
            // and last screenshot was at least 3s ago, record a new one
            if (now - this.lastScreenshotTime > 3000 &&
                this.lastKey < now - 100 &&
                (!this.lastScreenshot || this.lastKey > this.lastScreenshotTime))
                this.takeScreenshot();
        };
        Board.prototype.takeScreenshot = function () {
            var now = Date.now();
            this.lastScreenshot = this.screenState.screen.slice(0);
            this.lastScreenshotTime = now;
        };
        Board.prototype.initAsync = function (msg) {
            var _this = this;
            this.runOptions = msg;
            this.background = document.getElementById("screen-back");
            this.canvas = document.getElementById("paint-surface");
            this.stats = document.getElementById("debug-stats");
            this.stats.className = "stats";
            this.canvas.width = 16;
            this.canvas.height = 16;
            this.id = msg.id;
            if (!this.controls) {
                this.controlsDiv = document.getElementById("controls");
                this.controlsDiv.innerHTML = "";
                this.controls = new pxsim.ControlPad(this.controlsDiv);
                this.controlsDiv.onmouseover = function () {
                    if (!document.hasFocus())
                        window.focus();
                };
            }
            this.view = new ScreenView(this.screenState, this.canvas, function () { return _this.layout(); }, function () { return _this.updateStats(); });
            this.layout();
            throttleAnimation(function (cb) { return window.onresize = cb; }, function () { return _this.layout(); });
            indicateFocus(document.hasFocus());
            return Promise.resolve();
        };
        Board.prototype.updateStats = function () {
            this.stats.textContent = this.screenState.stats;
            this.tryScreenshot();
        };
        Board.prototype.layout = function () {
            var minControlWidth = 100;
            var menuResetWidth = minControlWidth * 0.7;
            var maxWidth = document.body.clientWidth;
            var maxHeight = document.body.clientHeight;
            var landscapeWidth = maxWidth - minControlWidth * 2;
            var portraitHeight = maxHeight - minControlWidth;
            var portraitMetrics = this.view.getFit(maxWidth, portraitHeight, 20);
            var landscapeMetrics = this.view.getFit(landscapeWidth, maxHeight, 20);
            if (portraitMetrics.area > landscapeMetrics.area) {
                // Place controls below
                this.view.centerInBox(0, 0, portraitMetrics);
                var bb = this.view.boundingBox();
                var availableHeight = maxHeight - bb.bottom;
                var controlsHeight = availableHeight * 4 / 5;
                if (controlsHeight * 2 > maxWidth)
                    controlsHeight = maxWidth / 2 | 0;
                var controlsTop = maxHeight - availableHeight + (availableHeight - controlsHeight) * 3 / 4;
                this.controls.moveDPad(0, controlsTop, controlsHeight);
                this.controls.moveButtons(maxWidth - controlsHeight, controlsTop, controlsHeight);
                var spacing = 30;
                var menuResetTop = bb.bottom + 20;
                var midpoint = maxWidth / 2;
                // Centered between the d-pad and buttons
                this.controls.moveReset(midpoint - (spacing / 2) - menuResetWidth, menuResetTop, menuResetWidth);
                this.controls.moveMenu(midpoint + (spacing / 2), menuResetTop, menuResetWidth);
            }
            else {
                // Place controls on sides
                this.view.centerInBox(minControlWidth, 0, landscapeMetrics);
                var bb = this.view.boundingBox();
                this.controls.moveDPad(0, maxHeight - bb.left, bb.left);
                this.controls.moveButtons(maxWidth - bb.left, maxHeight - bb.left, bb.left);
                this.controls.moveReset(bb.left - menuResetWidth - 20, bb.top, menuResetWidth);
                this.controls.moveMenu(bb.right + 20, bb.top, menuResetWidth);
            }
        };
        return Board;
    }(pxsim.BaseBoard));
    pxsim.Board = Board;
    var ScreenView = /** @class */ (function () {
        function ScreenView(state, canvas, onResize, onUpdate) {
            this.onResize = onResize;
            this.onUpdate = onUpdate;
            this.state = state;
            this.canvas = canvas;
            this.context = this.canvas.getContext("2d");
            this.centerInBox(0, 0, this.getFit(200, 200, 20));
            this.context.fillStyle = "#000000";
            this.context.fill();
            this.attach();
            this.refreshPalette();
        }
        ScreenView.prototype.attach = function () {
            var _this = this;
            throttleAnimation(function (cb) { return _this.state.onChange = cb; }, function () { return _this.redraw(true); });
        };
        ScreenView.prototype.centerInBox = function (ox, oy, metrics) {
            this.ox = ox;
            this.oy = oy;
            this.metrics = metrics;
            this.resize();
        };
        ScreenView.prototype.boundingBox = function () {
            return this.canvas.getBoundingClientRect();
        };
        ScreenView.prototype.aspectRatio = function () {
            return this.state.width / this.state.height;
        };
        ScreenView.prototype.getFit = function (boundsWidth, boundsHeight, padding) {
            var screenWidth, screenHeight;
            var aspectRatio = this.aspectRatio();
            var maxWidth = boundsWidth - padding * 2;
            var maxHeight = boundsHeight - padding * 2;
            if (isEdge() || isIE()) {
                // Snap to closest screen-size to avoid scaling issues
                var cellWidth = Math.max(1, Math.floor(Math.min(maxWidth / this.state.width, maxHeight / this.state.height)));
                screenWidth = cellWidth * this.state.width;
                screenHeight = cellWidth * this.state.height;
            }
            else {
                var constrainedHeight = maxWidth / aspectRatio;
                var constrainedWidth = maxHeight * aspectRatio;
                if (constrainedHeight < maxHeight) {
                    if (constrainedWidth < maxWidth) {
                        var area1 = constrainedHeight * maxWidth;
                        var area2 = constrainedWidth * maxHeight;
                        if (area1 > area2) {
                            screenWidth = maxWidth;
                            screenHeight = constrainedHeight;
                        }
                        else {
                            screenWidth = constrainedWidth;
                            screenHeight = maxHeight;
                        }
                    }
                    else {
                        screenWidth = maxWidth;
                        screenHeight = constrainedHeight;
                    }
                }
                else {
                    screenWidth = constrainedWidth;
                    screenHeight = maxHeight;
                }
            }
            return {
                width: screenWidth,
                height: screenHeight,
                left: (boundsWidth - screenWidth) / 2,
                top: (boundsHeight - screenHeight) / 2,
                area: screenWidth * screenHeight
            };
        };
        ScreenView.prototype.calculateClipPath = function (width, height, borderWidth) {
            var points = [];
            var wedgeOffset = borderWidth * 2 / 3;
            points.push([0, wedgeOffset]);
            points.push([wedgeOffset, 0]);
            points.push([width + borderWidth * 2 - wedgeOffset, 0]);
            points.push([width + borderWidth * 2, wedgeOffset]);
            points.push([width + borderWidth * 2, height + borderWidth * 2 - wedgeOffset]);
            points.push([width + borderWidth * 2 - wedgeOffset, height + borderWidth * 2]);
            points.push([wedgeOffset, height + borderWidth * 2]);
            points.push([0, height + borderWidth * 2 - wedgeOffset]);
            var polyString = "polygon(" + points.map(function (p) { return p.map(function (c) { return c + "px"; }).join(" "); }).join(", ") + ")";
            this.canvas.style.clipPath = polyString;
        };
        ScreenView.prototype.refreshPalette = function () {
            this.palette = [];
            for (var i = 0; i < this.state.palette.length; i++) {
                var c = this.state.palette[i];
                this.palette.push("rgb(" + (c & 0xff) + "," + ((c >> 8) & 0xff) + "," + ((c >> 16) & 0xff) + ")");
            }
        };
        ScreenView.prototype.redraw = function (screenStateChanged) {
            if (this.cachedHeight !== this.state.height || this.cachedWidth !== this.state.width || this.paletteDidChange()) {
                this.cachedHeight = this.state.height;
                this.cachedWidth = this.state.width;
                this.cachedPalette = this.state.palette.slice();
                this.refreshPalette();
                this.resize();
                this.onResize();
            }
            else {
                for (var x = 0; x < this.state.width; x++) {
                    for (var y = 0; y < this.state.height; y++) {
                        this.context.fillStyle = this.palette[this.state.lastImage.data[x + y * this.state.width] & 0xff];
                        this.context.fillRect(x * this.cellWidth, y * this.cellWidth, this.cellWidth, this.cellWidth);
                    }
                }
            }
            if (screenStateChanged) {
                this.onUpdate();
            }
        };
        ScreenView.prototype.resize = function () {
            if (isEdge() || isIE()) {
                this.cellWidth = this.metrics.width / this.state.width;
                this.canvas.width = this.metrics.width;
                this.canvas.height = this.metrics.height;
            }
            else {
                this.cellWidth = 1;
                this.canvas.width = this.state.width;
                this.canvas.height = this.state.height;
                this.canvas.style.width = this.metrics.width + "px";
                this.canvas.style.height = this.metrics.height + "px";
            }
            var bb = this.boundingBox();
            var borderWidth = (bb.width - this.metrics.width) / 2;
            var borderHeight = (bb.height - this.metrics.height) / 2;
            var leftMargin = this.ox + this.metrics.left - borderWidth;
            this.canvas.style.left = leftMargin + "px";
            this.canvas.style.top = Math.min(this.oy + this.metrics.top - borderHeight, leftMargin) + "px";
            this.calculateClipPath(this.metrics.width, this.metrics.height, (bb.width - this.metrics.width) / 2);
            if (this.palette)
                this.redraw(false);
        };
        ScreenView.prototype.paletteDidChange = function () {
            if (!this.cachedPalette || this.cachedPalette.length != this.state.palette.length)
                return true;
            for (var i = 0; i < this.cachedPalette.length; i++) {
                if (this.cachedPalette[i] != this.state.palette[i])
                    return true;
            }
            return false;
        };
        return ScreenView;
    }());
    function indicateFocus(hasFocus) {
        var b = board().background;
        var c = board().controlsDiv;
        if (!b || !c)
            return;
        if (hasFocus) {
            b.classList.add("has-focus");
            c.classList.remove("no-focus");
        }
        else {
            b.classList.remove("has-focus");
            c.classList.add("no-focus");
        }
    }
    function throttleAnimation(event, handler) {
        var requested = false;
        event(function () {
            if (!requested) {
                window.requestAnimationFrame(function () {
                    handler();
                    requested = false;
                });
            }
        });
    }
})(pxsim || (pxsim = {}));
// Copied verbatim from pxt-core
function hasNavigator() {
    return typeof navigator !== "undefined";
}
function isEdge() {
    return hasNavigator() && /Edge/i.test(navigator.userAgent);
}
function isIE() {
    return hasNavigator() && /Trident/i.test(navigator.userAgent);
}
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        function getButtonByPinCfg(key) {
            return { id: key };
        }
        pxtcore.getButtonByPinCfg = getButtonByPinCfg;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var ButtonMethods;
    (function (ButtonMethods) {
        function id(button) {
            return (button).id;
        }
        ButtonMethods.id = id;
    })(ButtonMethods = pxsim.ButtonMethods || (pxsim.ButtonMethods = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var svg;
    (function (svg) {
        svg.dPad = svg.parseString("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 23.813 24.362\" width=\"23.813\" height=\"24.362\"><path fill=\"#f290c1\" d=\"M11.906 0c-2.431 0-3.304.092-3.59.378-.29.29-.378 1.21-.378 3.969v3.591h-3.59c-2.76 0-3.68.087-3.97.378C.092 8.602 0 9.474 0 11.9c0 3.051.032 3.237.65 3.855.62.62.797.65 3.968.65h3.32v3.583c0 2.49.1 3.697.33 3.958.48.544 6.688.56 7.23.018.29-.29.377-1.21.377-3.968v-3.591h3.32c3.171 0 3.348-.03 3.969-.65.618-.618.649-.804.649-3.855 0-2.426-.092-3.298-.378-3.584-.288-.288-1.174-.378-3.704-.378h-3.327V4.763c0-1.94-.103-3.175-.264-3.175-.146 0-.265-.187-.265-.416 0-.98-.65-1.172-3.969-1.172z\"/><path fill=\"#f291bd\" d=\"M11.906 0c-2.431 0-3.304.092-3.59.378-.29.29-.378 1.21-.378 3.969v3.591h-3.59c-2.76 0-3.68.087-3.97.378C.092 8.602 0 9.474 0 11.9c0 3.051.032 3.237.65 3.855.62.62.797.65 3.968.65h3.32v3.583c0 2.49.1 3.697.33 3.958.48.544 6.688.56 7.23.018.29-.29.377-1.21.377-3.968v-3.591h3.241c3.027-.001 3.29-.042 3.97-.627.719-.619.727-.66.727-3.855 0-2.446-.092-3.321-.378-3.607-.288-.288-1.174-.378-3.704-.378h-3.327V4.763c0-1.94-.103-3.175-.264-3.175-.146 0-.265-.187-.265-.416 0-.98-.65-1.172-3.969-1.172zm1.799.534c.188-.002.635.288.992.645.626.626.649.781.649 4.234 0 2.368-.096 3.583-.283 3.583-.19 0-.263-1.135-.222-3.438.058-3.3.035-3.46-.552-3.969-.336-.292-.504-.532-.372-.534.131-.002.06-.12-.159-.26-.283-.184-.298-.258-.053-.261zm-4.488.525c.12 0 .22.178.22.397 0 .45-.019.466-.264.22-.247-.246-.22-.617.044-.617zm-.561 6.398c.044-.018.099.08.19.283.114.254.138.641.054.86-.169.44-.962.549-.962.132 0-.146.11-.265.246-.265s.293-.268.35-.595c.046-.261.078-.396.122-.415zM22.4 8.997c.24 0 .883.755.883 1.039 0 .387-.45.357-.704-.048-.25-.399-.356-.992-.18-.992zM.936 9.63c.027-.006.051 0 .071.02.082.081 0 .295-.18.474-.261.26-.292.23-.148-.148.074-.196.176-.327.257-.346zm21.876 2.83c.038-.01.107.097.234.315.151.26.234.595.185.745-.142.424-.477-.054-.468-.666.003-.254.01-.383.049-.394zm-22.071.88a.16.16 0 0 1 .053.02c.145.09.264.336.264.546 0 .21-.119.381-.264.381-.146 0-.265-.245-.265-.545 0-.262.091-.426.212-.403zm3.214 1.5c1.97-.026 4.558.11 4.762.355.137.166.27 1.781.296 3.59.03 2.222-.05 3.319-.25 3.385-.208.07-.296-.931-.296-3.363v-3.462H5.012c-2.294 0-3.4-.09-3.288-.271.089-.144 1.049-.218 2.231-.234zm5.258 7.66c.128.001.393.127.725.378.387.292.416.387.116.386-.218 0-.55-.176-.738-.388-.22-.25-.23-.375-.103-.375z\"/><path fill=\"#a3809c\" d=\"M12.012 0C7.81 0 7.938-.139 7.938 4.407v3.531H4.453c-4.58 0-4.453-.113-4.452 3.943 0 2.844.045 3.122.625 3.796.622.723.65.728 3.97.728h3.342v3.609c0 3.126.062 3.655.463 3.96.318.241 1.374.354 3.38.36 4.184.012 4.094.108 4.094-4.372v-3.557h3.271c3.182 0 3.29-.02 3.969-.698.675-.675.697-.798.69-3.77-.006-2.135-.116-3.214-.36-3.536-.302-.398-.821-.463-3.696-.463h-3.345V4.763c0-1.94-.103-3.175-.264-3.175-.146 0-.265-.187-.265-.416C15.875.199 15.22 0 12.012 0zm-.106.53c1.92 0 2.208.067 2.79.65.621.62.65.797.65 3.968v3.32h3.32c3.171 0 3.348.028 3.968.649.575.574.65.879.65 2.646 0 1.154-.112 1.996-.265 1.996-.15 0-.265-.75-.265-1.718 0-1.386-.111-1.846-.576-2.381-.56-.644-.678-.664-3.97-.664h-3.391V5.677c0-3.171-.029-3.348-.65-3.969-.547-.547-.902-.65-2.26-.65-1.359 0-1.714.103-2.261.65-.62.62-.65.798-.65 3.97v3.318h-3.32c-3.17 0-3.347.03-3.968.65-.568.568-.65.886-.65 2.532 0 1.28.122 2.005.379 2.261.29.29 1.21.378 3.969.378h3.59v3.394c0 3.205.034 3.425.612 3.968.45.422.944.576 1.852.576.682 0 1.24.119 1.24.264 0 .148-.673.258-1.521.249-1.253-.014-1.627-.129-2.117-.652-.552-.59-.595-.878-.595-3.953v-3.317h-3.32c-3.17 0-3.348-.029-3.968-.65-.579-.578-.65-.874-.65-2.711.001-1.787.084-2.16.627-2.79.62-.723.65-.728 3.968-.728h3.343V5.148c0-3.171.029-3.348.65-3.969.582-.582.87-.65 2.79-.65zM9.782 11.668c.154.024.358.267.56.723.182.412.668.898 1.08 1.08.412.183.749.441.749.575 0 .133-.281.242-.625.242-.807 0-2.02-1.214-2.02-2.02 0-.426.102-.623.256-.6z\"/><path fill=\"#a8769a\" d=\"M12.06 0C7.84 0 7.939-.105 7.939 4.425v3.513H4.5c-4.598 0-4.5-.086-4.5 3.991 0 2.976.023 3.104.697 3.778.678.678.787.698 3.969.698h3.27v3.485c0 2.87.078 3.57.439 3.968.374.413.865.484 3.356.484 2.633 0 2.978-.057 3.53-.576.58-.543.613-.763.613-3.968v-3.394l3.241-.008c4.438-.011 4.697-.266 4.697-4.618 0-3.822-.02-3.84-4.234-3.84h-3.175V4.763c0-1.94-.103-3.175-.264-3.175-.146 0-.265-.187-.265-.416 0-.97-.657-1.172-3.814-1.172zm-.154.53c1.92 0 2.208.067 2.79.65.621.62.65.797.65 3.968v3.32h3.32c3.171 0 3.348.028 3.968.649.575.574.65.879.65 2.646 0 1.737-.062 1.996-.471 1.996-.26 0-.643.238-.852.529-.348.482-.685.53-3.763.53h-3.381l-.034 1.653c-.018.91-.04 2.424-.047 3.366-.011 1.42-.117 1.817-.616 2.316-.33.33-.786.602-1.01.602-.225 0-.41.119-.41.264 0 .148-.673.258-1.521.249-1.253-.014-1.627-.129-2.117-.652-.552-.59-.595-.878-.595-3.953v-3.317h-3.32c-3.17 0-3.348-.029-3.968-.65-.583-.582-.65-.87-.65-2.79s.067-2.207.65-2.79c.62-.62.797-.649 3.969-.649h3.319V5.148c0-3.171.029-3.348.65-3.969.582-.582.87-.65 2.79-.65zm0 2.116c-.617 0-.793.117-.793.529 0 .291-.12.53-.265.53-.145 0-.265.237-.265.528 0 .291-.119.53-.264.53-.146 0-.265.238-.265.529 0 .29-.119.529-.264.529-.146 0-.28.208-.3.463-.019.254-.127.046-.24-.463l-.206-.926.042.926.042.926 2.646.147c1.455.081 2.735.17 2.844.199.251.064.26-1.072.013-1.714-.167-.433-.202-.419-.331.13-.128.541-.232.448-.877-.794-.402-.774-.73-1.557-.727-1.738.002-.192-.329-.331-.79-.331zm9.525 6.35c-.013.013.067.12.231.33.346.441.563.582.563.364 0-.055-.208-.264-.463-.463-.21-.165-.317-.245-.33-.231zm-14.874.021c-.772-.016-.951.065-.831.377.111.29-.285.596-1.455 1.125-1.343.607-1.608.834-1.609 1.387-.001.56.264.78 1.722 1.432 1.728.772 1.875 1.067.643 1.288-.364.065.35.115 1.588.11 1.237-.005 1.802-.055 1.257-.112l-.993-.104v-2.608c0-1.838.098-2.647.331-2.741.182-.073-.112-.143-.653-.154zm5.365.464c-.676.022-1.35.282-1.77.772-.651.756-.817 1.389-.364 1.389.144 0 .41-.238.592-.53.426-.68 1.271-.673 2.152.02.85.668.931 1.812.168 2.362-.29.21-.529.474-.529.587 0 .383.718.21 1.42-.342.93-.732.996-2.67.121-3.602-.434-.462-1.113-.678-1.79-.656zm5.23.044c-.229 0-.313 4.58-.089 4.804.071.071 1.017-.296 2.1-.816 1.73-.83 1.973-1.034 1.987-1.673.01-.4-.1-.728-.244-.728-.143 0-.997-.357-1.898-.793-.901-.437-1.737-.794-1.856-.794zm-15.98 3.386c-.034.018-.058.178-.062.45-.005.437.05.648.122.469.073-.18.077-.537.01-.794-.025-.097-.05-.136-.07-.125zm1.704 1.673a2.998 2.998 0 0 0-.558.046c-.329.063-.122.117.46.12.582.003.852-.049.599-.115a2.182 2.182 0 0 0-.501-.05zm10.134 2.282c-.297.002-.625.008-.97.02-1.538.051-2.515.193-2.515.364 0 .154.387 1.092.86 2.084.721 1.513.967 1.804 1.521 1.81.568.004.793-.279 1.588-2.005.51-1.105.956-2.083.993-2.174.028-.067-.585-.104-1.477-.099zm-3.946 4.427a.043.043 0 0 0-.03.012c-.062.063.037.296.221.517.472.57.6.501.216-.114-.155-.249-.325-.419-.407-.415z\"/><path fill=\"#2f99a1\" d=\"M12.093.009C9.408 0 9.198.039 8.587.65c-.62.62-.65.797-.65 3.969v3.319H4.619c-3.171 0-3.348.029-3.968.65-.608.607-.65.83-.65 3.44 0 1.683.105 2.79.265 2.79.145 0 .264.237.264.528 0 .353.177.53.53.53.29 0 .529.119.529.264 0 .162 1.234.265 3.175.265h3.175v3.316c0 3.075.043 3.364.595 3.953.552.59.796.637 3.32.652 2.55.015 2.765-.025 3.373-.633.62-.62.65-.798.65-3.97v-3.318h3.174c1.94 0 3.175-.103 3.175-.265 0-.145.19-.265.422-.265.232 0 .484-.238.56-.529.076-.29.244-.529.372-.529.129 0 .234-1.255.234-2.79 0-2.61-.042-2.832-.65-3.44-.62-.62-.796-.649-3.98-.649H15.85l.053-3.579c.067-4.471.184-4.338-3.811-4.35zm-.114.52c2.033 0 2.26.055 2.79.664.527.606.577.952.577 3.969v3.305h3.32c3.171 0 3.348.03 3.968.65.575.574.65.879.65 2.646 0 1.737-.062 1.996-.471 1.996-.26 0-.643.238-.852.529-.348.482-.685.53-3.763.53h-3.381v3.318c0 3.172-.029 3.349-.65 3.97-.356.356-.833.649-1.058.649-.224 0-.409.119-.409.264 0 .148-.673.258-1.521.249-1.253-.014-1.627-.129-2.117-.652-.552-.59-.595-.878-.595-3.953v-3.317h-3.32c-3.17 0-3.348-.029-3.968-.65-.583-.582-.65-.87-.65-2.79s.067-2.207.65-2.79c.62-.62.797-.649 3.969-.649h3.319V5.148c0-3.171.029-3.348.65-3.969.585-.586.865-.65 2.862-.65zm-.044 2.117c-.286 0-.788.7-1.425 1.989-.542 1.094-.985 2.046-.985 2.116 0 .07 1.072.129 2.381.129 1.31 0 2.382-.048 2.382-.105 0-.058-.43-1.01-.956-2.117-.627-1.321-1.107-2.012-1.397-2.012zm-5.138 6.88c-.046 0-.727.31-1.513.69-.787.379-1.702.793-2.034.92-1.142.433-.72 1.126 1.314 2.153 1.055.532 2.008.974 2.117.983.109.01.198-1.056.198-2.365 0-1.31-.037-2.382-.082-2.382zm5.103 0c-1.12 0-1.536.25-2.068 1.244-.376.702-.384.872-.042.872.145 0 .264-.14.264-.31 0-.17.193-.523.429-.783.41-.454.468-.453 1.415.03.567.29 1.165.874 1.408 1.375.386.797.386.91 0 1.338-.233.256-.583.467-.779.467-.196 0-.356.119-.356.264 0 .346.15.334.858-.066.932-.525 1.241-1.052 1.25-2.128.012-1.409-.912-2.304-2.38-2.304zm5.162 0c-.07 0-.129 1.071-.129 2.38 0 1.31.058 2.382.129 2.382.07 0 1.023-.443 2.116-.984 1.206-.597 1.989-1.147 1.989-1.397s-.783-.8-1.989-1.398c-1.093-.54-2.046-.984-2.116-.984zm-5.156 7.408c-1.31 0-2.38.058-2.38.128s.444 1.026.987 2.124c.657 1.328 1.122 1.971 1.39 1.922.346-.064 2.353-3.421 2.376-3.976.005-.109-1.063-.198-2.373-.198z\"/><path fill=\"#96266c\" d=\"M12.093.009C9.408 0 9.198.039 8.587.65c-.62.62-.65.797-.65 3.969v3.319H4.619c-3.171 0-3.348.029-3.968.65-.608.607-.65.83-.65 3.44 0 1.683.105 2.79.265 2.79.145 0 .264.237.264.528 0 .353.177.53.53.53.29 0 .529.119.529.264 0 .162 1.234.265 3.175.265h3.175v3.316c0 3.075.043 3.364.595 3.953.552.59.796.637 3.32.652 2.55.015 2.765-.025 3.373-.633.62-.62.65-.798.65-3.97v-3.318h3.174c1.94 0 3.175-.103 3.175-.265 0-.145.19-.265.422-.265.232 0 .484-.238.56-.529.076-.29.244-.529.372-.529.129 0 .234-1.255.234-2.79 0-2.61-.042-2.832-.65-3.44-.62-.62-.796-.649-3.98-.649H15.85l.053-3.579c.067-4.471.184-4.338-3.811-4.35zm-.114.52c2.033 0 2.26.055 2.79.664.527.606.577.952.577 3.969v3.305h3.32c3.171 0 3.348.03 3.968.65.583.582.65.87.65 2.79s-.067 2.207-.65 2.79c-.62.62-.797.65-3.968.65h-3.32v3.318c0 3.172-.029 3.349-.65 3.97-.588.588-.854.647-2.843.633-1.965-.015-2.258-.083-2.79-.652-.553-.59-.596-.878-.596-3.953v-3.317h-3.32c-3.17 0-3.348-.029-3.968-.65-.583-.582-.65-.87-.65-2.79s.067-2.207.65-2.79c.62-.62.797-.649 3.969-.649h3.319V5.148c0-3.171.029-3.348.65-3.969.585-.586.865-.65 2.862-.65zm-.044 2.117c-.286 0-.788.7-1.425 1.989-.542 1.094-.985 2.046-.985 2.116 0 .07 1.072.129 2.381.129 1.31 0 2.382-.048 2.382-.105 0-.058-.43-1.01-.956-2.117-.627-1.321-1.107-2.012-1.397-2.012zm-5.138 6.88c-.046 0-.727.31-1.513.69-.787.379-1.702.793-2.034.92-1.142.433-.72 1.126 1.314 2.153 1.055.532 2.008.974 2.117.983.109.01.198-1.056.198-2.365 0-1.31-.037-2.382-.082-2.382zm5.103 0c-1.12 0-1.536.25-2.068 1.244-.376.702-.384.872-.042.872.145 0 .264-.14.264-.31 0-.17.193-.523.429-.783.41-.454.468-.453 1.415.03.567.29 1.165.874 1.408 1.375.386.797.386.91 0 1.338-.233.256-.583.467-.779.467-.196 0-.356.119-.356.264 0 .346.15.334.858-.066.932-.525 1.241-1.052 1.25-2.128.012-1.409-.912-2.304-2.38-2.304zm5.162 0c-.07 0-.129 1.071-.129 2.38 0 1.31.058 2.382.129 2.382.07 0 1.023-.443 2.116-.984 1.206-.597 1.989-1.147 1.989-1.397s-.783-.8-1.989-1.398c-1.093-.54-2.046-.984-2.116-.984zm-5.156 7.408c-1.31 0-2.38.058-2.38.128s.444 1.026.987 2.124c.657 1.328 1.122 1.971 1.39 1.922.346-.064 2.353-3.421 2.376-3.976.005-.109-1.063-.198-2.373-.198z\"/><path fill=\"#5b3b6a\" d=\"M12.093.009C9.408 0 9.198.039 8.587.65c-.62.62-.65.797-.65 3.969v3.319H4.619c-3.171 0-3.348.029-3.968.65-.608.607-.65.83-.65 3.44 0 1.683.105 2.79.265 2.79.145 0 .264.237.264.528 0 .353.177.53.53.53.29 0 .529.119.529.264 0 .162 1.234.265 3.175.265h3.175v3.316c0 3.075.043 3.364.595 3.953.552.59.796.637 3.32.652 2.55.015 2.765-.025 3.373-.633.62-.62.65-.798.65-3.97v-3.318h3.174c1.94 0 3.175-.103 3.175-.265 0-.145.19-.265.422-.265.232 0 .484-.238.56-.529.076-.29.244-.529.372-.529.129 0 .234-1.255.234-2.79 0-2.61-.042-2.832-.65-3.44-.62-.62-.797-.649-3.968-.649h-3.32v-3.61c0-3.126-.062-3.655-.463-3.96-.317-.24-1.364-.353-3.319-.36zm-.112.52c1.973 0 2.277.067 2.79.613.528.562.575.887.575 3.969v3.356h3.394c3.205 0 3.425.034 3.968.612.495.527.575.919.575 2.79 0 1.96-.064 2.243-.649 2.828-.62.62-.797.65-3.968.65h-3.32v3.318c0 3.172-.029 3.349-.65 3.97-.585.585-.865.649-2.863.649-1.974 0-2.278-.067-2.79-.613-.529-.562-.576-.886-.576-3.968v-3.357H5.074c-3.205 0-3.426-.034-3.969-.612-.498-.53-.576-.917-.576-2.863 0-2.072.053-2.296.664-2.827.605-.527.951-.577 3.969-.577h3.305V5.148c0-3.171.029-3.348.65-3.969.585-.586.865-.65 2.864-.65zm-.046 2.117c-.286 0-.788.7-1.425 1.989-.542 1.094-.985 2.046-.985 2.116 0 .07 1.072.129 2.381.129 1.31 0 2.382-.048 2.382-.105 0-.058-.43-1.01-.956-2.117-.627-1.321-1.107-2.012-1.397-2.012zm-5.138 6.88c-.046 0-.727.31-1.513.69-.787.379-1.702.793-2.034.92-1.142.433-.72 1.126 1.314 2.153 1.055.532 2.008.974 2.117.983.109.009.198-1.056.198-2.365 0-1.31-.037-2.382-.082-2.382zm5.103 0c-1.12 0-1.536.25-2.068 1.244-.376.702-.384.872-.042.872.145 0 .264-.14.264-.31 0-.17.193-.523.429-.783.41-.454.468-.453 1.415.03.567.29 1.165.874 1.408 1.375.386.797.386.91 0 1.338-.233.256-.583.467-.779.467-.196 0-.356.119-.356.264 0 .346.15.334.858-.066.932-.525 1.241-1.052 1.25-2.128.012-1.409-.912-2.304-2.38-2.304zm5.162 0c-.07 0-.129 1.071-.129 2.38 0 1.31.058 2.382.129 2.382.07 0 1.023-.443 2.116-.984 1.206-.597 1.989-1.147 1.989-1.397s-.783-.8-1.989-1.398c-1.093-.54-2.046-.984-2.116-.984zm-5.156 7.408c-1.31 0-2.38.057-2.38.127s.444 1.027.987 2.125c.657 1.328 1.122 1.971 1.39 1.922.346-.064 2.353-3.421 2.376-3.976.005-.109-1.063-.198-2.373-.198z\"/><path d=\"M9.763 0c-.295.002-.765.24-1.176.65-.357.357-.65.714-.65.794 0 .323.437.111.794-.385.21-.291.594-.53.853-.53.258 0 .47-.118.47-.264 0-.182-.114-.265-.29-.265zm4.286 0c-.177 0-.29.083-.29.265 0 .146.187.265.415.265 1.002 0 1.172.63 1.172 4.346 0 2.218.101 3.591.265 3.591.163 0 .264-1.37.264-3.584 0-3.452-.023-3.607-.649-4.233-.41-.41-.882-.648-1.177-.65zM4.883 7.938c-3.452 0-3.608.024-4.233.65C.293 8.945 0 9.42 0 9.646c0 .225.12.409.265.409.145 0 .264-.188.264-.416 0-1.002.632-1.172 4.347-1.172 2.218 0 3.59-.101 3.59-.264 0-.164-1.37-.265-3.583-.265zm18.04.612a.168.168 0 0 0-.115.054c-.102.11-.037.253.145.318s.33.347.33.626.12.507.265.507c.146 0 .265-.188.265-.416 0-.459-.579-1.112-.89-1.089zM.265 13.76c-.485 0-.273.81.385 1.467.62.62.797.65 3.968.65h3.32v3.58c0 3.35.038 3.623.595 4.218.552.59.796.637 3.32.652 2.55.015 2.765-.025 3.373-.633.626-.626.65-.781.65-4.234v-3.584h3.391c3.291 0 3.41-.02 3.969-.663.603-.693.766-1.453.312-1.453-.145 0-.265.187-.265.416 0 1.001-.63 1.171-4.346 1.171h-3.591v3.591c0 3.716-.17 4.347-1.172 4.347-.228 0-.416.119-.416.264 0 .152-.793.265-1.852.265-1.058 0-1.852-.113-1.852-.265 0-.145-.186-.264-.415-.264-1.002 0-1.172-.631-1.172-4.347v-3.59h-3.59c-3.716 0-4.348-.17-4.348-1.172 0-.229-.119-.416-.264-.416z\"/></svg>");
        svg.aButton = svg.parseString("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 13.533 13.246\" width=\"13.533\" height=\"13.246\"><path fill=\"#ff8135\" stroke=\"#5c406c\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".861\" d=\"M13.099 6.602c.1 2.457-1.61 4.712-3.813 5.662a6.152 6.152 0 0 1-4.661.175C1.38 11.444-.431 7.43.85 4.317c.68-1.583 1.982-2.925 3.63-3.485 2.494-.914 5.612-.248 7.246 1.923a6.112 6.112 0 0 1 1.372 3.847z\"/><path fill=\"#e5cdc4\" fill-rule=\"evenodd\" stroke=\"#e5cdc4\" stroke-width=\".265\" d=\"M2.454 2.619C.284 4.916 1.146 7.611 1.146 7.611c.792-4.598 3.68-6.217 8.39-6.006 0 0-4.269-1.965-7.082 1.014z\"/><path fill=\"#af4282\" d=\"M8.745 9.825h1.423l-1.72-6.914H7.027L2.542 9.825h1.412c.444-.507.61-1.53 1.45-1.304H8.42l.326 1.304zm-.602-2.519H5.574c.621-.807 1.397-2.523 1.92-2.76l.649 2.76z\" font-family=\"Nexa Bold\" font-size=\"15.875\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:125%;-inkscape-font-specification:'Nexa Bold, '\" word-spacing=\"0\"/></svg>");
        svg.bButton = svg.parseString("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 13.533 13.246\" width=\"13.533\" height=\"13.246\"><path fill=\"#ff91c4\" stroke=\"#5c406c\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".861\" d=\"M13.099 6.602c.1 2.457-1.61 4.712-3.813 5.662a6.152 6.152 0 0 1-4.661.175C1.38 11.444-.431 7.43.85 4.317c.68-1.583 1.982-2.925 3.63-3.485 2.494-.914 5.612-.248 7.246 1.923a6.112 6.112 0 0 1 1.372 3.847z\"/><path fill=\"#e5cdc4\" fill-rule=\"evenodd\" stroke=\"#e5cdc4\" stroke-width=\".265\" d=\"M2.454 2.619C.284 4.916 1.051 7.563 1.051 7.563c.793-4.597 3.823-6.169 8.533-5.958 0 0-4.317-1.965-7.13 1.014z\"/><path fill=\"#af4282\" d=\"M5.337 7.226c.909.088 1.876-.201 2.736.21.288.113.37.493.32.773-.143.515-.716.742-1.197.817-.607-.047-1.91.169-2.181-.227-.058-.371.217-.697.222-1.073l.1-.5zM5.88 4.49c.81.122 1.664-.209 2.444.123.263.119.537.35.451.67-.591 1.227-2.213.797-3.21.797l.315-1.59zm2.233-1.186h-3.28L3.45 10.22c1.523-.054 3.064.132 4.572-.152 1.117-.305 1.976-1.536 1.666-2.692-.146-.282-.515-.448-.562-.79.088-.354.606-.278.717-.652.452-.693.41-1.769-.288-2.287-.42-.274-.95-.333-1.442-.342z\" font-family=\"Nexa Bold\" font-size=\"15.875\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:125%;-inkscape-font-specification:'Nexa Bold, '\" word-spacing=\"0\"/></svg>");
        svg.menuButton = svg.parseString("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16.937 6.35\"><path fill=\"#f290c1\" d=\"M1.303 0l-.65.65c-.547.547-.649.902-.649 2.26 0 1.359.102 1.714.65 2.261.357.357.833.65 1.058.65.225 0 .409.119.409.264 0 .17 2.293.265 6.35.265 4.057 0 6.35-.096 6.35-.265 0-.145.184-.264.41-.264.224 0 .7-.293 1.057-.65.548-.547.65-.902.65-2.26 0-1.359-.102-1.714-.65-2.261l-.65-.65H8.472z\"/><path fill=\"#f291bd\" d=\"M1.303 0l-.65.65c-.547.547-.649.902-.649 2.26 0 1.359.102 1.714.65 2.261.357.357.833.65 1.058.65.225 0 .409.119.409.264 0 .17 2.244.265 6.202.265 3.85 0 6.264-.1 6.366-.265.09-.145.34-.264.557-.264.216 0 .685-.293 1.042-.65.548-.547.65-.902.65-2.26 0-1.359-.102-1.714-.65-2.261l-.65-.65H8.472zm13.915.983l.595.366c.385.237.595.623.595 1.096 0 .401-.06.73-.132.73-.135 0-.187-.708-.066-.898.036-.058-.172-.372-.463-.7zM.898 3.543c.097.003.164.108.164.278 0 .465-.158.533-.385.166-.084-.136-.031-.321.117-.413a.188.188 0 0 1 .104-.032zm.6.502c.039-.013.065.073.073.254.011.255.11.45.22.432.108-.017 2.103-.009 4.43.019 2.704.031 4.043.134 3.705.283-.291.128-2.22.227-4.288.22-3.826-.013-4.575-.204-4.225-1.077.033-.08.061-.123.085-.131z\"/><path fill=\"#a3809c\" d=\"M1.303 0l-.65.65c-.547.547-.649.902-.649 2.26 0 1.359.102 1.714.65 2.261.357.357.833.65 1.058.65.225 0 .409.119.409.264 0 .17 2.244.265 6.202.265 3.85 0 6.264-.1 6.366-.265.09-.145.34-.264.557-.264.216 0 .685-.293 1.042-.65.548-.547.65-.902.65-2.26 0-1.359-.102-1.714-.65-2.261l-.65-.65H8.472zm1.1.53H15.11l.65.649c.639.64.9 1.996.384 1.996-.146 0-.265-.178-.265-.395 0-.217-.26-.693-.577-1.058l-.576-.664H8.873c-6.265 0-6.941.117-7.496 1.293-.44.931-.4 1.181.298 1.836.575.54.865.575 4.762.575 2.59 0 4.15.1 4.15.265 0 .167-1.642.259-4.431.249-4.328-.016-4.446-.032-5.027-.653-.924-.986-.797-2.193.34-3.236z\"/><path fill=\"#a8769a\" d=\"M1.303 0l-.65.65c-.547.547-.649.902-.649 2.26 0 1.359.102 1.714.65 2.261.357.357.826.65 1.043.65.216 0 .46.108.542.241.082.133.476.196.876.142.4-.055 3.368-.151 6.598-.214l5.872-.115.676-.677c.577-.577.676-.912.676-2.288 0-1.358-.101-1.713-.649-2.26l-.65-.65H8.472zm.766.53h13.04l.65.649c.742.742.92 2.157.239 1.895-.234-.09-.342-.045-.25.102.088.143-.139.558-.504.923-.591.591-.881.663-2.66.663-1.154 0-1.997.112-1.997.265 0 .167-1.642.259-4.431.249-4.328-.016-4.446-.032-5.027-.653-.863-.92-.793-2.239.172-3.272zm12.487.528c-.013.014.067.121.231.331.2.255.408.463.463.463.218 0 .078-.217-.363-.563-.21-.164-.317-.244-.33-.23zM1.184 3.44c-.117 0 .066.297.408.661.341.364.714.661.827.661.113 0-.07-.297-.407-.661-.337-.364-.71-.661-.828-.661zM6.09 4.528c-.6 0-1.2.013-1.654.039-.91.051-.165.094 1.654.094s2.563-.043 1.653-.094a31.07 31.07 0 0 0-1.653-.04z\"/><path fill=\"#2f99a1\" d=\"M1.303 0l-.65.65c-.546.547-.649.902-.649 2.258 0 1.303.113 1.73.595 2.245l.596.635 7.144.008 7.143.008.728-.64c.644-.567.727-.826.727-2.253 0-1.359-.101-1.714-.649-2.261l-.65-.65H8.472zm.53.53H15.11l.65.649c.885.886.815 1.583-.269 2.666-.884.884-.989.917-2.91.917-1.153 0-1.994.112-1.994.265 0 .167-1.642.259-4.431.249-4.328-.016-4.446-.032-5.027-.653-.845-.902-.819-2.572.054-3.444z\"/><path fill=\"#5b3b6a\" d=\"M1.303 0l-.65.65c-.546.547-.649.902-.649 2.258 0 1.303.113 1.73.595 2.245l.596.635 7.144.008 7.143.008.728-.64c.644-.567.727-.826.727-2.253 0-1.359-.101-1.714-.649-2.261l-.65-.65H8.472zm.53.53H15.11l.65.649c.477.478.648.935.648 1.731 0 .797-.17 1.254-.649 1.732l-.65.65-6.692-.016-6.693-.017-.595-.635C.284 3.72.31 2.05 1.183 1.179z\"/><path d=\"M16.673 1.587c-.146 0-.265.542-.265 1.203 0 .924-.15 1.353-.649 1.852l-.65.65H1.833l-.65-.65C.827 4.285.534 3.81.534 3.584c0-.225-.119-.409-.264-.409-.533 0-.243.831.595 1.709l.86.9 6.69.019 6.689.018.917-.917c.777-.777.917-1.101.917-2.117 0-.66-.119-1.2-.264-1.2z\"/><path fill=\"#5b3b6a\" d=\"M3.773 1.723c-.1.007-.2.056-.304.175-.243.263-.34-.344-.645-.087-.219.159-.07.434-.108.658v1.597h.56c.051-.533-.12-1.11.123-1.61.36-.45 1.038.15.82.609.04.378-.212 1.192.456 1.001h.105c.056-.535-.13-1.11.133-1.612.335-.39.855.064.83.478.034.347-.282.99.169 1.135.545.15.278-.472.348-.78-.008-.428.044-.943-.287-1.27-.348-.327-.983-.361-1.302.025-.313.015-.599-.34-.898-.319zm4.12.001c-.599.022-1.183.496-1.174 1.125-.051.62.434 1.27 1.082 1.27.367.008.959.003 1.073-.427-.266-.54-.722.142-1.15-.112-.45-.06-.384-.634.083-.451.419.035.842-.01 1.263.007.127-.605-.26-1.348-.923-1.392a1.13 1.13 0 0 0-.255-.02zm1.927.028c-.04-.012-.09-.002-.154.047-.34.104-.115.567-.174.837v1.431h.555c.06-.543-.157-1.163.19-1.642.384-.399 1.11.097.933.6.106.316-.215.898.167 1.042h.393c-.056-.651.16-1.385-.237-1.963-.328-.396-1.002-.468-1.362-.076-.147.001-.19-.238-.311-.276zm2.315.054c.05.645-.141 1.359.213 1.944.299.387.96.513 1.314.132.25-.084.356.443.641.157.17-.234.03-.55.07-.826V1.806h-.555c-.06.543.156 1.163-.19 1.642-.385.398-1.11-.097-.933-.601-.106-.318.256-1.05-.27-1.041h-.29zm-4.228.424c.268-.015.542.11.618.389-.382.126-.79.025-1.183.054h-.028c.06-.275.324-.429.593-.443z\" font-family=\"Nexa Bold\" font-size=\"15.875\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:125%;-inkscape-font-specification:'Nexa Bold, '\" word-spacing=\"0\"/></svg>");
        svg.resetButton = svg.parseString("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16.937 6.35\"><path d=\"M1.303 0l-.65.65c-.547.547-.649.902-.649 2.26 0 1.359.102 1.714.65 2.261.357.357.833.65 1.058.65.225 0 .806-.072.806.073 0 .17 1.912.36 5.969.36s6.334 0 6.334-.169c0-.145.184-.264.41-.264.224 0 .7-.293 1.057-.65.548-.547.65-.902.65-2.26 0-1.359-.102-1.714-.65-2.261l-.65-.65H8.472z\" fill=\"#f290c1\"/><path d=\"M1.303 0l-.65.65c-.547.547-.649.902-.649 2.26 0 1.359.102 1.714.65 2.261.357.357.833.65 1.058.65.225 0 .806.008.806.153 0 .17 1.418-.021 5.376-.021 3.85 0 6.693.297 6.795.132.09-.145.34-.264.557-.264.216 0 .685-.293 1.042-.65.548-.547.65-.902.65-2.26 0-1.359-.102-1.714-.65-2.261l-.65-.65H8.472zm13.915.983l.595.366c.385.237.595.623.595 1.096 0 .401-.06.73-.132.73-.135 0-.187-.708-.066-.898.036-.058-.172-.372-.463-.7zM.898 3.543c.097.003.164.108.164.278 0 .465-.158.533-.385.166-.084-.136-.031-.321.117-.413a.188.188 0 0 1 .104-.032zm.6.502c.039-.013.065.073.073.254.011.255.11.45.22.432.108-.017 2.103-.009 4.43.019 2.704.031 4.043.134 3.705.283-.291.128-2.22.227-4.288.22-3.826-.013-4.575-.204-4.225-1.077.033-.08.061-.123.085-.131z\" fill=\"#f291bd\"/><path d=\"M1.303 0l-.65.65c-.547.547-.649.902-.649 2.26 0 1.359.102 1.714.65 2.261.357.357.833.65 1.058.65.225 0 1.076.04 1.076.185 0 .17 1.807.09 5.765.09 3.85 0 6.034.154 6.136-.011.09-.145.34-.264.557-.264.216 0 .685-.293 1.042-.65.548-.547.65-.902.65-2.26 0-1.359-.102-1.714-.65-2.261l-.65-.65H8.472zm1.1.53H15.11l.65.649c.639.64.9 1.996.384 1.996-.146 0-.265-.178-.265-.395 0-.217-.26-.693-.577-1.058l-.576-.664H8.873c-6.265 0-6.941.117-7.496 1.293-.44.931-.4 1.181.298 1.836.575.54.865.575 4.762.575 2.59 0 4.15.1 4.15.265 0 .167-1.642.259-4.431.249-4.328-.016-4.446-.032-5.027-.653-.924-.986-.797-3.218.34-4.26z\" fill=\"#a3809c\"/><path d=\"M1.303 0l-.65.65c-.547.547-.649.902-.649 2.26 0 1.359.102 1.714.65 2.261.357.357.826.65 1.043.65.216 0 .386.232.542.241.535.03.73.005 1.13-.049.4-.055 3.114.04 6.344-.023l5.872-.115.676-.677c.577-.577.676-.912.676-2.288 0-1.358-.101-1.713-.649-2.26l-.65-.65H8.472zm.766.53h13.04l.65.649c.742.742.92 2.157.239 1.895-.234-.09-.342-.045-.25.102.088.143-.139.558-.504.923-.591.591-.881.663-2.66.663-1.154 0-1.997.112-1.997.265 0 .167-1.642.259-4.431.249-4.328-.016-4.446-.032-5.027-.653-.863-.92-.714-3.018.251-4.05zm12.487.528c-.013.014.067.121.231.331.2.255.408.463.463.463.218 0 .078-.217-.363-.563-.21-.164-.317-.244-.33-.23zM1.184 3.44c-.117 0 .066.297.408.661.341.364.714.661.827.661.113 0 .39.053.054-.311-.337-.364-1.171-1.011-1.289-1.011zM6.09 4.528c-.6 0-1.2.013-1.654.039-.91.051-.165.094 1.654.094s2.563-.043 1.653-.094a31.07 31.07 0 0 0-1.653-.04z\" fill=\"#a8769a\"/><path d=\"M1.303 0l-.65.65c-.546.547-.649.902-.649 2.258 0 1.303.113 1.73.595 2.245l.596.635 7.144.008 7.143.008.728-.64c.644-.567.727-.826.727-2.253 0-1.359-.101-1.714-.649-2.261l-.65-.65H8.472zm.53.53H15.11l.65.649c.885.886.815 1.583-.269 2.666-.884.884-.703.965-2.624.965-1.153 0-2.28.064-2.28.217 0 .167-1.642.259-4.431.249-4.328-.016-4.446-.032-5.027-.653-.845-.902-.819-2.572.054-3.444z\" fill=\"#2f99a1\"/><path d=\"M1.303 0l-.65.65c-.546.547-.649.902-.649 2.258 0 1.303.113 1.73.595 2.245l.596.635 7.144.008 7.016.103.855-.735c.644-.567.727-.826.727-2.253 0-1.359-.101-1.714-.649-2.261l-.65-.65H8.472zm.53.53H15.11l.65.649c.477.478.648.935.648 1.731 0 .797-.17 1.254-.649 1.732l-.65.65-6.692-.016-6.693-.017-.595-.635c-.845-.904-.755-2.749.118-3.62z\" fill=\"#5b3b6a\"/><path d=\"M16.673 1.587c-.12-.084-.265.542-.265 1.203 0 .924-.15 1.353-.649 1.852l-.65.65-13.228-.19-.698-.46c-.356-.357-.506-.943-.506-1.17 0-.224-.262-.297-.407-.297-.533 0-.005 1.371.833 2.25l.622.359 6.69.019 6.689.018.917-.917c.777-.777.917-1.101.917-2.117 0-.66-.034-1.037-.153-1.12z\"/><text style=\"line-height:1.25\" x=\"2.765\" y=\"2.203\" font-weight=\"400\" font-size=\"5.333\" font-family=\"sans-serif\" letter-spacing=\"0\" word-spacing=\"0\"/><g aria-label=\"reset\" style=\"line-height:1.25;-inkscape-font-specification:'Nexa Bold, '\" font-weight=\"400\" font-size=\"4.667\" font-family=\"Arial Rounded MT Bold\" letter-spacing=\"0\" word-spacing=\"0\" fill=\"#5b3b6a\"><path d=\"M3.417 3.587v.52c0 .125-.03.22-.088.284a.298.298 0 0 1-.226.093.285.285 0 0 1-.221-.095c-.058-.064-.087-.158-.087-.283V2.374c0-.28.101-.419.303-.419.104 0 .178.033.224.098a.54.54 0 0 1 .075.29c.074-.128.15-.225.228-.29a.478.478 0 0 1 .314-.098c.13 0 .258.033.38.098.124.065.185.152.185.26a.249.249 0 0 1-.08.19.242.242 0 0 1-.168.072.815.815 0 0 1-.166-.041.74.74 0 0 0-.23-.043.335.335 0 0 0-.224.073c-.058.047-.055.165-.087.26-.032.093-.101.158-.113.289-.013.129-.019.287-.019.474zM6.464 3.372H5.247c.002.142.03.266.084.374.057.108.13.19.221.244a.59.59 0 0 0 .306.082c.074 0 .094-.04.155-.057.062-.018.138-.093.196-.13.058-.037.11-.046.16-.088.048-.043.143-.053.22-.126a.204.204 0 0 1 .137-.041c.064 0 .115.017.155.052.04.035.06.085.06.149a.41.41 0 0 1-.067.198.798.798 0 0 1-.2.216c-.089.069-.2.126-.335.171a1.432 1.432 0 0 1-.463.068c-.4 0-.758-.05-.98-.278-.221-.228-.285-.6-.285-.99 0-.185.028-.355.082-.511.055-.158.135-.293.24-.406.105-.112.234-.198.387-.257.153-.061.324-.091.51-.091.244 0 .452.051.625.155.175.101.305.234.392.396.086.163.13.328.13.497 0 .156-.045.258-.135.305a.85.85 0 0 1-.378.068zM5.247 3.02l1.049-.016c-.016-.212.006-.355-.094-.46a.51.51 0 0 0-.392-.16.5.5 0 0 0-.383.162c-.099.107-.159.265-.18.474zM9.506 3.671a.768.768 0 0 1-.125.442.776.776 0 0 1-.372.278c-.162.062-.36.093-.595.093-.223 0-.414-.034-.574-.102a.841.841 0 0 1-.353-.255.521.521 0 0 1-.114-.31.25.25 0 0 1 .257-.248c.066 0 .116.015.151.047a.524.524 0 0 1 .1.135c.064.11.076.146.165.2.266-.033.433.05.587.05.124 0 .067.053.146-.002.08-.056.12-.12.12-.191 0-.11-.041-.19-.125-.24a1.515 1.515 0 0 0-.407-.143 3.538 3.538 0 0 1-.524-.166.873.873 0 0 1-.322-.233.53.53 0 0 1-.12-.353c0-.125.037-.242.111-.353a.76.76 0 0 1 .328-.265c.146-.066.322-.1.527-.1.16 0 .305.017.433.05.129.034.236.079.32.135a.645.645 0 0 1 .197.187.361.361 0 0 1 .068.2.23.23 0 0 1-.073.176c-.047.045-.114.068-.203.068a.254.254 0 0 1-.164-.055 1.116 1.116 0 0 1-.152-.164.562.562 0 0 0-.167-.146.524.524 0 0 0-.26-.054.503.503 0 0 0-.28.073c-.074.047-.111.106-.111.177 0 .066.027.12.082.162.054.041.192.06.284.087.093.027.157.076.32.116.192.047.35.103.471.169a.767.767 0 0 1 .278.232c.064.088.096.19.096.303zM11.773 3.372l-1.121.064c.001.141-.066.202-.011.31.056.108.13.19.22.244a.59.59 0 0 0 .306.082.764.764 0 0 0 .203-.025.71.71 0 0 0 .18-.082c.058-.038.11-.078.16-.12l.189-.174a.204.204 0 0 1 .136-.041c.064 0 .116.017.155.052.04.035.06.085.06.149a.41.41 0 0 1-.067.198.797.797 0 0 1-.2.216c-.088.069-.2.126-.335.171a1.432 1.432 0 0 1-.463.068c-.4 0-.71-.113-.932-.341-.221-.228-.332-.537-.332-.928 0-.184.027-.354.082-.51.054-.158.134-.293.239-.406.105-.112.234-.198.387-.257.154-.061.324-.091.51-.091.244 0 .452.051.625.155.175.101.305.234.392.396.087.163.13.328.13.497 0 .156-.045.258-.135.305a.85.85 0 0 1-.378.068zm-1.217-.353h1.128c-.015-.212-.073-.371-.173-.476-.099-.106-.182-.064-.344-.064-.155 0-.267.006-.367.114-.099.106-.222.217-.244.426zM12.842 2.01h.068v-.374c0-.1.003-.178.007-.235a.362.362 0 0 1 .046-.148.272.272 0 0 1 .104-.102.307.307 0 0 1 .367.048c.043.04.07.088.08.145.012.057-.006.36.002.464l.016.202h.228c.088 0 .155.021.2.064.048.04.071.094.071.16 0 .083-.033.141-.1.175-.065.033-.208-.048-.283.05l-.108.143c-.082.381 0 .762 0 1.144 0 .097-.005.03.001.082a.245.245 0 0 0 .055.128c.03.032.08.048.146.048a.82.82 0 0 0 .148-.019.729.729 0 0 1 .146-.02c.05 0 .095.02.134.061.041.04.062.09.062.149 0 .1-.055.177-.164.23-.11.053-.267.08-.472.08-.194 0-.342-.033-.442-.099a.46.46 0 0 1-.198-.27c-.03-.116-.101-.27-.093-.463.015-.398-.12-.343.047-1.194h-.082c-.09 0-.158-.022-.205-.064a.209.209 0 0 1-.07-.162c0-.065.024-.118.072-.16a.326.326 0 0 1 .217-.063z\" style=\"-inkscape-font-specification:'Arial Rounded MT Bold, '\"/></g></svg>");
    })(svg = pxsim.svg || (pxsim.svg = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var RefImage = /** @class */ (function () {
        function RefImage(w, h, bpp) {
            this.dirty = true;
            this.data = new Uint8Array(w * h);
            this._width = w;
            this._height = h;
            this._bpp = bpp;
        }
        RefImage.prototype.pix = function (x, y) {
            return (x | 0) + (y | 0) * this._width;
        };
        RefImage.prototype.inRange = function (x, y) {
            return 0 <= (x | 0) && (x | 0) < this._width &&
                0 <= (y | 0) && (y | 0) < this._height;
        };
        RefImage.prototype.color = function (c) {
            return c & 0xff;
        };
        RefImage.prototype.clamp = function (x, y) {
            x |= 0;
            y |= 0;
            if (x < 0)
                x = 0;
            else if (x >= this._width)
                x = this._width - 1;
            if (y < 0)
                y = 0;
            else if (y >= this._height)
                y = this._height - 1;
            return [x, y];
        };
        RefImage.prototype.makeWritable = function () {
            this.dirty = true;
        };
        return RefImage;
    }());
    pxsim.RefImage = RefImage;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var ImageMethods;
    (function (ImageMethods) {
        function XX(x) { return (x << 16) >> 16; }
        function YY(x) { return x >> 16; }
        function width(img) { return img._width; }
        ImageMethods.width = width;
        function height(img) { return img._height; }
        ImageMethods.height = height;
        function isMono(img) { return img._bpp == 1; }
        ImageMethods.isMono = isMono;
        function setPixel(img, x, y, c) {
            img.makeWritable();
            if (img.inRange(x, y))
                img.data[img.pix(x, y)] = img.color(c);
        }
        ImageMethods.setPixel = setPixel;
        function getPixel(img, x, y) {
            if (img.inRange(x, y))
                return img.data[img.pix(x, y)];
            return 0;
        }
        ImageMethods.getPixel = getPixel;
        function fill(img, c) {
            img.makeWritable();
            img.data.fill(img.color(c));
        }
        ImageMethods.fill = fill;
        function fillRect(img, x, y, w, h, c) {
            img.makeWritable();
            var _a = img.clamp(x + w - 1, y + h - 1), x2 = _a[0], y2 = _a[1];
            _b = img.clamp(x, y), x = _b[0], y = _b[1];
            var p = img.pix(x, y);
            w = x2 - x + 1;
            h = y2 - y + 1;
            var d = img._width - w;
            c = img.color(c);
            while (h-- > 0) {
                for (var i = 0; i < w; ++i)
                    img.data[p++] = c;
                p += d;
            }
            var _b;
        }
        ImageMethods.fillRect = fillRect;
        function _fillRect(img, xy, wh, c) {
            fillRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
        }
        ImageMethods._fillRect = _fillRect;
        function clone(img) {
            var r = new pxsim.RefImage(img._width, img._height, img._bpp);
            r.data.set(img.data);
            return r;
        }
        ImageMethods.clone = clone;
        function flipX(img) {
            img.makeWritable();
            var w = img._width;
            var h = img._height;
            for (var i = 0; i < h; ++i) {
                img.data.subarray(i * w, (i + 1) * w).reverse();
            }
        }
        ImageMethods.flipX = flipX;
        function flipY(img) {
            img.makeWritable();
            var w = img._width;
            var h = img._height;
            var d = img.data;
            for (var i = 0; i < w; ++i) {
                var top_1 = i;
                var bot = i + (h - 1) * w;
                while (top_1 < bot) {
                    var c = d[top_1];
                    d[top_1] = d[bot];
                    d[bot] = c;
                    top_1 += w;
                    bot -= w;
                }
            }
        }
        ImageMethods.flipY = flipY;
        function transposed(img) {
            var w = img._width;
            var h = img._height;
            var d = img.data;
            var r = new pxsim.RefImage(h, w, img._bpp);
            var n = r.data;
            var src = 0;
            for (var i = 0; i < h; ++i) {
                var dst = i;
                for (var j = 0; j < w; ++j) {
                    n[dst] = d[src++];
                    dst += w;
                }
            }
            return r;
        }
        ImageMethods.transposed = transposed;
        function copyFrom(img, from) {
            if (img._width != from._width || img._height != from._height ||
                img._bpp != from._bpp)
                return;
            img.data.set(from.data);
        }
        ImageMethods.copyFrom = copyFrom;
        function scroll(img, dx, dy) {
            img.makeWritable();
            dx |= 0;
            dy |= 0;
            if (dy < 0) {
                dy = -dy;
                if (dy < img._height)
                    img.data.copyWithin(0, dy * img._width);
                else
                    dy = img._height;
                img.data.fill(0, (img._height - dy) * img._width);
            }
            else if (dy > 0) {
                if (dy < img._height)
                    img.data.copyWithin(dy * img._width, 0);
                else
                    dy = img._height;
                img.data.fill(0, 0, dy * img._width);
            }
            // TODO implement dx
        }
        ImageMethods.scroll = scroll;
        function replace(img, from, to) {
            to &= 0xf;
            var d = img.data;
            for (var i = 0; i < d.length; ++i)
                if (d[i] == from)
                    d[i] = to;
        }
        ImageMethods.replace = replace;
        function doubledX(img) {
            var w = img._width;
            var h = img._height;
            var d = img.data;
            var r = new pxsim.RefImage(w * 2, h, img._bpp);
            var n = r.data;
            var dst = 0;
            for (var src = 0; src < d.length; ++src) {
                var c = d[src];
                n[dst++] = c;
                n[dst++] = c;
            }
            return r;
        }
        ImageMethods.doubledX = doubledX;
        function doubledY(img) {
            var w = img._width;
            var h = img._height;
            var d = img.data;
            var r = new pxsim.RefImage(w, h * 2, img._bpp);
            var n = r.data;
            var src = 0;
            var dst0 = 0;
            var dst1 = w;
            for (var i = 0; i < h; ++i) {
                for (var j = 0; j < w; ++j) {
                    var c = d[src++];
                    n[dst0++] = c;
                    n[dst1++] = c;
                }
                dst0 += w;
                dst1 += w;
            }
            return r;
        }
        ImageMethods.doubledY = doubledY;
        function doubled(img) {
            return doubledX(doubledY(img));
        }
        ImageMethods.doubled = doubled;
        function drawImageCore(img, from, x, y, clear, check) {
            x |= 0;
            y |= 0;
            var w = from._width;
            var h = from._height;
            var sh = img._height;
            var sw = img._width;
            if (x + w <= 0)
                return false;
            if (x >= sw)
                return false;
            if (y + h <= 0)
                return false;
            if (y >= sh)
                return false;
            if (clear)
                fillRect(img, x, y, from._width, from._height, 0);
            else if (!check)
                img.makeWritable();
            var len = x < 0 ? Math.min(sw, w + x) : Math.min(sw - x, w);
            var fdata = from.data;
            var tdata = img.data;
            for (var p = 0; h--; y++, p += w) {
                if (0 <= y && y < sh) {
                    var dst = y * sw;
                    var src = p;
                    if (x < 0)
                        src += -x;
                    else
                        dst += x;
                    for (var i = 0; i < len; ++i) {
                        var v = fdata[src++];
                        if (v) {
                            if (check) {
                                if (tdata[dst])
                                    return true;
                            }
                            else {
                                tdata[dst] = v;
                            }
                        }
                        dst++;
                    }
                }
            }
            return false;
        }
        function drawImage(img, from, x, y) {
            drawImageCore(img, from, x, y, true, false);
        }
        ImageMethods.drawImage = drawImage;
        function drawTransparentImage(img, from, x, y) {
            drawImageCore(img, from, x, y, false, false);
        }
        ImageMethods.drawTransparentImage = drawTransparentImage;
        function overlapsWith(img, other, x, y) {
            return drawImageCore(img, other, x, y, false, true);
        }
        ImageMethods.overlapsWith = overlapsWith;
        function drawLineLow(img, x0, y0, x1, y1, c) {
            var dx = x1 - x0;
            var dy = y1 - y0;
            var yi = img._width;
            if (dy < 0) {
                yi = -yi;
                dy = -dy;
            }
            var D = 2 * dy - dx;
            dx <<= 1;
            dy <<= 1;
            c = img.color(c);
            var ptr = img.pix(x0, y0);
            for (var x = x0; x <= x1; ++x) {
                img.data[ptr] = c;
                if (D > 0) {
                    ptr += yi;
                    D -= dx;
                }
                D += dy;
                ptr++;
            }
        }
        function drawLineHigh(img, x0, y0, x1, y1, c) {
            var dx = x1 - x0;
            var dy = y1 - y0;
            var xi = 1;
            if (dx < 0) {
                xi = -1;
                dx = -dx;
            }
            var D = 2 * dx - dy;
            dx <<= 1;
            dy <<= 1;
            c = img.color(c);
            var ptr = img.pix(x0, y0);
            for (var y = y0; y <= y1; ++y) {
                img.data[ptr] = c;
                if (D > 0) {
                    ptr += xi;
                    D -= dy;
                }
                D += dx;
                ptr += img._width;
            }
        }
        function _drawLine(img, xy, wh, c) {
            drawLine(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
        }
        ImageMethods._drawLine = _drawLine;
        function drawLine(img, x0, y0, x1, y1, c) {
            x0 |= 0;
            y0 |= 0;
            x1 |= 0;
            y1 |= 0;
            if (x1 < x0) {
                drawLine(img, x1, y1, x0, y0, c);
                return;
            }
            var w = x1 - x0;
            var h = y1 - y0;
            if (h == 0) {
                if (w == 0)
                    setPixel(img, x0, y0, c);
                else
                    fillRect(img, x0, y0, w + 1, 1, c);
                return;
            }
            if (w == 0) {
                if (h > 0)
                    fillRect(img, x0, y0, 1, h + 1, c);
                else
                    fillRect(img, x0, y1, 1, -h + 1, c);
                return;
            }
            if (x1 < 0 || x0 >= img._width)
                return;
            if (x0 < 0) {
                y0 -= (h * x0 / w) | 0;
                x0 = 0;
            }
            if (x1 >= img._width) {
                var d = (img._width - 1) - x1;
                y1 += (h * d / w) | 0;
                x1 = img._width - 1;
            }
            if (y0 < y1) {
                if (y0 >= img._height || y1 < 0)
                    return;
                if (y0 < 0) {
                    x0 -= (w * y0 / h) | 0;
                    y0 = 0;
                }
                if (y1 >= img._height) {
                    var d = (img._height - 1) - y1;
                    x1 += (w * d / h) | 0;
                    y1 = img._height;
                }
            }
            else {
                if (y1 >= img._height || y0 < 0)
                    return;
                if (y1 < 0) {
                    x1 -= (w * y1 / h) | 0;
                    y1 = 0;
                }
                if (y0 >= img._height) {
                    var d = (img._height - 1) - y0;
                    x0 += (w * d / h) | 0;
                    y0 = img._height;
                }
            }
            img.makeWritable();
            if (h < 0) {
                h = -h;
                if (h < w)
                    drawLineLow(img, x0, y0, x1, y1, c);
                else
                    drawLineHigh(img, x1, y1, x0, y0, c);
            }
            else {
                if (h < w)
                    drawLineLow(img, x0, y0, x1, y1, c);
                else
                    drawLineHigh(img, x0, y0, x1, y1, c);
            }
        }
        ImageMethods.drawLine = drawLine;
        function drawIcon(img, icon, x, y, color) {
            var img2 = icon.data;
            if (!img2 || img2.length < 5 || img2[0] != 0xe1)
                return;
            var w = img2[1];
            var h = img2[2];
            var byteH = (h + 7) >> 3;
            x |= 0;
            y |= 0;
            var sh = img._height;
            var sw = img._width;
            if (x + w <= 0)
                return;
            if (x >= sw)
                return;
            if (y + h <= 0)
                return;
            if (y >= sh)
                return;
            img.makeWritable();
            var p = 4;
            color = img.color(color);
            var screen = img.data;
            for (var i = 0; i < w; ++i) {
                var xxx = x + i;
                if (0 <= xxx && xxx < sw) {
                    var dst = xxx + y * sw;
                    var src = p;
                    var yy = y;
                    var end = Math.min(sh, h + y);
                    if (y < 0) {
                        src += ((-y) >> 3);
                        yy += ((-y) >> 3) * 8;
                    }
                    var mask = 0x01;
                    var v = img2[src++];
                    while (yy < end) {
                        if (yy >= 0 && (v & mask)) {
                            screen[dst] = color;
                        }
                        mask <<= 1;
                        if (mask == 0x100) {
                            mask = 0x01;
                            v = img2[src++];
                        }
                        dst += sw;
                        yy++;
                    }
                }
                p += byteH;
            }
        }
        ImageMethods.drawIcon = drawIcon;
        function _drawIcon(img, icon, xy, color) {
            drawIcon(img, icon, XX(xy), YY(xy), color);
        }
        ImageMethods._drawIcon = _drawIcon;
    })(ImageMethods = pxsim.ImageMethods || (pxsim.ImageMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var image;
    (function (image) {
        function byteWidth(h, bpp) {
            if (bpp == 1)
                return h * bpp + 7 >> 3;
            else
                return ((h * bpp + 31) >> 5) << 2;
        }
        function isValidImage(buf) {
            if (!buf || buf.data.length < 4)
                return false;
            if (buf.data[0] != 0xe1 && buf.data[0] != 0xe4)
                return false;
            var bpp = buf.data[0] & 0xf;
            var sz = buf.data[1] * byteWidth(buf.data[2], bpp);
            if (4 + sz != buf.data.length)
                return false;
            return true;
        }
        function create(w, h) {
            return new pxsim.RefImage(w, h, pxsim.getScreenState().bpp());
        }
        image.create = create;
        function ofBuffer(buf) {
            if (!isValidImage(buf))
                return null;
            var src = buf.data;
            var w = src[1];
            var h = src[2];
            if (w == 0 || h == 0)
                return null;
            var bpp = src[0] & 0xf;
            var r = new pxsim.RefImage(w, h, bpp);
            var dst = r.data;
            var srcP = 4;
            if (bpp == 1) {
                for (var i = 0; i < w; ++i) {
                    var dstP = i;
                    var mask = 0x01;
                    var v = src[srcP++];
                    for (var j = 0; j < h; ++j) {
                        if (mask == 0x100) {
                            mask = 0x01;
                            v = src[srcP++];
                        }
                        if (v & mask)
                            dst[dstP] = 1;
                        dstP += w;
                        mask <<= 1;
                    }
                }
            }
            else if (bpp == 4) {
                for (var i = 0; i < w; ++i) {
                    var dstP = i;
                    for (var j = 0; j < h >> 1; ++j) {
                        var v = src[srcP++];
                        dst[dstP] = v & 0xf;
                        dstP += w;
                        dst[dstP] = v >> 4;
                        dstP += w;
                    }
                    if (h & 1)
                        dst[dstP] = src[srcP++] & 0xf;
                    srcP = (srcP + 3) & ~3;
                }
            }
            return r;
        }
        image.ofBuffer = ofBuffer;
        function toBuffer(img) {
            var col = byteWidth(img._height, img._bpp);
            var sz = 4 + img._width * col;
            var r = new Uint8Array(sz);
            r[0] = 0xe0 | img._bpp;
            r[1] = img._width;
            r[2] = img._height;
            var dstP = 4;
            var w = img._width;
            var h = img._height;
            var data = img.data;
            for (var i = 0; i < w; ++i) {
                if (img._bpp == 4) {
                    var p = i;
                    for (var j = 0; j < h; j += 2) {
                        r[dstP++] = ((data[p + 1] & 0xf) << 4) | ((data[p] || 0) & 0xf);
                        p += 2 * w;
                    }
                    dstP = (dstP + 3) & ~3;
                }
                else if (img._bpp == 1) {
                    var mask = 0x01;
                    var p = i;
                    for (var j = 0; j < h; j++) {
                        if (data[p])
                            r[dstP] |= mask;
                        mask <<= 1;
                        p += w;
                        if (mask == 0x100) {
                            mask = 0x01;
                            dstP++;
                        }
                    }
                    if (mask != 0x01)
                        dstP++;
                }
            }
            return new pxsim.RefBuffer(r);
        }
        image.toBuffer = toBuffer;
        function doubledIcon(buf) {
            var img = ofBuffer(buf);
            if (!img)
                return null;
            img = pxsim.ImageMethods.doubled(img);
            return toBuffer(img);
        }
        image.doubledIcon = doubledIcon;
    })(image = pxsim.image || (pxsim.image = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        function updateScreen(img) {
            pxsim.getScreenState().showImage(img);
        }
        pxtcore.updateScreen = updateScreen;
        function updateStats(s) {
            pxsim.getScreenState().updateStats(s);
        }
        pxtcore.updateStats = updateStats;
        function setPalette(b) {
            pxsim.getScreenState().setPalette(b);
        }
        pxtcore.setPalette = setPalette;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function htmlColorToUint32(hexColor) {
        var ca = new Uint8ClampedArray(4);
        var ui = new Uint32Array(ca.buffer);
        var v = parseInt(hexColor.replace(/#/, ""), 16);
        ca[0] = (v >> 16) & 0xff;
        ca[1] = (v >> 8) & 0xff;
        ca[2] = (v >> 0) & 0xff;
        ca[3] = 0xff; // alpha
        // convert to uint32 using target endian
        return new Uint32Array(ca.buffer)[0];
    }
    var ScreenState = /** @class */ (function () {
        function ScreenState(paletteSrc, w, h) {
            if (w === void 0) { w = 0; }
            if (h === void 0) { h = 0; }
            this.width = 0;
            this.height = 0;
            this.lastImageFlushTime = 0;
            this.changed = true;
            this.onChange = function () { };
            if (!paletteSrc)
                paletteSrc = ["#000000", "#ffffff"];
            this.palette = new Uint32Array(paletteSrc.length);
            for (var i = 0; i < this.palette.length; ++i) {
                this.palette[i] = htmlColorToUint32(paletteSrc[i]);
            }
            if (w) {
                this.width = w;
                this.height = h;
                this.screen = new Uint32Array(this.width * this.height);
                this.screen.fill(this.palette[0]);
            }
        }
        ScreenState.prototype.setPalette = function (buf) {
            var ca = new Uint8ClampedArray(4);
            var rd = new Uint32Array(ca.buffer);
            var src = buf.data;
            this.palette = new Uint32Array((src.length / 3) | 0);
            for (var i = 0; i < this.palette.length; ++i) {
                var p = i * 3;
                ca[0] = src[p + 0];
                ca[1] = src[p + 1];
                ca[2] = src[p + 2];
                ca[3] = 0xff; // alpha
                // convert to uint32 using target endian
                this.palette[i] = rd[0];
            }
        };
        ScreenState.prototype.bpp = function () {
            return this.palette.length > 2 ? 4 : 1;
        };
        ScreenState.prototype.didChange = function () {
            var res = this.changed;
            this.changed = false;
            return res;
        };
        ScreenState.prototype.maybeForceUpdate = function () {
            if (Date.now() - this.lastImageFlushTime > 200) {
                this.showImage(null);
            }
        };
        ScreenState.prototype.showImage = function (img) {
            pxsim.runtime.startPerfCounter(0);
            if (!img)
                img = this.lastImage;
            if (!img)
                return;
            if (this.width == 0) {
                this.width = img._width;
                this.height = img._height;
                this.screen = new Uint32Array(this.width * this.height);
            }
            this.lastImageFlushTime = Date.now();
            if (img == this.lastImage) {
                if (!img.dirty)
                    return;
            }
            else {
                this.lastImage = img;
            }
            this.changed = true;
            img.dirty = false;
            var src = img.data;
            var dst = this.screen;
            if (this.width != img._width || this.height != img._height || src.length != dst.length)
                pxsim.U.userError("wrong size");
            var p = this.palette;
            var mask = p.length - 1;
            for (var i = 0; i < src.length; ++i) {
                dst[i] = p[src[i] & mask];
            }
            this.onChange();
            pxsim.runtime.stopPerfCounter(0);
        };
        ScreenState.prototype.updateStats = function (stats) {
            this.stats = stats;
        };
        return ScreenState;
    }());
    pxsim.ScreenState = ScreenState;
    function getScreenState() {
        return pxsim.board().screenState;
    }
    pxsim.getScreenState = getScreenState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var AudioState = /** @class */ (function () {
        function AudioState() {
            this.outputDestination_ = 0;
            this.volume = 100;
            this.playing = false;
        }
        AudioState.prototype.startPlaying = function () {
            this.playing = true;
        };
        AudioState.prototype.stopPlaying = function () {
            this.playing = false;
        };
        AudioState.prototype.isPlaying = function () {
            return this.playing;
        };
        return AudioState;
    }());
    pxsim.AudioState = AudioState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var music;
    (function (music) {
        function noteFrequency(note) {
            return note;
        }
        music.noteFrequency = noteFrequency;
        function setOutput(mode) {
            var audioState = pxsim.getAudioState();
            audioState.outputDestination_ = mode;
        }
        music.setOutput = setOutput;
        function setVolume(volume) {
            var audioState = pxsim.getAudioState();
            audioState.volume = Math.max(0, 1024, volume * 4);
        }
        music.setVolume = setVolume;
        function setPitchPin(pin) {
            var audioState = pxsim.getAudioState();
            audioState.pitchPin_ = pin;
        }
        music.setPitchPin = setPitchPin;
        function setTone(buffer) {
            // TODO: implement set tone in the audio context
        }
        music.setTone = setTone;
        function playTone(frequency, ms) {
            var b = pxsim.board();
            if (!b)
                return;
            var audioState = pxsim.getAudioState();
            var currentOutput = audioState.outputDestination_;
            audioState.startPlaying();
            pxsim.runtime.queueDisplayUpdate();
            pxsim.AudioContextManager.tone(frequency, 1);
            var cb = pxsim.getResume();
            if (ms <= 0)
                cb();
            else {
                setTimeout(function () {
                    pxsim.AudioContextManager.stop();
                    audioState.stopPlaying();
                    pxsim.runtime.queueDisplayUpdate();
                    cb();
                }, ms);
            }
        }
        music.playTone = playTone;
        function getPitchPin() {
            var audioState = pxsim.getAudioState();
            if (!audioState.pitchPin_) {
                audioState.pitchPin_ = pxsim.board().getDefaultPitchPin();
            }
            return audioState.pitchPin_;
        }
    })(music = pxsim.music || (pxsim.music = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function getAudioState() {
        return pxsim.board().audioState;
    }
    pxsim.getAudioState = getAudioState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var info;
    (function (info) {
        function updateHighScore(score) {
            var b = pxsim.board();
            var id = b.runOptions.version || "local";
            if (!id || !window.localStorage)
                return 0;
            try {
                var key = "highscore-" + id;
                var hs = parseFloat(window.localStorage[key]) || 0;
                if (score > hs) {
                    hs = score;
                    window.localStorage[key] = hs;
                }
                return hs;
            }
            catch (e) { }
            return score;
        }
        info.updateHighScore = updateHighScore;
    })(info = pxsim.info || (pxsim.info = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var control;
    (function (control) {
        control.runInParallel = pxsim.thread.runInBackground;
        control.delay = pxsim.thread.pause;
        function reset() {
            pxsim.Runtime.postMessage({
                type: "simulator",
                command: "restart"
            });
            var cb = pxsim.getResume();
        }
        control.reset = reset;
        function waitMicros(micros) {
            pxsim.thread.pause(micros / 1000); // it prempts not much we can do here.
        }
        control.waitMicros = waitMicros;
        function deviceName() {
            var b = pxsim.board();
            return b && b.id
                ? b.id.slice(0, 4)
                : "abcd";
        }
        control.deviceName = deviceName;
        function deviceSerialNumber() {
            var b = pxsim.board();
            return parseInt(b && b.id
                ? b.id.slice(1)
                : "42");
        }
        control.deviceSerialNumber = deviceSerialNumber;
        function deviceDalVersion() {
            return "0.0.0";
        }
        control.deviceDalVersion = deviceDalVersion;
        function internalOnEvent(id, evid, handler) {
            pxsim.pxtcore.registerWithDal(id, evid, handler);
        }
        control.internalOnEvent = internalOnEvent;
        function waitForEvent(id, evid) {
            var cb = pxsim.getResume();
            pxsim.board().bus.wait(id, evid, cb);
        }
        control.waitForEvent = waitForEvent;
        function allocateNotifyEvent() {
            var b = pxsim.board();
            return b.bus.nextNotifyEvent++;
        }
        control.allocateNotifyEvent = allocateNotifyEvent;
        function raiseEvent(id, evid, mode) {
            // TODO mode?
            pxsim.board().bus.queue(id, evid);
        }
        control.raiseEvent = raiseEvent;
        function millis() {
            return pxsim.runtime.runningTime();
        }
        control.millis = millis;
        function delayMicroseconds(us) {
            control.delay(us / 0.001);
        }
        control.delayMicroseconds = delayMicroseconds;
        function createBuffer(size) {
            return pxsim.BufferMethods.createBuffer(size);
        }
        control.createBuffer = createBuffer;
        function dmesg(msg) {
            console.log("DMESG: " + msg);
        }
        control.dmesg = dmesg;
        function dmesgPtr(msg, ptr) {
            console.log("DMESG: " + msg + " " + ptr);
        }
        control.dmesgPtr = dmesgPtr;
        function dmesgValue(ptr) {
            console.log("DMESG: " + ptr);
        }
        control.dmesgValue = dmesgValue;
        function gc() { }
        control.gc = gc;
        function profilingEnabled() {
            return !!pxsim.runtime.perfCounters;
        }
        control.profilingEnabled = profilingEnabled;
        function __log(str) {
            console.log(str);
            pxsim.runtime.board.writeSerial(str);
        }
        control.__log = __log;
    })(control = pxsim.control || (pxsim.control = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var loops;
    (function (loops) {
        loops.pause = pxsim.thread.pause;
        loops.forever = pxsim.thread.forever;
    })(loops = pxsim.loops || (pxsim.loops = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var PinFlags;
    (function (PinFlags) {
        PinFlags[PinFlags["Unused"] = 0] = "Unused";
        PinFlags[PinFlags["Digital"] = 1] = "Digital";
        PinFlags[PinFlags["Analog"] = 2] = "Analog";
        PinFlags[PinFlags["Input"] = 4] = "Input";
        PinFlags[PinFlags["Output"] = 8] = "Output";
        PinFlags[PinFlags["Touch"] = 16] = "Touch";
    })(PinFlags = pxsim.PinFlags || (pxsim.PinFlags = {}));
    var Pin = /** @class */ (function () {
        function Pin(id) {
            this.id = id;
            this.touched = false;
            this.value = 0;
            this.period = 0;
            this.servoAngle = 0;
            this.mode = PinFlags.Unused;
            this.pitch = false;
            this.pull = 0; // PullDown
            this.eventMode = 0;
        }
        Pin.prototype.setValue = function (value) {
            // value set from the simulator
            var old = this.value;
            this.value = value;
            var b = pxsim.board();
            if (b && this.eventMode == DAL.DEVICE_PIN_EVENT_ON_EDGE && old != this.value)
                b.bus.queue(this.id, this.value > 0 ? DAL.DEVICE_PIN_EVT_RISE : DAL.DEVICE_PIN_EVT_FALL);
        };
        Pin.prototype.digitalReadPin = function () {
            this.mode = PinFlags.Digital | PinFlags.Input;
            return this.value > 100 ? 1 : 0;
        };
        Pin.prototype.digitalWritePin = function (value) {
            var b = pxsim.board();
            this.mode = PinFlags.Digital | PinFlags.Output;
            var v = this.value;
            this.value = value > 0 ? 1023 : 0;
            pxsim.runtime.queueDisplayUpdate();
        };
        Pin.prototype.setPull = function (pull) {
            this.pull = pull;
        };
        Pin.prototype.analogReadPin = function () {
            this.mode = PinFlags.Analog | PinFlags.Input;
            return this.value || 0;
        };
        Pin.prototype.analogWritePin = function (value) {
            var b = pxsim.board();
            this.mode = PinFlags.Analog | PinFlags.Output;
            var v = this.value;
            this.value = Math.max(0, Math.min(1023, value));
            pxsim.runtime.queueDisplayUpdate();
        };
        Pin.prototype.analogSetPeriod = function (micros) {
            this.mode = PinFlags.Analog | PinFlags.Output;
            this.period = micros;
            pxsim.runtime.queueDisplayUpdate();
        };
        Pin.prototype.servoWritePin = function (value) {
            this.analogSetPeriod(20000);
            this.servoAngle = Math.max(0, Math.min(180, value));
            pxsim.runtime.queueDisplayUpdate();
        };
        Pin.prototype.servoSetPulse = function (pinId, micros) {
            // TODO
        };
        Pin.prototype.isTouched = function () {
            this.mode = PinFlags.Touch | PinFlags.Analog | PinFlags.Input;
            return this.touched;
        };
        Pin.prototype.onEvent = function (ev, handler) {
            var b = pxsim.board();
            switch (ev) {
                case DAL.DEVICE_PIN_EVT_PULSE_HI:
                case DAL.DEVICE_PIN_EVT_PULSE_LO:
                    this.eventMode = DAL.DEVICE_PIN_EVENT_ON_PULSE;
                    break;
                case DAL.DEVICE_PIN_EVT_RISE:
                case DAL.DEVICE_PIN_EVT_FALL:
                    this.eventMode = DAL.DEVICE_PIN_EVENT_ON_EDGE;
                    break;
                default:
                    return;
            }
            b.bus.listen(this.id, ev, handler);
        };
        return Pin;
    }());
    pxsim.Pin = Pin;
    var EdgeConnectorState = /** @class */ (function () {
        function EdgeConnectorState(props) {
            this.props = props;
            this.pins = props.pins.map(function (id) { return id != undefined ? new Pin(id) : null; });
        }
        EdgeConnectorState.prototype.getPin = function (id) {
            return this.pins.filter(function (p) { return p && p.id == id; })[0] || null;
        };
        return EdgeConnectorState;
    }());
    pxsim.EdgeConnectorState = EdgeConnectorState;
})(pxsim || (pxsim = {}));

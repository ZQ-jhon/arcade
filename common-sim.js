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
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function onGesture(gesture, handler) {
            var b = pxsim.accelerometer();
            b.accelerometer.activate();
            if (gesture == 11 /* ACCELEROMETER_EVT_SHAKE */ && !b.useShake) {
                b.useShake = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            pxsim.pxtcore.registerWithDal(13 /* DEVICE_ID_GESTURE */, gesture, handler);
        }
        input.onGesture = onGesture;
        function rotation(kind) {
            var b = pxsim.accelerometer();
            var acc = b.accelerometer;
            acc.activate();
            var x = acc.getX(pxsim.MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var y = acc.getY(pxsim.MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var z = acc.getZ(pxsim.MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var roll = Math.atan2(y, z);
            var pitch = Math.atan(-x / (y * Math.sin(roll) + z * Math.cos(roll)));
            var r = 0;
            switch (kind) {
                case 0:
                    r = pitch;
                    break;
                case 1:
                    r = roll;
                    break;
            }
            return Math.floor(r / Math.PI * 180);
        }
        input.rotation = rotation;
        function setAccelerometerRange(range) {
            var b = pxsim.accelerometer();
            b.accelerometer.setSampleRange(range);
        }
        input.setAccelerometerRange = setAccelerometerRange;
        function acceleration(dimension) {
            var b = pxsim.accelerometer();
            var acc = b.accelerometer;
            acc.activate();
            switch (dimension) {
                case 0: return acc.getX();
                case 1: return acc.getY();
                case 2: return acc.getZ();
                default: return Math.floor(Math.sqrt(acc.instantaneousAccelerationSquared()));
            }
        }
        input.acceleration = acceleration;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    /**
      * Co-ordinate systems that can be used.
      * RAW: Unaltered data. Data will be returned directly from the accelerometer.
      *
      * SIMPLE_CARTESIAN: Data will be returned based on an easy to understand alignment, consistent with the cartesian system taught in schools.
      * When held upright, facing the user:
      *
      *                            /
      *    +--------------------+ z
      *    |                    |
      *    |       .....        |
      *    | *     .....      * |
      * ^  |       .....        |
      * |  |                    |
      * y  +--------------------+  x-->
      *
      *
      * NORTH_EAST_DOWN: Data will be returned based on the industry convention of the North East Down (NED) system.
      * When held upright, facing the user:
      *
      *                            z
      *    +--------------------+ /
      *    |                    |
      *    |       .....        |
      *    | *     .....      * |
      * ^  |       .....        |
      * |  |                    |
      * x  +--------------------+  y-->
      *
      */
    var MicroBitCoordinateSystem;
    (function (MicroBitCoordinateSystem) {
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["RAW"] = 0] = "RAW";
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["SIMPLE_CARTESIAN"] = 1] = "SIMPLE_CARTESIAN";
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["NORTH_EAST_DOWN"] = 2] = "NORTH_EAST_DOWN";
    })(MicroBitCoordinateSystem = pxsim.MicroBitCoordinateSystem || (pxsim.MicroBitCoordinateSystem = {}));
    var Accelerometer = /** @class */ (function () {
        function Accelerometer(runtime) {
            this.runtime = runtime;
            this.sigma = 0; // the number of ticks that the instantaneous gesture has been stable.
            this.lastGesture = 0; // the last, stable gesture recorded.
            this.currentGesture = 0; // the instantaneous, unfiltered gesture detected.
            this.sample = { x: 0, y: 0, z: -1023 };
            this.shake = { x: false, y: false, z: false, count: 0, shaken: 0, timer: 0 }; // State information needed to detect shake events.
            this.isActive = false;
            this.sampleRange = 2;
            this.id = 5 /* DEVICE_ID_ACCELEROMETER */;
        }
        Accelerometer.prototype.setSampleRange = function (range) {
            this.activate();
            this.sampleRange = Math.max(1, Math.min(8, range));
        };
        Accelerometer.prototype.activate = function () {
            if (!this.isActive) {
                this.isActive = true;
                this.runtime.queueDisplayUpdate();
            }
        };
        /**
         * Reads the acceleration data from the accelerometer, and stores it in our buffer.
         * This is called by the tick() member function, if the interrupt is set!
         */
        Accelerometer.prototype.update = function (x, y, z) {
            // read MSB values...
            this.sample.x = Math.floor(x);
            this.sample.y = Math.floor(y);
            this.sample.z = Math.floor(z);
            // Update gesture tracking
            this.updateGesture();
            // Indicate that a new sample is available
            pxsim.board().bus.queue(this.id, 1 /* ACCELEROMETER_EVT_DATA_UPDATE */);
        };
        Accelerometer.prototype.instantaneousAccelerationSquared = function () {
            // Use pythagoras theorem to determine the combined force acting on the device.
            return this.sample.x * this.sample.x + this.sample.y * this.sample.y + this.sample.z * this.sample.z;
        };
        /**
         * Service function. Determines the best guess posture of the device based on instantaneous data.
         * This makes no use of historic data (except for shake), and forms this input to the filter implemented in updateGesture().
         *
         * @return A best guess of the current posture of the device, based on instantaneous data.
         */
        Accelerometer.prototype.instantaneousPosture = function () {
            var force = this.instantaneousAccelerationSquared();
            var shakeDetected = false;
            // Test for shake events.
            // We detect a shake by measuring zero crossings in each axis. In other words, if we see a strong acceleration to the left followed by
            // a string acceleration to the right, then we can infer a shake. Similarly, we can do this for each acxis (left/right, up/down, in/out).
            //
            // If we see enough zero crossings in succession (MICROBIT_ACCELEROMETER_SHAKE_COUNT_THRESHOLD), then we decide that the device
            // has been shaken.
            if ((this.getX() < -400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.x) || (this.getX() > 400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.x)) {
                shakeDetected = true;
                this.shake.x = !this.shake.x;
            }
            if ((this.getY() < -400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.y) || (this.getY() > 400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.y)) {
                shakeDetected = true;
                this.shake.y = !this.shake.y;
            }
            if ((this.getZ() < -400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.z) || (this.getZ() > 400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.z)) {
                shakeDetected = true;
                this.shake.z = !this.shake.z;
            }
            if (shakeDetected && this.shake.count < 4 /* ACCELEROMETER_SHAKE_COUNT_THRESHOLD */ && ++this.shake.count == 4 /* ACCELEROMETER_SHAKE_COUNT_THRESHOLD */)
                this.shake.shaken = 1;
            if (++this.shake.timer >= 10 /* ACCELEROMETER_SHAKE_DAMPING */) {
                this.shake.timer = 0;
                if (this.shake.count > 0) {
                    if (--this.shake.count == 0)
                        this.shake.shaken = 0;
                }
            }
            if (this.shake.shaken)
                return 11 /* ACCELEROMETER_EVT_SHAKE */;
            var sq = function (n) { return n * n; };
            if (force < sq(400 /* ACCELEROMETER_FREEFALL_TOLERANCE */))
                return 7 /* ACCELEROMETER_EVT_FREEFALL */;
            if (force > sq(3072 /* ACCELEROMETER_3G_TOLERANCE */))
                return 8 /* ACCELEROMETER_EVT_3G */;
            if (force > sq(6144 /* ACCELEROMETER_6G_TOLERANCE */))
                return 9 /* ACCELEROMETER_EVT_6G */;
            if (force > sq(8192 /* ACCELEROMETER_8G_TOLERANCE */))
                return 10 /* ACCELEROMETER_EVT_8G */;
            // Determine our posture.
            if (this.getX() < (-1000 + 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 3 /* ACCELEROMETER_EVT_TILT_LEFT */;
            if (this.getX() > (1000 - 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 4 /* ACCELEROMETER_EVT_TILT_RIGHT */;
            if (this.getY() < (-1000 + 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 1 /* ACCELEROMETER_EVT_TILT_UP */;
            if (this.getY() > (1000 - 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 2 /* ACCELEROMETER_EVT_TILT_DOWN */;
            if (this.getZ() < (-1000 + 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 5 /* ACCELEROMETER_EVT_FACE_UP */;
            if (this.getZ() > (1000 - 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 6 /* ACCELEROMETER_EVT_FACE_DOWN */;
            return 0;
        };
        Accelerometer.prototype.updateGesture = function () {
            // Determine what it looks like we're doing based on the latest sample...
            var g = this.instantaneousPosture();
            // Perform some low pass filtering to reduce jitter from any detected effects
            if (g == this.currentGesture) {
                if (this.sigma < 5 /* ACCELEROMETER_GESTURE_DAMPING */)
                    this.sigma++;
            }
            else {
                this.currentGesture = g;
                this.sigma = 0;
            }
            // If we've reached threshold, update our record and raise the relevant event...
            if (this.currentGesture != this.lastGesture && this.sigma >= 5 /* ACCELEROMETER_GESTURE_DAMPING */) {
                this.lastGesture = this.currentGesture;
                pxsim.board().bus.queue(13 /* DEVICE_ID_GESTURE */, this.lastGesture);
            }
        };
        /**
          * Reads the X axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the X axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getX();
          * uBit.accelerometer.getX(RAW);
          * @endcode
          */
        Accelerometer.prototype.getX = function (system) {
            if (system === void 0) { system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN; }
            this.activate();
            var val;
            switch (system) {
                case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                    val = -this.sample.x;
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    val = this.sample.y;
                //case MicroBitCoordinateSystem.SIMPLE_CARTESIAN.RAW:
                default:
                    val = this.sample.x;
            }
            return pxsim.board().invertAccelerometerXAxis ? val * -1 : val;
        };
        /**
          * Reads the Y axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the Y axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getY();
          * uBit.accelerometer.getY(RAW);
          * @endcode
          */
        Accelerometer.prototype.getY = function (system) {
            if (system === void 0) { system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN; }
            this.activate();
            var val;
            switch (system) {
                case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                    val = -this.sample.y;
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    val = -this.sample.x;
                //case RAW:
                default:
                    val = this.sample.y;
            }
            return pxsim.board().invertAccelerometerYAxis ? val * -1 : val;
        };
        /**
          * Reads the Z axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the Z axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getZ();
          * uBit.accelerometer.getZ(RAW);
          * @endcode
          */
        Accelerometer.prototype.getZ = function (system) {
            if (system === void 0) { system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN; }
            this.activate();
            var val;
            switch (system) {
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    val = -this.sample.z;
                //case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                //case MicroBitCoordinateSystem.RAW:
                default:
                    val = this.sample.z;
            }
            return pxsim.board().invertAccelerometerZAxis ? val * -1 : val;
        };
        /**
          * Provides a rotation compensated pitch of the device, based on the latest update from the accelerometer.
          * @return The pitch of the device, in degrees.
          *
          * Example:
          * @code
          * uBit.accelerometer.getPitch();
          * @endcode
          */
        Accelerometer.prototype.getPitch = function () {
            this.activate();
            return Math.floor((360 * this.getPitchRadians()) / (2 * Math.PI));
        };
        Accelerometer.prototype.getPitchRadians = function () {
            this.recalculatePitchRoll();
            return this.pitch;
        };
        /**
          * Provides a rotation compensated roll of the device, based on the latest update from the accelerometer.
          * @return The roll of the device, in degrees.
          *
          * Example:
          * @code
          * uBit.accelerometer.getRoll();
          * @endcode
          */
        Accelerometer.prototype.getRoll = function () {
            this.activate();
            return Math.floor((360 * this.getRollRadians()) / (2 * Math.PI));
        };
        Accelerometer.prototype.getRollRadians = function () {
            this.recalculatePitchRoll();
            return this.roll;
        };
        /**
         * Recalculate roll and pitch values for the current sample.
         * We only do this at most once per sample, as the necessary trigonemteric functions are rather
         * heavyweight for a CPU without a floating point unit...
         */
        Accelerometer.prototype.recalculatePitchRoll = function () {
            var x = this.getX(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var y = this.getY(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var z = this.getZ(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            this.roll = Math.atan2(y, z);
            this.pitch = Math.atan(-x / (y * Math.sin(this.roll) + z * Math.cos(this.roll)));
        };
        return Accelerometer;
    }());
    pxsim.Accelerometer = Accelerometer;
    var AccelerometerState = /** @class */ (function () {
        function AccelerometerState(runtime) {
            this.useShake = false;
            this.tiltDecayer = 0;
            this.accelerometer = new Accelerometer(runtime);
        }
        AccelerometerState.prototype.attachEvents = function (element) {
            var _this = this;
            this.element = element;
            this.tiltDecayer = 0;
            this.element.addEventListener(pxsim.pointerEvents.move, function (ev) {
                if (!_this.accelerometer.isActive)
                    return;
                if (_this.tiltDecayer) {
                    clearInterval(_this.tiltDecayer);
                    _this.tiltDecayer = 0;
                }
                var bbox = element.getBoundingClientRect();
                var ax = (ev.clientX - bbox.width / 2) / (bbox.width / 3);
                var ay = (ev.clientY - bbox.height / 2) / (bbox.height / 3);
                var x = -Math.max(-1023, Math.min(1023, Math.floor(ax * 1023)));
                var y = Math.max(-1023, Math.min(1023, Math.floor(ay * 1023)));
                var z2 = 1023 * 1023 - x * x - y * y;
                var z = Math.floor((z2 > 0 ? -1 : 1) * Math.sqrt(Math.abs(z2)));
                _this.accelerometer.update(-x, y, z);
                _this.updateTilt();
            }, false);
            this.element.addEventListener(pxsim.pointerEvents.leave, function (ev) {
                if (!_this.accelerometer.isActive)
                    return;
                if (!_this.tiltDecayer) {
                    _this.tiltDecayer = setInterval(function () {
                        var accx = _this.accelerometer.getX();
                        accx = Math.floor(Math.abs(accx) * 0.85) * (accx > 0 ? 1 : -1);
                        var accy = _this.accelerometer.getY();
                        accy = Math.floor(Math.abs(accy) * 0.85) * (accy > 0 ? 1 : -1);
                        console.log(accy);
                        var accz = -Math.sqrt(Math.max(0, 1023 * 1023 - accx * accx - accy * accy));
                        if (Math.abs(accx) <= 24 && Math.abs(accy) <= 24) {
                            clearInterval(_this.tiltDecayer);
                            _this.tiltDecayer = 0;
                            accx = 0;
                            accy = 0;
                            accz = -1023;
                        }
                        _this.accelerometer.update(accx, accy, accz);
                        _this.updateTilt();
                    }, 50);
                }
            }, false);
        };
        AccelerometerState.prototype.updateTilt = function () {
            if (!this.accelerometer.isActive || !this.element)
                return;
            var x = this.accelerometer.getX();
            var y = this.accelerometer.getY();
            var af = 8 / 1023;
            var s = 1 - Math.min(0.1, Math.pow(Math.max(Math.abs(x), Math.abs(y)) / 1023, 2) / 35);
            this.element.style.transform = "perspective(30em) rotateX(" + y * af + "deg) rotateY(" + x * af + "deg) scale(" + s + ", " + s + ")";
            this.element.style.perspectiveOrigin = "50% 50% 50%";
            this.element.style.perspective = "30em";
        };
        return AccelerometerState;
    }());
    pxsim.AccelerometerState = AccelerometerState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function accelerometer() {
        return pxsim.board().accelerometerState;
    }
    pxsim.accelerometer = accelerometer;
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
/// <reference path="../../../node_modules/pxt-core/built/pxtsim.d.ts" />
var pxsim;
(function (pxsim) {
    function board() {
        return pxsim.runtime.board;
    }
    pxsim.board = board;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        // TODO: add in support for mode, as in CODAL
        function registerWithDal(id, evid, handler, mode) {
            if (mode === void 0) { mode = 0; }
            pxsim.board().bus.listen(id, evid, handler);
        }
        pxtcore.registerWithDal = registerWithDal;
        function getPin(id) {
            return pxsim.board().edgeConnectorState.getPin(id);
        }
        pxtcore.getPin = getPin;
        function getPinCfg(key) {
            return getPin(pxtcore.getConfig(key, -1));
        }
        pxtcore.getPinCfg = getPinCfg;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var loops;
    (function (loops) {
        loops.pause = pxsim.thread.pause;
        loops.forever = pxsim.thread.forever;
    })(loops = pxsim.loops || (pxsim.loops = {}));
})(pxsim || (pxsim = {}));
/// <reference path="../../core/dal.d.ts"/>
var pxsim;
(function (pxsim) {
    var DOUBLE_CLICK_TIME = 500;
    var CommonButton = /** @class */ (function (_super) {
        __extends(CommonButton, _super);
        function CommonButton() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._pressedTime = -1;
            _this._clickedTime = -1;
            return _this;
        }
        CommonButton.prototype.setPressed = function (p) {
            if (this.pressed === p) {
                return;
            }
            this.pressed = p;
            if (p) {
                this._wasPressed = true;
                pxsim.board().bus.queue(this.id, 1 /* DEVICE_BUTTON_EVT_DOWN */);
                this._pressedTime = pxsim.runtime.runningTime();
            }
            else if (this._pressedTime !== -1) {
                pxsim.board().bus.queue(this.id, 2 /* DEVICE_BUTTON_EVT_UP */);
                var current = pxsim.runtime.runningTime();
                if (current - this._pressedTime >= 1000 /* DEVICE_BUTTON_LONG_CLICK_TIME */) {
                    pxsim.board().bus.queue(this.id, 4 /* DEVICE_BUTTON_EVT_LONG_CLICK */);
                }
                else {
                    pxsim.board().bus.queue(this.id, 3 /* DEVICE_BUTTON_EVT_CLICK */);
                }
                if (this._clickedTime !== -1) {
                    if (current - this._clickedTime <= DOUBLE_CLICK_TIME) {
                        pxsim.board().bus.queue(this.id, 6 /* DEVICE_BUTTON_EVT_DOUBLE_CLICK */);
                    }
                }
                this._clickedTime = current;
            }
        };
        CommonButton.prototype.wasPressed = function () {
            var temp = this._wasPressed;
            this._wasPressed = false;
            return temp;
        };
        CommonButton.prototype.isPressed = function () {
            return this.pressed;
        };
        return CommonButton;
    }(pxsim.Button));
    pxsim.CommonButton = CommonButton;
    var CommonButtonState = /** @class */ (function () {
        function CommonButtonState(buttons) {
            var _this = this;
            this.usesButtonAB = false;
            this.buttonsByPin = {};
            this.buttons = buttons || [
                new CommonButton(1 /* DEVICE_ID_BUTTON_A */),
                new CommonButton(2 /* DEVICE_ID_BUTTON_B */),
                new CommonButton(3 /* DEVICE_ID_BUTTON_AB */)
            ];
            this.buttons.forEach(function (btn) { return _this.buttonsByPin[btn.id] = btn; });
        }
        return CommonButtonState;
    }());
    pxsim.CommonButtonState = CommonButtonState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        function getButtonByPin(pinId) {
            var m = pxsim.board().buttonState.buttonsByPin;
            var b = m[pinId + ""];
            if (!b) {
                b = m[pinId + ""] = new pxsim.CommonButton(pinId);
            }
            return b;
        }
        pxtcore.getButtonByPin = getButtonByPin;
        function getButtonByPinCfg(key) {
            return getButtonByPin(pxtcore.getConfig(key, -1));
        }
        pxtcore.getButtonByPinCfg = getButtonByPinCfg;
        function getButton(buttonId) {
            var buttons = pxsim.board().buttonState.buttons;
            if (buttonId === 2) {
                pxsim.board().buttonState.usesButtonAB = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            if (buttonId < buttons.length && buttonId >= 0) {
                return buttons[buttonId];
            }
            // panic
            return undefined;
        }
        pxtcore.getButton = getButton;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var ButtonMethods;
    (function (ButtonMethods) {
        function onEvent(button, ev, body) {
            pxsim.pxtcore.registerWithDal(button.id, ev, body);
        }
        ButtonMethods.onEvent = onEvent;
        function isPressed(button) {
            return button.pressed;
        }
        ButtonMethods.isPressed = isPressed;
        function wasPressed(button) {
            return button.wasPressed();
        }
        ButtonMethods.wasPressed = wasPressed;
        function id(button) {
            return button.id;
        }
        ButtonMethods.id = id;
    })(ButtonMethods = pxsim.ButtonMethods || (pxsim.ButtonMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var DigitalInOutPinMethods;
    (function (DigitalInOutPinMethods) {
        function pushButton(pin) {
            return pxsim.pxtcore.getButtonByPin(pin.id);
        }
        DigitalInOutPinMethods.pushButton = pushButton;
    })(DigitalInOutPinMethods = pxsim.DigitalInOutPinMethods || (pxsim.DigitalInOutPinMethods = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var network;
    (function (network) {
        function cableSendPacket(buf) {
            var state = pxsim.getCableState();
            state.send(buf);
        }
        network.cableSendPacket = cableSendPacket;
        function cablePacket() {
            var state = pxsim.getCableState();
            return pxsim.incr(state.packet);
        }
        network.cablePacket = cablePacket;
        function onCablePacket(body) {
            var state = pxsim.getCableState();
            state.listen(body);
        }
        network.onCablePacket = onCablePacket;
        function onCableError(body) {
            var state = pxsim.getCableState();
            state.listenError(body);
        }
        network.onCableError = onCableError;
    })(network = pxsim.network || (pxsim.network = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var CableState = /** @class */ (function () {
        function CableState() {
            // notify view that a packet was received
            this.packetReceived = false;
            // PULSE_IR_COMPONENT_ID = 0x2042;
            this.PULSE_CABLE_COMPONENT_ID = 0x2043;
            this.PULSE_PACKET_EVENT = 0x2;
            this.PULSE_PACKET_ERROR_EVENT = 0x3;
        }
        CableState.prototype.send = function (buf) {
            pxsim.Runtime.postMessage({
                type: "irpacket",
                packet: buf.data
            });
        };
        CableState.prototype.listen = function (body) {
            pxsim.pxtcore.registerWithDal(this.PULSE_CABLE_COMPONENT_ID, this.PULSE_PACKET_EVENT, body);
        };
        CableState.prototype.listenError = function (body) {
            pxsim.pxtcore.registerWithDal(this.PULSE_CABLE_COMPONENT_ID, this.PULSE_PACKET_ERROR_EVENT, body);
        };
        CableState.prototype.receive = function (buf) {
            pxsim.decr(this.packet);
            this.packet = buf;
            pxsim.incr(this.packet);
            this.packetReceived = true;
            pxsim.board().bus.queue(this.PULSE_CABLE_COMPONENT_ID, this.PULSE_PACKET_EVENT);
        };
        return CableState;
    }());
    pxsim.CableState = CableState;
    function getCableState() {
        return pxsim.board().cableState;
    }
    pxsim.getCableState = getCableState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var ThresholdState;
    (function (ThresholdState) {
        ThresholdState[ThresholdState["High"] = 0] = "High";
        ThresholdState[ThresholdState["Low"] = 1] = "Low";
        ThresholdState[ThresholdState["Normal"] = 2] = "Normal";
    })(ThresholdState || (ThresholdState = {}));
    var AnalogSensorState = /** @class */ (function () {
        function AnalogSensorState(id, min, max, lowThreshold, highThreshold) {
            if (min === void 0) { min = 0; }
            if (max === void 0) { max = 255; }
            if (lowThreshold === void 0) { lowThreshold = 64; }
            if (highThreshold === void 0) { highThreshold = 192; }
            this.id = id;
            this.min = min;
            this.max = max;
            this.lowThreshold = lowThreshold;
            this.highThreshold = highThreshold;
            this.sensorUsed = false;
            this.state = ThresholdState.Normal;
            this.level = Math.ceil((max - min) / 2);
        }
        AnalogSensorState.prototype.setUsed = function () {
            if (!this.sensorUsed) {
                this.sensorUsed = true;
                pxsim.runtime.queueDisplayUpdate();
            }
        };
        AnalogSensorState.prototype.setLevel = function (level) {
            this.level = this.clampValue(level);
            if (this.level >= this.highThreshold) {
                this.setState(ThresholdState.High);
            }
            else if (this.level <= this.lowThreshold) {
                this.setState(ThresholdState.Low);
            }
            else {
                this.setState(ThresholdState.Normal);
            }
        };
        AnalogSensorState.prototype.getLevel = function () {
            return this.level;
        };
        AnalogSensorState.prototype.setLowThreshold = function (value) {
            this.lowThreshold = this.clampValue(value);
            this.highThreshold = Math.max(this.lowThreshold + 1, this.highThreshold);
        };
        AnalogSensorState.prototype.setHighThreshold = function (value) {
            this.highThreshold = this.clampValue(value);
            this.lowThreshold = Math.min(this.highThreshold - 1, this.lowThreshold);
        };
        AnalogSensorState.prototype.clampValue = function (value) {
            if (value < this.min) {
                return this.min;
            }
            else if (value > this.max) {
                return this.max;
            }
            return value;
        };
        AnalogSensorState.prototype.setState = function (state) {
            if (this.state === state) {
                return;
            }
            this.state = state;
            switch (state) {
                case ThresholdState.High:
                    pxsim.board().bus.queue(this.id, 2 /* ANALOG_THRESHOLD_HIGH */);
                    break;
                case ThresholdState.Low:
                    pxsim.board().bus.queue(this.id, 1 /* ANALOG_THRESHOLD_LOW */);
                    break;
                case ThresholdState.Normal:
                    break;
            }
        };
        return AnalogSensorState;
    }());
    pxsim.AnalogSensorState = AnalogSensorState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        function mkBtnSvg(xy) {
            var _a = ["sim-button", "sim-button-outer"], innerCls = _a[0], outerCls = _a[1];
            var tabSize = visuals.PIN_DIST / 2.5;
            var pegR = visuals.PIN_DIST / 5;
            var btnR = visuals.PIN_DIST * .8;
            var pegMargin = visuals.PIN_DIST / 8;
            var plateR = visuals.PIN_DIST / 12;
            var pegOffset = pegMargin + pegR;
            var x = xy[0], y = xy[1];
            var left = x - tabSize / 2;
            var top = y - tabSize / 2;
            var plateH = 3 * visuals.PIN_DIST - tabSize;
            var plateW = 2 * visuals.PIN_DIST + tabSize;
            var plateL = left;
            var plateT = top + tabSize;
            var btnCX = plateL + plateW / 2;
            var btnCY = plateT + plateH / 2;
            var btng = pxsim.svg.elt("g");
            //tabs
            var mkTab = function (x, y) {
                pxsim.svg.child(btng, "rect", { class: "sim-button-tab", x: x, y: y, width: tabSize, height: tabSize });
            };
            mkTab(left, top);
            mkTab(left + 2 * visuals.PIN_DIST, top);
            mkTab(left, top + 3 * visuals.PIN_DIST);
            mkTab(left + 2 * visuals.PIN_DIST, top + 3 * visuals.PIN_DIST);
            //plate
            pxsim.svg.child(btng, "rect", { class: outerCls, x: plateL, y: plateT, rx: plateR, ry: plateR, width: plateW, height: plateH });
            //pegs
            var mkPeg = function (x, y) {
                pxsim.svg.child(btng, "circle", { class: "sim-button-nut", cx: x, cy: y, r: pegR });
            };
            mkPeg(plateL + pegOffset, plateT + pegOffset);
            mkPeg(plateL + plateW - pegOffset, plateT + pegOffset);
            mkPeg(plateL + pegOffset, plateT + plateH - pegOffset);
            mkPeg(plateL + plateW - pegOffset, plateT + plateH - pegOffset);
            //inner btn
            var innerBtn = pxsim.svg.child(btng, "circle", { class: innerCls, cx: btnCX, cy: btnCY, r: btnR });
            //return
            return { el: btng, y: top, x: left, w: plateW, h: plateH + 2 * tabSize };
        }
        visuals.mkBtnSvg = mkBtnSvg;
        visuals.BUTTON_PAIR_STYLE = "\n            .sim-button {\n                pointer-events: none;\n                fill: #000;\n            }\n            .sim-button-outer:active ~ .sim-button,\n            .sim-button-virtual:active {\n                fill: #FFA500;\n            }\n            .sim-button-outer {\n                cursor: pointer;\n                fill: #979797;\n            }\n            .sim-button-outer:hover {\n                stroke:gray;\n                stroke-width: " + visuals.PIN_DIST / 5 + "px;\n            }\n            .sim-button-nut {\n                fill:#000;\n                pointer-events:none;\n            }\n            .sim-button-nut:hover {\n                stroke:" + visuals.PIN_DIST / 15 + "px solid #704A4A;\n            }\n            .sim-button-tab {\n                fill:#FFF;\n                pointer-events:none;\n            }\n            .sim-button-virtual {\n                cursor: pointer;\n                fill: rgba(255, 255, 255, 0.6);\n                stroke: rgba(255, 255, 255, 1);\n                stroke-width: " + visuals.PIN_DIST / 5 + "px;\n            }\n            .sim-button-virtual:hover {\n                stroke: rgba(128, 128, 128, 1);\n            }\n            .sim-text-virtual {\n                fill: #000;\n                pointer-events:none;\n            }\n            ";
        var ButtonPairView = /** @class */ (function () {
            function ButtonPairView() {
                this.style = visuals.BUTTON_PAIR_STYLE;
            }
            ButtonPairView.prototype.init = function (bus, state) {
                this.state = state;
                this.bus = bus;
                this.defs = [];
                this.element = this.mkBtns();
                this.updateState();
                this.attachEvents();
            };
            ButtonPairView.prototype.moveToCoord = function (xy) {
                var btnWidth = visuals.PIN_DIST * 3;
                var x = xy[0], y = xy[1];
                visuals.translateEl(this.aBtn, [x, y]);
                visuals.translateEl(this.bBtn, [x + btnWidth, y]);
                visuals.translateEl(this.abBtn, [x + visuals.PIN_DIST * 1.5, y + visuals.PIN_DIST * 4]);
            };
            ButtonPairView.prototype.updateState = function () {
                var stateBtns = [this.state.aBtn, this.state.bBtn, this.state.abBtn];
                var svgBtns = [this.aBtn, this.bBtn, this.abBtn];
                if (this.state.usesButtonAB && this.abBtn.style.visibility != "visible") {
                    this.abBtn.style.visibility = "visible";
                }
            };
            ButtonPairView.prototype.updateTheme = function () { };
            ButtonPairView.prototype.mkBtns = function () {
                this.aBtn = mkBtnSvg([0, 0]).el;
                this.bBtn = mkBtnSvg([0, 0]).el;
                var mkVirtualBtn = function () {
                    var numPins = 2;
                    var w = visuals.PIN_DIST * 2.8;
                    var offset = (w - (numPins * visuals.PIN_DIST)) / 2;
                    var corner = visuals.PIN_DIST / 2;
                    var cx = 0 - offset + w / 2;
                    var cy = cx;
                    var txtSize = visuals.PIN_DIST * 1.3;
                    var x = -offset;
                    var y = -offset;
                    var txtXOff = visuals.PIN_DIST / 7;
                    var txtYOff = visuals.PIN_DIST / 10;
                    var btng = pxsim.svg.elt("g");
                    var btn = pxsim.svg.child(btng, "rect", { class: "sim-button-virtual", x: x, y: y, rx: corner, ry: corner, width: w, height: w });
                    var btnTxt = visuals.mkTxt(cx + txtXOff, cy + txtYOff, txtSize, 0, "A+B");
                    pxsim.svg.addClass(btnTxt, "sim-text");
                    pxsim.svg.addClass(btnTxt, "sim-text-virtual");
                    btng.appendChild(btnTxt);
                    return btng;
                };
                this.abBtn = mkVirtualBtn();
                this.abBtn.style.visibility = "hidden";
                var el = pxsim.svg.elt("g");
                pxsim.svg.addClass(el, "sim-buttonpair");
                el.appendChild(this.aBtn);
                el.appendChild(this.bBtn);
                el.appendChild(this.abBtn);
                return el;
            };
            ButtonPairView.prototype.attachEvents = function () {
                var _this = this;
                var btnStates = [this.state.aBtn, this.state.bBtn];
                var btnSvgs = [this.aBtn, this.bBtn];
                btnSvgs.forEach(function (btn, index) {
                    pxsim.pointerEvents.down.forEach(function (evid) { return btn.addEventListener(evid, function (ev) {
                        btnStates[index].pressed = true;
                    }); });
                    btn.addEventListener(pxsim.pointerEvents.leave, function (ev) {
                        btnStates[index].pressed = false;
                    });
                    btn.addEventListener(pxsim.pointerEvents.up, function (ev) {
                        btnStates[index].pressed = false;
                        _this.bus.queue(btnStates[index].id, _this.state.props.BUTTON_EVT_UP);
                        _this.bus.queue(btnStates[index].id, _this.state.props.BUTTON_EVT_CLICK);
                    });
                });
                var updateBtns = function (s) {
                    btnStates.forEach(function (b) { return b.pressed = s; });
                };
                pxsim.pointerEvents.down.forEach(function (evid) { return _this.abBtn.addEventListener(evid, function (ev) {
                    updateBtns(true);
                }); });
                this.abBtn.addEventListener(pxsim.pointerEvents.leave, function (ev) {
                    updateBtns(false);
                });
                this.abBtn.addEventListener(pxsim.pointerEvents.up, function (ev) {
                    updateBtns(false);
                    _this.bus.queue(_this.state.abBtn.id, _this.state.props.BUTTON_EVT_UP);
                    _this.bus.queue(_this.state.abBtn.id, _this.state.props.BUTTON_EVT_CLICK);
                });
            };
            return ButtonPairView;
        }());
        visuals.ButtonPairView = ButtonPairView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
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
            if (b && this.eventMode == 1 /* DEVICE_PIN_EVENT_ON_EDGE */ && old != this.value)
                b.bus.queue(this.id, this.value > 0 ? 2 /* DEVICE_PIN_EVT_RISE */ : 3 /* DEVICE_PIN_EVT_FALL */);
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
                case 4 /* DEVICE_PIN_EVT_PULSE_HI */:
                case 5 /* DEVICE_PIN_EVT_PULSE_LO */:
                    this.eventMode = 2 /* DEVICE_PIN_EVENT_ON_PULSE */;
                    break;
                case 2 /* DEVICE_PIN_EVT_RISE */:
                case 3 /* DEVICE_PIN_EVT_FALL */:
                    this.eventMode = 1 /* DEVICE_PIN_EVENT_ON_EDGE */;
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
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        var LED_PART_XOFF = -8;
        var LED_PART_YOFF = -7;
        var LED_PART_WIDTH = 68;
        var LED_PART_HEIGHT = 180;
        var LED_PART = "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" id=\"Layer_1\" viewBox=\"0 0 33.6 90\" width=\"33.599998\" height=\"90\">\n    <path class=\"st0\" d=\"M1.3 65.000002v5.9C1.3 74.800002 4.5 78 8.4 78c3.9 0 7.1-3.199998 7.1-7.099998v-13.7c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9v1.5c0 1.2.5 2.3 1.3 3.2z\" id=\"path5\" opacity=\".65\" fill=\"#ececec\"/>\n    <g id=\"g7\" transform=\"translate(0 10.900002)\">\n      <path class=\"st1\" d=\"M12.7 49.6l1.2 1.4h-1l-2.4-1.4V15c0-.3.5-.5 1.1-.5.6 0 1.1.2 1.1.5z\" id=\"path9\" fill=\"#8c8c8c\"/>\n      <path class=\"st1\" d=\"M2.6 42.9c0 .7 1.1 1.3 2.1 1.8.4.2 1.2.6 1.2.9V49l-2.5 2h.9L8 49v-3.5c0-.7-.9-1.2-1.9-1.7-.4-.2-1.3-.8-1.3-1.1v-52.9c0-.4-.5-.7-1.1-.7-.6 0-1.1.3-1.1.7z\" id=\"path11\" fill=\"#8c8c8c\"/>\n      <path class=\"sim-led-main\" d=\"M1.3 54.1V60c0 3.9 3.2 7.1 7.1 7.1 3.9 0 7.1-3.2 7.1-7.1V46.3c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9v1.5c0 1.2.5 2.3 1.3 3.2z\" id=\"LED\" opacity=\".3\" fill=\"#ccc\"/>\n      <path class=\"st3\" d=\"M1.3 54.1V51c0-2.7 3.2-5 7.1-5 3.9 0 7.1 2.2 7.1 5v-4.6c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9V51c0 1.1.5 2.2 1.3 3.1z\" id=\"path15\" opacity=\".9\" fill=\"#d1d1d1\"/>\n      <path class=\"st4\" d=\"M1.3 54.1V51c0-2.7 3.2-5 7.1-5 3.9 0 7.1 2.2 7.1 5v-4.6c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9V51c0 1.1.5 2.2 1.3 3.1z\" id=\"path17\" opacity=\".7\" fill=\"#e6e6e6\"/>\n      <path class=\"st5\" d=\"M1.3 54.1V51c0-2.7 3.2-5 7.1-5 3.9 0 7.1 2.2 7.1 5v-3.1c-1.9-1.9-4.4-2.9-7.1-2.8C3.8 45.1 0 47.7 0 51c0 1.1.5 2.2 1.3 3.1z\" id=\"path19\" opacity=\".25\" fill=\"#e6e6e6\"/>\n      <ellipse class=\"st5\" cx=\"8.3\" cy=\"51\" rx=\"7.1\" ry=\"5\" id=\"ellipse21\" opacity=\".25\" fill=\"#e6e6e6\"/>\n      <ellipse class=\"st5\" cx=\"8.3\" cy=\"51\" rx=\"7.1\" ry=\"5\" id=\"ellipse23\" opacity=\".25\" fill=\"#e6e6e6\"/>\n      <g class=\"st8\" id=\"g29\" transform=\"translate(0 -12)\" opacity=\".61\">\n        <path class=\"st9\" d=\"M8.3 57.1c4.3 0 6.1 2 6.1 2l-.7.7s-1.6-1.7-5.4-1.7C5.9 58 3.6 59 2 60.8l-.8-.6c1.9-2.1 4.4-3.2 7.1-3.1z\" id=\"path31\" fill=\"#fff\"/>\n      </g>\n      <g class=\"st8\" id=\"g33\" transform=\"translate(0 -12)\" opacity=\".61\">\n        <path class=\"st9\" d=\"M12.9 75.9c1.1-1.1 1.7-2.6 1.7-4.2V61.4l-1.9-1.5v10.4c.9 2.8.3 4.2-.7 5.2.3.1.6.2.9.4z\" id=\"path35\" fill=\"#fff\"/>\n        <path class=\"st9\" d=\"M5.6 77.5l.3-.9c-1.5-.7-2.6-2.1-2.8-3.7h-1c.3 2 1.6 3.7 3.5 4.6z\" id=\"path37\" fill=\"#fff\"/>\n      </g>\n      <text style=\"line-height:1.25;-inkscape-font-specification:consolas\" x=\"14.103056\" y=\".224915\" id=\"text4514\" font-weight=\"400\" font-size=\"7.744442\" font-family=\"consolas\" letter-spacing=\"0\" word-spacing=\"0\" fill=\"#666\" stroke-width=\".968055\">\n        <tspan id=\"tspan4512\" x=\"14.103056\" y=\".224915\">330\u03A9</tspan>\n      </text>\n      <text style=\"line-height:1.25;-inkscape-font-specification:consolas\" x=\"1.868053\" y=\"77.579796\" id=\"text4524\" font-weight=\"400\" font-size=\"32.793365\" font-family=\"consolas\" letter-spacing=\"0\" word-spacing=\"0\" stroke-width=\".819834\">\n        <tspan id=\"tspan4522\" x=\"1.868053\" y=\"77.579796\" font-size=\"10.931121\"></tspan>\n      </text>\n    </g>\n    <g id=\"g39\" transform=\"translate(0 -1.099998)\">\n      <path class=\"st1\" id=\"rect41\" fill=\"#8c8c8c\" d=\"M11.6 16.9h21.700001v1.9H11.6z\"/>\n      <g id=\"g43\">\n        <path class=\"st10\" id=\"rect45\" fill=\"none\" d=\"M12 16.9h3.2v1.9H12z\"/>\n        <path class=\"st11\" d=\"M19 15c-.3-.2-.6-.3-.9-.3h-1.4c-.3 0-.5.3-.5.7v4.9c0 .4.2.7.5.7h1.4c.3 0 .6-.1.9-.3.3-.2.6-.3.9-.3h5c.3 0 .6.1.9.3h.1c.3.2.6.3.9.3h1.4c.3 0 .5-.3.5-.7v-4.9c0-.4-.2-.7-.5-.7h-1.4c-.3 0-.6.1-.9.3h-.1c-.3.2-.6.3-.9.3h-5c-.2 0-.5-.1-.9-.3z\" id=\"path47\" fill=\"#d6bf90\"/>\n        <path class=\"st12\" d=\"M28.4 18.5c-.1.1-.1.2-.2.3-.3.5-.7.8-1.2.8s-.9-.1-1.4-.3c-.6-.1-1.1-.1-1.7-.1-2 0-3.9 0-5.9.2-.4.1-.8 0-1.1-.1-.2-.1-.4-.2-.5-.5v1.5c0 .2.1.3.2.3H18c.3 0 .6-.1.9-.3.3-.2.7-.3 1.1-.3h5c.4 0 .8.1 1.1.3.3.1.6.2.8.2h1.4c.1 0 .2-.1.2-.3v-1.9c0 .1-.1.2-.1.2z\" id=\"path49\" fill=\"#aa936b\"/>\n        <g id=\"g51\">\n          <path class=\"st13\" id=\"rect53\" fill=\"#ad9f4e\" d=\"M27.200001 14.7h.7v6.2h-.7z\"/>\n          <path class=\"st14\" id=\"rect55\" opacity=\".4\" d=\"M27.200001 17.799999h.7v2.5h-.7z\"/>\n          <path class=\"st15\" id=\"rect57\" opacity=\".5\" fill=\"#ff3\" d=\"M27.200001 15h.7v1.3h-.7z\"/>\n          <path class=\"st16\" id=\"rect59\" opacity=\".5\" fill=\"#fff\" d=\"M27.200001 15.3h.7v.7h-.7z\"/>\n        </g>\n        <path class=\"st17\" id=\"rect61\" fill=\"#aa4518\" d=\"M23.1 15.3h1.3v5.1h-1.3z\"/>\n        <path class=\"st18\" id=\"rect63\" fill=\"#ff9700\" d=\"M20.6 15.3h1.3v5.1h-1.3z\"/>\n        <path class=\"st18\" d=\"M19.3 15.1c-.1 0-.1-.1-.2-.1-.3-.2-.6-.3-.9-.3H18V21h.1c.3 0 .6-.1.9-.3.1 0 .1-.1.2-.1v-5.5z\" id=\"path65\" fill=\"#ff9700\"/>\n        <path class=\"st19\" d=\"M18.7 15.7c.4.1.8.2 1.2.2H21c1.2-.1 2.4-.1 3.6 0 .4 0 .9 0 1.3-.1.3-.1.6-.2.8-.3.6-.2 1.2-.3 1.8-.2 0-.1-.1-.3-.2-.3h-1.4c-.3 0-.6.1-.9.3-.3.2-.7.3-1.1.3h-5c-.4 0-.8-.1-1.1-.3-.3-.1-.6-.2-.8-.2h-1.4c-.1 0-.2.1-.2.3v.2c.8-.1 1.5 0 2.3.1z\" id=\"path67\" opacity=\".74\" fill=\"#fffdfa\"/>\n      </g>\n    </g>\n  </svg>\n      ";
        // For the intructions
        function mkLedPart(xy) {
            if (xy === void 0) { xy = [0, 0]; }
            var x = xy[0], y = xy[1];
            var l = x + LED_PART_XOFF;
            var t = y + LED_PART_YOFF;
            var w = LED_PART_WIDTH;
            var h = LED_PART_HEIGHT;
            var img = pxsim.svg.elt("image");
            pxsim.svg.hydrate(img, {
                class: "sim-led", x: l, y: t, width: w, height: h,
                href: pxsim.svg.toDataUri(LED_PART)
            });
            return { el: img, x: l, y: t, w: w, h: h };
        }
        visuals.mkLedPart = mkLedPart;
        var LedView = /** @class */ (function () {
            function LedView(parsePinString) {
                this.color = "rgb(0,255,0)"; // green color by default
                this.parsePinString = parsePinString;
            }
            LedView.prototype.init = function (bus, state, svgEl, otherParams) {
                this.pin = this.parsePinString(otherParams["name"] || otherParams["pin"]);
                this.bus = bus;
                this.initDom();
                this.updateState();
            };
            LedView.prototype.initDom = function () {
                this.element = pxsim.svg.elt("g");
                var image = new DOMParser().parseFromString(LED_PART, "image/svg+xml").querySelector("svg");
                pxsim.svg.hydrate(image, {
                    class: "sim-led", width: LED_PART_WIDTH, height: LED_PART_HEIGHT,
                });
                this.led = image.getElementById('LED');
                this.text = image.getElementById('tspan4522');
                this.element.appendChild(image);
            };
            LedView.prototype.moveToCoord = function (xy) {
                visuals.translateEl(this.element, [xy[0] + LED_PART_XOFF, xy[1] + LED_PART_YOFF]);
            };
            LedView.prototype.updateTheme = function () {
            };
            LedView.prototype.updateState = function () {
                if (this.currentValue === this.pin.value && this.currentMode == this.pin.mode)
                    return;
                this.currentValue = this.pin.value;
                this.currentMode = this.pin.mode;
                var style = this.led.style;
                if (this.currentMode & pxsim.PinFlags.Digital) {
                    style.fill = this.currentValue ? "#00ff00" : "#ffffff";
                    style.opacity = "0.9";
                    this.text.textContent = this.currentValue ? "1" : "0";
                }
                else {
                    style.fill = "#00ff00";
                    style.opacity = (0.1 + Math.max(0, Math.min(1023, this.currentValue)) / 1023 * 0.8).toString();
                    this.text.textContent = "~" + this.currentValue;
                }
            };
            return LedView;
        }());
        visuals.LedView = LedView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        function createMicroServoElement() {
            return pxsim.svg.parseString("\n        <svg xmlns=\"http://www.w3.org/2000/svg\" id=\"svg2\" width=\"112.188\" height=\"299.674\">\n          <g id=\"layer1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" transform=\"scale(0.8)\">\n            <path id=\"path8212\" fill=\"#0061ff\" stroke-width=\"6.6\" d=\"M.378 44.61v255.064h112.188V44.61H.378z\"/>\n            <path id=\"crankbase\" fill=\"#00f\" stroke-width=\"6.6\" d=\"M56.57 88.047C25.328 88.047 0 113.373 0 144.615c.02 22.352 11.807 42.596 32.238 51.66.03 3.318.095 5.24.088 7.938 0 13.947 11.307 25.254 25.254 25.254 13.947 0 25.254-11.307 25.254-25.254-.006-2.986-.415-5.442-.32-8.746 19.487-9.45 30.606-29.195 30.625-50.852 0-31.24-25.33-56.568-56.57-56.568z\"/>\n            <path id=\"lowertip\" fill=\"#00a2ff\" stroke-width=\"2\" d=\"M.476 260.78v38.894h53.82v-10.486a6.82 6.566 0 0 1-4.545-6.182 6.82 6.566 0 0 1 6.82-6.566 6.82 6.566 0 0 1 6.82 6.566 6.82 6.566 0 0 1-4.545 6.182v10.486h53.82V260.78H.475z\"/>\n            <path id=\"uppertip\" fill=\"#00a2ff\" stroke-width=\"2\" d=\"M112.566 83.503V44.61h-53.82v10.487a6.82 6.566 0 0 1 4.544 6.18 6.82 6.566 0 0 1-6.818 6.568 6.82 6.566 0 0 1-6.82-6.567 6.82 6.566 0 0 1 4.546-6.18V44.61H.378v38.893h112.188z\"/>\n            <path id=\"VCC\" fill=\"red\" stroke-width=\"2\" d=\"M53.72 21.93h5.504v22.627H53.72z\"/>\n            <path id=\"LOGIC\" fill=\"#fc0\" stroke-width=\"2\" d=\"M47.3 21.93h5.503v22.627H47.3z\"/>\n            <path id=\"GND\" fill=\"#a02c2c\" stroke-width=\"2\" d=\"M60.14 21.93h5.505v22.627H60.14z\"/>\n            <path id=\"connector\" stroke-width=\"2\" d=\"M45.064 0a1.488 1.488 0 0 0-1.488 1.488v24.5a1.488 1.488 0 0 0 1.488 1.487h22.71a1.488 1.488 0 0 0 1.49-1.488v-24.5A1.488 1.488 0 0 0 67.774 0h-22.71z\"/>\n            <g id=\"crank\" transform=\"translate(0 -752.688)\">\n              <path id=\"arm\" fill=\"#ececec\" stroke=\"#000\" stroke-width=\"1.372\" d=\"M47.767 880.88c-4.447 1.162-8.412 8.278-8.412 18.492s3.77 18.312 8.412 18.494c8.024.314 78.496 5.06 78.51-16.952.012-22.013-74.377-21.117-78.51-20.035z\"/>\n              <circle id=\"path8216\" cx=\"56.661\" cy=\"899.475\" r=\"8.972\" fill=\"gray\" stroke-width=\"2\"/>\n            </g>\n          </g>\n        </svg>\n                    ").firstElementChild;
        }
        function mkMicroServoPart(xy) {
            if (xy === void 0) { xy = [0, 0]; }
            return { el: createMicroServoElement(), x: xy[0], y: xy[1], w: 112.188, h: 299.674 };
        }
        visuals.mkMicroServoPart = mkMicroServoPart;
        var MicroServoView = /** @class */ (function () {
            function MicroServoView() {
                this.style = "";
                this.overElement = undefined;
                this.defs = [];
                this.currentAngle = 0;
                this.targetAngle = 0;
                this.lastAngleTime = 0;
            }
            MicroServoView.prototype.init = function (bus, state, svgEl, otherParams) {
                this.state = state;
                this.pin = this.state.props.servos[pxsim.readPin(otherParams["name"] || otherParams["pin"])];
                this.bus = bus;
                this.defs = [];
                this.initDom();
                this.updateState();
            };
            MicroServoView.prototype.initDom = function () {
                this.element = createMicroServoElement();
                this.crankEl = this.element.querySelector("#crank");
                this.crankTransform = this.crankEl.getAttribute("transform");
            };
            MicroServoView.prototype.moveToCoord = function (xy) {
                var x = xy[0], y = xy[1];
                visuals.translateEl(this.element, [x, y]);
            };
            MicroServoView.prototype.updateState = function () {
                this.targetAngle = 180.0 - this.state.getPin(this.pin).servoAngle;
                if (this.targetAngle != this.currentAngle) {
                    var now = pxsim.U.now();
                    var cx = 56.661;
                    var cy = 899.475;
                    var speed = 300; // 0.1s/60 degree
                    var dt = Math.min(now - this.lastAngleTime, 50) / 1000;
                    var delta = this.targetAngle - this.currentAngle;
                    this.currentAngle += Math.min(Math.abs(delta), speed * dt) * (delta > 0 ? 1 : -1);
                    this.crankEl.setAttribute("transform", this.crankTransform
                        + (" rotate(" + this.currentAngle + ", " + cx + ", " + cy + ")"));
                    this.lastAngleTime = now;
                    setTimeout(function () { return pxsim.runtime.updateDisplay(); }, 20);
                }
            };
            MicroServoView.prototype.updateTheme = function () {
            };
            return MicroServoView;
        }());
        visuals.MicroServoView = MicroServoView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        var PHOTOCELL_PART_XOFF = -8;
        var PHOTOCELL_PART_YOFF = -7;
        var PHOTOCELL_PART_WIDTH = 68;
        var PHOTOCELL_PART_HEIGHT = 180;
        var PHOTOCELL_PART = "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" id=\"Layer_1\" viewBox=\"0 0 33.6 90\" width=\"33.599998\" height=\"90\">\n    <path id=\"path9\" d=\"M12.7 60.500002l1.2 1.4h-1l-2.4-1.4v-34.6c0-.3.5-.5 1.1-.5.6 0 1.1.2 1.1.5z\" class=\"st1\" fill=\"#8c8c8c\"/>\n    <path id=\"path11\" d=\"M3.4 61.900002h1.905509L4.8.700002c-.003304-.399986-.5-.7-1.1-.7-.6 0-1.1.3-1.1.7z\" class=\"st1\" fill=\"#8c8c8c\"/>\n    <text id=\"text4514\" y=\"11.124916\" x=\"14.103056\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" font-weight=\"400\" font-size=\"7.744442\" font-family=\"consolas\" letter-spacing=\"0\" word-spacing=\"0\" fill=\"#666\" stroke-width=\".968055\">\n      <tspan y=\"11.124916\" x=\"14.103056\" id=\"tspan4512\">10k\u03A9</tspan>\n    </text>\n    <text style=\"line-height:1.25;-inkscape-font-specification:consolas\" x=\"1.868053\" y=\"77.579796\" id=\"text4524\" font-weight=\"400\" font-size=\"32.793365\" font-family=\"consolas\" letter-spacing=\"0\" word-spacing=\"0\" stroke-width=\".819834\">\n    <tspan id=\"tspan4522\" x=\"1.868053\" y=\"77.579796\" font-size=\"10.931121\"></tspan>\n    </text>\n    <path id=\"rect41\" class=\"st1\" fill=\"#8c8c8c\" d=\"M11.6 15.800001h21.700001v1.9H11.6z\"/>\n    <path class=\"st10\" id=\"rect45\" fill=\"none\" d=\"M12 15.800001h3.2v1.9H12z\"/>\n    <path class=\"st11\" d=\"M19 13.900002c-.3-.2-.6-.3-.9-.3h-1.4c-.3 0-.5.3-.5.7v4.9c0 .4.2.7.5.7h1.4c.3 0 .6-.1.9-.3.3-.2.6-.3.9-.3h5c.3 0 .6.1.9.3h.1c.3.2.6.3.9.3h1.4c.3 0 .5-.3.5-.7v-4.9c0-.4-.2-.7-.5-.7h-1.4c-.3 0-.6.1-.9.3h-.1c-.3.2-.6.3-.9.3h-5c-.2 0-.5-.1-.9-.3z\" id=\"path47\" fill=\"#d6bf90\"/>\n    <path class=\"st12\" d=\"M28.4 17.400002c-.1.1-.1.2-.2.3-.3.5-.7.8-1.2.8s-.9-.1-1.4-.3c-.6-.1-1.1-.1-1.7-.1-2 0-3.9 0-5.9.2-.4.1-.8 0-1.1-.1-.2-.1-.4-.2-.5-.5v1.5c0 .2.1.3.2.3H18c.3 0 .6-.1.9-.3.3-.2.7-.3 1.1-.3h5c.4 0 .8.1 1.1.3.3.1.6.2.8.2h1.4c.1 0 .2-.1.2-.3v-1.9c0 .1-.1.2-.1.2z\" id=\"path49\" fill=\"#aa936b\"/>\n    <g id=\"g51\" transform=\"translate(0 -1.099998)\">\n      <path class=\"st13\" id=\"rect53\" fill=\"#ad9f4e\" d=\"M27.200001 14.7h.7v6.2h-.7z\"/>\n      <path class=\"st14\" id=\"rect55\" opacity=\".4\" d=\"M27.200001 17.799999h.7v2.5h-.7z\"/>\n      <path class=\"st15\" id=\"rect57\" opacity=\".5\" fill=\"#ff3\" d=\"M27.200001 15h.7v1.3h-.7z\"/>\n      <path class=\"st16\" id=\"rect59\" opacity=\".5\" fill=\"#fff\" d=\"M27.200001 15.3h.7v.7h-.7z\"/>\n    </g>\n    <path class=\"st17\" id=\"rect61\" fill=\"#ff9700\" d=\"M23.1 14.200002h1.3v5.1h-1.3z\"/>\n    <path class=\"st18\" id=\"rect63\" d=\"M20.6 14.200002h1.3v5.1h-1.3z\"/>\n    <path class=\"st18\" d=\"M19.3 14.000002c-.1 0-.1-.1-.2-.1-.3-.2-.6-.3-.9-.3H18v6.3h.1c.3 0 .6-.1.9-.3.1 0 .1-.1.2-.1v-5.5z\" id=\"path65\" fill=\"#aa4518\"/>\n    <path class=\"st19\" d=\"M18.7 14.600002c.4.1.8.2 1.2.2H21c1.2-.1 2.4-.1 3.6 0 .4 0 .9 0 1.3-.1.3-.1.6-.2.8-.3.6-.2 1.2-.3 1.8-.2 0-.1-.1-.3-.2-.3h-1.4c-.3 0-.6.1-.9.3-.3.2-.7.3-1.1.3h-5c-.4 0-.8-.1-1.1-.3-.3-.1-.6-.2-.8-.2h-1.4c-.1 0-.2.1-.2.3v.2c.8-.1 1.5 0 2.3.1z\" id=\"path67\" opacity=\".74\" fill=\"#fffdfa\"/>\n    <ellipse id=\"path4569\" ry=\"5.949258\" rx=\"6.745286\" cy=\"64.610916\" cx=\"8.085964\" fill=\"#aa4518\" stroke-width=\"3.558676\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n    <ellipse id=\"path4569-5\" ry=\"5.488401\" rx=\"6.222764\" cy=\"64.652809\" cx=\"8.024301\" fill=\"#e7e1df\" stroke-width=\"3.283004\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n    <ellipse id=\"path4607\" cx=\"3.393591\" cy=\"65\" rx=\".628443\" ry=\"1.016842\" fill=\"#4d4d4d\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n    <ellipse id=\"path4607-3\" cx=\"12.568855\" cy=\"65\" rx=\".628443\" ry=\"1.016842\" fill=\"#4d4d4d\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n    <path d=\"M5.865466 60.253708c2.521642.258451 5.042396.51681 4.411086.820414-.63131.303603-4.416986.652835-4.224443.970671.192542.317835 4.36002.604044 4.24887.991436-.111149.387393-4.504242.87629-4.482809 1.204577.021434.328287 4.454339.49583 4.535187.914613.08085.418783-4.193489 1.089267-4.318738 1.529318-.125249.44005 3.895722.649476 4.19647 1.008916.300747.359441-3.121579.869298-3.749962 1.183637-.628384.314339 1.535952.433028 3.699646.551682\" id=\"path4630\" fill=\"none\" stroke=\"#9e4c34\" stroke-width=\".245669\" stroke-linecap=\"round\"/>\n  </svg>\n            ";
        // For the intructions
        function mkPhotoCellPart(xy) {
            if (xy === void 0) { xy = [0, 0]; }
            var x = xy[0], y = xy[1];
            var l = x + PHOTOCELL_PART_XOFF;
            var t = y + PHOTOCELL_PART_YOFF;
            var w = PHOTOCELL_PART_WIDTH;
            var h = PHOTOCELL_PART_HEIGHT;
            var img = pxsim.svg.elt("image");
            pxsim.svg.hydrate(img, {
                class: "sim-led", x: l, y: t, width: w, height: h,
                href: pxsim.svg.toDataUri(PHOTOCELL_PART)
            });
            return { el: img, x: l, y: t, w: w, h: h };
        }
        visuals.mkPhotoCellPart = mkPhotoCellPart;
        var PhotoCellView = /** @class */ (function () {
            function PhotoCellView(parsePinString) {
                this.color = "rgb(0,255,0)"; // green color by default
                this.parsePinString = parsePinString;
            }
            PhotoCellView.prototype.init = function (bus, state, svgEl, otherParams) {
                this.pin = this.parsePinString(otherParams["name"] || otherParams["pin"]);
                this.bus = bus;
                this.initDom();
                this.updateState();
            };
            PhotoCellView.prototype.initDom = function () {
                var _this = this;
                this.element = pxsim.svg.elt("g");
                var image = new DOMParser().parseFromString(PHOTOCELL_PART, "image/svg+xml").querySelector("svg");
                pxsim.svg.hydrate(image, {
                    class: "sim-led", width: PHOTOCELL_PART_WIDTH, height: PHOTOCELL_PART_HEIGHT,
                });
                //this.led = image.getElementById('LED') as SVGPathElement;
                this.text = image.getElementById('tspan4522');
                this.element.appendChild(image);
                // TODO: slider
                this.element.onclick = function () {
                    _this.pin.value += 256;
                    _this.pin.value = _this.pin.value % 1024;
                    pxsim.runtime.queueDisplayUpdate();
                };
            };
            PhotoCellView.prototype.moveToCoord = function (xy) {
                visuals.translateEl(this.element, [xy[0] + PHOTOCELL_PART_XOFF, xy[1] + PHOTOCELL_PART_YOFF]);
            };
            PhotoCellView.prototype.updateTheme = function () {
            };
            PhotoCellView.prototype.updateState = function () {
                if (this.currentValue === this.pin.value && this.currentMode == this.pin.mode)
                    return;
                this.currentValue = this.pin.value;
                this.currentMode = this.pin.mode;
                this.text.textContent = "~" + this.currentValue;
            };
            return PhotoCellView;
        }());
        visuals.PhotoCellView = PhotoCellView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var pins;
    (function (pins) {
        var CommonPin = /** @class */ (function (_super) {
            __extends(CommonPin, _super);
            function CommonPin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return CommonPin;
        }(pxsim.Pin));
        pins.CommonPin = CommonPin;
        var DigitalInOutPin = /** @class */ (function (_super) {
            __extends(DigitalInOutPin, _super);
            function DigitalInOutPin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return DigitalInOutPin;
        }(CommonPin));
        pins.DigitalInOutPin = DigitalInOutPin;
        var AnalogInOutPin = /** @class */ (function (_super) {
            __extends(AnalogInOutPin, _super);
            function AnalogInOutPin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return AnalogInOutPin;
        }(CommonPin));
        pins.AnalogInOutPin = AnalogInOutPin;
        var PwmOnlyPin = /** @class */ (function (_super) {
            __extends(PwmOnlyPin, _super);
            function PwmOnlyPin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return PwmOnlyPin;
        }(CommonPin));
        pins.PwmOnlyPin = PwmOnlyPin;
        var PwmPin = /** @class */ (function (_super) {
            __extends(PwmPin, _super);
            function PwmPin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return PwmPin;
        }(CommonPin));
        pins.PwmPin = PwmPin;
        function markUsed(name) {
            if (!name.used) {
                name.used = true;
                pxsim.runtime.queueDisplayUpdate();
            }
        }
        pins.markUsed = markUsed;
    })(pins = pxsim.pins || (pxsim.pins = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var DigitalInOutPinMethods;
    (function (DigitalInOutPinMethods) {
        function digitalRead(name) {
            return name.digitalReadPin();
        }
        DigitalInOutPinMethods.digitalRead = digitalRead;
        /**
        * Set a pin or connector value to either 0 or 1.
        * @param value value to set on the pin, 1 eg,0
        */
        function digitalWrite(name, value) {
            name.digitalWritePin(value);
        }
        DigitalInOutPinMethods.digitalWrite = digitalWrite;
        /**
        * Configures this pin to a digital input, and generates events where the timestamp is the duration
        * that this pin was either ``high`` or ``low``.
        */
        function onPulsed(name, high, body) {
            onEvent(name, high ? 4 /* DEVICE_PIN_EVT_PULSE_HI */ : 5 /* DEVICE_PIN_EVT_PULSE_LO */, body);
        }
        DigitalInOutPinMethods.onPulsed = onPulsed;
        function onEvent(name, ev, body) {
            name.onEvent(ev, body);
        }
        DigitalInOutPinMethods.onEvent = onEvent;
        /**
        * Returns the duration of a pulse in microseconds
        * @param value the value of the pulse (default high)
        * @param maximum duration in micro-seconds
        */
        function pulseIn(name, high, maxDuration) {
            if (maxDuration === void 0) { maxDuration = 2000000; }
            name.used = true;
            var pulse = high ? 4 /* DEVICE_PIN_EVT_PULSE_HI */ : 5 /* DEVICE_PIN_EVT_PULSE_LO */;
            // Always return default value, can't simulate
            return 500;
        }
        DigitalInOutPinMethods.pulseIn = pulseIn;
        /**
        * Configures the pull of this pin.
        * @param pull one of the mbed pull configurations: PullUp, PullDown, PullNone
        */
        function setPull(name, pull) {
            name.setPull(pull);
        }
        DigitalInOutPinMethods.setPull = setPull;
        /**
         * Get the pin state (pressed or not). Requires to hold the ground to close the circuit.
         * @param name pin used to detect the touch
         */
        function isPressed(name) {
            return name.isTouched();
        }
        DigitalInOutPinMethods.isPressed = isPressed;
    })(DigitalInOutPinMethods = pxsim.DigitalInOutPinMethods || (pxsim.DigitalInOutPinMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var AnalogInPinMethods;
    (function (AnalogInPinMethods) {
        /**
         * Read the connector value as analog, that is, as a value comprised between 0 and 1023.
         */
        function analogRead(name) {
            pxsim.pins.markUsed(name);
            return name.analogReadPin();
        }
        AnalogInPinMethods.analogRead = analogRead;
    })(AnalogInPinMethods = pxsim.AnalogInPinMethods || (pxsim.AnalogInPinMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var AnalogOutPinMethods;
    (function (AnalogOutPinMethods) {
        /**
     * Set the connector value as analog. Value must be comprised between 0 and 1023.
     * @param value value to write to the pin between ``0`` and ``1023``. eg:1023,0
     */
        function analogWrite(name, value) {
            pxsim.pins.markUsed(name);
            name.analogWritePin(value);
        }
        AnalogOutPinMethods.analogWrite = analogWrite;
    })(AnalogOutPinMethods = pxsim.AnalogOutPinMethods || (pxsim.AnalogOutPinMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var PwmOnlyPinMethods;
    (function (PwmOnlyPinMethods) {
        function analogSetPeriod(name, micros) {
            name.analogSetPeriod(micros);
        }
        PwmOnlyPinMethods.analogSetPeriod = analogSetPeriod;
        function servoWrite(name, value) {
            name.servoWritePin(value);
        }
        PwmOnlyPinMethods.servoWrite = servoWrite;
        function servoSetPulse(name, micros) {
            name.servoSetPulse(name.id, micros);
        }
        PwmOnlyPinMethods.servoSetPulse = servoSetPulse;
    })(PwmOnlyPinMethods = pxsim.PwmOnlyPinMethods || (pxsim.PwmOnlyPinMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pins;
    (function (pins) {
        function pulseDuration() {
            // bus last event timestamp
            return 500;
        }
        pins.pulseDuration = pulseDuration;
        function createBuffer(sz) {
            return pxsim.BufferMethods.createBuffer(sz);
        }
        pins.createBuffer = createBuffer;
        function i2cReadBuffer(address, size, repeat) {
            // fake reading zeros
            return createBuffer(size);
        }
        pins.i2cReadBuffer = i2cReadBuffer;
        function i2cWriteBuffer(address, buf, repeat) {
            // fake - noop
        }
        pins.i2cWriteBuffer = i2cWriteBuffer;
        function spiWrite(value) {
            // TODO
            return 0;
        }
        pins.spiWrite = spiWrite;
        function spiMode(mode) {
            // TODO
        }
        pins.spiMode = spiMode;
        function spiTransfer(command, response) {
            // TODO
            return 0;
        }
        pins.spiTransfer = spiTransfer;
        function spiFrequency(f) {
            // TODO
        }
        pins.spiFrequency = spiFrequency;
        function spiFormat(bits, mode) {
            // TODO
        }
        pins.spiFormat = spiFormat;
        function spiPins(mosi, miso, sck) {
            // TODO
        }
        pins.spiPins = spiPins;
    })(pins = pxsim.pins || (pxsim.pins = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        var SWITCH_PART_XOFF = -1;
        var SWITCH_PART_YOFF = -30;
        var SWITCH_PART_WIDTH = 100;
        var SWITCH_PART_HEIGHT = 100;
        var SWITCH_PART_PIN_DIST = 15;
        var SWITCH_PART_SVG_OFF = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100mm\" height=\"100mm\" viewBox=\"0 0 100 100\" id=\"svg8\">\n    <g id=\"layer1\" transform=\"translate(0 -197)\">\n      <rect id=\"rect4508-3\" width=\"6.054\" height=\"32.94\" x=\"43.381\" y=\"210.817\" rx=\"2.811\" fill=\"#666\" stroke=\"#000\" stroke-width=\".309\"/>\n      <rect id=\"rect4508-3-3\" width=\"6.054\" height=\"32.94\" x=\"58.321\" y=\"210.817\" rx=\"2.811\" fill=\"#666\" stroke=\"#000\" stroke-width=\".309\"/>\n      <rect id=\"rect4508\" width=\"6.054\" height=\"32.94\" x=\"28.44\" y=\"210.817\" rx=\"2.811\" fill=\"#666\" stroke=\"#000\" stroke-width=\".309\"/>\n      <rect id=\"rect4485\" width=\"100.542\" height=\"40.611\" y=\"237.763\" rx=\"3.432\" stroke=\"#000\" stroke-width=\".309\"/>\n      <rect id=\"rect4487\" width=\"60.587\" height=\"18.323\" x=\"7.977\" y=\"248.907\" rx=\"2.46\" fill=\"#b3b3b3\" stroke=\"#000\" stroke-width=\".262\"/>\n      <rect id=\"rect4487-7\" width=\"53.273\" height=\"10.029\" x=\"11.2\" y=\"253.384\" rx=\"2.163\" fill=\"#999\" stroke=\"#000\" stroke-width=\".182\"/>\n      <rect id=\"handle\" width=\"19.243\" height=\"30.007\" x=\"11.924\" y=\"256.572\" rx=\"3.432\" fill=\"#4d4d4d\" stroke=\"#000\" stroke-width=\".309\"/>\n      <text style=\"line-height:1.25\" x=\"71.848\" y=\"259.158\" id=\"text\" transform=\"scale(.97895 1.0215)\" font-weight=\"400\" font-size=\"17.409\" font-family=\"sans-serif\" letter-spacing=\"0\" word-spacing=\"0\" fill=\"#fff\" stroke-width=\".435\">\n        <tspan id=\"tspan4558\" x=\"71.848\" y=\"259.158\" style=\"-inkscape-font-specification:Consolas\" font-family=\"Consolas\">OFF</tspan>\n      </text>\n    </g>\n  </svg>\n  ";
        var SWITCH_PART_SVG_ON = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100mm\" height=\"100mm\" viewBox=\"0 0 100 100\" id=\"svg8\">\n  <g id=\"layer1\" transform=\"translate(0 -197)\">\n    <g id=\"g4509\" transform=\"matrix(1.14409 0 0 1.19383 -7.582 -50.118)\">\n      <rect rx=\"2.457\" y=\"218.57\" x=\"44.544\" height=\"27.592\" width=\"5.292\" id=\"rect4508-3\" fill=\"#666\" stroke=\"#000\" stroke-width=\".265\"/>\n      <rect rx=\"2.457\" y=\"218.57\" x=\"57.604\" height=\"27.592\" width=\"5.292\" id=\"rect4508-3-3\" fill=\"#666\" stroke=\"#000\" stroke-width=\".265\"/>\n      <rect rx=\"2.457\" y=\"218.57\" x=\"31.485\" height=\"27.592\" width=\"5.292\" id=\"rect4508\" fill=\"#666\" stroke=\"#000\" stroke-width=\".265\"/>\n      <rect rx=\"3\" y=\"241.141\" x=\"6.627\" height=\"34.018\" width=\"87.879\" id=\"rect4485\" fill=\"#450\" stroke=\"#000\" stroke-width=\".265\"/>\n      <rect rx=\"2.15\" y=\"250.476\" x=\"13.6\" height=\"15.348\" width=\"52.957\" id=\"rect4487\" fill=\"#b3b3b3\" stroke=\"#000\" stroke-width=\".224\"/>\n      <rect rx=\"1.89\" y=\"254.226\" x=\"16.417\" height=\"8.4\" width=\"46.564\" id=\"rect4487-7\" fill=\"#999\" stroke=\"#000\" stroke-width=\".156\"/>\n      <rect rx=\"3\" y=\"256.897\" x=\"46.189\" height=\"25.135\" width=\"16.82\" id=\"handle\" fill=\"#4d4d4d\" stroke=\"#000\" stroke-width=\".265\"/>\n      <text id=\"text\" y=\"263.731\" x=\"68.105\" style=\"line-height:1.25\" font-weight=\"400\" font-size=\"14.896\" font-family=\"sans-serif\" letter-spacing=\"0\" word-spacing=\"0\" fill=\"#fff\" stroke-width=\".372\">\n        <tspan style=\"-inkscape-font-specification:Consolas\" y=\"263.731\" x=\"68.105\" id=\"tspan4558\" font-family=\"Consolas\">ON</tspan>\n      </text>\n    </g>\n  </g>\n</svg>\n";
        // For the intructions
        function mkSideSwitchPart(xy) {
            if (xy === void 0) { xy = [0, 0]; }
            var x = xy[0], y = xy[1];
            var l = x + SWITCH_PART_XOFF;
            var t = y + SWITCH_PART_YOFF;
            var w = SWITCH_PART_WIDTH;
            var h = SWITCH_PART_HEIGHT;
            var img = pxsim.svg.elt("image");
            pxsim.svg.hydrate(img, {
                class: "sim-led", x: l, y: t, width: w, height: h,
                href: pxsim.svg.toDataUri(SWITCH_PART_SVG_OFF)
            });
            return { el: img, x: l, y: t, w: w, h: h };
        }
        visuals.mkSideSwitchPart = mkSideSwitchPart;
        var ToggleComponentVisual = /** @class */ (function () {
            function ToggleComponentVisual(parsePinString) {
                var _this = this;
                this.currentlyOn = false;
                this.element = pxsim.svg.elt("g");
                this.element.onclick = function () {
                    if (_this.state) {
                        _this.state.toggle();
                        pxsim.runtime.queueDisplayUpdate();
                    }
                };
                this.onElement = this.initImage(SWITCH_PART_SVG_ON);
                this.offElement = this.initImage(SWITCH_PART_SVG_OFF);
                this.element.appendChild(this.offElement);
                this.parsePinString = parsePinString;
            }
            ToggleComponentVisual.prototype.moveToCoord = function (xy) {
                var to = [xy[0] + SWITCH_PART_XOFF, xy[1] + SWITCH_PART_YOFF];
                visuals.translateEl(this.element, to);
            };
            ToggleComponentVisual.prototype.init = function (bus, state, svgEl, otherParams) {
                this.state = state(this.parsePinString(otherParams["pin"]));
                this.updateState();
            };
            ToggleComponentVisual.prototype.updateState = function () {
                if (this.state.on() === this.currentlyOn) {
                    return;
                }
                this.currentlyOn = this.state.on();
                if (this.state.on()) {
                    this.element.removeChild(this.offElement);
                    this.element.appendChild(this.onElement);
                }
                else {
                    this.element.removeChild(this.onElement);
                    this.element.appendChild(this.offElement);
                }
            };
            ToggleComponentVisual.prototype.updateTheme = function () { };
            ToggleComponentVisual.prototype.initImage = function (svgData) {
                var image = "data:image/svg+xml," + encodeURIComponent(svgData);
                var imgAndSize = visuals.mkImageSVG({
                    image: image,
                    width: SWITCH_PART_WIDTH,
                    height: SWITCH_PART_HEIGHT,
                    imageUnitDist: SWITCH_PART_PIN_DIST,
                    targetUnitDist: visuals.PIN_DIST
                });
                return imgAndSize.el;
            };
            return ToggleComponentVisual;
        }());
        visuals.ToggleComponentVisual = ToggleComponentVisual;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var ToggleState = /** @class */ (function () {
        function ToggleState(pin) {
            this.pin = pin;
        }
        ToggleState.prototype.toggle = function () {
            var on = !!this.pin.value;
            this.pin.setValue(on ? 0 : 1023);
        };
        ToggleState.prototype.on = function () {
            return this.pin.value > 0;
        };
        return ToggleState;
    }());
    pxsim.ToggleState = ToggleState;
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
    var gamepad;
    (function (gamepad) {
        function setButton(index, up) {
            // TODO
        }
        gamepad.setButton = setButton;
        function move(index, x, y) {
            // TODO
        }
        gamepad.move = move;
        function setThrottle(index, value) {
            // TODO
        }
        gamepad.setThrottle = setThrottle;
    })(gamepad = pxsim.gamepad || (pxsim.gamepad = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var network;
    (function (network) {
        function infraredSendPacket(buf) {
            var state = pxsim.getInfraredState();
            state.send(buf);
        }
        network.infraredSendPacket = infraredSendPacket;
        function infraredPacket() {
            var state = pxsim.getInfraredState();
            return pxsim.incr(state.packet);
        }
        network.infraredPacket = infraredPacket;
        function onInfraredPacket(body) {
            var state = pxsim.getInfraredState();
            state.listen(body);
        }
        network.onInfraredPacket = onInfraredPacket;
        function onInfraredError(body) {
            var state = pxsim.getInfraredState();
            state.listenError(body);
        }
        network.onInfraredError = onInfraredError;
    })(network = pxsim.network || (pxsim.network = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var InfraredState = /** @class */ (function () {
        function InfraredState() {
            // notify view that a packet was received
            this.packetReceived = false;
            this.IR_COMPONENT_ID = 0x2042;
            this.IR_PACKET_EVENT = 0x2;
            this.IR_PACKET_ERROR_EVENT = 0x3;
        }
        InfraredState.prototype.send = function (buf) {
            pxsim.Runtime.postMessage({
                type: "irpacket",
                packet: buf.data
            });
        };
        InfraredState.prototype.listen = function (body) {
            pxsim.pxtcore.registerWithDal(this.IR_COMPONENT_ID, this.IR_PACKET_EVENT, body);
        };
        InfraredState.prototype.listenError = function (body) {
            pxsim.pxtcore.registerWithDal(this.IR_COMPONENT_ID, this.IR_PACKET_ERROR_EVENT, body);
        };
        InfraredState.prototype.receive = function (buf) {
            pxsim.decr(this.packet);
            this.packet = buf;
            pxsim.incr(this.packet);
            this.packetReceived = true;
            pxsim.board().bus.queue(this.IR_COMPONENT_ID, this.IR_PACKET_EVENT);
        };
        return InfraredState;
    }());
    pxsim.InfraredState = InfraredState;
    function getInfraredState() {
        return pxsim.board().irState;
    }
    pxsim.getInfraredState = getInfraredState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var jacdac;
    (function (jacdac) {
        function __internalSendPacket(packet, address) {
            /* TODOs
            pxsim.Runtime.postMessage(<pxsim.SimulatorJacDacPacketMessage>{
                type: "jacdac",
                packetType: "pkt",
                packet: packet.data,
                address
            });
            */
            return 0;
        }
        jacdac.__internalSendPacket = __internalSendPacket;
    })(jacdac = pxsim.jacdac || (pxsim.jacdac = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var keyboard;
    (function (keyboard) {
        function type(s) {
        }
        keyboard.type = type;
        function key(c, event) {
        }
        keyboard.key = key;
        function mediaKey(key, event) {
        }
        keyboard.mediaKey = mediaKey;
        function functionKey(key, event) {
        }
        keyboard.functionKey = functionKey;
    })(keyboard = pxsim.keyboard || (pxsim.keyboard = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var NeoPixelMode;
    (function (NeoPixelMode) {
        NeoPixelMode[NeoPixelMode["RGB"] = 1] = "RGB";
        NeoPixelMode[NeoPixelMode["RGBW"] = 2] = "RGBW";
        NeoPixelMode[NeoPixelMode["RGB_RGB"] = 3] = "RGB_RGB";
    })(NeoPixelMode || (NeoPixelMode = {}));
    var CommonNeoPixelState = /** @class */ (function () {
        function CommonNeoPixelState() {
            this.mode = NeoPixelMode.RGB; // GRB
        }
        Object.defineProperty(CommonNeoPixelState.prototype, "length", {
            get: function () {
                return this.buffer ? (this.buffer.length / this.stride) >> 0 : 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommonNeoPixelState.prototype, "stride", {
            get: function () {
                return this.mode == NeoPixelMode.RGBW ? 4 : 3;
            },
            enumerable: true,
            configurable: true
        });
        CommonNeoPixelState.prototype.pixelColor = function (pixel) {
            var offset = pixel * this.stride;
            switch (this.mode) {
                case NeoPixelMode.RGBW:
                    return [this.buffer[offset + 1], this.buffer[offset], this.buffer[offset + 2], this.buffer[offset + 3]];
                case NeoPixelMode.RGB_RGB:
                    return [this.buffer[offset], this.buffer[offset + 1], this.buffer[offset + 2]];
                default:
                    return [this.buffer[offset + 1], this.buffer[offset + 0], this.buffer[offset + 2]];
            }
        };
        return CommonNeoPixelState;
    }());
    pxsim.CommonNeoPixelState = CommonNeoPixelState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var light;
    (function (light) {
        // Currently only modifies the builtin pixels
        function sendBuffer(pin, mode, b) {
            var state = pxsim.neopixelState(pin.id);
            state.mode = mode; // TODO RGBW support
            state.buffer = b.data;
            pxsim.runtime.queueDisplayUpdate();
        }
        light.sendBuffer = sendBuffer;
        function defaultPin() {
            return pxsim.board().defaultNeopixelPin();
        }
        light.defaultPin = defaultPin;
    })(light = pxsim.light || (pxsim.light = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function neopixelState(pinId) {
        return pxsim.board().neopixelState(pinId);
    }
    pxsim.neopixelState = neopixelState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function lightLevel() {
            var b = pxsim.lightSensorState();
            b.setUsed();
            return b.getLevel();
        }
        input.lightLevel = lightLevel;
        function onLightConditionChanged(condition, body) {
            var b = pxsim.lightSensorState();
            b.setUsed();
            pxsim.pxtcore.registerWithDal(b.id, condition, body);
        }
        input.onLightConditionChanged = onLightConditionChanged;
        function setLightThreshold(condition, value) {
            var b = pxsim.lightSensorState();
            b.setUsed();
            switch (condition) {
                case 1 /* ANALOG_THRESHOLD_LOW */:
                    b.setLowThreshold(value);
                    break;
                case 2 /* ANALOG_THRESHOLD_HIGH */:
                    b.setHighThreshold(value);
                    break;
            }
        }
        input.setLightThreshold = setLightThreshold;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function lightSensorState() {
        return pxsim.board().lightSensorState;
    }
    pxsim.lightSensorState = lightSensorState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function soundLevel() {
            var b = pxsim.microphoneState();
            b.setUsed();
            return b.getLevel();
        }
        input.soundLevel = soundLevel;
        function onLoudSound(body) {
            var b = pxsim.microphoneState();
            b.setUsed();
            pxsim.pxtcore.registerWithDal(b.id, 2 /* LEVEL_THRESHOLD_HIGH */, body);
        }
        input.onLoudSound = onLoudSound;
        function setLoudSoundThreshold(value) {
            var b = pxsim.microphoneState();
            b.setUsed();
            b.setHighThreshold(value);
        }
        input.setLoudSoundThreshold = setLoudSoundThreshold;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function microphoneState() {
        return pxsim.board().microphoneState;
    }
    pxsim.microphoneState = microphoneState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var mouse;
    (function (mouse) {
        function setButton(button, down) {
        }
        mouse.setButton = setButton;
        function move(x, y) {
        }
        mouse.move = move;
        function turnWheel(w) {
        }
        mouse.turnWheel = turnWheel;
    })(mouse = pxsim.mouse || (pxsim.mouse = {}));
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
    function pixelPin() {
        return pxsim.board().pixelPin;
    }
    pxsim.pixelPin = pixelPin;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pixel;
    (function (pixel) {
        pixel.defaultPin = pxsim.light.defaultPin;
        function sendBuffer(data) {
            var p = pxsim.pixelPin();
            if (p)
                pxsim.light.sendBuffer(pxsim.pixelPin(), 1, data);
        }
        pixel.sendBuffer = sendBuffer;
    })(pixel = pxsim.pixel || (pxsim.pixel = {}));
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
    var serial;
    (function (serial) {
        var rxBuffer = ""; // another iframe could write to this
        function readString() {
            var r = rxBuffer;
            rxBuffer = "";
            return r;
        }
        serial.readString = readString;
        function writeString(str) {
            if (str)
                pxsim.control.__log(str);
        }
        serial.writeString = writeString;
        function writeBuffer(buffer) {
            // NOP, can't simulate
        }
        serial.writeBuffer = writeBuffer;
        function attachToConsole() {
            // DO NO write to console.log
        }
        serial.attachToConsole = attachToConsole;
        function setBaudRate(rate) {
            // TODO
        }
        serial.setBaudRate = setBaudRate;
        function redirect(tx, rx) {
            // TODO
        }
        serial.redirect = redirect;
    })(serial = pxsim.serial || (pxsim.serial = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var StorageState = /** @class */ (function () {
        function StorageState() {
            this.files = {};
        }
        return StorageState;
    }());
    pxsim.StorageState = StorageState;
    function storageState() {
        return pxsim.board().storageState;
    }
    pxsim.storageState = storageState;
})(pxsim || (pxsim = {}));
// Auto-generated. Do not edit.
var pxsim;
(function (pxsim) {
    var storage;
    (function (storage) {
        function init() {
            // do nothing
        }
        storage.init = init;
        function append(filename, data) {
            var state = pxsim.storageState();
            var buf = state.files[filename];
            if (!buf)
                buf = state.files[filename] = [];
            for (var i = 0; i < data.length; ++i)
                buf.push(data.charCodeAt(i));
        }
        storage.append = append;
        function appendBuffer(filename, data) {
            var state = pxsim.storageState();
            var buf = state.files[filename];
            if (!buf)
                buf = state.files[filename] = [];
            for (var i = 0; i < data.data.length; ++i)
                buf.push(data.data[i]);
        }
        storage.appendBuffer = appendBuffer;
        function overwrite(filename, data) {
            var state = pxsim.storageState();
            var buf = [];
            for (var i = 0; i < data.length; ++i)
                buf.push(data.charCodeAt(i));
            state.files[filename] = buf;
        }
        storage.overwrite = overwrite;
        function overwriteWithBuffer(filename, data) {
            var state = pxsim.storageState();
            var buf = [];
            for (var i = 0; i < data.data.length; ++i)
                buf.push(data.data[i]);
            state.files[filename] = buf;
        }
        storage.overwriteWithBuffer = overwriteWithBuffer;
        function exists(filename) {
            var state = pxsim.storageState();
            return !!state.files[filename];
        }
        storage.exists = exists;
        function remove(filename) {
            var state = pxsim.storageState();
            delete state.files[filename];
        }
        storage.remove = remove;
        function size(filename) {
            var state = pxsim.storageState();
            var buf = state.files[filename];
            return buf ? buf.length : 0;
        }
        storage.size = size;
        function read(filename) {
            var state = pxsim.storageState();
            var buf = state.files[filename] || [];
            var s = "";
            for (var i = 0; i < buf.length; ++i)
                s += String.fromCharCode(buf[i]);
            return s;
        }
        storage.read = read;
        function readAsBuffer(filename) {
            var state = pxsim.storageState();
            var buf = state.files[filename];
            return buf ? new pxsim.RefBuffer(Uint8Array.from(buf)) : undefined;
        }
        storage.readAsBuffer = readAsBuffer;
    })(storage = pxsim.storage || (pxsim.storage = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var SlideSwitchState = /** @class */ (function () {
        function SlideSwitchState() {
            this.left = false;
        }
        SlideSwitchState.prototype.setState = function (left) {
            if (this.left === left) {
                return;
            }
            else if (left) {
                pxsim.board().bus.queue(SlideSwitchState.id, 2 /* DEVICE_BUTTON_EVT_UP */);
            }
            else {
                pxsim.board().bus.queue(SlideSwitchState.id, 1 /* DEVICE_BUTTON_EVT_DOWN */);
            }
            this.left = left;
        };
        SlideSwitchState.prototype.isLeft = function () {
            return this.left;
        };
        SlideSwitchState.id = 3000 /*DEVICE_ID_BUTTON_SLIDE*/;
        return SlideSwitchState;
    }());
    pxsim.SlideSwitchState = SlideSwitchState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var input;
    (function (input) {
        function onSwitchMoved(direction, body) {
            pxsim.pxtcore.registerWithDal(pxsim.SlideSwitchState.id, direction, body);
        }
        input.onSwitchMoved = onSwitchMoved;
        function switchRight() {
            var b = pxsim.board();
            var sw = b.slideSwitchState;
            return !sw.isLeft();
        }
        input.switchRight = switchRight;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function thermometerState() {
        return pxsim.board().thermometerState;
    }
    pxsim.thermometerState = thermometerState;
    function setThermometerUnit(unit) {
        pxsim.board().thermometerUnitState = unit;
    }
    pxsim.setThermometerUnit = setThermometerUnit;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var TemperatureUnit;
    (function (TemperatureUnit) {
        TemperatureUnit[TemperatureUnit["Celsius"] = 0] = "Celsius";
        TemperatureUnit[TemperatureUnit["Fahrenheit"] = 1] = "Fahrenheit";
    })(TemperatureUnit = pxsim.TemperatureUnit || (pxsim.TemperatureUnit = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var input;
    (function (input) {
        function temperature(unit) {
            var b = pxsim.thermometerState();
            b.setUsed();
            pxsim.setThermometerUnit(unit);
            var deg = b.getLevel();
            return unit == pxsim.TemperatureUnit.Celsius ? deg
                : ((deg * 18) / 10 + 32) >> 0;
        }
        input.temperature = temperature;
        function onTemperatureConditionChanged(condition, temperature, unit, body) {
            var b = pxsim.thermometerState();
            b.setUsed();
            pxsim.setThermometerUnit(unit);
            var t = unit == pxsim.TemperatureUnit.Celsius
                ? temperature
                : (((temperature - 32) * 10) / 18 >> 0);
            if (condition === 2 /* ANALOG_THRESHOLD_HIGH */) {
                b.setHighThreshold(t);
            }
            else {
                b.setLowThreshold(t);
            }
            pxsim.pxtcore.registerWithDal(b.id, condition, body);
        }
        input.onTemperatureConditionChanged = onTemperatureConditionChanged;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var CapacitiveSensorState = /** @class */ (function () {
        function CapacitiveSensorState(mapping) {
            this.capacity = [];
            this.reading = [];
            this.mapping = mapping;
        }
        CapacitiveSensorState.prototype.getCap = function (pinId) {
            return this.mapping[pinId];
        };
        CapacitiveSensorState.prototype.readCap = function (pinId, samples) {
            var capId = this.getCap(pinId);
            return this.capacitiveSensor(capId, samples);
        };
        CapacitiveSensorState.prototype.isReadingPin = function (pinId, pin) {
            var capId = this.getCap(pinId);
            return this.reading[capId];
        };
        CapacitiveSensorState.prototype.isReading = function (capId) {
            return this.reading[capId];
        };
        CapacitiveSensorState.prototype.startReading = function (pinId, pin) {
            var capId = this.getCap(pinId);
            this.reading[capId] = true;
            pin.mode = pxsim.PinFlags.Analog | pxsim.PinFlags.Input;
            pin.mode |= pxsim.PinFlags.Analog;
        };
        CapacitiveSensorState.prototype.capacitiveSensor = function (capId, samples) {
            return this.capacity[capId] || 0;
        };
        CapacitiveSensorState.prototype.reset = function (capId) {
            this.capacity[capId] = 0;
            this.reading[capId] = false;
        };
        return CapacitiveSensorState;
    }());
    pxsim.CapacitiveSensorState = CapacitiveSensorState;
    var TouchButton = /** @class */ (function (_super) {
        __extends(TouchButton, _super);
        function TouchButton(pin) {
            return _super.call(this, pin) || this;
        }
        TouchButton.prototype.setThreshold = function (value) {
        };
        TouchButton.prototype.value = function () {
            return 0;
        };
        return TouchButton;
    }(pxsim.CommonButton));
    pxsim.TouchButton = TouchButton;
    var TouchButtonState = /** @class */ (function () {
        function TouchButtonState(pins) {
            this.buttons = pins.map(function (pin) { return new TouchButton(pin); });
        }
        return TouchButtonState;
    }());
    pxsim.TouchButtonState = TouchButtonState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        function getTouchButton(index) {
            var state = pxsim.board().touchButtonState;
            var btn = state.buttons.filter(function (b) { return b.id == index; })[0];
            if (btn) {
                pxtcore.getPin(btn.id).used = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            return btn;
        }
        pxtcore.getTouchButton = getTouchButton;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var TouchButtonMethods;
    (function (TouchButtonMethods) {
        function setThreshold(button, value) {
            button.setThreshold(value);
        }
        TouchButtonMethods.setThreshold = setThreshold;
        function value(button) {
            return button.value();
        }
        TouchButtonMethods.value = value;
    })(TouchButtonMethods = pxsim.TouchButtonMethods || (pxsim.TouchButtonMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var AnalogInOutPinMethods;
    (function (AnalogInOutPinMethods) {
        function touchButton(name) {
            return pxsim.pxtcore.getTouchButton(name.id);
        }
        AnalogInOutPinMethods.touchButton = touchButton;
    })(AnalogInOutPinMethods = pxsim.AnalogInOutPinMethods || (pxsim.AnalogInOutPinMethods = {}));
})(pxsim || (pxsim = {}));

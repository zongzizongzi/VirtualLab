/**
 * Created by Fengma on 2016/10/13.
 */

function StepResponse(domElement) {
    var _this = this;
    this.ctx = domElement.getContext('2d');
    this.signalType = 0;
    this.k1 = 1;
    this.k2 = 1;
    this.k3 = 1;
    this.Fs = 1000;
    this.input = 0;
    this.lastInput = 0;
    this.temp1 = 0;
    this.temp2 = 0;
    this.output = 0;
    this.setInput = function (input) {
        var v, v1, v2, v21, v3, E, a1, b1;

        _this.input = input;

        if (_this.signalType < 6) {
            v1 = _this.k1 * _this.input;

            v21 = _this.temp1 + 0.5 * (_this.input + _this.lastInput) / _this.Fs;
            _this.temp1 = v21;
            v2 = _this.k2 * v21;

            v3 = _this.k3 * (_this.input - _this.lastInput) * _this.Fs;

            _this.output = v1 + v2 + v3;
        }
        else if (_this.signalType < 9) {
            if (_this.signalType == 6) { //一阶 1/(TS+1)
                E = Math.exp(-1 / (_this.k1 * _this.Fs));
                v = E * _this.temp1 + (1.0 - E) * _this.input;
                _this.temp1 = v;
                _this.output = v;//输出
            }
            if (_this.signalType == 7) { //二阶 W^2/(S^2+2gWS+W^2)
                if (_this.k2 > 1)
                    _this.k2 = 1;
                b1 = Math.exp(-2 * 6.28 * _this.k1 * _this.k2 / _this.Fs);
                a1 = 2 * Math.exp(-6.28 * _this.k1 * _this.k2 / _this.Fs) * Math.cos(6.28 * _this.k1 * Math.sqrt(1 - _this.k2 * _this.k2) / _this.Fs);
                v = a1 * _this.temp1 - b1 * _this.temp2 + 1 * (1 - a1 + b1) * _this.input;
                _this.temp2 = _this.temp1;
                _this.temp1 = v;
                _this.output = v;//输出
            }
            if (_this.signalType == 8) { //一阶 X+1/(TS+1)
                E = Math.exp(-1 / (_this.k1 * _this.Fs));
                v = E * _this.temp1 + (1.0 - E) * _this.input;
                _this.temp1 = v;
                _this.output = v + _this.k2 * _this.input;//输出
            }

        }
        else _this.output = 0;
    };
    this.reset = function () {
        _this.lastInput = 0;
        _this.temp1 = 0;
        _this.temp2 = 0;
    };

    this.setType = function (type) {
        _this.signalType = type;

        //PID控制器
        if (_this.signalType == 0) {
            _this.k1 = 1;
            _this.k2 = 1;
            _this.k3 = 1;
        }

        //比例控制器
        if (_this.signalType == 1) {
            _this.k1 = 1;
            _this.k2 = 0;
            _this.k3 = 0;
        }

        //积分控制器
        if (_this.signalType == 2) {
            _this.k1 = 0;
            _this.k2 = 1;
            _this.k3 = 0;
        }

        //微分控制器
        if (_this.signalType == 3) {
            _this.k1 = 0;
            _this.k2 = 0;
            _this.k3 = 1;
        }

        //比例积分控制器
        if (_this.signalType == 4) {
            _this.k1 = 1;
            _this.k2 = 1;
            _this.k3 = 0;
        }

        //比例微分控制器
        if (_this.signalType == 5) {
            _this.k1 = 1;
            _this.k2 = 0;
            _this.k3 = 1;
        }

        //惯性环节
        if (_this.signalType == 6) {
            _this.k1 = 1;
            _this.k2 = 0;
        }

        //振荡环节
        if (_this.signalType == 7) {
            _this.k1 = 1;
            _this.k2 = 1;
        }

        //比例惯性环节
        if (_this.signalType == 8) {
            _this.k1 = 1;
            _this.k2 = 1;
        }

    }
}
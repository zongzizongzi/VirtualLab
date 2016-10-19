/**
 * Created by Fengma on 2016/10/18.
 */

/**
 * PID控制器
 * @param domElement HTML CANVAS
 * @constructor
 */
function PIDVI(domElement) {

    var _this = this;
    this.container = domElement;
    this.input = 0;
    this.singleOutput = 0;
    this.P = 1;
    this.I = 1;
    this.D = 1;
    this.Fs = 50;
    this.u1 = 0;
    this.y1 = 0;

    this.dataLength = 1024;
    this.index = 0;
    this.output = [];
    this.autoSave = true;

    /**
     *
     * @param inputValue 从输入端读取的数据
     */
    this.setData = function (inputValue) {

        var v1, v2, v3, v21, u, Ts = 1.0 / _this.Fs;

        _this.input = inputValue;
        u = _this.input;//从输入端口上读数
        v1 = _this.P * u;
        v21 = _this.y1 + 0.5 * Ts * (u + _this.u1);
        _this.y1 = v21;
        v2 = _this.I * v21;
        v3 = _this.D * (u - _this.u1) / Ts;
        _this.u1 = u;
        _this.singleOutput = v1 + v2 + v3;//向输出端口上写数

        if (_this.autoSave)
            _this.dataCollector(_this.singleOutput);

        return _this.singleOutput;
    };

    /**
     * 将输出数保存在数组内
     * @param data singleOutput
     */
    this.dataCollector = function (data) {

        var i = 0;
        if (_this.index == 0) {
            for (i = 0; i < _this.dataLength - 1; i++) {
                _this.output[i] = 0;
            }
        }
        if (_this.index <= (_this.dataLength - 1)) {
            _this.output[_this.index] = data;
            _this.index++;
        } else {
            for (i = 0; i < _this.dataLength - 1; i++) {
                _this.output[i] = _this.output[i + 1];
            }
            _this.output[_this.dataLength - 1] = data;
        }
    };

    this.reset = function () {

        _this.input = 0;
        _this.singleOutput = 0;
        _this.P = 1;
        _this.I = 1;
        _this.D = 1;
        _this.Fs = 50;
        _this.u1 = 0;
        _this.y1 = 0;
        _this.index = 0;
    }
}
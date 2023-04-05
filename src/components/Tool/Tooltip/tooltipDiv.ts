import './styles.less';
var TooltipDiv = (function () {
  var isInit = false;

  function _() {}

  _.initTool = function (frameDiv) {
    if (isInit) {
      return;
    }

    var div = document.createElement('div');
    div.className = 'tooltipdiv right'; //

    var arrow = document.createElement('div');
    arrow.className = 'tooltipdiv-arrow';
    div.appendChild(arrow);

    var title = document.createElement('div');
    title.className = 'tooltipdiv-inner';
    div.appendChild(title);

    this._div = div;
    this._title = title;

    frameDiv.appendChild(div);

    isInit = true;
  };

  _.setVisible = function (visible) {
    if (!isInit) {
      return;
    }
    this._div.style.display = visible ? 'block' : 'none';
  };

  _.showAt = function (position, message) {
    if (!isInit) {
      return;
    }
    if (position && message) {
      this.setVisible(true);
      this._title.innerHTML = message;
      this._div.style.left = position.x + 10 + 'px';
      this._div.style.top = position.y - this._div.clientHeight / 2 + 'px';
    }
  };

  return _;
})();

export default TooltipDiv;

/** @jsx React.DOM */;
var ExpandingTextarea;

ExpandingTextarea = React.createClass({
  cloneCSSProperties: ['lineHeight', 'textDecoration', 'letterSpacing', 'fontSize', 'fontFamily', 'fontStyle', 'fontWeight', 'textTransform', 'textAlign', 'direction', 'wordSpacing', 'fontSizeAdjust', 'wordWrap', 'word-break', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth', 'borderBottomWidth', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'boxSizing', 'webkitBoxSizing', 'mozBoxSizing', 'msBoxSizing'],
  containerStyle: {
    position: "relative"
  },
  textareaStyle: {
    position: "absolute",
    height: "100%",
    width: "100%",
    resize: "none",
    background: "transparent"
  },
  preStyle: {
    visibility: "hidden",
    border: "0 solid",
    whiteSpace: "pre-wrap"
  },
  originalTextareaStyles: {},
  componentDidMount: function() {
    var $pre, $textarea;
    $textarea = $(this.refs.text.getDOMNode());
    this.originalTextareaStyles = _.zipObject(this.cloneCSSProperties, _.map(this.cloneCSSProperties, function(p) {
      return $textarea.css(p);
    }));
    $pre = $(this.refs.pre.getDOMNode());
    return _.forIn(this.originalTextareaStyles, function(val, prop) {
      if ($pre.css(prop) !== val) {
        return $pre.css(prop, val);
      }
    });
  },
  handleChange: function() {
    var text;
    text = this.refs.text.getDOMNode().value;
    return this.props.handleChange({
      id: this.props.block.id,
      data: {
        text: text
      }
    });
  },
  render: function() {
    return (
      <div style={this.containerStyle}>
        <textarea style={this.textareaStyle} value={this.props.block.data.text} ref="text" onChange={this.handleChange}></textarea>
        <pre ref="pre" style={this.preStyle}><div>{this.props.block.data.text+" "}</div></pre>
      </div>
    );
  },
  getSelection: function() {
    var el, end, endRange, len, normalizedValue, range, start, textInputRange;
    el = this.refs['text'].getDOMNode();
    el.focus();
    start = end = 0;
    normalizedValue = range = textInputRange = len = endRange = void 0;
    if (typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") {
      start = el.selectionStart;
      end = el.selectionEnd;
    } else {
      range = document.selection.createRange();
      if (range && range.parentElement() === el) {
        len = el.value.length;
        normalizedValue = el.value.replace(/\r\n/g, "\n");
        textInputRange = el.createTextRange();
        textInputRange.moveToBookmark(range.getBookmark());
        endRange = el.createTextRange();
        endRange.collapse(false);
        if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
          start = end = len;
        } else {
          start = -textInputRange.moveStart("character", -len);
          start += normalizedValue.slice(0, start).split("\n").length - 1;
          if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
            end = len;
          } else {
            end = -textInputRange.moveEnd("character", -len);
            end += normalizedValue.slice(0, end).split("\n").length - 1;
          }
        }
      }
    }
    return {
      start: start,
      end: end
    };
  }
});

module.exports = ExpandingTextarea;

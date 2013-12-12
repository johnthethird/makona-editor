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
      React.DOM.div( {style:this.containerStyle}, 
        React.DOM.textarea( {style:this.textareaStyle, value:this.props.block.data.text, ref:"text", onChange:this.handleChange}),
        React.DOM.pre( {ref:"pre", style:this.preStyle}, React.DOM.div(null, this.props.block.data.text+" "))
      )
    );
  }
});

module.exports = ExpandingTextarea;

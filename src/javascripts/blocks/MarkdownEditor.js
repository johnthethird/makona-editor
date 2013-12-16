/** @jsx React.DOM */;
var ExpandingTextarea, MarkdownEditor;

ExpandingTextarea = require("../tags/ExpandingTextarea");

MarkdownEditor = React.createClass({
  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.div(null, 
          React.DOM.button( {onClick:this.wrapSelectedWith.bind(this, "**")}, "Bold"),
          React.DOM.button( {onClick:this.wrapSelectedWith.bind(this, "*")}, "Italic")
        ),
        this.transferPropsTo(ExpandingTextarea( {ref:"eta"}))
      )
    );
  },
  wrapSelectedWith: function(chars, e) {
    var after, before, end, selected, start, text, _ref, _ref1;
    e.preventDefault();
    _ref = this.refs['eta'].getSelection(), start = _ref.start, end = _ref.end;
    if (start !== end) {
      _ref1 = this.getChunks(this.props.block.data.text, start, end), before = _ref1.before, selected = _ref1.selected, after = _ref1.after;
      text = before + chars + selected + chars + after;
      return this.props.handleChange({
        id: this.props.block.id,
        data: {
          text: text
        }
      });
    }
  },
  getChunks: function(text, start, end) {
    if (text == null) {
      text = "";
    }
    if (start == null) {
      start = 0;
    }
    if (end == null) {
      end = 0;
    }
    return {
      before: start === 0 ? "" : text.slice(0, +(start - 1) + 1 || 9e9),
      selected: text.slice(start, +(end - 1) + 1 || 9e9),
      after: text.slice(end, +text.length + 1 || 9e9)
    };
  }
});

module.exports = MarkdownEditor;

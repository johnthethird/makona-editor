/** @jsx React.DOM */;
var ExpandingTextarea, MarkdownEditor;

ExpandingTextarea = require("../tags/ExpandingTextarea");

MarkdownEditor = React.createClass({
  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.div( {className:"mk-toolbar"}, 
          React.DOM.button( {onClick:this.wrapSelectedWith.bind(this, "**")}, "Bold"),
          React.DOM.button( {onClick:this.wrapSelectedWith.bind(this, "*")}, "Italic"),
          React.DOM.button( {onClick:this.insertAtCaret.bind(this, "\n---\n")}, "HR"),
          React.DOM.button( {onClick:this.insertAtStartOfLine.bind(this, "# ")}, "H1"),
          React.DOM.button( {onClick:this.insertAtStartOfLine.bind(this, "## ")}, "H2")
        ),
        this.transferPropsTo(ExpandingTextarea( {ref:"eta"}))
      )
    );
  },
  insertAtCaret: function(chars, e) {
    var after, before, selected, text, _ref;
    e.preventDefault();
    _ref = this.refs['eta'].getChunks(), before = _ref.before, selected = _ref.selected, after = _ref.after;
    text = before + chars + selected + after;
    this.props.handleChange({
      id: this.props.block.id,
      data: {
        text: text
      }
    });
    return this.setCursorPos(before.length + chars.length);
  },
  insertAtStartOfLine: function(chars, e) {
    var after, before, combinedLines, cursorPos, lines, selected, text, theLine, _ref;
    e.preventDefault();
    _ref = this.refs['eta'].getChunks(), before = _ref.before, selected = _ref.selected, after = _ref.after;
    lines = before.split("\n");
    theLine = lines.pop();
    if (theLine.match(new RegExp("^" + chars, 'gi'))) {
      combinedLines = lines.length === 0 ? "" : lines.join("\n") + "\n";
      text = combinedLines + theLine.slice(chars.length, +theLine.length + 1 || 9e9) + selected + after;
      cursorPos = before.length - chars.length;
    } else {
      combinedLines = lines.length === 0 ? "" : lines.join("\n") + "\n";
      text = combinedLines + chars + theLine + selected + after;
      cursorPos = before.length + chars.length;
    }
    this.props.handleChange({
      id: this.props.block.id,
      data: {
        text: text
      }
    });
    return this.setCursorPos(cursorPos);
  },
  wrapSelectedWith: function(chars, e) {
    var after, before, selected, text, _ref;
    e.preventDefault();
    _ref = this.refs['eta'].getChunks(), before = _ref.before, selected = _ref.selected, after = _ref.after;
    if (selected.length > 0) {
      text = before + chars + selected + chars + after;
      this.props.handleChange({
        id: this.props.block.id,
        data: {
          text: text
        }
      });
      return this.setCursorPos(before.length + chars.length + selected.length + chars.length);
    }
  },
  setCursorPos: function(pos) {
    var _this = this;
    return setTimeout(function() {
      return _this.refs['eta'].setSelectionRange(pos, pos);
    }, 100);
  }
});

module.exports = MarkdownEditor;

/** @jsx React.DOM */;
var UnknownEditor;

UnknownEditor = React.createClass({
  handleChange: function() {
    var data;
    data = this.refs.text.getDOMNode().value;
    return this.props.handleChange({
      id: this.props.block.id,
      data: data
    });
  },
  render: function() {
    return React.DOM.textarea( {value:JSON.stringify(this.props.block.data, null, 2), ref:"text", onChange:this.handleChange});
  }
});

module.exports = UnknownEditor;

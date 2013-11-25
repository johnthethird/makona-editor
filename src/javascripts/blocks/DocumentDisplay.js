/** @jsx React.DOM */;
var DocumentDisplay;

DocumentDisplay = React.createClass({
  render: function() {
    return (
      React.DOM.a( {href:this.props.block.data.url} , 
        React.DOM.img( {src:"http://t1.development.kaleosoftware.com" + this.props.block.data.icon_url} ),React.DOM.span(null, this.props.block.data.title)
      )
    );
  }
});

module.exports = DocumentDisplay;

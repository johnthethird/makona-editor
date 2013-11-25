/** @jsx React.DOM */;
var ImageDisplay;

ImageDisplay = React.createClass({
  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.img( {src:this.props.block.data.src} )
      )
    );
  }
});

module.exports = ImageDisplay;

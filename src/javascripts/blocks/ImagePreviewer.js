/** @jsx React.DOM */;
var ImagePreviewer;

ImagePreviewer = React.createClass({
  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.img( {src:this.props.block.data.src} )
      )
    );
  }
});

module.exports = ImagePreviewer;

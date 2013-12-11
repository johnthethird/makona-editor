/** @jsx React.DOM */;
var ImageEditor, ImagePreviewer;

require("script!../../../vendor/jquery.fineuploader-4.0.3.js");

ImagePreviewer = require("./ImagePreviewer");

ImageEditor = React.createClass({
  componentDidMount: function() {
    var defaults, node, opts, _ref,
      _this = this;
    if (((_ref = this.refs) != null ? _ref.fineuploader : void 0) != null) {
      node = this.refs.fineuploader.getDOMNode();
      defaults = {
        element: node,
        debug: false,
        request: {
          inputName: 'asset',
          endpoint: 'http://bsg.mil/upload_image',
          params: {}
        },
        validation: {
          acceptFiles: ["image/jpeg", "image/png", "image/gif"],
          allowedExtensions: ["gif", "jpg", "jpeg", "png"],
          sizeLimit: 5000000
        },
        deleteFile: {
          enabled: false,
          method: "DELETE",
          endpoint: "http://bsg.mil/delete_uploaded_image",
          params: {}
        },
        retry: {
          enableAuto: true
        },
        resume: {
          enabled: false
        },
        callbacks: {
          onComplete: function(id, name, response) {
            if (response.success) {
              return _this.props.handleChange({
                id: _this.props.block.id,
                data: {
                  src: response.url,
                  id: response.id
                }
              }, true);
            }
          }
        }
      };
      opts = $.extend({}, defaults, this.props.opts.ImageEditor);
      return this.uploader = new qq.FineUploader(opts);
    }
  },
  shouldComponentUpdate: function() {
    return false;
  },
  componentWillUnmount: function() {
    var container, _results;
    this.uploader = null;
    container = this.getDOMNode();
    _results = [];
    while (container.lastChild) {
      _results.push(container.removeChild(container.lastChild));
    }
    return _results;
  },
  render: function() {
    return (
      React.DOM.div(null, 
         (this.props.block.data.src.length > 0) ? ImagePreviewer( {block:this.props.block} ) : React.DOM.div( {ref:"fineuploader"})
      )
    );
  }
});

module.exports = ImageEditor;

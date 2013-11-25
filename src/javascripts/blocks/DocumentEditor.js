/** @jsx React.DOM */;
var DocumentDisplay, DocumentEditor;

DocumentDisplay = require("./DocumentDisplay");

DocumentEditor = React.createClass({
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
          endpoint: 'http://bsg.mil/upload_document',
          params: {}
        },
        validation: {
          acceptFiles: [],
          allowedExtensions: [],
          sizeLimit: 5000000
        },
        deleteFile: {
          enabled: false,
          method: "DELETE",
          endpoint: "http://bsg.mil/delete_uploaded_document",
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
                  id: response.id,
                  icon_url: response.icon_url,
                  title: response.title
                }
              }, true);
            }
          }
        }
      };
      opts = $.extend({}, defaults, this.props.opts.DocumentEditor);
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
         (this.props.block.data.title.length > 0) ? DocumentDisplay( {block:this.props.block} ) : React.DOM.div( {ref:"fineuploader"})
      )
    );
  }
});

module.exports = DocumentEditor;

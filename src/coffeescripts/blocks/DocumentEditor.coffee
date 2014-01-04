`/** @jsx React.DOM */`

require("script!../../../vendor/jquery.fineuploader-4.0.3.js")

DocumentPreviewer = require("./DocumentPreviewer")

# TODO figure out best way to pass in config parameters, like upload endpoints, etc
DocumentEditor = React.createClass
  displayName: "DocumentEditor"
  componentDidMount: () ->
    if this.refs?.fineuploader?
      node = this.refs.fineuploader.getDOMNode()

      defaults =
        element: node
        debug: false
        request:
          inputName: 'asset'
          endpoint: 'http://bsg.mil/upload_document'
          params: {}
        validation:
          acceptFiles: []
          allowedExtensions: []
          sizeLimit: 5000000
        deleteFile:
          enabled: false
          method: "DELETE"
          endpoint: "http://bsg.mil/delete_uploaded_document"
          params: {}
        retry:
          enableAuto: true
        resume:
          enabled: false
        callbacks:
          onComplete: (id, name, response) =>
            if (response.success)
              this.props.handleChange({id: this.props.block.id, data: {src: response.url, id: response.id, icon_url: response.icon_url, title: response.title}}, true)

      opts = $.extend({}, defaults, this.props.opts.DocumentEditor)
      this.uploader = new qq.FineUploader opts

  # Dont ever update, as we dont need to. When the state is reset with uploaded image src, we just redraw
  shouldComponentUpdate: () -> false
  componentWillUnmount: () ->
    # Try our best to get rid of FineUploader
    this.uploader = null
    container = this.getDOMNode()
    while (container.lastChild)
      container.removeChild(container.lastChild)

  render: ->
    `(
      <div>
        { (this.props.block.data.title.length > 0) ? <DocumentPreviewer block={this.props.block} /> : <div ref='fineuploader'></div>}
      </div>
    )`

module.exports = DocumentEditor

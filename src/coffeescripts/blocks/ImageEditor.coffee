`/** @jsx React.DOM */`

require("script!../../../vendor/jquery.fineuploader-4.0.3.js")

ImagePreviewer = require("./ImagePreviewer")

# TODO figure out best way to pass in config parameters, like upload endpoints, etc
ImageEditor = React.createClass
  componentDidMount: () ->
    if this.refs?.fineuploader?
      node = this.refs.fineuploader.getDOMNode()

      defaults =
        element: node
        debug: false
        request:
          inputName: 'asset'
          endpoint: 'http://bsg.mil/upload_image'
          params: {}
        validation:
          acceptFiles: ["image/jpeg", "image/png", "image/gif"]
          allowedExtensions: ["gif", "jpg", "jpeg", "png"]
          sizeLimit: 5000000
        deleteFile:
          enabled: false
          method: "DELETE"
          endpoint: "http://bsg.mil/delete_uploaded_image"
          params: {}
        retry:
          enableAuto: true
        resume:
          enabled: false
        callbacks:
          onComplete: (id, name, response) =>
            if (response.success)
              this.props.handleChange({id: this.props.block.id, data: {src: response.url, id: response.id}}, true)

      opts = $.extend({}, defaults, this.props.opts.ImageEditor)
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
        { (this.props.block.data.src.length > 0) ? <ImagePreviewer block={this.props.block} /> : <div ref='fineuploader'></div>}
      </div>
    )`

module.exports = ImageEditor
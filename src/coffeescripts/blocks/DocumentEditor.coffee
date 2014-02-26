###* @jsx React.DOM ###

require("script!../../../vendor/jquery.fineuploader-4.0.3.js")

DocumentPreviewer = require("./DocumentPreviewer")

qqTemplate = """
  <script type="text/template" id="qq-template-document">
      <div class="qq-uploader-selector qq-uploader">
          <div class="qq-upload-drop-area-selector qq-upload-drop-area" qq-hide-dropzone>
              <span>Drop files here to upload</span>
          </div>
          <div class="qq-upload-button-selector qq-upload-button">
              <div>or choose file</div>
          </div>
          <span class="qq-drop-processing-selector qq-drop-processing">
              <span>Processing dropped files...</span>
              <span class="qq-drop-processing-spinner-selector qq-drop-processing-spinner"></span>
          </span>
          <ul class="qq-upload-list-selector qq-upload-list">
              <li>
                  <div class="qq-progress-bar-container-selector">
                      <div class="qq-progress-bar-selector qq-progress-bar"></div>
                  </div>
                  <span class="qq-upload-spinner-selector qq-upload-spinner"></span>
                  <img class="qq-thumbnail-selector" qq-max-size="100" qq-server-scale>
                  <span class="qq-edit-filename-icon-selector qq-edit-filename-icon"></span>
                  <span class="qq-upload-file-selector qq-upload-file"></span>
                  <input class="qq-edit-filename-selector qq-edit-filename" tabindex="0" type="text">
                  <span class="qq-upload-size-selector qq-upload-size"></span>
                  <a class="qq-upload-cancel-selector qq-upload-cancel" href="#">Cancel</a>
                  <a class="qq-upload-retry-selector qq-upload-retry" href="#">Retry</a>
                  <a class="qq-upload-delete-selector qq-upload-delete" href="#">Delete</a>
                  <span class="qq-upload-status-text-selector qq-upload-status-text"></span>
              </li>
          </ul>
      </div>
  </script>
"""

# TODO figure out best way to pass in config parameters, like upload endpoints, etc
DocumentEditor = React.createClass
  displayName: "DocumentEditor"
  componentDidMount: () ->
    if $("#qq-template-document").length == 0
      $("body").append(qqTemplate)
    if this.refs?.fineuploader?
      node = this.refs.fineuploader.getDOMNode()

      defaults =
        element: node
        template: "qq-template-document"
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

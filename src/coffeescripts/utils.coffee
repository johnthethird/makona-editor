TextEditor        = require("./blocks/TextEditor")
TextPreviewer     = require("./blocks/TextPreviewer")
MarkdownEditor    = require("./blocks/MarkdownEditor")
MarkdownPreviewer = require("./blocks/MarkdownPreviewer")
CodeEditor        = require("./blocks/CodeEditor")
CodePreviewer     = require("./blocks/CodePreviewer")
QuoteEditor       = require("./blocks/QuoteEditor")
QuotePreviewer    = require("./blocks/QuotePreviewer")
ImageEditor       = require("./blocks/ImageEditor")
ImagePreviewer    = require("./blocks/ImagePreviewer")
DocumentEditor    = require("./blocks/DocumentEditor")
DocumentPreviewer = require("./blocks/DocumentPreviewer")

# Leaving this as global for now. Not sure how configurable it should be.
BLOCK_REGISTRY = {
  "text":
    editorClass: TextEditor
    previewClass: TextPreviewer
    editable: true
    newBlockData:
      text: "New text block..."
  "markdown":
    editorClass: MarkdownEditor
    previewClass: MarkdownPreviewer
    editable: true
    newBlockData:
      text: "#New MD block..."
  "quote":
    editorClass: QuoteEditor
    previewClass: QuotePreviewer
    editable: true
    newBlockData:
      text: "new quote"
      cite: "a person"
  "code":
    editorClass: CodeEditor
    previewClass: CodePreviewer
    editable: true
    newBlockData:
      text: "new code"
  "image":
    editorClass: ImageEditor
    previewClass: ImagePreviewer
    editable: false
    newBlockData:
      src: ""
  "document":
    editorClass: DocumentEditor
    previewClass: DocumentPreviewer
    editable: false
    newBlockData:
      title: ""
}

Utils =
  defaultBlock:
    mode: 'preview'
    data: {}

  newBlock: (type) ->
    _.extend {}, @defaultBlock, {type: type, data: @blockTypeFromRegistry(type).newBlockData}

  blockFromId: (blocks, id) ->
    _.findWhere(blocks, {id: parseInt(id,10)})

  blockTypeFromRegistry: (type) ->
    BLOCK_REGISTRY[type]


module.exports = Utils


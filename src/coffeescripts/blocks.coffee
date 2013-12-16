# Leaving this for now. Not sure how configurable it should be.
BLOCK_REGISTRY = [
  type: "unknown"
  previewClass: require("./blocks/UnknownPreviewer")
  editable: false
  createable: false
  data: {}
,
  type: "text"
  sort: 1
  displayName: "Text"
  icon: '\x62'
  editorClass: require("./blocks/TextEditor")
  previewClass: require("./blocks/TextPreviewer")
  editable: true
  createable: true
  data:
    text: "New text block..."
,
  type: "html"
  sort: 1
  displayName: "HTML"
  icon: '\ue036'
  editorClass: require("./blocks/HtmlEditor")
  previewClass: require("./blocks/HtmlPreviewer")
  editable: true
  createable: true
  data:
    text: "Raw HTML code here..."
,
  type: "markdown"
  sort: 2
  displayName: 'Markdown'
  icon: '\x68'
  editorClass: require("./blocks/MarkdownEditor")
  previewClass: require("./blocks/MarkdownPreviewer")
  editable: true
  createable: true
  data:
    text: "#New MD block..."
,
  type: "quote"
  sort: 3
  displayName: 'Quote'
  icon: '\x7b'
  editorClass: require("./blocks/QuoteEditor")
  previewClass: require("./blocks/QuotePreviewer")
  editable: true
  createable: true
  data:
    text: "new quote"
    cite: "a person"
,
  type: "code"
  sort: 4
  displayName: "Code"
  icon: '\ue038'
  editorClass: require("./blocks/CodeEditor")
  previewClass: require("./blocks/CodePreviewer")
  editable: true
  createable: true
  data:
    text: "new code"
,
  type: "image"
  sort: 5
  displayName: "Image"
  icon: '\ue005'
  editorClass: require("./blocks/ImageEditor")
  previewClass: require("./blocks/ImagePreviewer")
  editable: true
  createable: true
  data:
    src: ""
,
  type: "document"
  sort: 6
  displayName: "Document"
  icon: '\x69'
  editorClass: require("./blocks/DocumentEditor")
  previewClass: require("./blocks/DocumentPreviewer")
  editable: true
  createable: true
  data:
    title: ""
]

Blocks =
  registry: BLOCK_REGISTRY

  defaultNewBlock:
    mode: 'edit'

  newBlock: (type) ->
    _.extend {}, @defaultNewBlock, _.pick(@blockTypeFromRegistry(type), ['type', 'data'])

  blockFromId: (blocks, id) ->
    _.findWhere(blocks, {id: parseInt(id,10)})

  blockTypeFromRegistry: (type) ->
    _.findWhere(@registry, {type: type}) || _.findWhere(@registry, {type: 'unknown'})

  createableBlockTypes: _.memoize () ->
    _.filter @registry, (val) -> val.createable

  isEditable: (type) ->
    _.findWhere(@registry, {type: type}).editable


module.exports = Blocks


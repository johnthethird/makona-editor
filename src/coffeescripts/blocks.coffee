# Leaving this for now. Not sure how configurable it should be.
BLOCK_REGISTRY = [
  type: "unknown"
  previewClass: require("./blocks/UnknownPreviewer")
  editable: false
  createable: false
  data: {}
,
  type: "text"
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
  displayName: "HTML"
  icon: '\ue036'
  editorClass: require("./blocks/HtmlEditor")
  previewClass: require("./blocks/HtmlPreviewer")
  editable: true
  createable: true
  data:
    text: "Raw HTML code here..."
,
  type: "javascript"
  displayName: "JavaScript"
  icon: '\ue036'
  editorClass: require("./blocks/JavascriptEditor")
  previewClass: require("./blocks/JavascriptPreviewer")
  editable: true
  createable: true
  data:
    text: "console.log('JS tag');"
,
  type: "markdown"
  displayName: 'Markdown'
  icon: '\x68'
  editorClass: require("./blocks/MarkdownEditor")
  previewClass: require("./blocks/MarkdownPreviewer")
  editable: true
  createable: true
  data:
    text: "# Heading\nText block..\n"
,
  type: "quote"
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
  displayName: "Code"
  icon: '\ue038'
  editorClass: require("./blocks/CodeEditor")
  previewClass: require("./blocks/CodePreviewer")
  editable: true
  createable: true
  data:
    lang: 'javascript'
    text: "function doSomething(x) {\n  doImportant();\n};"
,
  type: "image"
  displayName: "Image"
  icon: '\ue005'
  editorClass: require("./blocks/ImageEditor")
  previewClass: require("./blocks/ImagePreviewer")
  editable: false
  createable: true
  data:
    src: ""
,
  type: "document"
  displayName: "Document"
  icon: '\x69'
  editorClass: require("./blocks/DocumentEditor")
  previewClass: require("./blocks/DocumentPreviewer")
  editable: false
  createable: true
  data:
    title: ""
,
  type: "screencast"
  displayName: "Screencast"
  icon: '\ue00e'
  editorClass: require("./blocks/ScreencastEditor")
  previewClass: require("./blocks/ScreencastPreviewer")
  editable: false
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

  # Pass in array of types that you want visible in the Add Block toolbar, or nothing for all of them.
  createableBlockTypes: _.memoize (types) ->
    blocks = _.filter(@registry, (blk) -> blk.createable)
    if types?
      blocks = _.filter(blocks, (blk) -> _.include(types, blk.type))
      # Use the sort order of the passed-in types
      blocks = _.map(types, (t) -> _.findWhere(blocks, {type: t}))
    blocks

  isEditable: (type) ->
    _.findWhere(@registry, {type: type}).editable


module.exports = Blocks

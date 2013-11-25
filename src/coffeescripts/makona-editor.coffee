`/** @jsx React.DOM */`

# Makona will be exposed on window, and be the main entry point to the editor from the outside
class Makona
  constructor: (opts) ->
    # Delete the textarea node, save the name, and replace it with a div. The Raw component will
    # create a textarea with that name.
    opts.node_name = $("##{opts.node_id}").attr("name")
    $("##{opts.node_id}").replaceWith("<div id='#{opts.node_id}' class='makona-editor'></div>")
    React.renderComponent (MakonaEditor {opts: opts}), document.getElementById(opts.node_id)


TextEditor = require("./blocks/TextEditor")
TextDisplay = require("./blocks/TextDisplay")
MarkdownEditor = require("./blocks/MarkdownEditor")
MarkdownDisplay = require("./blocks/MarkdownDisplay")
CodeEditor = require("./blocks/CodeEditor")
CodeDisplay = require("./blocks/CodeDisplay")
QuoteEditor = require("./blocks/QuoteEditor")
QuoteDisplay = require("./blocks/QuoteDisplay")
ImageEditor = require("./blocks/ImageEditor")
ImageDisplay = require("./blocks/ImageDisplay")
DocumentEditor = require("./blocks/DocumentEditor")
DocumentDisplay = require("./blocks/DocumentDisplay")


MakonaEditor = React.createClass
  loadBlocksFromServer: () ->
    $.ajax
      url: this.props.opts.url
      success: (blocks) => this.setState({blocks: blocks})

  getInitialState: () -> blocks: []

  componentWillMount: () ->
    this.loadBlocksFromServer()

  componentDidMount: () ->
    $(this.getDOMNode()).on "addRow", (e, position, block) =>
      e.preventDefault()
      this.handleAddRow(position, block)

  handleAddRow: (position, block) ->
    block.id = _.max(this.state.blocks, "id").id + 1
    block.position = position + 0.5
    newBlocks = this.resortBlocks(this.state.blocks.concat(block))
    this.setState({blocks: newBlocks})

  handleChange: (changedBlock, replaceFlag) ->
    newBlocks = this.state.blocks.map (block) ->
      block.data = changedBlock.data if block.id is changedBlock.id
      block
    if replaceFlag is true
      this.replaceState({blocks: []})
      this.replaceState({blocks: newBlocks})
    else
      this.setState({blocks: newBlocks})

  handleDelete: (id) ->
    newBlocks = _.reject this.state.blocks, (block) -> block.id is id
    this.replaceState({blocks: newBlocks})

  handleReorder: (sortedBlocks) ->
    this.replaceState({blocks: []})
    this.replaceState({blocks: sortedBlocks})

  # To add a block we add at position x+0.5, then sort by position, and loop through and reset the position counter
  resortBlocks: (blocks) ->
    i = 0
    _.sortBy(blocks, "position").map (b, i) -> (b.position = i++; b)

  render: ->
    `(
      <div className='mk-editor'>
        <h1>Makona Editor</h1>
        <MakonaSortableList
          blocks={this.state.blocks}
          opts={this.props.opts}
          handleReorder={this.handleReorder}
          handleChange={this.handleChange}
          handleDelete={this.handleDelete}
        />
        <hr />
        <MakonaPreviewList blocks={this.state.blocks} opts={this.props.opts} />
        <hr />
        <MakonaRaw blocks={this.state.blocks} opts={this.props.opts}/>
      </div>
    )`

MakonaPreviewList = React.createClass
  componentDidMount: () ->
    this.renderRows()

  componentDidUpdate: () ->
    this.renderRows()

  renderRows: ->
    this.props.blocks.map (block) ->
     `React.renderComponent(<MakonaDisplayRow block={block} opts={this.props.opts} />, this.refs['preview' + block.id].getDOMNode())`
    , this

  render: ->
    `(
      <ol className="mk-preview" ref='preview'>
        {this.props.blocks.map(
          function(block){
            return (
              <li key={"kp"+block.id} data-position={block.position}>
                <div className={"mk-block mk-block-"+block.type} ref={"preview"+block.id}>
                  *Row gets rendered in here*
                </div>
              </li>
            )
          }.bind(this)
        )}
      </ol>
    )`


MakonaSortableList = React.createClass
  componentDidMount: () ->
    $(this.refs.sortable.getDOMNode()).sortable
      update: (event, ui) =>
        sortedBlocks = []
        $(this.refs.sortable.getDOMNode()).find(">li").map (i, el) =>
          theBlock = _.findWhere(this.props.blocks, {id: parseInt(el.id,10)})
          theBlock.position = i
          sortedBlocks.push(theBlock)
        this.props.handleReorder(sortedBlocks)

  handleDelete: (e) ->
    id = $(e.target).data("id")
    this.props.handleDelete(id)

  render: ->
    `(
      <ol className="mk-edit" ref='sortable'>
        {this.props.blocks.map(
          function(block){
            return (
              <li className="Bfc" id={block.id} key={"ks"+block.id} data-position={block.position}>
                <div className={"mk-block mk-block-"+block.type} ref={"editor"+block.id}>
                  <MakonaEditorRow block={block} opts={this.props.opts} handleChange={this.props.handleChange} />
                </div>
                <div className="mk-block-controls">
                  <i className="fa fa-bars m-r-20" />
                  {(this.props.blocks.length > 1) ?
                    <a href="#" data-id={block.id} onClick={this.handleDelete}>Delete</a> : ""
                  }
                </div>
                <div className='clear'></div>
                <MakonaPlusRow block={block} opts={this.props.opts} />
              </li>
            )
          }.bind(this)
        )}
      </ol>
    )`

MakonaEditorRow = React.createClass
  render: ->
    `BLOCK_REGISTRY[this.props.block.type].editorClass({block: this.props.block, opts: this.props.opts, handleChange: this.props.handleChange})`

MakonaDisplayRow = React.createClass
  render: ->
    `BLOCK_REGISTRY[this.props.block.type].previewClass({block: this.props.block, opts: this.props.opts})`

MakonaPlusRow = React.createClass
  addRow: (e, reactid) ->
    type = $("[data-reactid='#{reactid}'").data("type")
    newBlock = {type: type, data: BLOCK_REGISTRY[type].newBlockData}
    $(this.getDOMNode()).trigger("addRow", [this.props.block.position, newBlock])

  render: ->
    `(
      <div className="mk-plus">
        <i className="fa fa-plus size-huge" />
        <a href="#" onClick={this.addRow} data-type="text">Text</a>
        <a href="#" onClick={this.addRow} data-type="markdown">Markdown</a>
        <a href="#" onClick={this.addRow} data-type="quote">Quote</a>
        <a href="#" onClick={this.addRow} data-type="code">Code</a>
        <a href="#" onClick={this.addRow} data-type="document">Doc</a>
        <a href="#" onClick={this.addRow} data-type="image">Image</a>

      </div>
    )`

MakonaRaw = React.createClass
  render: ->
    `<textarea name={this.props.opts.node_name} value={JSON.stringify(this.props.blocks)}></textarea>`

# Leaving this as global for now. Not sure how configurable it should be.
BLOCK_REGISTRY = {
  text:
    editorClass: TextEditor
    previewClass: TextDisplay
    newBlockData:
      text: "New text block..."
  markdown:
    editorClass: MarkdownEditor
    previewClass: MarkdownDisplay
    newBlockData:
      text: "#New MD block..."
  quote:
    editorClass: QuoteEditor
    previewClass: QuoteDisplay
    newBlockData:
      text: "new quote"
      cite: "a person"
  code:
    editorClass: CodeEditor
    previewClass: CodeDisplay
    newBlockData:
      text: "new code"
  image:
    editorClass: ImageEditor
    previewClass: ImageDisplay
    newBlockData:
      src: ""
  document:
    editorClass: DocumentEditor
    previewClass: DocumentDisplay
    newBlockData:
      title: ""
}

module.exports = window.Makona = Makona

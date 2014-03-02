###* @jsx React.DOM ###

require("script!jquery/jquery.min.js")

# TODO Sortable
# Either make a React-native drag-n-drop sortable solution, or swap jQuery UI out for
# something else. Note that this is probably going to be challenging. A React-native
# solution would also allow us to excise jQuery itself out of Makona, which would be nice.
#
# This one works fairly well but touch events dont seem to be working for mobile
# http://johnny.github.io/jquery-sortable/
# require("script!jquery-sortable.js")
#
# This one seems nice as well, but depends on jQuery
# https://github.com/dbushell/Nestable

# So, for now, stick with jQuery UI
require("script!jquery-ui/ui/minified/jquery.ui.core.min.js")
require("script!jquery-ui/ui/minified/jquery.ui.widget.min.js")
require("script!jquery-ui/ui/minified/jquery.ui.mouse.min.js")
require("script!jquery-ui/ui/minified/jquery.ui.position.min.js")
require("script!jquery-ui/ui/minified/jquery.ui.draggable.min.js")
require("script!jquery-ui/ui/minified/jquery.ui.droppable.min.js")
require("script!jquery-ui/ui/minified/jquery.ui.sortable.min.js")

# Makes sortable work on touch devices
require("script!jquery-ui-touch-punch.min.js")

# Used to put caret at the end of the textarea
require("script!jquery-caret.min.js")

# Mainly for some quick prototyping. Once we get where we are going we can probably get rid of this dependency
require("script!lodash/dist/lodash.compat.min.js")

# Bring in React as a Bower component, not an npm module (so we dont have to build it from scratch)
#require("script!react/react-with-addons.js")


# Makona will be exposed on window, and be the main entry point to the editor from the outside
class Makona
  constructor: (opts) ->
    # Delete the textarea node, save the name, and replace it with a div. The Raw component will
    # create a textarea with that name.
    opts.node_name = $("##{opts.nodeId}").attr("name")
    opts.html_node_name = $("##{opts.nodeId}").data("output-html")
    opts.blocks ||= JSON.parse($("##{opts.nodeId}").val())
    $("##{opts.nodeId}").replaceWith("<div id='#{opts.nodeId}' class='makona-editor'></div>")
    React.renderComponent (MakonaEditor {opts: opts}), document.getElementById(opts.nodeId)

Blocks = require("./blocks")

MakonaEditor = React.createClass
  displayName: "MakonaEditor"
  getInitialState: () ->
    blocks: _(this.props.opts.blocks)
            .map((block) -> $.extend({}, {mode: 'preview'}, block))
            .sortBy("position")
            .value()

  handleAddRow: (position, block) ->
    block.id = _.max(this.state.blocks, "id").id + 1
    block.position = position + 0.5
    newBlocks = this.resortBlocks(this.state.blocks.concat(block))
    this.setState({blocks: newBlocks})

  handleChange: (changedBlock, replaceFlag) ->
    newBlocks = this.state.blocks.map (block) ->
      newBlock = _.cloneDeep(block)
      # Merge in the changed block to what we already have, so blocks dont have to send all properties
      $.extend(newBlock.data, changedBlock.data) if newBlock.id is changedBlock.id
      newBlock
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
      <div>
        <MakonaSortableList
          blocks={this.state.blocks}
          opts={this.props.opts}
          handleReorder={this.handleReorder}
          handleChange={this.handleChange}
          handleDelete={this.handleDelete}
          handleAddRow={this.handleAddRow}
        />
        <MakonaRaw blocks={this.state.blocks} opts={this.props.opts}/>
      </div>
    )`


MakonaSortableList = React.createClass
  displayName: "SortableList"
  componentDidMount: () ->
    $(this.refs.sortable.getDOMNode()).sortable
      containment: "parent"
      handle: "[data-behavior='handle']"
      update: (event, ui) =>
        sortedBlocks = []
        $(this.refs.sortable.getDOMNode()).find(">li").map (i, el) =>
          theBlock = _.findWhere(this.props.blocks, {id: parseInt(el.id,10)})
          theBlock.position = i
          sortedBlocks.push(theBlock)
        this.props.handleReorder(sortedBlocks)

  handleEdit: (id, e) ->
    block = Blocks.blockFromId(this.props.blocks, id)
    block = $.extend(block, {mode: 'edit'})
    this.props.handleChange(block)
    # This isnt very React-y
    setTimeout =>
      $(this.refs["editor"+id].getDOMNode()).find("textarea").focus().caretToEnd()
    , 100

  handlePreview: (id, e) ->
    block = Blocks.blockFromId(this.props.blocks, id)
    block = $.extend(block, {mode: 'preview'})
    this.props.handleChange(block)

  # escape key while editing will flip back to preview mode
  handleKeyUp: (id, e) ->
    @handlePreview(id) if e.keyCode is 27

  editStyle: (block) -> {display: if block.mode == 'edit' then 'block' else 'none'}
  previewStyle: (block) -> {display: if !block.mode? || (block.mode == 'preview') then 'block' else 'none'}
  render: ->
    `(
      <ol ref='sortable'>
        {this.props.blocks.map(
          function(block){
            return (
              <li id={block.id} key={"ks"+block.id} data-position={block.position} >
                <div className={"mk-block mk-blocktype-"+block.type+" mk-mode-"+block.mode} >
                  <div className="mk-block-editor" style={this.editStyle(block)} ref={"editor"+block.id} onKeyUp={_.partial(this.handleKeyUp, block.id)} >
                    <MakonaEditorRow block={block} opts={this.props.opts} handleChange={this.props.handleChange} />
                  </div>
                  <div className="mk-block-previewer" style={this.previewStyle(block)} ref={"preview"+block.id} onClick={_.partial(this.handleEdit, block.id)}>
                    <MakonaPreviewerRow block={block} opts={this.props.opts} />
                  </div>
                  <MakonaEditorControls blocks={this.props.blocks} block={block} handleEdit={this.handleEdit} handlePreview={this.handlePreview} handleDelete={this.props.handleDelete} />
                </div>
                <MakonaPlusRow block={block} opts={this.props.opts} handleAddRow={this.props.handleAddRow} />
              </li>
            )
          }.bind(this)
        )}
      </ol>
    )`

MakonaEditorControls = React.createClass
  displayName: "EditorControls"
  getInitialState: () ->
    confirming: false

  handleConfirmDelete: () ->
    if this.state.confirming
      this.setState({confirming: false})
      this.props.handleDelete(this.props.block.id)
    else
      this.setState({confirming: true})

  handleAbortDelete: () -> this.setState({confirming: false})

  render: ->
    block = this.props.block
    editStyle = {display: if (block.mode is 'edit' || !Blocks.blockTypeFromRegistry(block.type).editable) then 'none' else 'inline-block'}
    previewStyle = {display: if (block.mode is 'preview' || !Blocks.blockTypeFromRegistry(block.type).editable) then 'none' else 'inline-block'}
    if this.state.confirming
      `(
        <div className="mk-block-controls">
          <div className="mk-edit-controls">
            <div className="mk-delete-confirm">Delete?</div>
            <a href="javascript:void(0);" onClick={this.handleConfirmDelete}><div data-icon="&#x4e;"></div></a>
            <a href="javascript:void(0);" onClick={this.handleAbortDelete}><div data-icon="&#x4d;"></div></a>
          </div>
        </div>
      )`
    else
      `(
        <div className="mk-block-controls">
          <div className="mk-edit-controls">
            {(this.props.blocks.length > 1) ?
              <a href="javascript:void(0);" onClick={this.handleConfirmDelete}><div data-icon="&#xe019;"></div></a> : ""
            }
            <a href="javascript:void(0);" style={editStyle} onClick={_.partial(this.props.handleEdit, block.id)}><div data-icon="&#x6b;"></div></a>
            <a href="javascript:void(0);" style={previewStyle} onClick={_.partial(this.props.handlePreview, block.id)}><div data-icon="&#x6c;"></div></a>
            <div className="mk-handle" data-behavior="handle" data-icon="&#x61;"></div>
          </div>
        </div>
      )`


MakonaEditorRow = React.createClass
  displayName: "EditorRow"
  render: ->
    React.DOM.div(null, this.transferPropsTo(Blocks.blockTypeFromRegistry(this.props.block.type).editorClass(null)))

MakonaPreviewerRow = React.createClass
  displayName: "PreviewerRow"
  render: ->
    React.DOM.div(null, this.transferPropsTo(Blocks.blockTypeFromRegistry(this.props.block.type).previewClass(null)))

MakonaPlusRow = React.createClass
  displayName: "PlusRow"
  getInitialState: () ->
    hideLinks: true

  handleAddRow: (type, e) ->
    newBlock = Blocks.newBlock(type)
    this.props.handleAddRow this.props.block.position, newBlock
    this.setState {'hideLinks': true}

  handleClick: () ->
    this.setState {'hideLinks': !this.state.hideLinks}

  toggleLinks: () ->
    this.setState {'hideLinks': !this.state.hideLinks}

  blockTypeLink: (block) ->
    `<a href="javascript: void(0);" key={block.type} onClick={this.handleAddRow.bind(this, block.type)}>
      <div className="mk-icon" data-icon={block.icon}></div>
      <div>{block.displayName}</div>
     </a>`

  blockTypes: () ->
    _.map Blocks.createableBlockTypes(this.props.opts.createableBlockTypes), (block) => @blockTypeLink block

  render: ->
    links_style = {display: if this.state.hideLinks then 'none' else 'block'}
    plus_style = {display: if this.state.hideLinks then 'block' else 'none'}
    `<div className="mk-plus" onClick={this.handleClick}>
        <a className="mk-plus-add" style={plus_style} href="javascript:void(0);" onClick={this.toggleLinks}>+</a>
        <div className="mk-plus-links" style={links_style}>
          {this.blockTypes()}
        </div>
      </div>`

MakonaRaw = React.createClass
  displayName: "MakonaRaw"
  render: ->
    ary = [React.DOM.textarea( {className:"mk-raw", readOnly: true, name:this.props.opts.node_name, value:JSON.stringify(this.props.blocks, null, 2)})]
    if this.props.opts.html_node_name
      html = React.renderComponentToString(MakonaPreviewList({blocks: this.props.blocks, opts: this.props.opts}))
      ary.push React.DOM.textarea( {className:"mk-raw", readOnly: true, name:this.props.opts.html_node_name, value:html} )
    React.DOM.div(null, ary...)

MakonaRawPre = React.createClass
  displayName: "MakonaRawPre"
  render: ->
    `<pre name={this.props.opts.node_name}>{JSON.stringify(this.props.blocks, null, 2)}</pre>`


# Not sure we need this
MakonaPreviewList = React.createClass
  displayName: "MakonaPreviewList"
  render: ->
    `<ol className="mk-previewer-list">
        {this.props.blocks.map(
          function(block){
            return (
              <li key={"kp"+block.id} data-position={block.position}>
                <div className={"mk-block mk-blocktype-"+block.type} >
                  <div className="mk-block-previewer">
                    <MakonaPreviewerRow block={block} opts={this.props.opts} />
                  </div>
                </div>
              </li>
            )
          }.bind(this)
        )}
      </ol>`

module.exports = window.Makona = Makona

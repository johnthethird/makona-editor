###* @jsx React.DOM ###

# Makona expects to have React and jQuery/jQuery-UI Sortable already loaded on the page.
throw new Error("Makona requires jQuery") unless jQuery?
throw new Error("Makona requires jQuery UI Sortable") unless jQuery.ui? && jQuery.ui.sortable?
throw new Error("Makona requires React") unless React?


##############################
### Includes and Constants ###
##############################

# Global Requires
require("script!jquery-ui-touch-punch.min.js") # Makes sortable work on touch devices
require("script!jquery-caret.js") # Used to put caret at the end of the textarea

# TODO someday figure out if its worth it to load these as modules instead of globals.
require("script!lodash")
require("script!mousetrap")
require("script!postal")

Blocks            = require("./blocks")
Channel           = postal.channel("makona")
KeyboardShortcuts = require("./tags/KeyboardShortcuts")


# Makona will be exposed on window, and be the main entry point to the editor from the outside
class Makona
  constructor: (opts) ->
    # Delete the textarea node, save the name, and replace it with a div. The Raw component will
    # create a textarea with that name.
    $node = $("##{opts.nodeId}")
    # name of the form textarea that will be submitted that contains the JSON data
    opts.node_name ||= $node.attr("name")
    # name of the form textarea that will be submitted that contains the rendered HTML data
    opts.rendered_output_name ||= $node.data("rendered-output-name")
    opts.blocks ||= JSON.parse($node.val())
    $node.replaceWith("<div id='#{opts.nodeId}' class='makona-editor'></div>")
    React.render `<MakonaEditor opts={opts}/>`, document.getElementById(opts.nodeId)


MakonaEditor = React.createClass


  ##############################
  ### Includes and Constants ###
  ##############################
  displayName: "MakonaEditor"

  getInitialState: () ->
    blocks = _(this.props.opts.blocks).
      map((block) -> $.extend({}, {mode: 'preview', focus: false}, block)).
      sortBy("position").
      value()
    blocks[0].focus = true
    blocks: blocks


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `(
      <div>
        <KeyboardShortcuts blocks={this.state.blocks} />
        <MakonaSortableList
          blocks={this.state.blocks}
          opts={this.props.opts}
        />
        <MakonaRaw blocks={this.state.blocks} opts={this.props.opts}/>
      </div>
    )`


  ##############################
  ### Life Cycle             ###
  ##############################
  # componentWillMount
  # componentWillReceiveProps
  # shouldComponentUpdate
  # componentWillUpdate
  # componentDidUpdate
  # componentWillUnmount

  componentDidMount: () ->
    # Subscribe to events
    Channel.subscribe "#", (data, envelope) -> console.log envelope
    Channel.subscribe "block.change", (data) => @handleChange(data.block || data.blocks)
    Channel.subscribe "block.delete", (data) => @handleDelete(data.block)
    Channel.subscribe "block.add",    (data) => @handleAddRow(data.block, data.position)
    Channel.subscribe "block.reorder",(data) => @handleReorder(data.blocks)


  ##############################
  ### Custom Methods         ###
  ##############################

  handleAddRow: (addedBlock, position) ->
    addedBlock.id = _.max(this.state.blocks, "id").id + 1
    addedBlock.position = position + 0.5
    addedBlock.focus = true
    newBlocks = this.resortBlocks(this.state.blocks.concat(addedBlock))
    this.setState {blocks: newBlocks}
    Channel.publish "block.caret", {block: addedBlock}

  handleChange: (changedBlocks) ->
    changedBlocks = [].concat(changedBlocks) #ensure its always an array
    newBlocks = this.state.blocks.map (block) ->
      newBlock = _.cloneDeep(block)
      # Merge in the changed block to what we already have, so blocks dont have to send all properties
      if changedBlock = _.findWhere(changedBlocks, {id: newBlock.id})
        $.extend(newBlock, changedBlock) if newBlock.id is changedBlock.id
      newBlock
    this.setState({blocks: newBlocks})

  handleDelete: (deletedBlock) ->
    newBlocks = _.reject this.state.blocks, (block) -> block.id is deletedBlock.id
    this.replaceState({blocks: newBlocks})

  handleReorder: (sortedBlocks) ->
    # Reset the position prop based on the new order
    _.each(sortedBlocks, (b,i) -> b.position = i)
    this.setState({blocks: sortedBlocks})

  # To add a block we add at position x+0.5, then sort by position, and loop through and reset the position counter
  resortBlocks: (blocks) ->
    i = 0
    _.sortBy(blocks, "position").map (b, i) -> (b.position = i++; b)


MakonaSortableList = React.createClass
  displayName: "SortableList"
  propTypes:
    blocks: React.PropTypes.array.isRequired

  componentDidMount: () ->
    $(this.refs.sortable.getDOMNode()).sortable
      containment: "parent"
      handle: "[data-behavior='handle']"
      stop: (event, ui) =>
        $el = $(this.refs.sortable.getDOMNode())
        # Get the new order from the sortable component, which gives us the dom ids "mk-sortable-2", and we turn those into integers
        newOrder = _.map($el.sortable("toArray"), (name) -> +name.match(/\d+$/)[0])
        # Prevent sortable from changing the DOM
        $el.sortable("cancel")
        sortedBlocks = this.props.blocks.sort (a,b) -> newOrder.indexOf(a.id) - newOrder.indexOf(b.id)
        Channel.publish "block.reorder", {blocks: sortedBlocks}

  render: ->
    `(
      <ol ref='sortable'>
        {this.props.blocks.map(
          function(block){
            return <MakonaSortableItem key={block.id} opts={this.props.opts} block={block} />
          }.bind(this)
        )}
      </ol>
    )`



MakonaSortableItem = React.createClass
  displayName: "SortableItem"
  propTypes:
    block: React.PropTypes.object.isRequired
    opts: React.PropTypes.object.isRequired

  componentDidMount: ->
    Channel.subscribe "block.caret",  (data) => @handleCaret()

  componentDidUpdate: ->
    Channel.publish "block.caret", @props.block

  handleCaret: () ->
    # console.log
    # if @props.block.mode is 'edit'
    #   node = $(@getDOMNode()).find('textarea')
    #   console.log node.is(':focus')
    #   # if !node.is(':focus')
    #     # node.focus().caretToEnd()

  handleEdit: (e) ->
    newBlock = _.extend({}, this.props.block, {mode: 'edit'})
    Channel.publish "block.change", {block: newBlock}
    Channel.publish "block.caret",  {block: newBlock}

  handlePreview: (e) ->
    newBlock = _.extend({}, this.props.block, {mode: 'preview'})
    Channel.publish "block.change", {block: newBlock}

  render: ->
    block = this.props.block
    editStyle = {display: if block.mode is 'edit' then 'block' else 'none'}
    previewStyle = {display: if block.mode is 'preview' then 'block' else 'none'}
    `(
      <li className={block.focus ? 'mk-focus' : ''} id={"mk-sortable-"+block.id} >
        <div className={"mk-block mk-blocktype-"+block.type+" mk-mode-"+block.mode} >
          <div className="mk-block-editor" style={editStyle} ref={"editor"+block.id} onKeyUp={this.handleKeyUp} >
            <MakonaEditorRow block={block} />
          </div>
          <div className="mk-block-previewer" style={previewStyle} ref={"preview"+block.id} onClick={this.handleEdit}>
            <MakonaPreviewerRow block={block} />
          </div>
          <MakonaEditorControls block={block} handleEdit={this.handleEdit} handlePreview={this.handlePreview} />
        </div>
        <MakonaPlusRow block={block} opts={this.props.opts} />
      </li>
    )`

MakonaEditorControls = React.createClass
  displayName: "EditorControls"
  propTypes:
    block: React.PropTypes.object.isRequired

  getInitialState: () ->
    confirming: false

  handleConfirmDelete: () ->
    if this.state.confirming
      this.setState({confirming: false})
      Channel.publish "block.delete", {block: this.props.block}
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
            <a href="javascript:void(0);" onClick={this.handleConfirmDelete}><div data-icon="&#xe019;"></div></a>
            <a href="javascript:void(0);" style={editStyle} onClick={this.props.handleEdit}><div data-icon="&#x6b;"></div></a>
            <a href="javascript:void(0);" style={previewStyle} onClick={this.props.handlePreview}><div data-icon="&#x6c;"></div></a>
            <div className="mk-handle" data-behavior="handle" data-icon="&#x61;"></div>
          </div>
        </div>
      )`


MakonaEditorRow = React.createClass
  displayName: "EditorRow"
  render: ->
    comp = Blocks.blockTypeFromRegistry(this.props.block.type).editorClass
    React.createElement("div", {}, React.createElement(comp, this.props))

MakonaPreviewerRow = React.createClass
  displayName: "PreviewerRow"
  render: ->
    comp = Blocks.blockTypeFromRegistry(this.props.block.type).previewClass
    React.createElement("div", {}, React.createElement(comp, this.props))

MakonaPlusRow = React.createClass
  displayName: "PlusRow"
  propTypes:
    block: React.PropTypes.object.isRequired
    opts: React.PropTypes.object.isRequired

  getInitialState: () ->
    hideLinks: true

  handleAddRow: (type, e) ->
    newBlock = Blocks.newBlock(type)
    Channel.publish "block.add", {block: newBlock, position: this.props.block.position}
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
    `(
      <div className="mk-plus" onClick={this.handleClick}>
        <a className="mk-plus-add" style={plus_style} href="javascript:void(0);" onClick={this.toggleLinks}>+</a>
        <div className="mk-plus-links" style={links_style}>
          {this.blockTypes()}
        </div>
      </div>
    )`

# Puts a textarea on the page with the rendered html ready to be submitted with the form.
# (Only if props.opts.rendered_output_name is given)
MakonaRaw = React.createClass
  displayName: "MakonaRaw"
  propTypes:
    blocks: React.PropTypes.array.isRequired
    opts: React.PropTypes.object.isRequired

  render: ->
    ary = [React.DOM.textarea( {className:"mk-raw", readOnly: true, name:this.props.opts.node_name, value:JSON.stringify(this.props.blocks, null, 2)})]
    if this.props.opts.rendered_output_name?
      comp = React.createElement(MakonaPreviewList, {blocks: this.props.blocks, opts: this.props.opts})
      html = React.renderToStaticMarkup(comp)
      ary.push React.DOM.textarea( {className:"mk-raw", readOnly: true, name:this.props.opts.rendered_output_name, value:html} )
    React.DOM.div(null, ary...)


# This renders the HTML of all the blocks.
MakonaPreviewList = React.createClass
  displayName: "MakonaPreviewList"
  propTypes:
    blocks: React.PropTypes.array.isRequired
    opts: React.PropTypes.object.isRequired
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

# This isnt the right JS module incantation, but whatevs
module.exports = window.Makona = Makona

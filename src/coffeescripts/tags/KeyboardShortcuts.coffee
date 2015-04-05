###* @jsx React.DOM ###

# Setup some global event bindings for keyboard shortcuts, like
# navigating blocks and activating edit mode, etc.
# All communication back to the editor should be through publishing
# on the makona channel

require("mousetrap")
Channel = postal.channel("makona")

KeyboardShortcuts = React.createClass
  displayName: "KeyboardShortcuts"
  propTypes:
    blocks: React.PropTypes.array.isRequired

  componentDidMount: () ->
    Mousetrap.bind 'up',    (e) => @focusPrevious()
    Mousetrap.bind 'down',  (e) => @focusNext()
    Mousetrap.bind 'enter', (e) => @handleEnter()

  focusNext: ->
    curSel = _.findIndex(@props.blocks, {focus: true})
    newBlocks = _.map @props.blocks, (block, i) ->
      block.focus = (i == curSel+1) ? true : false
      block
    Channel.publish "block.change", {blocks: newBlocks}

  focusPrevious: ->
    curSel = _.findIndex(@props.blocks, {focus: true})
    newBlocks = _.map @props.blocks, (block, i) ->
      block.focus = (i == curSel-1) ? true : false
      block
    Channel.publish "block.change", {blocks: newBlocks}

  handleEnter: ->
    newBlock = _.find(@props.blocks, {focus: true})
    newBlock = _.extend(newBlock, {mode: 'edit'})
    Channel.publish "block.change", {block: newBlock}
    Channel.publish "block.caret", {block: newBlock}

  render: -> `<div></div>`

module.exports = KeyboardShortcuts

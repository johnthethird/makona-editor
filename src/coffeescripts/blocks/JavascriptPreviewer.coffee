###* @jsx React.DOM ###

JavascriptPreviewer = React.createClass
  displayName: "JavascriptPreviewer"
  render: ->
    #js = "<script type='text/javascript'>\n\n#{this.props.block.data.text}\n\n</sc" + "ript>"
    js = this.props.block.data.text
    # Dont actually run the JS in preview mode.
    # $("body").append(js);
    `<pre ref='js'>{js}</pre>`

module.exports = JavascriptPreviewer

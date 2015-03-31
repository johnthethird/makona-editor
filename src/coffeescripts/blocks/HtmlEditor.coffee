###* @jsx React.DOM ###

ExpandingTextarea = require("../tags/ExpandingTextarea")

HtmlEditor = React.createClass
  displayName: "HtmlEditor"
  render: ->
          `(<div className="mk-block-content">
             <ExpandingTextarea {...this.props} />
           </div>
          )`

module.exports = HtmlEditor

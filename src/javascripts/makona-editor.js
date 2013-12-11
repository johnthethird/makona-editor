/** @jsx React.DOM */;
var CodeEditor, CodePreviewer, DocumentEditor, DocumentPreviewer, ImageEditor, ImagePreviewer, Makona, MakonaEditor, MakonaEditorRow, MakonaPlusRow, MakonaPreviewList, MakonaPreviewerRow, MakonaRaw, MakonaSortableList, MarkdownEditor, MarkdownPreviewer, QuoteEditor, QuotePreviewer, TextEditor, TextPreviewer, Utils;

require("script!../../bower_components/jquery/jquery.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.core.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.widget.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.mouse.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.position.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.draggable.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.droppable.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.sortable.min.js");

require("script!../../vendor/jquery-ui-touch-punch.min.js");

require("script!../../bower_components/lodash/dist/lodash.min.js");

require("script!../../bower_components/showdown/compressed/showdown.js");

require("script!../../bower_components/react/react-with-addons.min.js");

require("script!../../vendor/prettify.js");

require("script!../../vendor/jquery.fineuploader-4.0.3.js");

Makona = (function() {
  function Makona(opts) {
    opts.node_name = $("#" + opts.node_id).attr("name");
    $("#" + opts.node_id).replaceWith("<div id='" + opts.node_id + "' class='makona-editor'></div>");
    React.renderComponent(MakonaEditor({
      opts: opts
    }), document.getElementById(opts.node_id));
  }

  return Makona;

})();

TextEditor = require("./blocks/TextEditor");

TextPreviewer = require("./blocks/TextPreviewer");

MarkdownEditor = require("./blocks/MarkdownEditor");

MarkdownPreviewer = require("./blocks/MarkdownPreviewer");

CodeEditor = require("./blocks/CodeEditor");

CodePreviewer = require("./blocks/CodePreviewer");

QuoteEditor = require("./blocks/QuoteEditor");

QuotePreviewer = require("./blocks/QuotePreviewer");

ImageEditor = require("./blocks/ImageEditor");

ImagePreviewer = require("./blocks/ImagePreviewer");

DocumentEditor = require("./blocks/DocumentEditor");

DocumentPreviewer = require("./blocks/DocumentPreviewer");

Utils = require("./utils");

MakonaEditor = React.createClass({
  loadBlocksFromServer: function() {
    var _this = this;
    return $.ajax({
      url: this.props.opts.url,
      success: function(blocks) {
        blocks = blocks.map(function(block) {
          return $.extend({}, Utils.defaultBlock, block);
        });
        return _this.setState({
          blocks: blocks
        });
      }
    });
  },
  getInitialState: function() {
    return {
      blocks: []
    };
  },
  componentWillMount: function() {
    return this.loadBlocksFromServer();
  },
  componentDidMount: function() {
    var _this = this;
    return $(this.getDOMNode()).on("addRow", function(e, position, block) {
      e.preventDefault();
      return _this.handleAddRow(position, block);
    });
  },
  handleAddRow: function(position, block) {
    var newBlocks;
    block.id = _.max(this.state.blocks, "id").id + 1;
    block.position = position + 0.5;
    newBlocks = this.resortBlocks(this.state.blocks.concat(block));
    return this.setState({
      blocks: newBlocks
    });
  },
  handleChange: function(changedBlock, replaceFlag) {
    var newBlocks;
    newBlocks = this.state.blocks.map(function(block) {
      if (block.id === changedBlock.id) {
        block.data = changedBlock.data;
      }
      return block;
    });
    if (replaceFlag === true) {
      this.replaceState({
        blocks: []
      });
      return this.replaceState({
        blocks: newBlocks
      });
    } else {
      return this.setState({
        blocks: newBlocks
      });
    }
  },
  handleDelete: function(id) {
    var newBlocks;
    newBlocks = _.reject(this.state.blocks, function(block) {
      return block.id === id;
    });
    return this.replaceState({
      blocks: newBlocks
    });
  },
  handleReorder: function(sortedBlocks) {
    this.replaceState({
      blocks: []
    });
    return this.replaceState({
      blocks: sortedBlocks
    });
  },
  resortBlocks: function(blocks) {
    var i;
    i = 0;
    return _.sortBy(blocks, "position").map(function(b, i) {
      b.position = i++;
      return b;
    });
  },
  render: function() {
    return (
      React.DOM.div( {className:"mk-editor"}, 
        MakonaSortableList(
          {blocks:this.state.blocks,
          opts:this.props.opts,
          handleReorder:this.handleReorder,
          handleChange:this.handleChange,
          handleDelete:this.handleDelete}
        ),
        React.DOM.hr(null ),
        /*<MakonaPreviewList blocks={this.state.blocks} opts={this.props.opts} /> */
        React.DOM.hr(null ),
        MakonaRaw( {blocks:this.state.blocks, opts:this.props.opts})
      )
    );
  }
});

MakonaSortableList = React.createClass({
  componentDidMount: function() {
    var _this = this;
    return $(this.refs.sortable.getDOMNode()).sortable({
      containment: "parent",
      handle: ".handle",
      update: function(event, ui) {
        var sortedBlocks;
        sortedBlocks = [];
        $(_this.refs.sortable.getDOMNode()).find(">li").map(function(i, el) {
          var theBlock;
          theBlock = _.findWhere(_this.props.blocks, {
            id: parseInt(el.id, 10)
          });
          theBlock.position = i;
          return sortedBlocks.push(theBlock);
        });
        return _this.props.handleReorder(sortedBlocks);
      }
    });
  },
  handleDelete: function(id, e) {
    if (confirm("Are you sure you want to delete this block?")) {
      return this.props.handleDelete(id);
    }
  },
  handleEdit: function(id, e) {
    var block;
    block = Utils.blockFromId(this.props.blocks, id);
    block = $.extend(block, {
      mode: 'edit'
    });
    return this.props.handleChange(block);
  },
  handlePreview: function(id, e) {
    var block;
    block = Utils.blockFromId(this.props.blocks, id);
    block = $.extend(block, {
      mode: 'preview'
    });
    return this.props.handleChange(block);
  },
  editClasses: function(id) {
    var block, cx, editClasses;
    block = Utils.blockFromId(this.props.blocks, id);
    cx = React.addons.classSet;
    return editClasses = cx({
      "mk-editor": true,
      "mk-mode-edit": block.mode === 'edit'
    });
  },
  previewClasses: function(id) {
    var block, cx, editClasses;
    block = _.findWhere(this.props.blocks, {
      id: parseInt(id, 10)
    });
    cx = React.addons.classSet;
    return editClasses = cx({
      "mk-previewer": true,
      "mk-mode-preview": (block.mode == null) || (block.mode === 'preview')
    });
  },
  editControls: function(block) {
    var editClasses, previewClasses;
    editClasses = block.mode === 'preview' && Utils.blockTypeFromRegistry(block.type).editable ? "" : "hide";
    previewClasses = block.mode === 'edit' && Utils.blockTypeFromRegistry(block.type).editable ? "" : "hide";
    return (
      React.DOM.div(null, 
        React.DOM.a( {href:"#", className:editClasses, onClick:this.handleEdit.bind(this, block.id)}, React.DOM.span( {'data-icon':"l"})),
        React.DOM.a( {href:"#", className:previewClasses, onClick:this.handlePreview.bind(this, block.id)}, "Preview")
      )
    );
  },
  render: function() {
    return (
      React.DOM.ol( {className:"mk-edit", ref:"sortable"}, 
        this.props.blocks.map(
          function(block){
            return (
              React.DOM.li( {className:"Bfc", id:block.id, key:"ks"+block.id, 'data-position':block.position} , 
                React.DOM.div( {className:"mk-block mk-block-"+block.type}, 
                  React.DOM.div( {className:this.editClasses(block.id), ref:"editor"+block.id, onBlur:this.handlePreview.bind(this, block.id)} , 
                    MakonaEditorRow( {block:block, opts:this.props.opts, handleChange:this.props.handleChange} )
                  ),
                  React.DOM.div( {className:this.previewClasses(block.id), ref:"preview"+block.id, onDoubleClick:this.handleEdit.bind(this, block.id)}, 
                    MakonaPreviewerRow( {block:block, opts:this.props.opts} )
                  )
                ),
                React.DOM.div( {className:"mk-block-controls"}, 
                  React.DOM.span( {className:"handle", 'data-icon':"a"}),
                  this.editControls(block),
                  (this.props.blocks.length > 1) ?
                    React.DOM.a( {href:"#", onClick:this.handleDelete.bind(this, block.id)}, React.DOM.span( {'data-icon':"M"})) : ""
                  
                ),
                React.DOM.div( {className:"clear"}),
                MakonaPlusRow( {block:block, opts:this.props.opts} )
              )
            )
          }.bind(this)
        )
      )
    );
  }
});

MakonaEditorRow = React.createClass({
  render: function() {
    return Utils.blockTypeFromRegistry(this.props.block.type).editorClass({block: this.props.block, opts: this.props.opts, handleChange: this.props.handleChange});
  }
});

MakonaPreviewerRow = React.createClass({
  render: function() {
    return Utils.blockTypeFromRegistry(this.props.block.type).previewClass({block: this.props.block, opts: this.props.opts});
  }
});

MakonaPlusRow = React.createClass({
  getInitialState: function() {
    return {
      hideLinks: true
    };
  },
  addRow: function(e, reactid) {
    var newBlock, type;
    type = $("[data-reactid='" + reactid + "'").data("type");
    newBlock = {
      type: type,
      data: Utils.blockTypeFromRegistry(type).newBlockData
    };
    $(this.getDOMNode()).trigger("addRow", [this.props.block.position, newBlock]);
    return this.setState({
      'hideLinks': true
    });
  },
  toggleLinks: function() {
    return this.setState({
      'hideLinks': !this.state.hideLinks
    });
  },
  blockTypeLink: function(type, name, icon) {
    return React.DOM.a( {href:"javascript: void(0);", onClick:this.addRow, 'data-type':type}, React.DOM.div( {className:"icon", 'data-icon':icon}),React.DOM.div(null, name));
  },
  render: function() {
    var classes;
    classes = React.addons.classSet({
      'mk-plus-links': true,
      'hide': this.state.hideLinks
    });
    return (
      React.DOM.div( {className:"mk-plus"}, 
        React.DOM.a( {href:"javascript:void(0);", onClick:this.toggleLinks}, "Add Block"),
        React.DOM.div( {className:classes}, 
          this.blockTypeLink('text', 'Text', '\x62'),
          this.blockTypeLink('markdown', 'Markdown', '\x68'),
          this.blockTypeLink('quote', 'Quote', '\x7b'),
          this.blockTypeLink('code', 'Code', '\ue038'),
          this.blockTypeLink('document', 'Doc', '\x69'),
          this.blockTypeLink('Image', 'Pic', '\ue005')
        )
      )
    );
  }
});

MakonaRaw = React.createClass({
  render: function() {
    return React.DOM.textarea( {name:this.props.opts.node_name, value:JSON.stringify(this.props.blocks)});
  }
});

MakonaPreviewList = React.createClass({
  componentDidMount: function() {
    return this.renderRows();
  },
  componentDidUpdate: function() {
    return this.renderRows();
  },
  renderRows: function() {
    return this.props.blocks.map(function(block) {
      return React.renderComponent(MakonaPreviewerRow( {block:block, opts:this.props.opts} ), this.refs['preview' + block.id].getDOMNode());
    }, this);
  },
  render: function() {
    return (
      React.DOM.ol( {className:"mk-preview", ref:"preview"}, 
        this.props.blocks.map(
          function(block){
            return (
              React.DOM.li( {key:"kp"+block.id, 'data-position':block.position}, 
                React.DOM.div( {className:"mk-block mk-block-"+block.type, ref:"preview"+block.id}, 
                  " *Row gets rendered in here* "
                )
              )
            )
          }.bind(this)
        )
      )
    );
  }
});

module.exports = window.Makona = Makona;

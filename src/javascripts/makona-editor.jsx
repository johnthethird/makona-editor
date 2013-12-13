/** @jsx React.DOM */;
var Blocks, Makona, MakonaEditor, MakonaEditorRow, MakonaPlusRow, MakonaPreviewList, MakonaPreviewerRow, MakonaRaw, MakonaRawPre, MakonaSortableList;

require("script!../../bower_components/jquery/jquery.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.core.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.widget.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.mouse.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.position.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.draggable.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.droppable.min.js");

require("script!../../bower_components/jquery-ui/ui/minified/jquery.ui.sortable.min.js");

require("script!../../vendor/jquery-ui-touch-punch.min.js");

require("script!../../vendor/jquery-caret.min.js");

require("script!../../bower_components/lodash/dist/lodash.compat.min.js");

require("script!../../bower_components/react/react-with-addons.min.js");

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

Blocks = require("./blocks");

MakonaEditor = React.createClass({
  loadBlocksFromServer: function() {
    var _this = this;
    return $.ajax({
      url: this.props.opts.url,
      success: function(blocks) {
        blocks = blocks.map(function(block) {
          return $.extend({}, {
            mode: 'preview'
          }, block);
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
        _.merge(block.data, changedBlock.data);
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
      <div className='mk-editor'>
        <MakonaSortableList
          blocks={this.state.blocks}
          opts={this.props.opts}
          handleReorder={this.handleReorder}
          handleChange={this.handleChange}
          handleDelete={this.handleDelete}
        />
        <hr />
        {/*<MakonaPreviewList blocks={this.state.blocks} opts={this.props.opts} /> */}
        <hr />
        <MakonaRawPre blocks={this.state.blocks} opts={this.props.opts}/>
        <MakonaRaw blocks={this.state.blocks} opts={this.props.opts}/>
      </div>
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
    var block,
      _this = this;
    block = Blocks.blockFromId(this.props.blocks, id);
    block = $.extend(block, {
      mode: 'edit'
    });
    this.props.handleChange(block);
    return setTimeout(function() {
      return $(_this.refs["editor" + id].getDOMNode()).find("textarea").focus().caretToEnd();
    }, 100);
  },
  handlePreview: function(id, e) {
    var block;
    block = Blocks.blockFromId(this.props.blocks, id);
    block = $.extend(block, {
      mode: 'preview'
    });
    return this.props.handleChange(block);
  },
  editClasses: function(id) {
    var block, cx, editClasses;
    block = Blocks.blockFromId(this.props.blocks, id);
    cx = React.addons.classSet;
    return editClasses = cx({
      "mk-editor": true,
      "mk-mode-edit": block.mode === 'edit'
    });
  },
  previewClasses: function(id) {
    var block, cx, editClasses;
    block = Blocks.blockFromId(this.props.blocks, id);
    cx = React.addons.classSet;
    return editClasses = cx({
      "mk-previewer": true,
      "mk-mode-preview": (block.mode == null) || (block.mode === 'preview')
    });
  },
  editControls: function(block) {
    var editClasses, previewClasses;
    editClasses = React.addons.classSet({
      "hide": block.mode === 'edit' || !Blocks.blockTypeFromRegistry(block.type).editable
    });
    previewClasses = React.addons.classSet({
      "hide": block.mode === 'preview' || !Blocks.blockTypeFromRegistry(block.type).editable
    });
    return (
      <div className="mk-edit-controls">
        <a href="javascript:void(0);" className={editClasses} onClick={this.handleEdit.bind(this, block.id)}><div className="icon" data-icon="&#x6b;"></div></a>
        <a href="javascript:void(0);" className={previewClasses} onClick={this.handlePreview.bind(this, block.id)}><div className="icon" data-icon="&#x6c;"></div></a>
        {(this.props.blocks.length > 1) ?
          <a href="javascript:void(0);" onClick={this.handleDelete.bind(this, block.id)}><div className="icon" data-icon="&#xe019;"></div></a> : ""
        }
      </div>
    );
  },
  render: function() {
    return (
      <ol className="mk-edit" ref='sortable'>
        {this.props.blocks.map(
          function(block){
            return (
              <li className="Bfc" id={block.id} key={"ks"+block.id} data-position={block.position} >
                <div className={"mk-block mk-block-"+block.type} >
                  <div className={this.editClasses(block.id)} ref={"editor"+block.id} >
                    {Blocks.blockTypeFromRegistry(block.type).editable ? <MakonaEditorRow block={block} opts={this.props.opts} handleChange={this.props.handleChange} /> : ""}
                  </div>
                  <div className={this.previewClasses(block.id)} ref={"preview"+block.id} onClick={this.handleEdit.bind(this, block.id)}>
                    <MakonaPreviewerRow block={block} opts={this.props.opts} />
                  </div>
                </div>
                <div className="mk-block-controls">
                  <div className="handle icon" data-icon="&#x61;"></div>
                  {this.editControls(block)}
                </div>
                <MakonaPlusRow block={block} opts={this.props.opts} />
              </li>
            )
          }.bind(this)
        )}
      </ol>
    );
  }
});

MakonaEditorRow = React.createClass({
  render: function() {
    return this.transferPropsTo(Blocks.blockTypeFromRegistry(this.props.block.type).editorClass(null));
  }
});

MakonaPreviewerRow = React.createClass({
  render: function() {
    return this.transferPropsTo(Blocks.blockTypeFromRegistry(this.props.block.type).previewClass(null));
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
    newBlock = Blocks.newBlock(type);
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
  blockTypeLink: function(block) {
    return <a href="javascript: void(0);" onClick={this.addRow} data-type={block.type}><div className="icon" data-icon={block.icon}></div><div>{block.displayName}</div></a>;
  },
  blockTypes: function() {
    var _this = this;
    return _.map(Blocks.createableBlockTypes(), function(block) {
      return _this.blockTypeLink(block);
    });
  },
  render: function() {
    var classes;
    classes = React.addons.classSet({
      'mk-plus-links': true,
      'hide': this.state.hideLinks
    });
    return (
      <div className="mk-plus">
        <a className="mk-plus-add" href="javascript:void(0);" onClick={this.toggleLinks}>Add Block</a>
        <div className={classes}>
          {this.blockTypes()}
        </div>
      </div>
    );
  }
});

MakonaRaw = React.createClass({
  render: function() {
    return <textarea className="mk-raw" name={this.props.opts.node_name} value={JSON.stringify(this.props.blocks, null, 2)}></textarea>;
  }
});

MakonaRawPre = React.createClass({
  render: function() {
    return <pre  name={this.props.opts.node_name}>{JSON.stringify(this.props.blocks, null, 2)}</pre>;
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
      return React.renderComponent(<MakonaPreviewerRow block={block} opts={this.props.opts} />, this.refs['preview' + block.id].getDOMNode());
    }, this);
  },
  render: function() {
    return (
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
    );
  }
});

module.exports = window.Makona = Makona;

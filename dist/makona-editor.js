/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */
	var Blocks, Channel, KeyboardShortcuts, Makona, MakonaEditor, MakonaEditorControls, MakonaEditorRow, MakonaPlusRow, MakonaPreviewList, MakonaPreviewerRow, MakonaRaw, MakonaSortableItem, MakonaSortableList;

	if (typeof jQuery === "undefined" || jQuery === null) {
	  throw new Error("Makona requires jQuery");
	}

	if (!((jQuery.ui != null) && (jQuery.ui.sortable != null))) {
	  throw new Error("Makona requires jQuery UI Sortable");
	}

	if (typeof React === "undefined" || React === null) {
	  throw new Error("Makona requires React");
	}


	/* Includes and Constants */

	__webpack_require__(3);

	__webpack_require__(4);

	__webpack_require__(5);

	__webpack_require__(10);

	__webpack_require__(13);

	Blocks = __webpack_require__(1);

	Channel = postal.channel("makona");

	KeyboardShortcuts = __webpack_require__(2);

	Makona = (function() {
	  function Makona(opts) {
	    var $node;
	    $node = $("#" + opts.nodeId);
	    opts.node_name || (opts.node_name = $node.attr("name"));
	    opts.rendered_output_name || (opts.rendered_output_name = $node.data("rendered-output-name"));
	    opts.blocks || (opts.blocks = JSON.parse($node.val()));
	    $node.replaceWith("<div id='" + opts.nodeId + "' class='makona-editor'></div>");
	    React.render(React.createElement(MakonaEditor, {opts: opts}), document.getElementById(opts.nodeId));
	  }

	  return Makona;

	})();

	MakonaEditor = React.createClass({

	  /* Includes and Constants */
	  displayName: "MakonaEditor",
	  getInitialState: function() {
	    var blocks;
	    blocks = _(this.props.opts.blocks).map(function(block) {
	      return $.extend({}, {
	        mode: 'preview',
	        focus: false
	      }, block);
	    }).sortBy("position").value();
	    blocks[0].focus = true;
	    return {
	      blocks: blocks
	    };
	  },

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", null, 
	        React.createElement(KeyboardShortcuts, {blocks: this.state.blocks}), 
	        React.createElement(MakonaSortableList, {
	          blocks: this.state.blocks, 
	          opts: this.props.opts}
	        ), 
	        React.createElement(MakonaRaw, {blocks: this.state.blocks, opts: this.props.opts})
	      )
	    );
	  },

	  /* Life Cycle */
	  componentDidMount: function() {
	    Channel.subscribe("#", function(data, envelope) {
	      return console.log(envelope);
	    });
	    Channel.subscribe("block.change", (function(_this) {
	      return function(data) {
	        return _this.handleChange(data.block || data.blocks);
	      };
	    })(this));
	    Channel.subscribe("block.delete", (function(_this) {
	      return function(data) {
	        return _this.handleDelete(data.block);
	      };
	    })(this));
	    Channel.subscribe("block.add", (function(_this) {
	      return function(data) {
	        return _this.handleAddRow(data.block, data.position);
	      };
	    })(this));
	    return Channel.subscribe("block.reorder", (function(_this) {
	      return function(data) {
	        return _this.handleReorder(data.blocks);
	      };
	    })(this));
	  },

	  /* Custom Methods */
	  handleAddRow: function(addedBlock, position) {
	    var newBlocks;
	    addedBlock.id = _.max(this.state.blocks, "id").id + 1;
	    addedBlock.position = position + 0.5;
	    addedBlock.focus = true;
	    newBlocks = this.resortBlocks(this.state.blocks.concat(addedBlock));
	    this.setState({
	      blocks: newBlocks
	    });
	    return Channel.publish("block.caret", {
	      block: addedBlock
	    });
	  },
	  handleChange: function(changedBlocks) {
	    var newBlocks;
	    changedBlocks = [].concat(changedBlocks);
	    newBlocks = this.state.blocks.map(function(block) {
	      var changedBlock, newBlock;
	      newBlock = _.cloneDeep(block);
	      if (changedBlock = _.findWhere(changedBlocks, {
	        id: newBlock.id
	      })) {
	        if (newBlock.id === changedBlock.id) {
	          $.extend(newBlock, changedBlock);
	        }
	      }
	      return newBlock;
	    });
	    return this.setState({
	      blocks: newBlocks
	    });
	  },
	  handleDelete: function(deletedBlock) {
	    var newBlocks;
	    newBlocks = _.reject(this.state.blocks, function(block) {
	      return block.id === deletedBlock.id;
	    });
	    return this.replaceState({
	      blocks: newBlocks
	    });
	  },
	  handleReorder: function(sortedBlocks) {
	    _.each(sortedBlocks, function(b, i) {
	      return b.position = i;
	    });
	    return this.setState({
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
	  }
	});

	MakonaSortableList = React.createClass({
	  displayName: "SortableList",
	  propTypes: {
	    blocks: React.PropTypes.array.isRequired
	  },
	  componentDidMount: function() {
	    return $(this.refs.sortable.getDOMNode()).sortable({
	      containment: "parent",
	      handle: "[data-behavior='handle']",
	      stop: (function(_this) {
	        return function(event, ui) {
	          var $el, newOrder, sortedBlocks;
	          $el = $(_this.refs.sortable.getDOMNode());
	          newOrder = _.map($el.sortable("toArray"), function(name) {
	            return +name.match(/\d+$/)[0];
	          });
	          $el.sortable("cancel");
	          sortedBlocks = _this.props.blocks.sort(function(a, b) {
	            return newOrder.indexOf(a.id) - newOrder.indexOf(b.id);
	          });
	          return Channel.publish("block.reorder", {
	            blocks: sortedBlocks
	          });
	        };
	      })(this)
	    });
	  },
	  render: function() {
	    return (
	      React.createElement("ol", {ref: "sortable"}, 
	        this.props.blocks.map(
	          function(block){
	            return React.createElement(MakonaSortableItem, {key: block.id, opts: this.props.opts, block: block})
	          }.bind(this)
	        )
	      )
	    );
	  }
	});

	MakonaSortableItem = React.createClass({
	  displayName: "SortableItem",
	  propTypes: {
	    block: React.PropTypes.object.isRequired,
	    opts: React.PropTypes.object.isRequired
	  },
	  componentDidMount: function() {
	    return Channel.subscribe("block.caret", (function(_this) {
	      return function(data) {
	        return _this.handleCaret();
	      };
	    })(this));
	  },
	  componentDidUpdate: function() {
	    return Channel.publish("block.caret", this.props.block);
	  },
	  handleCaret: function() {},
	  handleEdit: function(e) {
	    var newBlock;
	    newBlock = _.extend({}, this.props.block, {
	      mode: 'edit'
	    });
	    Channel.publish("block.change", {
	      block: newBlock
	    });
	    return Channel.publish("block.caret", {
	      block: newBlock
	    });
	  },
	  handlePreview: function(e) {
	    var newBlock;
	    newBlock = _.extend({}, this.props.block, {
	      mode: 'preview'
	    });
	    return Channel.publish("block.change", {
	      block: newBlock
	    });
	  },
	  render: function() {
	    var block, editStyle, previewStyle;
	    block = this.props.block;
	    editStyle = {
	      display: block.mode === 'edit' ? 'block' : 'none'
	    };
	    previewStyle = {
	      display: block.mode === 'preview' ? 'block' : 'none'
	    };
	    return (
	      React.createElement("li", {className: block.focus ? 'mk-focus' : '', id: "mk-sortable-"+block.id}, 
	        React.createElement("div", {className: "mk-block mk-blocktype-"+block.type+" mk-mode-"+block.mode}, 
	          React.createElement("div", {className: "mk-block-editor", style: editStyle, ref: "editor"+block.id, onKeyUp: this.handleKeyUp}, 
	            React.createElement(MakonaEditorRow, {block: block})
	          ), 
	          React.createElement("div", {className: "mk-block-previewer", style: previewStyle, ref: "preview"+block.id, onClick: this.handleEdit}, 
	            React.createElement(MakonaPreviewerRow, {block: block})
	          ), 
	          React.createElement(MakonaEditorControls, {block: block, handleEdit: this.handleEdit, handlePreview: this.handlePreview})
	        ), 
	        React.createElement(MakonaPlusRow, {block: block, opts: this.props.opts})
	      )
	    );
	  }
	});

	MakonaEditorControls = React.createClass({
	  displayName: "EditorControls",
	  propTypes: {
	    block: React.PropTypes.object.isRequired
	  },
	  getInitialState: function() {
	    return {
	      confirming: false
	    };
	  },
	  handleConfirmDelete: function() {
	    if (this.state.confirming) {
	      this.setState({
	        confirming: false
	      });
	      return Channel.publish("block.delete", {
	        block: this.props.block
	      });
	    } else {
	      return this.setState({
	        confirming: true
	      });
	    }
	  },
	  handleAbortDelete: function() {
	    return this.setState({
	      confirming: false
	    });
	  },
	  render: function() {
	    var block, editStyle, previewStyle;
	    block = this.props.block;
	    editStyle = {
	      display: block.mode === 'edit' || !Blocks.blockTypeFromRegistry(block.type).editable ? 'none' : 'inline-block'
	    };
	    previewStyle = {
	      display: block.mode === 'preview' || !Blocks.blockTypeFromRegistry(block.type).editable ? 'none' : 'inline-block'
	    };
	    if (this.state.confirming) {
	      return (
	        React.createElement("div", {className: "mk-block-controls"}, 
	          React.createElement("div", {className: "mk-edit-controls"}, 
	            React.createElement("div", {className: "mk-delete-confirm"}, "Delete?"), 
	            React.createElement("a", {href: "javascript:void(0);", onClick: this.handleConfirmDelete}, React.createElement("div", {"data-icon": "N"})), 
	            React.createElement("a", {href: "javascript:void(0);", onClick: this.handleAbortDelete}, React.createElement("div", {"data-icon": "M"}))
	          )
	        )
	      );
	    } else {
	      return (
	        React.createElement("div", {className: "mk-block-controls"}, 
	          React.createElement("div", {className: "mk-edit-controls"}, 
	            React.createElement("a", {href: "javascript:void(0);", onClick: this.handleConfirmDelete}, React.createElement("div", {"data-icon": ""})), 
	            React.createElement("a", {href: "javascript:void(0);", style: editStyle, onClick: this.props.handleEdit}, React.createElement("div", {"data-icon": "k"})), 
	            React.createElement("a", {href: "javascript:void(0);", style: previewStyle, onClick: this.props.handlePreview}, React.createElement("div", {"data-icon": "l"})), 
	            React.createElement("div", {className: "mk-handle", "data-behavior": "handle", "data-icon": "a"})
	          )
	        )
	      );
	    }
	  }
	});

	MakonaEditorRow = React.createClass({
	  displayName: "EditorRow",
	  render: function() {
	    var comp;
	    comp = Blocks.blockTypeFromRegistry(this.props.block.type).editorClass;
	    return React.createElement("div", {}, React.createElement(comp, this.props));
	  }
	});

	MakonaPreviewerRow = React.createClass({
	  displayName: "PreviewerRow",
	  render: function() {
	    var comp;
	    comp = Blocks.blockTypeFromRegistry(this.props.block.type).previewClass;
	    return React.createElement("div", {}, React.createElement(comp, this.props));
	  }
	});

	MakonaPlusRow = React.createClass({
	  displayName: "PlusRow",
	  propTypes: {
	    block: React.PropTypes.object.isRequired,
	    opts: React.PropTypes.object.isRequired
	  },
	  getInitialState: function() {
	    return {
	      hideLinks: true
	    };
	  },
	  handleAddRow: function(type, e) {
	    var newBlock;
	    newBlock = Blocks.newBlock(type);
	    Channel.publish("block.add", {
	      block: newBlock,
	      position: this.props.block.position
	    });
	    return this.setState({
	      'hideLinks': true
	    });
	  },
	  handleClick: function() {
	    return this.setState({
	      'hideLinks': !this.state.hideLinks
	    });
	  },
	  toggleLinks: function() {
	    return this.setState({
	      'hideLinks': !this.state.hideLinks
	    });
	  },
	  blockTypeLink: function(block) {
	    return React.createElement("a", {href: "javascript: void(0);", key: block.type, onClick: this.handleAddRow.bind(this, block.type)}, 
	      React.createElement("div", {className: "mk-icon", "data-icon": block.icon}), 
	      React.createElement("div", null, block.displayName)
	     );
	  },
	  blockTypes: function() {
	    return _.map(Blocks.createableBlockTypes(this.props.opts.createableBlockTypes), (function(_this) {
	      return function(block) {
	        return _this.blockTypeLink(block);
	      };
	    })(this));
	  },
	  render: function() {
	    var links_style, plus_style;
	    links_style = {
	      display: this.state.hideLinks ? 'none' : 'block'
	    };
	    plus_style = {
	      display: this.state.hideLinks ? 'block' : 'none'
	    };
	    return (
	      React.createElement("div", {className: "mk-plus", onClick: this.handleClick}, 
	        React.createElement("a", {className: "mk-plus-add", style: plus_style, href: "javascript:void(0);", onClick: this.toggleLinks}, "+"), 
	        React.createElement("div", {className: "mk-plus-links", style: links_style}, 
	          this.blockTypes()
	        )
	      )
	    );
	  }
	});

	MakonaRaw = React.createClass({
	  displayName: "MakonaRaw",
	  propTypes: {
	    blocks: React.PropTypes.array.isRequired,
	    opts: React.PropTypes.object.isRequired
	  },
	  render: function() {
	    var comp, html;
	    if (this.props.opts.rendered_output_name != null) {
	      comp = React.createElement(MakonaPreviewList, {
	        blocks: this.props.blocks,
	        opts: this.props.opts
	      });
	      html = React.renderToStaticMarkup(comp);
	      return React.DOM.textarea({
	        className: "mk-raw",
	        readOnly: true,
	        name: this.props.opts.rendered_output_name,
	        value: html
	      });
	    } else {
	      return React.createElement("div", null);
	    }
	  }
	});

	MakonaPreviewList = React.createClass({
	  displayName: "MakonaPreviewList",
	  propTypes: {
	    blocks: React.PropTypes.array.isRequired,
	    opts: React.PropTypes.object.isRequired
	  },
	  render: function() {
	    return React.createElement("ol", {className: "mk-previewer-list"}, 
	        this.props.blocks.map(
	          function(block){
	            return (
	              React.createElement("li", {key: "kp"+block.id, "data-position": block.position}, 
	                React.createElement("div", {className: "mk-block mk-blocktype-"+block.type}, 
	                  React.createElement("div", {className: "mk-block-previewer"}, 
	                    React.createElement(MakonaPreviewerRow, {block: block, opts: this.props.opts})
	                  )
	                )
	              )
	            )
	          }.bind(this)
	        )
	      );
	  }
	});

	module.exports = window.Makona = Makona;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var BLOCK_REGISTRY, Blocks;

	BLOCK_REGISTRY = [
	  {
	    type: "unknown",
	    previewClass: __webpack_require__(15),
	    editable: false,
	    createable: false,
	    data: {}
	  }, {
	    type: "text",
	    displayName: "Text",
	    icon: '\x62',
	    editorClass: __webpack_require__(16),
	    previewClass: __webpack_require__(17),
	    editable: true,
	    createable: true,
	    data: {
	      text: "New text block..."
	    }
	  }, {
	    type: "html",
	    displayName: "HTML",
	    icon: '\ue036',
	    editorClass: __webpack_require__(18),
	    previewClass: __webpack_require__(19),
	    editable: true,
	    createable: true,
	    data: {
	      text: "Raw HTML code here..."
	    }
	  }, {
	    type: "javascript",
	    displayName: "JavaScript",
	    icon: '\ue036',
	    editorClass: __webpack_require__(20),
	    previewClass: __webpack_require__(21),
	    editable: true,
	    createable: true,
	    data: {
	      text: "console.log('JS tag');"
	    }
	  }, {
	    type: "markdown",
	    displayName: 'Markdown',
	    icon: '\x68',
	    editorClass: __webpack_require__(22),
	    previewClass: __webpack_require__(23),
	    editable: true,
	    createable: true,
	    data: {
	      text: "# Heading\nText block..\n"
	    }
	  }, {
	    type: "quote",
	    displayName: 'Quote',
	    icon: '\x7b',
	    editorClass: __webpack_require__(24),
	    previewClass: __webpack_require__(25),
	    editable: true,
	    createable: true,
	    data: {
	      text: "new quote",
	      cite: "a person"
	    }
	  }, {
	    type: "code",
	    displayName: "Code",
	    icon: '\ue038',
	    editorClass: __webpack_require__(26),
	    previewClass: __webpack_require__(27),
	    editable: true,
	    createable: true,
	    data: {
	      lang: 'javascript',
	      text: "function doSomething(x) {\n  doImportant();\n};"
	    }
	  }, {
	    type: "image",
	    displayName: "Image",
	    icon: '\ue005',
	    editorClass: __webpack_require__(28),
	    previewClass: __webpack_require__(29),
	    editable: false,
	    createable: true,
	    data: {
	      src: ""
	    }
	  }, {
	    type: "document",
	    displayName: "Document",
	    icon: '\x69',
	    editorClass: __webpack_require__(30),
	    previewClass: __webpack_require__(31),
	    editable: false,
	    createable: true,
	    data: {
	      title: ""
	    }
	  }, {
	    type: "screencast",
	    displayName: "Screencast",
	    icon: '\ue00e',
	    editorClass: __webpack_require__(32),
	    previewClass: __webpack_require__(33),
	    editable: false,
	    createable: true,
	    data: {
	      title: ""
	    }
	  }
	];

	Blocks = {
	  registry: BLOCK_REGISTRY,
	  defaultNewBlock: {
	    mode: 'edit'
	  },
	  newBlock: function(type) {
	    return _.extend({}, this.defaultNewBlock, _.pick(this.blockTypeFromRegistry(type), ['type', 'data']));
	  },
	  blockFromId: function(blocks, id) {
	    return _.findWhere(blocks, {
	      id: parseInt(id, 10)
	    });
	  },
	  blockTypeFromRegistry: function(type) {
	    return _.findWhere(this.registry, {
	      type: type
	    }) || _.findWhere(this.registry, {
	      type: 'unknown'
	    });
	  },
	  createableBlockTypes: _.memoize(function(types) {
	    var blocks;
	    blocks = _.filter(this.registry, function(blk) {
	      return blk.createable;
	    });
	    if (types != null) {
	      blocks = _.filter(blocks, function(blk) {
	        return _.include(types, blk.type);
	      });
	      blocks = _.map(types, function(t) {
	        return _.findWhere(blocks, {
	          type: t
	        });
	      });
	    }
	    return blocks;
	  }),
	  isEditable: function(type) {
	    return _.findWhere(this.registry, {
	      type: type
	    }).editable;
	  }
	};

	module.exports = Blocks;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var Blocks, Channel, KeyboardShortcuts;

	__webpack_require__(12);

	__webpack_require__(34);

	Blocks = __webpack_require__(1);

	Channel = postal.channel("makona");

	KeyboardShortcuts = React.createClass({

	  /* Construction */
	  displayName: "KeyboardShortcuts",
	  propTypes: {
	    blocks: React.PropTypes.array.isRequired
	  },

	  /* Render */
	  render: function() {
	    return React.createElement("div", null);
	  },

	  /* Life Cycle */
	  componentDidMount: function() {
	    Mousetrap.bind('up', (function(_this) {
	      return function(e) {
	        return _this.focusPrevious();
	      };
	    })(this));
	    Mousetrap.bind('down', (function(_this) {
	      return function(e) {
	        return _this.focusNext();
	      };
	    })(this));
	    Mousetrap.bind('shift+up', (function(_this) {
	      return function(e) {
	        return _this.movePrevious();
	      };
	    })(this));
	    Mousetrap.bind('shift+down', (function(_this) {
	      return function(e) {
	        return _this.moveNext();
	      };
	    })(this));
	    Mousetrap.bind('enter', (function(_this) {
	      return function(e) {
	        return _this.handleEnter();
	      };
	    })(this));
	    Mousetrap.bind('m', (function(_this) {
	      return function(e) {
	        return _this.addBlock('markdown');
	      };
	    })(this));
	    Mousetrap.bind('c', (function(_this) {
	      return function(e) {
	        return _this.addBlock('code');
	      };
	    })(this));
	    return Mousetrap.bindGlobal('esc', (function(_this) {
	      return function(e) {
	        return _this.handleEscape();
	      };
	    })(this));
	  },

	  /* Custom Methods */
	  handleEscape: function() {
	    var newBlocks;
	    newBlocks = _.map(this.props.blocks, function(block) {
	      block.mode = 'preview';
	      return block;
	    });
	    return Channel.publish("block.change", {
	      blocks: newBlocks
	    });
	  },
	  focusNext: function() {
	    var curSel, newBlocks;
	    curSel = _.findIndex(this.props.blocks, {
	      focus: true
	    });
	    newBlocks = _.map(this.props.blocks, function(block, i) {
	      var ref;
	      block.focus = (ref = i === curSel + 1) != null ? ref : {
	        "true": false
	      };
	      return block;
	    });
	    return Channel.publish("block.change", {
	      blocks: newBlocks
	    });
	  },
	  focusPrevious: function() {
	    var curSel, newBlocks;
	    curSel = _.findIndex(this.props.blocks, {
	      focus: true
	    });
	    newBlocks = _.map(this.props.blocks, function(block, i) {
	      var ref;
	      block.focus = (ref = i === curSel - 1) != null ? ref : {
	        "true": false
	      };
	      return block;
	    });
	    return Channel.publish("block.change", {
	      blocks: newBlocks
	    });
	  },
	  moveNext: function() {
	    var curIndex, newBlocks, x;
	    newBlocks = this.props.blocks.slice();
	    curIndex = _.findIndex(newBlocks, {
	      focus: true
	    });
	    if (curIndex >= newBlocks.length) {
	      return;
	    }
	    x = newBlocks[curIndex];
	    newBlocks[curIndex] = newBlocks[curIndex + 1];
	    newBlocks[curIndex + 1] = x;
	    return Channel.publish("block.reorder", {
	      blocks: newBlocks
	    });
	  },
	  movePrevious: function() {
	    var curIndex, newBlocks, x;
	    newBlocks = this.props.blocks.slice();
	    curIndex = _.findIndex(newBlocks, {
	      focus: true
	    });
	    if (curIndex < 1) {
	      return;
	    }
	    x = newBlocks[curIndex];
	    newBlocks[curIndex] = newBlocks[curIndex - 1];
	    newBlocks[curIndex - 1] = x;
	    return Channel.publish("block.reorder", {
	      blocks: newBlocks
	    });
	  },
	  addBlock: function(type) {
	    var focusPosition, newBlock;
	    newBlock = Blocks.newBlock(type);
	    focusPosition = _.findWhere(this.props.blocks, {
	      focus: true
	    }).position;
	    return Channel.publish("block.add", {
	      block: newBlock,
	      position: focusPosition
	    });
	  },
	  handleEnter: function() {
	    var newBlock;
	    newBlock = _.find(this.props.blocks, {
	      focus: true
	    });
	    newBlock = _.extend(newBlock, {
	      mode: 'edit'
	    });
	    Channel.publish("block.change", {
	      block: newBlock
	    });
	    return Channel.publish("block.caret", {
	      block: newBlock
	    });
	  }
	});

	module.exports = KeyboardShortcuts;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6)(__webpack_require__(7))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6)(__webpack_require__(8))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6)(__webpack_require__(9))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	module.exports = function(src) {
		if (typeof execScript === "function")
			execScript(src);
		else
			eval.call(null, src);
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "/*\n * jQuery UI Touch Punch 0.2.2\n *\n * Copyright 2011, Dave Furfero\n * Dual licensed under the MIT or GPL Version 2 licenses.\n *\n * Depends:\n *  jquery.ui.widget.js\n *  jquery.ui.mouse.js\n */\n(function(b){b.support.touch=\"ontouchend\" in document;if(!b.support.touch){return;}var c=b.ui.mouse.prototype,e=c._mouseInit,a;function d(g,h){if(g.originalEvent.touches.length>1){return;}g.preventDefault();var i=g.originalEvent.changedTouches[0],f=document.createEvent(\"MouseEvents\");f.initMouseEvent(h,true,true,window,1,i.screenX,i.screenY,i.clientX,i.clientY,false,false,false,false,0,null);g.target.dispatchEvent(f);}c._touchStart=function(g){var f=this;if(a||!f._mouseCapture(g.originalEvent.changedTouches[0])){return;}a=true;f._touchMoved=false;d(g,\"mouseover\");d(g,\"mousemove\");d(g,\"mousedown\");};c._touchMove=function(f){if(!a){return;}this._touchMoved=true;d(f,\"mousemove\");};c._touchEnd=function(f){if(!a){return;}d(f,\"mouseup\");d(f,\"mouseout\");if(!this._touchMoved){d(f,\"click\");}a=false;};c._mouseInit=function(){var f=this;f.element.bind(\"touchstart\",b.proxy(f,\"_touchStart\")).bind(\"touchmove\",b.proxy(f,\"_touchMove\")).bind(\"touchend\",b.proxy(f,\"_touchEnd\"));e.call(f);};})(jQuery);"

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "// Set caret position easily in jQuery\n// Written by and Copyright of Luke Morton, 2011\n// Licensed under MIT\n(function ($) {\n    // Behind the scenes method deals with browser\n    // idiosyncrasies and such\n    $.caretTo = function (el, index) {\n        if (el.createTextRange) {\n            var range = el.createTextRange();\n            range.move(\"character\", index);\n            range.select();\n        } else if (el.selectionStart != null) {\n            el.focus();\n            el.setSelectionRange(index, index);\n        }\n    };\n\n    // Another behind the scenes that collects the\n    // current caret position for an element\n\n    // TODO: Get working with Opera\n    $.caretPos = function (el) {\n        if (\"selection\" in document) {\n            var range = el.createTextRange();\n            try {\n                range.setEndPoint(\"EndToStart\", document.selection.createRange());\n            } catch (e) {\n                // Catch IE failure here, return 0 like\n                // other browsers\n                return 0;\n            }\n            return range.text.length;\n        } else if (el.selectionStart != null) {\n            return el.selectionStart;\n        }\n    };\n\n    // The following methods are queued under fx for more\n    // flexibility when combining with $.fn.delay() and\n    // jQuery effects.\n\n    // Set caret to a particular index\n    $.fn.caret = function (index, offset) {\n        if (typeof(index) === \"undefined\") {\n            return $.caretPos(this.get(0));\n        }\n\n        return this.queue(function (next) {\n            if (isNaN(index)) {\n                var i = $(this).val().indexOf(index);\n\n                if (offset === true) {\n                    i += index.length;\n                } else if (typeof(offset) !== \"undefined\") {\n                    i += offset;\n                }\n\n                $.caretTo(this, i);\n            } else {\n                $.caretTo(this, index);\n            }\n\n            next();\n        });\n    };\n\n    // Set caret to beginning of an element\n    $.fn.caretToStart = function () {\n        return this.caret(0);\n    };\n\n    // Set caret to the end of an element\n    $.fn.caretToEnd = function () {\n        return this.queue(function (next) {\n            $.caretTo(this, $(this).val().length);\n            next();\n        });\n    };\n}(jQuery));"

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "/**\n * @license\n * lodash 3.6.0 (Custom Build) <https://lodash.com/>\n * Build: `lodash modern -d -o ./index.js`\n * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>\n * Based on Underscore.js 1.8.2 <http://underscorejs.org/LICENSE>\n * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors\n * Available under MIT license <https://lodash.com/license>\n */\n;(function() {\n\n  /** Used as a safe reference for `undefined` in pre-ES5 environments. */\n  var undefined;\n\n  /** Used as the semantic version number. */\n  var VERSION = '3.6.0';\n\n  /** Used to compose bitmasks for wrapper metadata. */\n  var BIND_FLAG = 1,\n      BIND_KEY_FLAG = 2,\n      CURRY_BOUND_FLAG = 4,\n      CURRY_FLAG = 8,\n      CURRY_RIGHT_FLAG = 16,\n      PARTIAL_FLAG = 32,\n      PARTIAL_RIGHT_FLAG = 64,\n      ARY_FLAG = 128,\n      REARG_FLAG = 256;\n\n  /** Used as default options for `_.trunc`. */\n  var DEFAULT_TRUNC_LENGTH = 30,\n      DEFAULT_TRUNC_OMISSION = '...';\n\n  /** Used to detect when a function becomes hot. */\n  var HOT_COUNT = 150,\n      HOT_SPAN = 16;\n\n  /** Used to indicate the type of lazy iteratees. */\n  var LAZY_DROP_WHILE_FLAG = 0,\n      LAZY_FILTER_FLAG = 1,\n      LAZY_MAP_FLAG = 2;\n\n  /** Used as the `TypeError` message for \"Functions\" methods. */\n  var FUNC_ERROR_TEXT = 'Expected a function';\n\n  /** Used as the internal argument placeholder. */\n  var PLACEHOLDER = '__lodash_placeholder__';\n\n  /** `Object#toString` result references. */\n  var argsTag = '[object Arguments]',\n      arrayTag = '[object Array]',\n      boolTag = '[object Boolean]',\n      dateTag = '[object Date]',\n      errorTag = '[object Error]',\n      funcTag = '[object Function]',\n      mapTag = '[object Map]',\n      numberTag = '[object Number]',\n      objectTag = '[object Object]',\n      regexpTag = '[object RegExp]',\n      setTag = '[object Set]',\n      stringTag = '[object String]',\n      weakMapTag = '[object WeakMap]';\n\n  var arrayBufferTag = '[object ArrayBuffer]',\n      float32Tag = '[object Float32Array]',\n      float64Tag = '[object Float64Array]',\n      int8Tag = '[object Int8Array]',\n      int16Tag = '[object Int16Array]',\n      int32Tag = '[object Int32Array]',\n      uint8Tag = '[object Uint8Array]',\n      uint8ClampedTag = '[object Uint8ClampedArray]',\n      uint16Tag = '[object Uint16Array]',\n      uint32Tag = '[object Uint32Array]';\n\n  /** Used to match empty string literals in compiled template source. */\n  var reEmptyStringLeading = /\\b__p \\+= '';/g,\n      reEmptyStringMiddle = /\\b(__p \\+=) '' \\+/g,\n      reEmptyStringTrailing = /(__e\\(.*?\\)|\\b__t\\)) \\+\\n'';/g;\n\n  /** Used to match HTML entities and HTML characters. */\n  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,\n      reUnescapedHtml = /[&<>\"'`]/g,\n      reHasEscapedHtml = RegExp(reEscapedHtml.source),\n      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);\n\n  /** Used to match template delimiters. */\n  var reEscape = /<%-([\\s\\S]+?)%>/g,\n      reEvaluate = /<%([\\s\\S]+?)%>/g,\n      reInterpolate = /<%=([\\s\\S]+?)%>/g;\n\n  /**\n   * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).\n   */\n  var reComboMarks = /[\\u0300-\\u036f\\ufe20-\\ufe23]/g;\n\n  /**\n   * Used to match [ES template delimiters](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-template-literal-lexical-components).\n   */\n  var reEsTemplate = /\\$\\{([^\\\\}]*(?:\\\\.[^\\\\}]*)*)\\}/g;\n\n  /** Used to match `RegExp` flags from their coerced string values. */\n  var reFlags = /\\w*$/;\n\n  /** Used to detect hexadecimal string values. */\n  var reHexPrefix = /^0[xX]/;\n\n  /** Used to detect host constructors (Safari > 5). */\n  var reHostCtor = /^\\[object .+?Constructor\\]$/;\n\n  /** Used to match latin-1 supplementary letters (excluding mathematical operators). */\n  var reLatin1 = /[\\xc0-\\xd6\\xd8-\\xde\\xdf-\\xf6\\xf8-\\xff]/g;\n\n  /** Used to ensure capturing order of template delimiters. */\n  var reNoMatch = /($^)/;\n\n  /**\n   * Used to match `RegExp` [special characters](http://www.regular-expressions.info/characters.html#special).\n   * In addition to special characters the forward slash is escaped to allow for\n   * easier `eval` use and `Function` compilation.\n   */\n  var reRegExpChars = /[.*+?^${}()|[\\]\\/\\\\]/g,\n      reHasRegExpChars = RegExp(reRegExpChars.source);\n\n  /** Used to match unescaped characters in compiled string literals. */\n  var reUnescapedString = /['\\n\\r\\u2028\\u2029\\\\]/g;\n\n  /** Used to match words to create compound words. */\n  var reWords = (function() {\n    var upper = '[A-Z\\\\xc0-\\\\xd6\\\\xd8-\\\\xde]',\n        lower = '[a-z\\\\xdf-\\\\xf6\\\\xf8-\\\\xff]+';\n\n    return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g');\n  }());\n\n  /** Used to detect and test for whitespace. */\n  var whitespace = (\n    // Basic whitespace characters.\n    ' \\t\\x0b\\f\\xa0\\ufeff' +\n\n    // Line terminators.\n    '\\n\\r\\u2028\\u2029' +\n\n    // Unicode category \"Zs\" space separators.\n    '\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000'\n  );\n\n  /** Used to assign default `context` object properties. */\n  var contextProps = [\n    'Array', 'ArrayBuffer', 'Date', 'Error', 'Float32Array', 'Float64Array',\n    'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Math', 'Number',\n    'Object', 'RegExp', 'Set', 'String', '_', 'clearTimeout', 'document',\n    'isFinite', 'parseInt', 'setTimeout', 'TypeError', 'Uint8Array',\n    'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap',\n    'window'\n  ];\n\n  /** Used to make template sourceURLs easier to identify. */\n  var templateCounter = -1;\n\n  /** Used to identify `toStringTag` values of typed arrays. */\n  var typedArrayTags = {};\n  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =\n  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =\n  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =\n  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =\n  typedArrayTags[uint32Tag] = true;\n  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =\n  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =\n  typedArrayTags[dateTag] = typedArrayTags[errorTag] =\n  typedArrayTags[funcTag] = typedArrayTags[mapTag] =\n  typedArrayTags[numberTag] = typedArrayTags[objectTag] =\n  typedArrayTags[regexpTag] = typedArrayTags[setTag] =\n  typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;\n\n  /** Used to identify `toStringTag` values supported by `_.clone`. */\n  var cloneableTags = {};\n  cloneableTags[argsTag] = cloneableTags[arrayTag] =\n  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =\n  cloneableTags[dateTag] = cloneableTags[float32Tag] =\n  cloneableTags[float64Tag] = cloneableTags[int8Tag] =\n  cloneableTags[int16Tag] = cloneableTags[int32Tag] =\n  cloneableTags[numberTag] = cloneableTags[objectTag] =\n  cloneableTags[regexpTag] = cloneableTags[stringTag] =\n  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =\n  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;\n  cloneableTags[errorTag] = cloneableTags[funcTag] =\n  cloneableTags[mapTag] = cloneableTags[setTag] =\n  cloneableTags[weakMapTag] = false;\n\n  /** Used as an internal `_.debounce` options object by `_.throttle`. */\n  var debounceOptions = {\n    'leading': false,\n    'maxWait': 0,\n    'trailing': false\n  };\n\n  /** Used to map latin-1 supplementary letters to basic latin letters. */\n  var deburredLetters = {\n    '\\xc0': 'A',  '\\xc1': 'A', '\\xc2': 'A', '\\xc3': 'A', '\\xc4': 'A', '\\xc5': 'A',\n    '\\xe0': 'a',  '\\xe1': 'a', '\\xe2': 'a', '\\xe3': 'a', '\\xe4': 'a', '\\xe5': 'a',\n    '\\xc7': 'C',  '\\xe7': 'c',\n    '\\xd0': 'D',  '\\xf0': 'd',\n    '\\xc8': 'E',  '\\xc9': 'E', '\\xca': 'E', '\\xcb': 'E',\n    '\\xe8': 'e',  '\\xe9': 'e', '\\xea': 'e', '\\xeb': 'e',\n    '\\xcC': 'I',  '\\xcd': 'I', '\\xce': 'I', '\\xcf': 'I',\n    '\\xeC': 'i',  '\\xed': 'i', '\\xee': 'i', '\\xef': 'i',\n    '\\xd1': 'N',  '\\xf1': 'n',\n    '\\xd2': 'O',  '\\xd3': 'O', '\\xd4': 'O', '\\xd5': 'O', '\\xd6': 'O', '\\xd8': 'O',\n    '\\xf2': 'o',  '\\xf3': 'o', '\\xf4': 'o', '\\xf5': 'o', '\\xf6': 'o', '\\xf8': 'o',\n    '\\xd9': 'U',  '\\xda': 'U', '\\xdb': 'U', '\\xdc': 'U',\n    '\\xf9': 'u',  '\\xfa': 'u', '\\xfb': 'u', '\\xfc': 'u',\n    '\\xdd': 'Y',  '\\xfd': 'y', '\\xff': 'y',\n    '\\xc6': 'Ae', '\\xe6': 'ae',\n    '\\xde': 'Th', '\\xfe': 'th',\n    '\\xdf': 'ss'\n  };\n\n  /** Used to map characters to HTML entities. */\n  var htmlEscapes = {\n    '&': '&amp;',\n    '<': '&lt;',\n    '>': '&gt;',\n    '\"': '&quot;',\n    \"'\": '&#39;',\n    '`': '&#96;'\n  };\n\n  /** Used to map HTML entities to characters. */\n  var htmlUnescapes = {\n    '&amp;': '&',\n    '&lt;': '<',\n    '&gt;': '>',\n    '&quot;': '\"',\n    '&#39;': \"'\",\n    '&#96;': '`'\n  };\n\n  /** Used to determine if values are of the language type `Object`. */\n  var objectTypes = {\n    'function': true,\n    'object': true\n  };\n\n  /** Used to escape characters for inclusion in compiled string literals. */\n  var stringEscapes = {\n    '\\\\': '\\\\',\n    \"'\": \"'\",\n    '\\n': 'n',\n    '\\r': 'r',\n    '\\u2028': 'u2028',\n    '\\u2029': 'u2029'\n  };\n\n  /** Detect free variable `exports`. */\n  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;\n\n  /** Detect free variable `module`. */\n  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;\n\n  /** Detect free variable `global` from Node.js. */\n  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;\n\n  /** Detect free variable `self`. */\n  var freeSelf = objectTypes[typeof self] && self && self.Object && self;\n\n  /** Detect free variable `window`. */\n  var freeWindow = objectTypes[typeof window] && window && window.Object && window;\n\n  /** Detect the popular CommonJS extension `module.exports`. */\n  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;\n\n  /**\n   * Used as a reference to the global object.\n   *\n   * The `this` value is used if it is the global object to avoid Greasemonkey's\n   * restricted `window` object, otherwise the `window` object is used.\n   */\n  var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;\n\n  /*--------------------------------------------------------------------------*/\n\n  /**\n   * The base implementation of `compareAscending` which compares values and\n   * sorts them in ascending order without guaranteeing a stable sort.\n   *\n   * @private\n   * @param {*} value The value to compare to `other`.\n   * @param {*} other The value to compare to `value`.\n   * @returns {number} Returns the sort order indicator for `value`.\n   */\n  function baseCompareAscending(value, other) {\n    if (value !== other) {\n      var valIsReflexive = value === value,\n          othIsReflexive = other === other;\n\n      if (value > other || !valIsReflexive || (typeof value == 'undefined' && othIsReflexive)) {\n        return 1;\n      }\n      if (value < other || !othIsReflexive || (typeof other == 'undefined' && valIsReflexive)) {\n        return -1;\n      }\n    }\n    return 0;\n  }\n\n  /**\n   * The base implementation of `_.findIndex` and `_.findLastIndex` without\n   * support for callback shorthands and `this` binding.\n   *\n   * @private\n   * @param {Array} array The array to search.\n   * @param {Function} predicate The function invoked per iteration.\n   * @param {boolean} [fromRight] Specify iterating from right to left.\n   * @returns {number} Returns the index of the matched value, else `-1`.\n   */\n  function baseFindIndex(array, predicate, fromRight) {\n    var length = array.length,\n        index = fromRight ? length : -1;\n\n    while ((fromRight ? index-- : ++index < length)) {\n      if (predicate(array[index], index, array)) {\n        return index;\n      }\n    }\n    return -1;\n  }\n\n  /**\n   * The base implementation of `_.indexOf` without support for binary searches.\n   *\n   * @private\n   * @param {Array} array The array to search.\n   * @param {*} value The value to search for.\n   * @param {number} fromIndex The index to search from.\n   * @returns {number} Returns the index of the matched value, else `-1`.\n   */\n  function baseIndexOf(array, value, fromIndex) {\n    if (value !== value) {\n      return indexOfNaN(array, fromIndex);\n    }\n    var index = fromIndex - 1,\n        length = array.length;\n\n    while (++index < length) {\n      if (array[index] === value) {\n        return index;\n      }\n    }\n    return -1;\n  }\n\n  /**\n   * The base implementation of `_.isFunction` without support for environments\n   * with incorrect `typeof` results.\n   *\n   * @private\n   * @param {*} value The value to check.\n   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n   */\n  function baseIsFunction(value) {\n    // Avoid a Chakra JIT bug in compatibility modes of IE 11.\n    // See https://github.com/jashkenas/underscore/issues/1621 for more details.\n    return typeof value == 'function' || false;\n  }\n\n  /**\n   * Converts `value` to a string if it is not one. An empty string is returned\n   * for `null` or `undefined` values.\n   *\n   * @private\n   * @param {*} value The value to process.\n   * @returns {string} Returns the string.\n   */\n  function baseToString(value) {\n    if (typeof value == 'string') {\n      return value;\n    }\n    return value == null ? '' : (value + '');\n  }\n\n  /**\n   * Used by `_.max` and `_.min` as the default callback for string values.\n   *\n   * @private\n   * @param {string} string The string to inspect.\n   * @returns {number} Returns the code unit of the first character of the string.\n   */\n  function charAtCallback(string) {\n    return string.charCodeAt(0);\n  }\n\n  /**\n   * Used by `_.trim` and `_.trimLeft` to get the index of the first character\n   * of `string` that is not found in `chars`.\n   *\n   * @private\n   * @param {string} string The string to inspect.\n   * @param {string} chars The characters to find.\n   * @returns {number} Returns the index of the first character not found in `chars`.\n   */\n  function charsLeftIndex(string, chars) {\n    var index = -1,\n        length = string.length;\n\n    while (++index < length && chars.indexOf(string.charAt(index)) > -1) {}\n    return index;\n  }\n\n  /**\n   * Used by `_.trim` and `_.trimRight` to get the index of the last character\n   * of `string` that is not found in `chars`.\n   *\n   * @private\n   * @param {string} string The string to inspect.\n   * @param {string} chars The characters to find.\n   * @returns {number} Returns the index of the last character not found in `chars`.\n   */\n  function charsRightIndex(string, chars) {\n    var index = string.length;\n\n    while (index-- && chars.indexOf(string.charAt(index)) > -1) {}\n    return index;\n  }\n\n  /**\n   * Used by `_.sortBy` to compare transformed elements of a collection and stable\n   * sort them in ascending order.\n   *\n   * @private\n   * @param {Object} object The object to compare to `other`.\n   * @param {Object} other The object to compare to `object`.\n   * @returns {number} Returns the sort order indicator for `object`.\n   */\n  function compareAscending(object, other) {\n    return baseCompareAscending(object.criteria, other.criteria) || (object.index - other.index);\n  }\n\n  /**\n   * Used by `_.sortByOrder` to compare multiple properties of each element\n   * in a collection and stable sort them in the following order:\n   *\n   * If orders is unspecified, sort in ascending order for all properties.\n   * Otherwise, for each property, sort in ascending order if its corresponding value in\n   * orders is true, and descending order if false.\n   *\n   * @private\n   * @param {Object} object The object to compare to `other`.\n   * @param {Object} other The object to compare to `object`.\n   * @param {boolean[]} orders The order to sort by for each property.\n   * @returns {number} Returns the sort order indicator for `object`.\n   */\n  function compareMultiple(object, other, orders) {\n    var index = -1,\n        objCriteria = object.criteria,\n        othCriteria = other.criteria,\n        length = objCriteria.length,\n        ordersLength = orders.length;\n\n    while (++index < length) {\n      var result = baseCompareAscending(objCriteria[index], othCriteria[index]);\n      if (result) {\n        if (index >= ordersLength) {\n          return result;\n        }\n        return result * (orders[index] ? 1 : -1);\n      }\n    }\n    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications\n    // that causes it, under certain circumstances, to provide the same value for\n    // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247\n    // for more details.\n    //\n    // This also ensures a stable sort in V8 and other engines.\n    // See https://code.google.com/p/v8/issues/detail?id=90 for more details.\n    return object.index - other.index;\n  }\n\n  /**\n   * Used by `_.deburr` to convert latin-1 supplementary letters to basic latin letters.\n   *\n   * @private\n   * @param {string} letter The matched letter to deburr.\n   * @returns {string} Returns the deburred letter.\n   */\n  function deburrLetter(letter) {\n    return deburredLetters[letter];\n  }\n\n  /**\n   * Used by `_.escape` to convert characters to HTML entities.\n   *\n   * @private\n   * @param {string} chr The matched character to escape.\n   * @returns {string} Returns the escaped character.\n   */\n  function escapeHtmlChar(chr) {\n    return htmlEscapes[chr];\n  }\n\n  /**\n   * Used by `_.template` to escape characters for inclusion in compiled\n   * string literals.\n   *\n   * @private\n   * @param {string} chr The matched character to escape.\n   * @returns {string} Returns the escaped character.\n   */\n  function escapeStringChar(chr) {\n    return '\\\\' + stringEscapes[chr];\n  }\n\n  /**\n   * Gets the index at which the first occurrence of `NaN` is found in `array`.\n   *\n   * @private\n   * @param {Array} array The array to search.\n   * @param {number} fromIndex The index to search from.\n   * @param {boolean} [fromRight] Specify iterating from right to left.\n   * @returns {number} Returns the index of the matched `NaN`, else `-1`.\n   */\n  function indexOfNaN(array, fromIndex, fromRight) {\n    var length = array.length,\n        index = fromIndex + (fromRight ? 0 : -1);\n\n    while ((fromRight ? index-- : ++index < length)) {\n      var other = array[index];\n      if (other !== other) {\n        return index;\n      }\n    }\n    return -1;\n  }\n\n  /**\n   * Checks if `value` is object-like.\n   *\n   * @private\n   * @param {*} value The value to check.\n   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.\n   */\n  function isObjectLike(value) {\n    return !!value && typeof value == 'object';\n  }\n\n  /**\n   * Used by `trimmedLeftIndex` and `trimmedRightIndex` to determine if a\n   * character code is whitespace.\n   *\n   * @private\n   * @param {number} charCode The character code to inspect.\n   * @returns {boolean} Returns `true` if `charCode` is whitespace, else `false`.\n   */\n  function isSpace(charCode) {\n    return ((charCode <= 160 && (charCode >= 9 && charCode <= 13) || charCode == 32 || charCode == 160) || charCode == 5760 || charCode == 6158 ||\n      (charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279)));\n  }\n\n  /**\n   * Replaces all `placeholder` elements in `array` with an internal placeholder\n   * and returns an array of their indexes.\n   *\n   * @private\n   * @param {Array} array The array to modify.\n   * @param {*} placeholder The placeholder to replace.\n   * @returns {Array} Returns the new array of placeholder indexes.\n   */\n  function replaceHolders(array, placeholder) {\n    var index = -1,\n        length = array.length,\n        resIndex = -1,\n        result = [];\n\n    while (++index < length) {\n      if (array[index] === placeholder) {\n        array[index] = PLACEHOLDER;\n        result[++resIndex] = index;\n      }\n    }\n    return result;\n  }\n\n  /**\n   * An implementation of `_.uniq` optimized for sorted arrays without support\n   * for callback shorthands and `this` binding.\n   *\n   * @private\n   * @param {Array} array The array to inspect.\n   * @param {Function} [iteratee] The function invoked per iteration.\n   * @returns {Array} Returns the new duplicate-value-free array.\n   */\n  function sortedUniq(array, iteratee) {\n    var seen,\n        index = -1,\n        length = array.length,\n        resIndex = -1,\n        result = [];\n\n    while (++index < length) {\n      var value = array[index],\n          computed = iteratee ? iteratee(value, index, array) : value;\n\n      if (!index || seen !== computed) {\n        seen = computed;\n        result[++resIndex] = value;\n      }\n    }\n    return result;\n  }\n\n  /**\n   * Used by `_.trim` and `_.trimLeft` to get the index of the first non-whitespace\n   * character of `string`.\n   *\n   * @private\n   * @param {string} string The string to inspect.\n   * @returns {number} Returns the index of the first non-whitespace character.\n   */\n  function trimmedLeftIndex(string) {\n    var index = -1,\n        length = string.length;\n\n    while (++index < length && isSpace(string.charCodeAt(index))) {}\n    return index;\n  }\n\n  /**\n   * Used by `_.trim` and `_.trimRight` to get the index of the last non-whitespace\n   * character of `string`.\n   *\n   * @private\n   * @param {string} string The string to inspect.\n   * @returns {number} Returns the index of the last non-whitespace character.\n   */\n  function trimmedRightIndex(string) {\n    var index = string.length;\n\n    while (index-- && isSpace(string.charCodeAt(index))) {}\n    return index;\n  }\n\n  /**\n   * Used by `_.unescape` to convert HTML entities to characters.\n   *\n   * @private\n   * @param {string} chr The matched character to unescape.\n   * @returns {string} Returns the unescaped character.\n   */\n  function unescapeHtmlChar(chr) {\n    return htmlUnescapes[chr];\n  }\n\n  /*--------------------------------------------------------------------------*/\n\n  /**\n   * Create a new pristine `lodash` function using the given `context` object.\n   *\n   * @static\n   * @memberOf _\n   * @category Utility\n   * @param {Object} [context=root] The context object.\n   * @returns {Function} Returns a new `lodash` function.\n   * @example\n   *\n   * _.mixin({ 'foo': _.constant('foo') });\n   *\n   * var lodash = _.runInContext();\n   * lodash.mixin({ 'bar': lodash.constant('bar') });\n   *\n   * _.isFunction(_.foo);\n   * // => true\n   * _.isFunction(_.bar);\n   * // => false\n   *\n   * lodash.isFunction(lodash.foo);\n   * // => false\n   * lodash.isFunction(lodash.bar);\n   * // => true\n   *\n   * // using `context` to mock `Date#getTime` use in `_.now`\n   * var mock = _.runInContext({\n   *   'Date': function() {\n   *     return { 'getTime': getTimeMock };\n   *   }\n   * });\n   *\n   * // or creating a suped-up `defer` in Node.js\n   * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;\n   */\n  function runInContext(context) {\n    // Avoid issues with some ES3 environments that attempt to use values, named\n    // after built-in constructors like `Object`, for the creation of literals.\n    // ES5 clears this up by stating that literals must use built-in constructors.\n    // See https://es5.github.io/#x11.1.5 for more details.\n    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;\n\n    /** Native constructor references. */\n    var Array = context.Array,\n        Date = context.Date,\n        Error = context.Error,\n        Function = context.Function,\n        Math = context.Math,\n        Number = context.Number,\n        Object = context.Object,\n        RegExp = context.RegExp,\n        String = context.String,\n        TypeError = context.TypeError;\n\n    /** Used for native method references. */\n    var arrayProto = Array.prototype,\n        objectProto = Object.prototype,\n        stringProto = String.prototype;\n\n    /** Used to detect DOM support. */\n    var document = (document = context.window) && document.document;\n\n    /** Used to resolve the decompiled source of functions. */\n    var fnToString = Function.prototype.toString;\n\n    /** Used to the length of n-tuples for `_.unzip`. */\n    var getLength = baseProperty('length');\n\n    /** Used to check objects for own properties. */\n    var hasOwnProperty = objectProto.hasOwnProperty;\n\n    /** Used to generate unique IDs. */\n    var idCounter = 0;\n\n    /**\n     * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)\n     * of values.\n     */\n    var objToString = objectProto.toString;\n\n    /** Used to restore the original `_` reference in `_.noConflict`. */\n    var oldDash = context._;\n\n    /** Used to detect if a method is native. */\n    var reNative = RegExp('^' +\n      escapeRegExp(objToString)\n      .replace(/toString|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g, '$1.*?') + '$'\n    );\n\n    /** Native method references. */\n    var ArrayBuffer = isNative(ArrayBuffer = context.ArrayBuffer) && ArrayBuffer,\n        bufferSlice = isNative(bufferSlice = ArrayBuffer && new ArrayBuffer(0).slice) && bufferSlice,\n        ceil = Math.ceil,\n        clearTimeout = context.clearTimeout,\n        floor = Math.floor,\n        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,\n        push = arrayProto.push,\n        propertyIsEnumerable = objectProto.propertyIsEnumerable,\n        Set = isNative(Set = context.Set) && Set,\n        setTimeout = context.setTimeout,\n        splice = arrayProto.splice,\n        Uint8Array = isNative(Uint8Array = context.Uint8Array) && Uint8Array,\n        WeakMap = isNative(WeakMap = context.WeakMap) && WeakMap;\n\n    /** Used to clone array buffers. */\n    var Float64Array = (function() {\n      // Safari 5 errors when using an array buffer to initialize a typed array\n      // where the array buffer's `byteLength` is not a multiple of the typed\n      // array's `BYTES_PER_ELEMENT`.\n      try {\n        var func = isNative(func = context.Float64Array) && func,\n            result = new func(new ArrayBuffer(10), 0, 1) && func;\n      } catch(e) {}\n      return result;\n    }());\n\n    /* Native method references for those with the same name as other `lodash` methods. */\n    var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,\n        nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,\n        nativeIsFinite = context.isFinite,\n        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,\n        nativeMax = Math.max,\n        nativeMin = Math.min,\n        nativeNow = isNative(nativeNow = Date.now) && nativeNow,\n        nativeNumIsFinite = isNative(nativeNumIsFinite = Number.isFinite) && nativeNumIsFinite,\n        nativeParseInt = context.parseInt,\n        nativeRandom = Math.random;\n\n    /** Used as references for `-Infinity` and `Infinity`. */\n    var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY,\n        POSITIVE_INFINITY = Number.POSITIVE_INFINITY;\n\n    /** Used as references for the maximum length and index of an array. */\n    var MAX_ARRAY_LENGTH = Math.pow(2, 32) - 1,\n        MAX_ARRAY_INDEX =  MAX_ARRAY_LENGTH - 1,\n        HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;\n\n    /** Used as the size, in bytes, of each `Float64Array` element. */\n    var FLOAT64_BYTES_PER_ELEMENT = Float64Array ? Float64Array.BYTES_PER_ELEMENT : 0;\n\n    /**\n     * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)\n     * of an array-like value.\n     */\n    var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;\n\n    /** Used to store function metadata. */\n    var metaMap = WeakMap && new WeakMap;\n\n    /** Used to lookup unminified function names. */\n    var realNames = {};\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Creates a `lodash` object which wraps `value` to enable implicit chaining.\n     * Methods that operate on and return arrays, collections, and functions can\n     * be chained together. Methods that return a boolean or single value will\n     * automatically end the chain returning the unwrapped value. Explicit chaining\n     * may be enabled using `_.chain`. The execution of chained methods is lazy,\n     * that is, execution is deferred until `_#value` is implicitly or explicitly\n     * called.\n     *\n     * Lazy evaluation allows several methods to support shortcut fusion. Shortcut\n     * fusion is an optimization that merges iteratees to avoid creating intermediate\n     * arrays and reduce the number of iteratee executions.\n     *\n     * Chaining is supported in custom builds as long as the `_#value` method is\n     * directly or indirectly included in the build.\n     *\n     * In addition to lodash methods, wrappers have `Array` and `String` methods.\n     *\n     * The wrapper `Array` methods are:\n     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`,\n     * `splice`, and `unshift`\n     *\n     * The wrapper `String` methods are:\n     * `replace` and `split`\n     *\n     * The wrapper methods that support shortcut fusion are:\n     * `compact`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `filter`,\n     * `first`, `initial`, `last`, `map`, `pluck`, `reject`, `rest`, `reverse`,\n     * `slice`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `toArray`,\n     * and `where`\n     *\n     * The chainable wrapper methods are:\n     * `after`, `ary`, `assign`, `at`, `before`, `bind`, `bindAll`, `bindKey`,\n     * `callback`, `chain`, `chunk`, `commit`, `compact`, `concat`, `constant`,\n     * `countBy`, `create`, `curry`, `debounce`, `defaults`, `defer`, `delay`,\n     * `difference`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `fill`,\n     * `filter`, `flatten`, `flattenDeep`, `flow`, `flowRight`, `forEach`,\n     * `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `functions`,\n     * `groupBy`, `indexBy`, `initial`, `intersection`, `invert`, `invoke`, `keys`,\n     * `keysIn`, `map`, `mapValues`, `matches`, `matchesProperty`, `memoize`, `merge`,\n     * `mixin`, `negate`, `noop`, `omit`, `once`, `pairs`, `partial`, `partialRight`,\n     * `partition`, `pick`, `plant`, `pluck`, `property`, `propertyOf`, `pull`,\n     * `pullAt`, `push`, `range`, `rearg`, `reject`, `remove`, `rest`, `reverse`,\n     * `shuffle`, `slice`, `sort`, `sortBy`, `sortByAll`, `sortByOrder`, `splice`,\n     * `spread`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `tap`,\n     * `throttle`, `thru`, `times`, `toArray`, `toPlainObject`, `transform`,\n     * `union`, `uniq`, `unshift`, `unzip`, `values`, `valuesIn`, `where`,\n     * `without`, `wrap`, `xor`, `zip`, and `zipObject`\n     *\n     * The wrapper methods that are **not** chainable by default are:\n     * `add`, `attempt`, `camelCase`, `capitalize`, `clone`, `cloneDeep`, `deburr`,\n     * `endsWith`, `escape`, `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`,\n     * `findLast`, `findLastIndex`, `findLastKey`, `findWhere`, `first`, `has`,\n     * `identity`, `includes`, `indexOf`, `inRange`, `isArguments`, `isArray`,\n     * `isBoolean`, `isDate`, `isElement`, `isEmpty`, `isEqual`, `isError`,\n     * `isFinite`,`isFunction`, `isMatch`, `isNative`, `isNaN`, `isNull`, `isNumber`,\n     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`,\n     * `isTypedArray`, `join`, `kebabCase`, `last`, `lastIndexOf`, `max`, `min`,\n     * `noConflict`, `now`, `pad`, `padLeft`, `padRight`, `parseInt`, `pop`,\n     * `random`, `reduce`, `reduceRight`, `repeat`, `result`, `runInContext`,\n     * `shift`, `size`, `snakeCase`, `some`, `sortedIndex`, `sortedLastIndex`,\n     * `startCase`, `startsWith`, `sum`, `template`, `trim`, `trimLeft`,\n     * `trimRight`, `trunc`, `unescape`, `uniqueId`, `value`, and `words`\n     *\n     * The wrapper method `sample` will return a wrapped value when `n` is provided,\n     * otherwise an unwrapped value is returned.\n     *\n     * @name _\n     * @constructor\n     * @category Chain\n     * @param {*} value The value to wrap in a `lodash` instance.\n     * @returns {Object} Returns the new `lodash` wrapper instance.\n     * @example\n     *\n     * var wrapped = _([1, 2, 3]);\n     *\n     * // returns an unwrapped value\n     * wrapped.reduce(function(sum, n) {\n     *   return sum + n;\n     * });\n     * // => 6\n     *\n     * // returns a wrapped value\n     * var squares = wrapped.map(function(n) {\n     *   return n * n;\n     * });\n     *\n     * _.isArray(squares);\n     * // => false\n     *\n     * _.isArray(squares.value());\n     * // => true\n     */\n    function lodash(value) {\n      if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {\n        if (value instanceof LodashWrapper) {\n          return value;\n        }\n        if (hasOwnProperty.call(value, '__chain__') && hasOwnProperty.call(value, '__wrapped__')) {\n          return wrapperClone(value);\n        }\n      }\n      return new LodashWrapper(value);\n    }\n\n    /**\n     * The function whose prototype all chaining wrappers inherit from.\n     *\n     * @private\n     */\n    function baseLodash() {\n      // No operation performed.\n    }\n\n    /**\n     * The base constructor for creating `lodash` wrapper objects.\n     *\n     * @private\n     * @param {*} value The value to wrap.\n     * @param {boolean} [chainAll] Enable chaining for all wrapper methods.\n     * @param {Array} [actions=[]] Actions to peform to resolve the unwrapped value.\n     */\n    function LodashWrapper(value, chainAll, actions) {\n      this.__wrapped__ = value;\n      this.__actions__ = actions || [];\n      this.__chain__ = !!chainAll;\n    }\n\n    /**\n     * An object environment feature flags.\n     *\n     * @static\n     * @memberOf _\n     * @type Object\n     */\n    var support = lodash.support = {};\n\n    (function(x) {\n\n      /**\n       * Detect if functions can be decompiled by `Function#toString`\n       * (all but Firefox OS certified apps, older Opera mobile browsers, and\n       * the PlayStation 3; forced `false` for Windows 8 apps).\n       *\n       * @memberOf _.support\n       * @type boolean\n       */\n      support.funcDecomp = /\\bthis\\b/.test(function() { return this; });\n\n      /**\n       * Detect if `Function#name` is supported (all but IE).\n       *\n       * @memberOf _.support\n       * @type boolean\n       */\n      support.funcNames = typeof Function.name == 'string';\n\n      /**\n       * Detect if the DOM is supported.\n       *\n       * @memberOf _.support\n       * @type boolean\n       */\n      try {\n        support.dom = document.createDocumentFragment().nodeType === 11;\n      } catch(e) {\n        support.dom = false;\n      }\n\n      /**\n       * Detect if `arguments` object indexes are non-enumerable.\n       *\n       * In Firefox < 4, IE < 9, PhantomJS, and Safari < 5.1 `arguments` object\n       * indexes are non-enumerable. Chrome < 25 and Node.js < 0.11.0 treat\n       * `arguments` object indexes as non-enumerable and fail `hasOwnProperty`\n       * checks for indexes that exceed their function's formal parameters with\n       * associated values of `0`.\n       *\n       * @memberOf _.support\n       * @type boolean\n       */\n      try {\n        support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);\n      } catch(e) {\n        support.nonEnumArgs = true;\n      }\n    }(0, 0));\n\n    /**\n     * By default, the template delimiters used by lodash are like those in\n     * embedded Ruby (ERB). Change the following template settings to use\n     * alternative delimiters.\n     *\n     * @static\n     * @memberOf _\n     * @type Object\n     */\n    lodash.templateSettings = {\n\n      /**\n       * Used to detect `data` property values to be HTML-escaped.\n       *\n       * @memberOf _.templateSettings\n       * @type RegExp\n       */\n      'escape': reEscape,\n\n      /**\n       * Used to detect code to be evaluated.\n       *\n       * @memberOf _.templateSettings\n       * @type RegExp\n       */\n      'evaluate': reEvaluate,\n\n      /**\n       * Used to detect `data` property values to inject.\n       *\n       * @memberOf _.templateSettings\n       * @type RegExp\n       */\n      'interpolate': reInterpolate,\n\n      /**\n       * Used to reference the data object in the template text.\n       *\n       * @memberOf _.templateSettings\n       * @type string\n       */\n      'variable': '',\n\n      /**\n       * Used to import variables into the compiled template.\n       *\n       * @memberOf _.templateSettings\n       * @type Object\n       */\n      'imports': {\n\n        /**\n         * A reference to the `lodash` function.\n         *\n         * @memberOf _.templateSettings.imports\n         * @type Function\n         */\n        '_': lodash\n      }\n    };\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.\n     *\n     * @private\n     * @param {*} value The value to wrap.\n     */\n    function LazyWrapper(value) {\n      this.__wrapped__ = value;\n      this.__actions__ = null;\n      this.__dir__ = 1;\n      this.__dropCount__ = 0;\n      this.__filtered__ = false;\n      this.__iteratees__ = null;\n      this.__takeCount__ = POSITIVE_INFINITY;\n      this.__views__ = null;\n    }\n\n    /**\n     * Creates a clone of the lazy wrapper object.\n     *\n     * @private\n     * @name clone\n     * @memberOf LazyWrapper\n     * @returns {Object} Returns the cloned `LazyWrapper` object.\n     */\n    function lazyClone() {\n      var actions = this.__actions__,\n          iteratees = this.__iteratees__,\n          views = this.__views__,\n          result = new LazyWrapper(this.__wrapped__);\n\n      result.__actions__ = actions ? arrayCopy(actions) : null;\n      result.__dir__ = this.__dir__;\n      result.__filtered__ = this.__filtered__;\n      result.__iteratees__ = iteratees ? arrayCopy(iteratees) : null;\n      result.__takeCount__ = this.__takeCount__;\n      result.__views__ = views ? arrayCopy(views) : null;\n      return result;\n    }\n\n    /**\n     * Reverses the direction of lazy iteration.\n     *\n     * @private\n     * @name reverse\n     * @memberOf LazyWrapper\n     * @returns {Object} Returns the new reversed `LazyWrapper` object.\n     */\n    function lazyReverse() {\n      if (this.__filtered__) {\n        var result = new LazyWrapper(this);\n        result.__dir__ = -1;\n        result.__filtered__ = true;\n      } else {\n        result = this.clone();\n        result.__dir__ *= -1;\n      }\n      return result;\n    }\n\n    /**\n     * Extracts the unwrapped value from its lazy wrapper.\n     *\n     * @private\n     * @name value\n     * @memberOf LazyWrapper\n     * @returns {*} Returns the unwrapped value.\n     */\n    function lazyValue() {\n      var array = this.__wrapped__.value();\n      if (!isArray(array)) {\n        return baseWrapperValue(array, this.__actions__);\n      }\n      var dir = this.__dir__,\n          isRight = dir < 0,\n          view = getView(0, array.length, this.__views__),\n          start = view.start,\n          end = view.end,\n          length = end - start,\n          index = isRight ? end : (start - 1),\n          takeCount = nativeMin(length, this.__takeCount__),\n          iteratees = this.__iteratees__,\n          iterLength = iteratees ? iteratees.length : 0,\n          resIndex = 0,\n          result = [];\n\n      outer:\n      while (length-- && resIndex < takeCount) {\n        index += dir;\n\n        var iterIndex = -1,\n            value = array[index];\n\n        while (++iterIndex < iterLength) {\n          var data = iteratees[iterIndex],\n              iteratee = data.iteratee,\n              type = data.type;\n\n          if (type == LAZY_DROP_WHILE_FLAG) {\n            if (data.done && (isRight ? (index > data.index) : (index < data.index))) {\n              data.count = 0;\n              data.done = false;\n            }\n            data.index = index;\n            if (!data.done) {\n              var limit = data.limit;\n              if (!(data.done = limit > -1 ? (data.count++ >= limit) : !iteratee(value))) {\n                continue outer;\n              }\n            }\n          } else {\n            var computed = iteratee(value);\n            if (type == LAZY_MAP_FLAG) {\n              value = computed;\n            } else if (!computed) {\n              if (type == LAZY_FILTER_FLAG) {\n                continue outer;\n              } else {\n                break outer;\n              }\n            }\n          }\n        }\n        result[resIndex++] = value;\n      }\n      return result;\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Creates a cache object to store key/value pairs.\n     *\n     * @private\n     * @static\n     * @name Cache\n     * @memberOf _.memoize\n     */\n    function MapCache() {\n      this.__data__ = {};\n    }\n\n    /**\n     * Removes `key` and its value from the cache.\n     *\n     * @private\n     * @name delete\n     * @memberOf _.memoize.Cache\n     * @param {string} key The key of the value to remove.\n     * @returns {boolean} Returns `true` if the entry was removed successfully, else `false`.\n     */\n    function mapDelete(key) {\n      return this.has(key) && delete this.__data__[key];\n    }\n\n    /**\n     * Gets the cached value for `key`.\n     *\n     * @private\n     * @name get\n     * @memberOf _.memoize.Cache\n     * @param {string} key The key of the value to get.\n     * @returns {*} Returns the cached value.\n     */\n    function mapGet(key) {\n      return key == '__proto__' ? undefined : this.__data__[key];\n    }\n\n    /**\n     * Checks if a cached value for `key` exists.\n     *\n     * @private\n     * @name has\n     * @memberOf _.memoize.Cache\n     * @param {string} key The key of the entry to check.\n     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.\n     */\n    function mapHas(key) {\n      return key != '__proto__' && hasOwnProperty.call(this.__data__, key);\n    }\n\n    /**\n     * Adds `value` to `key` of the cache.\n     *\n     * @private\n     * @name set\n     * @memberOf _.memoize.Cache\n     * @param {string} key The key of the value to cache.\n     * @param {*} value The value to cache.\n     * @returns {Object} Returns the cache object.\n     */\n    function mapSet(key, value) {\n      if (key != '__proto__') {\n        this.__data__[key] = value;\n      }\n      return this;\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     *\n     * Creates a cache object to store unique values.\n     *\n     * @private\n     * @param {Array} [values] The values to cache.\n     */\n    function SetCache(values) {\n      var length = values ? values.length : 0;\n\n      this.data = { 'hash': nativeCreate(null), 'set': new Set };\n      while (length--) {\n        this.push(values[length]);\n      }\n    }\n\n    /**\n     * Checks if `value` is in `cache` mimicking the return signature of\n     * `_.indexOf` by returning `0` if the value is found, else `-1`.\n     *\n     * @private\n     * @param {Object} cache The cache to search.\n     * @param {*} value The value to search for.\n     * @returns {number} Returns `0` if `value` is found, else `-1`.\n     */\n    function cacheIndexOf(cache, value) {\n      var data = cache.data,\n          result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];\n\n      return result ? 0 : -1;\n    }\n\n    /**\n     * Adds `value` to the cache.\n     *\n     * @private\n     * @name push\n     * @memberOf SetCache\n     * @param {*} value The value to cache.\n     */\n    function cachePush(value) {\n      var data = this.data;\n      if (typeof value == 'string' || isObject(value)) {\n        data.set.add(value);\n      } else {\n        data.hash[value] = true;\n      }\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Copies the values of `source` to `array`.\n     *\n     * @private\n     * @param {Array} source The array to copy values from.\n     * @param {Array} [array=[]] The array to copy values to.\n     * @returns {Array} Returns `array`.\n     */\n    function arrayCopy(source, array) {\n      var index = -1,\n          length = source.length;\n\n      array || (array = Array(length));\n      while (++index < length) {\n        array[index] = source[index];\n      }\n      return array;\n    }\n\n    /**\n     * A specialized version of `_.forEach` for arrays without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @returns {Array} Returns `array`.\n     */\n    function arrayEach(array, iteratee) {\n      var index = -1,\n          length = array.length;\n\n      while (++index < length) {\n        if (iteratee(array[index], index, array) === false) {\n          break;\n        }\n      }\n      return array;\n    }\n\n    /**\n     * A specialized version of `_.forEachRight` for arrays without support for\n     * callback shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @returns {Array} Returns `array`.\n     */\n    function arrayEachRight(array, iteratee) {\n      var length = array.length;\n\n      while (length--) {\n        if (iteratee(array[length], length, array) === false) {\n          break;\n        }\n      }\n      return array;\n    }\n\n    /**\n     * A specialized version of `_.every` for arrays without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @param {Function} predicate The function invoked per iteration.\n     * @returns {boolean} Returns `true` if all elements pass the predicate check,\n     *  else `false`.\n     */\n    function arrayEvery(array, predicate) {\n      var index = -1,\n          length = array.length;\n\n      while (++index < length) {\n        if (!predicate(array[index], index, array)) {\n          return false;\n        }\n      }\n      return true;\n    }\n\n    /**\n     * A specialized version of `_.filter` for arrays without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @param {Function} predicate The function invoked per iteration.\n     * @returns {Array} Returns the new filtered array.\n     */\n    function arrayFilter(array, predicate) {\n      var index = -1,\n          length = array.length,\n          resIndex = -1,\n          result = [];\n\n      while (++index < length) {\n        var value = array[index];\n        if (predicate(value, index, array)) {\n          result[++resIndex] = value;\n        }\n      }\n      return result;\n    }\n\n    /**\n     * A specialized version of `_.map` for arrays without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @returns {Array} Returns the new mapped array.\n     */\n    function arrayMap(array, iteratee) {\n      var index = -1,\n          length = array.length,\n          result = Array(length);\n\n      while (++index < length) {\n        result[index] = iteratee(array[index], index, array);\n      }\n      return result;\n    }\n\n    /**\n     * A specialized version of `_.max` for arrays without support for iteratees.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @returns {*} Returns the maximum value.\n     */\n    function arrayMax(array) {\n      var index = -1,\n          length = array.length,\n          result = NEGATIVE_INFINITY;\n\n      while (++index < length) {\n        var value = array[index];\n        if (value > result) {\n          result = value;\n        }\n      }\n      return result;\n    }\n\n    /**\n     * A specialized version of `_.min` for arrays without support for iteratees.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @returns {*} Returns the minimum value.\n     */\n    function arrayMin(array) {\n      var index = -1,\n          length = array.length,\n          result = POSITIVE_INFINITY;\n\n      while (++index < length) {\n        var value = array[index];\n        if (value < result) {\n          result = value;\n        }\n      }\n      return result;\n    }\n\n    /**\n     * A specialized version of `_.reduce` for arrays without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @param {*} [accumulator] The initial value.\n     * @param {boolean} [initFromArray] Specify using the first element of `array`\n     *  as the initial value.\n     * @returns {*} Returns the accumulated value.\n     */\n    function arrayReduce(array, iteratee, accumulator, initFromArray) {\n      var index = -1,\n          length = array.length;\n\n      if (initFromArray && length) {\n        accumulator = array[++index];\n      }\n      while (++index < length) {\n        accumulator = iteratee(accumulator, array[index], index, array);\n      }\n      return accumulator;\n    }\n\n    /**\n     * A specialized version of `_.reduceRight` for arrays without support for\n     * callback shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @param {*} [accumulator] The initial value.\n     * @param {boolean} [initFromArray] Specify using the last element of `array`\n     *  as the initial value.\n     * @returns {*} Returns the accumulated value.\n     */\n    function arrayReduceRight(array, iteratee, accumulator, initFromArray) {\n      var length = array.length;\n      if (initFromArray && length) {\n        accumulator = array[--length];\n      }\n      while (length--) {\n        accumulator = iteratee(accumulator, array[length], length, array);\n      }\n      return accumulator;\n    }\n\n    /**\n     * A specialized version of `_.some` for arrays without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @param {Function} predicate The function invoked per iteration.\n     * @returns {boolean} Returns `true` if any element passes the predicate check,\n     *  else `false`.\n     */\n    function arraySome(array, predicate) {\n      var index = -1,\n          length = array.length;\n\n      while (++index < length) {\n        if (predicate(array[index], index, array)) {\n          return true;\n        }\n      }\n      return false;\n    }\n\n    /**\n     * A specialized version of `_.sum` for arrays without support for iteratees.\n     *\n     * @private\n     * @param {Array} array The array to iterate over.\n     * @returns {number} Returns the sum.\n     */\n    function arraySum(array) {\n      var length = array.length,\n          result = 0;\n\n      while (length--) {\n        result += +array[length] || 0;\n      }\n      return result;\n    }\n\n    /**\n     * Used by `_.defaults` to customize its `_.assign` use.\n     *\n     * @private\n     * @param {*} objectValue The destination object property value.\n     * @param {*} sourceValue The source object property value.\n     * @returns {*} Returns the value to assign to the destination object.\n     */\n    function assignDefaults(objectValue, sourceValue) {\n      return typeof objectValue == 'undefined' ? sourceValue : objectValue;\n    }\n\n    /**\n     * Used by `_.template` to customize its `_.assign` use.\n     *\n     * **Note:** This method is like `assignDefaults` except that it ignores\n     * inherited property values when checking if a property is `undefined`.\n     *\n     * @private\n     * @param {*} objectValue The destination object property value.\n     * @param {*} sourceValue The source object property value.\n     * @param {string} key The key associated with the object and source values.\n     * @param {Object} object The destination object.\n     * @returns {*} Returns the value to assign to the destination object.\n     */\n    function assignOwnDefaults(objectValue, sourceValue, key, object) {\n      return (typeof objectValue == 'undefined' || !hasOwnProperty.call(object, key))\n        ? sourceValue\n        : objectValue;\n    }\n\n    /**\n     * The base implementation of `_.assign` without support for argument juggling,\n     * multiple sources, and `this` binding `customizer` functions.\n     *\n     * @private\n     * @param {Object} object The destination object.\n     * @param {Object} source The source object.\n     * @param {Function} [customizer] The function to customize assigning values.\n     * @returns {Object} Returns the destination object.\n     */\n    function baseAssign(object, source, customizer) {\n      var props = keys(source);\n      if (!customizer) {\n        return baseCopy(source, object, props);\n      }\n      var index = -1,\n          length = props.length;\n\n      while (++index < length) {\n        var key = props[index],\n            value = object[key],\n            result = customizer(value, source[key], key, object, source);\n\n        if ((result === result ? (result !== value) : (value === value)) ||\n            (typeof value == 'undefined' && !(key in object))) {\n          object[key] = result;\n        }\n      }\n      return object;\n    }\n\n    /**\n     * The base implementation of `_.at` without support for strings and individual\n     * key arguments.\n     *\n     * @private\n     * @param {Array|Object} collection The collection to iterate over.\n     * @param {number[]|string[]} [props] The property names or indexes of elements to pick.\n     * @returns {Array} Returns the new array of picked elements.\n     */\n    function baseAt(collection, props) {\n      var index = -1,\n          length = collection.length,\n          isArr = isLength(length),\n          propsLength = props.length,\n          result = Array(propsLength);\n\n      while(++index < propsLength) {\n        var key = props[index];\n        if (isArr) {\n          key = parseFloat(key);\n          result[index] = isIndex(key, length) ? collection[key] : undefined;\n        } else {\n          result[index] = collection[key];\n        }\n      }\n      return result;\n    }\n\n    /**\n     * Copies the properties of `source` to `object`.\n     *\n     * @private\n     * @param {Object} source The object to copy properties from.\n     * @param {Object} [object={}] The object to copy properties to.\n     * @param {Array} props The property names to copy.\n     * @returns {Object} Returns `object`.\n     */\n    function baseCopy(source, object, props) {\n      if (!props) {\n        props = object;\n        object = {};\n      }\n      var index = -1,\n          length = props.length;\n\n      while (++index < length) {\n        var key = props[index];\n        object[key] = source[key];\n      }\n      return object;\n    }\n\n    /**\n     * The base implementation of `_.callback` which supports specifying the\n     * number of arguments to provide to `func`.\n     *\n     * @private\n     * @param {*} [func=_.identity] The value to convert to a callback.\n     * @param {*} [thisArg] The `this` binding of `func`.\n     * @param {number} [argCount] The number of arguments to provide to `func`.\n     * @returns {Function} Returns the callback.\n     */\n    function baseCallback(func, thisArg, argCount) {\n      var type = typeof func;\n      if (type == 'function') {\n        return typeof thisArg == 'undefined'\n          ? func\n          : bindCallback(func, thisArg, argCount);\n      }\n      if (func == null) {\n        return identity;\n      }\n      if (type == 'object') {\n        return baseMatches(func);\n      }\n      return typeof thisArg == 'undefined'\n        ? baseProperty(func + '')\n        : baseMatchesProperty(func + '', thisArg);\n    }\n\n    /**\n     * The base implementation of `_.clone` without support for argument juggling\n     * and `this` binding `customizer` functions.\n     *\n     * @private\n     * @param {*} value The value to clone.\n     * @param {boolean} [isDeep] Specify a deep clone.\n     * @param {Function} [customizer] The function to customize cloning values.\n     * @param {string} [key] The key of `value`.\n     * @param {Object} [object] The object `value` belongs to.\n     * @param {Array} [stackA=[]] Tracks traversed source objects.\n     * @param {Array} [stackB=[]] Associates clones with source counterparts.\n     * @returns {*} Returns the cloned value.\n     */\n    function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {\n      var result;\n      if (customizer) {\n        result = object ? customizer(value, key, object) : customizer(value);\n      }\n      if (typeof result != 'undefined') {\n        return result;\n      }\n      if (!isObject(value)) {\n        return value;\n      }\n      var isArr = isArray(value);\n      if (isArr) {\n        result = initCloneArray(value);\n        if (!isDeep) {\n          return arrayCopy(value, result);\n        }\n      } else {\n        var tag = objToString.call(value),\n            isFunc = tag == funcTag;\n\n        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {\n          result = initCloneObject(isFunc ? {} : value);\n          if (!isDeep) {\n            return baseCopy(value, result, keys(value));\n          }\n        } else {\n          return cloneableTags[tag]\n            ? initCloneByTag(value, tag, isDeep)\n            : (object ? value : {});\n        }\n      }\n      // Check for circular references and return corresponding clone.\n      stackA || (stackA = []);\n      stackB || (stackB = []);\n\n      var length = stackA.length;\n      while (length--) {\n        if (stackA[length] == value) {\n          return stackB[length];\n        }\n      }\n      // Add the source value to the stack of traversed objects and associate it with its clone.\n      stackA.push(value);\n      stackB.push(result);\n\n      // Recursively populate clone (susceptible to call stack limits).\n      (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {\n        result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);\n      });\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.create` without support for assigning\n     * properties to the created object.\n     *\n     * @private\n     * @param {Object} prototype The object to inherit from.\n     * @returns {Object} Returns the new object.\n     */\n    var baseCreate = (function() {\n      function Object() {}\n      return function(prototype) {\n        if (isObject(prototype)) {\n          Object.prototype = prototype;\n          var result = new Object;\n          Object.prototype = null;\n        }\n        return result || context.Object();\n      };\n    }());\n\n    /**\n     * The base implementation of `_.delay` and `_.defer` which accepts an index\n     * of where to slice the arguments to provide to `func`.\n     *\n     * @private\n     * @param {Function} func The function to delay.\n     * @param {number} wait The number of milliseconds to delay invocation.\n     * @param {Object} args The arguments provide to `func`.\n     * @returns {number} Returns the timer id.\n     */\n    function baseDelay(func, wait, args) {\n      if (typeof func != 'function') {\n        throw new TypeError(FUNC_ERROR_TEXT);\n      }\n      return setTimeout(function() { func.apply(undefined, args); }, wait);\n    }\n\n    /**\n     * The base implementation of `_.difference` which accepts a single array\n     * of values to exclude.\n     *\n     * @private\n     * @param {Array} array The array to inspect.\n     * @param {Array} values The values to exclude.\n     * @returns {Array} Returns the new array of filtered values.\n     */\n    function baseDifference(array, values) {\n      var length = array ? array.length : 0,\n          result = [];\n\n      if (!length) {\n        return result;\n      }\n      var index = -1,\n          indexOf = getIndexOf(),\n          isCommon = indexOf == baseIndexOf,\n          cache = (isCommon && values.length >= 200) ? createCache(values) : null,\n          valuesLength = values.length;\n\n      if (cache) {\n        indexOf = cacheIndexOf;\n        isCommon = false;\n        values = cache;\n      }\n      outer:\n      while (++index < length) {\n        var value = array[index];\n\n        if (isCommon && value === value) {\n          var valuesIndex = valuesLength;\n          while (valuesIndex--) {\n            if (values[valuesIndex] === value) {\n              continue outer;\n            }\n          }\n          result.push(value);\n        }\n        else if (indexOf(values, value, 0) < 0) {\n          result.push(value);\n        }\n      }\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.forEach` without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @returns {Array|Object|string} Returns `collection`.\n     */\n    var baseEach = createBaseEach(baseForOwn);\n\n    /**\n     * The base implementation of `_.forEachRight` without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @returns {Array|Object|string} Returns `collection`.\n     */\n    var baseEachRight = createBaseEach(baseForOwnRight, true);\n\n    /**\n     * The base implementation of `_.every` without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} predicate The function invoked per iteration.\n     * @returns {boolean} Returns `true` if all elements pass the predicate check,\n     *  else `false`\n     */\n    function baseEvery(collection, predicate) {\n      var result = true;\n      baseEach(collection, function(value, index, collection) {\n        result = !!predicate(value, index, collection);\n        return result;\n      });\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.fill` without an iteratee call guard.\n     *\n     * @private\n     * @param {Array} array The array to fill.\n     * @param {*} value The value to fill `array` with.\n     * @param {number} [start=0] The start position.\n     * @param {number} [end=array.length] The end position.\n     * @returns {Array} Returns `array`.\n     */\n    function baseFill(array, value, start, end) {\n      var length = array.length;\n\n      start = start == null ? 0 : (+start || 0);\n      if (start < 0) {\n        start = -start > length ? 0 : (length + start);\n      }\n      end = (typeof end == 'undefined' || end > length) ? length : (+end || 0);\n      if (end < 0) {\n        end += length;\n      }\n      length = start > end ? 0 : (end >>> 0);\n      start >>>= 0;\n\n      while (start < length) {\n        array[start++] = value;\n      }\n      return array;\n    }\n\n    /**\n     * The base implementation of `_.filter` without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} predicate The function invoked per iteration.\n     * @returns {Array} Returns the new filtered array.\n     */\n    function baseFilter(collection, predicate) {\n      var result = [];\n      baseEach(collection, function(value, index, collection) {\n        if (predicate(value, index, collection)) {\n          result.push(value);\n        }\n      });\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,\n     * without support for callback shorthands and `this` binding, which iterates\n     * over `collection` using the provided `eachFunc`.\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to search.\n     * @param {Function} predicate The function invoked per iteration.\n     * @param {Function} eachFunc The function to iterate over `collection`.\n     * @param {boolean} [retKey] Specify returning the key of the found element\n     *  instead of the element itself.\n     * @returns {*} Returns the found element or its key, else `undefined`.\n     */\n    function baseFind(collection, predicate, eachFunc, retKey) {\n      var result;\n      eachFunc(collection, function(value, key, collection) {\n        if (predicate(value, key, collection)) {\n          result = retKey ? key : value;\n          return false;\n        }\n      });\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.flatten` with added support for restricting\n     * flattening and specifying the start index.\n     *\n     * @private\n     * @param {Array} array The array to flatten.\n     * @param {boolean} isDeep Specify a deep flatten.\n     * @param {boolean} isStrict Restrict flattening to arrays and `arguments` objects.\n     * @returns {Array} Returns the new flattened array.\n     */\n    function baseFlatten(array, isDeep, isStrict) {\n      var index = -1,\n          length = array.length,\n          resIndex = -1,\n          result = [];\n\n      while (++index < length) {\n        var value = array[index];\n\n        if (isObjectLike(value) && isLength(value.length) && (isArray(value) || isArguments(value))) {\n          if (isDeep) {\n            // Recursively flatten arrays (susceptible to call stack limits).\n            value = baseFlatten(value, isDeep, isStrict);\n          }\n          var valIndex = -1,\n              valLength = value.length;\n\n          result.length += valLength;\n          while (++valIndex < valLength) {\n            result[++resIndex] = value[valIndex];\n          }\n        } else if (!isStrict) {\n          result[++resIndex] = value;\n        }\n      }\n      return result;\n    }\n\n    /**\n     * The base implementation of `baseForIn` and `baseForOwn` which iterates\n     * over `object` properties returned by `keysFunc` invoking `iteratee` for\n     * each property. Iterator functions may exit iteration early by explicitly\n     * returning `false`.\n     *\n     * @private\n     * @param {Object} object The object to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @param {Function} keysFunc The function to get the keys of `object`.\n     * @returns {Object} Returns `object`.\n     */\n    var baseFor = createBaseFor();\n\n    /**\n     * This function is like `baseFor` except that it iterates over properties\n     * in the opposite order.\n     *\n     * @private\n     * @param {Object} object The object to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @param {Function} keysFunc The function to get the keys of `object`.\n     * @returns {Object} Returns `object`.\n     */\n    var baseForRight = createBaseFor(true);\n\n    /**\n     * The base implementation of `_.forIn` without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Object} object The object to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @returns {Object} Returns `object`.\n     */\n    function baseForIn(object, iteratee) {\n      return baseFor(object, iteratee, keysIn);\n    }\n\n    /**\n     * The base implementation of `_.forOwn` without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Object} object The object to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @returns {Object} Returns `object`.\n     */\n    function baseForOwn(object, iteratee) {\n      return baseFor(object, iteratee, keys);\n    }\n\n    /**\n     * The base implementation of `_.forOwnRight` without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Object} object The object to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @returns {Object} Returns `object`.\n     */\n    function baseForOwnRight(object, iteratee) {\n      return baseForRight(object, iteratee, keys);\n    }\n\n    /**\n     * The base implementation of `_.functions` which creates an array of\n     * `object` function property names filtered from those provided.\n     *\n     * @private\n     * @param {Object} object The object to inspect.\n     * @param {Array} props The property names to filter.\n     * @returns {Array} Returns the new array of filtered property names.\n     */\n    function baseFunctions(object, props) {\n      var index = -1,\n          length = props.length,\n          resIndex = -1,\n          result = [];\n\n      while (++index < length) {\n        var key = props[index];\n        if (isFunction(object[key])) {\n          result[++resIndex] = key;\n        }\n      }\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.isEqual` without support for `this` binding\n     * `customizer` functions.\n     *\n     * @private\n     * @param {*} value The value to compare.\n     * @param {*} other The other value to compare.\n     * @param {Function} [customizer] The function to customize comparing values.\n     * @param {boolean} [isLoose] Specify performing partial comparisons.\n     * @param {Array} [stackA] Tracks traversed `value` objects.\n     * @param {Array} [stackB] Tracks traversed `other` objects.\n     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.\n     */\n    function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {\n      // Exit early for identical values.\n      if (value === other) {\n        // Treat `+0` vs. `-0` as not equal.\n        return value !== 0 || (1 / value == 1 / other);\n      }\n      var valType = typeof value,\n          othType = typeof other;\n\n      // Exit early for unlike primitive values.\n      if ((valType != 'function' && valType != 'object' && othType != 'function' && othType != 'object') ||\n          value == null || other == null) {\n        // Return `false` unless both values are `NaN`.\n        return value !== value && other !== other;\n      }\n      return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);\n    }\n\n    /**\n     * A specialized version of `baseIsEqual` for arrays and objects which performs\n     * deep comparisons and tracks traversed objects enabling objects with circular\n     * references to be compared.\n     *\n     * @private\n     * @param {Object} object The object to compare.\n     * @param {Object} other The other object to compare.\n     * @param {Function} equalFunc The function to determine equivalents of values.\n     * @param {Function} [customizer] The function to customize comparing objects.\n     * @param {boolean} [isLoose] Specify performing partial comparisons.\n     * @param {Array} [stackA=[]] Tracks traversed `value` objects.\n     * @param {Array} [stackB=[]] Tracks traversed `other` objects.\n     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.\n     */\n    function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {\n      var objIsArr = isArray(object),\n          othIsArr = isArray(other),\n          objTag = arrayTag,\n          othTag = arrayTag;\n\n      if (!objIsArr) {\n        objTag = objToString.call(object);\n        if (objTag == argsTag) {\n          objTag = objectTag;\n        } else if (objTag != objectTag) {\n          objIsArr = isTypedArray(object);\n        }\n      }\n      if (!othIsArr) {\n        othTag = objToString.call(other);\n        if (othTag == argsTag) {\n          othTag = objectTag;\n        } else if (othTag != objectTag) {\n          othIsArr = isTypedArray(other);\n        }\n      }\n      var objIsObj = (objTag == objectTag || (isLoose && objTag == funcTag)),\n          othIsObj = (othTag == objectTag || (isLoose && othTag == funcTag)),\n          isSameTag = objTag == othTag;\n\n      if (isSameTag && !(objIsArr || objIsObj)) {\n        return equalByTag(object, other, objTag);\n      }\n      if (isLoose) {\n        if (!isSameTag && !(objIsObj && othIsObj)) {\n          return false;\n        }\n      } else {\n        var valWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),\n            othWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');\n\n        if (valWrapped || othWrapped) {\n          return equalFunc(valWrapped ? object.value() : object, othWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);\n        }\n        if (!isSameTag) {\n          return false;\n        }\n      }\n      // Assume cyclic values are equal.\n      // For more information on detecting circular references see https://es5.github.io/#JO.\n      stackA || (stackA = []);\n      stackB || (stackB = []);\n\n      var length = stackA.length;\n      while (length--) {\n        if (stackA[length] == object) {\n          return stackB[length] == other;\n        }\n      }\n      // Add `object` and `other` to the stack of traversed objects.\n      stackA.push(object);\n      stackB.push(other);\n\n      var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);\n\n      stackA.pop();\n      stackB.pop();\n\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.isMatch` without support for callback\n     * shorthands and `this` binding.\n     *\n     * @private\n     * @param {Object} object The object to inspect.\n     * @param {Array} props The source property names to match.\n     * @param {Array} values The source values to match.\n     * @param {Array} strictCompareFlags Strict comparison flags for source values.\n     * @param {Function} [customizer] The function to customize comparing objects.\n     * @returns {boolean} Returns `true` if `object` is a match, else `false`.\n     */\n    function baseIsMatch(object, props, values, strictCompareFlags, customizer) {\n      var index = -1,\n          length = props.length,\n          noCustomizer = !customizer;\n\n      while (++index < length) {\n        if ((noCustomizer && strictCompareFlags[index])\n              ? values[index] !== object[props[index]]\n              : !(props[index] in object)\n            ) {\n          return false;\n        }\n      }\n      index = -1;\n      while (++index < length) {\n        var key = props[index],\n            objValue = object[key],\n            srcValue = values[index];\n\n        if (noCustomizer && strictCompareFlags[index]) {\n          var result = typeof objValue != 'undefined' || (key in object);\n        } else {\n          result = customizer ? customizer(objValue, srcValue, key) : undefined;\n          if (typeof result == 'undefined') {\n            result = baseIsEqual(srcValue, objValue, customizer, true);\n          }\n        }\n        if (!result) {\n          return false;\n        }\n      }\n      return true;\n    }\n\n    /**\n     * The base implementation of `_.map` without support for callback shorthands\n     * and `this` binding.\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @returns {Array} Returns the new mapped array.\n     */\n    function baseMap(collection, iteratee) {\n      var result = [];\n      baseEach(collection, function(value, key, collection) {\n        result.push(iteratee(value, key, collection));\n      });\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.matches` which does not clone `source`.\n     *\n     * @private\n     * @param {Object} source The object of property values to match.\n     * @returns {Function} Returns the new function.\n     */\n    function baseMatches(source) {\n      var props = keys(source),\n          length = props.length;\n\n      if (!length) {\n        return constant(true);\n      }\n      if (length == 1) {\n        var key = props[0],\n            value = source[key];\n\n        if (isStrictComparable(value)) {\n          return function(object) {\n            return object != null && object[key] === value &&\n              (typeof value != 'undefined' || (key in toObject(object)));\n          };\n        }\n      }\n      var values = Array(length),\n          strictCompareFlags = Array(length);\n\n      while (length--) {\n        value = source[props[length]];\n        values[length] = value;\n        strictCompareFlags[length] = isStrictComparable(value);\n      }\n      return function(object) {\n        return object != null && baseIsMatch(toObject(object), props, values, strictCompareFlags);\n      };\n    }\n\n    /**\n     * The base implementation of `_.matchesProperty` which does not coerce `key`\n     * to a string.\n     *\n     * @private\n     * @param {string} key The key of the property to get.\n     * @param {*} value The value to compare.\n     * @returns {Function} Returns the new function.\n     */\n    function baseMatchesProperty(key, value) {\n      if (isStrictComparable(value)) {\n        return function(object) {\n          return object != null && object[key] === value &&\n            (typeof value != 'undefined' || (key in toObject(object)));\n        };\n      }\n      return function(object) {\n        return object != null && baseIsEqual(value, object[key], null, true);\n      };\n    }\n\n    /**\n     * The base implementation of `_.merge` without support for argument juggling,\n     * multiple sources, and `this` binding `customizer` functions.\n     *\n     * @private\n     * @param {Object} object The destination object.\n     * @param {Object} source The source object.\n     * @param {Function} [customizer] The function to customize merging properties.\n     * @param {Array} [stackA=[]] Tracks traversed source objects.\n     * @param {Array} [stackB=[]] Associates values with source counterparts.\n     * @returns {Object} Returns the destination object.\n     */\n    function baseMerge(object, source, customizer, stackA, stackB) {\n      if (!isObject(object)) {\n        return object;\n      }\n      var isSrcArr = isLength(source.length) && (isArray(source) || isTypedArray(source));\n      (isSrcArr ? arrayEach : baseForOwn)(source, function(srcValue, key, source) {\n        if (isObjectLike(srcValue)) {\n          stackA || (stackA = []);\n          stackB || (stackB = []);\n          return baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);\n        }\n        var value = object[key],\n            result = customizer ? customizer(value, srcValue, key, object, source) : undefined,\n            isCommon = typeof result == 'undefined';\n\n        if (isCommon) {\n          result = srcValue;\n        }\n        if ((isSrcArr || typeof result != 'undefined') &&\n            (isCommon || (result === result ? (result !== value) : (value === value)))) {\n          object[key] = result;\n        }\n      });\n      return object;\n    }\n\n    /**\n     * A specialized version of `baseMerge` for arrays and objects which performs\n     * deep merges and tracks traversed objects enabling objects with circular\n     * references to be merged.\n     *\n     * @private\n     * @param {Object} object The destination object.\n     * @param {Object} source The source object.\n     * @param {string} key The key of the value to merge.\n     * @param {Function} mergeFunc The function to merge values.\n     * @param {Function} [customizer] The function to customize merging properties.\n     * @param {Array} [stackA=[]] Tracks traversed source objects.\n     * @param {Array} [stackB=[]] Associates values with source counterparts.\n     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.\n     */\n    function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {\n      var length = stackA.length,\n          srcValue = source[key];\n\n      while (length--) {\n        if (stackA[length] == srcValue) {\n          object[key] = stackB[length];\n          return;\n        }\n      }\n      var value = object[key],\n          result = customizer ? customizer(value, srcValue, key, object, source) : undefined,\n          isCommon = typeof result == 'undefined';\n\n      if (isCommon) {\n        result = srcValue;\n        if (isLength(srcValue.length) && (isArray(srcValue) || isTypedArray(srcValue))) {\n          result = isArray(value)\n            ? value\n            : ((value && value.length) ? arrayCopy(value) : []);\n        }\n        else if (isPlainObject(srcValue) || isArguments(srcValue)) {\n          result = isArguments(value)\n            ? toPlainObject(value)\n            : (isPlainObject(value) ? value : {});\n        }\n        else {\n          isCommon = false;\n        }\n      }\n      // Add the source value to the stack of traversed objects and associate\n      // it with its merged value.\n      stackA.push(srcValue);\n      stackB.push(result);\n\n      if (isCommon) {\n        // Recursively merge objects and arrays (susceptible to call stack limits).\n        object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);\n      } else if (result === result ? (result !== value) : (value === value)) {\n        object[key] = result;\n      }\n    }\n\n    /**\n     * The base implementation of `_.property` which does not coerce `key` to a string.\n     *\n     * @private\n     * @param {string} key The key of the property to get.\n     * @returns {Function} Returns the new function.\n     */\n    function baseProperty(key) {\n      return function(object) {\n        return object == null ? undefined : object[key];\n      };\n    }\n\n    /**\n     * The base implementation of `_.random` without support for argument juggling\n     * and returning floating-point numbers.\n     *\n     * @private\n     * @param {number} min The minimum possible value.\n     * @param {number} max The maximum possible value.\n     * @returns {number} Returns the random number.\n     */\n    function baseRandom(min, max) {\n      return min + floor(nativeRandom() * (max - min + 1));\n    }\n\n    /**\n     * The base implementation of `_.reduce` and `_.reduceRight` without support\n     * for callback shorthands and `this` binding, which iterates over `collection`\n     * using the provided `eachFunc`.\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @param {*} accumulator The initial value.\n     * @param {boolean} initFromCollection Specify using the first or last element\n     *  of `collection` as the initial value.\n     * @param {Function} eachFunc The function to iterate over `collection`.\n     * @returns {*} Returns the accumulated value.\n     */\n    function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {\n      eachFunc(collection, function(value, index, collection) {\n        accumulator = initFromCollection\n          ? (initFromCollection = false, value)\n          : iteratee(accumulator, value, index, collection);\n      });\n      return accumulator;\n    }\n\n    /**\n     * The base implementation of `setData` without support for hot loop detection.\n     *\n     * @private\n     * @param {Function} func The function to associate metadata with.\n     * @param {*} data The metadata.\n     * @returns {Function} Returns `func`.\n     */\n    var baseSetData = !metaMap ? identity : function(func, data) {\n      metaMap.set(func, data);\n      return func;\n    };\n\n    /**\n     * The base implementation of `_.slice` without an iteratee call guard.\n     *\n     * @private\n     * @param {Array} array The array to slice.\n     * @param {number} [start=0] The start position.\n     * @param {number} [end=array.length] The end position.\n     * @returns {Array} Returns the slice of `array`.\n     */\n    function baseSlice(array, start, end) {\n      var index = -1,\n          length = array.length;\n\n      start = start == null ? 0 : (+start || 0);\n      if (start < 0) {\n        start = -start > length ? 0 : (length + start);\n      }\n      end = (typeof end == 'undefined' || end > length) ? length : (+end || 0);\n      if (end < 0) {\n        end += length;\n      }\n      length = start > end ? 0 : ((end - start) >>> 0);\n      start >>>= 0;\n\n      var result = Array(length);\n      while (++index < length) {\n        result[index] = array[index + start];\n      }\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.some` without support for callback shorthands\n     * and `this` binding.\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} predicate The function invoked per iteration.\n     * @returns {boolean} Returns `true` if any element passes the predicate check,\n     *  else `false`.\n     */\n    function baseSome(collection, predicate) {\n      var result;\n\n      baseEach(collection, function(value, index, collection) {\n        result = predicate(value, index, collection);\n        return !result;\n      });\n      return !!result;\n    }\n\n    /**\n     * The base implementation of `_.sortBy` which uses `comparer` to define\n     * the sort order of `array` and replaces criteria objects with their\n     * corresponding values.\n     *\n     * @private\n     * @param {Array} array The array to sort.\n     * @param {Function} comparer The function to define sort order.\n     * @returns {Array} Returns `array`.\n     */\n    function baseSortBy(array, comparer) {\n      var length = array.length;\n\n      array.sort(comparer);\n      while (length--) {\n        array[length] = array[length].value;\n      }\n      return array;\n    }\n\n    /**\n     * The base implementation of `_.sortByOrder` without param guards.\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {string[]} props The property names to sort by.\n     * @param {boolean[]} orders The sort orders of `props`.\n     * @returns {Array} Returns the new sorted array.\n     */\n    function baseSortByOrder(collection, props, orders) {\n      var index = -1,\n          length = collection.length,\n          result = isLength(length) ? Array(length) : [];\n\n      baseEach(collection, function(value) {\n        var length = props.length,\n            criteria = Array(length);\n\n        while (length--) {\n          criteria[length] = value == null ? undefined : value[props[length]];\n        }\n        result[++index] = { 'criteria': criteria, 'index': index, 'value': value };\n      });\n\n      return baseSortBy(result, function(object, other) {\n        return compareMultiple(object, other, orders);\n      });\n    }\n\n    /**\n     * The base implementation of `_.sum` without support for callback shorthands\n     * and `this` binding.\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @returns {number} Returns the sum.\n     */\n    function baseSum(collection, iteratee) {\n      var result = 0;\n      baseEach(collection, function(value, index, collection) {\n        result += +iteratee(value, index, collection) || 0;\n      });\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.uniq` without support for callback shorthands\n     * and `this` binding.\n     *\n     * @private\n     * @param {Array} array The array to inspect.\n     * @param {Function} [iteratee] The function invoked per iteration.\n     * @returns {Array} Returns the new duplicate-value-free array.\n     */\n    function baseUniq(array, iteratee) {\n      var index = -1,\n          indexOf = getIndexOf(),\n          length = array.length,\n          isCommon = indexOf == baseIndexOf,\n          isLarge = isCommon && length >= 200,\n          seen = isLarge ? createCache() : null,\n          result = [];\n\n      if (seen) {\n        indexOf = cacheIndexOf;\n        isCommon = false;\n      } else {\n        isLarge = false;\n        seen = iteratee ? [] : result;\n      }\n      outer:\n      while (++index < length) {\n        var value = array[index],\n            computed = iteratee ? iteratee(value, index, array) : value;\n\n        if (isCommon && value === value) {\n          var seenIndex = seen.length;\n          while (seenIndex--) {\n            if (seen[seenIndex] === computed) {\n              continue outer;\n            }\n          }\n          if (iteratee) {\n            seen.push(computed);\n          }\n          result.push(value);\n        }\n        else if (indexOf(seen, computed, 0) < 0) {\n          if (iteratee || isLarge) {\n            seen.push(computed);\n          }\n          result.push(value);\n        }\n      }\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.values` and `_.valuesIn` which creates an\n     * array of `object` property values corresponding to the property names\n     * returned by `keysFunc`.\n     *\n     * @private\n     * @param {Object} object The object to query.\n     * @param {Array} props The property names to get values for.\n     * @returns {Object} Returns the array of property values.\n     */\n    function baseValues(object, props) {\n      var index = -1,\n          length = props.length,\n          result = Array(length);\n\n      while (++index < length) {\n        result[index] = object[props[index]];\n      }\n      return result;\n    }\n\n    /**\n     * The base implementation of `_.dropRightWhile`, `_.dropWhile`, `_.takeRightWhile`,\n     * and `_.takeWhile` without support for callback shorthands and `this` binding.\n     *\n     * @private\n     * @param {Array} array The array to query.\n     * @param {Function} predicate The function invoked per iteration.\n     * @param {boolean} [isDrop] Specify dropping elements instead of taking them.\n     * @param {boolean} [fromRight] Specify iterating from right to left.\n     * @returns {Array} Returns the slice of `array`.\n     */\n    function baseWhile(array, predicate, isDrop, fromRight) {\n      var length = array.length,\n          index = fromRight ? length : -1;\n\n      while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {}\n      return isDrop\n        ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))\n        : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));\n    }\n\n    /**\n     * The base implementation of `wrapperValue` which returns the result of\n     * performing a sequence of actions on the unwrapped `value`, where each\n     * successive action is supplied the return value of the previous.\n     *\n     * @private\n     * @param {*} value The unwrapped value.\n     * @param {Array} actions Actions to peform to resolve the unwrapped value.\n     * @returns {*} Returns the resolved value.\n     */\n    function baseWrapperValue(value, actions) {\n      var result = value;\n      if (result instanceof LazyWrapper) {\n        result = result.value();\n      }\n      var index = -1,\n          length = actions.length;\n\n      while (++index < length) {\n        var args = [result],\n            action = actions[index];\n\n        push.apply(args, action.args);\n        result = action.func.apply(action.thisArg, args);\n      }\n      return result;\n    }\n\n    /**\n     * Performs a binary search of `array` to determine the index at which `value`\n     * should be inserted into `array` in order to maintain its sort order.\n     *\n     * @private\n     * @param {Array} array The sorted array to inspect.\n     * @param {*} value The value to evaluate.\n     * @param {boolean} [retHighest] Specify returning the highest qualified index.\n     * @returns {number} Returns the index at which `value` should be inserted\n     *  into `array`.\n     */\n    function binaryIndex(array, value, retHighest) {\n      var low = 0,\n          high = array ? array.length : low;\n\n      if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {\n        while (low < high) {\n          var mid = (low + high) >>> 1,\n              computed = array[mid];\n\n          if (retHighest ? (computed <= value) : (computed < value)) {\n            low = mid + 1;\n          } else {\n            high = mid;\n          }\n        }\n        return high;\n      }\n      return binaryIndexBy(array, value, identity, retHighest);\n    }\n\n    /**\n     * This function is like `binaryIndex` except that it invokes `iteratee` for\n     * `value` and each element of `array` to compute their sort ranking. The\n     * iteratee is invoked with one argument; (value).\n     *\n     * @private\n     * @param {Array} array The sorted array to inspect.\n     * @param {*} value The value to evaluate.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @param {boolean} [retHighest] Specify returning the highest qualified index.\n     * @returns {number} Returns the index at which `value` should be inserted\n     *  into `array`.\n     */\n    function binaryIndexBy(array, value, iteratee, retHighest) {\n      value = iteratee(value);\n\n      var low = 0,\n          high = array ? array.length : 0,\n          valIsNaN = value !== value,\n          valIsUndef = typeof value == 'undefined';\n\n      while (low < high) {\n        var mid = floor((low + high) / 2),\n            computed = iteratee(array[mid]),\n            isReflexive = computed === computed;\n\n        if (valIsNaN) {\n          var setLow = isReflexive || retHighest;\n        } else if (valIsUndef) {\n          setLow = isReflexive && (retHighest || typeof computed != 'undefined');\n        } else {\n          setLow = retHighest ? (computed <= value) : (computed < value);\n        }\n        if (setLow) {\n          low = mid + 1;\n        } else {\n          high = mid;\n        }\n      }\n      return nativeMin(high, MAX_ARRAY_INDEX);\n    }\n\n    /**\n     * A specialized version of `baseCallback` which only supports `this` binding\n     * and specifying the number of arguments to provide to `func`.\n     *\n     * @private\n     * @param {Function} func The function to bind.\n     * @param {*} thisArg The `this` binding of `func`.\n     * @param {number} [argCount] The number of arguments to provide to `func`.\n     * @returns {Function} Returns the callback.\n     */\n    function bindCallback(func, thisArg, argCount) {\n      if (typeof func != 'function') {\n        return identity;\n      }\n      if (typeof thisArg == 'undefined') {\n        return func;\n      }\n      switch (argCount) {\n        case 1: return function(value) {\n          return func.call(thisArg, value);\n        };\n        case 3: return function(value, index, collection) {\n          return func.call(thisArg, value, index, collection);\n        };\n        case 4: return function(accumulator, value, index, collection) {\n          return func.call(thisArg, accumulator, value, index, collection);\n        };\n        case 5: return function(value, other, key, object, source) {\n          return func.call(thisArg, value, other, key, object, source);\n        };\n      }\n      return function() {\n        return func.apply(thisArg, arguments);\n      };\n    }\n\n    /**\n     * Creates a clone of the given array buffer.\n     *\n     * @private\n     * @param {ArrayBuffer} buffer The array buffer to clone.\n     * @returns {ArrayBuffer} Returns the cloned array buffer.\n     */\n    function bufferClone(buffer) {\n      return bufferSlice.call(buffer, 0);\n    }\n    if (!bufferSlice) {\n      // PhantomJS has `ArrayBuffer` and `Uint8Array` but not `Float64Array`.\n      bufferClone = !(ArrayBuffer && Uint8Array) ? constant(null) : function(buffer) {\n        var byteLength = buffer.byteLength,\n            floatLength = Float64Array ? floor(byteLength / FLOAT64_BYTES_PER_ELEMENT) : 0,\n            offset = floatLength * FLOAT64_BYTES_PER_ELEMENT,\n            result = new ArrayBuffer(byteLength);\n\n        if (floatLength) {\n          var view = new Float64Array(result, 0, floatLength);\n          view.set(new Float64Array(buffer, 0, floatLength));\n        }\n        if (byteLength != offset) {\n          view = new Uint8Array(result, offset);\n          view.set(new Uint8Array(buffer, offset));\n        }\n        return result;\n      };\n    }\n\n    /**\n     * Creates an array that is the composition of partially applied arguments,\n     * placeholders, and provided arguments into a single array of arguments.\n     *\n     * @private\n     * @param {Array|Object} args The provided arguments.\n     * @param {Array} partials The arguments to prepend to those provided.\n     * @param {Array} holders The `partials` placeholder indexes.\n     * @returns {Array} Returns the new array of composed arguments.\n     */\n    function composeArgs(args, partials, holders) {\n      var holdersLength = holders.length,\n          argsIndex = -1,\n          argsLength = nativeMax(args.length - holdersLength, 0),\n          leftIndex = -1,\n          leftLength = partials.length,\n          result = Array(argsLength + leftLength);\n\n      while (++leftIndex < leftLength) {\n        result[leftIndex] = partials[leftIndex];\n      }\n      while (++argsIndex < holdersLength) {\n        result[holders[argsIndex]] = args[argsIndex];\n      }\n      while (argsLength--) {\n        result[leftIndex++] = args[argsIndex++];\n      }\n      return result;\n    }\n\n    /**\n     * This function is like `composeArgs` except that the arguments composition\n     * is tailored for `_.partialRight`.\n     *\n     * @private\n     * @param {Array|Object} args The provided arguments.\n     * @param {Array} partials The arguments to append to those provided.\n     * @param {Array} holders The `partials` placeholder indexes.\n     * @returns {Array} Returns the new array of composed arguments.\n     */\n    function composeArgsRight(args, partials, holders) {\n      var holdersIndex = -1,\n          holdersLength = holders.length,\n          argsIndex = -1,\n          argsLength = nativeMax(args.length - holdersLength, 0),\n          rightIndex = -1,\n          rightLength = partials.length,\n          result = Array(argsLength + rightLength);\n\n      while (++argsIndex < argsLength) {\n        result[argsIndex] = args[argsIndex];\n      }\n      var pad = argsIndex;\n      while (++rightIndex < rightLength) {\n        result[pad + rightIndex] = partials[rightIndex];\n      }\n      while (++holdersIndex < holdersLength) {\n        result[pad + holders[holdersIndex]] = args[argsIndex++];\n      }\n      return result;\n    }\n\n    /**\n     * Creates a function that aggregates a collection, creating an accumulator\n     * object composed from the results of running each element in the collection\n     * through an iteratee.\n     *\n     * **Note:** This function is used to create `_.countBy`, `_.groupBy`, `_.indexBy`,\n     * and `_.partition`.\n     *\n     * @private\n     * @param {Function} setter The function to set keys and values of the accumulator object.\n     * @param {Function} [initializer] The function to initialize the accumulator object.\n     * @returns {Function} Returns the new aggregator function.\n     */\n    function createAggregator(setter, initializer) {\n      return function(collection, iteratee, thisArg) {\n        var result = initializer ? initializer() : {};\n        iteratee = getCallback(iteratee, thisArg, 3);\n\n        if (isArray(collection)) {\n          var index = -1,\n              length = collection.length;\n\n          while (++index < length) {\n            var value = collection[index];\n            setter(result, value, iteratee(value, index, collection), collection);\n          }\n        } else {\n          baseEach(collection, function(value, key, collection) {\n            setter(result, value, iteratee(value, key, collection), collection);\n          });\n        }\n        return result;\n      };\n    }\n\n    /**\n     * Creates a function that assigns properties of source object(s) to a given\n     * destination object.\n     *\n     * **Note:** This function is used to create `_.assign`, `_.defaults`, and `_.merge`.\n     *\n     * @private\n     * @param {Function} assigner The function to assign values.\n     * @returns {Function} Returns the new assigner function.\n     */\n    function createAssigner(assigner) {\n      return function() {\n        var args = arguments,\n            length = args.length,\n            object = args[0];\n\n        if (length < 2 || object == null) {\n          return object;\n        }\n        var customizer = args[length - 2],\n            thisArg = args[length - 1],\n            guard = args[3];\n\n        if (length > 3 && typeof customizer == 'function') {\n          customizer = bindCallback(customizer, thisArg, 5);\n          length -= 2;\n        } else {\n          customizer = (length > 2 && typeof thisArg == 'function') ? thisArg : null;\n          length -= (customizer ? 1 : 0);\n        }\n        if (guard && isIterateeCall(args[1], args[2], guard)) {\n          customizer = length == 3 ? null : customizer;\n          length = 2;\n        }\n        var index = 0;\n        while (++index < length) {\n          var source = args[index];\n          if (source) {\n            assigner(object, source, customizer);\n          }\n        }\n        return object;\n      };\n    }\n\n    /**\n     * Creates a `baseEach` or `baseEachRight` function.\n     *\n     * @private\n     * @param {Function} eachFunc The function to iterate over a collection.\n     * @param {boolean} [fromRight] Specify iterating from right to left.\n     * @returns {Function} Returns the new base function.\n     */\n    function createBaseEach(eachFunc, fromRight) {\n      return function(collection, iteratee) {\n        var length = collection ? collection.length : 0;\n        if (!isLength(length)) {\n          return eachFunc(collection, iteratee);\n        }\n        var index = fromRight ? length : -1,\n            iterable = toObject(collection);\n\n        while ((fromRight ? index-- : ++index < length)) {\n          if (iteratee(iterable[index], index, iterable) === false) {\n            break;\n          }\n        }\n        return collection;\n      };\n    }\n\n    /**\n     * Creates a base function for `_.forIn` or `_.forInRight`.\n     *\n     * @private\n     * @param {boolean} [fromRight] Specify iterating from right to left.\n     * @returns {Function} Returns the new base function.\n     */\n    function createBaseFor(fromRight) {\n      return function(object, iteratee, keysFunc) {\n        var iterable = toObject(object),\n            props = keysFunc(object),\n            length = props.length,\n            index = fromRight ? length : -1;\n\n        while ((fromRight ? index-- : ++index < length)) {\n          var key = props[index];\n          if (iteratee(iterable[key], key, iterable) === false) {\n            break;\n          }\n        }\n        return object;\n      };\n    }\n\n    /**\n     * Creates a function that wraps `func` and invokes it with the `this`\n     * binding of `thisArg`.\n     *\n     * @private\n     * @param {Function} func The function to bind.\n     * @param {*} [thisArg] The `this` binding of `func`.\n     * @returns {Function} Returns the new bound function.\n     */\n    function createBindWrapper(func, thisArg) {\n      var Ctor = createCtorWrapper(func);\n\n      function wrapper() {\n        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;\n        return fn.apply(thisArg, arguments);\n      }\n      return wrapper;\n    }\n\n    /**\n     * Creates a `Set` cache object to optimize linear searches of large arrays.\n     *\n     * @private\n     * @param {Array} [values] The values to cache.\n     * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.\n     */\n    var createCache = !(nativeCreate && Set) ? constant(null) : function(values) {\n      return new SetCache(values);\n    };\n\n    /**\n     * Creates a function that produces compound words out of the words in a\n     * given string.\n     *\n     * @private\n     * @param {Function} callback The function to combine each word.\n     * @returns {Function} Returns the new compounder function.\n     */\n    function createCompounder(callback) {\n      return function(string) {\n        var index = -1,\n            array = words(deburr(string)),\n            length = array.length,\n            result = '';\n\n        while (++index < length) {\n          result = callback(result, array[index], index);\n        }\n        return result;\n      };\n    }\n\n    /**\n     * Creates a function that produces an instance of `Ctor` regardless of\n     * whether it was invoked as part of a `new` expression or by `call` or `apply`.\n     *\n     * @private\n     * @param {Function} Ctor The constructor to wrap.\n     * @returns {Function} Returns the new wrapped function.\n     */\n    function createCtorWrapper(Ctor) {\n      return function() {\n        var thisBinding = baseCreate(Ctor.prototype),\n            result = Ctor.apply(thisBinding, arguments);\n\n        // Mimic the constructor's `return` behavior.\n        // See https://es5.github.io/#x13.2.2 for more details.\n        return isObject(result) ? result : thisBinding;\n      };\n    }\n\n    /**\n     * Creates a `_.curry` or `_.curryRight` function.\n     *\n     * @private\n     * @param {boolean} flag The curry bit flag.\n     * @returns {Function} Returns the new curry function.\n     */\n    function createCurry(flag) {\n      function curryFunc(func, arity, guard) {\n        if (guard && isIterateeCall(func, arity, guard)) {\n          arity = null;\n        }\n        var result = createWrapper(func, flag, null, null, null, null, null, arity);\n        result.placeholder = curryFunc.placeholder;\n        return result;\n      }\n      return curryFunc;\n    }\n\n    /**\n     * Creates a `_.max` or `_.min` function.\n     *\n     * @private\n     * @param {Function} arrayFunc The function to get the extremum value from an array.\n     * @param {boolean} [isMin] Specify returning the minimum, instead of the maximum,\n     *  extremum value.\n     * @returns {Function} Returns the new extremum function.\n     */\n    function createExtremum(arrayFunc, isMin) {\n      return function(collection, iteratee, thisArg) {\n        if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {\n          iteratee = null;\n        }\n        var func = getCallback(),\n            noIteratee = iteratee == null;\n\n        if (!(func === baseCallback && noIteratee)) {\n          noIteratee = false;\n          iteratee = func(iteratee, thisArg, 3);\n        }\n        if (noIteratee) {\n          var isArr = isArray(collection);\n          if (!isArr && isString(collection)) {\n            iteratee = charAtCallback;\n          } else {\n            return arrayFunc(isArr ? collection : toIterable(collection));\n          }\n        }\n        return extremumBy(collection, iteratee, isMin);\n      };\n    }\n\n    /**\n     * Creates a `_.find` or `_.findLast` function.\n     *\n     * @private\n     * @param {Function} eachFunc The function to iterate over a collection.\n     * @param {boolean} [fromRight] Specify iterating from right to left.\n     * @returns {Function} Returns the new find function.\n     */\n    function createFind(eachFunc, fromRight) {\n      return function(collection, predicate, thisArg) {\n        predicate = getCallback(predicate, thisArg, 3);\n        if (isArray(collection)) {\n          var index = baseFindIndex(collection, predicate, fromRight);\n          return index > -1 ? collection[index] : undefined;\n        }\n        return baseFind(collection, predicate, eachFunc);\n      }\n    }\n\n    /**\n     * Creates a `_.findIndex` or `_.findLastIndex` function.\n     *\n     * @private\n     * @param {boolean} [fromRight] Specify iterating from right to left.\n     * @returns {Function} Returns the new find function.\n     */\n    function createFindIndex(fromRight) {\n      return function(array, predicate, thisArg) {\n        if (!(array && array.length)) {\n          return -1;\n        }\n        predicate = getCallback(predicate, thisArg, 3);\n        return baseFindIndex(array, predicate, fromRight);\n      };\n    }\n\n    /**\n     * Creates a `_.findKey` or `_.findLastKey` function.\n     *\n     * @private\n     * @param {Function} objectFunc The function to iterate over an object.\n     * @returns {Function} Returns the new find function.\n     */\n    function createFindKey(objectFunc) {\n      return function(object, predicate, thisArg) {\n        predicate = getCallback(predicate, thisArg, 3);\n        return baseFind(object, predicate, objectFunc, true);\n      };\n    }\n\n    /**\n     * Creates a `_.flow` or `_.flowRight` function.\n     *\n     * @private\n     * @param {boolean} [fromRight] Specify iterating from right to left.\n     * @returns {Function} Returns the new flow function.\n     */\n    function createFlow(fromRight) {\n      return function() {\n        var length = arguments.length;\n        if (!length) {\n          return function() { return arguments[0]; };\n        }\n        var wrapper,\n            index = fromRight ? length : -1,\n            leftIndex = 0,\n            funcs = Array(length);\n\n        while ((fromRight ? index-- : ++index < length)) {\n          var func = funcs[leftIndex++] = arguments[index];\n          if (typeof func != 'function') {\n            throw new TypeError(FUNC_ERROR_TEXT);\n          }\n          var funcName = wrapper ? '' : getFuncName(func);\n          wrapper = funcName == 'wrapper' ? new LodashWrapper([]) : wrapper;\n        }\n        index = wrapper ? -1 : length;\n        while (++index < length) {\n          func = funcs[index];\n          funcName = getFuncName(func);\n\n          var data = funcName == 'wrapper' ? getData(func) : null;\n          if (data && isLaziable(data[0])) {\n            wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);\n          } else {\n            wrapper = (func.length == 1 && isLaziable(func)) ? wrapper[funcName]() : wrapper.thru(func);\n          }\n        }\n        return function() {\n          var args = arguments;\n          if (wrapper && args.length == 1 && isArray(args[0])) {\n            return wrapper.plant(args[0]).value();\n          }\n          var index = 0,\n              result = funcs[index].apply(this, args);\n\n          while (++index < length) {\n            result = funcs[index].call(this, result);\n          }\n          return result;\n        };\n      };\n    }\n\n    /**\n     * Creates a function for `_.forEach` or `_.forEachRight`.\n     *\n     * @private\n     * @param {Function} arrayFunc The function to iterate over an array.\n     * @param {Function} eachFunc The function to iterate over a collection.\n     * @returns {Function} Returns the new each function.\n     */\n    function createForEach(arrayFunc, eachFunc) {\n      return function(collection, iteratee, thisArg) {\n        return (typeof iteratee == 'function' && typeof thisArg == 'undefined' && isArray(collection))\n          ? arrayFunc(collection, iteratee)\n          : eachFunc(collection, bindCallback(iteratee, thisArg, 3));\n      };\n    }\n\n    /**\n     * Creates a function for `_.forIn` or `_.forInRight`.\n     *\n     * @private\n     * @param {Function} objectFunc The function to iterate over an object.\n     * @returns {Function} Returns the new each function.\n     */\n    function createForIn(objectFunc) {\n      return function(object, iteratee, thisArg) {\n        if (typeof iteratee != 'function' || typeof thisArg != 'undefined') {\n          iteratee = bindCallback(iteratee, thisArg, 3);\n        }\n        return objectFunc(object, iteratee, keysIn);\n      };\n    }\n\n    /**\n     * Creates a function for `_.forOwn` or `_.forOwnRight`.\n     *\n     * @private\n     * @param {Function} objectFunc The function to iterate over an object.\n     * @returns {Function} Returns the new each function.\n     */\n    function createForOwn(objectFunc) {\n      return function(object, iteratee, thisArg) {\n        if (typeof iteratee != 'function' || typeof thisArg != 'undefined') {\n          iteratee = bindCallback(iteratee, thisArg, 3);\n        }\n        return objectFunc(object, iteratee);\n      };\n    }\n\n    /**\n     * Creates a function for `_.padLeft` or `_.padRight`.\n     *\n     * @private\n     * @param {boolean} [fromRight] Specify padding from the right.\n     * @returns {Function} Returns the new pad function.\n     */\n    function createPadDir(fromRight) {\n      return function(string, length, chars) {\n        string = baseToString(string);\n        return string && ((fromRight ? string : '') + createPadding(string, length, chars) + (fromRight ? '' : string));\n      };\n    }\n\n    /**\n     * Creates a `_.partial` or `_.partialRight` function.\n     *\n     * @private\n     * @param {boolean} flag The partial bit flag.\n     * @returns {Function} Returns the new partial function.\n     */\n    function createPartial(flag) {\n      var partialFunc = restParam(function(func, partials) {\n        var holders = replaceHolders(partials, partialFunc.placeholder);\n        return createWrapper(func, flag, null, partials, holders);\n      });\n      return partialFunc;\n    }\n\n    /**\n     * Creates a function for `_.reduce` or `_.reduceRight`.\n     *\n     * @private\n     * @param {Function} arrayFunc The function to iterate over an array.\n     * @param {Function} eachFunc The function to iterate over a collection.\n     * @returns {Function} Returns the new each function.\n     */\n    function createReduce(arrayFunc, eachFunc) {\n      return function(collection, iteratee, accumulator, thisArg) {\n        var initFromArray = arguments.length < 3;\n        return (typeof iteratee == 'function' && typeof thisArg == 'undefined' && isArray(collection))\n          ? arrayFunc(collection, iteratee, accumulator, initFromArray)\n          : baseReduce(collection, getCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);\n      };\n    }\n\n    /**\n     * Creates a function that wraps `func` and invokes it with optional `this`\n     * binding of, partial application, and currying.\n     *\n     * @private\n     * @param {Function|string} func The function or method name to reference.\n     * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.\n     * @param {*} [thisArg] The `this` binding of `func`.\n     * @param {Array} [partials] The arguments to prepend to those provided to the new function.\n     * @param {Array} [holders] The `partials` placeholder indexes.\n     * @param {Array} [partialsRight] The arguments to append to those provided to the new function.\n     * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.\n     * @param {Array} [argPos] The argument positions of the new function.\n     * @param {number} [ary] The arity cap of `func`.\n     * @param {number} [arity] The arity of `func`.\n     * @returns {Function} Returns the new wrapped function.\n     */\n    function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {\n      var isAry = bitmask & ARY_FLAG,\n          isBind = bitmask & BIND_FLAG,\n          isBindKey = bitmask & BIND_KEY_FLAG,\n          isCurry = bitmask & CURRY_FLAG,\n          isCurryBound = bitmask & CURRY_BOUND_FLAG,\n          isCurryRight = bitmask & CURRY_RIGHT_FLAG;\n\n      var Ctor = !isBindKey && createCtorWrapper(func),\n          key = func;\n\n      function wrapper() {\n        // Avoid `arguments` object use disqualifying optimizations by\n        // converting it to an array before providing it to other functions.\n        var length = arguments.length,\n            index = length,\n            args = Array(length);\n\n        while (index--) {\n          args[index] = arguments[index];\n        }\n        if (partials) {\n          args = composeArgs(args, partials, holders);\n        }\n        if (partialsRight) {\n          args = composeArgsRight(args, partialsRight, holdersRight);\n        }\n        if (isCurry || isCurryRight) {\n          var placeholder = wrapper.placeholder,\n              argsHolders = replaceHolders(args, placeholder);\n\n          length -= argsHolders.length;\n          if (length < arity) {\n            var newArgPos = argPos ? arrayCopy(argPos) : null,\n                newArity = nativeMax(arity - length, 0),\n                newsHolders = isCurry ? argsHolders : null,\n                newHoldersRight = isCurry ? null : argsHolders,\n                newPartials = isCurry ? args : null,\n                newPartialsRight = isCurry ? null : args;\n\n            bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);\n            bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);\n\n            if (!isCurryBound) {\n              bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);\n            }\n            var newData = [func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity],\n                result = createHybridWrapper.apply(undefined, newData);\n\n            if (isLaziable(func)) {\n              setData(result, newData);\n            }\n            result.placeholder = placeholder;\n            return result;\n          }\n        }\n        var thisBinding = isBind ? thisArg : this;\n        if (isBindKey) {\n          func = thisBinding[key];\n        }\n        if (argPos) {\n          args = reorder(args, argPos);\n        }\n        if (isAry && ary < args.length) {\n          args.length = ary;\n        }\n        var fn = (this && this !== root && this instanceof wrapper) ? (Ctor || createCtorWrapper(func)) : func;\n        return fn.apply(thisBinding, args);\n      }\n      return wrapper;\n    }\n\n    /**\n     * Creates the padding required for `string` based on the given `length`.\n     * The `chars` string is truncated if the number of characters exceeds `length`.\n     *\n     * @private\n     * @param {string} string The string to create padding for.\n     * @param {number} [length=0] The padding length.\n     * @param {string} [chars=' '] The string used as padding.\n     * @returns {string} Returns the pad for `string`.\n     */\n    function createPadding(string, length, chars) {\n      var strLength = string.length;\n      length = +length;\n\n      if (strLength >= length || !nativeIsFinite(length)) {\n        return '';\n      }\n      var padLength = length - strLength;\n      chars = chars == null ? ' ' : (chars + '');\n      return repeat(chars, ceil(padLength / chars.length)).slice(0, padLength);\n    }\n\n    /**\n     * Creates a function that wraps `func` and invokes it with the optional `this`\n     * binding of `thisArg` and the `partials` prepended to those provided to\n     * the wrapper.\n     *\n     * @private\n     * @param {Function} func The function to partially apply arguments to.\n     * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.\n     * @param {*} thisArg The `this` binding of `func`.\n     * @param {Array} partials The arguments to prepend to those provided to the new function.\n     * @returns {Function} Returns the new bound function.\n     */\n    function createPartialWrapper(func, bitmask, thisArg, partials) {\n      var isBind = bitmask & BIND_FLAG,\n          Ctor = createCtorWrapper(func);\n\n      function wrapper() {\n        // Avoid `arguments` object use disqualifying optimizations by\n        // converting it to an array before providing it `func`.\n        var argsIndex = -1,\n            argsLength = arguments.length,\n            leftIndex = -1,\n            leftLength = partials.length,\n            args = Array(argsLength + leftLength);\n\n        while (++leftIndex < leftLength) {\n          args[leftIndex] = partials[leftIndex];\n        }\n        while (argsLength--) {\n          args[leftIndex++] = arguments[++argsIndex];\n        }\n        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;\n        return fn.apply(isBind ? thisArg : this, args);\n      }\n      return wrapper;\n    }\n\n    /**\n     * Creates a `_.sortedIndex` or `_.sortedLastIndex` function.\n     *\n     * @private\n     * @param {boolean} [retHighest] Specify returning the highest qualified index.\n     * @returns {Function} Returns the new index function.\n     */\n    function createSortedIndex(retHighest) {\n      return function(array, value, iteratee, thisArg) {\n        var func = getCallback(iteratee);\n        return (func === baseCallback && iteratee == null)\n          ? binaryIndex(array, value, retHighest)\n          : binaryIndexBy(array, value, func(iteratee, thisArg, 1), retHighest);\n      };\n    }\n\n    /**\n     * Creates a function that either curries or invokes `func` with optional\n     * `this` binding and partially applied arguments.\n     *\n     * @private\n     * @param {Function|string} func The function or method name to reference.\n     * @param {number} bitmask The bitmask of flags.\n     *  The bitmask may be composed of the following flags:\n     *     1 - `_.bind`\n     *     2 - `_.bindKey`\n     *     4 - `_.curry` or `_.curryRight` of a bound function\n     *     8 - `_.curry`\n     *    16 - `_.curryRight`\n     *    32 - `_.partial`\n     *    64 - `_.partialRight`\n     *   128 - `_.rearg`\n     *   256 - `_.ary`\n     * @param {*} [thisArg] The `this` binding of `func`.\n     * @param {Array} [partials] The arguments to be partially applied.\n     * @param {Array} [holders] The `partials` placeholder indexes.\n     * @param {Array} [argPos] The argument positions of the new function.\n     * @param {number} [ary] The arity cap of `func`.\n     * @param {number} [arity] The arity of `func`.\n     * @returns {Function} Returns the new wrapped function.\n     */\n    function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {\n      var isBindKey = bitmask & BIND_KEY_FLAG;\n      if (!isBindKey && typeof func != 'function') {\n        throw new TypeError(FUNC_ERROR_TEXT);\n      }\n      var length = partials ? partials.length : 0;\n      if (!length) {\n        bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);\n        partials = holders = null;\n      }\n      length -= (holders ? holders.length : 0);\n      if (bitmask & PARTIAL_RIGHT_FLAG) {\n        var partialsRight = partials,\n            holdersRight = holders;\n\n        partials = holders = null;\n      }\n      var data = isBindKey ? null : getData(func),\n          newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];\n\n      if (data) {\n        mergeData(newData, data);\n        bitmask = newData[1];\n        arity = newData[9];\n      }\n      newData[9] = arity == null\n        ? (isBindKey ? 0 : func.length)\n        : (nativeMax(arity - length, 0) || 0);\n\n      if (bitmask == BIND_FLAG) {\n        var result = createBindWrapper(newData[0], newData[2]);\n      } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length) {\n        result = createPartialWrapper.apply(undefined, newData);\n      } else {\n        result = createHybridWrapper.apply(undefined, newData);\n      }\n      var setter = data ? baseSetData : setData;\n      return setter(result, newData);\n    }\n\n    /**\n     * A specialized version of `baseIsEqualDeep` for arrays with support for\n     * partial deep comparisons.\n     *\n     * @private\n     * @param {Array} array The array to compare.\n     * @param {Array} other The other array to compare.\n     * @param {Function} equalFunc The function to determine equivalents of values.\n     * @param {Function} [customizer] The function to customize comparing arrays.\n     * @param {boolean} [isLoose] Specify performing partial comparisons.\n     * @param {Array} [stackA] Tracks traversed `value` objects.\n     * @param {Array} [stackB] Tracks traversed `other` objects.\n     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.\n     */\n    function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {\n      var index = -1,\n          arrLength = array.length,\n          othLength = other.length,\n          result = true;\n\n      if (arrLength != othLength && !(isLoose && othLength > arrLength)) {\n        return false;\n      }\n      // Deep compare the contents, ignoring non-numeric properties.\n      while (result && ++index < arrLength) {\n        var arrValue = array[index],\n            othValue = other[index];\n\n        result = undefined;\n        if (customizer) {\n          result = isLoose\n            ? customizer(othValue, arrValue, index)\n            : customizer(arrValue, othValue, index);\n        }\n        if (typeof result == 'undefined') {\n          // Recursively compare arrays (susceptible to call stack limits).\n          if (isLoose) {\n            var othIndex = othLength;\n            while (othIndex--) {\n              othValue = other[othIndex];\n              result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);\n              if (result) {\n                break;\n              }\n            }\n          } else {\n            result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);\n          }\n        }\n      }\n      return !!result;\n    }\n\n    /**\n     * A specialized version of `baseIsEqualDeep` for comparing objects of\n     * the same `toStringTag`.\n     *\n     * **Note:** This function only supports comparing values with tags of\n     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.\n     *\n     * @private\n     * @param {Object} value The object to compare.\n     * @param {Object} other The other object to compare.\n     * @param {string} tag The `toStringTag` of the objects to compare.\n     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.\n     */\n    function equalByTag(object, other, tag) {\n      switch (tag) {\n        case boolTag:\n        case dateTag:\n          // Coerce dates and booleans to numbers, dates to milliseconds and booleans\n          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.\n          return +object == +other;\n\n        case errorTag:\n          return object.name == other.name && object.message == other.message;\n\n        case numberTag:\n          // Treat `NaN` vs. `NaN` as equal.\n          return (object != +object)\n            ? other != +other\n            // But, treat `-0` vs. `+0` as not equal.\n            : (object == 0 ? ((1 / object) == (1 / other)) : object == +other);\n\n        case regexpTag:\n        case stringTag:\n          // Coerce regexes to strings and treat strings primitives and string\n          // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.\n          return object == (other + '');\n      }\n      return false;\n    }\n\n    /**\n     * A specialized version of `baseIsEqualDeep` for objects with support for\n     * partial deep comparisons.\n     *\n     * @private\n     * @param {Object} object The object to compare.\n     * @param {Object} other The other object to compare.\n     * @param {Function} equalFunc The function to determine equivalents of values.\n     * @param {Function} [customizer] The function to customize comparing values.\n     * @param {boolean} [isLoose] Specify performing partial comparisons.\n     * @param {Array} [stackA] Tracks traversed `value` objects.\n     * @param {Array} [stackB] Tracks traversed `other` objects.\n     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.\n     */\n    function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {\n      var objProps = keys(object),\n          objLength = objProps.length,\n          othProps = keys(other),\n          othLength = othProps.length;\n\n      if (objLength != othLength && !isLoose) {\n        return false;\n      }\n      var skipCtor = isLoose,\n          index = -1;\n\n      while (++index < objLength) {\n        var key = objProps[index],\n            result = isLoose ? key in other : hasOwnProperty.call(other, key);\n\n        if (result) {\n          var objValue = object[key],\n              othValue = other[key];\n\n          result = undefined;\n          if (customizer) {\n            result = isLoose\n              ? customizer(othValue, objValue, key)\n              : customizer(objValue, othValue, key);\n          }\n          if (typeof result == 'undefined') {\n            // Recursively compare objects (susceptible to call stack limits).\n            result = (objValue && objValue === othValue) || equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB);\n          }\n        }\n        if (!result) {\n          return false;\n        }\n        skipCtor || (skipCtor = key == 'constructor');\n      }\n      if (!skipCtor) {\n        var objCtor = object.constructor,\n            othCtor = other.constructor;\n\n        // Non `Object` object instances with different constructors are not equal.\n        if (objCtor != othCtor &&\n            ('constructor' in object && 'constructor' in other) &&\n            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&\n              typeof othCtor == 'function' && othCtor instanceof othCtor)) {\n          return false;\n        }\n      }\n      return true;\n    }\n\n    /**\n     * Gets the extremum value of `collection` invoking `iteratee` for each value\n     * in `collection` to generate the criterion by which the value is ranked.\n     * The `iteratee` is invoked with three arguments: (value, index, collection).\n     *\n     * @private\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} iteratee The function invoked per iteration.\n     * @param {boolean} [isMin] Specify returning the minimum, instead of the\n     *  maximum, extremum value.\n     * @returns {*} Returns the extremum value.\n     */\n    function extremumBy(collection, iteratee, isMin) {\n      var exValue = isMin ? POSITIVE_INFINITY : NEGATIVE_INFINITY,\n          computed = exValue,\n          result = computed;\n\n      baseEach(collection, function(value, index, collection) {\n        var current = iteratee(value, index, collection);\n        if ((isMin ? (current < computed) : (current > computed)) ||\n            (current === exValue && current === result)) {\n          computed = current;\n          result = value;\n        }\n      });\n      return result;\n    }\n\n    /**\n     * Gets the appropriate \"callback\" function. If the `_.callback` method is\n     * customized this function returns the custom method, otherwise it returns\n     * the `baseCallback` function. If arguments are provided the chosen function\n     * is invoked with them and its result is returned.\n     *\n     * @private\n     * @returns {Function} Returns the chosen function or its result.\n     */\n    function getCallback(func, thisArg, argCount) {\n      var result = lodash.callback || callback;\n      result = result === callback ? baseCallback : result;\n      return argCount ? result(func, thisArg, argCount) : result;\n    }\n\n    /**\n     * Gets metadata for `func`.\n     *\n     * @private\n     * @param {Function} func The function to query.\n     * @returns {*} Returns the metadata for `func`.\n     */\n    var getData = !metaMap ? noop : function(func) {\n      return metaMap.get(func);\n    };\n\n    /**\n     * Gets the name of `func`.\n     *\n     * @private\n     * @param {Function} func The function to query.\n     * @returns {string} Returns the function name.\n     */\n    var getFuncName = (function() {\n      if (!support.funcNames) {\n        return constant('');\n      }\n      if (constant.name == 'constant') {\n        return baseProperty('name');\n      }\n      return function(func) {\n        var result = func.name,\n            array = realNames[result],\n            length = array ? array.length : 0;\n\n        while (length--) {\n          var data = array[length],\n              otherFunc = data.func;\n\n          if (otherFunc == null || otherFunc == func) {\n            return data.name;\n          }\n        }\n        return result;\n      };\n    }());\n\n    /**\n     * Gets the appropriate \"indexOf\" function. If the `_.indexOf` method is\n     * customized this function returns the custom method, otherwise it returns\n     * the `baseIndexOf` function. If arguments are provided the chosen function\n     * is invoked with them and its result is returned.\n     *\n     * @private\n     * @returns {Function|number} Returns the chosen function or its result.\n     */\n    function getIndexOf(collection, target, fromIndex) {\n      var result = lodash.indexOf || indexOf;\n      result = result === indexOf ? baseIndexOf : result;\n      return collection ? result(collection, target, fromIndex) : result;\n    }\n\n    /**\n     * Gets the view, applying any `transforms` to the `start` and `end` positions.\n     *\n     * @private\n     * @param {number} start The start of the view.\n     * @param {number} end The end of the view.\n     * @param {Array} [transforms] The transformations to apply to the view.\n     * @returns {Object} Returns an object containing the `start` and `end`\n     *  positions of the view.\n     */\n    function getView(start, end, transforms) {\n      var index = -1,\n          length = transforms ? transforms.length : 0;\n\n      while (++index < length) {\n        var data = transforms[index],\n            size = data.size;\n\n        switch (data.type) {\n          case 'drop':      start += size; break;\n          case 'dropRight': end -= size; break;\n          case 'take':      end = nativeMin(end, start + size); break;\n          case 'takeRight': start = nativeMax(start, end - size); break;\n        }\n      }\n      return { 'start': start, 'end': end };\n    }\n\n    /**\n     * Initializes an array clone.\n     *\n     * @private\n     * @param {Array} array The array to clone.\n     * @returns {Array} Returns the initialized clone.\n     */\n    function initCloneArray(array) {\n      var length = array.length,\n          result = new array.constructor(length);\n\n      // Add array properties assigned by `RegExp#exec`.\n      if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {\n        result.index = array.index;\n        result.input = array.input;\n      }\n      return result;\n    }\n\n    /**\n     * Initializes an object clone.\n     *\n     * @private\n     * @param {Object} object The object to clone.\n     * @returns {Object} Returns the initialized clone.\n     */\n    function initCloneObject(object) {\n      var Ctor = object.constructor;\n      if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {\n        Ctor = Object;\n      }\n      return new Ctor;\n    }\n\n    /**\n     * Initializes an object clone based on its `toStringTag`.\n     *\n     * **Note:** This function only supports cloning values with tags of\n     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.\n     *\n     *\n     * @private\n     * @param {Object} object The object to clone.\n     * @param {string} tag The `toStringTag` of the object to clone.\n     * @param {boolean} [isDeep] Specify a deep clone.\n     * @returns {Object} Returns the initialized clone.\n     */\n    function initCloneByTag(object, tag, isDeep) {\n      var Ctor = object.constructor;\n      switch (tag) {\n        case arrayBufferTag:\n          return bufferClone(object);\n\n        case boolTag:\n        case dateTag:\n          return new Ctor(+object);\n\n        case float32Tag: case float64Tag:\n        case int8Tag: case int16Tag: case int32Tag:\n        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:\n          var buffer = object.buffer;\n          return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);\n\n        case numberTag:\n        case stringTag:\n          return new Ctor(object);\n\n        case regexpTag:\n          var result = new Ctor(object.source, reFlags.exec(object));\n          result.lastIndex = object.lastIndex;\n      }\n      return result;\n    }\n\n    /**\n     * Checks if `value` is a valid array-like index.\n     *\n     * @private\n     * @param {*} value The value to check.\n     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.\n     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.\n     */\n    function isIndex(value, length) {\n      value = +value;\n      length = length == null ? MAX_SAFE_INTEGER : length;\n      return value > -1 && value % 1 == 0 && value < length;\n    }\n\n    /**\n     * Checks if the provided arguments are from an iteratee call.\n     *\n     * @private\n     * @param {*} value The potential iteratee value argument.\n     * @param {*} index The potential iteratee index or key argument.\n     * @param {*} object The potential iteratee object argument.\n     * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.\n     */\n    function isIterateeCall(value, index, object) {\n      if (!isObject(object)) {\n        return false;\n      }\n      var type = typeof index;\n      if (type == 'number') {\n        var length = object.length,\n            prereq = isLength(length) && isIndex(index, length);\n      } else {\n        prereq = type == 'string' && index in object;\n      }\n      if (prereq) {\n        var other = object[index];\n        return value === value ? (value === other) : (other !== other);\n      }\n      return false;\n    }\n\n    /**\n     * Checks if `func` has a lazy counterpart.\n     *\n     * @private\n     * @param {Function} func The function to check.\n     * @returns {boolean} Returns `true` if `func` has a lazy counterpart, else `false`.\n     */\n    function isLaziable(func) {\n      var funcName = getFuncName(func);\n      return !!funcName && func === lodash[funcName] && funcName in LazyWrapper.prototype;\n    }\n\n    /**\n     * Checks if `value` is a valid array-like length.\n     *\n     * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).\n     *\n     * @private\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.\n     */\n    function isLength(value) {\n      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;\n    }\n\n    /**\n     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.\n     *\n     * @private\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` if suitable for strict\n     *  equality comparisons, else `false`.\n     */\n    function isStrictComparable(value) {\n      return value === value && (value === 0 ? ((1 / value) > 0) : !isObject(value));\n    }\n\n    /**\n     * Merges the function metadata of `source` into `data`.\n     *\n     * Merging metadata reduces the number of wrappers required to invoke a function.\n     * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`\n     * may be applied regardless of execution order. Methods like `_.ary` and `_.rearg`\n     * augment function arguments, making the order in which they are executed important,\n     * preventing the merging of metadata. However, we make an exception for a safe\n     * common case where curried functions have `_.ary` and or `_.rearg` applied.\n     *\n     * @private\n     * @param {Array} data The destination metadata.\n     * @param {Array} source The source metadata.\n     * @returns {Array} Returns `data`.\n     */\n    function mergeData(data, source) {\n      var bitmask = data[1],\n          srcBitmask = source[1],\n          newBitmask = bitmask | srcBitmask,\n          isCommon = newBitmask < ARY_FLAG;\n\n      var isCombo =\n        (srcBitmask == ARY_FLAG && bitmask == CURRY_FLAG) ||\n        (srcBitmask == ARY_FLAG && bitmask == REARG_FLAG && data[7].length <= source[8]) ||\n        (srcBitmask == (ARY_FLAG | REARG_FLAG) && bitmask == CURRY_FLAG);\n\n      // Exit early if metadata can't be merged.\n      if (!(isCommon || isCombo)) {\n        return data;\n      }\n      // Use source `thisArg` if available.\n      if (srcBitmask & BIND_FLAG) {\n        data[2] = source[2];\n        // Set when currying a bound function.\n        newBitmask |= (bitmask & BIND_FLAG) ? 0 : CURRY_BOUND_FLAG;\n      }\n      // Compose partial arguments.\n      var value = source[3];\n      if (value) {\n        var partials = data[3];\n        data[3] = partials ? composeArgs(partials, value, source[4]) : arrayCopy(value);\n        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : arrayCopy(source[4]);\n      }\n      // Compose partial right arguments.\n      value = source[5];\n      if (value) {\n        partials = data[5];\n        data[5] = partials ? composeArgsRight(partials, value, source[6]) : arrayCopy(value);\n        data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : arrayCopy(source[6]);\n      }\n      // Use source `argPos` if available.\n      value = source[7];\n      if (value) {\n        data[7] = arrayCopy(value);\n      }\n      // Use source `ary` if it's smaller.\n      if (srcBitmask & ARY_FLAG) {\n        data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);\n      }\n      // Use source `arity` if one is not provided.\n      if (data[9] == null) {\n        data[9] = source[9];\n      }\n      // Use source `func` and merge bitmasks.\n      data[0] = source[0];\n      data[1] = newBitmask;\n\n      return data;\n    }\n\n    /**\n     * A specialized version of `_.pick` that picks `object` properties specified\n     * by the `props` array.\n     *\n     * @private\n     * @param {Object} object The source object.\n     * @param {string[]} props The property names to pick.\n     * @returns {Object} Returns the new object.\n     */\n    function pickByArray(object, props) {\n      object = toObject(object);\n\n      var index = -1,\n          length = props.length,\n          result = {};\n\n      while (++index < length) {\n        var key = props[index];\n        if (key in object) {\n          result[key] = object[key];\n        }\n      }\n      return result;\n    }\n\n    /**\n     * A specialized version of `_.pick` that picks `object` properties `predicate`\n     * returns truthy for.\n     *\n     * @private\n     * @param {Object} object The source object.\n     * @param {Function} predicate The function invoked per iteration.\n     * @returns {Object} Returns the new object.\n     */\n    function pickByCallback(object, predicate) {\n      var result = {};\n      baseForIn(object, function(value, key, object) {\n        if (predicate(value, key, object)) {\n          result[key] = value;\n        }\n      });\n      return result;\n    }\n\n    /**\n     * Reorder `array` according to the specified indexes where the element at\n     * the first index is assigned as the first element, the element at\n     * the second index is assigned as the second element, and so on.\n     *\n     * @private\n     * @param {Array} array The array to reorder.\n     * @param {Array} indexes The arranged array indexes.\n     * @returns {Array} Returns `array`.\n     */\n    function reorder(array, indexes) {\n      var arrLength = array.length,\n          length = nativeMin(indexes.length, arrLength),\n          oldArray = arrayCopy(array);\n\n      while (length--) {\n        var index = indexes[length];\n        array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;\n      }\n      return array;\n    }\n\n    /**\n     * Sets metadata for `func`.\n     *\n     * **Note:** If this function becomes hot, i.e. is invoked a lot in a short\n     * period of time, it will trip its breaker and transition to an identity function\n     * to avoid garbage collection pauses in V8. See [V8 issue 2070](https://code.google.com/p/v8/issues/detail?id=2070)\n     * for more details.\n     *\n     * @private\n     * @param {Function} func The function to associate metadata with.\n     * @param {*} data The metadata.\n     * @returns {Function} Returns `func`.\n     */\n    var setData = (function() {\n      var count = 0,\n          lastCalled = 0;\n\n      return function(key, value) {\n        var stamp = now(),\n            remaining = HOT_SPAN - (stamp - lastCalled);\n\n        lastCalled = stamp;\n        if (remaining > 0) {\n          if (++count >= HOT_COUNT) {\n            return key;\n          }\n        } else {\n          count = 0;\n        }\n        return baseSetData(key, value);\n      };\n    }());\n\n    /**\n     * A fallback implementation of `_.isPlainObject` which checks if `value`\n     * is an object created by the `Object` constructor or has a `[[Prototype]]`\n     * of `null`.\n     *\n     * @private\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.\n     */\n    function shimIsPlainObject(value) {\n      var Ctor,\n          support = lodash.support;\n\n      // Exit early for non `Object` objects.\n      if (!(isObjectLike(value) && objToString.call(value) == objectTag) ||\n          (!hasOwnProperty.call(value, 'constructor') &&\n            (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {\n        return false;\n      }\n      // IE < 9 iterates inherited properties before own properties. If the first\n      // iterated property is an object's own property then there are no inherited\n      // enumerable properties.\n      var result;\n      // In most environments an object's own properties are iterated before\n      // its inherited properties. If the last iterated property is an object's\n      // own property then there are no inherited enumerable properties.\n      baseForIn(value, function(subValue, key) {\n        result = key;\n      });\n      return typeof result == 'undefined' || hasOwnProperty.call(value, result);\n    }\n\n    /**\n     * A fallback implementation of `Object.keys` which creates an array of the\n     * own enumerable property names of `object`.\n     *\n     * @private\n     * @param {Object} object The object to inspect.\n     * @returns {Array} Returns the array of property names.\n     */\n    function shimKeys(object) {\n      var props = keysIn(object),\n          propsLength = props.length,\n          length = propsLength && object.length,\n          support = lodash.support;\n\n      var allowIndexes = length && isLength(length) &&\n        (isArray(object) || (support.nonEnumArgs && isArguments(object)));\n\n      var index = -1,\n          result = [];\n\n      while (++index < propsLength) {\n        var key = props[index];\n        if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {\n          result.push(key);\n        }\n      }\n      return result;\n    }\n\n    /**\n     * Converts `value` to an array-like object if it is not one.\n     *\n     * @private\n     * @param {*} value The value to process.\n     * @returns {Array|Object} Returns the array-like object.\n     */\n    function toIterable(value) {\n      if (value == null) {\n        return [];\n      }\n      if (!isLength(value.length)) {\n        return values(value);\n      }\n      return isObject(value) ? value : Object(value);\n    }\n\n    /**\n     * Converts `value` to an object if it is not one.\n     *\n     * @private\n     * @param {*} value The value to process.\n     * @returns {Object} Returns the object.\n     */\n    function toObject(value) {\n      return isObject(value) ? value : Object(value);\n    }\n\n    /**\n     * Creates a clone of `wrapper`.\n     *\n     * @private\n     * @param {Object} wrapper The wrapper to clone.\n     * @returns {Object} Returns the cloned wrapper.\n     */\n    function wrapperClone(wrapper) {\n      return wrapper instanceof LazyWrapper\n        ? wrapper.clone()\n        : new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Creates an array of elements split into groups the length of `size`.\n     * If `collection` can't be split evenly, the final chunk will be the remaining\n     * elements.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to process.\n     * @param {number} [size=1] The length of each chunk.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Array} Returns the new array containing chunks.\n     * @example\n     *\n     * _.chunk(['a', 'b', 'c', 'd'], 2);\n     * // => [['a', 'b'], ['c', 'd']]\n     *\n     * _.chunk(['a', 'b', 'c', 'd'], 3);\n     * // => [['a', 'b', 'c'], ['d']]\n     */\n    function chunk(array, size, guard) {\n      if (guard ? isIterateeCall(array, size, guard) : size == null) {\n        size = 1;\n      } else {\n        size = nativeMax(+size || 1, 1);\n      }\n      var index = 0,\n          length = array ? array.length : 0,\n          resIndex = -1,\n          result = Array(ceil(length / size));\n\n      while (index < length) {\n        result[++resIndex] = baseSlice(array, index, (index += size));\n      }\n      return result;\n    }\n\n    /**\n     * Creates an array with all falsey values removed. The values `false`, `null`,\n     * `0`, `\"\"`, `undefined`, and `NaN` are falsey.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to compact.\n     * @returns {Array} Returns the new array of filtered values.\n     * @example\n     *\n     * _.compact([0, 1, false, 2, '', 3]);\n     * // => [1, 2, 3]\n     */\n    function compact(array) {\n      var index = -1,\n          length = array ? array.length : 0,\n          resIndex = -1,\n          result = [];\n\n      while (++index < length) {\n        var value = array[index];\n        if (value) {\n          result[++resIndex] = value;\n        }\n      }\n      return result;\n    }\n\n    /**\n     * Creates an array excluding all values of the provided arrays using\n     * `SameValueZero` for equality comparisons.\n     *\n     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)\n     * comparisons are like strict equality comparisons, e.g. `===`, except that\n     * `NaN` matches `NaN`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to inspect.\n     * @param {...Array} [values] The arrays of values to exclude.\n     * @returns {Array} Returns the new array of filtered values.\n     * @example\n     *\n     * _.difference([1, 2, 3], [4, 2]);\n     * // => [1, 3]\n     */\n    var difference = restParam(function(array, values) {\n      return (isArray(array) || isArguments(array))\n        ? baseDifference(array, baseFlatten(values, false, true))\n        : [];\n    });\n\n    /**\n     * Creates a slice of `array` with `n` elements dropped from the beginning.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to query.\n     * @param {number} [n=1] The number of elements to drop.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Array} Returns the slice of `array`.\n     * @example\n     *\n     * _.drop([1, 2, 3]);\n     * // => [2, 3]\n     *\n     * _.drop([1, 2, 3], 2);\n     * // => [3]\n     *\n     * _.drop([1, 2, 3], 5);\n     * // => []\n     *\n     * _.drop([1, 2, 3], 0);\n     * // => [1, 2, 3]\n     */\n    function drop(array, n, guard) {\n      var length = array ? array.length : 0;\n      if (!length) {\n        return [];\n      }\n      if (guard ? isIterateeCall(array, n, guard) : n == null) {\n        n = 1;\n      }\n      return baseSlice(array, n < 0 ? 0 : n);\n    }\n\n    /**\n     * Creates a slice of `array` with `n` elements dropped from the end.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to query.\n     * @param {number} [n=1] The number of elements to drop.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Array} Returns the slice of `array`.\n     * @example\n     *\n     * _.dropRight([1, 2, 3]);\n     * // => [1, 2]\n     *\n     * _.dropRight([1, 2, 3], 2);\n     * // => [1]\n     *\n     * _.dropRight([1, 2, 3], 5);\n     * // => []\n     *\n     * _.dropRight([1, 2, 3], 0);\n     * // => [1, 2, 3]\n     */\n    function dropRight(array, n, guard) {\n      var length = array ? array.length : 0;\n      if (!length) {\n        return [];\n      }\n      if (guard ? isIterateeCall(array, n, guard) : n == null) {\n        n = 1;\n      }\n      n = length - (+n || 0);\n      return baseSlice(array, 0, n < 0 ? 0 : n);\n    }\n\n    /**\n     * Creates a slice of `array` excluding elements dropped from the end.\n     * Elements are dropped until `predicate` returns falsey. The predicate is\n     * bound to `thisArg` and invoked with three arguments: (value, index, array).\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that match the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to query.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {Array} Returns the slice of `array`.\n     * @example\n     *\n     * _.dropRightWhile([1, 2, 3], function(n) {\n     *   return n > 1;\n     * });\n     * // => [1]\n     *\n     * var users = [\n     *   { 'user': 'barney',  'active': true },\n     *   { 'user': 'fred',    'active': false },\n     *   { 'user': 'pebbles', 'active': false }\n     * ];\n     *\n     * // using the `_.matches` callback shorthand\n     * _.pluck(_.dropRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');\n     * // => ['barney', 'fred']\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.pluck(_.dropRightWhile(users, 'active', false), 'user');\n     * // => ['barney']\n     *\n     * // using the `_.property` callback shorthand\n     * _.pluck(_.dropRightWhile(users, 'active'), 'user');\n     * // => ['barney', 'fred', 'pebbles']\n     */\n    function dropRightWhile(array, predicate, thisArg) {\n      return (array && array.length)\n        ? baseWhile(array, getCallback(predicate, thisArg, 3), true, true)\n        : [];\n    }\n\n    /**\n     * Creates a slice of `array` excluding elements dropped from the beginning.\n     * Elements are dropped until `predicate` returns falsey. The predicate is\n     * bound to `thisArg` and invoked with three arguments: (value, index, array).\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to query.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {Array} Returns the slice of `array`.\n     * @example\n     *\n     * _.dropWhile([1, 2, 3], function(n) {\n     *   return n < 3;\n     * });\n     * // => [3]\n     *\n     * var users = [\n     *   { 'user': 'barney',  'active': false },\n     *   { 'user': 'fred',    'active': false },\n     *   { 'user': 'pebbles', 'active': true }\n     * ];\n     *\n     * // using the `_.matches` callback shorthand\n     * _.pluck(_.dropWhile(users, { 'user': 'barney', 'active': false }), 'user');\n     * // => ['fred', 'pebbles']\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.pluck(_.dropWhile(users, 'active', false), 'user');\n     * // => ['pebbles']\n     *\n     * // using the `_.property` callback shorthand\n     * _.pluck(_.dropWhile(users, 'active'), 'user');\n     * // => ['barney', 'fred', 'pebbles']\n     */\n    function dropWhile(array, predicate, thisArg) {\n      return (array && array.length)\n        ? baseWhile(array, getCallback(predicate, thisArg, 3), true)\n        : [];\n    }\n\n    /**\n     * Fills elements of `array` with `value` from `start` up to, but not\n     * including, `end`.\n     *\n     * **Note:** This method mutates `array`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to fill.\n     * @param {*} value The value to fill `array` with.\n     * @param {number} [start=0] The start position.\n     * @param {number} [end=array.length] The end position.\n     * @returns {Array} Returns `array`.\n     * @example\n     *\n     * var array = [1, 2, 3];\n     *\n     * _.fill(array, 'a');\n     * console.log(array);\n     * // => ['a', 'a', 'a']\n     *\n     * _.fill(Array(3), 2);\n     * // => [2, 2, 2]\n     *\n     * _.fill([4, 6, 8], '*', 1, 2);\n     * // => [4, '*', 8]\n     */\n    function fill(array, value, start, end) {\n      var length = array ? array.length : 0;\n      if (!length) {\n        return [];\n      }\n      if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {\n        start = 0;\n        end = length;\n      }\n      return baseFill(array, value, start, end);\n    }\n\n    /**\n     * This method is like `_.find` except that it returns the index of the first\n     * element `predicate` returns truthy for instead of the element itself.\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to search.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {number} Returns the index of the found element, else `-1`.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney',  'active': false },\n     *   { 'user': 'fred',    'active': false },\n     *   { 'user': 'pebbles', 'active': true }\n     * ];\n     *\n     * _.findIndex(users, function(chr) {\n     *   return chr.user == 'barney';\n     * });\n     * // => 0\n     *\n     * // using the `_.matches` callback shorthand\n     * _.findIndex(users, { 'user': 'fred', 'active': false });\n     * // => 1\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.findIndex(users, 'active', false);\n     * // => 0\n     *\n     * // using the `_.property` callback shorthand\n     * _.findIndex(users, 'active');\n     * // => 2\n     */\n    var findIndex = createFindIndex();\n\n    /**\n     * This method is like `_.findIndex` except that it iterates over elements\n     * of `collection` from right to left.\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to search.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {number} Returns the index of the found element, else `-1`.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney',  'active': true },\n     *   { 'user': 'fred',    'active': false },\n     *   { 'user': 'pebbles', 'active': false }\n     * ];\n     *\n     * _.findLastIndex(users, function(chr) {\n     *   return chr.user == 'pebbles';\n     * });\n     * // => 2\n     *\n     * // using the `_.matches` callback shorthand\n     * _.findLastIndex(users, { 'user': 'barney', 'active': true });\n     * // => 0\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.findLastIndex(users, 'active', false);\n     * // => 2\n     *\n     * // using the `_.property` callback shorthand\n     * _.findLastIndex(users, 'active');\n     * // => 0\n     */\n    var findLastIndex = createFindIndex(true);\n\n    /**\n     * Gets the first element of `array`.\n     *\n     * @static\n     * @memberOf _\n     * @alias head\n     * @category Array\n     * @param {Array} array The array to query.\n     * @returns {*} Returns the first element of `array`.\n     * @example\n     *\n     * _.first([1, 2, 3]);\n     * // => 1\n     *\n     * _.first([]);\n     * // => undefined\n     */\n    function first(array) {\n      return array ? array[0] : undefined;\n    }\n\n    /**\n     * Flattens a nested array. If `isDeep` is `true` the array is recursively\n     * flattened, otherwise it is only flattened a single level.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to flatten.\n     * @param {boolean} [isDeep] Specify a deep flatten.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Array} Returns the new flattened array.\n     * @example\n     *\n     * _.flatten([1, [2, 3, [4]]]);\n     * // => [1, 2, 3, [4]]\n     *\n     * // using `isDeep`\n     * _.flatten([1, [2, 3, [4]]], true);\n     * // => [1, 2, 3, 4]\n     */\n    function flatten(array, isDeep, guard) {\n      var length = array ? array.length : 0;\n      if (guard && isIterateeCall(array, isDeep, guard)) {\n        isDeep = false;\n      }\n      return length ? baseFlatten(array, isDeep) : [];\n    }\n\n    /**\n     * Recursively flattens a nested array.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to recursively flatten.\n     * @returns {Array} Returns the new flattened array.\n     * @example\n     *\n     * _.flattenDeep([1, [2, 3, [4]]]);\n     * // => [1, 2, 3, 4]\n     */\n    function flattenDeep(array) {\n      var length = array ? array.length : 0;\n      return length ? baseFlatten(array, true) : [];\n    }\n\n    /**\n     * Gets the index at which the first occurrence of `value` is found in `array`\n     * using `SameValueZero` for equality comparisons. If `fromIndex` is negative,\n     * it is used as the offset from the end of `array`. If `array` is sorted\n     * providing `true` for `fromIndex` performs a faster binary search.\n     *\n     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)\n     * comparisons are like strict equality comparisons, e.g. `===`, except that\n     * `NaN` matches `NaN`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to search.\n     * @param {*} value The value to search for.\n     * @param {boolean|number} [fromIndex=0] The index to search from or `true`\n     *  to perform a binary search on a sorted array.\n     * @returns {number} Returns the index of the matched value, else `-1`.\n     * @example\n     *\n     * _.indexOf([1, 2, 1, 2], 2);\n     * // => 1\n     *\n     * // using `fromIndex`\n     * _.indexOf([1, 2, 1, 2], 2, 2);\n     * // => 3\n     *\n     * // performing a binary search\n     * _.indexOf([1, 1, 2, 2], 2, true);\n     * // => 2\n     */\n    function indexOf(array, value, fromIndex) {\n      var length = array ? array.length : 0;\n      if (!length) {\n        return -1;\n      }\n      if (typeof fromIndex == 'number') {\n        fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;\n      } else if (fromIndex) {\n        var index = binaryIndex(array, value),\n            other = array[index];\n\n        if (value === value ? (value === other) : (other !== other)) {\n          return index;\n        }\n        return -1;\n      }\n      return baseIndexOf(array, value, fromIndex || 0);\n    }\n\n    /**\n     * Gets all but the last element of `array`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to query.\n     * @returns {Array} Returns the slice of `array`.\n     * @example\n     *\n     * _.initial([1, 2, 3]);\n     * // => [1, 2]\n     */\n    function initial(array) {\n      return dropRight(array, 1);\n    }\n\n    /**\n     * Creates an array of unique values in all provided arrays using `SameValueZero`\n     * for equality comparisons.\n     *\n     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)\n     * comparisons are like strict equality comparisons, e.g. `===`, except that\n     * `NaN` matches `NaN`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {...Array} [arrays] The arrays to inspect.\n     * @returns {Array} Returns the new array of shared values.\n     * @example\n     * _.intersection([1, 2], [4, 2], [2, 1]);\n     * // => [2]\n     */\n    function intersection() {\n      var args = [],\n          argsIndex = -1,\n          argsLength = arguments.length,\n          caches = [],\n          indexOf = getIndexOf(),\n          isCommon = indexOf == baseIndexOf;\n\n      while (++argsIndex < argsLength) {\n        var value = arguments[argsIndex];\n        if (isArray(value) || isArguments(value)) {\n          args.push(value);\n          caches.push((isCommon && value.length >= 120) ? createCache(argsIndex && value) : null);\n        }\n      }\n      argsLength = args.length;\n      var array = args[0],\n          index = -1,\n          length = array ? array.length : 0,\n          result = [],\n          seen = caches[0];\n\n      outer:\n      while (++index < length) {\n        value = array[index];\n        if ((seen ? cacheIndexOf(seen, value) : indexOf(result, value, 0)) < 0) {\n          argsIndex = argsLength;\n          while (--argsIndex) {\n            var cache = caches[argsIndex];\n            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value, 0)) < 0) {\n              continue outer;\n            }\n          }\n          if (seen) {\n            seen.push(value);\n          }\n          result.push(value);\n        }\n      }\n      return result;\n    }\n\n    /**\n     * Gets the last element of `array`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to query.\n     * @returns {*} Returns the last element of `array`.\n     * @example\n     *\n     * _.last([1, 2, 3]);\n     * // => 3\n     */\n    function last(array) {\n      var length = array ? array.length : 0;\n      return length ? array[length - 1] : undefined;\n    }\n\n    /**\n     * This method is like `_.indexOf` except that it iterates over elements of\n     * `array` from right to left.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to search.\n     * @param {*} value The value to search for.\n     * @param {boolean|number} [fromIndex=array.length-1] The index to search from\n     *  or `true` to perform a binary search on a sorted array.\n     * @returns {number} Returns the index of the matched value, else `-1`.\n     * @example\n     *\n     * _.lastIndexOf([1, 2, 1, 2], 2);\n     * // => 3\n     *\n     * // using `fromIndex`\n     * _.lastIndexOf([1, 2, 1, 2], 2, 2);\n     * // => 1\n     *\n     * // performing a binary search\n     * _.lastIndexOf([1, 1, 2, 2], 2, true);\n     * // => 3\n     */\n    function lastIndexOf(array, value, fromIndex) {\n      var length = array ? array.length : 0;\n      if (!length) {\n        return -1;\n      }\n      var index = length;\n      if (typeof fromIndex == 'number') {\n        index = (fromIndex < 0 ? nativeMax(length + fromIndex, 0) : nativeMin(fromIndex || 0, length - 1)) + 1;\n      } else if (fromIndex) {\n        index = binaryIndex(array, value, true) - 1;\n        var other = array[index];\n        if (value === value ? (value === other) : (other !== other)) {\n          return index;\n        }\n        return -1;\n      }\n      if (value !== value) {\n        return indexOfNaN(array, index, true);\n      }\n      while (index--) {\n        if (array[index] === value) {\n          return index;\n        }\n      }\n      return -1;\n    }\n\n    /**\n     * Removes all provided values from `array` using `SameValueZero` for equality\n     * comparisons.\n     *\n     * **Notes:**\n     *  - Unlike `_.without`, this method mutates `array`\n     *  - [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)\n     *    comparisons are like strict equality comparisons, e.g. `===`, except\n     *    that `NaN` matches `NaN`\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to modify.\n     * @param {...*} [values] The values to remove.\n     * @returns {Array} Returns `array`.\n     * @example\n     *\n     * var array = [1, 2, 3, 1, 2, 3];\n     *\n     * _.pull(array, 2, 3);\n     * console.log(array);\n     * // => [1, 1]\n     */\n    function pull() {\n      var args = arguments,\n          array = args[0];\n\n      if (!(array && array.length)) {\n        return array;\n      }\n      var index = 0,\n          indexOf = getIndexOf(),\n          length = args.length;\n\n      while (++index < length) {\n        var fromIndex = 0,\n            value = args[index];\n\n        while ((fromIndex = indexOf(array, value, fromIndex)) > -1) {\n          splice.call(array, fromIndex, 1);\n        }\n      }\n      return array;\n    }\n\n    /**\n     * Removes elements from `array` corresponding to the given indexes and returns\n     * an array of the removed elements. Indexes may be specified as an array of\n     * indexes or as individual arguments.\n     *\n     * **Note:** Unlike `_.at`, this method mutates `array`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to modify.\n     * @param {...(number|number[])} [indexes] The indexes of elements to remove,\n     *  specified as individual indexes or arrays of indexes.\n     * @returns {Array} Returns the new array of removed elements.\n     * @example\n     *\n     * var array = [5, 10, 15, 20];\n     * var evens = _.pullAt(array, 1, 3);\n     *\n     * console.log(array);\n     * // => [5, 15]\n     *\n     * console.log(evens);\n     * // => [10, 20]\n     */\n    var pullAt = restParam(function(array, indexes) {\n      array || (array = []);\n      indexes = baseFlatten(indexes);\n\n      var length = indexes.length,\n          result = baseAt(array, indexes);\n\n      indexes.sort(baseCompareAscending);\n      while (length--) {\n        var index = parseFloat(indexes[length]);\n        if (index != previous && isIndex(index)) {\n          var previous = index;\n          splice.call(array, index, 1);\n        }\n      }\n      return result;\n    });\n\n    /**\n     * Removes all elements from `array` that `predicate` returns truthy for\n     * and returns an array of the removed elements. The predicate is bound to\n     * `thisArg` and invoked with three arguments: (value, index, array).\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * **Note:** Unlike `_.filter`, this method mutates `array`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to modify.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {Array} Returns the new array of removed elements.\n     * @example\n     *\n     * var array = [1, 2, 3, 4];\n     * var evens = _.remove(array, function(n) {\n     *   return n % 2 == 0;\n     * });\n     *\n     * console.log(array);\n     * // => [1, 3]\n     *\n     * console.log(evens);\n     * // => [2, 4]\n     */\n    function remove(array, predicate, thisArg) {\n      var index = -1,\n          length = array ? array.length : 0,\n          result = [];\n\n      predicate = getCallback(predicate, thisArg, 3);\n      while (++index < length) {\n        var value = array[index];\n        if (predicate(value, index, array)) {\n          result.push(value);\n          splice.call(array, index--, 1);\n          length--;\n        }\n      }\n      return result;\n    }\n\n    /**\n     * Gets all but the first element of `array`.\n     *\n     * @static\n     * @memberOf _\n     * @alias tail\n     * @category Array\n     * @param {Array} array The array to query.\n     * @returns {Array} Returns the slice of `array`.\n     * @example\n     *\n     * _.rest([1, 2, 3]);\n     * // => [2, 3]\n     */\n    function rest(array) {\n      return drop(array, 1);\n    }\n\n    /**\n     * Creates a slice of `array` from `start` up to, but not including, `end`.\n     *\n     * **Note:** This function is used instead of `Array#slice` to support node\n     * lists in IE < 9 and to ensure dense arrays are returned.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to slice.\n     * @param {number} [start=0] The start position.\n     * @param {number} [end=array.length] The end position.\n     * @returns {Array} Returns the slice of `array`.\n     */\n    function slice(array, start, end) {\n      var length = array ? array.length : 0;\n      if (!length) {\n        return [];\n      }\n      if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {\n        start = 0;\n        end = length;\n      }\n      return baseSlice(array, start, end);\n    }\n\n    /**\n     * Uses a binary search to determine the lowest index at which `value` should\n     * be inserted into `array` in order to maintain its sort order. If an iteratee\n     * function is provided it is invoked for `value` and each element of `array`\n     * to compute their sort ranking. The iteratee is bound to `thisArg` and\n     * invoked with one argument; (value).\n     *\n     * If a property name is provided for `iteratee` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `iteratee` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The sorted array to inspect.\n     * @param {*} value The value to evaluate.\n     * @param {Function|Object|string} [iteratee=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {number} Returns the index at which `value` should be inserted\n     *  into `array`.\n     * @example\n     *\n     * _.sortedIndex([30, 50], 40);\n     * // => 1\n     *\n     * _.sortedIndex([4, 4, 5, 5], 5);\n     * // => 2\n     *\n     * var dict = { 'data': { 'thirty': 30, 'forty': 40, 'fifty': 50 } };\n     *\n     * // using an iteratee function\n     * _.sortedIndex(['thirty', 'fifty'], 'forty', function(word) {\n     *   return this.data[word];\n     * }, dict);\n     * // => 1\n     *\n     * // using the `_.property` callback shorthand\n     * _.sortedIndex([{ 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');\n     * // => 1\n     */\n    var sortedIndex = createSortedIndex();\n\n    /**\n     * This method is like `_.sortedIndex` except that it returns the highest\n     * index at which `value` should be inserted into `array` in order to\n     * maintain its sort order.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The sorted array to inspect.\n     * @param {*} value The value to evaluate.\n     * @param {Function|Object|string} [iteratee=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {number} Returns the index at which `value` should be inserted\n     *  into `array`.\n     * @example\n     *\n     * _.sortedLastIndex([4, 4, 5, 5], 5);\n     * // => 4\n     */\n    var sortedLastIndex = createSortedIndex(true);\n\n    /**\n     * Creates a slice of `array` with `n` elements taken from the beginning.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to query.\n     * @param {number} [n=1] The number of elements to take.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Array} Returns the slice of `array`.\n     * @example\n     *\n     * _.take([1, 2, 3]);\n     * // => [1]\n     *\n     * _.take([1, 2, 3], 2);\n     * // => [1, 2]\n     *\n     * _.take([1, 2, 3], 5);\n     * // => [1, 2, 3]\n     *\n     * _.take([1, 2, 3], 0);\n     * // => []\n     */\n    function take(array, n, guard) {\n      var length = array ? array.length : 0;\n      if (!length) {\n        return [];\n      }\n      if (guard ? isIterateeCall(array, n, guard) : n == null) {\n        n = 1;\n      }\n      return baseSlice(array, 0, n < 0 ? 0 : n);\n    }\n\n    /**\n     * Creates a slice of `array` with `n` elements taken from the end.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to query.\n     * @param {number} [n=1] The number of elements to take.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Array} Returns the slice of `array`.\n     * @example\n     *\n     * _.takeRight([1, 2, 3]);\n     * // => [3]\n     *\n     * _.takeRight([1, 2, 3], 2);\n     * // => [2, 3]\n     *\n     * _.takeRight([1, 2, 3], 5);\n     * // => [1, 2, 3]\n     *\n     * _.takeRight([1, 2, 3], 0);\n     * // => []\n     */\n    function takeRight(array, n, guard) {\n      var length = array ? array.length : 0;\n      if (!length) {\n        return [];\n      }\n      if (guard ? isIterateeCall(array, n, guard) : n == null) {\n        n = 1;\n      }\n      n = length - (+n || 0);\n      return baseSlice(array, n < 0 ? 0 : n);\n    }\n\n    /**\n     * Creates a slice of `array` with elements taken from the end. Elements are\n     * taken until `predicate` returns falsey. The predicate is bound to `thisArg`\n     * and invoked with three arguments: (value, index, array).\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to query.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {Array} Returns the slice of `array`.\n     * @example\n     *\n     * _.takeRightWhile([1, 2, 3], function(n) {\n     *   return n > 1;\n     * });\n     * // => [2, 3]\n     *\n     * var users = [\n     *   { 'user': 'barney',  'active': true },\n     *   { 'user': 'fred',    'active': false },\n     *   { 'user': 'pebbles', 'active': false }\n     * ];\n     *\n     * // using the `_.matches` callback shorthand\n     * _.pluck(_.takeRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');\n     * // => ['pebbles']\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.pluck(_.takeRightWhile(users, 'active', false), 'user');\n     * // => ['fred', 'pebbles']\n     *\n     * // using the `_.property` callback shorthand\n     * _.pluck(_.takeRightWhile(users, 'active'), 'user');\n     * // => []\n     */\n    function takeRightWhile(array, predicate, thisArg) {\n      return (array && array.length)\n        ? baseWhile(array, getCallback(predicate, thisArg, 3), false, true)\n        : [];\n    }\n\n    /**\n     * Creates a slice of `array` with elements taken from the beginning. Elements\n     * are taken until `predicate` returns falsey. The predicate is bound to\n     * `thisArg` and invoked with three arguments: (value, index, array).\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to query.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {Array} Returns the slice of `array`.\n     * @example\n     *\n     * _.takeWhile([1, 2, 3], function(n) {\n     *   return n < 3;\n     * });\n     * // => [1, 2]\n     *\n     * var users = [\n     *   { 'user': 'barney',  'active': false },\n     *   { 'user': 'fred',    'active': false},\n     *   { 'user': 'pebbles', 'active': true }\n     * ];\n     *\n     * // using the `_.matches` callback shorthand\n     * _.pluck(_.takeWhile(users, { 'user': 'barney', 'active': false }), 'user');\n     * // => ['barney']\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.pluck(_.takeWhile(users, 'active', false), 'user');\n     * // => ['barney', 'fred']\n     *\n     * // using the `_.property` callback shorthand\n     * _.pluck(_.takeWhile(users, 'active'), 'user');\n     * // => []\n     */\n    function takeWhile(array, predicate, thisArg) {\n      return (array && array.length)\n        ? baseWhile(array, getCallback(predicate, thisArg, 3))\n        : [];\n    }\n\n    /**\n     * Creates an array of unique values, in order, of the provided arrays using\n     * `SameValueZero` for equality comparisons.\n     *\n     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)\n     * comparisons are like strict equality comparisons, e.g. `===`, except that\n     * `NaN` matches `NaN`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {...Array} [arrays] The arrays to inspect.\n     * @returns {Array} Returns the new array of combined values.\n     * @example\n     *\n     * _.union([1, 2], [4, 2], [2, 1]);\n     * // => [1, 2, 4]\n     */\n    var union = restParam(function(arrays) {\n      return baseUniq(baseFlatten(arrays, false, true));\n    });\n\n    /**\n     * Creates a duplicate-value-free version of an array using `SameValueZero`\n     * for equality comparisons. Providing `true` for `isSorted` performs a faster\n     * search algorithm for sorted arrays. If an iteratee function is provided it\n     * is invoked for each value in the array to generate the criterion by which\n     * uniqueness is computed. The `iteratee` is bound to `thisArg` and invoked\n     * with three arguments: (value, index, array).\n     *\n     * If a property name is provided for `iteratee` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `iteratee` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)\n     * comparisons are like strict equality comparisons, e.g. `===`, except that\n     * `NaN` matches `NaN`.\n     *\n     * @static\n     * @memberOf _\n     * @alias unique\n     * @category Array\n     * @param {Array} array The array to inspect.\n     * @param {boolean} [isSorted] Specify the array is sorted.\n     * @param {Function|Object|string} [iteratee] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Array} Returns the new duplicate-value-free array.\n     * @example\n     *\n     * _.uniq([1, 2, 1]);\n     * // => [1, 2]\n     *\n     * // using `isSorted`\n     * _.uniq([1, 1, 2], true);\n     * // => [1, 2]\n     *\n     * // using an iteratee function\n     * _.uniq([1, 2.5, 1.5, 2], function(n) {\n     *   return this.floor(n);\n     * }, Math);\n     * // => [1, 2.5]\n     *\n     * // using the `_.property` callback shorthand\n     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');\n     * // => [{ 'x': 1 }, { 'x': 2 }]\n     */\n    function uniq(array, isSorted, iteratee, thisArg) {\n      var length = array ? array.length : 0;\n      if (!length) {\n        return [];\n      }\n      if (isSorted != null && typeof isSorted != 'boolean') {\n        thisArg = iteratee;\n        iteratee = isIterateeCall(array, isSorted, thisArg) ? null : isSorted;\n        isSorted = false;\n      }\n      var func = getCallback();\n      if (!(func === baseCallback && iteratee == null)) {\n        iteratee = func(iteratee, thisArg, 3);\n      }\n      return (isSorted && getIndexOf() == baseIndexOf)\n        ? sortedUniq(array, iteratee)\n        : baseUniq(array, iteratee);\n    }\n\n    /**\n     * This method is like `_.zip` except that it accepts an array of grouped\n     * elements and creates an array regrouping the elements to their pre-`_.zip`\n     * configuration.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array of grouped elements to process.\n     * @returns {Array} Returns the new array of regrouped elements.\n     * @example\n     *\n     * var zipped = _.zip(['fred', 'barney'], [30, 40], [true, false]);\n     * // => [['fred', 30, true], ['barney', 40, false]]\n     *\n     * _.unzip(zipped);\n     * // => [['fred', 'barney'], [30, 40], [true, false]]\n     */\n    function unzip(array) {\n      var index = -1,\n          length = (array && array.length && arrayMax(arrayMap(array, getLength))) >>> 0,\n          result = Array(length);\n\n      while (++index < length) {\n        result[index] = arrayMap(array, baseProperty(index));\n      }\n      return result;\n    }\n\n    /**\n     * Creates an array excluding all provided values using `SameValueZero` for\n     * equality comparisons.\n     *\n     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)\n     * comparisons are like strict equality comparisons, e.g. `===`, except that\n     * `NaN` matches `NaN`.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {Array} array The array to filter.\n     * @param {...*} [values] The values to exclude.\n     * @returns {Array} Returns the new array of filtered values.\n     * @example\n     *\n     * _.without([1, 2, 1, 3], 1, 2);\n     * // => [3]\n     */\n    var without = restParam(function(array, values) {\n      return (isArray(array) || isArguments(array))\n        ? baseDifference(array, values)\n        : [];\n    });\n\n    /**\n     * Creates an array that is the [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)\n     * of the provided arrays.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {...Array} [arrays] The arrays to inspect.\n     * @returns {Array} Returns the new array of values.\n     * @example\n     *\n     * _.xor([1, 2], [4, 2]);\n     * // => [1, 4]\n     */\n    function xor() {\n      var index = -1,\n          length = arguments.length;\n\n      while (++index < length) {\n        var array = arguments[index];\n        if (isArray(array) || isArguments(array)) {\n          var result = result\n            ? baseDifference(result, array).concat(baseDifference(array, result))\n            : array;\n        }\n      }\n      return result ? baseUniq(result) : [];\n    }\n\n    /**\n     * Creates an array of grouped elements, the first of which contains the first\n     * elements of the given arrays, the second of which contains the second elements\n     * of the given arrays, and so on.\n     *\n     * @static\n     * @memberOf _\n     * @category Array\n     * @param {...Array} [arrays] The arrays to process.\n     * @returns {Array} Returns the new array of grouped elements.\n     * @example\n     *\n     * _.zip(['fred', 'barney'], [30, 40], [true, false]);\n     * // => [['fred', 30, true], ['barney', 40, false]]\n     */\n    var zip = restParam(unzip);\n\n    /**\n     * The inverse of `_.pairs`; this method returns an object composed from arrays\n     * of property names and values. Provide either a single two dimensional array,\n     * e.g. `[[key1, value1], [key2, value2]]` or two arrays, one of property names\n     * and one of corresponding values.\n     *\n     * @static\n     * @memberOf _\n     * @alias object\n     * @category Array\n     * @param {Array} props The property names.\n     * @param {Array} [values=[]] The property values.\n     * @returns {Object} Returns the new object.\n     * @example\n     *\n     * _.zipObject([['fred', 30], ['barney', 40]]);\n     * // => { 'fred': 30, 'barney': 40 }\n     *\n     * _.zipObject(['fred', 'barney'], [30, 40]);\n     * // => { 'fred': 30, 'barney': 40 }\n     */\n    function zipObject(props, values) {\n      var index = -1,\n          length = props ? props.length : 0,\n          result = {};\n\n      if (length && !values && !isArray(props[0])) {\n        values = [];\n      }\n      while (++index < length) {\n        var key = props[index];\n        if (values) {\n          result[key] = values[index];\n        } else if (key) {\n          result[key[0]] = key[1];\n        }\n      }\n      return result;\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Creates a `lodash` object that wraps `value` with explicit method\n     * chaining enabled.\n     *\n     * @static\n     * @memberOf _\n     * @category Chain\n     * @param {*} value The value to wrap.\n     * @returns {Object} Returns the new `lodash` wrapper instance.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney',  'age': 36 },\n     *   { 'user': 'fred',    'age': 40 },\n     *   { 'user': 'pebbles', 'age': 1 }\n     * ];\n     *\n     * var youngest = _.chain(users)\n     *   .sortBy('age')\n     *   .map(function(chr) {\n     *     return chr.user + ' is ' + chr.age;\n     *   })\n     *   .first()\n     *   .value();\n     * // => 'pebbles is 1'\n     */\n    function chain(value) {\n      var result = lodash(value);\n      result.__chain__ = true;\n      return result;\n    }\n\n    /**\n     * This method invokes `interceptor` and returns `value`. The interceptor is\n     * bound to `thisArg` and invoked with one argument; (value). The purpose of\n     * this method is to \"tap into\" a method chain in order to perform operations\n     * on intermediate results within the chain.\n     *\n     * @static\n     * @memberOf _\n     * @category Chain\n     * @param {*} value The value to provide to `interceptor`.\n     * @param {Function} interceptor The function to invoke.\n     * @param {*} [thisArg] The `this` binding of `interceptor`.\n     * @returns {*} Returns `value`.\n     * @example\n     *\n     * _([1, 2, 3])\n     *  .tap(function(array) {\n     *    array.pop();\n     *  })\n     *  .reverse()\n     *  .value();\n     * // => [2, 1]\n     */\n    function tap(value, interceptor, thisArg) {\n      interceptor.call(thisArg, value);\n      return value;\n    }\n\n    /**\n     * This method is like `_.tap` except that it returns the result of `interceptor`.\n     *\n     * @static\n     * @memberOf _\n     * @category Chain\n     * @param {*} value The value to provide to `interceptor`.\n     * @param {Function} interceptor The function to invoke.\n     * @param {*} [thisArg] The `this` binding of `interceptor`.\n     * @returns {*} Returns the result of `interceptor`.\n     * @example\n     *\n     * _('  abc  ')\n     *  .chain()\n     *  .trim()\n     *  .thru(function(value) {\n     *    return [value];\n     *  })\n     *  .value();\n     * // => ['abc']\n     */\n    function thru(value, interceptor, thisArg) {\n      return interceptor.call(thisArg, value);\n    }\n\n    /**\n     * Enables explicit method chaining on the wrapper object.\n     *\n     * @name chain\n     * @memberOf _\n     * @category Chain\n     * @returns {Object} Returns the new `lodash` wrapper instance.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36 },\n     *   { 'user': 'fred',   'age': 40 }\n     * ];\n     *\n     * // without explicit chaining\n     * _(users).first();\n     * // => { 'user': 'barney', 'age': 36 }\n     *\n     * // with explicit chaining\n     * _(users).chain()\n     *   .first()\n     *   .pick('user')\n     *   .value();\n     * // => { 'user': 'barney' }\n     */\n    function wrapperChain() {\n      return chain(this);\n    }\n\n    /**\n     * Executes the chained sequence and returns the wrapped result.\n     *\n     * @name commit\n     * @memberOf _\n     * @category Chain\n     * @returns {Object} Returns the new `lodash` wrapper instance.\n     * @example\n     *\n     * var array = [1, 2];\n     * var wrapper = _(array).push(3);\n     *\n     * console.log(array);\n     * // => [1, 2]\n     *\n     * wrapper = wrapper.commit();\n     * console.log(array);\n     * // => [1, 2, 3]\n     *\n     * wrapper.last();\n     * // => 3\n     *\n     * console.log(array);\n     * // => [1, 2, 3]\n     */\n    function wrapperCommit() {\n      return new LodashWrapper(this.value(), this.__chain__);\n    }\n\n    /**\n     * Creates a clone of the chained sequence planting `value` as the wrapped value.\n     *\n     * @name plant\n     * @memberOf _\n     * @category Chain\n     * @returns {Object} Returns the new `lodash` wrapper instance.\n     * @example\n     *\n     * var array = [1, 2];\n     * var wrapper = _(array).map(function(value) {\n     *   return Math.pow(value, 2);\n     * });\n     *\n     * var other = [3, 4];\n     * var otherWrapper = wrapper.plant(other);\n     *\n     * otherWrapper.value();\n     * // => [9, 16]\n     *\n     * wrapper.value();\n     * // => [1, 4]\n     */\n    function wrapperPlant(value) {\n      var result,\n          parent = this;\n\n      while (parent instanceof baseLodash) {\n        var clone = wrapperClone(parent);\n        if (result) {\n          previous.__wrapped__ = clone;\n        } else {\n          result = clone;\n        }\n        var previous = clone;\n        parent = parent.__wrapped__;\n      }\n      previous.__wrapped__ = value;\n      return result;\n    }\n\n    /**\n     * Reverses the wrapped array so the first element becomes the last, the\n     * second element becomes the second to last, and so on.\n     *\n     * **Note:** This method mutates the wrapped array.\n     *\n     * @name reverse\n     * @memberOf _\n     * @category Chain\n     * @returns {Object} Returns the new reversed `lodash` wrapper instance.\n     * @example\n     *\n     * var array = [1, 2, 3];\n     *\n     * _(array).reverse().value()\n     * // => [3, 2, 1]\n     *\n     * console.log(array);\n     * // => [3, 2, 1]\n     */\n    function wrapperReverse() {\n      var value = this.__wrapped__;\n      if (value instanceof LazyWrapper) {\n        if (this.__actions__.length) {\n          value = new LazyWrapper(this);\n        }\n        return new LodashWrapper(value.reverse(), this.__chain__);\n      }\n      return this.thru(function(value) {\n        return value.reverse();\n      });\n    }\n\n    /**\n     * Produces the result of coercing the unwrapped value to a string.\n     *\n     * @name toString\n     * @memberOf _\n     * @category Chain\n     * @returns {string} Returns the coerced string value.\n     * @example\n     *\n     * _([1, 2, 3]).toString();\n     * // => '1,2,3'\n     */\n    function wrapperToString() {\n      return (this.value() + '');\n    }\n\n    /**\n     * Executes the chained sequence to extract the unwrapped value.\n     *\n     * @name value\n     * @memberOf _\n     * @alias run, toJSON, valueOf\n     * @category Chain\n     * @returns {*} Returns the resolved unwrapped value.\n     * @example\n     *\n     * _([1, 2, 3]).value();\n     * // => [1, 2, 3]\n     */\n    function wrapperValue() {\n      return baseWrapperValue(this.__wrapped__, this.__actions__);\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Creates an array of elements corresponding to the given keys, or indexes,\n     * of `collection`. Keys may be specified as individual arguments or as arrays\n     * of keys.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {...(number|number[]|string|string[])} [props] The property names\n     *  or indexes of elements to pick, specified individually or in arrays.\n     * @returns {Array} Returns the new array of picked elements.\n     * @example\n     *\n     * _.at(['a', 'b', 'c'], [0, 2]);\n     * // => ['a', 'c']\n     *\n     * _.at(['barney', 'fred', 'pebbles'], 0, 2);\n     * // => ['barney', 'pebbles']\n     */\n    var at = restParam(function(collection, props) {\n      var length = collection ? collection.length : 0;\n      if (isLength(length)) {\n        collection = toIterable(collection);\n      }\n      return baseAt(collection, baseFlatten(props));\n    });\n\n    /**\n     * Creates an object composed of keys generated from the results of running\n     * each element of `collection` through `iteratee`. The corresponding value\n     * of each key is the number of times the key was returned by `iteratee`.\n     * The `iteratee` is bound to `thisArg` and invoked with three arguments:\n     * (value, index|key, collection).\n     *\n     * If a property name is provided for `iteratee` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `iteratee` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [iteratee=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Object} Returns the composed aggregate object.\n     * @example\n     *\n     * _.countBy([4.3, 6.1, 6.4], function(n) {\n     *   return Math.floor(n);\n     * });\n     * // => { '4': 1, '6': 2 }\n     *\n     * _.countBy([4.3, 6.1, 6.4], function(n) {\n     *   return this.floor(n);\n     * }, Math);\n     * // => { '4': 1, '6': 2 }\n     *\n     * _.countBy(['one', 'two', 'three'], 'length');\n     * // => { '3': 2, '5': 1 }\n     */\n    var countBy = createAggregator(function(result, value, key) {\n      hasOwnProperty.call(result, key) ? ++result[key] : (result[key] = 1);\n    });\n\n    /**\n     * Checks if `predicate` returns truthy for **all** elements of `collection`.\n     * The predicate is bound to `thisArg` and invoked with three arguments:\n     * (value, index|key, collection).\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @alias all\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {boolean} Returns `true` if all elements pass the predicate check,\n     *  else `false`.\n     * @example\n     *\n     * _.every([true, 1, null, 'yes'], Boolean);\n     * // => false\n     *\n     * var users = [\n     *   { 'user': 'barney', 'active': false },\n     *   { 'user': 'fred',   'active': false }\n     * ];\n     *\n     * // using the `_.matches` callback shorthand\n     * _.every(users, { 'user': 'barney', 'active': false });\n     * // => false\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.every(users, 'active', false);\n     * // => true\n     *\n     * // using the `_.property` callback shorthand\n     * _.every(users, 'active');\n     * // => false\n     */\n    function every(collection, predicate, thisArg) {\n      var func = isArray(collection) ? arrayEvery : baseEvery;\n      if (thisArg && isIterateeCall(collection, predicate, thisArg)) {\n        predicate = null;\n      }\n      if (typeof predicate != 'function' || typeof thisArg != 'undefined') {\n        predicate = getCallback(predicate, thisArg, 3);\n      }\n      return func(collection, predicate);\n    }\n\n    /**\n     * Iterates over elements of `collection`, returning an array of all elements\n     * `predicate` returns truthy for. The predicate is bound to `thisArg` and\n     * invoked with three arguments: (value, index|key, collection).\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @alias select\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {Array} Returns the new filtered array.\n     * @example\n     *\n     * _.filter([4, 5, 6], function(n) {\n     *   return n % 2 == 0;\n     * });\n     * // => [4, 6]\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36, 'active': true },\n     *   { 'user': 'fred',   'age': 40, 'active': false }\n     * ];\n     *\n     * // using the `_.matches` callback shorthand\n     * _.pluck(_.filter(users, { 'age': 36, 'active': true }), 'user');\n     * // => ['barney']\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.pluck(_.filter(users, 'active', false), 'user');\n     * // => ['fred']\n     *\n     * // using the `_.property` callback shorthand\n     * _.pluck(_.filter(users, 'active'), 'user');\n     * // => ['barney']\n     */\n    function filter(collection, predicate, thisArg) {\n      var func = isArray(collection) ? arrayFilter : baseFilter;\n      predicate = getCallback(predicate, thisArg, 3);\n      return func(collection, predicate);\n    }\n\n    /**\n     * Iterates over elements of `collection`, returning the first element\n     * `predicate` returns truthy for. The predicate is bound to `thisArg` and\n     * invoked with three arguments: (value, index|key, collection).\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @alias detect\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to search.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {*} Returns the matched element, else `undefined`.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney',  'age': 36, 'active': true },\n     *   { 'user': 'fred',    'age': 40, 'active': false },\n     *   { 'user': 'pebbles', 'age': 1,  'active': true }\n     * ];\n     *\n     * _.result(_.find(users, function(chr) {\n     *   return chr.age < 40;\n     * }), 'user');\n     * // => 'barney'\n     *\n     * // using the `_.matches` callback shorthand\n     * _.result(_.find(users, { 'age': 1, 'active': true }), 'user');\n     * // => 'pebbles'\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.result(_.find(users, 'active', false), 'user');\n     * // => 'fred'\n     *\n     * // using the `_.property` callback shorthand\n     * _.result(_.find(users, 'active'), 'user');\n     * // => 'barney'\n     */\n    var find = createFind(baseEach);\n\n    /**\n     * This method is like `_.find` except that it iterates over elements of\n     * `collection` from right to left.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to search.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {*} Returns the matched element, else `undefined`.\n     * @example\n     *\n     * _.findLast([1, 2, 3, 4], function(n) {\n     *   return n % 2 == 1;\n     * });\n     * // => 3\n     */\n    var findLast = createFind(baseEachRight, true);\n\n    /**\n     * Performs a deep comparison between each element in `collection` and the\n     * source object, returning the first element that has equivalent property\n     * values.\n     *\n     * **Note:** This method supports comparing arrays, booleans, `Date` objects,\n     * numbers, `Object` objects, regexes, and strings. Objects are compared by\n     * their own, not inherited, enumerable properties. For comparing a single\n     * own or inherited property value see `_.matchesProperty`.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to search.\n     * @param {Object} source The object of property values to match.\n     * @returns {*} Returns the matched element, else `undefined`.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36, 'active': true },\n     *   { 'user': 'fred',   'age': 40, 'active': false }\n     * ];\n     *\n     * _.result(_.findWhere(users, { 'age': 36, 'active': true }), 'user');\n     * // => 'barney'\n     *\n     * _.result(_.findWhere(users, { 'age': 40, 'active': false }), 'user');\n     * // => 'fred'\n     */\n    function findWhere(collection, source) {\n      return find(collection, baseMatches(source));\n    }\n\n    /**\n     * Iterates over elements of `collection` invoking `iteratee` for each element.\n     * The `iteratee` is bound to `thisArg` and invoked with three arguments:\n     * (value, index|key, collection). Iterator functions may exit iteration early\n     * by explicitly returning `false`.\n     *\n     * **Note:** As with other \"Collections\" methods, objects with a `length` property\n     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`\n     * may be used for object iteration.\n     *\n     * @static\n     * @memberOf _\n     * @alias each\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} [iteratee=_.identity] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Array|Object|string} Returns `collection`.\n     * @example\n     *\n     * _([1, 2]).forEach(function(n) {\n     *   console.log(n);\n     * }).value();\n     * // => logs each value from left to right and returns the array\n     *\n     * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {\n     *   console.log(n, key);\n     * });\n     * // => logs each value-key pair and returns the object (iteration order is not guaranteed)\n     */\n    var forEach = createForEach(arrayEach, baseEach);\n\n    /**\n     * This method is like `_.forEach` except that it iterates over elements of\n     * `collection` from right to left.\n     *\n     * @static\n     * @memberOf _\n     * @alias eachRight\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} [iteratee=_.identity] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Array|Object|string} Returns `collection`.\n     * @example\n     *\n     * _([1, 2]).forEachRight(function(n) {\n     *   console.log(n);\n     * }).value();\n     * // => logs each value from right to left and returns the array\n     */\n    var forEachRight = createForEach(arrayEachRight, baseEachRight);\n\n    /**\n     * Creates an object composed of keys generated from the results of running\n     * each element of `collection` through `iteratee`. The corresponding value\n     * of each key is an array of the elements responsible for generating the key.\n     * The `iteratee` is bound to `thisArg` and invoked with three arguments:\n     * (value, index|key, collection).\n     *\n     * If a property name is provided for `iteratee` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `iteratee` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [iteratee=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Object} Returns the composed aggregate object.\n     * @example\n     *\n     * _.groupBy([4.2, 6.1, 6.4], function(n) {\n     *   return Math.floor(n);\n     * });\n     * // => { '4': [4.2], '6': [6.1, 6.4] }\n     *\n     * _.groupBy([4.2, 6.1, 6.4], function(n) {\n     *   return this.floor(n);\n     * }, Math);\n     * // => { '4': [4.2], '6': [6.1, 6.4] }\n     *\n     * // using the `_.property` callback shorthand\n     * _.groupBy(['one', 'two', 'three'], 'length');\n     * // => { '3': ['one', 'two'], '5': ['three'] }\n     */\n    var groupBy = createAggregator(function(result, value, key) {\n      if (hasOwnProperty.call(result, key)) {\n        result[key].push(value);\n      } else {\n        result[key] = [value];\n      }\n    });\n\n    /**\n     * Checks if `value` is in `collection` using `SameValueZero` for equality\n     * comparisons. If `fromIndex` is negative, it is used as the offset from\n     * the end of `collection`.\n     *\n     * **Note:** [`SameValueZero`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero)\n     * comparisons are like strict equality comparisons, e.g. `===`, except that\n     * `NaN` matches `NaN`.\n     *\n     * @static\n     * @memberOf _\n     * @alias contains, include\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to search.\n     * @param {*} target The value to search for.\n     * @param {number} [fromIndex=0] The index to search from.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.\n     * @returns {boolean} Returns `true` if a matching element is found, else `false`.\n     * @example\n     *\n     * _.includes([1, 2, 3], 1);\n     * // => true\n     *\n     * _.includes([1, 2, 3], 1, 2);\n     * // => false\n     *\n     * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');\n     * // => true\n     *\n     * _.includes('pebbles', 'eb');\n     * // => true\n     */\n    function includes(collection, target, fromIndex, guard) {\n      var length = collection ? collection.length : 0;\n      if (!isLength(length)) {\n        collection = values(collection);\n        length = collection.length;\n      }\n      if (!length) {\n        return false;\n      }\n      if (typeof fromIndex != 'number' || (guard && isIterateeCall(target, fromIndex, guard))) {\n        fromIndex = 0;\n      } else {\n        fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);\n      }\n      return (typeof collection == 'string' || !isArray(collection) && isString(collection))\n        ? (fromIndex < length && collection.indexOf(target, fromIndex) > -1)\n        : (getIndexOf(collection, target, fromIndex) > -1);\n    }\n\n    /**\n     * Creates an object composed of keys generated from the results of running\n     * each element of `collection` through `iteratee`. The corresponding value\n     * of each key is the last element responsible for generating the key. The\n     * iteratee function is bound to `thisArg` and invoked with three arguments:\n     * (value, index|key, collection).\n     *\n     * If a property name is provided for `iteratee` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `iteratee` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [iteratee=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Object} Returns the composed aggregate object.\n     * @example\n     *\n     * var keyData = [\n     *   { 'dir': 'left', 'code': 97 },\n     *   { 'dir': 'right', 'code': 100 }\n     * ];\n     *\n     * _.indexBy(keyData, 'dir');\n     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }\n     *\n     * _.indexBy(keyData, function(object) {\n     *   return String.fromCharCode(object.code);\n     * });\n     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }\n     *\n     * _.indexBy(keyData, function(object) {\n     *   return this.fromCharCode(object.code);\n     * }, String);\n     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }\n     */\n    var indexBy = createAggregator(function(result, value, key) {\n      result[key] = value;\n    });\n\n    /**\n     * Invokes the method named by `methodName` on each element in `collection`,\n     * returning an array of the results of each invoked method. Any additional\n     * arguments are provided to each invoked method. If `methodName` is a function\n     * it is invoked for, and `this` bound to, each element in `collection`.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|string} methodName The name of the method to invoke or\n     *  the function invoked per iteration.\n     * @param {...*} [args] The arguments to invoke the method with.\n     * @returns {Array} Returns the array of results.\n     * @example\n     *\n     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');\n     * // => [[1, 5, 7], [1, 2, 3]]\n     *\n     * _.invoke([123, 456], String.prototype.split, '');\n     * // => [['1', '2', '3'], ['4', '5', '6']]\n     */\n    var invoke = restParam(function(collection, methodName, args) {\n      var index = -1,\n          isFunc = typeof methodName == 'function',\n          length = collection ? collection.length : 0,\n          result = isLength(length) ? Array(length) : [];\n\n      baseEach(collection, function(value) {\n        var func = isFunc ? methodName : (value != null && value[methodName]);\n        result[++index] = func ? func.apply(value, args) : undefined;\n      });\n      return result;\n    });\n\n    /**\n     * Creates an array of values by running each element in `collection` through\n     * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three\n     * arguments: (value, index|key, collection).\n     *\n     * If a property name is provided for `iteratee` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `iteratee` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * Many lodash methods are guarded to work as interatees for methods like\n     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.\n     *\n     * The guarded methods are:\n     * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`, `drop`,\n     * `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`, `parseInt`,\n     * `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`, `trimLeft`,\n     * `trimRight`, `trunc`, `random`, `range`, `sample`, `some`, `uniq`, and `words`\n     *\n     * @static\n     * @memberOf _\n     * @alias collect\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [iteratee=_.identity] The function invoked\n     *  per iteration.\n     *  create a `_.property` or `_.matches` style callback respectively.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Array} Returns the new mapped array.\n     * @example\n     *\n     * function timesThree(n) {\n     *   return n * 3;\n     * }\n     *\n     * _.map([1, 2], timesThree);\n     * // => [3, 6]\n     *\n     * _.map({ 'a': 1, 'b': 2 }, timesThree);\n     * // => [3, 6] (iteration order is not guaranteed)\n     *\n     * var users = [\n     *   { 'user': 'barney' },\n     *   { 'user': 'fred' }\n     * ];\n     *\n     * // using the `_.property` callback shorthand\n     * _.map(users, 'user');\n     * // => ['barney', 'fred']\n     */\n    function map(collection, iteratee, thisArg) {\n      var func = isArray(collection) ? arrayMap : baseMap;\n      iteratee = getCallback(iteratee, thisArg, 3);\n      return func(collection, iteratee);\n    }\n\n    /**\n     * Creates an array of elements split into two groups, the first of which\n     * contains elements `predicate` returns truthy for, while the second of which\n     * contains elements `predicate` returns falsey for. The predicate is bound\n     * to `thisArg` and invoked with three arguments: (value, index|key, collection).\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {Array} Returns the array of grouped elements.\n     * @example\n     *\n     * _.partition([1, 2, 3], function(n) {\n     *   return n % 2;\n     * });\n     * // => [[1, 3], [2]]\n     *\n     * _.partition([1.2, 2.3, 3.4], function(n) {\n     *   return this.floor(n) % 2;\n     * }, Math);\n     * // => [[1.2, 3.4], [2.3]]\n     *\n     * var users = [\n     *   { 'user': 'barney',  'age': 36, 'active': false },\n     *   { 'user': 'fred',    'age': 40, 'active': true },\n     *   { 'user': 'pebbles', 'age': 1,  'active': false }\n     * ];\n     *\n     * var mapper = function(array) {\n     *   return _.pluck(array, 'user');\n     * };\n     *\n     * // using the `_.matches` callback shorthand\n     * _.map(_.partition(users, { 'age': 1, 'active': false }), mapper);\n     * // => [['pebbles'], ['barney', 'fred']]\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.map(_.partition(users, 'active', false), mapper);\n     * // => [['barney', 'pebbles'], ['fred']]\n     *\n     * // using the `_.property` callback shorthand\n     * _.map(_.partition(users, 'active'), mapper);\n     * // => [['fred'], ['barney', 'pebbles']]\n     */\n    var partition = createAggregator(function(result, value, key) {\n      result[key ? 0 : 1].push(value);\n    }, function() { return [[], []]; });\n\n    /**\n     * Gets the value of `key` from all elements in `collection`.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {string} key The key of the property to pluck.\n     * @returns {Array} Returns the property values.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36 },\n     *   { 'user': 'fred',   'age': 40 }\n     * ];\n     *\n     * _.pluck(users, 'user');\n     * // => ['barney', 'fred']\n     *\n     * var userIndex = _.indexBy(users, 'user');\n     * _.pluck(userIndex, 'age');\n     * // => [36, 40] (iteration order is not guaranteed)\n     */\n    function pluck(collection, key) {\n      return map(collection, baseProperty(key));\n    }\n\n    /**\n     * Reduces `collection` to a value which is the accumulated result of running\n     * each element in `collection` through `iteratee`, where each successive\n     * invocation is supplied the return value of the previous. If `accumulator`\n     * is not provided the first element of `collection` is used as the initial\n     * value. The `iteratee` is bound to `thisArg` and invoked with four arguments:\n     * (accumulator, value, index|key, collection).\n     *\n     * Many lodash methods are guarded to work as interatees for methods like\n     * `_.reduce`, `_.reduceRight`, and `_.transform`.\n     *\n     * The guarded methods are:\n     * `assign`, `defaults`, `includes`, `merge`, `sortByAll`, and `sortByOrder`\n     *\n     * @static\n     * @memberOf _\n     * @alias foldl, inject\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} [iteratee=_.identity] The function invoked per iteration.\n     * @param {*} [accumulator] The initial value.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {*} Returns the accumulated value.\n     * @example\n     *\n     * _.reduce([1, 2], function(sum, n) {\n     *   return sum + n;\n     * });\n     * // => 3\n     *\n     * _.reduce({ 'a': 1, 'b': 2 }, function(result, n, key) {\n     *   result[key] = n * 3;\n     *   return result;\n     * }, {});\n     * // => { 'a': 3, 'b': 6 } (iteration order is not guaranteed)\n     */\n    var reduce = createReduce(arrayReduce, baseEach);\n\n    /**\n     * This method is like `_.reduce` except that it iterates over elements of\n     * `collection` from right to left.\n     *\n     * @static\n     * @memberOf _\n     * @alias foldr\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function} [iteratee=_.identity] The function invoked per iteration.\n     * @param {*} [accumulator] The initial value.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {*} Returns the accumulated value.\n     * @example\n     *\n     * var array = [[0, 1], [2, 3], [4, 5]];\n     *\n     * _.reduceRight(array, function(flattened, other) {\n     *   return flattened.concat(other);\n     * }, []);\n     * // => [4, 5, 2, 3, 0, 1]\n     */\n    var reduceRight =  createReduce(arrayReduceRight, baseEachRight);\n\n    /**\n     * The opposite of `_.filter`; this method returns the elements of `collection`\n     * that `predicate` does **not** return truthy for.\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {Array} Returns the new filtered array.\n     * @example\n     *\n     * _.reject([1, 2, 3, 4], function(n) {\n     *   return n % 2 == 0;\n     * });\n     * // => [1, 3]\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36, 'active': false },\n     *   { 'user': 'fred',   'age': 40, 'active': true }\n     * ];\n     *\n     * // using the `_.matches` callback shorthand\n     * _.pluck(_.reject(users, { 'age': 40, 'active': true }), 'user');\n     * // => ['barney']\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.pluck(_.reject(users, 'active', false), 'user');\n     * // => ['fred']\n     *\n     * // using the `_.property` callback shorthand\n     * _.pluck(_.reject(users, 'active'), 'user');\n     * // => ['barney']\n     */\n    function reject(collection, predicate, thisArg) {\n      var func = isArray(collection) ? arrayFilter : baseFilter;\n      predicate = getCallback(predicate, thisArg, 3);\n      return func(collection, function(value, index, collection) {\n        return !predicate(value, index, collection);\n      });\n    }\n\n    /**\n     * Gets a random element or `n` random elements from a collection.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to sample.\n     * @param {number} [n] The number of elements to sample.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {*} Returns the random sample(s).\n     * @example\n     *\n     * _.sample([1, 2, 3, 4]);\n     * // => 2\n     *\n     * _.sample([1, 2, 3, 4], 2);\n     * // => [3, 1]\n     */\n    function sample(collection, n, guard) {\n      if (guard ? isIterateeCall(collection, n, guard) : n == null) {\n        collection = toIterable(collection);\n        var length = collection.length;\n        return length > 0 ? collection[baseRandom(0, length - 1)] : undefined;\n      }\n      var result = shuffle(collection);\n      result.length = nativeMin(n < 0 ? 0 : (+n || 0), result.length);\n      return result;\n    }\n\n    /**\n     * Creates an array of shuffled values, using a version of the\n     * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to shuffle.\n     * @returns {Array} Returns the new shuffled array.\n     * @example\n     *\n     * _.shuffle([1, 2, 3, 4]);\n     * // => [4, 1, 3, 2]\n     */\n    function shuffle(collection) {\n      collection = toIterable(collection);\n\n      var index = -1,\n          length = collection.length,\n          result = Array(length);\n\n      while (++index < length) {\n        var rand = baseRandom(0, index);\n        if (index != rand) {\n          result[index] = result[rand];\n        }\n        result[rand] = collection[index];\n      }\n      return result;\n    }\n\n    /**\n     * Gets the size of `collection` by returning its length for array-like\n     * values or the number of own enumerable properties for objects.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to inspect.\n     * @returns {number} Returns the size of `collection`.\n     * @example\n     *\n     * _.size([1, 2, 3]);\n     * // => 3\n     *\n     * _.size({ 'a': 1, 'b': 2 });\n     * // => 2\n     *\n     * _.size('pebbles');\n     * // => 7\n     */\n    function size(collection) {\n      var length = collection ? collection.length : 0;\n      return isLength(length) ? length : keys(collection).length;\n    }\n\n    /**\n     * Checks if `predicate` returns truthy for **any** element of `collection`.\n     * The function returns as soon as it finds a passing value and does not iterate\n     * over the entire collection. The predicate is bound to `thisArg` and invoked\n     * with three arguments: (value, index|key, collection).\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @alias any\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {boolean} Returns `true` if any element passes the predicate check,\n     *  else `false`.\n     * @example\n     *\n     * _.some([null, 0, 'yes', false], Boolean);\n     * // => true\n     *\n     * var users = [\n     *   { 'user': 'barney', 'active': true },\n     *   { 'user': 'fred',   'active': false }\n     * ];\n     *\n     * // using the `_.matches` callback shorthand\n     * _.some(users, { 'user': 'barney', 'active': false });\n     * // => false\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.some(users, 'active', false);\n     * // => true\n     *\n     * // using the `_.property` callback shorthand\n     * _.some(users, 'active');\n     * // => true\n     */\n    function some(collection, predicate, thisArg) {\n      var func = isArray(collection) ? arraySome : baseSome;\n      if (thisArg && isIterateeCall(collection, predicate, thisArg)) {\n        predicate = null;\n      }\n      if (typeof predicate != 'function' || typeof thisArg != 'undefined') {\n        predicate = getCallback(predicate, thisArg, 3);\n      }\n      return func(collection, predicate);\n    }\n\n    /**\n     * Creates an array of elements, sorted in ascending order by the results of\n     * running each element in a collection through `iteratee`. This method performs\n     * a stable sort, that is, it preserves the original sort order of equal elements.\n     * The `iteratee` is bound to `thisArg` and invoked with three arguments:\n     * (value, index|key, collection).\n     *\n     * If a property name is provided for `iteratee` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `iteratee` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Array|Function|Object|string} [iteratee=_.identity] The function\n     *  invoked per iteration. If a property name or an object is provided it is\n     *  used to create a `_.property` or `_.matches` style callback respectively.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Array} Returns the new sorted array.\n     * @example\n     *\n     * _.sortBy([1, 2, 3], function(n) {\n     *   return Math.sin(n);\n     * });\n     * // => [3, 1, 2]\n     *\n     * _.sortBy([1, 2, 3], function(n) {\n     *   return this.sin(n);\n     * }, Math);\n     * // => [3, 1, 2]\n     *\n     * var users = [\n     *   { 'user': 'fred' },\n     *   { 'user': 'pebbles' },\n     *   { 'user': 'barney' }\n     * ];\n     *\n     * // using the `_.property` callback shorthand\n     * _.pluck(_.sortBy(users, 'user'), 'user');\n     * // => ['barney', 'fred', 'pebbles']\n     */\n    function sortBy(collection, iteratee, thisArg) {\n      if (collection == null) {\n        return [];\n      }\n      var index = -1,\n          length = collection.length,\n          result = isLength(length) ? Array(length) : [];\n\n      if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {\n        iteratee = null;\n      }\n      iteratee = getCallback(iteratee, thisArg, 3);\n      baseEach(collection, function(value, key, collection) {\n        result[++index] = { 'criteria': iteratee(value, key, collection), 'index': index, 'value': value };\n      });\n      return baseSortBy(result, compareAscending);\n    }\n\n    /**\n     * This method is like `_.sortBy` except that it sorts by property names\n     * instead of an iteratee function.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {...(string|string[])} props The property names to sort by,\n     *  specified as individual property names or arrays of property names.\n     * @returns {Array} Returns the new sorted array.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36 },\n     *   { 'user': 'fred',   'age': 40 },\n     *   { 'user': 'barney', 'age': 26 },\n     *   { 'user': 'fred',   'age': 30 }\n     * ];\n     *\n     * _.map(_.sortByAll(users, ['user', 'age']), _.values);\n     * // => [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]\n     */\n    function sortByAll() {\n      var args = arguments,\n          collection = args[0],\n          guard = args[3],\n          index = 0,\n          length = args.length - 1;\n\n      if (collection == null) {\n        return [];\n      }\n      var props = Array(length);\n      while (index < length) {\n        props[index] = args[++index];\n      }\n      if (guard && isIterateeCall(args[1], args[2], guard)) {\n        props = args[1];\n      }\n      return baseSortByOrder(collection, baseFlatten(props), []);\n    }\n\n    /**\n     * This method is like `_.sortByAll` except that it allows specifying the\n     * sort orders of the property names to sort by. A truthy value in `orders`\n     * will sort the corresponding property name in ascending order while a\n     * falsey value will sort it in descending order.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {string[]} props The property names to sort by.\n     * @param {boolean[]} orders The sort orders of `props`.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.\n     * @returns {Array} Returns the new sorted array.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 26 },\n     *   { 'user': 'fred',   'age': 40 },\n     *   { 'user': 'barney', 'age': 36 },\n     *   { 'user': 'fred',   'age': 30 }\n     * ];\n     *\n     * // sort by `user` in ascending order and by `age` in descending order\n     * _.map(_.sortByOrder(users, ['user', 'age'], [true, false]), _.values);\n     * // => [['barney', 36], ['barney', 26], ['fred', 40], ['fred', 30]]\n     */\n    function sortByOrder(collection, props, orders, guard) {\n      if (collection == null) {\n        return [];\n      }\n      if (guard && isIterateeCall(props, orders, guard)) {\n        orders = null;\n      }\n      if (!isArray(props)) {\n        props = props == null ? [] : [props];\n      }\n      if (!isArray(orders)) {\n        orders = orders == null ? [] : [orders];\n      }\n      return baseSortByOrder(collection, props, orders);\n    }\n\n    /**\n     * Performs a deep comparison between each element in `collection` and the\n     * source object, returning an array of all elements that have equivalent\n     * property values.\n     *\n     * **Note:** This method supports comparing arrays, booleans, `Date` objects,\n     * numbers, `Object` objects, regexes, and strings. Objects are compared by\n     * their own, not inherited, enumerable properties. For comparing a single\n     * own or inherited property value see `_.matchesProperty`.\n     *\n     * @static\n     * @memberOf _\n     * @category Collection\n     * @param {Array|Object|string} collection The collection to search.\n     * @param {Object} source The object of property values to match.\n     * @returns {Array} Returns the new filtered array.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36, 'active': false, 'pets': ['hoppy'] },\n     *   { 'user': 'fred',   'age': 40, 'active': true, 'pets': ['baby puss', 'dino'] }\n     * ];\n     *\n     * _.pluck(_.where(users, { 'age': 36, 'active': false }), 'user');\n     * // => ['barney']\n     *\n     * _.pluck(_.where(users, { 'pets': ['dino'] }), 'user');\n     * // => ['fred']\n     */\n    function where(collection, source) {\n      return filter(collection, baseMatches(source));\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Gets the number of milliseconds that have elapsed since the Unix epoch\n     * (1 January 1970 00:00:00 UTC).\n     *\n     * @static\n     * @memberOf _\n     * @category Date\n     * @example\n     *\n     * _.defer(function(stamp) {\n     *   console.log(_.now() - stamp);\n     * }, _.now());\n     * // => logs the number of milliseconds it took for the deferred function to be invoked\n     */\n    var now = nativeNow || function() {\n      return new Date().getTime();\n    };\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * The opposite of `_.before`; this method creates a function that invokes\n     * `func` once it is called `n` or more times.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {number} n The number of calls before `func` is invoked.\n     * @param {Function} func The function to restrict.\n     * @returns {Function} Returns the new restricted function.\n     * @example\n     *\n     * var saves = ['profile', 'settings'];\n     *\n     * var done = _.after(saves.length, function() {\n     *   console.log('done saving!');\n     * });\n     *\n     * _.forEach(saves, function(type) {\n     *   asyncSave({ 'type': type, 'complete': done });\n     * });\n     * // => logs 'done saving!' after the two async saves have completed\n     */\n    function after(n, func) {\n      if (typeof func != 'function') {\n        if (typeof n == 'function') {\n          var temp = n;\n          n = func;\n          func = temp;\n        } else {\n          throw new TypeError(FUNC_ERROR_TEXT);\n        }\n      }\n      n = nativeIsFinite(n = +n) ? n : 0;\n      return function() {\n        if (--n < 1) {\n          return func.apply(this, arguments);\n        }\n      };\n    }\n\n    /**\n     * Creates a function that accepts up to `n` arguments ignoring any\n     * additional arguments.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to cap arguments for.\n     * @param {number} [n=func.length] The arity cap.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * _.map(['6', '8', '10'], _.ary(parseInt, 1));\n     * // => [6, 8, 10]\n     */\n    function ary(func, n, guard) {\n      if (guard && isIterateeCall(func, n, guard)) {\n        n = null;\n      }\n      n = (func && n == null) ? func.length : nativeMax(+n || 0, 0);\n      return createWrapper(func, ARY_FLAG, null, null, null, null, n);\n    }\n\n    /**\n     * Creates a function that invokes `func`, with the `this` binding and arguments\n     * of the created function, while it is called less than `n` times. Subsequent\n     * calls to the created function return the result of the last `func` invocation.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {number} n The number of calls at which `func` is no longer invoked.\n     * @param {Function} func The function to restrict.\n     * @returns {Function} Returns the new restricted function.\n     * @example\n     *\n     * jQuery('#add').on('click', _.before(5, addContactToList));\n     * // => allows adding up to 4 contacts to the list\n     */\n    function before(n, func) {\n      var result;\n      if (typeof func != 'function') {\n        if (typeof n == 'function') {\n          var temp = n;\n          n = func;\n          func = temp;\n        } else {\n          throw new TypeError(FUNC_ERROR_TEXT);\n        }\n      }\n      return function() {\n        if (--n > 0) {\n          result = func.apply(this, arguments);\n        } else {\n          func = null;\n        }\n        return result;\n      };\n    }\n\n    /**\n     * Creates a function that invokes `func` with the `this` binding of `thisArg`\n     * and prepends any additional `_.bind` arguments to those provided to the\n     * bound function.\n     *\n     * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,\n     * may be used as a placeholder for partially applied arguments.\n     *\n     * **Note:** Unlike native `Function#bind` this method does not set the `length`\n     * property of bound functions.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to bind.\n     * @param {*} thisArg The `this` binding of `func`.\n     * @param {...*} [partials] The arguments to be partially applied.\n     * @returns {Function} Returns the new bound function.\n     * @example\n     *\n     * var greet = function(greeting, punctuation) {\n     *   return greeting + ' ' + this.user + punctuation;\n     * };\n     *\n     * var object = { 'user': 'fred' };\n     *\n     * var bound = _.bind(greet, object, 'hi');\n     * bound('!');\n     * // => 'hi fred!'\n     *\n     * // using placeholders\n     * var bound = _.bind(greet, object, _, '!');\n     * bound('hi');\n     * // => 'hi fred!'\n     */\n    var bind = restParam(function(func, thisArg, partials) {\n      var bitmask = BIND_FLAG;\n      if (partials.length) {\n        var holders = replaceHolders(partials, bind.placeholder);\n        bitmask |= PARTIAL_FLAG;\n      }\n      return createWrapper(func, bitmask, thisArg, partials, holders);\n    });\n\n    /**\n     * Binds methods of an object to the object itself, overwriting the existing\n     * method. Method names may be specified as individual arguments or as arrays\n     * of method names. If no method names are provided all enumerable function\n     * properties, own and inherited, of `object` are bound.\n     *\n     * **Note:** This method does not set the `length` property of bound functions.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Object} object The object to bind and assign the bound methods to.\n     * @param {...(string|string[])} [methodNames] The object method names to bind,\n     *  specified as individual method names or arrays of method names.\n     * @returns {Object} Returns `object`.\n     * @example\n     *\n     * var view = {\n     *   'label': 'docs',\n     *   'onClick': function() {\n     *     console.log('clicked ' + this.label);\n     *   }\n     * };\n     *\n     * _.bindAll(view);\n     * jQuery('#docs').on('click', view.onClick);\n     * // => logs 'clicked docs' when the element is clicked\n     */\n    var bindAll = restParam(function(object, methodNames) {\n      methodNames = methodNames.length ? baseFlatten(methodNames) : functions(object);\n\n      var index = -1,\n          length = methodNames.length;\n\n      while (++index < length) {\n        var key = methodNames[index];\n        object[key] = createWrapper(object[key], BIND_FLAG, object);\n      }\n      return object;\n    });\n\n    /**\n     * Creates a function that invokes the method at `object[key]` and prepends\n     * any additional `_.bindKey` arguments to those provided to the bound function.\n     *\n     * This method differs from `_.bind` by allowing bound functions to reference\n     * methods that may be redefined or don't yet exist.\n     * See [Peter Michaux's article](http://michaux.ca/articles/lazy-function-definition-pattern)\n     * for more details.\n     *\n     * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic\n     * builds, may be used as a placeholder for partially applied arguments.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Object} object The object the method belongs to.\n     * @param {string} key The key of the method.\n     * @param {...*} [partials] The arguments to be partially applied.\n     * @returns {Function} Returns the new bound function.\n     * @example\n     *\n     * var object = {\n     *   'user': 'fred',\n     *   'greet': function(greeting, punctuation) {\n     *     return greeting + ' ' + this.user + punctuation;\n     *   }\n     * };\n     *\n     * var bound = _.bindKey(object, 'greet', 'hi');\n     * bound('!');\n     * // => 'hi fred!'\n     *\n     * object.greet = function(greeting, punctuation) {\n     *   return greeting + 'ya ' + this.user + punctuation;\n     * };\n     *\n     * bound('!');\n     * // => 'hiya fred!'\n     *\n     * // using placeholders\n     * var bound = _.bindKey(object, 'greet', _, '!');\n     * bound('hi');\n     * // => 'hiya fred!'\n     */\n    var bindKey = restParam(function(object, key, partials) {\n      var bitmask = BIND_FLAG | BIND_KEY_FLAG;\n      if (partials.length) {\n        var holders = replaceHolders(partials, bindKey.placeholder);\n        bitmask |= PARTIAL_FLAG;\n      }\n      return createWrapper(key, bitmask, object, partials, holders);\n    });\n\n    /**\n     * Creates a function that accepts one or more arguments of `func` that when\n     * called either invokes `func` returning its result, if all `func` arguments\n     * have been provided, or returns a function that accepts one or more of the\n     * remaining `func` arguments, and so on. The arity of `func` may be specified\n     * if `func.length` is not sufficient.\n     *\n     * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,\n     * may be used as a placeholder for provided arguments.\n     *\n     * **Note:** This method does not set the `length` property of curried functions.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to curry.\n     * @param {number} [arity=func.length] The arity of `func`.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Function} Returns the new curried function.\n     * @example\n     *\n     * var abc = function(a, b, c) {\n     *   return [a, b, c];\n     * };\n     *\n     * var curried = _.curry(abc);\n     *\n     * curried(1)(2)(3);\n     * // => [1, 2, 3]\n     *\n     * curried(1, 2)(3);\n     * // => [1, 2, 3]\n     *\n     * curried(1, 2, 3);\n     * // => [1, 2, 3]\n     *\n     * // using placeholders\n     * curried(1)(_, 3)(2);\n     * // => [1, 2, 3]\n     */\n    var curry = createCurry(CURRY_FLAG);\n\n    /**\n     * This method is like `_.curry` except that arguments are applied to `func`\n     * in the manner of `_.partialRight` instead of `_.partial`.\n     *\n     * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic\n     * builds, may be used as a placeholder for provided arguments.\n     *\n     * **Note:** This method does not set the `length` property of curried functions.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to curry.\n     * @param {number} [arity=func.length] The arity of `func`.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Function} Returns the new curried function.\n     * @example\n     *\n     * var abc = function(a, b, c) {\n     *   return [a, b, c];\n     * };\n     *\n     * var curried = _.curryRight(abc);\n     *\n     * curried(3)(2)(1);\n     * // => [1, 2, 3]\n     *\n     * curried(2, 3)(1);\n     * // => [1, 2, 3]\n     *\n     * curried(1, 2, 3);\n     * // => [1, 2, 3]\n     *\n     * // using placeholders\n     * curried(3)(1, _)(2);\n     * // => [1, 2, 3]\n     */\n    var curryRight = createCurry(CURRY_RIGHT_FLAG);\n\n    /**\n     * Creates a function that delays invoking `func` until after `wait` milliseconds\n     * have elapsed since the last time it was invoked. The created function comes\n     * with a `cancel` method to cancel delayed invocations. Provide an options\n     * object to indicate that `func` should be invoked on the leading and/or\n     * trailing edge of the `wait` timeout. Subsequent calls to the debounced\n     * function return the result of the last `func` invocation.\n     *\n     * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked\n     * on the trailing edge of the timeout only if the the debounced function is\n     * invoked more than once during the `wait` timeout.\n     *\n     * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)\n     * for details over the differences between `_.debounce` and `_.throttle`.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to debounce.\n     * @param {number} [wait=0] The number of milliseconds to delay.\n     * @param {Object} [options] The options object.\n     * @param {boolean} [options.leading=false] Specify invoking on the leading\n     *  edge of the timeout.\n     * @param {number} [options.maxWait] The maximum time `func` is allowed to be\n     *  delayed before it is invoked.\n     * @param {boolean} [options.trailing=true] Specify invoking on the trailing\n     *  edge of the timeout.\n     * @returns {Function} Returns the new debounced function.\n     * @example\n     *\n     * // avoid costly calculations while the window size is in flux\n     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));\n     *\n     * // invoke `sendMail` when the click event is fired, debouncing subsequent calls\n     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {\n     *   'leading': true,\n     *   'trailing': false\n     * }));\n     *\n     * // ensure `batchLog` is invoked once after 1 second of debounced calls\n     * var source = new EventSource('/stream');\n     * jQuery(source).on('message', _.debounce(batchLog, 250, {\n     *   'maxWait': 1000\n     * }));\n     *\n     * // cancel a debounced call\n     * var todoChanges = _.debounce(batchLog, 1000);\n     * Object.observe(models.todo, todoChanges);\n     *\n     * Object.observe(models, function(changes) {\n     *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {\n     *     todoChanges.cancel();\n     *   }\n     * }, ['delete']);\n     *\n     * // ...at some point `models.todo` is changed\n     * models.todo.completed = true;\n     *\n     * // ...before 1 second has passed `models.todo` is deleted\n     * // which cancels the debounced `todoChanges` call\n     * delete models.todo;\n     */\n    function debounce(func, wait, options) {\n      var args,\n          maxTimeoutId,\n          result,\n          stamp,\n          thisArg,\n          timeoutId,\n          trailingCall,\n          lastCalled = 0,\n          maxWait = false,\n          trailing = true;\n\n      if (typeof func != 'function') {\n        throw new TypeError(FUNC_ERROR_TEXT);\n      }\n      wait = wait < 0 ? 0 : (+wait || 0);\n      if (options === true) {\n        var leading = true;\n        trailing = false;\n      } else if (isObject(options)) {\n        leading = options.leading;\n        maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);\n        trailing = 'trailing' in options ? options.trailing : trailing;\n      }\n\n      function cancel() {\n        if (timeoutId) {\n          clearTimeout(timeoutId);\n        }\n        if (maxTimeoutId) {\n          clearTimeout(maxTimeoutId);\n        }\n        maxTimeoutId = timeoutId = trailingCall = undefined;\n      }\n\n      function delayed() {\n        var remaining = wait - (now() - stamp);\n        if (remaining <= 0 || remaining > wait) {\n          if (maxTimeoutId) {\n            clearTimeout(maxTimeoutId);\n          }\n          var isCalled = trailingCall;\n          maxTimeoutId = timeoutId = trailingCall = undefined;\n          if (isCalled) {\n            lastCalled = now();\n            result = func.apply(thisArg, args);\n            if (!timeoutId && !maxTimeoutId) {\n              args = thisArg = null;\n            }\n          }\n        } else {\n          timeoutId = setTimeout(delayed, remaining);\n        }\n      }\n\n      function maxDelayed() {\n        if (timeoutId) {\n          clearTimeout(timeoutId);\n        }\n        maxTimeoutId = timeoutId = trailingCall = undefined;\n        if (trailing || (maxWait !== wait)) {\n          lastCalled = now();\n          result = func.apply(thisArg, args);\n          if (!timeoutId && !maxTimeoutId) {\n            args = thisArg = null;\n          }\n        }\n      }\n\n      function debounced() {\n        args = arguments;\n        stamp = now();\n        thisArg = this;\n        trailingCall = trailing && (timeoutId || !leading);\n\n        if (maxWait === false) {\n          var leadingCall = leading && !timeoutId;\n        } else {\n          if (!maxTimeoutId && !leading) {\n            lastCalled = stamp;\n          }\n          var remaining = maxWait - (stamp - lastCalled),\n              isCalled = remaining <= 0 || remaining > maxWait;\n\n          if (isCalled) {\n            if (maxTimeoutId) {\n              maxTimeoutId = clearTimeout(maxTimeoutId);\n            }\n            lastCalled = stamp;\n            result = func.apply(thisArg, args);\n          }\n          else if (!maxTimeoutId) {\n            maxTimeoutId = setTimeout(maxDelayed, remaining);\n          }\n        }\n        if (isCalled && timeoutId) {\n          timeoutId = clearTimeout(timeoutId);\n        }\n        else if (!timeoutId && wait !== maxWait) {\n          timeoutId = setTimeout(delayed, wait);\n        }\n        if (leadingCall) {\n          isCalled = true;\n          result = func.apply(thisArg, args);\n        }\n        if (isCalled && !timeoutId && !maxTimeoutId) {\n          args = thisArg = null;\n        }\n        return result;\n      }\n      debounced.cancel = cancel;\n      return debounced;\n    }\n\n    /**\n     * Defers invoking the `func` until the current call stack has cleared. Any\n     * additional arguments are provided to `func` when it is invoked.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to defer.\n     * @param {...*} [args] The arguments to invoke the function with.\n     * @returns {number} Returns the timer id.\n     * @example\n     *\n     * _.defer(function(text) {\n     *   console.log(text);\n     * }, 'deferred');\n     * // logs 'deferred' after one or more milliseconds\n     */\n    var defer = restParam(function(func, args) {\n      return baseDelay(func, 1, args);\n    });\n\n    /**\n     * Invokes `func` after `wait` milliseconds. Any additional arguments are\n     * provided to `func` when it is invoked.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to delay.\n     * @param {number} wait The number of milliseconds to delay invocation.\n     * @param {...*} [args] The arguments to invoke the function with.\n     * @returns {number} Returns the timer id.\n     * @example\n     *\n     * _.delay(function(text) {\n     *   console.log(text);\n     * }, 1000, 'later');\n     * // => logs 'later' after one second\n     */\n    var delay = restParam(function(func, wait, args) {\n      return baseDelay(func, wait, args);\n    });\n\n    /**\n     * Creates a function that returns the result of invoking the provided\n     * functions with the `this` binding of the created function, where each\n     * successive invocation is supplied the return value of the previous.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {...Function} [funcs] Functions to invoke.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * function square(n) {\n     *   return n * n;\n     * }\n     *\n     * var addSquare = _.flow(_.add, square);\n     * addSquare(1, 2);\n     * // => 9\n     */\n    var flow = createFlow();\n\n    /**\n     * This method is like `_.flow` except that it creates a function that\n     * invokes the provided functions from right to left.\n     *\n     * @static\n     * @memberOf _\n     * @alias backflow, compose\n     * @category Function\n     * @param {...Function} [funcs] Functions to invoke.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * function square(n) {\n     *   return n * n;\n     * }\n     *\n     * var addSquare = _.flowRight(square, _.add);\n     * addSquare(1, 2);\n     * // => 9\n     */\n    var flowRight = createFlow(true);\n\n    /**\n     * Creates a function that memoizes the result of `func`. If `resolver` is\n     * provided it determines the cache key for storing the result based on the\n     * arguments provided to the memoized function. By default, the first argument\n     * provided to the memoized function is coerced to a string and used as the\n     * cache key. The `func` is invoked with the `this` binding of the memoized\n     * function.\n     *\n     * **Note:** The cache is exposed as the `cache` property on the memoized\n     * function. Its creation may be customized by replacing the `_.memoize.Cache`\n     * constructor with one whose instances implement the [`Map`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-properties-of-the-map-prototype-object)\n     * method interface of `get`, `has`, and `set`.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to have its output memoized.\n     * @param {Function} [resolver] The function to resolve the cache key.\n     * @returns {Function} Returns the new memoizing function.\n     * @example\n     *\n     * var upperCase = _.memoize(function(string) {\n     *   return string.toUpperCase();\n     * });\n     *\n     * upperCase('fred');\n     * // => 'FRED'\n     *\n     * // modifying the result cache\n     * upperCase.cache.set('fred', 'BARNEY');\n     * upperCase('fred');\n     * // => 'BARNEY'\n     *\n     * // replacing `_.memoize.Cache`\n     * var object = { 'user': 'fred' };\n     * var other = { 'user': 'barney' };\n     * var identity = _.memoize(_.identity);\n     *\n     * identity(object);\n     * // => { 'user': 'fred' }\n     * identity(other);\n     * // => { 'user': 'fred' }\n     *\n     * _.memoize.Cache = WeakMap;\n     * var identity = _.memoize(_.identity);\n     *\n     * identity(object);\n     * // => { 'user': 'fred' }\n     * identity(other);\n     * // => { 'user': 'barney' }\n     */\n    function memoize(func, resolver) {\n      if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {\n        throw new TypeError(FUNC_ERROR_TEXT);\n      }\n      var memoized = function() {\n        var args = arguments,\n            cache = memoized.cache,\n            key = resolver ? resolver.apply(this, args) : args[0];\n\n        if (cache.has(key)) {\n          return cache.get(key);\n        }\n        var result = func.apply(this, args);\n        cache.set(key, result);\n        return result;\n      };\n      memoized.cache = new memoize.Cache;\n      return memoized;\n    }\n\n    /**\n     * Creates a function that negates the result of the predicate `func`. The\n     * `func` predicate is invoked with the `this` binding and arguments of the\n     * created function.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} predicate The predicate to negate.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * function isEven(n) {\n     *   return n % 2 == 0;\n     * }\n     *\n     * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));\n     * // => [1, 3, 5]\n     */\n    function negate(predicate) {\n      if (typeof predicate != 'function') {\n        throw new TypeError(FUNC_ERROR_TEXT);\n      }\n      return function() {\n        return !predicate.apply(this, arguments);\n      };\n    }\n\n    /**\n     * Creates a function that is restricted to invoking `func` once. Repeat calls\n     * to the function return the value of the first call. The `func` is invoked\n     * with the `this` binding and arguments of the created function.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to restrict.\n     * @returns {Function} Returns the new restricted function.\n     * @example\n     *\n     * var initialize = _.once(createApplication);\n     * initialize();\n     * initialize();\n     * // `initialize` invokes `createApplication` once\n     */\n    function once(func) {\n      return before(func, 2);\n    }\n\n    /**\n     * Creates a function that invokes `func` with `partial` arguments prepended\n     * to those provided to the new function. This method is like `_.bind` except\n     * it does **not** alter the `this` binding.\n     *\n     * The `_.partial.placeholder` value, which defaults to `_` in monolithic\n     * builds, may be used as a placeholder for partially applied arguments.\n     *\n     * **Note:** This method does not set the `length` property of partially\n     * applied functions.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to partially apply arguments to.\n     * @param {...*} [partials] The arguments to be partially applied.\n     * @returns {Function} Returns the new partially applied function.\n     * @example\n     *\n     * var greet = function(greeting, name) {\n     *   return greeting + ' ' + name;\n     * };\n     *\n     * var sayHelloTo = _.partial(greet, 'hello');\n     * sayHelloTo('fred');\n     * // => 'hello fred'\n     *\n     * // using placeholders\n     * var greetFred = _.partial(greet, _, 'fred');\n     * greetFred('hi');\n     * // => 'hi fred'\n     */\n    var partial = createPartial(PARTIAL_FLAG);\n\n    /**\n     * This method is like `_.partial` except that partially applied arguments\n     * are appended to those provided to the new function.\n     *\n     * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic\n     * builds, may be used as a placeholder for partially applied arguments.\n     *\n     * **Note:** This method does not set the `length` property of partially\n     * applied functions.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to partially apply arguments to.\n     * @param {...*} [partials] The arguments to be partially applied.\n     * @returns {Function} Returns the new partially applied function.\n     * @example\n     *\n     * var greet = function(greeting, name) {\n     *   return greeting + ' ' + name;\n     * };\n     *\n     * var greetFred = _.partialRight(greet, 'fred');\n     * greetFred('hi');\n     * // => 'hi fred'\n     *\n     * // using placeholders\n     * var sayHelloTo = _.partialRight(greet, 'hello', _);\n     * sayHelloTo('fred');\n     * // => 'hello fred'\n     */\n    var partialRight = createPartial(PARTIAL_RIGHT_FLAG);\n\n    /**\n     * Creates a function that invokes `func` with arguments arranged according\n     * to the specified indexes where the argument value at the first index is\n     * provided as the first argument, the argument value at the second index is\n     * provided as the second argument, and so on.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to rearrange arguments for.\n     * @param {...(number|number[])} indexes The arranged argument indexes,\n     *  specified as individual indexes or arrays of indexes.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * var rearged = _.rearg(function(a, b, c) {\n     *   return [a, b, c];\n     * }, 2, 0, 1);\n     *\n     * rearged('b', 'c', 'a')\n     * // => ['a', 'b', 'c']\n     *\n     * var map = _.rearg(_.map, [1, 0]);\n     * map(function(n) {\n     *   return n * 3;\n     * }, [1, 2, 3]);\n     * // => [3, 6, 9]\n     */\n    var rearg = restParam(function(func, indexes) {\n      return createWrapper(func, REARG_FLAG, null, null, null, baseFlatten(indexes));\n    });\n\n    /**\n     * Creates a function that invokes `func` with the `this` binding of the\n     * created function and arguments from `start` and beyond provided as an array.\n     *\n     * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to apply a rest parameter to.\n     * @param {number} [start=func.length-1] The start position of the rest parameter.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * var say = _.restParam(function(what, names) {\n     *   return what + ' ' + _.initial(names).join(', ') +\n     *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);\n     * });\n     *\n     * say('hello', 'fred', 'barney', 'pebbles');\n     * // => 'hello fred, barney, & pebbles'\n     */\n    function restParam(func, start) {\n      if (typeof func != 'function') {\n        throw new TypeError(FUNC_ERROR_TEXT);\n      }\n      start = nativeMax(typeof start == 'undefined' ? (func.length - 1) : (+start || 0), 0);\n      return function() {\n        var args = arguments,\n            index = -1,\n            length = nativeMax(args.length - start, 0),\n            rest = Array(length);\n\n        while (++index < length) {\n          rest[index] = args[start + index];\n        }\n        switch (start) {\n          case 0: return func.call(this, rest);\n          case 1: return func.call(this, args[0], rest);\n          case 2: return func.call(this, args[0], args[1], rest);\n        }\n        var otherArgs = Array(start + 1);\n        index = -1;\n        while (++index < start) {\n          otherArgs[index] = args[index];\n        }\n        otherArgs[start] = rest;\n        return func.apply(this, otherArgs);\n      };\n    }\n\n    /**\n     * Creates a function that invokes `func` with the `this` binding of the created\n     * function and an array of arguments much like [`Function#apply`](https://es5.github.io/#x15.3.4.3).\n     *\n     * **Note:** This method is based on the [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator).\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to spread arguments over.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * var say = _.spread(function(who, what) {\n     *   return who + ' says ' + what;\n     * });\n     *\n     * say(['fred', 'hello']);\n     * // => 'fred says hello'\n     *\n     * // with a Promise\n     * var numbers = Promise.all([\n     *   Promise.resolve(40),\n     *   Promise.resolve(36)\n     * ]);\n     *\n     * numbers.then(_.spread(function(x, y) {\n     *   return x + y;\n     * }));\n     * // => a Promise of 76\n     */\n    function spread(func) {\n      if (typeof func != 'function') {\n        throw new TypeError(FUNC_ERROR_TEXT);\n      }\n      return function(array) {\n        return func.apply(this, array);\n      };\n    }\n\n    /**\n     * Creates a function that only invokes `func` at most once per every `wait`\n     * milliseconds. The created function comes with a `cancel` method to cancel\n     * delayed invocations. Provide an options object to indicate that `func`\n     * should be invoked on the leading and/or trailing edge of the `wait` timeout.\n     * Subsequent calls to the throttled function return the result of the last\n     * `func` call.\n     *\n     * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked\n     * on the trailing edge of the timeout only if the the throttled function is\n     * invoked more than once during the `wait` timeout.\n     *\n     * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)\n     * for details over the differences between `_.throttle` and `_.debounce`.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {Function} func The function to throttle.\n     * @param {number} [wait=0] The number of milliseconds to throttle invocations to.\n     * @param {Object} [options] The options object.\n     * @param {boolean} [options.leading=true] Specify invoking on the leading\n     *  edge of the timeout.\n     * @param {boolean} [options.trailing=true] Specify invoking on the trailing\n     *  edge of the timeout.\n     * @returns {Function} Returns the new throttled function.\n     * @example\n     *\n     * // avoid excessively updating the position while scrolling\n     * jQuery(window).on('scroll', _.throttle(updatePosition, 100));\n     *\n     * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes\n     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {\n     *   'trailing': false\n     * }));\n     *\n     * // cancel a trailing throttled call\n     * jQuery(window).on('popstate', throttled.cancel);\n     */\n    function throttle(func, wait, options) {\n      var leading = true,\n          trailing = true;\n\n      if (typeof func != 'function') {\n        throw new TypeError(FUNC_ERROR_TEXT);\n      }\n      if (options === false) {\n        leading = false;\n      } else if (isObject(options)) {\n        leading = 'leading' in options ? !!options.leading : leading;\n        trailing = 'trailing' in options ? !!options.trailing : trailing;\n      }\n      debounceOptions.leading = leading;\n      debounceOptions.maxWait = +wait;\n      debounceOptions.trailing = trailing;\n      return debounce(func, wait, debounceOptions);\n    }\n\n    /**\n     * Creates a function that provides `value` to the wrapper function as its\n     * first argument. Any additional arguments provided to the function are\n     * appended to those provided to the wrapper function. The wrapper is invoked\n     * with the `this` binding of the created function.\n     *\n     * @static\n     * @memberOf _\n     * @category Function\n     * @param {*} value The value to wrap.\n     * @param {Function} wrapper The wrapper function.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * var p = _.wrap(_.escape, function(func, text) {\n     *   return '<p>' + func(text) + '</p>';\n     * });\n     *\n     * p('fred, barney, & pebbles');\n     * // => '<p>fred, barney, &amp; pebbles</p>'\n     */\n    function wrap(value, wrapper) {\n      wrapper = wrapper == null ? identity : wrapper;\n      return createWrapper(wrapper, PARTIAL_FLAG, null, [value], []);\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Creates a clone of `value`. If `isDeep` is `true` nested objects are cloned,\n     * otherwise they are assigned by reference. If `customizer` is provided it is\n     * invoked to produce the cloned values. If `customizer` returns `undefined`\n     * cloning is handled by the method instead. The `customizer` is bound to\n     * `thisArg` and invoked with two argument; (value [, index|key, object]).\n     *\n     * **Note:** This method is loosely based on the\n     * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).\n     * The enumerable properties of `arguments` objects and objects created by\n     * constructors other than `Object` are cloned to plain `Object` objects. An\n     * empty object is returned for uncloneable values such as functions, DOM nodes,\n     * Maps, Sets, and WeakMaps.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to clone.\n     * @param {boolean} [isDeep] Specify a deep clone.\n     * @param {Function} [customizer] The function to customize cloning values.\n     * @param {*} [thisArg] The `this` binding of `customizer`.\n     * @returns {*} Returns the cloned value.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney' },\n     *   { 'user': 'fred' }\n     * ];\n     *\n     * var shallow = _.clone(users);\n     * shallow[0] === users[0];\n     * // => true\n     *\n     * var deep = _.clone(users, true);\n     * deep[0] === users[0];\n     * // => false\n     *\n     * // using a customizer callback\n     * var el = _.clone(document.body, function(value) {\n     *   if (_.isElement(value)) {\n     *     return value.cloneNode(false);\n     *   }\n     * });\n     *\n     * el === document.body\n     * // => false\n     * el.nodeName\n     * // => BODY\n     * el.childNodes.length;\n     * // => 0\n     */\n    function clone(value, isDeep, customizer, thisArg) {\n      if (isDeep && typeof isDeep != 'boolean' && isIterateeCall(value, isDeep, customizer)) {\n        isDeep = false;\n      }\n      else if (typeof isDeep == 'function') {\n        thisArg = customizer;\n        customizer = isDeep;\n        isDeep = false;\n      }\n      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 1);\n      return baseClone(value, isDeep, customizer);\n    }\n\n    /**\n     * Creates a deep clone of `value`. If `customizer` is provided it is invoked\n     * to produce the cloned values. If `customizer` returns `undefined` cloning\n     * is handled by the method instead. The `customizer` is bound to `thisArg`\n     * and invoked with two argument; (value [, index|key, object]).\n     *\n     * **Note:** This method is loosely based on the\n     * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).\n     * The enumerable properties of `arguments` objects and objects created by\n     * constructors other than `Object` are cloned to plain `Object` objects. An\n     * empty object is returned for uncloneable values such as functions, DOM nodes,\n     * Maps, Sets, and WeakMaps.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to deep clone.\n     * @param {Function} [customizer] The function to customize cloning values.\n     * @param {*} [thisArg] The `this` binding of `customizer`.\n     * @returns {*} Returns the deep cloned value.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney' },\n     *   { 'user': 'fred' }\n     * ];\n     *\n     * var deep = _.cloneDeep(users);\n     * deep[0] === users[0];\n     * // => false\n     *\n     * // using a customizer callback\n     * var el = _.cloneDeep(document.body, function(value) {\n     *   if (_.isElement(value)) {\n     *     return value.cloneNode(true);\n     *   }\n     * });\n     *\n     * el === document.body\n     * // => false\n     * el.nodeName\n     * // => BODY\n     * el.childNodes.length;\n     * // => 20\n     */\n    function cloneDeep(value, customizer, thisArg) {\n      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 1);\n      return baseClone(value, true, customizer);\n    }\n\n    /**\n     * Checks if `value` is classified as an `arguments` object.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n     * @example\n     *\n     * _.isArguments(function() { return arguments; }());\n     * // => true\n     *\n     * _.isArguments([1, 2, 3]);\n     * // => false\n     */\n    function isArguments(value) {\n      var length = isObjectLike(value) ? value.length : undefined;\n      return isLength(length) && objToString.call(value) == argsTag;\n    }\n\n    /**\n     * Checks if `value` is classified as an `Array` object.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n     * @example\n     *\n     * _.isArray([1, 2, 3]);\n     * // => true\n     *\n     * _.isArray(function() { return arguments; }());\n     * // => false\n     */\n    var isArray = nativeIsArray || function(value) {\n      return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;\n    };\n\n    /**\n     * Checks if `value` is classified as a boolean primitive or object.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n     * @example\n     *\n     * _.isBoolean(false);\n     * // => true\n     *\n     * _.isBoolean(null);\n     * // => false\n     */\n    function isBoolean(value) {\n      return value === true || value === false || (isObjectLike(value) && objToString.call(value) == boolTag);\n    }\n\n    /**\n     * Checks if `value` is classified as a `Date` object.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n     * @example\n     *\n     * _.isDate(new Date);\n     * // => true\n     *\n     * _.isDate('Mon April 23 2012');\n     * // => false\n     */\n    function isDate(value) {\n      return isObjectLike(value) && objToString.call(value) == dateTag;\n    }\n\n    /**\n     * Checks if `value` is a DOM element.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.\n     * @example\n     *\n     * _.isElement(document.body);\n     * // => true\n     *\n     * _.isElement('<body>');\n     * // => false\n     */\n    function isElement(value) {\n      return !!value && value.nodeType === 1 && isObjectLike(value) &&\n        (objToString.call(value).indexOf('Element') > -1);\n    }\n    // Fallback for environments without DOM support.\n    if (!support.dom) {\n      isElement = function(value) {\n        return !!value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value);\n      };\n    }\n\n    /**\n     * Checks if `value` is empty. A value is considered empty unless it is an\n     * `arguments` object, array, string, or jQuery-like collection with a length\n     * greater than `0` or an object with own enumerable properties.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {Array|Object|string} value The value to inspect.\n     * @returns {boolean} Returns `true` if `value` is empty, else `false`.\n     * @example\n     *\n     * _.isEmpty(null);\n     * // => true\n     *\n     * _.isEmpty(true);\n     * // => true\n     *\n     * _.isEmpty(1);\n     * // => true\n     *\n     * _.isEmpty([1, 2, 3]);\n     * // => false\n     *\n     * _.isEmpty({ 'a': 1 });\n     * // => false\n     */\n    function isEmpty(value) {\n      if (value == null) {\n        return true;\n      }\n      var length = value.length;\n      if (isLength(length) && (isArray(value) || isString(value) || isArguments(value) ||\n          (isObjectLike(value) && isFunction(value.splice)))) {\n        return !length;\n      }\n      return !keys(value).length;\n    }\n\n    /**\n     * Performs a deep comparison between two values to determine if they are\n     * equivalent. If `customizer` is provided it is invoked to compare values.\n     * If `customizer` returns `undefined` comparisons are handled by the method\n     * instead. The `customizer` is bound to `thisArg` and invoked with three\n     * arguments: (value, other [, index|key]).\n     *\n     * **Note:** This method supports comparing arrays, booleans, `Date` objects,\n     * numbers, `Object` objects, regexes, and strings. Objects are compared by\n     * their own, not inherited, enumerable properties. Functions and DOM nodes\n     * are **not** supported. Provide a customizer function to extend support\n     * for comparing other values.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to compare.\n     * @param {*} other The other value to compare.\n     * @param {Function} [customizer] The function to customize comparing values.\n     * @param {*} [thisArg] The `this` binding of `customizer`.\n     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.\n     * @example\n     *\n     * var object = { 'user': 'fred' };\n     * var other = { 'user': 'fred' };\n     *\n     * object == other;\n     * // => false\n     *\n     * _.isEqual(object, other);\n     * // => true\n     *\n     * // using a customizer callback\n     * var array = ['hello', 'goodbye'];\n     * var other = ['hi', 'goodbye'];\n     *\n     * _.isEqual(array, other, function(value, other) {\n     *   if (_.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/)) {\n     *     return true;\n     *   }\n     * });\n     * // => true\n     */\n    function isEqual(value, other, customizer, thisArg) {\n      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 3);\n      if (!customizer && isStrictComparable(value) && isStrictComparable(other)) {\n        return value === other;\n      }\n      var result = customizer ? customizer(value, other) : undefined;\n      return typeof result == 'undefined' ? baseIsEqual(value, other, customizer) : !!result;\n    }\n\n    /**\n     * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,\n     * `SyntaxError`, `TypeError`, or `URIError` object.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is an error object, else `false`.\n     * @example\n     *\n     * _.isError(new Error);\n     * // => true\n     *\n     * _.isError(Error);\n     * // => false\n     */\n    function isError(value) {\n      return isObjectLike(value) && typeof value.message == 'string' && objToString.call(value) == errorTag;\n    }\n\n    /**\n     * Checks if `value` is a finite primitive number.\n     *\n     * **Note:** This method is based on [`Number.isFinite`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isfinite).\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.\n     * @example\n     *\n     * _.isFinite(10);\n     * // => true\n     *\n     * _.isFinite('10');\n     * // => false\n     *\n     * _.isFinite(true);\n     * // => false\n     *\n     * _.isFinite(Object(10));\n     * // => false\n     *\n     * _.isFinite(Infinity);\n     * // => false\n     */\n    var isFinite = nativeNumIsFinite || function(value) {\n      return typeof value == 'number' && nativeIsFinite(value);\n    };\n\n    /**\n     * Checks if `value` is classified as a `Function` object.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n     * @example\n     *\n     * _.isFunction(_);\n     * // => true\n     *\n     * _.isFunction(/abc/);\n     * // => false\n     */\n    var isFunction = !(baseIsFunction(/x/) || (Uint8Array && !baseIsFunction(Uint8Array))) ? baseIsFunction : function(value) {\n      // The use of `Object#toString` avoids issues with the `typeof` operator\n      // in older versions of Chrome and Safari which return 'function' for regexes\n      // and Safari 8 equivalents which return 'object' for typed array constructors.\n      return objToString.call(value) == funcTag;\n    };\n\n    /**\n     * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.\n     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is an object, else `false`.\n     * @example\n     *\n     * _.isObject({});\n     * // => true\n     *\n     * _.isObject([1, 2, 3]);\n     * // => true\n     *\n     * _.isObject(1);\n     * // => false\n     */\n    function isObject(value) {\n      // Avoid a V8 JIT bug in Chrome 19-20.\n      // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.\n      var type = typeof value;\n      return type == 'function' || (!!value && type == 'object');\n    }\n\n    /**\n     * Performs a deep comparison between `object` and `source` to determine if\n     * `object` contains equivalent property values. If `customizer` is provided\n     * it is invoked to compare values. If `customizer` returns `undefined`\n     * comparisons are handled by the method instead. The `customizer` is bound\n     * to `thisArg` and invoked with three arguments: (value, other, index|key).\n     *\n     * **Note:** This method supports comparing properties of arrays, booleans,\n     * `Date` objects, numbers, `Object` objects, regexes, and strings. Functions\n     * and DOM nodes are **not** supported. Provide a customizer function to extend\n     * support for comparing other values.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {Object} object The object to inspect.\n     * @param {Object} source The object of property values to match.\n     * @param {Function} [customizer] The function to customize comparing values.\n     * @param {*} [thisArg] The `this` binding of `customizer`.\n     * @returns {boolean} Returns `true` if `object` is a match, else `false`.\n     * @example\n     *\n     * var object = { 'user': 'fred', 'age': 40 };\n     *\n     * _.isMatch(object, { 'age': 40 });\n     * // => true\n     *\n     * _.isMatch(object, { 'age': 36 });\n     * // => false\n     *\n     * // using a customizer callback\n     * var object = { 'greeting': 'hello' };\n     * var source = { 'greeting': 'hi' };\n     *\n     * _.isMatch(object, source, function(value, other) {\n     *   return _.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/) || undefined;\n     * });\n     * // => true\n     */\n    function isMatch(object, source, customizer, thisArg) {\n      var props = keys(source),\n          length = props.length;\n\n      if (!length) {\n        return true;\n      }\n      if (object == null) {\n        return false;\n      }\n      customizer = typeof customizer == 'function' && bindCallback(customizer, thisArg, 3);\n      if (!customizer && length == 1) {\n        var key = props[0],\n            value = source[key];\n\n        if (isStrictComparable(value)) {\n          return value === object[key] && (typeof value != 'undefined' || (key in toObject(object)));\n        }\n      }\n      var values = Array(length),\n          strictCompareFlags = Array(length);\n\n      while (length--) {\n        value = values[length] = source[props[length]];\n        strictCompareFlags[length] = isStrictComparable(value);\n      }\n      return baseIsMatch(toObject(object), props, values, strictCompareFlags, customizer);\n    }\n\n    /**\n     * Checks if `value` is `NaN`.\n     *\n     * **Note:** This method is not the same as [`isNaN`](https://es5.github.io/#x15.1.2.4)\n     * which returns `true` for `undefined` and other non-numeric values.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.\n     * @example\n     *\n     * _.isNaN(NaN);\n     * // => true\n     *\n     * _.isNaN(new Number(NaN));\n     * // => true\n     *\n     * isNaN(undefined);\n     * // => true\n     *\n     * _.isNaN(undefined);\n     * // => false\n     */\n    function isNaN(value) {\n      // An `NaN` primitive is the only value that is not equal to itself.\n      // Perform the `toStringTag` check first to avoid errors with some host objects in IE.\n      return isNumber(value) && value != +value;\n    }\n\n    /**\n     * Checks if `value` is a native function.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is a native function, else `false`.\n     * @example\n     *\n     * _.isNative(Array.prototype.push);\n     * // => true\n     *\n     * _.isNative(_);\n     * // => false\n     */\n    function isNative(value) {\n      if (value == null) {\n        return false;\n      }\n      if (objToString.call(value) == funcTag) {\n        return reNative.test(fnToString.call(value));\n      }\n      return isObjectLike(value) && reHostCtor.test(value);\n    }\n\n    /**\n     * Checks if `value` is `null`.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is `null`, else `false`.\n     * @example\n     *\n     * _.isNull(null);\n     * // => true\n     *\n     * _.isNull(void 0);\n     * // => false\n     */\n    function isNull(value) {\n      return value === null;\n    }\n\n    /**\n     * Checks if `value` is classified as a `Number` primitive or object.\n     *\n     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified\n     * as numbers, use the `_.isFinite` method.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n     * @example\n     *\n     * _.isNumber(8.4);\n     * // => true\n     *\n     * _.isNumber(NaN);\n     * // => true\n     *\n     * _.isNumber('8.4');\n     * // => false\n     */\n    function isNumber(value) {\n      return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);\n    }\n\n    /**\n     * Checks if `value` is a plain object, that is, an object created by the\n     * `Object` constructor or one with a `[[Prototype]]` of `null`.\n     *\n     * **Note:** This method assumes objects created by the `Object` constructor\n     * have no inherited enumerable properties.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.\n     * @example\n     *\n     * function Foo() {\n     *   this.a = 1;\n     * }\n     *\n     * _.isPlainObject(new Foo);\n     * // => false\n     *\n     * _.isPlainObject([1, 2, 3]);\n     * // => false\n     *\n     * _.isPlainObject({ 'x': 0, 'y': 0 });\n     * // => true\n     *\n     * _.isPlainObject(Object.create(null));\n     * // => true\n     */\n    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {\n      if (!(value && objToString.call(value) == objectTag)) {\n        return false;\n      }\n      var valueOf = value.valueOf,\n          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);\n\n      return objProto\n        ? (value == objProto || getPrototypeOf(value) == objProto)\n        : shimIsPlainObject(value);\n    };\n\n    /**\n     * Checks if `value` is classified as a `RegExp` object.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n     * @example\n     *\n     * _.isRegExp(/abc/);\n     * // => true\n     *\n     * _.isRegExp('/abc/');\n     * // => false\n     */\n    function isRegExp(value) {\n      return (isObjectLike(value) && objToString.call(value) == regexpTag) || false;\n    }\n\n    /**\n     * Checks if `value` is classified as a `String` primitive or object.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n     * @example\n     *\n     * _.isString('abc');\n     * // => true\n     *\n     * _.isString(1);\n     * // => false\n     */\n    function isString(value) {\n      return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);\n    }\n\n    /**\n     * Checks if `value` is classified as a typed array.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.\n     * @example\n     *\n     * _.isTypedArray(new Uint8Array);\n     * // => true\n     *\n     * _.isTypedArray([]);\n     * // => false\n     */\n    function isTypedArray(value) {\n      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];\n    }\n\n    /**\n     * Checks if `value` is `undefined`.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to check.\n     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.\n     * @example\n     *\n     * _.isUndefined(void 0);\n     * // => true\n     *\n     * _.isUndefined(null);\n     * // => false\n     */\n    function isUndefined(value) {\n      return typeof value == 'undefined';\n    }\n\n    /**\n     * Converts `value` to an array.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to convert.\n     * @returns {Array} Returns the converted array.\n     * @example\n     *\n     * (function() {\n     *   return _.toArray(arguments).slice(1);\n     * }(1, 2, 3));\n     * // => [2, 3]\n     */\n    function toArray(value) {\n      var length = value ? value.length : 0;\n      if (!isLength(length)) {\n        return values(value);\n      }\n      if (!length) {\n        return [];\n      }\n      return arrayCopy(value);\n    }\n\n    /**\n     * Converts `value` to a plain object flattening inherited enumerable\n     * properties of `value` to own properties of the plain object.\n     *\n     * @static\n     * @memberOf _\n     * @category Lang\n     * @param {*} value The value to convert.\n     * @returns {Object} Returns the converted plain object.\n     * @example\n     *\n     * function Foo() {\n     *   this.b = 2;\n     * }\n     *\n     * Foo.prototype.c = 3;\n     *\n     * _.assign({ 'a': 1 }, new Foo);\n     * // => { 'a': 1, 'b': 2 }\n     *\n     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));\n     * // => { 'a': 1, 'b': 2, 'c': 3 }\n     */\n    function toPlainObject(value) {\n      return baseCopy(value, keysIn(value));\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Assigns own enumerable properties of source object(s) to the destination\n     * object. Subsequent sources overwrite property assignments of previous sources.\n     * If `customizer` is provided it is invoked to produce the assigned values.\n     * The `customizer` is bound to `thisArg` and invoked with five arguments:\n     * (objectValue, sourceValue, key, object, source).\n     *\n     * @static\n     * @memberOf _\n     * @alias extend\n     * @category Object\n     * @param {Object} object The destination object.\n     * @param {...Object} [sources] The source objects.\n     * @param {Function} [customizer] The function to customize assigning values.\n     * @param {*} [thisArg] The `this` binding of `customizer`.\n     * @returns {Object} Returns `object`.\n     * @example\n     *\n     * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });\n     * // => { 'user': 'fred', 'age': 40 }\n     *\n     * // using a customizer callback\n     * var defaults = _.partialRight(_.assign, function(value, other) {\n     *   return typeof value == 'undefined' ? other : value;\n     * });\n     *\n     * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });\n     * // => { 'user': 'barney', 'age': 36 }\n     */\n    var assign = createAssigner(baseAssign);\n\n    /**\n     * Creates an object that inherits from the given `prototype` object. If a\n     * `properties` object is provided its own enumerable properties are assigned\n     * to the created object.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} prototype The object to inherit from.\n     * @param {Object} [properties] The properties to assign to the object.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Object} Returns the new object.\n     * @example\n     *\n     * function Shape() {\n     *   this.x = 0;\n     *   this.y = 0;\n     * }\n     *\n     * function Circle() {\n     *   Shape.call(this);\n     * }\n     *\n     * Circle.prototype = _.create(Shape.prototype, {\n     *   'constructor': Circle\n     * });\n     *\n     * var circle = new Circle;\n     * circle instanceof Circle;\n     * // => true\n     *\n     * circle instanceof Shape;\n     * // => true\n     */\n    function create(prototype, properties, guard) {\n      var result = baseCreate(prototype);\n      if (guard && isIterateeCall(prototype, properties, guard)) {\n        properties = null;\n      }\n      return properties ? baseCopy(properties, result, keys(properties)) : result;\n    }\n\n    /**\n     * Assigns own enumerable properties of source object(s) to the destination\n     * object for all destination properties that resolve to `undefined`. Once a\n     * property is set, additional values of the same property are ignored.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The destination object.\n     * @param {...Object} [sources] The source objects.\n     * @returns {Object} Returns `object`.\n     * @example\n     *\n     * _.defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });\n     * // => { 'user': 'barney', 'age': 36 }\n     */\n    var defaults = restParam(function(args) {\n      var object = args[0];\n      if (object == null) {\n        return object;\n      }\n      args.push(assignDefaults);\n      return assign.apply(undefined, args);\n    });\n\n    /**\n     * This method is like `_.find` except that it returns the key of the first\n     * element `predicate` returns truthy for instead of the element itself.\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to search.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {string|undefined} Returns the key of the matched element, else `undefined`.\n     * @example\n     *\n     * var users = {\n     *   'barney':  { 'age': 36, 'active': true },\n     *   'fred':    { 'age': 40, 'active': false },\n     *   'pebbles': { 'age': 1,  'active': true }\n     * };\n     *\n     * _.findKey(users, function(chr) {\n     *   return chr.age < 40;\n     * });\n     * // => 'barney' (iteration order is not guaranteed)\n     *\n     * // using the `_.matches` callback shorthand\n     * _.findKey(users, { 'age': 1, 'active': true });\n     * // => 'pebbles'\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.findKey(users, 'active', false);\n     * // => 'fred'\n     *\n     * // using the `_.property` callback shorthand\n     * _.findKey(users, 'active');\n     * // => 'barney'\n     */\n    var findKey = createFindKey(baseForOwn);\n\n    /**\n     * This method is like `_.findKey` except that it iterates over elements of\n     * a collection in the opposite order.\n     *\n     * If a property name is provided for `predicate` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `predicate` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to search.\n     * @param {Function|Object|string} [predicate=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {string|undefined} Returns the key of the matched element, else `undefined`.\n     * @example\n     *\n     * var users = {\n     *   'barney':  { 'age': 36, 'active': true },\n     *   'fred':    { 'age': 40, 'active': false },\n     *   'pebbles': { 'age': 1,  'active': true }\n     * };\n     *\n     * _.findLastKey(users, function(chr) {\n     *   return chr.age < 40;\n     * });\n     * // => returns `pebbles` assuming `_.findKey` returns `barney`\n     *\n     * // using the `_.matches` callback shorthand\n     * _.findLastKey(users, { 'age': 36, 'active': true });\n     * // => 'barney'\n     *\n     * // using the `_.matchesProperty` callback shorthand\n     * _.findLastKey(users, 'active', false);\n     * // => 'fred'\n     *\n     * // using the `_.property` callback shorthand\n     * _.findLastKey(users, 'active');\n     * // => 'pebbles'\n     */\n    var findLastKey = createFindKey(baseForOwnRight);\n\n    /**\n     * Iterates over own and inherited enumerable properties of an object invoking\n     * `iteratee` for each property. The `iteratee` is bound to `thisArg` and invoked\n     * with three arguments: (value, key, object). Iterator functions may exit\n     * iteration early by explicitly returning `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to iterate over.\n     * @param {Function} [iteratee=_.identity] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Object} Returns `object`.\n     * @example\n     *\n     * function Foo() {\n     *   this.a = 1;\n     *   this.b = 2;\n     * }\n     *\n     * Foo.prototype.c = 3;\n     *\n     * _.forIn(new Foo, function(value, key) {\n     *   console.log(key);\n     * });\n     * // => logs 'a', 'b', and 'c' (iteration order is not guaranteed)\n     */\n    var forIn = createForIn(baseFor);\n\n    /**\n     * This method is like `_.forIn` except that it iterates over properties of\n     * `object` in the opposite order.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to iterate over.\n     * @param {Function} [iteratee=_.identity] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Object} Returns `object`.\n     * @example\n     *\n     * function Foo() {\n     *   this.a = 1;\n     *   this.b = 2;\n     * }\n     *\n     * Foo.prototype.c = 3;\n     *\n     * _.forInRight(new Foo, function(value, key) {\n     *   console.log(key);\n     * });\n     * // => logs 'c', 'b', and 'a' assuming `_.forIn ` logs 'a', 'b', and 'c'\n     */\n    var forInRight = createForIn(baseForRight);\n\n    /**\n     * Iterates over own enumerable properties of an object invoking `iteratee`\n     * for each property. The `iteratee` is bound to `thisArg` and invoked with\n     * three arguments: (value, key, object). Iterator functions may exit iteration\n     * early by explicitly returning `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to iterate over.\n     * @param {Function} [iteratee=_.identity] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Object} Returns `object`.\n     * @example\n     *\n     * function Foo() {\n     *   this.a = 1;\n     *   this.b = 2;\n     * }\n     *\n     * Foo.prototype.c = 3;\n     *\n     * _.forOwn(new Foo, function(value, key) {\n     *   console.log(key);\n     * });\n     * // => logs 'a' and 'b' (iteration order is not guaranteed)\n     */\n    var forOwn = createForOwn(baseForOwn);\n\n    /**\n     * This method is like `_.forOwn` except that it iterates over properties of\n     * `object` in the opposite order.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to iterate over.\n     * @param {Function} [iteratee=_.identity] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Object} Returns `object`.\n     * @example\n     *\n     * function Foo() {\n     *   this.a = 1;\n     *   this.b = 2;\n     * }\n     *\n     * Foo.prototype.c = 3;\n     *\n     * _.forOwnRight(new Foo, function(value, key) {\n     *   console.log(key);\n     * });\n     * // => logs 'b' and 'a' assuming `_.forOwn` logs 'a' and 'b'\n     */\n    var forOwnRight = createForOwn(baseForOwnRight);\n\n    /**\n     * Creates an array of function property names from all enumerable properties,\n     * own and inherited, of `object`.\n     *\n     * @static\n     * @memberOf _\n     * @alias methods\n     * @category Object\n     * @param {Object} object The object to inspect.\n     * @returns {Array} Returns the new array of property names.\n     * @example\n     *\n     * _.functions(_);\n     * // => ['after', 'ary', 'assign', ...]\n     */\n    function functions(object) {\n      return baseFunctions(object, keysIn(object));\n    }\n\n    /**\n     * Checks if `key` exists as a direct property of `object` instead of an\n     * inherited property.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to inspect.\n     * @param {string} key The key to check.\n     * @returns {boolean} Returns `true` if `key` is a direct property, else `false`.\n     * @example\n     *\n     * var object = { 'a': 1, 'b': 2, 'c': 3 };\n     *\n     * _.has(object, 'b');\n     * // => true\n     */\n    function has(object, key) {\n      return object ? hasOwnProperty.call(object, key) : false;\n    }\n\n    /**\n     * Creates an object composed of the inverted keys and values of `object`.\n     * If `object` contains duplicate values, subsequent values overwrite property\n     * assignments of previous values unless `multiValue` is `true`.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to invert.\n     * @param {boolean} [multiValue] Allow multiple values per key.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Object} Returns the new inverted object.\n     * @example\n     *\n     * var object = { 'a': 1, 'b': 2, 'c': 1 };\n     *\n     * _.invert(object);\n     * // => { '1': 'c', '2': 'b' }\n     *\n     * // with `multiValue`\n     * _.invert(object, true);\n     * // => { '1': ['a', 'c'], '2': ['b'] }\n     */\n    function invert(object, multiValue, guard) {\n      if (guard && isIterateeCall(object, multiValue, guard)) {\n        multiValue = null;\n      }\n      var index = -1,\n          props = keys(object),\n          length = props.length,\n          result = {};\n\n      while (++index < length) {\n        var key = props[index],\n            value = object[key];\n\n        if (multiValue) {\n          if (hasOwnProperty.call(result, value)) {\n            result[value].push(key);\n          } else {\n            result[value] = [key];\n          }\n        }\n        else {\n          result[value] = key;\n        }\n      }\n      return result;\n    }\n\n    /**\n     * Creates an array of the own enumerable property names of `object`.\n     *\n     * **Note:** Non-object values are coerced to objects. See the\n     * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.keys)\n     * for more details.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to inspect.\n     * @returns {Array} Returns the array of property names.\n     * @example\n     *\n     * function Foo() {\n     *   this.a = 1;\n     *   this.b = 2;\n     * }\n     *\n     * Foo.prototype.c = 3;\n     *\n     * _.keys(new Foo);\n     * // => ['a', 'b'] (iteration order is not guaranteed)\n     *\n     * _.keys('hi');\n     * // => ['0', '1']\n     */\n    var keys = !nativeKeys ? shimKeys : function(object) {\n      if (object) {\n        var Ctor = object.constructor,\n            length = object.length;\n      }\n      if ((typeof Ctor == 'function' && Ctor.prototype === object) ||\n          (typeof object != 'function' && (length && isLength(length)))) {\n        return shimKeys(object);\n      }\n      return isObject(object) ? nativeKeys(object) : [];\n    };\n\n    /**\n     * Creates an array of the own and inherited enumerable property names of `object`.\n     *\n     * **Note:** Non-object values are coerced to objects.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to inspect.\n     * @returns {Array} Returns the array of property names.\n     * @example\n     *\n     * function Foo() {\n     *   this.a = 1;\n     *   this.b = 2;\n     * }\n     *\n     * Foo.prototype.c = 3;\n     *\n     * _.keysIn(new Foo);\n     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)\n     */\n    function keysIn(object) {\n      if (object == null) {\n        return [];\n      }\n      if (!isObject(object)) {\n        object = Object(object);\n      }\n      var length = object.length;\n      length = (length && isLength(length) &&\n        (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;\n\n      var Ctor = object.constructor,\n          index = -1,\n          isProto = typeof Ctor == 'function' && Ctor.prototype === object,\n          result = Array(length),\n          skipIndexes = length > 0;\n\n      while (++index < length) {\n        result[index] = (index + '');\n      }\n      for (var key in object) {\n        if (!(skipIndexes && isIndex(key, length)) &&\n            !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {\n          result.push(key);\n        }\n      }\n      return result;\n    }\n\n    /**\n     * Creates an object with the same keys as `object` and values generated by\n     * running each own enumerable property of `object` through `iteratee`. The\n     * iteratee function is bound to `thisArg` and invoked with three arguments:\n     * (value, key, object).\n     *\n     * If a property name is provided for `iteratee` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `iteratee` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to iterate over.\n     * @param {Function|Object|string} [iteratee=_.identity] The function invoked\n     *  per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Object} Returns the new mapped object.\n     * @example\n     *\n     * _.mapValues({ 'a': 1, 'b': 2 }, function(n) {\n     *   return n * 3;\n     * });\n     * // => { 'a': 3, 'b': 6 }\n     *\n     * var users = {\n     *   'fred':    { 'user': 'fred',    'age': 40 },\n     *   'pebbles': { 'user': 'pebbles', 'age': 1 }\n     * };\n     *\n     * // using the `_.property` callback shorthand\n     * _.mapValues(users, 'age');\n     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)\n     */\n    function mapValues(object, iteratee, thisArg) {\n      var result = {};\n      iteratee = getCallback(iteratee, thisArg, 3);\n\n      baseForOwn(object, function(value, key, object) {\n        result[key] = iteratee(value, key, object);\n      });\n      return result;\n    }\n\n    /**\n     * Recursively merges own enumerable properties of the source object(s), that\n     * don't resolve to `undefined` into the destination object. Subsequent sources\n     * overwrite property assignments of previous sources. If `customizer` is\n     * provided it is invoked to produce the merged values of the destination and\n     * source properties. If `customizer` returns `undefined` merging is handled\n     * by the method instead. The `customizer` is bound to `thisArg` and invoked\n     * with five arguments: (objectValue, sourceValue, key, object, source).\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The destination object.\n     * @param {...Object} [sources] The source objects.\n     * @param {Function} [customizer] The function to customize merging properties.\n     * @param {*} [thisArg] The `this` binding of `customizer`.\n     * @returns {Object} Returns `object`.\n     * @example\n     *\n     * var users = {\n     *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]\n     * };\n     *\n     * var ages = {\n     *   'data': [{ 'age': 36 }, { 'age': 40 }]\n     * };\n     *\n     * _.merge(users, ages);\n     * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }\n     *\n     * // using a customizer callback\n     * var object = {\n     *   'fruits': ['apple'],\n     *   'vegetables': ['beet']\n     * };\n     *\n     * var other = {\n     *   'fruits': ['banana'],\n     *   'vegetables': ['carrot']\n     * };\n     *\n     * _.merge(object, other, function(a, b) {\n     *   if (_.isArray(a)) {\n     *     return a.concat(b);\n     *   }\n     * });\n     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }\n     */\n    var merge = createAssigner(baseMerge);\n\n    /**\n     * The opposite of `_.pick`; this method creates an object composed of the\n     * own and inherited enumerable properties of `object` that are not omitted.\n     * Property names may be specified as individual arguments or as arrays of\n     * property names. If `predicate` is provided it is invoked for each property\n     * of `object` omitting the properties `predicate` returns truthy for. The\n     * predicate is bound to `thisArg` and invoked with three arguments:\n     * (value, key, object).\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The source object.\n     * @param {Function|...(string|string[])} [predicate] The function invoked per\n     *  iteration or property names to omit, specified as individual property\n     *  names or arrays of property names.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {Object} Returns the new object.\n     * @example\n     *\n     * var object = { 'user': 'fred', 'age': 40 };\n     *\n     * _.omit(object, 'age');\n     * // => { 'user': 'fred' }\n     *\n     * _.omit(object, _.isNumber);\n     * // => { 'user': 'fred' }\n     */\n    var omit = restParam(function(object, props) {\n      if (object == null) {\n        return {};\n      }\n      if (typeof props[0] != 'function') {\n        var props = arrayMap(baseFlatten(props), String);\n        return pickByArray(object, baseDifference(keysIn(object), props));\n      }\n      var predicate = bindCallback(props[0], props[1], 3);\n      return pickByCallback(object, function(value, key, object) {\n        return !predicate(value, key, object);\n      });\n    });\n\n    /**\n     * Creates a two dimensional array of the key-value pairs for `object`,\n     * e.g. `[[key1, value1], [key2, value2]]`.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to inspect.\n     * @returns {Array} Returns the new array of key-value pairs.\n     * @example\n     *\n     * _.pairs({ 'barney': 36, 'fred': 40 });\n     * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)\n     */\n    function pairs(object) {\n      var index = -1,\n          props = keys(object),\n          length = props.length,\n          result = Array(length);\n\n      while (++index < length) {\n        var key = props[index];\n        result[index] = [key, object[key]];\n      }\n      return result;\n    }\n\n    /**\n     * Creates an object composed of the picked `object` properties. Property\n     * names may be specified as individual arguments or as arrays of property\n     * names. If `predicate` is provided it is invoked for each property of `object`\n     * picking the properties `predicate` returns truthy for. The predicate is\n     * bound to `thisArg` and invoked with three arguments: (value, key, object).\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The source object.\n     * @param {Function|...(string|string[])} [predicate] The function invoked per\n     *  iteration or property names to pick, specified as individual property\n     *  names or arrays of property names.\n     * @param {*} [thisArg] The `this` binding of `predicate`.\n     * @returns {Object} Returns the new object.\n     * @example\n     *\n     * var object = { 'user': 'fred', 'age': 40 };\n     *\n     * _.pick(object, 'user');\n     * // => { 'user': 'fred' }\n     *\n     * _.pick(object, _.isString);\n     * // => { 'user': 'fred' }\n     */\n    var pick = restParam(function(object, props) {\n      if (object == null) {\n        return {};\n      }\n      return typeof props[0] == 'function'\n        ? pickByCallback(object, bindCallback(props[0], props[1], 3))\n        : pickByArray(object, baseFlatten(props));\n    });\n\n    /**\n     * Resolves the value of property `key` on `object`. If the value of `key` is\n     * a function it is invoked with the `this` binding of `object` and its result\n     * is returned, else the property value is returned. If the property value is\n     * `undefined` the `defaultValue` is used in its place.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to query.\n     * @param {string} key The key of the property to resolve.\n     * @param {*} [defaultValue] The value returned if the property value\n     *  resolves to `undefined`.\n     * @returns {*} Returns the resolved value.\n     * @example\n     *\n     * var object = { 'user': 'fred', 'age': _.constant(40) };\n     *\n     * _.result(object, 'user');\n     * // => 'fred'\n     *\n     * _.result(object, 'age');\n     * // => 40\n     *\n     * _.result(object, 'status', 'busy');\n     * // => 'busy'\n     *\n     * _.result(object, 'status', _.constant('busy'));\n     * // => 'busy'\n     */\n    function result(object, key, defaultValue) {\n      var value = object == null ? undefined : object[key];\n      if (typeof value == 'undefined') {\n        value = defaultValue;\n      }\n      return isFunction(value) ? value.call(object) : value;\n    }\n\n    /**\n     * An alternative to `_.reduce`; this method transforms `object` to a new\n     * `accumulator` object which is the result of running each of its own enumerable\n     * properties through `iteratee`, with each invocation potentially mutating\n     * the `accumulator` object. The `iteratee` is bound to `thisArg` and invoked\n     * with four arguments: (accumulator, value, key, object). Iterator functions\n     * may exit iteration early by explicitly returning `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Array|Object} object The object to iterate over.\n     * @param {Function} [iteratee=_.identity] The function invoked per iteration.\n     * @param {*} [accumulator] The custom accumulator value.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {*} Returns the accumulated value.\n     * @example\n     *\n     * _.transform([2, 3, 4], function(result, n) {\n     *   result.push(n *= n);\n     *   return n % 2 == 0;\n     * });\n     * // => [4, 9]\n     *\n     * _.transform({ 'a': 1, 'b': 2 }, function(result, n, key) {\n     *   result[key] = n * 3;\n     * });\n     * // => { 'a': 3, 'b': 6 }\n     */\n    function transform(object, iteratee, accumulator, thisArg) {\n      var isArr = isArray(object) || isTypedArray(object);\n      iteratee = getCallback(iteratee, thisArg, 4);\n\n      if (accumulator == null) {\n        if (isArr || isObject(object)) {\n          var Ctor = object.constructor;\n          if (isArr) {\n            accumulator = isArray(object) ? new Ctor : [];\n          } else {\n            accumulator = baseCreate(isFunction(Ctor) && Ctor.prototype);\n          }\n        } else {\n          accumulator = {};\n        }\n      }\n      (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {\n        return iteratee(accumulator, value, index, object);\n      });\n      return accumulator;\n    }\n\n    /**\n     * Creates an array of the own enumerable property values of `object`.\n     *\n     * **Note:** Non-object values are coerced to objects.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to query.\n     * @returns {Array} Returns the array of property values.\n     * @example\n     *\n     * function Foo() {\n     *   this.a = 1;\n     *   this.b = 2;\n     * }\n     *\n     * Foo.prototype.c = 3;\n     *\n     * _.values(new Foo);\n     * // => [1, 2] (iteration order is not guaranteed)\n     *\n     * _.values('hi');\n     * // => ['h', 'i']\n     */\n    function values(object) {\n      return baseValues(object, keys(object));\n    }\n\n    /**\n     * Creates an array of the own and inherited enumerable property values\n     * of `object`.\n     *\n     * **Note:** Non-object values are coerced to objects.\n     *\n     * @static\n     * @memberOf _\n     * @category Object\n     * @param {Object} object The object to query.\n     * @returns {Array} Returns the array of property values.\n     * @example\n     *\n     * function Foo() {\n     *   this.a = 1;\n     *   this.b = 2;\n     * }\n     *\n     * Foo.prototype.c = 3;\n     *\n     * _.valuesIn(new Foo);\n     * // => [1, 2, 3] (iteration order is not guaranteed)\n     */\n    function valuesIn(object) {\n      return baseValues(object, keysIn(object));\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Checks if `n` is between `start` and up to but not including, `end`. If\n     * `end` is not specified it is set to `start` with `start` then set to `0`.\n     *\n     * @static\n     * @memberOf _\n     * @category Number\n     * @param {number} n The number to check.\n     * @param {number} [start=0] The start of the range.\n     * @param {number} end The end of the range.\n     * @returns {boolean} Returns `true` if `n` is in the range, else `false`.\n     * @example\n     *\n     * _.inRange(3, 2, 4);\n     * // => true\n     *\n     * _.inRange(4, 8);\n     * // => true\n     *\n     * _.inRange(4, 2);\n     * // => false\n     *\n     * _.inRange(2, 2);\n     * // => false\n     *\n     * _.inRange(1.2, 2);\n     * // => true\n     *\n     * _.inRange(5.2, 4);\n     * // => false\n     */\n    function inRange(value, start, end) {\n      start = +start || 0;\n      if (typeof end === 'undefined') {\n        end = start;\n        start = 0;\n      } else {\n        end = +end || 0;\n      }\n      return value >= start && value < end;\n    }\n\n    /**\n     * Produces a random number between `min` and `max` (inclusive). If only one\n     * argument is provided a number between `0` and the given number is returned.\n     * If `floating` is `true`, or either `min` or `max` are floats, a floating-point\n     * number is returned instead of an integer.\n     *\n     * @static\n     * @memberOf _\n     * @category Number\n     * @param {number} [min=0] The minimum possible value.\n     * @param {number} [max=1] The maximum possible value.\n     * @param {boolean} [floating] Specify returning a floating-point number.\n     * @returns {number} Returns the random number.\n     * @example\n     *\n     * _.random(0, 5);\n     * // => an integer between 0 and 5\n     *\n     * _.random(5);\n     * // => also an integer between 0 and 5\n     *\n     * _.random(5, true);\n     * // => a floating-point number between 0 and 5\n     *\n     * _.random(1.2, 5.2);\n     * // => a floating-point number between 1.2 and 5.2\n     */\n    function random(min, max, floating) {\n      if (floating && isIterateeCall(min, max, floating)) {\n        max = floating = null;\n      }\n      var noMin = min == null,\n          noMax = max == null;\n\n      if (floating == null) {\n        if (noMax && typeof min == 'boolean') {\n          floating = min;\n          min = 1;\n        }\n        else if (typeof max == 'boolean') {\n          floating = max;\n          noMax = true;\n        }\n      }\n      if (noMin && noMax) {\n        max = 1;\n        noMax = false;\n      }\n      min = +min || 0;\n      if (noMax) {\n        max = min;\n        min = 0;\n      } else {\n        max = +max || 0;\n      }\n      if (floating || min % 1 || max % 1) {\n        var rand = nativeRandom();\n        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand + '').length - 1)))), max);\n      }\n      return baseRandom(min, max);\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to convert.\n     * @returns {string} Returns the camel cased string.\n     * @example\n     *\n     * _.camelCase('Foo Bar');\n     * // => 'fooBar'\n     *\n     * _.camelCase('--foo-bar');\n     * // => 'fooBar'\n     *\n     * _.camelCase('__foo_bar__');\n     * // => 'fooBar'\n     */\n    var camelCase = createCompounder(function(result, word, index) {\n      word = word.toLowerCase();\n      return result + (index ? (word.charAt(0).toUpperCase() + word.slice(1)) : word);\n    });\n\n    /**\n     * Capitalizes the first character of `string`.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to capitalize.\n     * @returns {string} Returns the capitalized string.\n     * @example\n     *\n     * _.capitalize('fred');\n     * // => 'Fred'\n     */\n    function capitalize(string) {\n      string = baseToString(string);\n      return string && (string.charAt(0).toUpperCase() + string.slice(1));\n    }\n\n    /**\n     * Deburrs `string` by converting [latin-1 supplementary letters](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)\n     * to basic latin letters and removing [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to deburr.\n     * @returns {string} Returns the deburred string.\n     * @example\n     *\n     * _.deburr('déjà vu');\n     * // => 'deja vu'\n     */\n    function deburr(string) {\n      string = baseToString(string);\n      return string && string.replace(reLatin1, deburrLetter).replace(reComboMarks, '');\n    }\n\n    /**\n     * Checks if `string` ends with the given target string.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to search.\n     * @param {string} [target] The string to search for.\n     * @param {number} [position=string.length] The position to search from.\n     * @returns {boolean} Returns `true` if `string` ends with `target`, else `false`.\n     * @example\n     *\n     * _.endsWith('abc', 'c');\n     * // => true\n     *\n     * _.endsWith('abc', 'b');\n     * // => false\n     *\n     * _.endsWith('abc', 'b', 2);\n     * // => true\n     */\n    function endsWith(string, target, position) {\n      string = baseToString(string);\n      target = (target + '');\n\n      var length = string.length;\n      position = typeof position == 'undefined'\n        ? length\n        : nativeMin(position < 0 ? 0 : (+position || 0), length);\n\n      position -= target.length;\n      return position >= 0 && string.indexOf(target, position) == position;\n    }\n\n    /**\n     * Converts the characters \"&\", \"<\", \">\", '\"', \"'\", and \"\\`\", in `string` to\n     * their corresponding HTML entities.\n     *\n     * **Note:** No other characters are escaped. To escape additional characters\n     * use a third-party library like [_he_](https://mths.be/he).\n     *\n     * Though the \">\" character is escaped for symmetry, characters like\n     * \">\" and \"/\" don't require escaping in HTML and have no special meaning\n     * unless they're part of a tag or unquoted attribute value.\n     * See [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)\n     * (under \"semi-related fun fact\") for more details.\n     *\n     * Backticks are escaped because in Internet Explorer < 9, they can break out\n     * of attribute values or HTML comments. See [#102](https://html5sec.org/#102),\n     * [#108](https://html5sec.org/#108), and [#133](https://html5sec.org/#133) of\n     * the [HTML5 Security Cheatsheet](https://html5sec.org/) for more details.\n     *\n     * When working with HTML you should always [quote attribute values](http://wonko.com/post/html-escaping)\n     * to reduce XSS vectors.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to escape.\n     * @returns {string} Returns the escaped string.\n     * @example\n     *\n     * _.escape('fred, barney, & pebbles');\n     * // => 'fred, barney, &amp; pebbles'\n     */\n    function escape(string) {\n      // Reset `lastIndex` because in IE < 9 `String#replace` does not.\n      string = baseToString(string);\n      return (string && reHasUnescapedHtml.test(string))\n        ? string.replace(reUnescapedHtml, escapeHtmlChar)\n        : string;\n    }\n\n    /**\n     * Escapes the `RegExp` special characters \"\\\", \"/\", \"^\", \"$\", \".\", \"|\", \"?\",\n     * \"*\", \"+\", \"(\", \")\", \"[\", \"]\", \"{\" and \"}\" in `string`.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to escape.\n     * @returns {string} Returns the escaped string.\n     * @example\n     *\n     * _.escapeRegExp('[lodash](https://lodash.com/)');\n     * // => '\\[lodash\\]\\(https:\\/\\/lodash\\.com\\/\\)'\n     */\n    function escapeRegExp(string) {\n      string = baseToString(string);\n      return (string && reHasRegExpChars.test(string))\n        ? string.replace(reRegExpChars, '\\\\$&')\n        : string;\n    }\n\n    /**\n     * Converts `string` to [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to convert.\n     * @returns {string} Returns the kebab cased string.\n     * @example\n     *\n     * _.kebabCase('Foo Bar');\n     * // => 'foo-bar'\n     *\n     * _.kebabCase('fooBar');\n     * // => 'foo-bar'\n     *\n     * _.kebabCase('__foo_bar__');\n     * // => 'foo-bar'\n     */\n    var kebabCase = createCompounder(function(result, word, index) {\n      return result + (index ? '-' : '') + word.toLowerCase();\n    });\n\n    /**\n     * Pads `string` on the left and right sides if it is shorter than `length`.\n     * Padding characters are truncated if they can't be evenly divided by `length`.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to pad.\n     * @param {number} [length=0] The padding length.\n     * @param {string} [chars=' '] The string used as padding.\n     * @returns {string} Returns the padded string.\n     * @example\n     *\n     * _.pad('abc', 8);\n     * // => '  abc   '\n     *\n     * _.pad('abc', 8, '_-');\n     * // => '_-abc_-_'\n     *\n     * _.pad('abc', 3);\n     * // => 'abc'\n     */\n    function pad(string, length, chars) {\n      string = baseToString(string);\n      length = +length;\n\n      var strLength = string.length;\n      if (strLength >= length || !nativeIsFinite(length)) {\n        return string;\n      }\n      var mid = (length - strLength) / 2,\n          leftLength = floor(mid),\n          rightLength = ceil(mid);\n\n      chars = createPadding('', rightLength, chars);\n      return chars.slice(0, leftLength) + string + chars;\n    }\n\n    /**\n     * Pads `string` on the left side if it is shorter than `length`. Padding\n     * characters are truncated if they exceed `length`.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to pad.\n     * @param {number} [length=0] The padding length.\n     * @param {string} [chars=' '] The string used as padding.\n     * @returns {string} Returns the padded string.\n     * @example\n     *\n     * _.padLeft('abc', 6);\n     * // => '   abc'\n     *\n     * _.padLeft('abc', 6, '_-');\n     * // => '_-_abc'\n     *\n     * _.padLeft('abc', 3);\n     * // => 'abc'\n     */\n    var padLeft = createPadDir();\n\n    /**\n     * Pads `string` on the right side if it is shorter than `length`. Padding\n     * characters are truncated if they exceed `length`.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to pad.\n     * @param {number} [length=0] The padding length.\n     * @param {string} [chars=' '] The string used as padding.\n     * @returns {string} Returns the padded string.\n     * @example\n     *\n     * _.padRight('abc', 6);\n     * // => 'abc   '\n     *\n     * _.padRight('abc', 6, '_-');\n     * // => 'abc_-_'\n     *\n     * _.padRight('abc', 3);\n     * // => 'abc'\n     */\n    var padRight = createPadDir(true);\n\n    /**\n     * Converts `string` to an integer of the specified radix. If `radix` is\n     * `undefined` or `0`, a `radix` of `10` is used unless `value` is a hexadecimal,\n     * in which case a `radix` of `16` is used.\n     *\n     * **Note:** This method aligns with the [ES5 implementation](https://es5.github.io/#E)\n     * of `parseInt`.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} string The string to convert.\n     * @param {number} [radix] The radix to interpret `value` by.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {number} Returns the converted integer.\n     * @example\n     *\n     * _.parseInt('08');\n     * // => 8\n     *\n     * _.map(['6', '08', '10'], _.parseInt);\n     * // => [6, 8, 10]\n     */\n    function parseInt(string, radix, guard) {\n      if (guard && isIterateeCall(string, radix, guard)) {\n        radix = 0;\n      }\n      return nativeParseInt(string, radix);\n    }\n    // Fallback for environments with pre-ES5 implementations.\n    if (nativeParseInt(whitespace + '08') != 8) {\n      parseInt = function(string, radix, guard) {\n        // Firefox < 21 and Opera < 15 follow ES3 for `parseInt`.\n        // Chrome fails to trim leading <BOM> whitespace characters.\n        // See https://code.google.com/p/v8/issues/detail?id=3109 for more details.\n        if (guard ? isIterateeCall(string, radix, guard) : radix == null) {\n          radix = 0;\n        } else if (radix) {\n          radix = +radix;\n        }\n        string = trim(string);\n        return nativeParseInt(string, radix || (reHexPrefix.test(string) ? 16 : 10));\n      };\n    }\n\n    /**\n     * Repeats the given string `n` times.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to repeat.\n     * @param {number} [n=0] The number of times to repeat the string.\n     * @returns {string} Returns the repeated string.\n     * @example\n     *\n     * _.repeat('*', 3);\n     * // => '***'\n     *\n     * _.repeat('abc', 2);\n     * // => 'abcabc'\n     *\n     * _.repeat('abc', 0);\n     * // => ''\n     */\n    function repeat(string, n) {\n      var result = '';\n      string = baseToString(string);\n      n = +n;\n      if (n < 1 || !string || !nativeIsFinite(n)) {\n        return result;\n      }\n      // Leverage the exponentiation by squaring algorithm for a faster repeat.\n      // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.\n      do {\n        if (n % 2) {\n          result += string;\n        }\n        n = floor(n / 2);\n        string += string;\n      } while (n);\n\n      return result;\n    }\n\n    /**\n     * Converts `string` to [snake case](https://en.wikipedia.org/wiki/Snake_case).\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to convert.\n     * @returns {string} Returns the snake cased string.\n     * @example\n     *\n     * _.snakeCase('Foo Bar');\n     * // => 'foo_bar'\n     *\n     * _.snakeCase('fooBar');\n     * // => 'foo_bar'\n     *\n     * _.snakeCase('--foo-bar');\n     * // => 'foo_bar'\n     */\n    var snakeCase = createCompounder(function(result, word, index) {\n      return result + (index ? '_' : '') + word.toLowerCase();\n    });\n\n    /**\n     * Converts `string` to [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to convert.\n     * @returns {string} Returns the start cased string.\n     * @example\n     *\n     * _.startCase('--foo-bar');\n     * // => 'Foo Bar'\n     *\n     * _.startCase('fooBar');\n     * // => 'Foo Bar'\n     *\n     * _.startCase('__foo_bar__');\n     * // => 'Foo Bar'\n     */\n    var startCase = createCompounder(function(result, word, index) {\n      return result + (index ? ' ' : '') + (word.charAt(0).toUpperCase() + word.slice(1));\n    });\n\n    /**\n     * Checks if `string` starts with the given target string.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to search.\n     * @param {string} [target] The string to search for.\n     * @param {number} [position=0] The position to search from.\n     * @returns {boolean} Returns `true` if `string` starts with `target`, else `false`.\n     * @example\n     *\n     * _.startsWith('abc', 'a');\n     * // => true\n     *\n     * _.startsWith('abc', 'b');\n     * // => false\n     *\n     * _.startsWith('abc', 'b', 1);\n     * // => true\n     */\n    function startsWith(string, target, position) {\n      string = baseToString(string);\n      position = position == null\n        ? 0\n        : nativeMin(position < 0 ? 0 : (+position || 0), string.length);\n\n      return string.lastIndexOf(target, position) == position;\n    }\n\n    /**\n     * Creates a compiled template function that can interpolate data properties\n     * in \"interpolate\" delimiters, HTML-escape interpolated data properties in\n     * \"escape\" delimiters, and execute JavaScript in \"evaluate\" delimiters. Data\n     * properties may be accessed as free variables in the template. If a setting\n     * object is provided it takes precedence over `_.templateSettings` values.\n     *\n     * **Note:** In the development build `_.template` utilizes\n     * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)\n     * for easier debugging.\n     *\n     * For more information on precompiling templates see\n     * [lodash's custom builds documentation](https://lodash.com/custom-builds).\n     *\n     * For more information on Chrome extension sandboxes see\n     * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The template string.\n     * @param {Object} [options] The options object.\n     * @param {RegExp} [options.escape] The HTML \"escape\" delimiter.\n     * @param {RegExp} [options.evaluate] The \"evaluate\" delimiter.\n     * @param {Object} [options.imports] An object to import into the template as free variables.\n     * @param {RegExp} [options.interpolate] The \"interpolate\" delimiter.\n     * @param {string} [options.sourceURL] The sourceURL of the template's compiled source.\n     * @param {string} [options.variable] The data object variable name.\n     * @param- {Object} [otherOptions] Enables the legacy `options` param signature.\n     * @returns {Function} Returns the compiled template function.\n     * @example\n     *\n     * // using the \"interpolate\" delimiter to create a compiled template\n     * var compiled = _.template('hello <%= user %>!');\n     * compiled({ 'user': 'fred' });\n     * // => 'hello fred!'\n     *\n     * // using the HTML \"escape\" delimiter to escape data property values\n     * var compiled = _.template('<b><%- value %></b>');\n     * compiled({ 'value': '<script>' });\n     * // => '<b>&lt;script&gt;</b>'\n     *\n     * // using the \"evaluate\" delimiter to execute JavaScript and generate HTML\n     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');\n     * compiled({ 'users': ['fred', 'barney'] });\n     * // => '<li>fred</li><li>barney</li>'\n     *\n     * // using the internal `print` function in \"evaluate\" delimiters\n     * var compiled = _.template('<% print(\"hello \" + user); %>!');\n     * compiled({ 'user': 'barney' });\n     * // => 'hello barney!'\n     *\n     * // using the ES delimiter as an alternative to the default \"interpolate\" delimiter\n     * var compiled = _.template('hello ${ user }!');\n     * compiled({ 'user': 'pebbles' });\n     * // => 'hello pebbles!'\n     *\n     * // using custom template delimiters\n     * _.templateSettings.interpolate = /{{([\\s\\S]+?)}}/g;\n     * var compiled = _.template('hello {{ user }}!');\n     * compiled({ 'user': 'mustache' });\n     * // => 'hello mustache!'\n     *\n     * // using backslashes to treat delimiters as plain text\n     * var compiled = _.template('<%= \"\\\\<%- value %\\\\>\" %>');\n     * compiled({ 'value': 'ignored' });\n     * // => '<%- value %>'\n     *\n     * // using the `imports` option to import `jQuery` as `jq`\n     * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';\n     * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });\n     * compiled({ 'users': ['fred', 'barney'] });\n     * // => '<li>fred</li><li>barney</li>'\n     *\n     * // using the `sourceURL` option to specify a custom sourceURL for the template\n     * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });\n     * compiled(data);\n     * // => find the source of \"greeting.jst\" under the Sources tab or Resources panel of the web inspector\n     *\n     * // using the `variable` option to ensure a with-statement isn't used in the compiled template\n     * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });\n     * compiled.source;\n     * // => function(data) {\n     * //   var __t, __p = '';\n     * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';\n     * //   return __p;\n     * // }\n     *\n     * // using the `source` property to inline compiled templates for meaningful\n     * // line numbers in error messages and a stack trace\n     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\\\n     *   var JST = {\\\n     *     \"main\": ' + _.template(mainText).source + '\\\n     *   };\\\n     * ');\n     */\n    function template(string, options, otherOptions) {\n      // Based on John Resig's `tmpl` implementation (http://ejohn.org/blog/javascript-micro-templating/)\n      // and Laura Doktorova's doT.js (https://github.com/olado/doT).\n      var settings = lodash.templateSettings;\n\n      if (otherOptions && isIterateeCall(string, options, otherOptions)) {\n        options = otherOptions = null;\n      }\n      string = baseToString(string);\n      options = baseAssign(baseAssign({}, otherOptions || options), settings, assignOwnDefaults);\n\n      var imports = baseAssign(baseAssign({}, options.imports), settings.imports, assignOwnDefaults),\n          importsKeys = keys(imports),\n          importsValues = baseValues(imports, importsKeys);\n\n      var isEscaping,\n          isEvaluating,\n          index = 0,\n          interpolate = options.interpolate || reNoMatch,\n          source = \"__p += '\";\n\n      // Compile the regexp to match each delimiter.\n      var reDelimiters = RegExp(\n        (options.escape || reNoMatch).source + '|' +\n        interpolate.source + '|' +\n        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +\n        (options.evaluate || reNoMatch).source + '|$'\n      , 'g');\n\n      // Use a sourceURL for easier debugging.\n      var sourceURL = '//# sourceURL=' +\n        ('sourceURL' in options\n          ? options.sourceURL\n          : ('lodash.templateSources[' + (++templateCounter) + ']')\n        ) + '\\n';\n\n      string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {\n        interpolateValue || (interpolateValue = esTemplateValue);\n\n        // Escape characters that can't be included in string literals.\n        source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);\n\n        // Replace delimiters with snippets.\n        if (escapeValue) {\n          isEscaping = true;\n          source += \"' +\\n__e(\" + escapeValue + \") +\\n'\";\n        }\n        if (evaluateValue) {\n          isEvaluating = true;\n          source += \"';\\n\" + evaluateValue + \";\\n__p += '\";\n        }\n        if (interpolateValue) {\n          source += \"' +\\n((__t = (\" + interpolateValue + \")) == null ? '' : __t) +\\n'\";\n        }\n        index = offset + match.length;\n\n        // The JS engine embedded in Adobe products requires returning the `match`\n        // string in order to produce the correct `offset` value.\n        return match;\n      });\n\n      source += \"';\\n\";\n\n      // If `variable` is not specified wrap a with-statement around the generated\n      // code to add the data object to the top of the scope chain.\n      var variable = options.variable;\n      if (!variable) {\n        source = 'with (obj) {\\n' + source + '\\n}\\n';\n      }\n      // Cleanup code by stripping empty strings.\n      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)\n        .replace(reEmptyStringMiddle, '$1')\n        .replace(reEmptyStringTrailing, '$1;');\n\n      // Frame code as the function body.\n      source = 'function(' + (variable || 'obj') + ') {\\n' +\n        (variable\n          ? ''\n          : 'obj || (obj = {});\\n'\n        ) +\n        \"var __t, __p = ''\" +\n        (isEscaping\n           ? ', __e = _.escape'\n           : ''\n        ) +\n        (isEvaluating\n          ? ', __j = Array.prototype.join;\\n' +\n            \"function print() { __p += __j.call(arguments, '') }\\n\"\n          : ';\\n'\n        ) +\n        source +\n        'return __p\\n}';\n\n      var result = attempt(function() {\n        return Function(importsKeys, sourceURL + 'return ' + source).apply(undefined, importsValues);\n      });\n\n      // Provide the compiled function's source by its `toString` method or\n      // the `source` property as a convenience for inlining compiled templates.\n      result.source = source;\n      if (isError(result)) {\n        throw result;\n      }\n      return result;\n    }\n\n    /**\n     * Removes leading and trailing whitespace or specified characters from `string`.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to trim.\n     * @param {string} [chars=whitespace] The characters to trim.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {string} Returns the trimmed string.\n     * @example\n     *\n     * _.trim('  abc  ');\n     * // => 'abc'\n     *\n     * _.trim('-_-abc-_-', '_-');\n     * // => 'abc'\n     *\n     * _.map(['  foo  ', '  bar  '], _.trim);\n     * // => ['foo', 'bar']\n     */\n    function trim(string, chars, guard) {\n      var value = string;\n      string = baseToString(string);\n      if (!string) {\n        return string;\n      }\n      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {\n        return string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1);\n      }\n      chars = (chars + '');\n      return string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1);\n    }\n\n    /**\n     * Removes leading whitespace or specified characters from `string`.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to trim.\n     * @param {string} [chars=whitespace] The characters to trim.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {string} Returns the trimmed string.\n     * @example\n     *\n     * _.trimLeft('  abc  ');\n     * // => 'abc  '\n     *\n     * _.trimLeft('-_-abc-_-', '_-');\n     * // => 'abc-_-'\n     */\n    function trimLeft(string, chars, guard) {\n      var value = string;\n      string = baseToString(string);\n      if (!string) {\n        return string;\n      }\n      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {\n        return string.slice(trimmedLeftIndex(string));\n      }\n      return string.slice(charsLeftIndex(string, (chars + '')));\n    }\n\n    /**\n     * Removes trailing whitespace or specified characters from `string`.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to trim.\n     * @param {string} [chars=whitespace] The characters to trim.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {string} Returns the trimmed string.\n     * @example\n     *\n     * _.trimRight('  abc  ');\n     * // => '  abc'\n     *\n     * _.trimRight('-_-abc-_-', '_-');\n     * // => '-_-abc'\n     */\n    function trimRight(string, chars, guard) {\n      var value = string;\n      string = baseToString(string);\n      if (!string) {\n        return string;\n      }\n      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {\n        return string.slice(0, trimmedRightIndex(string) + 1);\n      }\n      return string.slice(0, charsRightIndex(string, (chars + '')) + 1);\n    }\n\n    /**\n     * Truncates `string` if it is longer than the given maximum string length.\n     * The last characters of the truncated string are replaced with the omission\n     * string which defaults to \"...\".\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to truncate.\n     * @param {Object|number} [options] The options object or maximum string length.\n     * @param {number} [options.length=30] The maximum string length.\n     * @param {string} [options.omission='...'] The string to indicate text is omitted.\n     * @param {RegExp|string} [options.separator] The separator pattern to truncate to.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {string} Returns the truncated string.\n     * @example\n     *\n     * _.trunc('hi-diddly-ho there, neighborino');\n     * // => 'hi-diddly-ho there, neighbo...'\n     *\n     * _.trunc('hi-diddly-ho there, neighborino', 24);\n     * // => 'hi-diddly-ho there, n...'\n     *\n     * _.trunc('hi-diddly-ho there, neighborino', {\n     *   'length': 24,\n     *   'separator': ' '\n     * });\n     * // => 'hi-diddly-ho there,...'\n     *\n     * _.trunc('hi-diddly-ho there, neighborino', {\n     *   'length': 24,\n     *   'separator': /,? +/\n     * });\n     * // => 'hi-diddly-ho there...'\n     *\n     * _.trunc('hi-diddly-ho there, neighborino', {\n     *   'omission': ' [...]'\n     * });\n     * // => 'hi-diddly-ho there, neig [...]'\n     */\n    function trunc(string, options, guard) {\n      if (guard && isIterateeCall(string, options, guard)) {\n        options = null;\n      }\n      var length = DEFAULT_TRUNC_LENGTH,\n          omission = DEFAULT_TRUNC_OMISSION;\n\n      if (options != null) {\n        if (isObject(options)) {\n          var separator = 'separator' in options ? options.separator : separator;\n          length = 'length' in options ? (+options.length || 0) : length;\n          omission = 'omission' in options ? baseToString(options.omission) : omission;\n        } else {\n          length = +options || 0;\n        }\n      }\n      string = baseToString(string);\n      if (length >= string.length) {\n        return string;\n      }\n      var end = length - omission.length;\n      if (end < 1) {\n        return omission;\n      }\n      var result = string.slice(0, end);\n      if (separator == null) {\n        return result + omission;\n      }\n      if (isRegExp(separator)) {\n        if (string.slice(end).search(separator)) {\n          var match,\n              newEnd,\n              substring = string.slice(0, end);\n\n          if (!separator.global) {\n            separator = RegExp(separator.source, (reFlags.exec(separator) || '') + 'g');\n          }\n          separator.lastIndex = 0;\n          while ((match = separator.exec(substring))) {\n            newEnd = match.index;\n          }\n          result = result.slice(0, newEnd == null ? end : newEnd);\n        }\n      } else if (string.indexOf(separator, end) != end) {\n        var index = result.lastIndexOf(separator);\n        if (index > -1) {\n          result = result.slice(0, index);\n        }\n      }\n      return result + omission;\n    }\n\n    /**\n     * The inverse of `_.escape`; this method converts the HTML entities\n     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, and `&#96;` in `string` to their\n     * corresponding characters.\n     *\n     * **Note:** No other HTML entities are unescaped. To unescape additional HTML\n     * entities use a third-party library like [_he_](https://mths.be/he).\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to unescape.\n     * @returns {string} Returns the unescaped string.\n     * @example\n     *\n     * _.unescape('fred, barney, &amp; pebbles');\n     * // => 'fred, barney, & pebbles'\n     */\n    function unescape(string) {\n      string = baseToString(string);\n      return (string && reHasEscapedHtml.test(string))\n        ? string.replace(reEscapedHtml, unescapeHtmlChar)\n        : string;\n    }\n\n    /**\n     * Splits `string` into an array of its words.\n     *\n     * @static\n     * @memberOf _\n     * @category String\n     * @param {string} [string=''] The string to inspect.\n     * @param {RegExp|string} [pattern] The pattern to match words.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Array} Returns the words of `string`.\n     * @example\n     *\n     * _.words('fred, barney, & pebbles');\n     * // => ['fred', 'barney', 'pebbles']\n     *\n     * _.words('fred, barney, & pebbles', /[^, ]+/g);\n     * // => ['fred', 'barney', '&', 'pebbles']\n     */\n    function words(string, pattern, guard) {\n      if (guard && isIterateeCall(string, pattern, guard)) {\n        pattern = null;\n      }\n      string = baseToString(string);\n      return string.match(pattern || reWords) || [];\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Attempts to invoke `func`, returning either the result or the caught error\n     * object. Any additional arguments are provided to `func` when it is invoked.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {Function} func The function to attempt.\n     * @returns {*} Returns the `func` result or error object.\n     * @example\n     *\n     * // avoid throwing errors for invalid selectors\n     * var elements = _.attempt(function(selector) {\n     *   return document.querySelectorAll(selector);\n     * }, '>_>');\n     *\n     * if (_.isError(elements)) {\n     *   elements = [];\n     * }\n     */\n    var attempt = restParam(function(func, args) {\n      try {\n        return func.apply(undefined, args);\n      } catch(e) {\n        return isError(e) ? e : new Error(e);\n      }\n    });\n\n    /**\n     * Creates a function that invokes `func` with the `this` binding of `thisArg`\n     * and arguments of the created function. If `func` is a property name the\n     * created callback returns the property value for a given element. If `func`\n     * is an object the created callback returns `true` for elements that contain\n     * the equivalent object properties, otherwise it returns `false`.\n     *\n     * @static\n     * @memberOf _\n     * @alias iteratee\n     * @category Utility\n     * @param {*} [func=_.identity] The value to convert to a callback.\n     * @param {*} [thisArg] The `this` binding of `func`.\n     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.\n     * @returns {Function} Returns the callback.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36 },\n     *   { 'user': 'fred',   'age': 40 }\n     * ];\n     *\n     * // wrap to create custom callback shorthands\n     * _.callback = _.wrap(_.callback, function(callback, func, thisArg) {\n     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(func);\n     *   if (!match) {\n     *     return callback(func, thisArg);\n     *   }\n     *   return function(object) {\n     *     return match[2] == 'gt'\n     *       ? object[match[1]] > match[3]\n     *       : object[match[1]] < match[3];\n     *   };\n     * });\n     *\n     * _.filter(users, 'age__gt36');\n     * // => [{ 'user': 'fred', 'age': 40 }]\n     */\n    function callback(func, thisArg, guard) {\n      if (guard && isIterateeCall(func, thisArg, guard)) {\n        thisArg = null;\n      }\n      return isObjectLike(func)\n        ? matches(func)\n        : baseCallback(func, thisArg);\n    }\n\n    /**\n     * Creates a function that returns `value`.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {*} value The value to return from the new function.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * var object = { 'user': 'fred' };\n     * var getter = _.constant(object);\n     *\n     * getter() === object;\n     * // => true\n     */\n    function constant(value) {\n      return function() {\n        return value;\n      };\n    }\n\n    /**\n     * This method returns the first argument provided to it.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {*} value Any value.\n     * @returns {*} Returns `value`.\n     * @example\n     *\n     * var object = { 'user': 'fred' };\n     *\n     * _.identity(object) === object;\n     * // => true\n     */\n    function identity(value) {\n      return value;\n    }\n\n    /**\n     * Creates a function which performs a deep comparison between a given object\n     * and `source`, returning `true` if the given object has equivalent property\n     * values, else `false`.\n     *\n     * **Note:** This method supports comparing arrays, booleans, `Date` objects,\n     * numbers, `Object` objects, regexes, and strings. Objects are compared by\n     * their own, not inherited, enumerable properties. For comparing a single\n     * own or inherited property value see `_.matchesProperty`.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {Object} source The object of property values to match.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36, 'active': true },\n     *   { 'user': 'fred',   'age': 40, 'active': false }\n     * ];\n     *\n     * _.filter(users, _.matches({ 'age': 40, 'active': false }));\n     * // => [{ 'user': 'fred', 'age': 40, 'active': false }]\n     */\n    function matches(source) {\n      return baseMatches(baseClone(source, true));\n    }\n\n    /**\n     * Creates a function which compares the property value of `key` on a given\n     * object to `value`.\n     *\n     * **Note:** This method supports comparing arrays, booleans, `Date` objects,\n     * numbers, `Object` objects, regexes, and strings. Objects are compared by\n     * their own, not inherited, enumerable properties.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {string} key The key of the property to get.\n     * @param {*} value The value to compare.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'barney' },\n     *   { 'user': 'fred' }\n     * ];\n     *\n     * _.find(users, _.matchesProperty('user', 'fred'));\n     * // => { 'user': 'fred' }\n     */\n    function matchesProperty(key, value) {\n      return baseMatchesProperty(key + '', baseClone(value, true));\n    }\n\n    /**\n     * Adds all own enumerable function properties of a source object to the\n     * destination object. If `object` is a function then methods are added to\n     * its prototype as well.\n     *\n     * **Note:** Use `_.runInContext` to create a pristine `lodash` function\n     * for mixins to avoid conflicts caused by modifying the original.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {Function|Object} [object=this] object The destination object.\n     * @param {Object} source The object of functions to add.\n     * @param {Object} [options] The options object.\n     * @param {boolean} [options.chain=true] Specify whether the functions added\n     *  are chainable.\n     * @returns {Function|Object} Returns `object`.\n     * @example\n     *\n     * function vowels(string) {\n     *   return _.filter(string, function(v) {\n     *     return /[aeiou]/i.test(v);\n     *   });\n     * }\n     *\n     * // use `_.runInContext` to avoid conflicts (esp. in Node.js)\n     * var _ = require('lodash').runInContext();\n     *\n     * _.mixin({ 'vowels': vowels });\n     * _.vowels('fred');\n     * // => ['e']\n     *\n     * _('fred').vowels().value();\n     * // => ['e']\n     *\n     * _.mixin({ 'vowels': vowels }, { 'chain': false });\n     * _('fred').vowels();\n     * // => ['e']\n     */\n    function mixin(object, source, options) {\n      if (options == null) {\n        var isObj = isObject(source),\n            props = isObj && keys(source),\n            methodNames = props && props.length && baseFunctions(source, props);\n\n        if (!(methodNames ? methodNames.length : isObj)) {\n          methodNames = false;\n          options = source;\n          source = object;\n          object = this;\n        }\n      }\n      if (!methodNames) {\n        methodNames = baseFunctions(source, keys(source));\n      }\n      var chain = true,\n          index = -1,\n          isFunc = isFunction(object),\n          length = methodNames.length;\n\n      if (options === false) {\n        chain = false;\n      } else if (isObject(options) && 'chain' in options) {\n        chain = options.chain;\n      }\n      while (++index < length) {\n        var methodName = methodNames[index],\n            func = source[methodName];\n\n        object[methodName] = func;\n        if (isFunc) {\n          object.prototype[methodName] = (function(func) {\n            return function() {\n              var chainAll = this.__chain__;\n              if (chain || chainAll) {\n                var result = object(this.__wrapped__),\n                    actions = result.__actions__ = arrayCopy(this.__actions__);\n\n                actions.push({ 'func': func, 'args': arguments, 'thisArg': object });\n                result.__chain__ = chainAll;\n                return result;\n              }\n              var args = [this.value()];\n              push.apply(args, arguments);\n              return func.apply(object, args);\n            };\n          }(func));\n        }\n      }\n      return object;\n    }\n\n    /**\n     * Reverts the `_` variable to its previous value and returns a reference to\n     * the `lodash` function.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @returns {Function} Returns the `lodash` function.\n     * @example\n     *\n     * var lodash = _.noConflict();\n     */\n    function noConflict() {\n      context._ = oldDash;\n      return this;\n    }\n\n    /**\n     * A no-operation function which returns `undefined` regardless of the\n     * arguments it receives.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @example\n     *\n     * var object = { 'user': 'fred' };\n     *\n     * _.noop(object) === undefined;\n     * // => true\n     */\n    function noop() {\n      // No operation performed.\n    }\n\n    /**\n     * Creates a function which returns the property value of `key` on a given object.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {string} key The key of the property to get.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * var users = [\n     *   { 'user': 'fred' },\n     *   { 'user': 'barney' }\n     * ];\n     *\n     * var getName = _.property('user');\n     *\n     * _.map(users, getName);\n     * // => ['fred', 'barney']\n     *\n     * _.pluck(_.sortBy(users, getName), 'user');\n     * // => ['barney', 'fred']\n     */\n    function property(key) {\n      return baseProperty(key + '');\n    }\n\n    /**\n     * The opposite of `_.property`; this method creates a function which returns\n     * the property value of a given key on `object`.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {Object} object The object to inspect.\n     * @returns {Function} Returns the new function.\n     * @example\n     *\n     * var object = { 'a': 3, 'b': 1, 'c': 2 };\n     *\n     * _.map(['a', 'c'], _.propertyOf(object));\n     * // => [3, 2]\n     *\n     * _.sortBy(['a', 'b', 'c'], _.propertyOf(object));\n     * // => ['b', 'c', 'a']\n     */\n    function propertyOf(object) {\n      return function(key) {\n        return object == null ? undefined : object[key];\n      };\n    }\n\n    /**\n     * Creates an array of numbers (positive and/or negative) progressing from\n     * `start` up to, but not including, `end`. If `end` is not specified it is\n     * set to `start` with `start` then set to `0`. If `start` is less than `end`\n     * a zero-length range is created unless a negative `step` is specified.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {number} [start=0] The start of the range.\n     * @param {number} end The end of the range.\n     * @param {number} [step=1] The value to increment or decrement by.\n     * @returns {Array} Returns the new array of numbers.\n     * @example\n     *\n     * _.range(4);\n     * // => [0, 1, 2, 3]\n     *\n     * _.range(1, 5);\n     * // => [1, 2, 3, 4]\n     *\n     * _.range(0, 20, 5);\n     * // => [0, 5, 10, 15]\n     *\n     * _.range(0, -4, -1);\n     * // => [0, -1, -2, -3]\n     *\n     * _.range(1, 4, 0);\n     * // => [1, 1, 1]\n     *\n     * _.range(0);\n     * // => []\n     */\n    function range(start, end, step) {\n      if (step && isIterateeCall(start, end, step)) {\n        end = step = null;\n      }\n      start = +start || 0;\n      step = step == null ? 1 : (+step || 0);\n\n      if (end == null) {\n        end = start;\n        start = 0;\n      } else {\n        end = +end || 0;\n      }\n      // Use `Array(length)` so engines like Chakra and V8 avoid slower modes.\n      // See https://youtu.be/XAqIpGU8ZZk#t=17m25s for more details.\n      var index = -1,\n          length = nativeMax(ceil((end - start) / (step || 1)), 0),\n          result = Array(length);\n\n      while (++index < length) {\n        result[index] = start;\n        start += step;\n      }\n      return result;\n    }\n\n    /**\n     * Invokes the iteratee function `n` times, returning an array of the results\n     * of each invocation. The `iteratee` is bound to `thisArg` and invoked with\n     * one argument; (index).\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {number} n The number of times to invoke `iteratee`.\n     * @param {Function} [iteratee=_.identity] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {Array} Returns the array of results.\n     * @example\n     *\n     * var diceRolls = _.times(3, _.partial(_.random, 1, 6, false));\n     * // => [3, 6, 4]\n     *\n     * _.times(3, function(n) {\n     *   mage.castSpell(n);\n     * });\n     * // => invokes `mage.castSpell(n)` three times with `n` of `0`, `1`, and `2` respectively\n     *\n     * _.times(3, function(n) {\n     *   this.cast(n);\n     * }, mage);\n     * // => also invokes `mage.castSpell(n)` three times\n     */\n    function times(n, iteratee, thisArg) {\n      n = +n;\n\n      // Exit early to avoid a JSC JIT bug in Safari 8\n      // where `Array(0)` is treated as `Array(1)`.\n      if (n < 1 || !nativeIsFinite(n)) {\n        return [];\n      }\n      var index = -1,\n          result = Array(nativeMin(n, MAX_ARRAY_LENGTH));\n\n      iteratee = bindCallback(iteratee, thisArg, 1);\n      while (++index < n) {\n        if (index < MAX_ARRAY_LENGTH) {\n          result[index] = iteratee(index);\n        } else {\n          iteratee(index);\n        }\n      }\n      return result;\n    }\n\n    /**\n     * Generates a unique ID. If `prefix` is provided the ID is appended to it.\n     *\n     * @static\n     * @memberOf _\n     * @category Utility\n     * @param {string} [prefix] The value to prefix the ID with.\n     * @returns {string} Returns the unique ID.\n     * @example\n     *\n     * _.uniqueId('contact_');\n     * // => 'contact_104'\n     *\n     * _.uniqueId();\n     * // => '105'\n     */\n    function uniqueId(prefix) {\n      var id = ++idCounter;\n      return baseToString(prefix) + id;\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * Adds two numbers.\n     *\n     * @static\n     * @memberOf _\n     * @category Math\n     * @param {number} augend The first number to add.\n     * @param {number} addend The second number to add.\n     * @returns {number} Returns the sum.\n     * @example\n     *\n     * _.add(6, 4);\n     * // => 10\n     */\n    function add(augend, addend) {\n      return augend + addend;\n    }\n\n    /**\n     * Gets the maximum value of `collection`. If `collection` is empty or falsey\n     * `-Infinity` is returned. If an iteratee function is provided it is invoked\n     * for each value in `collection` to generate the criterion by which the value\n     * is ranked. The `iteratee` is bound to `thisArg` and invoked with three\n     * arguments: (value, index, collection).\n     *\n     * If a property name is provided for `iteratee` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `iteratee` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Math\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [iteratee] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {*} Returns the maximum value.\n     * @example\n     *\n     * _.max([4, 2, 8, 6]);\n     * // => 8\n     *\n     * _.max([]);\n     * // => -Infinity\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36 },\n     *   { 'user': 'fred',   'age': 40 }\n     * ];\n     *\n     * _.max(users, function(chr) {\n     *   return chr.age;\n     * });\n     * // => { 'user': 'fred', 'age': 40 }\n     *\n     * // using the `_.property` callback shorthand\n     * _.max(users, 'age');\n     * // => { 'user': 'fred', 'age': 40 }\n     */\n    var max = createExtremum(arrayMax);\n\n    /**\n     * Gets the minimum value of `collection`. If `collection` is empty or falsey\n     * `Infinity` is returned. If an iteratee function is provided it is invoked\n     * for each value in `collection` to generate the criterion by which the value\n     * is ranked. The `iteratee` is bound to `thisArg` and invoked with three\n     * arguments: (value, index, collection).\n     *\n     * If a property name is provided for `iteratee` the created `_.property`\n     * style callback returns the property value of the given element.\n     *\n     * If a value is also provided for `thisArg` the created `_.matchesProperty`\n     * style callback returns `true` for elements that have a matching property\n     * value, else `false`.\n     *\n     * If an object is provided for `iteratee` the created `_.matches` style\n     * callback returns `true` for elements that have the properties of the given\n     * object, else `false`.\n     *\n     * @static\n     * @memberOf _\n     * @category Math\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [iteratee] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {*} Returns the minimum value.\n     * @example\n     *\n     * _.min([4, 2, 8, 6]);\n     * // => 2\n     *\n     * _.min([]);\n     * // => Infinity\n     *\n     * var users = [\n     *   { 'user': 'barney', 'age': 36 },\n     *   { 'user': 'fred',   'age': 40 }\n     * ];\n     *\n     * _.min(users, function(chr) {\n     *   return chr.age;\n     * });\n     * // => { 'user': 'barney', 'age': 36 }\n     *\n     * // using the `_.property` callback shorthand\n     * _.min(users, 'age');\n     * // => { 'user': 'barney', 'age': 36 }\n     */\n    var min = createExtremum(arrayMin, true);\n\n    /**\n     * Gets the sum of the values in `collection`.\n     *\n     * @static\n     * @memberOf _\n     * @category Math\n     * @param {Array|Object|string} collection The collection to iterate over.\n     * @param {Function|Object|string} [iteratee] The function invoked per iteration.\n     * @param {*} [thisArg] The `this` binding of `iteratee`.\n     * @returns {number} Returns the sum.\n     * @example\n     *\n     * _.sum([4, 6]);\n     * // => 10\n     *\n     * _.sum({ 'a': 4, 'b': 6 });\n     * // => 10\n     *\n     * var objects = [\n     *   { 'n': 4 },\n     *   { 'n': 6 }\n     * ];\n     *\n     * _.sum(objects, function(object) {\n     *   return object.n;\n     * });\n     * // => 10\n     *\n     * // using the `_.property` callback shorthand\n     * _.sum(objects, 'n');\n     * // => 10\n     */\n    function sum(collection, iteratee, thisArg) {\n      if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {\n        iteratee = null;\n      }\n      var func = getCallback(),\n          noIteratee = iteratee == null;\n\n      if (!(func === baseCallback && noIteratee)) {\n        noIteratee = false;\n        iteratee = func(iteratee, thisArg, 3);\n      }\n      return noIteratee\n        ? arraySum(isArray(collection) ? collection : toIterable(collection))\n        : baseSum(collection, iteratee);\n    }\n\n    /*------------------------------------------------------------------------*/\n\n    // Ensure wrappers are instances of `baseLodash`.\n    lodash.prototype = baseLodash.prototype;\n\n    LodashWrapper.prototype = baseCreate(baseLodash.prototype);\n    LodashWrapper.prototype.constructor = LodashWrapper;\n\n    LazyWrapper.prototype = baseCreate(baseLodash.prototype);\n    LazyWrapper.prototype.constructor = LazyWrapper;\n\n    // Add functions to the `Map` cache.\n    MapCache.prototype['delete'] = mapDelete;\n    MapCache.prototype.get = mapGet;\n    MapCache.prototype.has = mapHas;\n    MapCache.prototype.set = mapSet;\n\n    // Add functions to the `Set` cache.\n    SetCache.prototype.push = cachePush;\n\n    // Assign cache to `_.memoize`.\n    memoize.Cache = MapCache;\n\n    // Add functions that return wrapped values when chaining.\n    lodash.after = after;\n    lodash.ary = ary;\n    lodash.assign = assign;\n    lodash.at = at;\n    lodash.before = before;\n    lodash.bind = bind;\n    lodash.bindAll = bindAll;\n    lodash.bindKey = bindKey;\n    lodash.callback = callback;\n    lodash.chain = chain;\n    lodash.chunk = chunk;\n    lodash.compact = compact;\n    lodash.constant = constant;\n    lodash.countBy = countBy;\n    lodash.create = create;\n    lodash.curry = curry;\n    lodash.curryRight = curryRight;\n    lodash.debounce = debounce;\n    lodash.defaults = defaults;\n    lodash.defer = defer;\n    lodash.delay = delay;\n    lodash.difference = difference;\n    lodash.drop = drop;\n    lodash.dropRight = dropRight;\n    lodash.dropRightWhile = dropRightWhile;\n    lodash.dropWhile = dropWhile;\n    lodash.fill = fill;\n    lodash.filter = filter;\n    lodash.flatten = flatten;\n    lodash.flattenDeep = flattenDeep;\n    lodash.flow = flow;\n    lodash.flowRight = flowRight;\n    lodash.forEach = forEach;\n    lodash.forEachRight = forEachRight;\n    lodash.forIn = forIn;\n    lodash.forInRight = forInRight;\n    lodash.forOwn = forOwn;\n    lodash.forOwnRight = forOwnRight;\n    lodash.functions = functions;\n    lodash.groupBy = groupBy;\n    lodash.indexBy = indexBy;\n    lodash.initial = initial;\n    lodash.intersection = intersection;\n    lodash.invert = invert;\n    lodash.invoke = invoke;\n    lodash.keys = keys;\n    lodash.keysIn = keysIn;\n    lodash.map = map;\n    lodash.mapValues = mapValues;\n    lodash.matches = matches;\n    lodash.matchesProperty = matchesProperty;\n    lodash.memoize = memoize;\n    lodash.merge = merge;\n    lodash.mixin = mixin;\n    lodash.negate = negate;\n    lodash.omit = omit;\n    lodash.once = once;\n    lodash.pairs = pairs;\n    lodash.partial = partial;\n    lodash.partialRight = partialRight;\n    lodash.partition = partition;\n    lodash.pick = pick;\n    lodash.pluck = pluck;\n    lodash.property = property;\n    lodash.propertyOf = propertyOf;\n    lodash.pull = pull;\n    lodash.pullAt = pullAt;\n    lodash.range = range;\n    lodash.rearg = rearg;\n    lodash.reject = reject;\n    lodash.remove = remove;\n    lodash.rest = rest;\n    lodash.restParam = restParam;\n    lodash.shuffle = shuffle;\n    lodash.slice = slice;\n    lodash.sortBy = sortBy;\n    lodash.sortByAll = sortByAll;\n    lodash.sortByOrder = sortByOrder;\n    lodash.spread = spread;\n    lodash.take = take;\n    lodash.takeRight = takeRight;\n    lodash.takeRightWhile = takeRightWhile;\n    lodash.takeWhile = takeWhile;\n    lodash.tap = tap;\n    lodash.throttle = throttle;\n    lodash.thru = thru;\n    lodash.times = times;\n    lodash.toArray = toArray;\n    lodash.toPlainObject = toPlainObject;\n    lodash.transform = transform;\n    lodash.union = union;\n    lodash.uniq = uniq;\n    lodash.unzip = unzip;\n    lodash.values = values;\n    lodash.valuesIn = valuesIn;\n    lodash.where = where;\n    lodash.without = without;\n    lodash.wrap = wrap;\n    lodash.xor = xor;\n    lodash.zip = zip;\n    lodash.zipObject = zipObject;\n\n    // Add aliases.\n    lodash.backflow = flowRight;\n    lodash.collect = map;\n    lodash.compose = flowRight;\n    lodash.each = forEach;\n    lodash.eachRight = forEachRight;\n    lodash.extend = assign;\n    lodash.iteratee = callback;\n    lodash.methods = functions;\n    lodash.object = zipObject;\n    lodash.select = filter;\n    lodash.tail = rest;\n    lodash.unique = uniq;\n\n    // Add functions to `lodash.prototype`.\n    mixin(lodash, lodash);\n\n    /*------------------------------------------------------------------------*/\n\n    // Add functions that return unwrapped values when chaining.\n    lodash.add = add;\n    lodash.attempt = attempt;\n    lodash.camelCase = camelCase;\n    lodash.capitalize = capitalize;\n    lodash.clone = clone;\n    lodash.cloneDeep = cloneDeep;\n    lodash.deburr = deburr;\n    lodash.endsWith = endsWith;\n    lodash.escape = escape;\n    lodash.escapeRegExp = escapeRegExp;\n    lodash.every = every;\n    lodash.find = find;\n    lodash.findIndex = findIndex;\n    lodash.findKey = findKey;\n    lodash.findLast = findLast;\n    lodash.findLastIndex = findLastIndex;\n    lodash.findLastKey = findLastKey;\n    lodash.findWhere = findWhere;\n    lodash.first = first;\n    lodash.has = has;\n    lodash.identity = identity;\n    lodash.includes = includes;\n    lodash.indexOf = indexOf;\n    lodash.inRange = inRange;\n    lodash.isArguments = isArguments;\n    lodash.isArray = isArray;\n    lodash.isBoolean = isBoolean;\n    lodash.isDate = isDate;\n    lodash.isElement = isElement;\n    lodash.isEmpty = isEmpty;\n    lodash.isEqual = isEqual;\n    lodash.isError = isError;\n    lodash.isFinite = isFinite;\n    lodash.isFunction = isFunction;\n    lodash.isMatch = isMatch;\n    lodash.isNaN = isNaN;\n    lodash.isNative = isNative;\n    lodash.isNull = isNull;\n    lodash.isNumber = isNumber;\n    lodash.isObject = isObject;\n    lodash.isPlainObject = isPlainObject;\n    lodash.isRegExp = isRegExp;\n    lodash.isString = isString;\n    lodash.isTypedArray = isTypedArray;\n    lodash.isUndefined = isUndefined;\n    lodash.kebabCase = kebabCase;\n    lodash.last = last;\n    lodash.lastIndexOf = lastIndexOf;\n    lodash.max = max;\n    lodash.min = min;\n    lodash.noConflict = noConflict;\n    lodash.noop = noop;\n    lodash.now = now;\n    lodash.pad = pad;\n    lodash.padLeft = padLeft;\n    lodash.padRight = padRight;\n    lodash.parseInt = parseInt;\n    lodash.random = random;\n    lodash.reduce = reduce;\n    lodash.reduceRight = reduceRight;\n    lodash.repeat = repeat;\n    lodash.result = result;\n    lodash.runInContext = runInContext;\n    lodash.size = size;\n    lodash.snakeCase = snakeCase;\n    lodash.some = some;\n    lodash.sortedIndex = sortedIndex;\n    lodash.sortedLastIndex = sortedLastIndex;\n    lodash.startCase = startCase;\n    lodash.startsWith = startsWith;\n    lodash.sum = sum;\n    lodash.template = template;\n    lodash.trim = trim;\n    lodash.trimLeft = trimLeft;\n    lodash.trimRight = trimRight;\n    lodash.trunc = trunc;\n    lodash.unescape = unescape;\n    lodash.uniqueId = uniqueId;\n    lodash.words = words;\n\n    // Add aliases.\n    lodash.all = every;\n    lodash.any = some;\n    lodash.contains = includes;\n    lodash.detect = find;\n    lodash.foldl = reduce;\n    lodash.foldr = reduceRight;\n    lodash.head = first;\n    lodash.include = includes;\n    lodash.inject = reduce;\n\n    mixin(lodash, (function() {\n      var source = {};\n      baseForOwn(lodash, function(func, methodName) {\n        if (!lodash.prototype[methodName]) {\n          source[methodName] = func;\n        }\n      });\n      return source;\n    }()), false);\n\n    /*------------------------------------------------------------------------*/\n\n    // Add functions capable of returning wrapped and unwrapped values when chaining.\n    lodash.sample = sample;\n\n    lodash.prototype.sample = function(n) {\n      if (!this.__chain__ && n == null) {\n        return sample(this.value());\n      }\n      return this.thru(function(value) {\n        return sample(value, n);\n      });\n    };\n\n    /*------------------------------------------------------------------------*/\n\n    /**\n     * The semantic version number.\n     *\n     * @static\n     * @memberOf _\n     * @type string\n     */\n    lodash.VERSION = VERSION;\n\n    // Assign default placeholders.\n    arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {\n      lodash[methodName].placeholder = lodash;\n    });\n\n    // Add `LazyWrapper` methods that accept an `iteratee` value.\n    arrayEach(['dropWhile', 'filter', 'map', 'takeWhile'], function(methodName, type) {\n      var isFilter = type != LAZY_MAP_FLAG,\n          isDropWhile = type == LAZY_DROP_WHILE_FLAG;\n\n      LazyWrapper.prototype[methodName] = function(iteratee, thisArg) {\n        var filtered = this.__filtered__,\n            result = (filtered && isDropWhile) ? new LazyWrapper(this) : this.clone(),\n            iteratees = result.__iteratees__ || (result.__iteratees__ = []);\n\n        iteratees.push({\n          'done': false,\n          'count': 0,\n          'index': 0,\n          'iteratee': getCallback(iteratee, thisArg, 1),\n          'limit': -1,\n          'type': type\n        });\n\n        result.__filtered__ = filtered || isFilter;\n        return result;\n      };\n    });\n\n    // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.\n    arrayEach(['drop', 'take'], function(methodName, index) {\n      var whileName = methodName + 'While';\n\n      LazyWrapper.prototype[methodName] = function(n) {\n        var filtered = this.__filtered__,\n            result = (filtered && !index) ? this.dropWhile() : this.clone();\n\n        n = n == null ? 1 : nativeMax(floor(n) || 0, 0);\n        if (filtered) {\n          if (index) {\n            result.__takeCount__ = nativeMin(result.__takeCount__, n);\n          } else {\n            last(result.__iteratees__).limit = n;\n          }\n        } else {\n          var views = result.__views__ || (result.__views__ = []);\n          views.push({ 'size': n, 'type': methodName + (result.__dir__ < 0 ? 'Right' : '') });\n        }\n        return result;\n      };\n\n      LazyWrapper.prototype[methodName + 'Right'] = function(n) {\n        return this.reverse()[methodName](n).reverse();\n      };\n\n      LazyWrapper.prototype[methodName + 'RightWhile'] = function(predicate, thisArg) {\n        return this.reverse()[whileName](predicate, thisArg).reverse();\n      };\n    });\n\n    // Add `LazyWrapper` methods for `_.first` and `_.last`.\n    arrayEach(['first', 'last'], function(methodName, index) {\n      var takeName = 'take' + (index ? 'Right' : '');\n\n      LazyWrapper.prototype[methodName] = function() {\n        return this[takeName](1).value()[0];\n      };\n    });\n\n    // Add `LazyWrapper` methods for `_.initial` and `_.rest`.\n    arrayEach(['initial', 'rest'], function(methodName, index) {\n      var dropName = 'drop' + (index ? '' : 'Right');\n\n      LazyWrapper.prototype[methodName] = function() {\n        return this[dropName](1);\n      };\n    });\n\n    // Add `LazyWrapper` methods for `_.pluck` and `_.where`.\n    arrayEach(['pluck', 'where'], function(methodName, index) {\n      var operationName = index ? 'filter' : 'map',\n          createCallback = index ? baseMatches : baseProperty;\n\n      LazyWrapper.prototype[methodName] = function(value) {\n        return this[operationName](createCallback(value));\n      };\n    });\n\n    LazyWrapper.prototype.compact = function() {\n      return this.filter(identity);\n    };\n\n    LazyWrapper.prototype.reject = function(predicate, thisArg) {\n      predicate = getCallback(predicate, thisArg, 1);\n      return this.filter(function(value) {\n        return !predicate(value);\n      });\n    };\n\n    LazyWrapper.prototype.slice = function(start, end) {\n      start = start == null ? 0 : (+start || 0);\n      var result = start < 0 ? this.takeRight(-start) : this.drop(start);\n\n      if (typeof end != 'undefined') {\n        end = (+end || 0);\n        result = end < 0 ? result.dropRight(-end) : result.take(end - start);\n      }\n      return result;\n    };\n\n    LazyWrapper.prototype.toArray = function() {\n      return this.drop(0);\n    };\n\n    // Add `LazyWrapper` methods to `lodash.prototype`.\n    baseForOwn(LazyWrapper.prototype, function(func, methodName) {\n      var lodashFunc = lodash[methodName];\n      if (!lodashFunc) {\n        return;\n      }\n      var checkIteratee = /^(?:filter|map|reject)|While$/.test(methodName),\n          retUnwrapped = /^(?:first|last)$/.test(methodName);\n\n      lodash.prototype[methodName] = function() {\n        var args = arguments,\n            length = args.length,\n            chainAll = this.__chain__,\n            value = this.__wrapped__,\n            isHybrid = !!this.__actions__.length,\n            isLazy = value instanceof LazyWrapper,\n            iteratee = args[0],\n            useLazy = isLazy || isArray(value);\n\n        if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {\n          // avoid lazy use if the iteratee has a `length` other than `1`\n          isLazy = useLazy = false;\n        }\n        var onlyLazy = isLazy && !isHybrid;\n        if (retUnwrapped && !chainAll) {\n          return onlyLazy\n            ? func.call(value)\n            : lodashFunc.call(lodash, this.value());\n        }\n        var interceptor = function(value) {\n          var otherArgs = [value];\n          push.apply(otherArgs, args);\n          return lodashFunc.apply(lodash, otherArgs);\n        };\n        if (useLazy) {\n          var wrapper = onlyLazy ? value : new LazyWrapper(this),\n              result = func.apply(wrapper, args);\n\n          if (!retUnwrapped && (isHybrid || result.__actions__)) {\n            var actions = result.__actions__ || (result.__actions__ = []);\n            actions.push({ 'func': thru, 'args': [interceptor], 'thisArg': lodash });\n          }\n          return new LodashWrapper(result, chainAll);\n        }\n        return this.thru(interceptor);\n      };\n    });\n\n    // Add `Array` and `String` methods to `lodash.prototype`.\n    arrayEach(['concat', 'join', 'pop', 'push', 'replace', 'shift', 'sort', 'splice', 'split', 'unshift'], function(methodName) {\n      var func = (/^(?:replace|split)$/.test(methodName) ? stringProto : arrayProto)[methodName],\n          chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',\n          retUnwrapped = /^(?:join|pop|replace|shift)$/.test(methodName);\n\n      lodash.prototype[methodName] = function() {\n        var args = arguments;\n        if (retUnwrapped && !this.__chain__) {\n          return func.apply(this.value(), args);\n        }\n        return this[chainName](function(value) {\n          return func.apply(value, args);\n        });\n      };\n    });\n\n    // Map minified function names to their real names.\n    baseForOwn(LazyWrapper.prototype, function(func, methodName) {\n      var lodashFunc = lodash[methodName];\n      if (lodashFunc) {\n        var key = lodashFunc.name,\n            names = realNames[key] || (realNames[key] = []);\n\n        names.push({ 'name': methodName, 'func': lodashFunc });\n      }\n    });\n\n    realNames[createHybridWrapper(null, BIND_KEY_FLAG).name] = [{ 'name': 'wrapper', 'func': null }];\n\n    // Add functions to the lazy wrapper.\n    LazyWrapper.prototype.clone = lazyClone;\n    LazyWrapper.prototype.reverse = lazyReverse;\n    LazyWrapper.prototype.value = lazyValue;\n\n    // Add chaining functions to the `lodash` wrapper.\n    lodash.prototype.chain = wrapperChain;\n    lodash.prototype.commit = wrapperCommit;\n    lodash.prototype.plant = wrapperPlant;\n    lodash.prototype.reverse = wrapperReverse;\n    lodash.prototype.toString = wrapperToString;\n    lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;\n\n    // Add function aliases to the `lodash` wrapper.\n    lodash.prototype.collect = lodash.prototype.map;\n    lodash.prototype.head = lodash.prototype.first;\n    lodash.prototype.select = lodash.prototype.filter;\n    lodash.prototype.tail = lodash.prototype.rest;\n\n    return lodash;\n  }\n\n  /*--------------------------------------------------------------------------*/\n\n  // Export lodash.\n  var _ = runInContext();\n\n  // Some AMD build optimizers like r.js check for condition patterns like the following:\n  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {\n    // Expose lodash to the global object when an AMD loader is present to avoid\n    // errors in cases where lodash is loaded by a script tag and not intended\n    // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for\n    // more details.\n    root._ = _;\n\n    // Define as an anonymous module so, through path mapping, it can be\n    // referenced as the \"underscore\" module.\n    define(function() {\n      return _;\n    });\n  }\n  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.\n  else if (freeExports && freeModule) {\n    // Export for Node.js or RingoJS.\n    if (moduleExports) {\n      (freeModule.exports = _)._ = _;\n    }\n    // Export for Narwhal or Rhino -require.\n    else {\n      freeExports._ = _;\n    }\n  }\n  else {\n    // Export for a browser or Rhino.\n    root._ = _;\n  }\n}.call(this));\n"

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6)(__webpack_require__(11))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "/*global define:false */\n/**\n * Copyright 2015 Craig Campbell\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an \"AS IS\" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n *\n * Mousetrap is a simple keyboard shortcut library for Javascript with\n * no external dependencies\n *\n * @version 1.5.2\n * @url craig.is/killing/mice\n */\n(function(window, document, undefined) {\n\n    /**\n     * mapping of special keycodes to their corresponding keys\n     *\n     * everything in this dictionary cannot use keypress events\n     * so it has to be here to map to the correct keycodes for\n     * keyup/keydown events\n     *\n     * @type {Object}\n     */\n    var _MAP = {\n        8: 'backspace',\n        9: 'tab',\n        13: 'enter',\n        16: 'shift',\n        17: 'ctrl',\n        18: 'alt',\n        20: 'capslock',\n        27: 'esc',\n        32: 'space',\n        33: 'pageup',\n        34: 'pagedown',\n        35: 'end',\n        36: 'home',\n        37: 'left',\n        38: 'up',\n        39: 'right',\n        40: 'down',\n        45: 'ins',\n        46: 'del',\n        91: 'meta',\n        93: 'meta',\n        224: 'meta'\n    };\n\n    /**\n     * mapping for special characters so they can support\n     *\n     * this dictionary is only used incase you want to bind a\n     * keyup or keydown event to one of these keys\n     *\n     * @type {Object}\n     */\n    var _KEYCODE_MAP = {\n        106: '*',\n        107: '+',\n        109: '-',\n        110: '.',\n        111 : '/',\n        186: ';',\n        187: '=',\n        188: ',',\n        189: '-',\n        190: '.',\n        191: '/',\n        192: '`',\n        219: '[',\n        220: '\\\\',\n        221: ']',\n        222: '\\''\n    };\n\n    /**\n     * this is a mapping of keys that require shift on a US keypad\n     * back to the non shift equivelents\n     *\n     * this is so you can use keyup events with these keys\n     *\n     * note that this will only work reliably on US keyboards\n     *\n     * @type {Object}\n     */\n    var _SHIFT_MAP = {\n        '~': '`',\n        '!': '1',\n        '@': '2',\n        '#': '3',\n        '$': '4',\n        '%': '5',\n        '^': '6',\n        '&': '7',\n        '*': '8',\n        '(': '9',\n        ')': '0',\n        '_': '-',\n        '+': '=',\n        ':': ';',\n        '\\\"': '\\'',\n        '<': ',',\n        '>': '.',\n        '?': '/',\n        '|': '\\\\'\n    };\n\n    /**\n     * this is a list of special strings you can use to map\n     * to modifier keys when you specify your keyboard shortcuts\n     *\n     * @type {Object}\n     */\n    var _SPECIAL_ALIASES = {\n        'option': 'alt',\n        'command': 'meta',\n        'return': 'enter',\n        'escape': 'esc',\n        'plus': '+',\n        'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'\n    };\n\n    /**\n     * variable to store the flipped version of _MAP from above\n     * needed to check if we should use keypress or not when no action\n     * is specified\n     *\n     * @type {Object|undefined}\n     */\n    var _REVERSE_MAP;\n\n    /**\n     * loop through the f keys, f1 to f19 and add them to the map\n     * programatically\n     */\n    for (var i = 1; i < 20; ++i) {\n        _MAP[111 + i] = 'f' + i;\n    }\n\n    /**\n     * loop through to map numbers on the numeric keypad\n     */\n    for (i = 0; i <= 9; ++i) {\n        _MAP[i + 96] = i;\n    }\n\n    /**\n     * cross browser add event method\n     *\n     * @param {Element|HTMLDocument} object\n     * @param {string} type\n     * @param {Function} callback\n     * @returns void\n     */\n    function _addEvent(object, type, callback) {\n        if (object.addEventListener) {\n            object.addEventListener(type, callback, false);\n            return;\n        }\n\n        object.attachEvent('on' + type, callback);\n    }\n\n    /**\n     * takes the event and returns the key character\n     *\n     * @param {Event} e\n     * @return {string}\n     */\n    function _characterFromEvent(e) {\n\n        // for keypress events we should return the character as is\n        if (e.type == 'keypress') {\n            var character = String.fromCharCode(e.which);\n\n            // if the shift key is not pressed then it is safe to assume\n            // that we want the character to be lowercase.  this means if\n            // you accidentally have caps lock on then your key bindings\n            // will continue to work\n            //\n            // the only side effect that might not be desired is if you\n            // bind something like 'A' cause you want to trigger an\n            // event when capital A is pressed caps lock will no longer\n            // trigger the event.  shift+a will though.\n            if (!e.shiftKey) {\n                character = character.toLowerCase();\n            }\n\n            return character;\n        }\n\n        // for non keypress events the special maps are needed\n        if (_MAP[e.which]) {\n            return _MAP[e.which];\n        }\n\n        if (_KEYCODE_MAP[e.which]) {\n            return _KEYCODE_MAP[e.which];\n        }\n\n        // if it is not in the special map\n\n        // with keydown and keyup events the character seems to always\n        // come in as an uppercase character whether you are pressing shift\n        // or not.  we should make sure it is always lowercase for comparisons\n        return String.fromCharCode(e.which).toLowerCase();\n    }\n\n    /**\n     * checks if two arrays are equal\n     *\n     * @param {Array} modifiers1\n     * @param {Array} modifiers2\n     * @returns {boolean}\n     */\n    function _modifiersMatch(modifiers1, modifiers2) {\n        return modifiers1.sort().join(',') === modifiers2.sort().join(',');\n    }\n\n    /**\n     * takes a key event and figures out what the modifiers are\n     *\n     * @param {Event} e\n     * @returns {Array}\n     */\n    function _eventModifiers(e) {\n        var modifiers = [];\n\n        if (e.shiftKey) {\n            modifiers.push('shift');\n        }\n\n        if (e.altKey) {\n            modifiers.push('alt');\n        }\n\n        if (e.ctrlKey) {\n            modifiers.push('ctrl');\n        }\n\n        if (e.metaKey) {\n            modifiers.push('meta');\n        }\n\n        return modifiers;\n    }\n\n    /**\n     * prevents default for this event\n     *\n     * @param {Event} e\n     * @returns void\n     */\n    function _preventDefault(e) {\n        if (e.preventDefault) {\n            e.preventDefault();\n            return;\n        }\n\n        e.returnValue = false;\n    }\n\n    /**\n     * stops propogation for this event\n     *\n     * @param {Event} e\n     * @returns void\n     */\n    function _stopPropagation(e) {\n        if (e.stopPropagation) {\n            e.stopPropagation();\n            return;\n        }\n\n        e.cancelBubble = true;\n    }\n\n    /**\n     * determines if the keycode specified is a modifier key or not\n     *\n     * @param {string} key\n     * @returns {boolean}\n     */\n    function _isModifier(key) {\n        return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';\n    }\n\n    /**\n     * reverses the map lookup so that we can look for specific keys\n     * to see what can and can't use keypress\n     *\n     * @return {Object}\n     */\n    function _getReverseMap() {\n        if (!_REVERSE_MAP) {\n            _REVERSE_MAP = {};\n            for (var key in _MAP) {\n\n                // pull out the numeric keypad from here cause keypress should\n                // be able to detect the keys from the character\n                if (key > 95 && key < 112) {\n                    continue;\n                }\n\n                if (_MAP.hasOwnProperty(key)) {\n                    _REVERSE_MAP[_MAP[key]] = key;\n                }\n            }\n        }\n        return _REVERSE_MAP;\n    }\n\n    /**\n     * picks the best action based on the key combination\n     *\n     * @param {string} key - character for key\n     * @param {Array} modifiers\n     * @param {string=} action passed in\n     */\n    function _pickBestAction(key, modifiers, action) {\n\n        // if no action was picked in we should try to pick the one\n        // that we think would work best for this key\n        if (!action) {\n            action = _getReverseMap()[key] ? 'keydown' : 'keypress';\n        }\n\n        // modifier keys don't work as expected with keypress,\n        // switch to keydown\n        if (action == 'keypress' && modifiers.length) {\n            action = 'keydown';\n        }\n\n        return action;\n    }\n\n    /**\n     * Converts from a string key combination to an array\n     *\n     * @param  {string} combination like \"command+shift+l\"\n     * @return {Array}\n     */\n    function _keysFromString(combination) {\n        if (combination === '+') {\n            return ['+'];\n        }\n\n        combination = combination.replace(/\\+{2}/g, '+plus');\n        return combination.split('+');\n    }\n\n    /**\n     * Gets info for a specific key combination\n     *\n     * @param  {string} combination key combination (\"command+s\" or \"a\" or \"*\")\n     * @param  {string=} action\n     * @returns {Object}\n     */\n    function _getKeyInfo(combination, action) {\n        var keys;\n        var key;\n        var i;\n        var modifiers = [];\n\n        // take the keys from this pattern and figure out what the actual\n        // pattern is all about\n        keys = _keysFromString(combination);\n\n        for (i = 0; i < keys.length; ++i) {\n            key = keys[i];\n\n            // normalize key names\n            if (_SPECIAL_ALIASES[key]) {\n                key = _SPECIAL_ALIASES[key];\n            }\n\n            // if this is not a keypress event then we should\n            // be smart about using shift keys\n            // this will only work for US keyboards however\n            if (action && action != 'keypress' && _SHIFT_MAP[key]) {\n                key = _SHIFT_MAP[key];\n                modifiers.push('shift');\n            }\n\n            // if this key is a modifier then add it to the list of modifiers\n            if (_isModifier(key)) {\n                modifiers.push(key);\n            }\n        }\n\n        // depending on what the key combination is\n        // we will try to pick the best event for it\n        action = _pickBestAction(key, modifiers, action);\n\n        return {\n            key: key,\n            modifiers: modifiers,\n            action: action\n        };\n    }\n\n    function _belongsTo(element, ancestor) {\n        if (element === document) {\n            return false;\n        }\n\n        if (element === ancestor) {\n            return true;\n        }\n\n        return _belongsTo(element.parentNode, ancestor);\n    }\n\n    function Mousetrap(targetElement) {\n        var self = this;\n\n        targetElement = targetElement || document;\n\n        if (!(self instanceof Mousetrap)) {\n            return new Mousetrap(targetElement);\n        }\n\n        /**\n         * element to attach key events to\n         *\n         * @type {Element}\n         */\n        self.target = targetElement;\n\n        /**\n         * a list of all the callbacks setup via Mousetrap.bind()\n         *\n         * @type {Object}\n         */\n        self._callbacks = {};\n\n        /**\n         * direct map of string combinations to callbacks used for trigger()\n         *\n         * @type {Object}\n         */\n        self._directMap = {};\n\n        /**\n         * keeps track of what level each sequence is at since multiple\n         * sequences can start out with the same sequence\n         *\n         * @type {Object}\n         */\n        var _sequenceLevels = {};\n\n        /**\n         * variable to store the setTimeout call\n         *\n         * @type {null|number}\n         */\n        var _resetTimer;\n\n        /**\n         * temporary state where we will ignore the next keyup\n         *\n         * @type {boolean|string}\n         */\n        var _ignoreNextKeyup = false;\n\n        /**\n         * temporary state where we will ignore the next keypress\n         *\n         * @type {boolean}\n         */\n        var _ignoreNextKeypress = false;\n\n        /**\n         * are we currently inside of a sequence?\n         * type of action (\"keyup\" or \"keydown\" or \"keypress\") or false\n         *\n         * @type {boolean|string}\n         */\n        var _nextExpectedAction = false;\n\n        /**\n         * resets all sequence counters except for the ones passed in\n         *\n         * @param {Object} doNotReset\n         * @returns void\n         */\n        function _resetSequences(doNotReset) {\n            doNotReset = doNotReset || {};\n\n            var activeSequences = false,\n                key;\n\n            for (key in _sequenceLevels) {\n                if (doNotReset[key]) {\n                    activeSequences = true;\n                    continue;\n                }\n                _sequenceLevels[key] = 0;\n            }\n\n            if (!activeSequences) {\n                _nextExpectedAction = false;\n            }\n        }\n\n        /**\n         * finds all callbacks that match based on the keycode, modifiers,\n         * and action\n         *\n         * @param {string} character\n         * @param {Array} modifiers\n         * @param {Event|Object} e\n         * @param {string=} sequenceName - name of the sequence we are looking for\n         * @param {string=} combination\n         * @param {number=} level\n         * @returns {Array}\n         */\n        function _getMatches(character, modifiers, e, sequenceName, combination, level) {\n            var i;\n            var callback;\n            var matches = [];\n            var action = e.type;\n\n            // if there are no events related to this keycode\n            if (!self._callbacks[character]) {\n                return [];\n            }\n\n            // if a modifier key is coming up on its own we should allow it\n            if (action == 'keyup' && _isModifier(character)) {\n                modifiers = [character];\n            }\n\n            // loop through all callbacks for the key that was pressed\n            // and see if any of them match\n            for (i = 0; i < self._callbacks[character].length; ++i) {\n                callback = self._callbacks[character][i];\n\n                // if a sequence name is not specified, but this is a sequence at\n                // the wrong level then move onto the next match\n                if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {\n                    continue;\n                }\n\n                // if the action we are looking for doesn't match the action we got\n                // then we should keep going\n                if (action != callback.action) {\n                    continue;\n                }\n\n                // if this is a keypress event and the meta key and control key\n                // are not pressed that means that we need to only look at the\n                // character, otherwise check the modifiers as well\n                //\n                // chrome will not fire a keypress if meta or control is down\n                // safari will fire a keypress if meta or meta+shift is down\n                // firefox will fire a keypress if meta or control is down\n                if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {\n\n                    // when you bind a combination or sequence a second time it\n                    // should overwrite the first one.  if a sequenceName or\n                    // combination is specified in this call it does just that\n                    //\n                    // @todo make deleting its own method?\n                    var deleteCombo = !sequenceName && callback.combo == combination;\n                    var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;\n                    if (deleteCombo || deleteSequence) {\n                        self._callbacks[character].splice(i, 1);\n                    }\n\n                    matches.push(callback);\n                }\n            }\n\n            return matches;\n        }\n\n        /**\n         * actually calls the callback function\n         *\n         * if your callback function returns false this will use the jquery\n         * convention - prevent default and stop propogation on the event\n         *\n         * @param {Function} callback\n         * @param {Event} e\n         * @returns void\n         */\n        function _fireCallback(callback, e, combo, sequence) {\n\n            // if this event should not happen stop here\n            if (self.stopCallback(e, e.target || e.srcElement, combo, sequence)) {\n                return;\n            }\n\n            if (callback(e, combo) === false) {\n                _preventDefault(e);\n                _stopPropagation(e);\n            }\n        }\n\n        /**\n         * handles a character key event\n         *\n         * @param {string} character\n         * @param {Array} modifiers\n         * @param {Event} e\n         * @returns void\n         */\n        self._handleKey = function(character, modifiers, e) {\n            var callbacks = _getMatches(character, modifiers, e);\n            var i;\n            var doNotReset = {};\n            var maxLevel = 0;\n            var processedSequenceCallback = false;\n\n            // Calculate the maxLevel for sequences so we can only execute the longest callback sequence\n            for (i = 0; i < callbacks.length; ++i) {\n                if (callbacks[i].seq) {\n                    maxLevel = Math.max(maxLevel, callbacks[i].level);\n                }\n            }\n\n            // loop through matching callbacks for this key event\n            for (i = 0; i < callbacks.length; ++i) {\n\n                // fire for all sequence callbacks\n                // this is because if for example you have multiple sequences\n                // bound such as \"g i\" and \"g t\" they both need to fire the\n                // callback for matching g cause otherwise you can only ever\n                // match the first one\n                if (callbacks[i].seq) {\n\n                    // only fire callbacks for the maxLevel to prevent\n                    // subsequences from also firing\n                    //\n                    // for example 'a option b' should not cause 'option b' to fire\n                    // even though 'option b' is part of the other sequence\n                    //\n                    // any sequences that do not match here will be discarded\n                    // below by the _resetSequences call\n                    if (callbacks[i].level != maxLevel) {\n                        continue;\n                    }\n\n                    processedSequenceCallback = true;\n\n                    // keep a list of which sequences were matches for later\n                    doNotReset[callbacks[i].seq] = 1;\n                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);\n                    continue;\n                }\n\n                // if there were no sequence matches but we are still here\n                // that means this is a regular match so we should fire that\n                if (!processedSequenceCallback) {\n                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo);\n                }\n            }\n\n            // if the key you pressed matches the type of sequence without\n            // being a modifier (ie \"keyup\" or \"keypress\") then we should\n            // reset all sequences that were not matched by this event\n            //\n            // this is so, for example, if you have the sequence \"h a t\" and you\n            // type \"h e a r t\" it does not match.  in this case the \"e\" will\n            // cause the sequence to reset\n            //\n            // modifier keys are ignored because you can have a sequence\n            // that contains modifiers such as \"enter ctrl+space\" and in most\n            // cases the modifier key will be pressed before the next key\n            //\n            // also if you have a sequence such as \"ctrl+b a\" then pressing the\n            // \"b\" key will trigger a \"keypress\" and a \"keydown\"\n            //\n            // the \"keydown\" is expected when there is a modifier, but the\n            // \"keypress\" ends up matching the _nextExpectedAction since it occurs\n            // after and that causes the sequence to reset\n            //\n            // we ignore keypresses in a sequence that directly follow a keydown\n            // for the same character\n            var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;\n            if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {\n                _resetSequences(doNotReset);\n            }\n\n            _ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';\n        };\n\n        /**\n         * handles a keydown event\n         *\n         * @param {Event} e\n         * @returns void\n         */\n        function _handleKeyEvent(e) {\n\n            // normalize e.which for key events\n            // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion\n            if (typeof e.which !== 'number') {\n                e.which = e.keyCode;\n            }\n\n            var character = _characterFromEvent(e);\n\n            // no character found then stop\n            if (!character) {\n                return;\n            }\n\n            // need to use === for the character check because the character can be 0\n            if (e.type == 'keyup' && _ignoreNextKeyup === character) {\n                _ignoreNextKeyup = false;\n                return;\n            }\n\n            self.handleKey(character, _eventModifiers(e), e);\n        }\n\n        /**\n         * called to set a 1 second timeout on the specified sequence\n         *\n         * this is so after each key press in the sequence you have 1 second\n         * to press the next key before you have to start over\n         *\n         * @returns void\n         */\n        function _resetSequenceTimer() {\n            clearTimeout(_resetTimer);\n            _resetTimer = setTimeout(_resetSequences, 1000);\n        }\n\n        /**\n         * binds a key sequence to an event\n         *\n         * @param {string} combo - combo specified in bind call\n         * @param {Array} keys\n         * @param {Function} callback\n         * @param {string=} action\n         * @returns void\n         */\n        function _bindSequence(combo, keys, callback, action) {\n\n            // start off by adding a sequence level record for this combination\n            // and setting the level to 0\n            _sequenceLevels[combo] = 0;\n\n            /**\n             * callback to increase the sequence level for this sequence and reset\n             * all other sequences that were active\n             *\n             * @param {string} nextAction\n             * @returns {Function}\n             */\n            function _increaseSequence(nextAction) {\n                return function() {\n                    _nextExpectedAction = nextAction;\n                    ++_sequenceLevels[combo];\n                    _resetSequenceTimer();\n                };\n            }\n\n            /**\n             * wraps the specified callback inside of another function in order\n             * to reset all sequence counters as soon as this sequence is done\n             *\n             * @param {Event} e\n             * @returns void\n             */\n            function _callbackAndReset(e) {\n                _fireCallback(callback, e, combo);\n\n                // we should ignore the next key up if the action is key down\n                // or keypress.  this is so if you finish a sequence and\n                // release the key the final key will not trigger a keyup\n                if (action !== 'keyup') {\n                    _ignoreNextKeyup = _characterFromEvent(e);\n                }\n\n                // weird race condition if a sequence ends with the key\n                // another sequence begins with\n                setTimeout(_resetSequences, 10);\n            }\n\n            // loop through keys one at a time and bind the appropriate callback\n            // function.  for any key leading up to the final one it should\n            // increase the sequence. after the final, it should reset all sequences\n            //\n            // if an action is specified in the original bind call then that will\n            // be used throughout.  otherwise we will pass the action that the\n            // next key in the sequence should match.  this allows a sequence\n            // to mix and match keypress and keydown events depending on which\n            // ones are better suited to the key provided\n            for (var i = 0; i < keys.length; ++i) {\n                var isFinal = i + 1 === keys.length;\n                var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);\n                _bindSingle(keys[i], wrappedCallback, action, combo, i);\n            }\n        }\n\n        /**\n         * binds a single keyboard combination\n         *\n         * @param {string} combination\n         * @param {Function} callback\n         * @param {string=} action\n         * @param {string=} sequenceName - name of sequence if part of sequence\n         * @param {number=} level - what part of the sequence the command is\n         * @returns void\n         */\n        function _bindSingle(combination, callback, action, sequenceName, level) {\n\n            // store a direct mapped reference for use with Mousetrap.trigger\n            self._directMap[combination + ':' + action] = callback;\n\n            // make sure multiple spaces in a row become a single space\n            combination = combination.replace(/\\s+/g, ' ');\n\n            var sequence = combination.split(' ');\n            var info;\n\n            // if this pattern is a sequence of keys then run through this method\n            // to reprocess each pattern one key at a time\n            if (sequence.length > 1) {\n                _bindSequence(combination, sequence, callback, action);\n                return;\n            }\n\n            info = _getKeyInfo(combination, action);\n\n            // make sure to initialize array if this is the first time\n            // a callback is added for this key\n            self._callbacks[info.key] = self._callbacks[info.key] || [];\n\n            // remove an existing match if there is one\n            _getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level);\n\n            // add this call back to the array\n            // if it is a sequence put it at the beginning\n            // if not put it at the end\n            //\n            // this is important because the way these are processed expects\n            // the sequence ones to come first\n            self._callbacks[info.key][sequenceName ? 'unshift' : 'push']({\n                callback: callback,\n                modifiers: info.modifiers,\n                action: info.action,\n                seq: sequenceName,\n                level: level,\n                combo: combination\n            });\n        }\n\n        /**\n         * binds multiple combinations to the same callback\n         *\n         * @param {Array} combinations\n         * @param {Function} callback\n         * @param {string|undefined} action\n         * @returns void\n         */\n        self._bindMultiple = function(combinations, callback, action) {\n            for (var i = 0; i < combinations.length; ++i) {\n                _bindSingle(combinations[i], callback, action);\n            }\n        };\n\n        // start!\n        _addEvent(targetElement, 'keypress', _handleKeyEvent);\n        _addEvent(targetElement, 'keydown', _handleKeyEvent);\n        _addEvent(targetElement, 'keyup', _handleKeyEvent);\n    }\n\n    /**\n     * binds an event to mousetrap\n     *\n     * can be a single key, a combination of keys separated with +,\n     * an array of keys, or a sequence of keys separated by spaces\n     *\n     * be sure to list the modifier keys first to make sure that the\n     * correct key ends up getting bound (the last key in the pattern)\n     *\n     * @param {string|Array} keys\n     * @param {Function} callback\n     * @param {string=} action - 'keypress', 'keydown', or 'keyup'\n     * @returns void\n     */\n    Mousetrap.prototype.bind = function(keys, callback, action) {\n        var self = this;\n        keys = keys instanceof Array ? keys : [keys];\n        self._bindMultiple.call(self, keys, callback, action);\n        return self;\n    };\n\n    /**\n     * unbinds an event to mousetrap\n     *\n     * the unbinding sets the callback function of the specified key combo\n     * to an empty function and deletes the corresponding key in the\n     * _directMap dict.\n     *\n     * TODO: actually remove this from the _callbacks dictionary instead\n     * of binding an empty function\n     *\n     * the keycombo+action has to be exactly the same as\n     * it was defined in the bind method\n     *\n     * @param {string|Array} keys\n     * @param {string} action\n     * @returns void\n     */\n    Mousetrap.prototype.unbind = function(keys, action) {\n        var self = this;\n        return self.bind.call(self, keys, function() {}, action);\n    };\n\n    /**\n     * triggers an event that has already been bound\n     *\n     * @param {string} keys\n     * @param {string=} action\n     * @returns void\n     */\n    Mousetrap.prototype.trigger = function(keys, action) {\n        var self = this;\n        if (self._directMap[keys + ':' + action]) {\n            self._directMap[keys + ':' + action]({}, keys);\n        }\n        return self;\n    };\n\n    /**\n     * resets the library back to its initial state.  this is useful\n     * if you want to clear out the current keyboard shortcuts and bind\n     * new ones - for example if you switch to another page\n     *\n     * @returns void\n     */\n    Mousetrap.prototype.reset = function() {\n        var self = this;\n        self._callbacks = {};\n        self._directMap = {};\n        return self;\n    };\n\n    /**\n     * should we stop this event before firing off callbacks\n     *\n     * @param {Event} e\n     * @param {Element} element\n     * @return {boolean}\n     */\n    Mousetrap.prototype.stopCallback = function(e, element) {\n        var self = this;\n\n        // if the element has the class \"mousetrap\" then no need to stop\n        if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {\n            return false;\n        }\n\n        if (_belongsTo(element, self.target)) {\n            return false;\n        }\n\n        // stop for input, select, and textarea\n        return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;\n    };\n\n    /**\n     * exposes _handleKey publicly so it can be overwritten by extensions\n     */\n    Mousetrap.prototype.handleKey = function() {\n        var self = this;\n        return self._handleKey.apply(self, arguments);\n    };\n\n    /**\n     * Init the global mousetrap functions\n     *\n     * This method is needed to allow the global mousetrap functions to work\n     * now that mousetrap is a constructor function.\n     */\n    Mousetrap.init = function() {\n        var documentMousetrap = Mousetrap(document);\n        for (var method in documentMousetrap) {\n            if (method.charAt(0) !== '_') {\n                Mousetrap[method] = (function(method) {\n                    return function() {\n                        return documentMousetrap[method].apply(documentMousetrap, arguments);\n                    };\n                } (method));\n            }\n        }\n    };\n\n    Mousetrap.init();\n\n    // expose mousetrap to the global object\n    window.Mousetrap = Mousetrap;\n\n    // expose as a common js module\n    if (typeof module !== 'undefined' && module.exports) {\n        module.exports = Mousetrap;\n    }\n\n    // expose mousetrap as an AMD module\n    if (typeof define === 'function' && define.amd) {\n        define(function() {\n            return Mousetrap;\n        });\n    }\n}) (window, document);\n"

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*global define:false */
	/**
	 * Copyright 2015 Craig Campbell
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 * Mousetrap is a simple keyboard shortcut library for Javascript with
	 * no external dependencies
	 *
	 * @version 1.5.2
	 * @url craig.is/killing/mice
	 */
	(function(window, document, undefined) {

	    /**
	     * mapping of special keycodes to their corresponding keys
	     *
	     * everything in this dictionary cannot use keypress events
	     * so it has to be here to map to the correct keycodes for
	     * keyup/keydown events
	     *
	     * @type {Object}
	     */
	    var _MAP = {
	        8: 'backspace',
	        9: 'tab',
	        13: 'enter',
	        16: 'shift',
	        17: 'ctrl',
	        18: 'alt',
	        20: 'capslock',
	        27: 'esc',
	        32: 'space',
	        33: 'pageup',
	        34: 'pagedown',
	        35: 'end',
	        36: 'home',
	        37: 'left',
	        38: 'up',
	        39: 'right',
	        40: 'down',
	        45: 'ins',
	        46: 'del',
	        91: 'meta',
	        93: 'meta',
	        224: 'meta'
	    };

	    /**
	     * mapping for special characters so they can support
	     *
	     * this dictionary is only used incase you want to bind a
	     * keyup or keydown event to one of these keys
	     *
	     * @type {Object}
	     */
	    var _KEYCODE_MAP = {
	        106: '*',
	        107: '+',
	        109: '-',
	        110: '.',
	        111 : '/',
	        186: ';',
	        187: '=',
	        188: ',',
	        189: '-',
	        190: '.',
	        191: '/',
	        192: '`',
	        219: '[',
	        220: '\\',
	        221: ']',
	        222: '\''
	    };

	    /**
	     * this is a mapping of keys that require shift on a US keypad
	     * back to the non shift equivelents
	     *
	     * this is so you can use keyup events with these keys
	     *
	     * note that this will only work reliably on US keyboards
	     *
	     * @type {Object}
	     */
	    var _SHIFT_MAP = {
	        '~': '`',
	        '!': '1',
	        '@': '2',
	        '#': '3',
	        '$': '4',
	        '%': '5',
	        '^': '6',
	        '&': '7',
	        '*': '8',
	        '(': '9',
	        ')': '0',
	        '_': '-',
	        '+': '=',
	        ':': ';',
	        '\"': '\'',
	        '<': ',',
	        '>': '.',
	        '?': '/',
	        '|': '\\'
	    };

	    /**
	     * this is a list of special strings you can use to map
	     * to modifier keys when you specify your keyboard shortcuts
	     *
	     * @type {Object}
	     */
	    var _SPECIAL_ALIASES = {
	        'option': 'alt',
	        'command': 'meta',
	        'return': 'enter',
	        'escape': 'esc',
	        'plus': '+',
	        'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
	    };

	    /**
	     * variable to store the flipped version of _MAP from above
	     * needed to check if we should use keypress or not when no action
	     * is specified
	     *
	     * @type {Object|undefined}
	     */
	    var _REVERSE_MAP;

	    /**
	     * loop through the f keys, f1 to f19 and add them to the map
	     * programatically
	     */
	    for (var i = 1; i < 20; ++i) {
	        _MAP[111 + i] = 'f' + i;
	    }

	    /**
	     * loop through to map numbers on the numeric keypad
	     */
	    for (i = 0; i <= 9; ++i) {
	        _MAP[i + 96] = i;
	    }

	    /**
	     * cross browser add event method
	     *
	     * @param {Element|HTMLDocument} object
	     * @param {string} type
	     * @param {Function} callback
	     * @returns void
	     */
	    function _addEvent(object, type, callback) {
	        if (object.addEventListener) {
	            object.addEventListener(type, callback, false);
	            return;
	        }

	        object.attachEvent('on' + type, callback);
	    }

	    /**
	     * takes the event and returns the key character
	     *
	     * @param {Event} e
	     * @return {string}
	     */
	    function _characterFromEvent(e) {

	        // for keypress events we should return the character as is
	        if (e.type == 'keypress') {
	            var character = String.fromCharCode(e.which);

	            // if the shift key is not pressed then it is safe to assume
	            // that we want the character to be lowercase.  this means if
	            // you accidentally have caps lock on then your key bindings
	            // will continue to work
	            //
	            // the only side effect that might not be desired is if you
	            // bind something like 'A' cause you want to trigger an
	            // event when capital A is pressed caps lock will no longer
	            // trigger the event.  shift+a will though.
	            if (!e.shiftKey) {
	                character = character.toLowerCase();
	            }

	            return character;
	        }

	        // for non keypress events the special maps are needed
	        if (_MAP[e.which]) {
	            return _MAP[e.which];
	        }

	        if (_KEYCODE_MAP[e.which]) {
	            return _KEYCODE_MAP[e.which];
	        }

	        // if it is not in the special map

	        // with keydown and keyup events the character seems to always
	        // come in as an uppercase character whether you are pressing shift
	        // or not.  we should make sure it is always lowercase for comparisons
	        return String.fromCharCode(e.which).toLowerCase();
	    }

	    /**
	     * checks if two arrays are equal
	     *
	     * @param {Array} modifiers1
	     * @param {Array} modifiers2
	     * @returns {boolean}
	     */
	    function _modifiersMatch(modifiers1, modifiers2) {
	        return modifiers1.sort().join(',') === modifiers2.sort().join(',');
	    }

	    /**
	     * takes a key event and figures out what the modifiers are
	     *
	     * @param {Event} e
	     * @returns {Array}
	     */
	    function _eventModifiers(e) {
	        var modifiers = [];

	        if (e.shiftKey) {
	            modifiers.push('shift');
	        }

	        if (e.altKey) {
	            modifiers.push('alt');
	        }

	        if (e.ctrlKey) {
	            modifiers.push('ctrl');
	        }

	        if (e.metaKey) {
	            modifiers.push('meta');
	        }

	        return modifiers;
	    }

	    /**
	     * prevents default for this event
	     *
	     * @param {Event} e
	     * @returns void
	     */
	    function _preventDefault(e) {
	        if (e.preventDefault) {
	            e.preventDefault();
	            return;
	        }

	        e.returnValue = false;
	    }

	    /**
	     * stops propogation for this event
	     *
	     * @param {Event} e
	     * @returns void
	     */
	    function _stopPropagation(e) {
	        if (e.stopPropagation) {
	            e.stopPropagation();
	            return;
	        }

	        e.cancelBubble = true;
	    }

	    /**
	     * determines if the keycode specified is a modifier key or not
	     *
	     * @param {string} key
	     * @returns {boolean}
	     */
	    function _isModifier(key) {
	        return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
	    }

	    /**
	     * reverses the map lookup so that we can look for specific keys
	     * to see what can and can't use keypress
	     *
	     * @return {Object}
	     */
	    function _getReverseMap() {
	        if (!_REVERSE_MAP) {
	            _REVERSE_MAP = {};
	            for (var key in _MAP) {

	                // pull out the numeric keypad from here cause keypress should
	                // be able to detect the keys from the character
	                if (key > 95 && key < 112) {
	                    continue;
	                }

	                if (_MAP.hasOwnProperty(key)) {
	                    _REVERSE_MAP[_MAP[key]] = key;
	                }
	            }
	        }
	        return _REVERSE_MAP;
	    }

	    /**
	     * picks the best action based on the key combination
	     *
	     * @param {string} key - character for key
	     * @param {Array} modifiers
	     * @param {string=} action passed in
	     */
	    function _pickBestAction(key, modifiers, action) {

	        // if no action was picked in we should try to pick the one
	        // that we think would work best for this key
	        if (!action) {
	            action = _getReverseMap()[key] ? 'keydown' : 'keypress';
	        }

	        // modifier keys don't work as expected with keypress,
	        // switch to keydown
	        if (action == 'keypress' && modifiers.length) {
	            action = 'keydown';
	        }

	        return action;
	    }

	    /**
	     * Converts from a string key combination to an array
	     *
	     * @param  {string} combination like "command+shift+l"
	     * @return {Array}
	     */
	    function _keysFromString(combination) {
	        if (combination === '+') {
	            return ['+'];
	        }

	        combination = combination.replace(/\+{2}/g, '+plus');
	        return combination.split('+');
	    }

	    /**
	     * Gets info for a specific key combination
	     *
	     * @param  {string} combination key combination ("command+s" or "a" or "*")
	     * @param  {string=} action
	     * @returns {Object}
	     */
	    function _getKeyInfo(combination, action) {
	        var keys;
	        var key;
	        var i;
	        var modifiers = [];

	        // take the keys from this pattern and figure out what the actual
	        // pattern is all about
	        keys = _keysFromString(combination);

	        for (i = 0; i < keys.length; ++i) {
	            key = keys[i];

	            // normalize key names
	            if (_SPECIAL_ALIASES[key]) {
	                key = _SPECIAL_ALIASES[key];
	            }

	            // if this is not a keypress event then we should
	            // be smart about using shift keys
	            // this will only work for US keyboards however
	            if (action && action != 'keypress' && _SHIFT_MAP[key]) {
	                key = _SHIFT_MAP[key];
	                modifiers.push('shift');
	            }

	            // if this key is a modifier then add it to the list of modifiers
	            if (_isModifier(key)) {
	                modifiers.push(key);
	            }
	        }

	        // depending on what the key combination is
	        // we will try to pick the best event for it
	        action = _pickBestAction(key, modifiers, action);

	        return {
	            key: key,
	            modifiers: modifiers,
	            action: action
	        };
	    }

	    function _belongsTo(element, ancestor) {
	        if (element === document) {
	            return false;
	        }

	        if (element === ancestor) {
	            return true;
	        }

	        return _belongsTo(element.parentNode, ancestor);
	    }

	    function Mousetrap(targetElement) {
	        var self = this;

	        targetElement = targetElement || document;

	        if (!(self instanceof Mousetrap)) {
	            return new Mousetrap(targetElement);
	        }

	        /**
	         * element to attach key events to
	         *
	         * @type {Element}
	         */
	        self.target = targetElement;

	        /**
	         * a list of all the callbacks setup via Mousetrap.bind()
	         *
	         * @type {Object}
	         */
	        self._callbacks = {};

	        /**
	         * direct map of string combinations to callbacks used for trigger()
	         *
	         * @type {Object}
	         */
	        self._directMap = {};

	        /**
	         * keeps track of what level each sequence is at since multiple
	         * sequences can start out with the same sequence
	         *
	         * @type {Object}
	         */
	        var _sequenceLevels = {};

	        /**
	         * variable to store the setTimeout call
	         *
	         * @type {null|number}
	         */
	        var _resetTimer;

	        /**
	         * temporary state where we will ignore the next keyup
	         *
	         * @type {boolean|string}
	         */
	        var _ignoreNextKeyup = false;

	        /**
	         * temporary state where we will ignore the next keypress
	         *
	         * @type {boolean}
	         */
	        var _ignoreNextKeypress = false;

	        /**
	         * are we currently inside of a sequence?
	         * type of action ("keyup" or "keydown" or "keypress") or false
	         *
	         * @type {boolean|string}
	         */
	        var _nextExpectedAction = false;

	        /**
	         * resets all sequence counters except for the ones passed in
	         *
	         * @param {Object} doNotReset
	         * @returns void
	         */
	        function _resetSequences(doNotReset) {
	            doNotReset = doNotReset || {};

	            var activeSequences = false,
	                key;

	            for (key in _sequenceLevels) {
	                if (doNotReset[key]) {
	                    activeSequences = true;
	                    continue;
	                }
	                _sequenceLevels[key] = 0;
	            }

	            if (!activeSequences) {
	                _nextExpectedAction = false;
	            }
	        }

	        /**
	         * finds all callbacks that match based on the keycode, modifiers,
	         * and action
	         *
	         * @param {string} character
	         * @param {Array} modifiers
	         * @param {Event|Object} e
	         * @param {string=} sequenceName - name of the sequence we are looking for
	         * @param {string=} combination
	         * @param {number=} level
	         * @returns {Array}
	         */
	        function _getMatches(character, modifiers, e, sequenceName, combination, level) {
	            var i;
	            var callback;
	            var matches = [];
	            var action = e.type;

	            // if there are no events related to this keycode
	            if (!self._callbacks[character]) {
	                return [];
	            }

	            // if a modifier key is coming up on its own we should allow it
	            if (action == 'keyup' && _isModifier(character)) {
	                modifiers = [character];
	            }

	            // loop through all callbacks for the key that was pressed
	            // and see if any of them match
	            for (i = 0; i < self._callbacks[character].length; ++i) {
	                callback = self._callbacks[character][i];

	                // if a sequence name is not specified, but this is a sequence at
	                // the wrong level then move onto the next match
	                if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
	                    continue;
	                }

	                // if the action we are looking for doesn't match the action we got
	                // then we should keep going
	                if (action != callback.action) {
	                    continue;
	                }

	                // if this is a keypress event and the meta key and control key
	                // are not pressed that means that we need to only look at the
	                // character, otherwise check the modifiers as well
	                //
	                // chrome will not fire a keypress if meta or control is down
	                // safari will fire a keypress if meta or meta+shift is down
	                // firefox will fire a keypress if meta or control is down
	                if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {

	                    // when you bind a combination or sequence a second time it
	                    // should overwrite the first one.  if a sequenceName or
	                    // combination is specified in this call it does just that
	                    //
	                    // @todo make deleting its own method?
	                    var deleteCombo = !sequenceName && callback.combo == combination;
	                    var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
	                    if (deleteCombo || deleteSequence) {
	                        self._callbacks[character].splice(i, 1);
	                    }

	                    matches.push(callback);
	                }
	            }

	            return matches;
	        }

	        /**
	         * actually calls the callback function
	         *
	         * if your callback function returns false this will use the jquery
	         * convention - prevent default and stop propogation on the event
	         *
	         * @param {Function} callback
	         * @param {Event} e
	         * @returns void
	         */
	        function _fireCallback(callback, e, combo, sequence) {

	            // if this event should not happen stop here
	            if (self.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
	                return;
	            }

	            if (callback(e, combo) === false) {
	                _preventDefault(e);
	                _stopPropagation(e);
	            }
	        }

	        /**
	         * handles a character key event
	         *
	         * @param {string} character
	         * @param {Array} modifiers
	         * @param {Event} e
	         * @returns void
	         */
	        self._handleKey = function(character, modifiers, e) {
	            var callbacks = _getMatches(character, modifiers, e);
	            var i;
	            var doNotReset = {};
	            var maxLevel = 0;
	            var processedSequenceCallback = false;

	            // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
	            for (i = 0; i < callbacks.length; ++i) {
	                if (callbacks[i].seq) {
	                    maxLevel = Math.max(maxLevel, callbacks[i].level);
	                }
	            }

	            // loop through matching callbacks for this key event
	            for (i = 0; i < callbacks.length; ++i) {

	                // fire for all sequence callbacks
	                // this is because if for example you have multiple sequences
	                // bound such as "g i" and "g t" they both need to fire the
	                // callback for matching g cause otherwise you can only ever
	                // match the first one
	                if (callbacks[i].seq) {

	                    // only fire callbacks for the maxLevel to prevent
	                    // subsequences from also firing
	                    //
	                    // for example 'a option b' should not cause 'option b' to fire
	                    // even though 'option b' is part of the other sequence
	                    //
	                    // any sequences that do not match here will be discarded
	                    // below by the _resetSequences call
	                    if (callbacks[i].level != maxLevel) {
	                        continue;
	                    }

	                    processedSequenceCallback = true;

	                    // keep a list of which sequences were matches for later
	                    doNotReset[callbacks[i].seq] = 1;
	                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
	                    continue;
	                }

	                // if there were no sequence matches but we are still here
	                // that means this is a regular match so we should fire that
	                if (!processedSequenceCallback) {
	                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
	                }
	            }

	            // if the key you pressed matches the type of sequence without
	            // being a modifier (ie "keyup" or "keypress") then we should
	            // reset all sequences that were not matched by this event
	            //
	            // this is so, for example, if you have the sequence "h a t" and you
	            // type "h e a r t" it does not match.  in this case the "e" will
	            // cause the sequence to reset
	            //
	            // modifier keys are ignored because you can have a sequence
	            // that contains modifiers such as "enter ctrl+space" and in most
	            // cases the modifier key will be pressed before the next key
	            //
	            // also if you have a sequence such as "ctrl+b a" then pressing the
	            // "b" key will trigger a "keypress" and a "keydown"
	            //
	            // the "keydown" is expected when there is a modifier, but the
	            // "keypress" ends up matching the _nextExpectedAction since it occurs
	            // after and that causes the sequence to reset
	            //
	            // we ignore keypresses in a sequence that directly follow a keydown
	            // for the same character
	            var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;
	            if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
	                _resetSequences(doNotReset);
	            }

	            _ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
	        };

	        /**
	         * handles a keydown event
	         *
	         * @param {Event} e
	         * @returns void
	         */
	        function _handleKeyEvent(e) {

	            // normalize e.which for key events
	            // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
	            if (typeof e.which !== 'number') {
	                e.which = e.keyCode;
	            }

	            var character = _characterFromEvent(e);

	            // no character found then stop
	            if (!character) {
	                return;
	            }

	            // need to use === for the character check because the character can be 0
	            if (e.type == 'keyup' && _ignoreNextKeyup === character) {
	                _ignoreNextKeyup = false;
	                return;
	            }

	            self.handleKey(character, _eventModifiers(e), e);
	        }

	        /**
	         * called to set a 1 second timeout on the specified sequence
	         *
	         * this is so after each key press in the sequence you have 1 second
	         * to press the next key before you have to start over
	         *
	         * @returns void
	         */
	        function _resetSequenceTimer() {
	            clearTimeout(_resetTimer);
	            _resetTimer = setTimeout(_resetSequences, 1000);
	        }

	        /**
	         * binds a key sequence to an event
	         *
	         * @param {string} combo - combo specified in bind call
	         * @param {Array} keys
	         * @param {Function} callback
	         * @param {string=} action
	         * @returns void
	         */
	        function _bindSequence(combo, keys, callback, action) {

	            // start off by adding a sequence level record for this combination
	            // and setting the level to 0
	            _sequenceLevels[combo] = 0;

	            /**
	             * callback to increase the sequence level for this sequence and reset
	             * all other sequences that were active
	             *
	             * @param {string} nextAction
	             * @returns {Function}
	             */
	            function _increaseSequence(nextAction) {
	                return function() {
	                    _nextExpectedAction = nextAction;
	                    ++_sequenceLevels[combo];
	                    _resetSequenceTimer();
	                };
	            }

	            /**
	             * wraps the specified callback inside of another function in order
	             * to reset all sequence counters as soon as this sequence is done
	             *
	             * @param {Event} e
	             * @returns void
	             */
	            function _callbackAndReset(e) {
	                _fireCallback(callback, e, combo);

	                // we should ignore the next key up if the action is key down
	                // or keypress.  this is so if you finish a sequence and
	                // release the key the final key will not trigger a keyup
	                if (action !== 'keyup') {
	                    _ignoreNextKeyup = _characterFromEvent(e);
	                }

	                // weird race condition if a sequence ends with the key
	                // another sequence begins with
	                setTimeout(_resetSequences, 10);
	            }

	            // loop through keys one at a time and bind the appropriate callback
	            // function.  for any key leading up to the final one it should
	            // increase the sequence. after the final, it should reset all sequences
	            //
	            // if an action is specified in the original bind call then that will
	            // be used throughout.  otherwise we will pass the action that the
	            // next key in the sequence should match.  this allows a sequence
	            // to mix and match keypress and keydown events depending on which
	            // ones are better suited to the key provided
	            for (var i = 0; i < keys.length; ++i) {
	                var isFinal = i + 1 === keys.length;
	                var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
	                _bindSingle(keys[i], wrappedCallback, action, combo, i);
	            }
	        }

	        /**
	         * binds a single keyboard combination
	         *
	         * @param {string} combination
	         * @param {Function} callback
	         * @param {string=} action
	         * @param {string=} sequenceName - name of sequence if part of sequence
	         * @param {number=} level - what part of the sequence the command is
	         * @returns void
	         */
	        function _bindSingle(combination, callback, action, sequenceName, level) {

	            // store a direct mapped reference for use with Mousetrap.trigger
	            self._directMap[combination + ':' + action] = callback;

	            // make sure multiple spaces in a row become a single space
	            combination = combination.replace(/\s+/g, ' ');

	            var sequence = combination.split(' ');
	            var info;

	            // if this pattern is a sequence of keys then run through this method
	            // to reprocess each pattern one key at a time
	            if (sequence.length > 1) {
	                _bindSequence(combination, sequence, callback, action);
	                return;
	            }

	            info = _getKeyInfo(combination, action);

	            // make sure to initialize array if this is the first time
	            // a callback is added for this key
	            self._callbacks[info.key] = self._callbacks[info.key] || [];

	            // remove an existing match if there is one
	            _getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level);

	            // add this call back to the array
	            // if it is a sequence put it at the beginning
	            // if not put it at the end
	            //
	            // this is important because the way these are processed expects
	            // the sequence ones to come first
	            self._callbacks[info.key][sequenceName ? 'unshift' : 'push']({
	                callback: callback,
	                modifiers: info.modifiers,
	                action: info.action,
	                seq: sequenceName,
	                level: level,
	                combo: combination
	            });
	        }

	        /**
	         * binds multiple combinations to the same callback
	         *
	         * @param {Array} combinations
	         * @param {Function} callback
	         * @param {string|undefined} action
	         * @returns void
	         */
	        self._bindMultiple = function(combinations, callback, action) {
	            for (var i = 0; i < combinations.length; ++i) {
	                _bindSingle(combinations[i], callback, action);
	            }
	        };

	        // start!
	        _addEvent(targetElement, 'keypress', _handleKeyEvent);
	        _addEvent(targetElement, 'keydown', _handleKeyEvent);
	        _addEvent(targetElement, 'keyup', _handleKeyEvent);
	    }

	    /**
	     * binds an event to mousetrap
	     *
	     * can be a single key, a combination of keys separated with +,
	     * an array of keys, or a sequence of keys separated by spaces
	     *
	     * be sure to list the modifier keys first to make sure that the
	     * correct key ends up getting bound (the last key in the pattern)
	     *
	     * @param {string|Array} keys
	     * @param {Function} callback
	     * @param {string=} action - 'keypress', 'keydown', or 'keyup'
	     * @returns void
	     */
	    Mousetrap.prototype.bind = function(keys, callback, action) {
	        var self = this;
	        keys = keys instanceof Array ? keys : [keys];
	        self._bindMultiple.call(self, keys, callback, action);
	        return self;
	    };

	    /**
	     * unbinds an event to mousetrap
	     *
	     * the unbinding sets the callback function of the specified key combo
	     * to an empty function and deletes the corresponding key in the
	     * _directMap dict.
	     *
	     * TODO: actually remove this from the _callbacks dictionary instead
	     * of binding an empty function
	     *
	     * the keycombo+action has to be exactly the same as
	     * it was defined in the bind method
	     *
	     * @param {string|Array} keys
	     * @param {string} action
	     * @returns void
	     */
	    Mousetrap.prototype.unbind = function(keys, action) {
	        var self = this;
	        return self.bind.call(self, keys, function() {}, action);
	    };

	    /**
	     * triggers an event that has already been bound
	     *
	     * @param {string} keys
	     * @param {string=} action
	     * @returns void
	     */
	    Mousetrap.prototype.trigger = function(keys, action) {
	        var self = this;
	        if (self._directMap[keys + ':' + action]) {
	            self._directMap[keys + ':' + action]({}, keys);
	        }
	        return self;
	    };

	    /**
	     * resets the library back to its initial state.  this is useful
	     * if you want to clear out the current keyboard shortcuts and bind
	     * new ones - for example if you switch to another page
	     *
	     * @returns void
	     */
	    Mousetrap.prototype.reset = function() {
	        var self = this;
	        self._callbacks = {};
	        self._directMap = {};
	        return self;
	    };

	    /**
	     * should we stop this event before firing off callbacks
	     *
	     * @param {Event} e
	     * @param {Element} element
	     * @return {boolean}
	     */
	    Mousetrap.prototype.stopCallback = function(e, element) {
	        var self = this;

	        // if the element has the class "mousetrap" then no need to stop
	        if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
	            return false;
	        }

	        if (_belongsTo(element, self.target)) {
	            return false;
	        }

	        // stop for input, select, and textarea
	        return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
	    };

	    /**
	     * exposes _handleKey publicly so it can be overwritten by extensions
	     */
	    Mousetrap.prototype.handleKey = function() {
	        var self = this;
	        return self._handleKey.apply(self, arguments);
	    };

	    /**
	     * Init the global mousetrap functions
	     *
	     * This method is needed to allow the global mousetrap functions to work
	     * now that mousetrap is a constructor function.
	     */
	    Mousetrap.init = function() {
	        var documentMousetrap = Mousetrap(document);
	        for (var method in documentMousetrap) {
	            if (method.charAt(0) !== '_') {
	                Mousetrap[method] = (function(method) {
	                    return function() {
	                        return documentMousetrap[method].apply(documentMousetrap, arguments);
	                    };
	                } (method));
	            }
	        }
	    };

	    Mousetrap.init();

	    // expose mousetrap to the global object
	    window.Mousetrap = Mousetrap;

	    // expose as a common js module
	    if (typeof module !== 'undefined' && module.exports) {
	        module.exports = Mousetrap;
	    }

	    // expose mousetrap as an AMD module
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	            return Mousetrap;
	        }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    }
	}) (window, document);


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6)(__webpack_require__(14))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "/**\n * postal - Pub/Sub library providing wildcard subscriptions, complex message handling, etc.  Works server and client-side.\n * Author: Jim Cowart (http://ifandelse.com)\n * Version: v1.0.2\n * Url: http://github.com/postaljs/postal.js\n * License(s): MIT\n */\n(function (root, factory) { /* istanbul ignore if  */\n    if (typeof define === \"function\" && define.amd) {\n        // AMD. Register as an anonymous module.\n        define([\"lodash\"], function (_) {\n            return factory(_, root);\n        }); /* istanbul ignore else */\n    } else if (typeof module === \"object\" && module.exports) {\n        // Node, or CommonJS-Like environments\n        module.exports = factory(require(\"lodash\"), this);\n    } else {\n        // Browser globals\n        root.postal = factory(root._, root);\n    }\n}(this, function (_, global, undefined) {\n    var prevPostal = global.postal;\n    var _defaultConfig = {\n        DEFAULT_CHANNEL: \"/\",\n        SYSTEM_CHANNEL: \"postal\",\n        enableSystemMessages: true,\n        cacheKeyDelimiter: \"|\",\n        autoCompactResolver: false\n    };\n    var postal = {\n        configuration: _.extend({}, _defaultConfig)\n    };\n    var _config = postal.configuration;\n    var ChannelDefinition = function (channelName, bus) {\n        this.bus = bus;\n        this.channel = channelName || _config.DEFAULT_CHANNEL;\n    };\n    ChannelDefinition.prototype.subscribe = function () {\n        return this.bus.subscribe({\n            channel: this.channel,\n            topic: (arguments.length === 1 ? arguments[0].topic : arguments[0]),\n            callback: (arguments.length === 1 ? arguments[0].callback : arguments[1])\n        });\n    };\n/*\n    publish( envelope [, callback ] );\n    publish( topic, data [, callback ] );\n*/\n    ChannelDefinition.prototype.publish = function () {\n        var envelope = {};\n        var callback;\n        if (typeof arguments[0] === \"string\") {\n            envelope.topic = arguments[0];\n            envelope.data = arguments[1];\n            callback = arguments[2];\n        } else {\n            envelope = arguments[0];\n            callback = arguments[1];\n        }\n        envelope.channel = this.channel;\n        this.bus.publish(envelope, callback);\n    };\n    var SubscriptionDefinition = function (channel, topic, callback) {\n        if (arguments.length !== 3) {\n            throw new Error(\"You must provide a channel, topic and callback when creating a SubscriptionDefinition instance.\");\n        }\n        if (topic.length === 0) {\n            throw new Error(\"Topics cannot be empty\");\n        }\n        this.channel = channel;\n        this.topic = topic;\n        this.callback = callback;\n        this.pipeline = [];\n        this.cacheKeys = [];\n        this._context = undefined;\n    };\n    var ConsecutiveDistinctPredicate = function () {\n        var previous;\n        return function (data) {\n            var eq = false;\n            if (typeof data == 'string') {\n                eq = data === previous;\n                previous = data;\n            } else {\n                eq = _.isEqual(data, previous);\n                previous = _.extend({}, data);\n            }\n            return !eq;\n        };\n    };\n    var DistinctPredicate = function DistinctPredicateFactory() {\n        var previous = [];\n        return function DistinctPredicate(data) {\n            var isDistinct = !_.any(previous, function (p) {\n                return _.isEqual(data, p);\n            });\n            if (isDistinct) {\n                previous.push(data);\n            }\n            return isDistinct;\n        };\n    };\n    SubscriptionDefinition.prototype = {\n        \"catch\": function (errorHandler) {\n            var original = this.callback;\n            var safeCallback = function () {\n                try {\n                    original.apply(this, arguments);\n                } catch (err) {\n                    errorHandler(err, arguments[0]);\n                }\n            };\n            this.callback = safeCallback;\n            return this;\n        },\n        defer: function defer() {\n            return this.delay(0);\n        },\n        disposeAfter: function disposeAfter(maxCalls) {\n            if (typeof maxCalls != 'number' || maxCalls <= 0) {\n                throw new Error(\"The value provided to disposeAfter (maxCalls) must be a number greater than zero.\");\n            }\n            var self = this;\n            var dispose = _.after(maxCalls, _.bind(function () {\n                self.unsubscribe();\n            }));\n            self.pipeline.push(function (data, env, next) {\n                next(data, env);\n                dispose();\n            });\n            return self;\n        },\n        distinct: function distinct() {\n            return this.constraint(new DistinctPredicate());\n        },\n        distinctUntilChanged: function distinctUntilChanged() {\n            return this.constraint(new ConsecutiveDistinctPredicate());\n        },\n        invokeSubscriber: function invokeSubscriber(data, env) {\n            if (!this.inactive) {\n                var self = this;\n                var pipeline = self.pipeline;\n                var len = pipeline.length;\n                var context = self._context;\n                var idx = -1;\n                var invoked = false;\n                if (!len) {\n                    self.callback.call(context, data, env);\n                    invoked = true;\n                } else {\n                    pipeline = pipeline.concat([self.callback]);\n                    var step = function step(d, e) {\n                        idx += 1;\n                        if (idx < len) {\n                            pipeline[idx].call(context, d, e, step);\n                        } else {\n                            self.callback.call(context, d, e);\n                            invoked = true;\n                        }\n                    };\n                    step(data, env, 0);\n                }\n                return invoked;\n            }\n        },\n        logError: function logError() { /* istanbul ignore else */\n            if (console) {\n                var report;\n                if (console.warn) {\n                    report = console.warn;\n                } else {\n                    report = console.log;\n                }\n                this[\"catch\"](report);\n            }\n            return this;\n        },\n        once: function once() {\n            return this.disposeAfter(1);\n        },\n        subscribe: function subscribe(callback) {\n            this.callback = callback;\n            return this;\n        },\n        unsubscribe: function unsubscribe() { /* istanbul ignore else */\n            if (!this.inactive) {\n                postal.unsubscribe(this);\n            }\n        },\n        constraint: function constraint(predicate) {\n            if (typeof predicate != 'function') {\n                throw new Error(\"Predicate constraint must be a function\");\n            }\n            this.pipeline.push(function (data, env, next) {\n                if (predicate.call(this, data, env)) {\n                    next(data, env);\n                }\n            });\n            return this;\n        },\n        constraints: function constraints(predicates) {\n            var self = this; /* istanbul ignore else */\n            _.each(predicates, function (predicate) {\n                self.constraint(predicate);\n            });\n            return self;\n        },\n        context: function contextSetter(context) {\n            this._context = context;\n            return this;\n        },\n        debounce: function debounce(milliseconds, immediate) {\n            if (typeof milliseconds != 'number') {\n                throw new Error(\"Milliseconds must be a number\");\n            }\n            this.pipeline.push(\n            _.debounce(function (data, env, next) {\n                next(data, env);\n            }, milliseconds, !! immediate));\n            return this;\n        },\n        delay: function delay(milliseconds) {\n            if (typeof milliseconds != 'number') {\n                throw new Error(\"Milliseconds must be a number\");\n            }\n            var self = this;\n            self.pipeline.push(function (data, env, next) {\n                setTimeout(function () {\n                    next(data, env);\n                }, milliseconds);\n            });\n            return this;\n        },\n        throttle: function throttle(milliseconds) {\n            if (typeof milliseconds != 'number') {\n                throw new Error(\"Milliseconds must be a number\");\n            }\n            var fn = function (data, env, next) {\n                next(data, env);\n            };\n            this.pipeline.push(_.throttle(fn, milliseconds));\n            return this;\n        }\n    };\n    // Backwards Compatibility\n    // WARNING: these will be removed by version 0.13\n\n\n    function warnOnDeprecation(oldMethod, newMethod) {\n        return function () {\n            if (console.warn || console.log) {\n                var msg = \"Warning, the \" + oldMethod + \" method has been deprecated. Please use \" + newMethod + \" instead.\";\n                if (console.warn) {\n                    console.warn(msg);\n                } else {\n                    console.log(msg);\n                }\n            }\n            return SubscriptionDefinition.prototype[newMethod].apply(this, arguments);\n        };\n    }\n    var oldMethods = [\"withConstraint\", \"withConstraints\", \"withContext\", \"withDebounce\", \"withDelay\", \"withThrottle\"];\n    var newMethods = [\"constraint\", \"constraints\", \"context\", \"debounce\", \"delay\", \"throttle\"];\n    for (var i = 0; i < 6; i++) {\n        var oldMethod = oldMethods[i];\n        SubscriptionDefinition.prototype[oldMethod] = warnOnDeprecation(oldMethod, newMethods[i]);\n    }\n    var bindingsResolver = _config.resolver = {\n        cache: {},\n        regex: {},\n        enableCache: true,\n        compare: function compare(binding, topic, headerOptions) {\n            var pattern;\n            var rgx;\n            var prevSegment;\n            var cacheKey = topic + _config.cacheKeyDelimiter + binding;\n            var result = (this.cache[cacheKey]);\n            var opt = headerOptions || {};\n            var saveToCache = this.enableCache && !opt.resolverNoCache;\n            // result is cached?\n            if (result === true) {\n                return result;\n            }\n            // plain string matching?\n            if (binding.indexOf(\"#\") === -1 && binding.indexOf(\"*\") === -1) {\n                result = (topic === binding);\n                if (saveToCache) {\n                    this.cache[cacheKey] = result;\n                }\n                return result;\n            }\n            // ah, regex matching, then\n            if (!(rgx = this.regex[binding])) {\n                pattern = \"^\" + _.map(binding.split(\".\"), function mapTopicBinding(segment) {\n                    var res = \"\";\n                    if ( !! prevSegment) {\n                        res = prevSegment !== \"#\" ? \"\\\\.\\\\b\" : \"\\\\b\";\n                    }\n                    if (segment === \"#\") {\n                        res += \"[\\\\s\\\\S]*\";\n                    } else if (segment === \"*\") {\n                        res += \"[^.]+\";\n                    } else {\n                        res += segment;\n                    }\n                    prevSegment = segment;\n                    return res;\n                }).join(\"\") + \"$\";\n                rgx = this.regex[binding] = new RegExp(pattern);\n            }\n            result = rgx.test(topic);\n            if (saveToCache) {\n                this.cache[cacheKey] = result;\n            }\n            return result;\n        },\n        reset: function reset() {\n            this.cache = {};\n            this.regex = {};\n        },\n        purge: function (options) {\n            var self = this;\n            var keyDelimiter = _config.cacheKeyDelimiter;\n            var matchPredicate = function (val, key) {\n                var split = key.split(keyDelimiter);\n                var topic = split[0];\n                var binding = split[1];\n                if ((typeof options.topic === \"undefined\" || options.topic === topic) && (typeof options.binding === \"undefined\" || options.binding === binding)) {\n                    delete self.cache[key];\n                }\n            };\n            var compactPredicate = function (val, key) {\n                var split = key.split(keyDelimiter);\n                if (postal.getSubscribersFor({\n                    topic: split[0]\n                }).length === 0) {\n                    delete self.cache[key];\n                }\n            };\n            if (typeof options === \"undefined\") {\n                this.reset();\n            } else {\n                var handler = options.compact === true ? compactPredicate : matchPredicate;\n                _.each(this.cache, handler);\n            }\n        }\n    };\n    var pubInProgress = 0;\n    var unSubQueue = [];\n    var autoCompactIndex = 0;\n    function clearUnSubQueue() {\n        while (unSubQueue.length) {\n            postal.unsubscribe(unSubQueue.shift());\n        }\n    }\n    function getCachePurger(subDef, key, cache) {\n        return function (sub, i, list) {\n            if (sub === subDef) {\n                list.splice(i, 1);\n            }\n            if (list.length === 0) {\n                delete cache[key];\n            }\n        };\n    }\n    function getCacher(topic, cache, cacheKey, done, envelope) {\n        var headers = envelope && envelope.headers || {};\n        return function (subDef) {\n            if (_config.resolver.compare(subDef.topic, topic, headers)) {\n                cache.push(subDef);\n                subDef.cacheKeys.push(cacheKey);\n                if (done) {\n                    done(subDef);\n                }\n            }\n        };\n    }\n    function getSystemMessage(kind, subDef) {\n        return {\n            channel: _config.SYSTEM_CHANNEL,\n            topic: \"subscription.\" + kind,\n            data: {\n                event: \"subscription.\" + kind,\n                channel: subDef.channel,\n                topic: subDef.topic\n            }\n        };\n    }\n    var sysCreatedMessage = _.bind(getSystemMessage, this, \"created\");\n    var sysRemovedMessage = _.bind(getSystemMessage, this, \"removed\");\n    function getPredicate(options, resolver) {\n        if (typeof options === \"function\") {\n            return options;\n        } else if (!options) {\n            return function () {\n                return true;\n            };\n        } else {\n            return function (sub) {\n                var compared = 0,\n                    matched = 0;\n                _.each(options, function (val, prop) {\n                    compared += 1;\n                    if (\n                    // We use the bindings resolver to compare the options.topic to subDef.topic\n                    (prop === \"topic\" && resolver.compare(sub.topic, options.topic, {\n                        resolverNoCache: true\n                    })) || (prop === \"context\" && options.context === sub._context)\n                    // Any other potential prop/value matching outside topic & context...\n                    || (sub[prop] === options[prop])) {\n                        matched += 1;\n                    }\n                });\n                return compared === matched;\n            };\n        }\n    }\n    _.extend(postal, {\n        cache: {},\n        subscriptions: {},\n        wireTaps: [],\n        ChannelDefinition: ChannelDefinition,\n        SubscriptionDefinition: SubscriptionDefinition,\n        channel: function channel(channelName) {\n            return new ChannelDefinition(channelName, this);\n        },\n        addWireTap: function addWireTap(callback) {\n            var self = this;\n            self.wireTaps.push(callback);\n            return function () {\n                var idx = self.wireTaps.indexOf(callback);\n                if (idx !== -1) {\n                    self.wireTaps.splice(idx, 1);\n                }\n            };\n        },\n        noConflict: function noConflict() { /* istanbul ignore else */\n            if (typeof window === \"undefined\" || (typeof window !== \"undefined\" && typeof define === \"function\" && define.amd)) {\n                throw new Error(\"noConflict can only be used in browser clients which aren't using AMD modules\");\n            }\n            global.postal = prevPostal;\n            return this;\n        },\n        getSubscribersFor: function getSubscribersFor(options) {\n            var result = [];\n            var self = this;\n            _.each(self.subscriptions, function (channel) {\n                _.each(channel, function (subList) {\n                    result = result.concat(_.filter(subList, getPredicate(options, _config.resolver)));\n                });\n            });\n            return result;\n        },\n        publish: function publish(envelope, cb) {\n            ++pubInProgress;\n            var channel = envelope.channel = envelope.channel || _config.DEFAULT_CHANNEL;\n            var topic = envelope.topic;\n            envelope.timeStamp = new Date();\n            if (this.wireTaps.length) {\n                _.each(this.wireTaps, function (tap) {\n                    tap(envelope.data, envelope, pubInProgress);\n                });\n            }\n            var cacheKey = channel + _config.cacheKeyDelimiter + topic;\n            var cache = this.cache[cacheKey];\n            var skipped = 0;\n            var activated = 0;\n            if (!cache) {\n                cache = this.cache[cacheKey] = [];\n                var cacherFn = getCacher(\n                topic, cache, cacheKey, function (candidate) {\n                    if (candidate.invokeSubscriber(envelope.data, envelope)) {\n                        activated++;\n                    } else {\n                        skipped++;\n                    }\n                }, envelope);\n                _.each(this.subscriptions[channel], function (candidates) {\n                    _.each(candidates, cacherFn);\n                });\n            } else {\n                _.each(cache, function (subDef) {\n                    if (subDef.invokeSubscriber(envelope.data, envelope)) {\n                        activated++;\n                    } else {\n                        skipped++;\n                    }\n                });\n            }\n            if (--pubInProgress === 0) {\n                clearUnSubQueue();\n            }\n            if (cb) {\n                cb({\n                    activated: activated,\n                    skipped: skipped\n                });\n            }\n        },\n        reset: function reset() {\n            this.unsubscribeFor();\n            _config.resolver.reset();\n            this.subscriptions = {};\n        },\n        subscribe: function subscribe(options) {\n            var subscriptions = this.subscriptions;\n            var subDef = new SubscriptionDefinition(options.channel || _config.DEFAULT_CHANNEL, options.topic, options.callback);\n            var channel = subscriptions[subDef.channel];\n            var channelLen = subDef.channel.length;\n            var subs;\n            if (!channel) {\n                channel = subscriptions[subDef.channel] = {};\n            }\n            subs = subscriptions[subDef.channel][subDef.topic];\n            if (!subs) {\n                subs = subscriptions[subDef.channel][subDef.topic] = [];\n            }\n            // First, add the SubscriptionDefinition to the channel list\n            subs.push(subDef);\n            // Next, add the SubscriptionDefinition to any relevant existing cache(s)\n            _.each(this.cache, function (list, cacheKey) {\n                if (cacheKey.substr(0, channelLen) === subDef.channel) {\n                    getCacher(\n                    cacheKey.split(_config.cacheKeyDelimiter)[1], list, cacheKey)(subDef);\n                }\n            }); /* istanbul ignore else */\n            if (_config.enableSystemMessages) {\n                this.publish(sysCreatedMessage(subDef));\n            }\n            return subDef;\n        },\n        unsubscribe: function unsubscribe() {\n            var unSubLen = arguments.length;\n            var unSubIdx = 0;\n            var subDef;\n            var channelSubs;\n            var topicSubs;\n            var idx;\n            for (; unSubIdx < unSubLen; unSubIdx++) {\n                subDef = arguments[unSubIdx];\n                subDef.inactive = true;\n                if (pubInProgress) {\n                    unSubQueue.push(subDef);\n                    return;\n                }\n                channelSubs = this.subscriptions[subDef.channel];\n                topicSubs = channelSubs && channelSubs[subDef.topic]; /* istanbul ignore else */\n                if (topicSubs) {\n                    var len = topicSubs.length;\n                    idx = 0;\n                    // remove SubscriptionDefinition from channel list\n                    while (idx < len) { /* istanbul ignore else */\n                        if (topicSubs[idx] === subDef) {\n                            topicSubs.splice(idx, 1);\n                            break;\n                        }\n                        idx += 1;\n                    }\n                    if (topicSubs.length === 0) {\n                        delete channelSubs[subDef.topic];\n                        if (!_.keys(channelSubs).length) {\n                            delete this.subscriptions[subDef.channel];\n                        }\n                    }\n                    // remove SubscriptionDefinition from postal cache\n                    if (subDef.cacheKeys && subDef.cacheKeys.length) {\n                        var key;\n                        while (key = subDef.cacheKeys.pop()) {\n                            _.each(this.cache[key], getCachePurger(subDef, key, this.cache));\n                        }\n                    }\n                    if (typeof _config.resolver.purge === \"function\") {\n                        // check to see if relevant resolver cache entries can be purged\n                        var autoCompact = _config.autoCompactResolver === true ? 0 : typeof _config.autoCompactResolver === \"number\" ? (_config.autoCompactResolver - 1) : false;\n                        if (autoCompact >= 0 && autoCompactIndex === autoCompact) {\n                            _config.resolver.purge({\n                                compact: true\n                            });\n                            autoCompactIndex = 0;\n                        } else if (autoCompact >= 0 && autoCompactIndex < autoCompact) {\n                            autoCompactIndex += 1;\n                        }\n                    }\n                }\n                if (_config.enableSystemMessages) {\n                    this.publish(sysRemovedMessage(subDef));\n                }\n            }\n        },\n        unsubscribeFor: function unsubscribeFor(options) {\n            var toDispose = []; /* istanbul ignore else */\n            if (this.subscriptions) {\n                toDispose = this.getSubscribersFor(options);\n                this.unsubscribe.apply(this, toDispose);\n            }\n        }\n    });\n    if (global && Object.prototype.hasOwnProperty.call(global, \"__postalReady__\") && _.isArray(global.__postalReady__)) {\n        while (global.__postalReady__.length) {\n            global.__postalReady__.shift().onReady(postal);\n        }\n    }\n    return postal;\n}));"

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var UnknownPreviewer;

	UnknownPreviewer = React.createClass({

	  /* Construction */
	  displayName: "UnknownPreviewer",

	  /* Render */
	  render: function() {
	    return React.createElement("div", {className: "mk-block-content"}, 
	      React.createElement("h4", null, "Unknown Block Type: ", this.props.block.type), 
	      React.createElement("pre", null, JSON.stringify(this.props.block.data, null, 2))
	    );
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = UnknownPreviewer;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ExpandingTextarea, TextEditor;

	ExpandingTextarea = __webpack_require__(35);

	TextEditor = React.createClass({

	  /* Construction */
	  displayName: "TextEditor",
	  propTypes: {
	    block: React.PropTypes.object.isRequired
	  },

	  /* Render */
	  render: function() {
	    return React.createElement(ExpandingTextarea, React.__spread({},  this.props));
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = TextEditor;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var TextPreviewer;

	TextPreviewer = React.createClass({

	  /* Construction */
	  displayName: "TextPreviewer",
	  propTypes: {
	    block: React.PropTypes.object.isRequired
	  },

	  /* Render */
	  render: function() {
	    return React.createElement("pre", null, this.props.block.data.text);
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = TextPreviewer;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ExpandingTextarea, HtmlEditor;

	ExpandingTextarea = __webpack_require__(35);

	HtmlEditor = React.createClass({

	  /* Construction */
	  displayName: "HtmlEditor",

	  /* Render */
	  render: function() {
	    return (React.createElement("div", {className: "mk-block-content"}, 
	       React.createElement(ExpandingTextarea, React.__spread({},  this.props))
	     )
	    );
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = HtmlEditor;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var HtmlPreviewer;

	HtmlPreviewer = React.createClass({

	  /* Construction */
	  displayName: "HtmlPreviewer",

	  /* Render */
	  render: function() {
	    var html;
	    html = this.props.block.data.text;
	    return React.createElement("div", {className: "mk-block-content", dangerouslySetInnerHTML: {__html: html}});
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = HtmlPreviewer;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ExpandingTextarea, JavascriptEditor;

	ExpandingTextarea = __webpack_require__(35);

	JavascriptEditor = React.createClass({

	  /* Construction */
	  displayName: "JavascriptEditor",

	  /* Render */
	  render: function() {
	    return React.createElement(ExpandingTextarea, React.__spread({},  this.props));
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = JavascriptEditor;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var JavascriptPreviewer;

	JavascriptPreviewer = React.createClass({

	  /* Construction */
	  displayName: "JavascriptPreviewer",

	  /* Render */
	  render: function() {
	    var js;
	    js = this.props.block.data.text;
	    return React.createElement("pre", {ref: "js"}, js);
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = JavascriptPreviewer;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var Channel, ExpandingTextarea, MarkdownEditor;

	Channel = postal.channel("makona");

	ExpandingTextarea = __webpack_require__(35);

	MarkdownEditor = React.createClass({

	  /* Construction */
	  displayName: "MarkdownEditor",
	  propTypes: {
	    block: React.PropTypes.object.isRequired
	  },
	  getInitialState: function() {
	    return {
	      selectionPresent: false
	    };
	  },

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", {className: "mk-block-content", cursorPosition: 0, positionCursor: false}, 
	        React.createElement("div", {className: "mk-toolbar"}, 
	          React.createElement("button", {onClick: this.wrapSelectedWith.bind(this, "**"), disabled: !this.state.selectionPresent}, "Bold"), 
	          React.createElement("button", {onClick: this.wrapSelectedWith.bind(this, "*"), disabled: !this.state.selectionPresent}, "Italic"), 
	          React.createElement("button", {onClick: this.insertAtCaret.bind(this, "\n---\n")}, "HR"), 
	          React.createElement("button", {onClick: this.insertAtStartOfLine.bind(this, "# ")}, "H1"), 
	          React.createElement("button", {onClick: this.insertAtStartOfLine.bind(this, "## ")}, "H2")
	        ), 
	        React.createElement(ExpandingTextarea, React.__spread({},  this.props, {handleSelect: this.handleSelect, handleKeyDown: this.handleKeyDown, ref: "eta"}))
	      )
	    );
	  },

	  /* Life Cycle */
	  componentDidUpdate: function() {
	    if ((this.textArea() != null) && (this.props.block.positionCursor != null) && this.props.block.positionCursor) {
	      this.textArea().setSelectionRange(this.props.block.cursorPosition, this.props.block.cursorPosition);
	      return this.props.block.positionCursor = false;
	    }
	  },

	  /* Custom Methods */
	  handleKeyDown: function(e) {
	    var newBlock;
	    if ((e.metaKey || e.ctrlKey) && e.keyCode === 13) {
	      newBlock = _.extend({}, this.props.block, {
	        mode: 'preview'
	      });
	      if ((e.metaKey || e.ctrlKey) && e.keyCode === 13) {
	        return Channel.publish("block.change", {
	          block: newBlock
	        });
	      }
	    }
	  },
	  handleSelect: function(e, id) {
	    var after, before, ref, selected;
	    ref = this.textArea().getChunks(), before = ref.before, selected = ref.selected, after = ref.after;
	    return this.setState({
	      selectionPresent: selected.length > 0 ? true : false
	    });
	  },
	  publishChange: function(text, cursorPosition) {
	    var newBlock;
	    if (cursorPosition != null) {
	      newBlock = _.extend({}, this.props.block, {
	        positionCursor: cursorPosition != null,
	        cursorPosition: cursorPosition
	      });
	    } else {
	      newBlock = _.cloneDeep(this.props.block);
	    }
	    newBlock.data.text = text;
	    return Channel.publish("block.change", {
	      block: newBlock
	    });
	  },
	  insertAtCaret: function(chars, e) {
	    var after, before, cursorPos, ref, selected, text;
	    e.preventDefault();
	    ref = this.textArea().getChunks(), before = ref.before, selected = ref.selected, after = ref.after;
	    text = before + chars + selected + after;
	    cursorPos = before.length + chars.length;
	    return this.publishChange(text, cursorPos);
	  },
	  insertAtStartOfLine: function(chars, e) {
	    var after, before, combinedLines, cursorPos, lines, ref, selected, text, theLine;
	    e.preventDefault();
	    ref = this.textArea().getChunks(), before = ref.before, selected = ref.selected, after = ref.after;
	    lines = before.split("\n");
	    theLine = lines.pop();
	    if (theLine.slice(0, +(chars.length - 1) + 1 || 9e9) === chars) {
	      combinedLines = lines.length === 0 ? "" : lines.join("\n") + "\n";
	      text = combinedLines + theLine.slice(chars.length, +theLine.length + 1 || 9e9) + selected + after;
	      cursorPos = before.length - chars.length;
	    } else {
	      combinedLines = lines.length === 0 ? "" : lines.join("\n") + "\n";
	      text = combinedLines + chars + theLine + selected + after;
	      cursorPos = before.length + chars.length;
	    }
	    return this.publishChange(text, cursorPos);
	  },
	  wrapSelectedWith: function(chars, e) {
	    var after, before, cursorPos, ref, selected, text;
	    e.preventDefault();
	    ref = this.textArea().getChunks(), before = ref.before, selected = ref.selected, after = ref.after;
	    if (selected.length > 0 && selected.slice(0, +(chars.length - 1) + 1 || 9e9) !== chars) {
	      text = before + chars + selected + chars + after;
	      this.publishChange(text);
	      cursorPos = before.length + chars.length + selected.length + chars.length;
	    }
	    return this.publishChange(text, cursorPos);
	  },
	  textArea: function() {
	    if (this.refs.eta != null) {
	      return this.refs.eta;
	    } else {
	      return false;
	    }
	  }
	});

	module.exports = MarkdownEditor;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var MarkdownPreviewer, marked;

	marked = __webpack_require__(38);

	marked.setOptions({
	  gfm: true,
	  tables: true,
	  breaks: true,
	  pedantic: true,
	  sanitize: true,
	  smartLists: true,
	  smartypants: false
	});

	MarkdownPreviewer = React.createClass({

	  /* Construction */
	  displayName: "MarkdownPreviewer",

	  /* Render */
	  render: function() {
	    var html;
	    html = marked(this.props.block.data.text);
	    return React.createElement("div", {className: "mk-block-content", dangerouslySetInnerHTML: {__html: html}});
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = MarkdownPreviewer;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ExpandingTextarea, QuoteEditor;

	ExpandingTextarea = __webpack_require__(35);

	QuoteEditor = React.createClass({

	  /* Construction */
	  displayName: "QuoteEditor",

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", {className: "mk-block-content"}, 
	        React.createElement(ExpandingTextarea, React.__spread({},  this.props)), 
	        React.createElement("br", null), 
	        React.createElement("input", {value: this.props.block.data.cite, ref: "cite", onChange: this.handleChange})
	      )
	    );
	  },

	  /* Life Cycle */

	  /* Custom Methods */
	  handleChange: function() {
	    var cite;
	    cite = this.refs.cite.getDOMNode().value;
	    return this.props.handleChange({
	      id: this.props.block.id,
	      data: {
	        cite: cite
	      }
	    });
	  }
	});

	module.exports = QuoteEditor;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var QuotePreviewer;

	QuotePreviewer = React.createClass({

	  /* Construction */
	  displayName: "QuotePreviewer",

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", {className: "mk-block-content"}, 
	        React.createElement("pre", null, this.props.block.data.text), 
	        "By ", React.createElement("i", null, this.props.block.data.cite)
	      )
	    );
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = QuotePreviewer;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var Channel, CodeEditor, ExpandingTextarea;

	Channel = postal.channel("makona");

	ExpandingTextarea = __webpack_require__(35);

	__webpack_require__(36);

	CodeEditor = React.createClass({

	  /* Construction */
	  displayName: "CodeEditor",
	  propTypes: {
	    block: React.PropTypes.object.isRequired
	  },

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", {className: "mk-block-content"}, 
	        React.createElement(ExpandingTextarea, React.__spread({},  this.props, {ref: "text", onChange: this.handleChange})), 
	        React.createElement("br", null), 
	        React.createElement("label", null, "Language: "), 
	        React.createElement("select", {value: this.props.block.data.lang, ref: "lang", onChange: this.handleLangChange}, 
	          this.options()
	        )
	      )
	    );
	  },

	  /* Life Cycle */

	  /* Custom Methods */
	  languages: function() {
	    return hljs.listLanguages();
	  },
	  options: function() {
	    var all_options, i, j, language, len, ref;
	    all_options = [];
	    ref = this.languages();
	    for (i = j = 0, len = ref.length; j < len; i = ++j) {
	      language = ref[i];
	      all_options.push(React.createElement("option", {key: i, value: language}, language));
	    }
	    return all_options;
	  },
	  handleLangChange: function(e) {
	    var newBlock;
	    newBlock = _.extend({}, this.props.block, {
	      data: {
	        lang: this.refs.lang.getDOMNode().value,
	        text: this.props.block.data.text
	      }
	    });
	    return Channel.publish("block.change", {
	      block: newBlock
	    });
	  }
	});

	module.exports = CodeEditor;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var Channel, CodePreviewer;

	Channel = postal.channel("makona");

	__webpack_require__(36);

	CodePreviewer = React.createClass({

	  /* Construction */
	  displayName: "CodePreviewer",

	  /* Render */
	  render: function() {
	    var highlighted_code;
	    if (this.props.block.data.lang != null) {
	      highlighted_code = hljs.highlight(this.props.block.data.lang, this.props.block.data.text, true).value;
	    } else {
	      highlighted_code = this.props.block.data.text;
	    }
	    return (
	      React.createElement("div", {className: "mk-block-content"}, 
	        React.createElement("div", {className: "mk-block-label"}, this.props.block.data.lang), 
	        React.createElement("pre", null, React.createElement("code", {dangerouslySetInnerHTML: {__html: highlighted_code}}))
	      )
	    );
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = CodePreviewer;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ImageEditor, ImagePreviewer;

	ImagePreviewer = __webpack_require__(29);

	ImageEditor = React.createClass({

	  /* Construction */
	  displayName: "ImageEditor",

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", null, 
	         (this.props.block.data.src.length > 0) ? React.createElement(ImagePreviewer, {block: this.props.block}) : React.createElement("div", {ref: "fineuploader"})
	      )
	    );
	  },

	  /* Life Cycle */
	  componentDidMount: function() {},
	  shouldComponentUpdate: function() {
	    return false;
	  },
	  componentWillUnmount: function() {}

	  /* Custom Methods */
	});

	module.exports = ImageEditor;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ImagePreviewer;

	ImagePreviewer = React.createClass({

	  /* Construction */
	  displayName: "ImagePreviewer",

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", {className: "mk-block-content"}, 
	        React.createElement("img", {src: this.props.block.data.src})
	      )
	    );
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = ImagePreviewer;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var DocumentEditor, DocumentPreviewer;

	DocumentPreviewer = __webpack_require__(31);

	DocumentEditor = React.createClass({

	  /* Construction */
	  displayName: "DocumentEditor",

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", null, 
	         (this.props.block.data.title.length > 0) ? React.createElement(DocumentPreviewer, {block: this.props.block}) : React.createElement("div", {ref: "fineuploader"})
	      )
	    );
	  },

	  /* Life Cycle */
	  componentDidMount: function() {},
	  shouldComponentUpdate: function() {
	    return false;
	  },
	  componentWillUnmount: function() {}

	  /* Custom Methods */
	});

	module.exports = DocumentEditor;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var DocumentPreviewer;

	DocumentPreviewer = React.createClass({

	  /* Construction */
	  displayName: "DocumentPreviewer",

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", {className: "mk-block-content"}, 
	        React.createElement("a", {href: this.props.block.data.url, target: "_blank"}, 
	          React.createElement("img", {src: "http://t1.development.kaleosoftware.com" + this.props.block.data.icon_url}), React.createElement("span", null, this.props.block.data.title)
	        )
	      )
	    );
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = DocumentPreviewer;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ScreencastEditor;

	ScreencastEditor = React.createClass({

	  /* Construction */
	  displayName: "ScreencastEditor",

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", null, 
	        "Screencast"
	      )
	    );
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = ScreencastEditor;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ScreencastPreviewer;

	ScreencastPreviewer = React.createClass({

	  /* Construction */
	  displayName: "ScreencastPreviewer",

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", null, 
	        "Screencast"
	      )
	    );
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = ScreencastPreviewer;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * adds a bindGlobal method to Mousetrap that allows you to
	 * bind specific keyboard shortcuts that will still work
	 * inside a text input field
	 *
	 * usage:
	 * Mousetrap.bindGlobal('ctrl+s', _saveChanges);
	 */
	/* global Mousetrap:true */
	(function(Mousetrap) {
	    var _globalCallbacks = {};
	    var _originalStopCallback = Mousetrap.prototype.stopCallback;

	    Mousetrap.prototype.stopCallback = function(e, element, combo, sequence) {
	        var self = this;

	        if (self.paused) {
	            return true;
	        }

	        if (_globalCallbacks[combo] || _globalCallbacks[sequence]) {
	            return false;
	        }

	        return _originalStopCallback.call(self, e, element, combo);
	    };

	    Mousetrap.prototype.bindGlobal = function(keys, callback, action) {
	        var self = this;
	        self.bind(keys, callback, action);

	        if (keys instanceof Array) {
	            for (var i = 0; i < keys.length; i++) {
	                _globalCallbacks[keys[i]] = true;
	            }
	            return;
	        }

	        _globalCallbacks[keys] = true;
	    };

	    Mousetrap.init();
	}) (Mousetrap);
	;



/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var Channel, ExpandingTextarea;

	Channel = postal.channel("makona");

	ExpandingTextarea = React.createClass({

	  /* Construction */
	  propTypes: {
	    block: React.PropTypes.object.isRequired,
	    handleSelect: React.PropTypes.func,
	    handleChange: React.PropTypes.func
	  },
	  displayName: "ExpandingTextarea",
	  cloneCSSProperties: ['lineHeight', 'textDecoration', 'letterSpacing', 'fontSize', 'fontFamily', 'fontStyle', 'fontWeight', 'textTransform', 'textAlign', 'direction', 'wordSpacing', 'fontSizeAdjust', 'wordWrap', 'word-break', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth', 'borderBottomWidth', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'boxSizing', 'webkitBoxSizing', 'mozBoxSizing', 'msBoxSizing'],
	  containerStyle: {
	    position: "relative"
	  },
	  textareaStyle: {
	    position: "absolute",
	    height: "100%",
	    width: "100%",
	    resize: "none",
	    marginBottom: "5px",
	    background: "transparent"
	  },
	  preStyle: {
	    visibility: "hidden",
	    border: "0 solid",
	    whiteSpace: "pre-wrap"
	  },
	  originalTextareaStyles: {},
	  getDefaultProps: function() {
	    return {
	      handleSelect: function() {},
	      handleKeyDown: function(e) {},
	      handleChange: function(e) {
	        var bd, newBlock;
	        newBlock = _.cloneDeep(this.props.block);
	        bd = this.props.block.data;
	        if (typeof bd.default_text === "function" ? bd.default_text(bd.default_text.length && bd.text.length) : void 0) {
	          newBlock.data.default_text = '';
	        }
	        newBlock.data.text = e.target.value;
	        return Channel.publish("block.change", {
	          block: newBlock
	        });
	      }
	    };
	  },

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", {style: this.containerStyle}, 
	        React.createElement("textarea", {block: this.props.block, onKeyDown: this.props.handleKeyDown, onChange: this.props.handleChange, onSelect: this.props.handleSelect, style: this.textareaStyle, value: this.content(), ref: "text"}), 
	        React.createElement("pre", {ref: "pre", style: this.preStyle}, React.createElement("div", null, this.props.block.data.text+" "))
	      )
	    );
	  },

	  /* Life Cycle */
	  componentDidMount: function() {
	    var $pre, $textarea;
	    $textarea = $(this.refs.text.getDOMNode());
	    this.originalTextareaStyles = _.zipObject(this.cloneCSSProperties, _.map(this.cloneCSSProperties, function(p) {
	      return $textarea.css(p);
	    }));
	    $pre = $(this.refs.pre.getDOMNode());
	    return _.forIn(this.originalTextareaStyles, function(val, prop) {
	      if ($pre.css(prop) !== val) {
	        return $pre.css(prop, val);
	      }
	    });
	  },
	  componentDidUpdate: function() {
	    var bd;
	    bd = this.props.block.data;
	    if ((bd.default_text != null) && bd.default_text.length && !bd.text.length) {
	      return this.refs.text.getDOMNode().setSelectionRange(0, bd.default_text.length);
	    }
	  },

	  /* Custom Methods */
	  content: function() {
	    var bd;
	    bd = this.props.block.data;
	    if ((bd.default_text != null) && bd.default_text.length && !bd.text.length) {
	      return bd.default_text;
	    } else {
	      return bd.text;
	    }
	  },
	  getChunks: function() {
	    var end, ref, start, text;
	    ref = this.getSelection(), start = ref.start, end = ref.end;
	    text = this.props.block.data.text;
	    return {
	      before: start === 0 ? "" : text.slice(0, +(start - 1) + 1 || 9e9),
	      selected: end === 0 ? "" : text.slice(start, +(end - 1) + 1 || 9e9),
	      after: text.slice(end, +text.length + 1 || 9e9)
	    };
	  },
	  getSelection: function() {
	    var el, end, endRange, len, normalizedValue, range, start, textInputRange;
	    el = this.refs['text'].getDOMNode();
	    el.focus();
	    start = end = 0;
	    normalizedValue = range = textInputRange = len = endRange = void 0;
	    if (typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") {
	      start = el.selectionStart;
	      end = el.selectionEnd;
	    } else {
	      range = document.selection.createRange();
	      if (range && range.parentElement() === el) {
	        len = el.value.length;
	        normalizedValue = el.value.replace(/\r\n/g, "\n");
	        textInputRange = el.createTextRange();
	        textInputRange.moveToBookmark(range.getBookmark());
	        endRange = el.createTextRange();
	        endRange.collapse(false);
	        if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
	          start = end = len;
	        } else {
	          start = -textInputRange.moveStart("character", -len);
	          start += normalizedValue.slice(0, start).split("\n").length - 1;
	          if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
	            end = len;
	          } else {
	            end = -textInputRange.moveEnd("character", -len);
	            end += normalizedValue.slice(0, end).split("\n").length - 1;
	          }
	        }
	      }
	    }
	    return {
	      start: start,
	      end: end
	    };
	  },
	  setSelectionRange: function(selectionStart, selectionEnd) {
	    var input, range;
	    input = this.refs['text'].getDOMNode();
	    if (input.setSelectionRange) {
	      input.focus();
	      return input.setSelectionRange(selectionStart, selectionEnd);
	    } else if (input.createTextRange) {
	      range = input.createTextRange();
	      range.collapse(true);
	      range.moveEnd("character", selectionEnd);
	      range.moveStart("character", selectionStart);
	      return range.select();
	    }
	  }
	});

	module.exports = ExpandingTextarea;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6)(__webpack_require__(37))

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "!function(e){\"undefined\"!=typeof exports?e(exports):(window.hljs=e({}),\"function\"==typeof define&&define.amd&&define([],function(){return window.hljs}))}(function(e){function t(e){return e.replace(/&/gm,\"&amp;\").replace(/</gm,\"&lt;\").replace(/>/gm,\"&gt;\")}function r(e){return e.nodeName.toLowerCase()}function n(e,t){var r=e&&e.exec(t);return r&&0==r.index}function a(e){var t=(e.className+\" \"+(e.parentNode?e.parentNode.className:\"\")).split(/\\s+/);return t=t.map(function(e){return e.replace(/^lang(uage)?-/,\"\")}),t.filter(function(e){return v(e)||/no(-?)highlight|plain|text/.test(e)})[0]}function i(e,t){var r,n={};for(r in e)n[r]=e[r];if(t)for(r in t)n[r]=t[r];return n}function s(e){var t=[];return function n(e,a){for(var i=e.firstChild;i;i=i.nextSibling)3==i.nodeType?a+=i.nodeValue.length:1==i.nodeType&&(t.push({event:\"start\",offset:a,node:i}),a=n(i,a),r(i).match(/br|hr|img|input/)||t.push({event:\"stop\",offset:a,node:i}));return a}(e,0),t}function c(e,n,a){function i(){return e.length&&n.length?e[0].offset!=n[0].offset?e[0].offset<n[0].offset?e:n:\"start\"==n[0].event?e:n:e.length?e:n}function s(e){function n(e){return\" \"+e.nodeName+'=\"'+t(e.value)+'\"'}u+=\"<\"+r(e)+Array.prototype.map.call(e.attributes,n).join(\"\")+\">\"}function c(e){u+=\"</\"+r(e)+\">\"}function o(e){(\"start\"==e.event?s:c)(e.node)}for(var l=0,u=\"\",d=[];e.length||n.length;){var b=i();if(u+=t(a.substr(l,b[0].offset-l)),l=b[0].offset,b==e){d.reverse().forEach(c);do o(b.splice(0,1)[0]),b=i();while(b==e&&b.length&&b[0].offset==l);d.reverse().forEach(s)}else\"start\"==b[0].event?d.push(b[0].node):d.pop(),o(b.splice(0,1)[0])}return u+t(a.substr(l))}function o(e){function t(e){return e&&e.source||e}function r(r,n){return new RegExp(t(r),\"m\"+(e.cI?\"i\":\"\")+(n?\"g\":\"\"))}function n(a,s){if(!a.compiled){if(a.compiled=!0,a.k=a.k||a.bK,a.k){var c={},o=function(t,r){e.cI&&(r=r.toLowerCase()),r.split(\" \").forEach(function(e){var r=e.split(\"|\");c[r[0]]=[t,r[1]?Number(r[1]):1]})};\"string\"==typeof a.k?o(\"keyword\",a.k):Object.keys(a.k).forEach(function(e){o(e,a.k[e])}),a.k=c}a.lR=r(a.l||/\\b\\w+\\b/,!0),s&&(a.bK&&(a.b=\"\\\\b(\"+a.bK.split(\" \").join(\"|\")+\")\\\\b\"),a.b||(a.b=/\\B|\\b/),a.bR=r(a.b),a.e||a.eW||(a.e=/\\B|\\b/),a.e&&(a.eR=r(a.e)),a.tE=t(a.e)||\"\",a.eW&&s.tE&&(a.tE+=(a.e?\"|\":\"\")+s.tE)),a.i&&(a.iR=r(a.i)),void 0===a.r&&(a.r=1),a.c||(a.c=[]);var l=[];a.c.forEach(function(e){e.v?e.v.forEach(function(t){l.push(i(e,t))}):l.push(\"self\"==e?a:e)}),a.c=l,a.c.forEach(function(e){n(e,a)}),a.starts&&n(a.starts,s);var u=a.c.map(function(e){return e.bK?\"\\\\.?(\"+e.b+\")\\\\.?\":e.b}).concat([a.tE,a.i]).map(t).filter(Boolean);a.t=u.length?r(u.join(\"|\"),!0):{exec:function(){return null}}}}n(e)}function l(e,r,a,i){function s(e,t){for(var r=0;r<t.c.length;r++)if(n(t.c[r].bR,e))return t.c[r]}function c(e,t){if(n(e.eR,t)){for(;e.endsParent&&e.parent;)e=e.parent;return e}return e.eW?c(e.parent,t):void 0}function d(e,t){return!a&&n(t.iR,e)}function b(e,t){var r=y.cI?t[0].toLowerCase():t[0];return e.k.hasOwnProperty(r)&&e.k[r]}function p(e,t,r,n){var a=n?\"\":N.classPrefix,i='<span class=\"'+a,s=r?\"\":\"</span>\";return i+=e+'\">',i+t+s}function f(){if(!x.k)return t(E);var e=\"\",r=0;x.lR.lastIndex=0;for(var n=x.lR.exec(E);n;){e+=t(E.substr(r,n.index-r));var a=b(x,n);a?(B+=a[1],e+=p(a[0],t(n[0]))):e+=t(n[0]),r=x.lR.lastIndex,n=x.lR.exec(E)}return e+t(E.substr(r))}function m(){if(x.sL&&!w[x.sL])return t(E);var e=x.sL?l(x.sL,E,!0,C[x.sL]):u(E);return x.r>0&&(B+=e.r),\"continuous\"==x.subLanguageMode&&(C[x.sL]=e.top),p(e.language,e.value,!1,!0)}function g(){return void 0!==x.sL?m():f()}function _(e,r){var n=e.cN?p(e.cN,\"\",!0):\"\";e.rB?(M+=n,E=\"\"):e.eB?(M+=t(r)+n,E=\"\"):(M+=n,E=r),x=Object.create(e,{parent:{value:x}})}function h(e,r){if(E+=e,void 0===r)return M+=g(),0;var n=s(r,x);if(n)return M+=g(),_(n,r),n.rB?0:r.length;var a=c(x,r);if(a){var i=x;i.rE||i.eE||(E+=r),M+=g();do x.cN&&(M+=\"</span>\"),B+=x.r,x=x.parent;while(x!=a.parent);return i.eE&&(M+=t(r)),E=\"\",a.starts&&_(a.starts,\"\"),i.rE?0:r.length}if(d(r,x))throw new Error('Illegal lexeme \"'+r+'\" for mode \"'+(x.cN||\"<unnamed>\")+'\"');return E+=r,r.length||1}var y=v(e);if(!y)throw new Error('Unknown language: \"'+e+'\"');o(y);var k,x=i||y,C={},M=\"\";for(k=x;k!=y;k=k.parent)k.cN&&(M=p(k.cN,\"\",!0)+M);var E=\"\",B=0;try{for(var L,$,z=0;;){if(x.t.lastIndex=z,L=x.t.exec(r),!L)break;$=h(r.substr(z,L.index-z),L[0]),z=L.index+$}for(h(r.substr(z)),k=x;k.parent;k=k.parent)k.cN&&(M+=\"</span>\");return{r:B,value:M,language:e,top:x}}catch(R){if(-1!=R.message.indexOf(\"Illegal\"))return{r:0,value:t(r)};throw R}}function u(e,r){r=r||N.languages||Object.keys(w);var n={r:0,value:t(e)},a=n;return r.forEach(function(t){if(v(t)){var r=l(t,e,!1);r.language=t,r.r>a.r&&(a=r),r.r>n.r&&(a=n,n=r)}}),a.language&&(n.second_best=a),n}function d(e){return N.tabReplace&&(e=e.replace(/^((<[^>]+>|\\t)+)/gm,function(e,t){return t.replace(/\\t/g,N.tabReplace)})),N.useBR&&(e=e.replace(/\\n/g,\"<br>\")),e}function b(e,t,r){var n=t?y[t]:r,a=[e.trim()];return e.match(/\\bhljs\\b/)||a.push(\"hljs\"),-1===e.indexOf(n)&&a.push(n),a.join(\" \").trim()}function p(e){var t=a(e);if(!/no(-?)highlight|plain|text/.test(t)){var r;N.useBR?(r=document.createElementNS(\"http://www.w3.org/1999/xhtml\",\"div\"),r.innerHTML=e.innerHTML.replace(/\\n/g,\"\").replace(/<br[ \\/]*>/g,\"\\n\")):r=e;var n=r.textContent,i=t?l(t,n,!0):u(n),o=s(r);if(o.length){var p=document.createElementNS(\"http://www.w3.org/1999/xhtml\",\"div\");p.innerHTML=i.value,i.value=c(o,s(p),n)}i.value=d(i.value),e.innerHTML=i.value,e.className=b(e.className,t,i.language),e.result={language:i.language,re:i.r},i.second_best&&(e.second_best={language:i.second_best.language,re:i.second_best.r})}}function f(e){N=i(N,e)}function m(){if(!m.called){m.called=!0;var e=document.querySelectorAll(\"pre code\");Array.prototype.forEach.call(e,p)}}function g(){addEventListener(\"DOMContentLoaded\",m,!1),addEventListener(\"load\",m,!1)}function _(t,r){var n=w[t]=r(e);n.aliases&&n.aliases.forEach(function(e){y[e]=t})}function h(){return Object.keys(w)}function v(e){return w[e]||w[y[e]]}var N={classPrefix:\"hljs-\",tabReplace:null,useBR:!1,languages:void 0},w={},y={};return e.highlight=l,e.highlightAuto=u,e.fixMarkup=d,e.highlightBlock=p,e.configure=f,e.initHighlighting=m,e.initHighlightingOnLoad=g,e.registerLanguage=_,e.listLanguages=h,e.getLanguage=v,e.inherit=i,e.IR=\"[a-zA-Z]\\\\w*\",e.UIR=\"[a-zA-Z_]\\\\w*\",e.NR=\"\\\\b\\\\d+(\\\\.\\\\d+)?\",e.CNR=\"\\\\b(0[xX][a-fA-F0-9]+|(\\\\d+(\\\\.\\\\d*)?|\\\\.\\\\d+)([eE][-+]?\\\\d+)?)\",e.BNR=\"\\\\b(0b[01]+)\",e.RSR=\"!|!=|!==|%|%=|&|&&|&=|\\\\*|\\\\*=|\\\\+|\\\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\\\?|\\\\[|\\\\{|\\\\(|\\\\^|\\\\^=|\\\\||\\\\|=|\\\\|\\\\||~\",e.BE={b:\"\\\\\\\\[\\\\s\\\\S]\",r:0},e.ASM={cN:\"string\",b:\"'\",e:\"'\",i:\"\\\\n\",c:[e.BE]},e.QSM={cN:\"string\",b:'\"',e:'\"',i:\"\\\\n\",c:[e.BE]},e.PWM={b:/\\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\\b/},e.C=function(t,r,n){var a=e.inherit({cN:\"comment\",b:t,e:r,c:[]},n||{});return a.c.push(e.PWM),a},e.CLCM=e.C(\"//\",\"$\"),e.CBCM=e.C(\"/\\\\*\",\"\\\\*/\"),e.HCM=e.C(\"#\",\"$\"),e.NM={cN:\"number\",b:e.NR,r:0},e.CNM={cN:\"number\",b:e.CNR,r:0},e.BNM={cN:\"number\",b:e.BNR,r:0},e.CSSNM={cN:\"number\",b:e.NR+\"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?\",r:0},e.RM={cN:\"regexp\",b:/\\//,e:/\\/[gimuy]*/,i:/\\n/,c:[e.BE,{b:/\\[/,e:/\\]/,r:0,c:[e.BE]}]},e.TM={cN:\"title\",b:e.IR,r:0},e.UTM={cN:\"title\",b:e.UIR,r:0},e}),hljs.registerLanguage(\"apache\",function(e){var t={cN:\"number\",b:\"[\\\\$%]\\\\d+\"};return{aliases:[\"apacheconf\"],cI:!0,c:[e.HCM,{cN:\"tag\",b:\"</?\",e:\">\"},{cN:\"keyword\",b:/\\w+/,r:0,k:{common:\"order deny allow setenv rewriterule rewriteengine rewritecond documentroot sethandler errordocument loadmodule options header listen serverroot servername\"},starts:{e:/$/,r:0,k:{literal:\"on off all\"},c:[{cN:\"sqbracket\",b:\"\\\\s\\\\[\",e:\"\\\\]$\"},{cN:\"cbracket\",b:\"[\\\\$%]\\\\{\",e:\"\\\\}\",c:[\"self\",t]},t,e.QSM]}}],i:/\\S/}}),hljs.registerLanguage(\"bash\",function(e){var t={cN:\"variable\",v:[{b:/\\$[\\w\\d#@][\\w\\d_]*/},{b:/\\$\\{(.*?)}/}]},r={cN:\"string\",b:/\"/,e:/\"/,c:[e.BE,t,{cN:\"variable\",b:/\\$\\(/,e:/\\)/,c:[e.BE]}]},n={cN:\"string\",b:/'/,e:/'/};return{aliases:[\"sh\",\"zsh\"],l:/-?[a-z\\.]+/,k:{keyword:\"if then else elif fi for while in do done case esac function\",literal:\"true false\",built_in:\"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp\",operator:\"-ne -eq -lt -gt -f -d -e -s -l -a\"},c:[{cN:\"shebang\",b:/^#![^\\n]+sh\\s*$/,r:10},{cN:\"function\",b:/\\w[\\w\\d_]*\\s*\\(\\s*\\)\\s*\\{/,rB:!0,c:[e.inherit(e.TM,{b:/\\w[\\w\\d_]*/})],r:0},e.HCM,e.NM,r,n,t]}}),hljs.registerLanguage(\"coffeescript\",function(e){var t={keyword:\"in if for while finally new do return else break catch instanceof throw try this switch continue typeof delete debugger super then unless until loop of by when and or is isnt not\",literal:\"true false null undefined yes no on off\",reserved:\"case default function var void with const let enum export import native __hasProp __extends __slice __bind __indexOf\",built_in:\"npm require console print module global window document\"},r=\"[A-Za-z$_][0-9A-Za-z$_]*\",n={cN:\"subst\",b:/#\\{/,e:/}/,k:t},a=[e.BNM,e.inherit(e.CNM,{starts:{e:\"(\\\\s*/)?\",r:0}}),{cN:\"string\",v:[{b:/'''/,e:/'''/,c:[e.BE]},{b:/'/,e:/'/,c:[e.BE]},{b:/\"\"\"/,e:/\"\"\"/,c:[e.BE,n]},{b:/\"/,e:/\"/,c:[e.BE,n]}]},{cN:\"regexp\",v:[{b:\"///\",e:\"///\",c:[n,e.HCM]},{b:\"//[gim]*\",r:0},{b:/\\/(?![ *])(\\\\\\/|.)*?\\/[gim]*(?=\\W|$)/}]},{cN:\"property\",b:\"@\"+r},{b:\"`\",e:\"`\",eB:!0,eE:!0,sL:\"javascript\"}];n.c=a;var i=e.inherit(e.TM,{b:r}),s=\"(\\\\(.*\\\\))?\\\\s*\\\\B[-=]>\",c={cN:\"params\",b:\"\\\\([^\\\\(]\",rB:!0,c:[{b:/\\(/,e:/\\)/,k:t,c:[\"self\"].concat(a)}]};return{aliases:[\"coffee\",\"cson\",\"iced\"],k:t,i:/\\/\\*/,c:a.concat([e.C(\"###\",\"###\"),e.HCM,{cN:\"function\",b:\"^\\\\s*\"+r+\"\\\\s*=\\\\s*\"+s,e:\"[-=]>\",rB:!0,c:[i,c]},{b:/[:\\(,=]\\s*/,r:0,c:[{cN:\"function\",b:s,e:\"[-=]>\",rB:!0,c:[c]}]},{cN:\"class\",bK:\"class\",e:\"$\",i:/[:=\"\\[\\]]/,c:[{bK:\"extends\",eW:!0,i:/[:=\"\\[\\]]/,c:[i]},i]},{cN:\"attribute\",b:r+\":\",e:\":\",rB:!0,rE:!0,r:0}])}}),hljs.registerLanguage(\"cpp\",function(e){var t={keyword:\"false int float while private char catch export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace unsigned long volatile static protected bool template mutable if public friend do goto auto void enum else break extern using true class asm case typeid short reinterpret_cast|10 default double register explicit signed typename try this switch continue wchar_t inline delete alignof char16_t char32_t constexpr decltype noexcept nullptr static_assert thread_local restrict _Bool complex _Complex _Imaginary intmax_t uintmax_t int8_t uint8_t int16_t uint16_t int32_t uint32_t  int64_t uint64_t int_least8_t uint_least8_t int_least16_t uint_least16_t int_least32_t uint_least32_t int_least64_t uint_least64_t int_fast8_t uint_fast8_t int_fast16_t uint_fast16_t int_fast32_t uint_fast32_t int_fast64_t uint_fast64_t intptr_t uintptr_t atomic_bool atomic_char atomic_schar atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong atomic_ullong atomic_wchar_t atomic_char16_t atomic_char32_t atomic_intmax_t atomic_uintmax_t atomic_intptr_t atomic_uintptr_t atomic_size_t atomic_ptrdiff_t atomic_int_least8_t atomic_int_least16_t atomic_int_least32_t atomic_int_least64_t atomic_uint_least8_t atomic_uint_least16_t atomic_uint_least32_t atomic_uint_least64_t atomic_int_fast8_t atomic_int_fast16_t atomic_int_fast32_t atomic_int_fast64_t atomic_uint_fast8_t atomic_uint_fast16_t atomic_uint_fast32_t atomic_uint_fast64_t\",built_in:\"std string cin cout cerr clog stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf\"};return{aliases:[\"c\",\"cc\",\"h\",\"c++\",\"h++\",\"hpp\"],k:t,i:\"</\",c:[e.CLCM,e.CBCM,e.QSM,{cN:\"string\",b:\"'\\\\\\\\?.\",e:\"'\",i:\".\"},{cN:\"number\",b:\"\\\\b(\\\\d+(\\\\.\\\\d*)?|\\\\.\\\\d+)(u|U|l|L|ul|UL|f|F)\"},e.CNM,{cN:\"preprocessor\",b:\"#\",e:\"$\",k:\"if else elif endif define undef warning error line pragma\",c:[{b:/\\\\\\n/,r:0},{b:'include\\\\s*[<\"]',e:'[>\"]',k:\"include\",i:\"\\\\n\"},e.CLCM]},{b:\"\\\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\\\s*<\",e:\">\",k:t,c:[\"self\"]},{b:e.IR+\"::\",k:t},{bK:\"new throw return else\",r:0},{cN:\"function\",b:\"(\"+e.IR+\"\\\\s+)+\"+e.IR+\"\\\\s*\\\\(\",rB:!0,e:/[{;=]/,eE:!0,k:t,c:[{b:e.IR+\"\\\\s*\\\\(\",rB:!0,c:[e.TM],r:0},{cN:\"params\",b:/\\(/,e:/\\)/,k:t,r:0,c:[e.CBCM]},e.CLCM,e.CBCM]}]}}),hljs.registerLanguage(\"cs\",function(e){var t=\"abstract as base bool break byte case catch char checked const continue decimal dynamic default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long null when object operator out override params private protected public readonly ref sbyte sealed short sizeof stackalloc static string struct switch this true try typeof uint ulong unchecked unsafe ushort using virtual volatile void while async protected public private internal ascending descending from get group into join let orderby partial select set value var where yield\",r=e.IR+\"(<\"+e.IR+\">)?\";return{aliases:[\"csharp\"],k:t,i:/::/,c:[e.C(\"///\",\"$\",{rB:!0,c:[{cN:\"xmlDocTag\",v:[{b:\"///\",r:0},{b:\"<!--|-->\"},{b:\"</?\",e:\">\"}]}]}),e.CLCM,e.CBCM,{cN:\"preprocessor\",b:\"#\",e:\"$\",k:\"if else elif endif define undef warning error line region endregion pragma checksum\"},{cN:\"string\",b:'@\"',e:'\"',c:[{b:'\"\"'}]},e.ASM,e.QSM,e.CNM,{bK:\"class namespace interface\",e:/[{;=]/,i:/[^\\s:]/,c:[e.TM,e.CLCM,e.CBCM]},{bK:\"new return throw await\",r:0},{cN:\"function\",b:\"(\"+r+\"\\\\s+)+\"+e.IR+\"\\\\s*\\\\(\",rB:!0,e:/[{;=]/,eE:!0,k:t,c:[{b:e.IR+\"\\\\s*\\\\(\",rB:!0,c:[e.TM],r:0},{cN:\"params\",b:/\\(/,e:/\\)/,k:t,r:0,c:[e.ASM,e.QSM,e.CNM,e.CBCM]},e.CLCM,e.CBCM]}]}}),hljs.registerLanguage(\"css\",function(e){var t=\"[a-zA-Z-][a-zA-Z0-9_-]*\",r={cN:\"function\",b:t+\"\\\\(\",rB:!0,eE:!0,e:\"\\\\(\"},n={cN:\"rule\",b:/[A-Z\\_\\.\\-]+\\s*:/,rB:!0,e:\";\",eW:!0,c:[{cN:\"attribute\",b:/\\S/,e:\":\",eE:!0,starts:{cN:\"value\",eW:!0,eE:!0,c:[r,e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:\"hexcolor\",b:\"#[0-9A-Fa-f]+\"},{cN:\"important\",b:\"!important\"}]}}]};return{cI:!0,i:/[=\\/|']/,c:[e.CBCM,n,{cN:\"id\",b:/\\#[A-Za-z0-9_-]+/},{cN:\"class\",b:/\\.[A-Za-z0-9_-]+/,r:0},{cN:\"attr_selector\",b:/\\[/,e:/\\]/,i:\"$\"},{cN:\"pseudo\",b:/:(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\"']+/},{cN:\"at_rule\",b:\"@(font-face|page)\",l:\"[a-z-]+\",k:\"font-face page\"},{cN:\"at_rule\",b:\"@\",e:\"[{;]\",c:[{cN:\"keyword\",b:/\\S+/},{b:/\\s/,eW:!0,eE:!0,r:0,c:[r,e.ASM,e.QSM,e.CSSNM]}]},{cN:\"tag\",b:t,r:0},{cN:\"rules\",b:\"{\",e:\"}\",i:/\\S/,r:0,c:[e.CBCM,n]}]}}),hljs.registerLanguage(\"diff\",function(e){return{aliases:[\"patch\"],c:[{cN:\"chunk\",r:10,v:[{b:/^@@ +\\-\\d+,\\d+ +\\+\\d+,\\d+ +@@$/},{b:/^\\*\\*\\* +\\d+,\\d+ +\\*\\*\\*\\*$/},{b:/^\\-\\-\\- +\\d+,\\d+ +\\-\\-\\-\\-$/}]},{cN:\"header\",v:[{b:/Index: /,e:/$/},{b:/=====/,e:/=====$/},{b:/^\\-\\-\\-/,e:/$/},{b:/^\\*{3} /,e:/$/},{b:/^\\+\\+\\+/,e:/$/},{b:/\\*{5}/,e:/\\*{5}$/}]},{cN:\"addition\",b:\"^\\\\+\",e:\"$\"},{cN:\"deletion\",b:\"^\\\\-\",e:\"$\"},{cN:\"change\",b:\"^\\\\!\",e:\"$\"}]}}),hljs.registerLanguage(\"http\",function(e){return{aliases:[\"https\"],i:\"\\\\S\",c:[{cN:\"status\",b:\"^HTTP/[0-9\\\\.]+\",e:\"$\",c:[{cN:\"number\",b:\"\\\\b\\\\d{3}\\\\b\"}]},{cN:\"request\",b:\"^[A-Z]+ (.*?) HTTP/[0-9\\\\.]+$\",rB:!0,e:\"$\",c:[{cN:\"string\",b:\" \",e:\" \",eB:!0,eE:!0}]},{cN:\"attribute\",b:\"^\\\\w\",e:\": \",eE:!0,i:\"\\\\n|\\\\s|=\",starts:{cN:\"string\",e:\"$\"}},{b:\"\\\\n\\\\n\",starts:{sL:\"\",eW:!0}}]}}),hljs.registerLanguage(\"ini\",function(e){return{cI:!0,i:/\\S/,c:[e.C(\";\",\"$\"),{cN:\"title\",b:\"^\\\\[\",e:\"\\\\]\"},{cN:\"setting\",b:\"^[a-z0-9\\\\[\\\\]_-]+[ \\\\t]*=[ \\\\t]*\",e:\"$\",c:[{cN:\"value\",eW:!0,k:\"on off true false yes no\",c:[e.QSM,e.NM],r:0}]}]}}),hljs.registerLanguage(\"java\",function(e){var t=e.UIR+\"(<\"+e.UIR+\">)?\",r=\"false synchronized int abstract float private char boolean static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private\",n=\"(\\\\b(0b[01_]+)|\\\\b0[xX][a-fA-F0-9_]+|(\\\\b[\\\\d_]+(\\\\.[\\\\d_]*)?|\\\\.[\\\\d_]+)([eE][-+]?\\\\d+)?)[lLfF]?\",a={cN:\"number\",b:n,r:0};return{aliases:[\"jsp\"],k:r,i:/<\\//,c:[{cN:\"javadoc\",b:\"/\\\\*\\\\*\",e:\"\\\\*/\",r:0,c:[{cN:\"javadoctag\",b:\"(^|\\\\s)@[A-Za-z]+\"}]},e.CLCM,e.CBCM,e.ASM,e.QSM,{cN:\"class\",bK:\"class interface\",e:/[{;=]/,eE:!0,k:\"class interface\",i:/[:\"\\[\\]]/,c:[{bK:\"extends implements\"},e.UTM]},{bK:\"new throw return\",r:0},{cN:\"function\",b:\"(\"+t+\"\\\\s+)+\"+e.UIR+\"\\\\s*\\\\(\",rB:!0,e:/[{;=]/,eE:!0,k:r,c:[{b:e.UIR+\"\\\\s*\\\\(\",rB:!0,r:0,c:[e.UTM]},{cN:\"params\",b:/\\(/,e:/\\)/,k:r,r:0,c:[e.ASM,e.QSM,e.CNM,e.CBCM]},e.CLCM,e.CBCM]},a,{cN:\"annotation\",b:\"@[A-Za-z]+\"}]}}),hljs.registerLanguage(\"javascript\",function(e){return{aliases:[\"js\"],k:{keyword:\"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as await\",literal:\"true false null undefined NaN Infinity\",built_in:\"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise\"},c:[{cN:\"pi\",r:10,v:[{b:/^\\s*('|\")use strict('|\")/},{b:/^\\s*('|\")use asm('|\")/}]},e.ASM,e.QSM,{cN:\"string\",b:\"`\",e:\"`\",c:[e.BE,{cN:\"subst\",b:\"\\\\$\\\\{\",e:\"\\\\}\"}]},e.CLCM,e.CBCM,{cN:\"number\",b:\"\\\\b(0[xXbBoO][a-fA-F0-9]+|(\\\\d+(\\\\.\\\\d*)?|\\\\.\\\\d+)([eE][-+]?\\\\d+)?)\",r:0},{b:\"(\"+e.RSR+\"|\\\\b(case|return|throw)\\\\b)\\\\s*\",k:\"return throw case\",c:[e.CLCM,e.CBCM,e.RM,{b:/</,e:/>\\s*[);\\]]/,r:0,sL:\"xml\"}],r:0},{cN:\"function\",bK:\"function\",e:/\\{/,eE:!0,c:[e.inherit(e.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:\"params\",b:/\\(/,e:/\\)/,c:[e.CLCM,e.CBCM],i:/[\"'\\(]/}],i:/\\[|%/},{b:/\\$[(.]/},{b:\"\\\\.\"+e.IR,r:0},{bK:\"import\",e:\"[;$]\",k:\"import from as\",c:[e.ASM,e.QSM]},{cN:\"class\",bK:\"class\",e:/[{;=]/,eE:!0,i:/[:\"\\[\\]]/,c:[{bK:\"extends\"},e.UTM]}]}}),hljs.registerLanguage(\"json\",function(e){var t={literal:\"true false null\"},r=[e.QSM,e.CNM],n={cN:\"value\",e:\",\",eW:!0,eE:!0,c:r,k:t},a={b:\"{\",e:\"}\",c:[{cN:\"attribute\",b:'\\\\s*\"',e:'\"\\\\s*:\\\\s*',eB:!0,eE:!0,c:[e.BE],i:\"\\\\n\",starts:n}],i:\"\\\\S\"},i={b:\"\\\\[\",e:\"\\\\]\",c:[e.inherit(n,{cN:null})],i:\"\\\\S\"};return r.splice(r.length,0,a,i),{c:r,k:t,i:\"\\\\S\"}}),hljs.registerLanguage(\"makefile\",function(e){var t={cN:\"variable\",b:/\\$\\(/,e:/\\)/,c:[e.BE]};return{aliases:[\"mk\",\"mak\"],c:[e.HCM,{b:/^\\w+\\s*\\W*=/,rB:!0,r:0,starts:{cN:\"constant\",e:/\\s*\\W*=/,eE:!0,starts:{e:/$/,r:0,c:[t]}}},{cN:\"title\",b:/^[\\w]+:\\s*$/},{cN:\"phony\",b:/^\\.PHONY:/,e:/$/,k:\".PHONY\",l:/[\\.\\w]+/},{b:/^\\t+/,e:/$/,r:0,c:[e.QSM,t]}]}}),hljs.registerLanguage(\"xml\",function(e){var t=\"[A-Za-z0-9\\\\._:-]+\",r={b:/<\\?(php)?(?!\\w)/,e:/\\?>/,sL:\"php\",subLanguageMode:\"continuous\"},n={eW:!0,i:/</,r:0,c:[r,{cN:\"attribute\",b:t,r:0},{b:\"=\",r:0,c:[{cN:\"value\",c:[r],v:[{b:/\"/,e:/\"/},{b:/'/,e:/'/},{b:/[^\\s\\/>]+/}]}]}]};return{aliases:[\"html\",\"xhtml\",\"rss\",\"atom\",\"xsl\",\"plist\"],cI:!0,c:[{cN:\"doctype\",b:\"<!DOCTYPE\",e:\">\",r:10,c:[{b:\"\\\\[\",e:\"\\\\]\"}]},e.C(\"<!--\",\"-->\",{r:10}),{cN:\"cdata\",b:\"<\\\\!\\\\[CDATA\\\\[\",e:\"\\\\]\\\\]>\",r:10},{cN:\"tag\",b:\"<style(?=\\\\s|>|$)\",e:\">\",k:{title:\"style\"},c:[n],starts:{e:\"</style>\",rE:!0,sL:\"css\"}},{cN:\"tag\",b:\"<script(?=\\\\s|>|$)\",e:\">\",k:{title:\"script\"},c:[n],starts:{e:\"</script>\",rE:!0,sL:\"\"}},r,{cN:\"pi\",b:/<\\?\\w+/,e:/\\?>/,r:10},{cN:\"tag\",b:\"</?\",e:\"/?>\",c:[{cN:\"title\",b:/[^ \\/><\\n\\t]+/,r:0},n]}]}}),hljs.registerLanguage(\"markdown\",function(e){return{aliases:[\"md\",\"mkdown\",\"mkd\"],c:[{cN:\"header\",v:[{b:\"^#{1,6}\",e:\"$\"},{b:\"^.+?\\\\n[=-]{2,}$\"}]},{b:\"<\",e:\">\",sL:\"xml\",r:0},{cN:\"bullet\",b:\"^([*+-]|(\\\\d+\\\\.))\\\\s+\"},{cN:\"strong\",b:\"[*_]{2}.+?[*_]{2}\"},{cN:\"emphasis\",v:[{b:\"\\\\*.+?\\\\*\"},{b:\"_.+?_\",r:0}]},{cN:\"blockquote\",b:\"^>\\\\s+\",e:\"$\"},{cN:\"code\",v:[{b:\"`.+?`\"},{b:\"^( {4}|\t)\",e:\"$\",r:0}]},{cN:\"horizontal_rule\",b:\"^[-\\\\*]{3,}\",e:\"$\"},{b:\"\\\\[.+?\\\\][\\\\(\\\\[].*?[\\\\)\\\\]]\",rB:!0,c:[{cN:\"link_label\",b:\"\\\\[\",e:\"\\\\]\",eB:!0,rE:!0,r:0},{cN:\"link_url\",b:\"\\\\]\\\\(\",e:\"\\\\)\",eB:!0,eE:!0},{cN:\"link_reference\",b:\"\\\\]\\\\[\",e:\"\\\\]\",eB:!0,eE:!0}],r:10},{b:\"^\\\\[.+\\\\]:\",rB:!0,c:[{cN:\"link_reference\",b:\"\\\\[\",e:\"\\\\]:\",eB:!0,eE:!0,starts:{cN:\"link_url\",e:\"$\"}}]}]}}),hljs.registerLanguage(\"nginx\",function(e){var t={cN:\"variable\",v:[{b:/\\$\\d+/},{b:/\\$\\{/,e:/}/},{b:\"[\\\\$\\\\@]\"+e.UIR}]},r={eW:!0,l:\"[a-z/_]+\",k:{built_in:\"on off yes no true false none blocked debug info notice warn error crit select break last permanent redirect kqueue rtsig epoll poll /dev/poll\"},r:0,i:\"=>\",c:[e.HCM,{cN:\"string\",c:[e.BE,t],v:[{b:/\"/,e:/\"/},{b:/'/,e:/'/}]},{cN:\"url\",b:\"([a-z]+):/\",e:\"\\\\s\",eW:!0,eE:!0,c:[t]},{cN:\"regexp\",c:[e.BE,t],v:[{b:\"\\\\s\\\\^\",e:\"\\\\s|{|;\",rE:!0},{b:\"~\\\\*?\\\\s+\",e:\"\\\\s|{|;\",rE:!0},{b:\"\\\\*(\\\\.[a-z\\\\-]+)+\"},{b:\"([a-z\\\\-]+\\\\.)+\\\\*\"}]},{cN:\"number\",b:\"\\\\b\\\\d{1,3}\\\\.\\\\d{1,3}\\\\.\\\\d{1,3}\\\\.\\\\d{1,3}(:\\\\d{1,5})?\\\\b\"},{cN:\"number\",b:\"\\\\b\\\\d+[kKmMgGdshdwy]*\\\\b\",r:0},t]};return{aliases:[\"nginxconf\"],c:[e.HCM,{b:e.UIR+\"\\\\s\",e:\";|{\",rB:!0,c:[{cN:\"title\",b:e.UIR,starts:r}],r:0}],i:\"[^\\\\s\\\\}]\"}}),hljs.registerLanguage(\"objectivec\",function(e){var t={cN:\"built_in\",b:\"(AV|CA|CF|CG|CI|MK|MP|NS|UI)\\\\w+\"},r={keyword:\"int float while char export sizeof typedef const struct for union unsigned long volatile static bool mutable if do return goto void enum else break extern asm case short default double register explicit signed typename this switch continue wchar_t inline readonly assign readwrite self @synchronized id typeof nonatomic super unichar IBOutlet IBAction strong weak copy in out inout bycopy byref oneway __strong __weak __block __autoreleasing @private @protected @public @try @property @end @throw @catch @finally @autoreleasepool @synthesize @dynamic @selector @optional @required\",literal:\"false true FALSE TRUE nil YES NO NULL\",built_in:\"BOOL dispatch_once_t dispatch_queue_t dispatch_sync dispatch_async dispatch_once\"},n=/[a-zA-Z@][a-zA-Z0-9_]*/,a=\"@interface @class @protocol @implementation\";return{aliases:[\"m\",\"mm\",\"objc\",\"obj-c\"],k:r,l:n,i:\"</\",c:[t,e.CLCM,e.CBCM,e.CNM,e.QSM,{cN:\"string\",v:[{b:'@\"',e:'\"',i:\"\\\\n\",c:[e.BE]},{b:\"'\",e:\"[^\\\\\\\\]'\",i:\"[^\\\\\\\\][^']\"}]},{cN:\"preprocessor\",b:\"#\",e:\"$\",c:[{cN:\"title\",v:[{b:'\"',e:'\"'},{b:\"<\",e:\">\"}]}]},{cN:\"class\",b:\"(\"+a.split(\" \").join(\"|\")+\")\\\\b\",e:\"({|$)\",eE:!0,k:a,l:n,c:[e.UTM]},{cN:\"variable\",b:\"\\\\.\"+e.UIR,r:0}]}}),hljs.registerLanguage(\"perl\",function(e){var t=\"getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when\",r={cN:\"subst\",b:\"[$@]\\\\{\",e:\"\\\\}\",k:t},n={b:\"->{\",e:\"}\"},a={cN:\"variable\",v:[{b:/\\$\\d/},{b:/[\\$%@](\\^\\w\\b|#\\w+(::\\w+)*|{\\w+}|\\w+(::\\w*)*)/},{b:/[\\$%@][^\\s\\w{]/,r:0}]},i=e.C(\"^(__END__|__DATA__)\",\"\\\\n$\",{r:5}),s=[e.BE,r,a],c=[a,e.HCM,i,e.C(\"^\\\\=\\\\w\",\"\\\\=cut\",{eW:!0}),n,{cN:\"string\",c:s,v:[{b:\"q[qwxr]?\\\\s*\\\\(\",e:\"\\\\)\",r:5},{b:\"q[qwxr]?\\\\s*\\\\[\",e:\"\\\\]\",r:5},{b:\"q[qwxr]?\\\\s*\\\\{\",e:\"\\\\}\",r:5},{b:\"q[qwxr]?\\\\s*\\\\|\",e:\"\\\\|\",r:5},{b:\"q[qwxr]?\\\\s*\\\\<\",e:\"\\\\>\",r:5},{b:\"qw\\\\s+q\",e:\"q\",r:5},{b:\"'\",e:\"'\",c:[e.BE]},{b:'\"',e:'\"'},{b:\"`\",e:\"`\",c:[e.BE]},{b:\"{\\\\w+}\",c:[],r:0},{b:\"-?\\\\w+\\\\s*\\\\=\\\\>\",c:[],r:0}]},{cN:\"number\",b:\"(\\\\b0[0-7_]+)|(\\\\b0x[0-9a-fA-F_]+)|(\\\\b[1-9][0-9_]*(\\\\.[0-9_]+)?)|[0_]\\\\b\",r:0},{b:\"(\\\\/\\\\/|\"+e.RSR+\"|\\\\b(split|return|print|reverse|grep)\\\\b)\\\\s*\",k:\"split return print reverse grep\",r:0,c:[e.HCM,i,{cN:\"regexp\",b:\"(s|tr|y)/(\\\\\\\\.|[^/])*/(\\\\\\\\.|[^/])*/[a-z]*\",r:10},{cN:\"regexp\",b:\"(m|qr)?/\",e:\"/[a-z]*\",c:[e.BE],r:0}]},{cN:\"sub\",bK:\"sub\",e:\"(\\\\s*\\\\(.*?\\\\))?[;{]\",r:5},{cN:\"operator\",b:\"-\\\\w\\\\b\",r:0}];return r.c=c,n.c=c,{aliases:[\"pl\"],k:t,c:c}}),hljs.registerLanguage(\"php\",function(e){var t={cN:\"variable\",b:\"\\\\$+[a-zA-Z_-ÿ][a-zA-Z0-9_-ÿ]*\"},r={cN:\"preprocessor\",b:/<\\?(php)?|\\?>/},n={cN:\"string\",c:[e.BE,r],v:[{b:'b\"',e:'\"'},{b:\"b'\",e:\"'\"},e.inherit(e.ASM,{i:null}),e.inherit(e.QSM,{i:null})]},a={v:[e.BNM,e.CNM]};return{aliases:[\"php3\",\"php4\",\"php5\",\"php6\"],cI:!0,k:\"and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally\",c:[e.CLCM,e.HCM,e.C(\"/\\\\*\",\"\\\\*/\",{c:[{cN:\"phpdoc\",b:\"\\\\s@[A-Za-z]+\"},r]}),e.C(\"__halt_compiler.+?;\",!1,{eW:!0,k:\"__halt_compiler\",l:e.UIR}),{cN:\"string\",b:\"<<<['\\\"]?\\\\w+['\\\"]?$\",e:\"^\\\\w+;\",c:[e.BE]},r,t,{b:/(::|->)+[a-zA-Z_\\x7f-\\xff][a-zA-Z0-9_\\x7f-\\xff]*/},{cN:\"function\",bK:\"function\",e:/[;{]/,eE:!0,i:\"\\\\$|\\\\[|%\",c:[e.UTM,{cN:\"params\",b:\"\\\\(\",e:\"\\\\)\",c:[\"self\",t,e.CBCM,n,a]}]},{cN:\"class\",bK:\"class interface\",e:\"{\",eE:!0,i:/[:\\(\\$\"]/,c:[{bK:\"extends implements\"},e.UTM]},{bK:\"namespace\",e:\";\",i:/[\\.']/,c:[e.UTM]},{bK:\"use\",e:\";\",c:[e.UTM]},{b:\"=>\"},n,a]}}),hljs.registerLanguage(\"python\",function(e){var t={cN:\"prompt\",b:/^(>>>|\\.\\.\\.) /},r={cN:\"string\",c:[e.BE],v:[{b:/(u|b)?r?'''/,e:/'''/,c:[t],r:10},{b:/(u|b)?r?\"\"\"/,e:/\"\"\"/,c:[t],r:10},{b:/(u|r|ur)'/,e:/'/,r:10},{b:/(u|r|ur)\"/,e:/\"/,r:10},{b:/(b|br)'/,e:/'/},{b:/(b|br)\"/,e:/\"/},e.ASM,e.QSM]},n={cN:\"number\",r:0,v:[{b:e.BNR+\"[lLjJ]?\"},{b:\"\\\\b(0o[0-7]+)[lLjJ]?\"},{b:e.CNR+\"[lLjJ]?\"}]},a={cN:\"params\",b:/\\(/,e:/\\)/,c:[\"self\",t,n,r]};return{aliases:[\"py\",\"gyp\"],k:{keyword:\"and elif is global as in if from raise for except finally print import pass return exec else break not with class assert yield try while continue del or def lambda nonlocal|10 None True False\",built_in:\"Ellipsis NotImplemented\"},i:/(<\\/|->|\\?)/,c:[t,n,r,e.HCM,{v:[{cN:\"function\",bK:\"def\",r:10},{cN:\"class\",bK:\"class\"}],e:/:/,i:/[${=;\\n,]/,c:[e.UTM,a]},{cN:\"decorator\",b:/@/,e:/$/},{b:/\\b(print|exec)\\(/}]}}),hljs.registerLanguage(\"ruby\",function(e){var t=\"[a-zA-Z_]\\\\w*[!?=]?|[-+~]\\\\@|<<|>>|=~|===?|<=>|[<>]=?|\\\\*\\\\*|[-/+%^&*~`|]|\\\\[\\\\]=?\",r=\"and false then defined module in return redo if BEGIN retry end for true self when next until do begin unless END rescue nil else break undef not super class case require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor\",n={cN:\"yardoctag\",b:\"@[A-Za-z]+\"},a={cN:\"value\",b:\"#<\",e:\">\"},i=[e.C(\"#\",\"$\",{c:[n]}),e.C(\"^\\\\=begin\",\"^\\\\=end\",{c:[n],r:10}),e.C(\"^__END__\",\"\\\\n$\")],s={cN:\"subst\",b:\"#\\\\{\",e:\"}\",k:r},c={cN:\"string\",c:[e.BE,s],v:[{b:/'/,e:/'/},{b:/\"/,e:/\"/},{b:/`/,e:/`/},{b:\"%[qQwWx]?\\\\(\",e:\"\\\\)\"},{b:\"%[qQwWx]?\\\\[\",e:\"\\\\]\"},{b:\"%[qQwWx]?{\",e:\"}\"},{b:\"%[qQwWx]?<\",e:\">\"},{b:\"%[qQwWx]?/\",e:\"/\"},{b:\"%[qQwWx]?%\",e:\"%\"},{b:\"%[qQwWx]?-\",e:\"-\"},{b:\"%[qQwWx]?\\\\|\",e:\"\\\\|\"},{b:/\\B\\?(\\\\\\d{1,3}|\\\\x[A-Fa-f0-9]{1,2}|\\\\u[A-Fa-f0-9]{4}|\\\\?\\S)\\b/}]},o={cN:\"params\",b:\"\\\\(\",e:\"\\\\)\",k:r},l=[c,a,{cN:\"class\",bK:\"class module\",e:\"$|;\",i:/=/,c:[e.inherit(e.TM,{b:\"[A-Za-z_]\\\\w*(::\\\\w+)*(\\\\?|\\\\!)?\"}),{cN:\"inheritance\",b:\"<\\\\s*\",c:[{cN:\"parent\",b:\"(\"+e.IR+\"::)?\"+e.IR}]}].concat(i)},{cN:\"function\",bK:\"def\",e:\" |$|;\",r:0,c:[e.inherit(e.TM,{b:t}),o].concat(i)},{cN:\"constant\",b:\"(::)?(\\\\b[A-Z]\\\\w*(::)?)+\",r:0},{cN:\"symbol\",b:e.UIR+\"(\\\\!|\\\\?)?:\",r:0},{cN:\"symbol\",b:\":\",c:[c,{b:t}],r:0},{cN:\"number\",b:\"(\\\\b0[0-7_]+)|(\\\\b0x[0-9a-fA-F_]+)|(\\\\b[1-9][0-9_]*(\\\\.[0-9_]+)?)|[0_]\\\\b\",r:0},{cN:\"variable\",b:\"(\\\\$\\\\W)|((\\\\$|\\\\@\\\\@?)(\\\\w+))\"},{b:\"(\"+e.RSR+\")\\\\s*\",c:[a,{cN:\"regexp\",c:[e.BE,s],i:/\\n/,v:[{b:\"/\",e:\"/[a-z]*\"},{b:\"%r{\",e:\"}[a-z]*\"},{b:\"%r\\\\(\",e:\"\\\\)[a-z]*\"},{b:\"%r!\",e:\"![a-z]*\"},{b:\"%r\\\\[\",e:\"\\\\][a-z]*\"}]}].concat(i),r:0}].concat(i);s.c=l,o.c=l;var u=\"[>?]>\",d=\"[\\\\w#]+\\\\(\\\\w+\\\\):\\\\d+:\\\\d+>\",b=\"(\\\\w+-)?\\\\d+\\\\.\\\\d+\\\\.\\\\d(p\\\\d+)?[^>]+>\",p=[{b:/^\\s*=>/,cN:\"status\",starts:{e:\"$\",c:l}},{cN:\"prompt\",b:\"^(\"+u+\"|\"+d+\"|\"+b+\")\",starts:{e:\"$\",c:l}}];return{aliases:[\"rb\",\"gemspec\",\"podspec\",\"thor\",\"irb\"],k:r,c:i.concat(p).concat(l)}}),hljs.registerLanguage(\"sql\",function(e){var t=e.C(\"--\",\"$\");return{cI:!0,i:/[<>]/,c:[{cN:\"operator\",bK:\"begin end start commit rollback savepoint lock alter create drop rename call delete do handler insert load replace select truncate update set show pragma grant merge describe use explain help declare prepare execute deallocate savepoint release unlock purge reset change stop analyze cache flush optimize repair kill install uninstall checksum restore check backup revoke\",e:/;/,eW:!0,k:{keyword:\"abs absolute acos action add adddate addtime aes_decrypt aes_encrypt after aggregate all allocate alter analyze and any are as asc ascii asin assertion at atan atan2 atn2 authorization authors avg backup before begin benchmark between bin binlog bit_and bit_count bit_length bit_or bit_xor both by cache call cascade cascaded case cast catalog ceil ceiling chain change changed char_length character_length charindex charset check checksum checksum_agg choose close coalesce coercibility collate collation collationproperty column columns columns_updated commit compress concat concat_ws concurrent connect connection connection_id consistent constraint constraints continue contributors conv convert convert_tz corresponding cos cot count count_big crc32 create cross cume_dist curdate current current_date current_time current_timestamp current_user cursor curtime data database databases datalength date_add date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts datetimeoffsetfromparts day dayname dayofmonth dayofweek dayofyear deallocate declare decode default deferrable deferred degrees delayed delete des_decrypt des_encrypt des_key_file desc describe descriptor diagnostics difference disconnect distinct distinctrow div do domain double drop dumpfile each else elt enclosed encode encrypt end end-exec engine engines eomonth errors escape escaped event eventdata events except exception exec execute exists exp explain export_set extended external extract fast fetch field fields find_in_set first first_value floor flush for force foreign format found found_rows from from_base64 from_days from_unixtime full function get get_format get_lock getdate getutcdate global go goto grant grants greatest group group_concat grouping grouping_id gtid_subset gtid_subtract handler having help hex high_priority hosts hour ident_current ident_incr ident_seed identified identity if ifnull ignore iif ilike immediate in index indicator inet6_aton inet6_ntoa inet_aton inet_ntoa infile initially inner innodb input insert install instr intersect into is is_free_lock is_ipv4 is_ipv4_compat is_ipv4_mapped is_not is_not_null is_used_lock isdate isnull isolation join key kill language last last_day last_insert_id last_value lcase lead leading least leaves left len lenght level like limit lines ln load load_file local localtime localtimestamp locate lock log log10 log2 logfile logs low_priority lower lpad ltrim make_set makedate maketime master master_pos_wait match matched max md5 medium merge microsecond mid min minute mod mode module month monthname mutex name_const names national natural nchar next no no_write_to_binlog not now nullif nvarchar oct octet_length of old_password on only open optimize option optionally or ord order outer outfile output pad parse partial partition password patindex percent_rank percentile_cont percentile_disc period_add period_diff pi plugin position pow power pragma precision prepare preserve primary prior privileges procedure procedure_analyze processlist profile profiles public publishingservername purge quarter query quick quote quotename radians rand read references regexp relative relaylog release release_lock rename repair repeat replace replicate reset restore restrict return returns reverse revoke right rlike rollback rollup round row row_count rows rpad rtrim savepoint schema scroll sec_to_time second section select serializable server session session_user set sha sha1 sha2 share show sign sin size slave sleep smalldatetimefromparts snapshot some soname soundex sounds_like space sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_no_cache sql_small_result sql_variant_property sqlstate sqrt square start starting status std stddev stddev_pop stddev_samp stdev stdevp stop str str_to_date straight_join strcmp string stuff subdate substr substring subtime subtring_index sum switchoffset sysdate sysdatetime sysdatetimeoffset system_user sysutcdatetime table tables tablespace tan temporary terminated tertiary_weights then time time_format time_to_sec timediff timefromparts timestamp timestampadd timestampdiff timezone_hour timezone_minute to to_base64 to_days to_seconds todatetimeoffset trailing transaction translation trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse ucase uncompress uncompressed_length unhex unicode uninstall union unique unix_timestamp unknown unlock update upgrade upped upper usage use user user_resources using utc_date utc_time utc_timestamp uuid uuid_short validate_password_strength value values var var_pop var_samp variables variance varp version view warnings week weekday weekofyear weight_string when whenever where with work write xml xor year yearweek zon\",\nliteral:\"true false null\",built_in:\"array bigint binary bit blob boolean char character date dec decimal float int integer interval number numeric real serial smallint varchar varying int8 serial8 text\"},c:[{cN:\"string\",b:\"'\",e:\"'\",c:[e.BE,{b:\"''\"}]},{cN:\"string\",b:'\"',e:'\"',c:[e.BE,{b:'\"\"'}]},{cN:\"string\",b:\"`\",e:\"`\",c:[e.BE]},e.CNM,e.CBCM,t]},e.CBCM,t]}});"

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/chjj/marked
	 */

	;(function() {

	/**
	 * Block-Level Grammar
	 */

	var block = {
	  newline: /^\n+/,
	  code: /^( {4}[^\n]+\n*)+/,
	  fences: noop,
	  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
	  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
	  nptable: noop,
	  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
	  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
	  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
	  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
	  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
	  table: noop,
	  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
	  text: /^[^\n]+/
	};

	block.bullet = /(?:[*+-]|\d+\.)/;
	block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
	block.item = replace(block.item, 'gm')
	  (/bull/g, block.bullet)
	  ();

	block.list = replace(block.list)
	  (/bull/g, block.bullet)
	  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
	  ('def', '\\n+(?=' + block.def.source + ')')
	  ();

	block.blockquote = replace(block.blockquote)
	  ('def', block.def)
	  ();

	block._tag = '(?!(?:'
	  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
	  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
	  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

	block.html = replace(block.html)
	  ('comment', /<!--[\s\S]*?-->/)
	  ('closed', /<(tag)[\s\S]+?<\/\1>/)
	  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
	  (/tag/g, block._tag)
	  ();

	block.paragraph = replace(block.paragraph)
	  ('hr', block.hr)
	  ('heading', block.heading)
	  ('lheading', block.lheading)
	  ('blockquote', block.blockquote)
	  ('tag', '<' + block._tag)
	  ('def', block.def)
	  ();

	/**
	 * Normal Block Grammar
	 */

	block.normal = merge({}, block);

	/**
	 * GFM Block Grammar
	 */

	block.gfm = merge({}, block.normal, {
	  fences: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,
	  paragraph: /^/
	});

	block.gfm.paragraph = replace(block.paragraph)
	  ('(?!', '(?!'
	    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
	    + block.list.source.replace('\\1', '\\3') + '|')
	  ();

	/**
	 * GFM + Tables Block Grammar
	 */

	block.tables = merge({}, block.gfm, {
	  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
	  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
	});

	/**
	 * Block Lexer
	 */

	function Lexer(options) {
	  this.tokens = [];
	  this.tokens.links = {};
	  this.options = options || marked.defaults;
	  this.rules = block.normal;

	  if (this.options.gfm) {
	    if (this.options.tables) {
	      this.rules = block.tables;
	    } else {
	      this.rules = block.gfm;
	    }
	  }
	}

	/**
	 * Expose Block Rules
	 */

	Lexer.rules = block;

	/**
	 * Static Lex Method
	 */

	Lexer.lex = function(src, options) {
	  var lexer = new Lexer(options);
	  return lexer.lex(src);
	};

	/**
	 * Preprocessing
	 */

	Lexer.prototype.lex = function(src) {
	  src = src
	    .replace(/\r\n|\r/g, '\n')
	    .replace(/\t/g, '    ')
	    .replace(/\u00a0/g, ' ')
	    .replace(/\u2424/g, '\n');

	  return this.token(src, true);
	};

	/**
	 * Lexing
	 */

	Lexer.prototype.token = function(src, top, bq) {
	  var src = src.replace(/^ +$/gm, '')
	    , next
	    , loose
	    , cap
	    , bull
	    , b
	    , item
	    , space
	    , i
	    , l;

	  while (src) {
	    // newline
	    if (cap = this.rules.newline.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[0].length > 1) {
	        this.tokens.push({
	          type: 'space'
	        });
	      }
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      cap = cap[0].replace(/^ {4}/gm, '');
	      this.tokens.push({
	        type: 'code',
	        text: !this.options.pedantic
	          ? cap.replace(/\n+$/, '')
	          : cap
	      });
	      continue;
	    }

	    // fences (gfm)
	    if (cap = this.rules.fences.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'code',
	        lang: cap[2],
	        text: cap[3]
	      });
	      continue;
	    }

	    // heading
	    if (cap = this.rules.heading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[1].length,
	        text: cap[2]
	      });
	      continue;
	    }

	    // table no leading pipe (gfm)
	    if (top && (cap = this.rules.nptable.exec(src))) {
	      src = src.substring(cap[0].length);

	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/\n$/, '').split('\n')
	      };

	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }

	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i].split(/ *\| */);
	      }

	      this.tokens.push(item);

	      continue;
	    }

	    // lheading
	    if (cap = this.rules.lheading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[2] === '=' ? 1 : 2,
	        text: cap[1]
	      });
	      continue;
	    }

	    // hr
	    if (cap = this.rules.hr.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'hr'
	      });
	      continue;
	    }

	    // blockquote
	    if (cap = this.rules.blockquote.exec(src)) {
	      src = src.substring(cap[0].length);

	      this.tokens.push({
	        type: 'blockquote_start'
	      });

	      cap = cap[0].replace(/^ *> ?/gm, '');

	      // Pass `top` to keep the current
	      // "toplevel" state. This is exactly
	      // how markdown.pl works.
	      this.token(cap, top, true);

	      this.tokens.push({
	        type: 'blockquote_end'
	      });

	      continue;
	    }

	    // list
	    if (cap = this.rules.list.exec(src)) {
	      src = src.substring(cap[0].length);
	      bull = cap[2];

	      this.tokens.push({
	        type: 'list_start',
	        ordered: bull.length > 1
	      });

	      // Get each top-level item.
	      cap = cap[0].match(this.rules.item);

	      next = false;
	      l = cap.length;
	      i = 0;

	      for (; i < l; i++) {
	        item = cap[i];

	        // Remove the list item's bullet
	        // so it is seen as the next token.
	        space = item.length;
	        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

	        // Outdent whatever the
	        // list item contains. Hacky.
	        if (~item.indexOf('\n ')) {
	          space -= item.length;
	          item = !this.options.pedantic
	            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
	            : item.replace(/^ {1,4}/gm, '');
	        }

	        // Determine whether the next list item belongs here.
	        // Backpedal if it does not belong in this list.
	        if (this.options.smartLists && i !== l - 1) {
	          b = block.bullet.exec(cap[i + 1])[0];
	          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
	            src = cap.slice(i + 1).join('\n') + src;
	            i = l - 1;
	          }
	        }

	        // Determine whether item is loose or not.
	        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
	        // for discount behavior.
	        loose = next || /\n\n(?!\s*$)/.test(item);
	        if (i !== l - 1) {
	          next = item.charAt(item.length - 1) === '\n';
	          if (!loose) loose = next;
	        }

	        this.tokens.push({
	          type: loose
	            ? 'loose_item_start'
	            : 'list_item_start'
	        });

	        // Recurse.
	        this.token(item, false, bq);

	        this.tokens.push({
	          type: 'list_item_end'
	        });
	      }

	      this.tokens.push({
	        type: 'list_end'
	      });

	      continue;
	    }

	    // html
	    if (cap = this.rules.html.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: this.options.sanitize
	          ? 'paragraph'
	          : 'html',
	        pre: cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style',
	        text: cap[0]
	      });
	      continue;
	    }

	    // def
	    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.links[cap[1].toLowerCase()] = {
	        href: cap[2],
	        title: cap[3]
	      };
	      continue;
	    }

	    // table (gfm)
	    if (top && (cap = this.rules.table.exec(src))) {
	      src = src.substring(cap[0].length);

	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
	      };

	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }

	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i]
	          .replace(/^ *\| *| *\| *$/g, '')
	          .split(/ *\| */);
	      }

	      this.tokens.push(item);

	      continue;
	    }

	    // top-level paragraph
	    if (top && (cap = this.rules.paragraph.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'paragraph',
	        text: cap[1].charAt(cap[1].length - 1) === '\n'
	          ? cap[1].slice(0, -1)
	          : cap[1]
	      });
	      continue;
	    }

	    // text
	    if (cap = this.rules.text.exec(src)) {
	      // Top-level should never reach here.
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'text',
	        text: cap[0]
	      });
	      continue;
	    }

	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }

	  return this.tokens;
	};

	/**
	 * Inline-Level Grammar
	 */

	var inline = {
	  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
	  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
	  url: noop,
	  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
	  link: /^!?\[(inside)\]\(href\)/,
	  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
	  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
	  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
	  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
	  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
	  br: /^ {2,}\n(?!\s*$)/,
	  del: noop,
	  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
	};

	inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
	inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

	inline.link = replace(inline.link)
	  ('inside', inline._inside)
	  ('href', inline._href)
	  ();

	inline.reflink = replace(inline.reflink)
	  ('inside', inline._inside)
	  ();

	/**
	 * Normal Inline Grammar
	 */

	inline.normal = merge({}, inline);

	/**
	 * Pedantic Inline Grammar
	 */

	inline.pedantic = merge({}, inline.normal, {
	  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
	  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
	});

	/**
	 * GFM Inline Grammar
	 */

	inline.gfm = merge({}, inline.normal, {
	  escape: replace(inline.escape)('])', '~|])')(),
	  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
	  del: /^~~(?=\S)([\s\S]*?\S)~~/,
	  text: replace(inline.text)
	    (']|', '~]|')
	    ('|', '|https?://|')
	    ()
	});

	/**
	 * GFM + Line Breaks Inline Grammar
	 */

	inline.breaks = merge({}, inline.gfm, {
	  br: replace(inline.br)('{2,}', '*')(),
	  text: replace(inline.gfm.text)('{2,}', '*')()
	});

	/**
	 * Inline Lexer & Compiler
	 */

	function InlineLexer(links, options) {
	  this.options = options || marked.defaults;
	  this.links = links;
	  this.rules = inline.normal;
	  this.renderer = this.options.renderer || new Renderer;
	  this.renderer.options = this.options;

	  if (!this.links) {
	    throw new
	      Error('Tokens array requires a `links` property.');
	  }

	  if (this.options.gfm) {
	    if (this.options.breaks) {
	      this.rules = inline.breaks;
	    } else {
	      this.rules = inline.gfm;
	    }
	  } else if (this.options.pedantic) {
	    this.rules = inline.pedantic;
	  }
	}

	/**
	 * Expose Inline Rules
	 */

	InlineLexer.rules = inline;

	/**
	 * Static Lexing/Compiling Method
	 */

	InlineLexer.output = function(src, links, options) {
	  var inline = new InlineLexer(links, options);
	  return inline.output(src);
	};

	/**
	 * Lexing/Compiling
	 */

	InlineLexer.prototype.output = function(src) {
	  var out = ''
	    , link
	    , text
	    , href
	    , cap;

	  while (src) {
	    // escape
	    if (cap = this.rules.escape.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += cap[1];
	      continue;
	    }

	    // autolink
	    if (cap = this.rules.autolink.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[2] === '@') {
	        text = cap[1].charAt(6) === ':'
	          ? this.mangle(cap[1].substring(7))
	          : this.mangle(cap[1]);
	        href = this.mangle('mailto:') + text;
	      } else {
	        text = escape(cap[1]);
	        href = text;
	      }
	      out += this.renderer.link(href, null, text);
	      continue;
	    }

	    // url (gfm)
	    if (!this.inLink && (cap = this.rules.url.exec(src))) {
	      src = src.substring(cap[0].length);
	      text = escape(cap[1]);
	      href = text;
	      out += this.renderer.link(href, null, text);
	      continue;
	    }

	    // tag
	    if (cap = this.rules.tag.exec(src)) {
	      if (!this.inLink && /^<a /i.test(cap[0])) {
	        this.inLink = true;
	      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
	        this.inLink = false;
	      }
	      src = src.substring(cap[0].length);
	      out += this.options.sanitize
	        ? escape(cap[0])
	        : cap[0];
	      continue;
	    }

	    // link
	    if (cap = this.rules.link.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.inLink = true;
	      out += this.outputLink(cap, {
	        href: cap[2],
	        title: cap[3]
	      });
	      this.inLink = false;
	      continue;
	    }

	    // reflink, nolink
	    if ((cap = this.rules.reflink.exec(src))
	        || (cap = this.rules.nolink.exec(src))) {
	      src = src.substring(cap[0].length);
	      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
	      link = this.links[link.toLowerCase()];
	      if (!link || !link.href) {
	        out += cap[0].charAt(0);
	        src = cap[0].substring(1) + src;
	        continue;
	      }
	      this.inLink = true;
	      out += this.outputLink(cap, link);
	      this.inLink = false;
	      continue;
	    }

	    // strong
	    if (cap = this.rules.strong.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.strong(this.output(cap[2] || cap[1]));
	      continue;
	    }

	    // em
	    if (cap = this.rules.em.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.em(this.output(cap[2] || cap[1]));
	      continue;
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.codespan(escape(cap[2], true));
	      continue;
	    }

	    // br
	    if (cap = this.rules.br.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.br();
	      continue;
	    }

	    // del (gfm)
	    if (cap = this.rules.del.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.del(this.output(cap[1]));
	      continue;
	    }

	    // text
	    if (cap = this.rules.text.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += escape(this.smartypants(cap[0]));
	      continue;
	    }

	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }

	  return out;
	};

	/**
	 * Compile Link
	 */

	InlineLexer.prototype.outputLink = function(cap, link) {
	  var href = escape(link.href)
	    , title = link.title ? escape(link.title) : null;

	  return cap[0].charAt(0) !== '!'
	    ? this.renderer.link(href, title, this.output(cap[1]))
	    : this.renderer.image(href, title, escape(cap[1]));
	};

	/**
	 * Smartypants Transformations
	 */

	InlineLexer.prototype.smartypants = function(text) {
	  if (!this.options.smartypants) return text;
	  return text
	    // em-dashes
	    .replace(/--/g, '\u2014')
	    // opening singles
	    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
	    // closing singles & apostrophes
	    .replace(/'/g, '\u2019')
	    // opening doubles
	    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
	    // closing doubles
	    .replace(/"/g, '\u201d')
	    // ellipses
	    .replace(/\.{3}/g, '\u2026');
	};

	/**
	 * Mangle Links
	 */

	InlineLexer.prototype.mangle = function(text) {
	  var out = ''
	    , l = text.length
	    , i = 0
	    , ch;

	  for (; i < l; i++) {
	    ch = text.charCodeAt(i);
	    if (Math.random() > 0.5) {
	      ch = 'x' + ch.toString(16);
	    }
	    out += '&#' + ch + ';';
	  }

	  return out;
	};

	/**
	 * Renderer
	 */

	function Renderer(options) {
	  this.options = options || {};
	}

	Renderer.prototype.code = function(code, lang, escaped) {
	  if (this.options.highlight) {
	    var out = this.options.highlight(code, lang);
	    if (out != null && out !== code) {
	      escaped = true;
	      code = out;
	    }
	  }

	  if (!lang) {
	    return '<pre><code>'
	      + (escaped ? code : escape(code, true))
	      + '\n</code></pre>';
	  }

	  return '<pre><code class="'
	    + this.options.langPrefix
	    + escape(lang, true)
	    + '">'
	    + (escaped ? code : escape(code, true))
	    + '\n</code></pre>\n';
	};

	Renderer.prototype.blockquote = function(quote) {
	  return '<blockquote>\n' + quote + '</blockquote>\n';
	};

	Renderer.prototype.html = function(html) {
	  return html;
	};

	Renderer.prototype.heading = function(text, level, raw) {
	  return '<h'
	    + level
	    + ' id="'
	    + this.options.headerPrefix
	    + raw.toLowerCase().replace(/[^\w]+/g, '-')
	    + '">'
	    + text
	    + '</h'
	    + level
	    + '>\n';
	};

	Renderer.prototype.hr = function() {
	  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
	};

	Renderer.prototype.list = function(body, ordered) {
	  var type = ordered ? 'ol' : 'ul';
	  return '<' + type + '>\n' + body + '</' + type + '>\n';
	};

	Renderer.prototype.listitem = function(text) {
	  return '<li>' + text + '</li>\n';
	};

	Renderer.prototype.paragraph = function(text) {
	  return '<p>' + text + '</p>\n';
	};

	Renderer.prototype.table = function(header, body) {
	  return '<table>\n'
	    + '<thead>\n'
	    + header
	    + '</thead>\n'
	    + '<tbody>\n'
	    + body
	    + '</tbody>\n'
	    + '</table>\n';
	};

	Renderer.prototype.tablerow = function(content) {
	  return '<tr>\n' + content + '</tr>\n';
	};

	Renderer.prototype.tablecell = function(content, flags) {
	  var type = flags.header ? 'th' : 'td';
	  var tag = flags.align
	    ? '<' + type + ' style="text-align:' + flags.align + '">'
	    : '<' + type + '>';
	  return tag + content + '</' + type + '>\n';
	};

	// span level renderer
	Renderer.prototype.strong = function(text) {
	  return '<strong>' + text + '</strong>';
	};

	Renderer.prototype.em = function(text) {
	  return '<em>' + text + '</em>';
	};

	Renderer.prototype.codespan = function(text) {
	  return '<code>' + text + '</code>';
	};

	Renderer.prototype.br = function() {
	  return this.options.xhtml ? '<br/>' : '<br>';
	};

	Renderer.prototype.del = function(text) {
	  return '<del>' + text + '</del>';
	};

	Renderer.prototype.link = function(href, title, text) {
	  if (this.options.sanitize) {
	    try {
	      var prot = decodeURIComponent(unescape(href))
	        .replace(/[^\w:]/g, '')
	        .toLowerCase();
	    } catch (e) {
	      return '';
	    }
	    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
	      return '';
	    }
	  }
	  var out = '<a href="' + href + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += '>' + text + '</a>';
	  return out;
	};

	Renderer.prototype.image = function(href, title, text) {
	  var out = '<img src="' + href + '" alt="' + text + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += this.options.xhtml ? '/>' : '>';
	  return out;
	};

	/**
	 * Parsing & Compiling
	 */

	function Parser(options) {
	  this.tokens = [];
	  this.token = null;
	  this.options = options || marked.defaults;
	  this.options.renderer = this.options.renderer || new Renderer;
	  this.renderer = this.options.renderer;
	  this.renderer.options = this.options;
	}

	/**
	 * Static Parse Method
	 */

	Parser.parse = function(src, options, renderer) {
	  var parser = new Parser(options, renderer);
	  return parser.parse(src);
	};

	/**
	 * Parse Loop
	 */

	Parser.prototype.parse = function(src) {
	  this.inline = new InlineLexer(src.links, this.options, this.renderer);
	  this.tokens = src.reverse();

	  var out = '';
	  while (this.next()) {
	    out += this.tok();
	  }

	  return out;
	};

	/**
	 * Next Token
	 */

	Parser.prototype.next = function() {
	  return this.token = this.tokens.pop();
	};

	/**
	 * Preview Next Token
	 */

	Parser.prototype.peek = function() {
	  return this.tokens[this.tokens.length - 1] || 0;
	};

	/**
	 * Parse Text Tokens
	 */

	Parser.prototype.parseText = function() {
	  var body = this.token.text;

	  while (this.peek().type === 'text') {
	    body += '\n' + this.next().text;
	  }

	  return this.inline.output(body);
	};

	/**
	 * Parse Current Token
	 */

	Parser.prototype.tok = function() {
	  switch (this.token.type) {
	    case 'space': {
	      return '';
	    }
	    case 'hr': {
	      return this.renderer.hr();
	    }
	    case 'heading': {
	      return this.renderer.heading(
	        this.inline.output(this.token.text),
	        this.token.depth,
	        this.token.text);
	    }
	    case 'code': {
	      return this.renderer.code(this.token.text,
	        this.token.lang,
	        this.token.escaped);
	    }
	    case 'table': {
	      var header = ''
	        , body = ''
	        , i
	        , row
	        , cell
	        , flags
	        , j;

	      // header
	      cell = '';
	      for (i = 0; i < this.token.header.length; i++) {
	        flags = { header: true, align: this.token.align[i] };
	        cell += this.renderer.tablecell(
	          this.inline.output(this.token.header[i]),
	          { header: true, align: this.token.align[i] }
	        );
	      }
	      header += this.renderer.tablerow(cell);

	      for (i = 0; i < this.token.cells.length; i++) {
	        row = this.token.cells[i];

	        cell = '';
	        for (j = 0; j < row.length; j++) {
	          cell += this.renderer.tablecell(
	            this.inline.output(row[j]),
	            { header: false, align: this.token.align[j] }
	          );
	        }

	        body += this.renderer.tablerow(cell);
	      }
	      return this.renderer.table(header, body);
	    }
	    case 'blockquote_start': {
	      var body = '';

	      while (this.next().type !== 'blockquote_end') {
	        body += this.tok();
	      }

	      return this.renderer.blockquote(body);
	    }
	    case 'list_start': {
	      var body = ''
	        , ordered = this.token.ordered;

	      while (this.next().type !== 'list_end') {
	        body += this.tok();
	      }

	      return this.renderer.list(body, ordered);
	    }
	    case 'list_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.token.type === 'text'
	          ? this.parseText()
	          : this.tok();
	      }

	      return this.renderer.listitem(body);
	    }
	    case 'loose_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.tok();
	      }

	      return this.renderer.listitem(body);
	    }
	    case 'html': {
	      var html = !this.token.pre && !this.options.pedantic
	        ? this.inline.output(this.token.text)
	        : this.token.text;
	      return this.renderer.html(html);
	    }
	    case 'paragraph': {
	      return this.renderer.paragraph(this.inline.output(this.token.text));
	    }
	    case 'text': {
	      return this.renderer.paragraph(this.parseText());
	    }
	  }
	};

	/**
	 * Helpers
	 */

	function escape(html, encode) {
	  return html
	    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/"/g, '&quot;')
	    .replace(/'/g, '&#39;');
	}

	function unescape(html) {
	  return html.replace(/&([#\w]+);/g, function(_, n) {
	    n = n.toLowerCase();
	    if (n === 'colon') return ':';
	    if (n.charAt(0) === '#') {
	      return n.charAt(1) === 'x'
	        ? String.fromCharCode(parseInt(n.substring(2), 16))
	        : String.fromCharCode(+n.substring(1));
	    }
	    return '';
	  });
	}

	function replace(regex, opt) {
	  regex = regex.source;
	  opt = opt || '';
	  return function self(name, val) {
	    if (!name) return new RegExp(regex, opt);
	    val = val.source || val;
	    val = val.replace(/(^|[^\[])\^/g, '$1');
	    regex = regex.replace(name, val);
	    return self;
	  };
	}

	function noop() {}
	noop.exec = noop;

	function merge(obj) {
	  var i = 1
	    , target
	    , key;

	  for (; i < arguments.length; i++) {
	    target = arguments[i];
	    for (key in target) {
	      if (Object.prototype.hasOwnProperty.call(target, key)) {
	        obj[key] = target[key];
	      }
	    }
	  }

	  return obj;
	}


	/**
	 * Marked
	 */

	function marked(src, opt, callback) {
	  if (callback || typeof opt === 'function') {
	    if (!callback) {
	      callback = opt;
	      opt = null;
	    }

	    opt = merge({}, marked.defaults, opt || {});

	    var highlight = opt.highlight
	      , tokens
	      , pending
	      , i = 0;

	    try {
	      tokens = Lexer.lex(src, opt)
	    } catch (e) {
	      return callback(e);
	    }

	    pending = tokens.length;

	    var done = function(err) {
	      if (err) {
	        opt.highlight = highlight;
	        return callback(err);
	      }

	      var out;

	      try {
	        out = Parser.parse(tokens, opt);
	      } catch (e) {
	        err = e;
	      }

	      opt.highlight = highlight;

	      return err
	        ? callback(err)
	        : callback(null, out);
	    };

	    if (!highlight || highlight.length < 3) {
	      return done();
	    }

	    delete opt.highlight;

	    if (!pending) return done();

	    for (; i < tokens.length; i++) {
	      (function(token) {
	        if (token.type !== 'code') {
	          return --pending || done();
	        }
	        return highlight(token.text, token.lang, function(err, code) {
	          if (err) return done(err);
	          if (code == null || code === token.text) {
	            return --pending || done();
	          }
	          token.text = code;
	          token.escaped = true;
	          --pending || done();
	        });
	      })(tokens[i]);
	    }

	    return;
	  }
	  try {
	    if (opt) opt = merge({}, marked.defaults, opt);
	    return Parser.parse(Lexer.lex(src, opt), opt);
	  } catch (e) {
	    e.message += '\nPlease report this to https://github.com/chjj/marked.';
	    if ((opt || marked.defaults).silent) {
	      return '<p>An error occured:</p><pre>'
	        + escape(e.message + '', true)
	        + '</pre>';
	    }
	    throw e;
	  }
	}

	/**
	 * Options
	 */

	marked.options =
	marked.setOptions = function(opt) {
	  merge(marked.defaults, opt);
	  return marked;
	};

	marked.defaults = {
	  gfm: true,
	  tables: true,
	  breaks: false,
	  pedantic: false,
	  sanitize: false,
	  smartLists: false,
	  silent: false,
	  highlight: null,
	  langPrefix: 'lang-',
	  smartypants: false,
	  headerPrefix: '',
	  renderer: new Renderer,
	  xhtml: false
	};

	/**
	 * Expose
	 */

	marked.Parser = Parser;
	marked.parser = Parser.parse;

	marked.Renderer = Renderer;

	marked.Lexer = Lexer;
	marked.lexer = Lexer.lex;

	marked.InlineLexer = InlineLexer;
	marked.inlineLexer = InlineLexer.output;

	marked.parse = marked;

	if (true) {
	  module.exports = marked;
	} else if (typeof define === 'function' && define.amd) {
	  define(function() { return marked; });
	} else {
	  this.marked = marked;
	}

	}).call(function() {
	  return this || (typeof window !== 'undefined' ? window : global);
	}());

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ]);
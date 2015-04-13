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
	var Blocks, Channel, KeyboardShortcuts, Makona, MakonaEditor, MakonaEditorControls, MakonaEditorRow, MakonaPlusRow, MakonaPreviewList, MakonaPreviewerRow, MakonaRaw, MakonaRawPre, MakonaSortableItem, MakonaSortableList,
	  slice = [].slice;

	if (typeof jQuery === "undefined" || jQuery === null) {
	  throw new Error("Makona requires jQuery");
	}


	/* Includes and Constants */

	__webpack_require__(3);

	__webpack_require__(10);

	__webpack_require__(4);

	__webpack_require__(5);

	__webpack_require__(11);

	Blocks = __webpack_require__(1);

	Channel = postal.channel("makona");

	KeyboardShortcuts = __webpack_require__(2);

	Makona = (function() {
	  function Makona(opts) {
	    var $node;
	    $node = $("#" + opts.nodeId);
	    opts.node_name || (opts.node_name = $node.attr("name"));
	    opts.html_node_name || (opts.html_node_name = $node.data("rendered-output-name"));
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
	  handleCaret: function() {
	    var node;
	    if (this.props.block.type === 'markdown' && (this.props.block.focus != null)) {
	      node = $(this.getDOMNode()).find('textarea');
	      if (!node.is(':focus')) {
	        return node.focus().caretToEnd();
	      }
	    }
	  },
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
	    return React.createElement("div", {className: "mk-plus", onClick: this.handleClick}, 
	        React.createElement("a", {className: "mk-plus-add", style: plus_style, href: "javascript:void(0);", onClick: this.toggleLinks}, "+"), 
	        React.createElement("div", {className: "mk-plus-links", style: links_style}, 
	          this.blockTypes()
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
	    var ary, comp, html, ref;
	    ary = [
	      React.DOM.textarea({
	        className: "mk-raw",
	        readOnly: true,
	        name: this.props.opts.node_name,
	        value: JSON.stringify(this.props.blocks, null, 2)
	      })
	    ];
	    comp = React.createElement(MakonaPreviewList, {
	      blocks: this.props.blocks,
	      opts: this.props.opts
	    });
	    ary.push(comp);
	    if (this.props.opts.html_node_name) {
	      html = React.renderToStaticMarkup(comp);
	      ary.push(React.DOM.textarea({
	        className: "mk-raw",
	        readOnly: true,
	        name: this.props.opts.html_node_name,
	        value: html
	      }));
	    }
	    return (ref = React.DOM).div.apply(ref, [null].concat(slice.call(ary)));
	  }
	});

	MakonaRawPre = React.createClass({
	  displayName: "MakonaRawPre",
	  propTypes: {
	    blocks: React.PropTypes.array.isRequired,
	    opts: React.PropTypes.object.isRequired
	  },
	  render: function() {
	    return React.createElement("pre", {name: this.props.opts.node_name}, JSON.stringify(this.props.blocks, null, 2));
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
	    previewClass: __webpack_require__(13),
	    editable: false,
	    createable: false,
	    data: {}
	  }, {
	    type: "text",
	    displayName: "Text",
	    icon: '\x62',
	    editorClass: __webpack_require__(14),
	    previewClass: __webpack_require__(15),
	    editable: true,
	    createable: true,
	    data: {
	      text: "New text block..."
	    }
	  }, {
	    type: "html",
	    displayName: "HTML",
	    icon: '\ue036',
	    editorClass: __webpack_require__(16),
	    previewClass: __webpack_require__(17),
	    editable: true,
	    createable: true,
	    data: {
	      text: "Raw HTML code here..."
	    }
	  }, {
	    type: "javascript",
	    displayName: "JavaScript",
	    icon: '\ue036',
	    editorClass: __webpack_require__(18),
	    previewClass: __webpack_require__(19),
	    editable: true,
	    createable: true,
	    data: {
	      text: "console.log('JS tag');"
	    }
	  }, {
	    type: "markdown",
	    displayName: 'Markdown',
	    icon: '\x68',
	    editorClass: __webpack_require__(20),
	    previewClass: __webpack_require__(21),
	    editable: true,
	    createable: true,
	    data: {
	      text: "# Heading\nText block..\n"
	    }
	  }, {
	    type: "quote",
	    displayName: 'Quote',
	    icon: '\x7b',
	    editorClass: __webpack_require__(22),
	    previewClass: __webpack_require__(23),
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
	    editorClass: __webpack_require__(24),
	    previewClass: __webpack_require__(25),
	    editable: true,
	    createable: true,
	    data: {
	      text: "function doSomething(x) {\n  doImportant();\n};"
	    }
	  }, {
	    type: "image",
	    displayName: "Image",
	    icon: '\ue005',
	    editorClass: __webpack_require__(26),
	    previewClass: __webpack_require__(27),
	    editable: false,
	    createable: true,
	    data: {
	      src: ""
	    }
	  }, {
	    type: "document",
	    displayName: "Document",
	    icon: '\x69',
	    editorClass: __webpack_require__(28),
	    previewClass: __webpack_require__(29),
	    editable: false,
	    createable: true,
	    data: {
	      title: ""
	    }
	  }, {
	    type: "screencast",
	    displayName: "Screencast",
	    icon: '\ue00e',
	    editorClass: __webpack_require__(30),
	    previewClass: __webpack_require__(31),
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

	__webpack_require__(10);

	__webpack_require__(32);

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

	module.exports = "(function(b){b.caretTo=function(a,b){if(a.createTextRange){var d=a.createTextRange();d.move(\"character\",b);d.select()}else null!=a.selectionStart&&(a.focus(),a.setSelectionRange(b,b))};b.caretPos=function(a){if(\"selection\"in document){a=a.createTextRange();try{a.setEndPoint(\"EndToStart\",document.selection.createRange())}catch(b){return 0}return a.text.length}if(null!=a.selectionStart)return a.selectionStart};b.fn.caret=function(a,e){return\"undefined\"===typeof a?b.caretPos(this.get(0)):this.queue(function(d){if(isNaN(a)){var c=\nb(this).val().indexOf(a);!0===e?c+=a.length:\"undefined\"!==typeof e&&(c+=e);b.caretTo(this,c)}else b.caretTo(this,a);d()})};b.fn.caretToStart=function(){return this.caret(0)};b.fn.caretToEnd=function(){return this.queue(function(a){b.caretTo(this,b(this).val().length);a()})}})(jQuery);"

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "/**\n * @license\n * Lo-Dash 2.4.1 (Custom Build) lodash.com/license | Underscore.js 1.5.2 underscorejs.org/LICENSE\n * Build: `lodash -o ./dist/lodash.compat.js`\n */\n;(function(){function n(n,t,e){e=(e||0)-1;for(var r=n?n.length:0;++e<r;)if(n[e]===t)return e;return-1}function t(t,e){var r=typeof e;if(t=t.l,\"boolean\"==r||null==e)return t[e]?0:-1;\"number\"!=r&&\"string\"!=r&&(r=\"object\");var u=\"number\"==r?e:b+e;return t=(t=t[r])&&t[u],\"object\"==r?t&&-1<n(t,e)?0:-1:t?0:-1}function e(n){var t=this.l,e=typeof n;if(\"boolean\"==e||null==n)t[n]=true;else{\"number\"!=e&&\"string\"!=e&&(e=\"object\");var r=\"number\"==e?n:b+n,t=t[e]||(t[e]={});\"object\"==e?(t[r]||(t[r]=[])).push(n):t[r]=true\n}}function r(n){return n.charCodeAt(0)}function u(n,t){for(var e=n.m,r=t.m,u=-1,o=e.length;++u<o;){var a=e[u],i=r[u];if(a!==i){if(a>i||typeof a==\"undefined\")return 1;if(a<i||typeof i==\"undefined\")return-1}}return n.n-t.n}function o(n){var t=-1,r=n.length,u=n[0],o=n[r/2|0],a=n[r-1];if(u&&typeof u==\"object\"&&o&&typeof o==\"object\"&&a&&typeof a==\"object\")return false;for(u=l(),u[\"false\"]=u[\"null\"]=u[\"true\"]=u.undefined=false,o=l(),o.k=n,o.l=u,o.push=e;++t<r;)o.push(n[t]);return o}function a(n){return\"\\\\\"+Y[n]\n}function i(){return v.pop()||[]}function l(){return y.pop()||{k:null,l:null,m:null,\"false\":false,n:0,\"null\":false,number:null,object:null,push:null,string:null,\"true\":false,undefined:false,o:null}}function f(n){return typeof n.toString!=\"function\"&&typeof(n+\"\")==\"string\"}function c(n){n.length=0,v.length<w&&v.push(n)}function p(n){var t=n.l;t&&p(t),n.k=n.l=n.m=n.object=n.number=n.string=n.o=null,y.length<w&&y.push(n)}function s(n,t,e){t||(t=0),typeof e==\"undefined\"&&(e=n?n.length:0);var r=-1;e=e-t||0;for(var u=Array(0>e?0:e);++r<e;)u[r]=n[t+r];\nreturn u}function g(e){function v(n){return n&&typeof n==\"object\"&&!qe(n)&&we.call(n,\"__wrapped__\")?n:new y(n)}function y(n,t){this.__chain__=!!t,this.__wrapped__=n}function w(n){function t(){if(r){var n=s(r);je.apply(n,arguments)}if(this instanceof t){var o=nt(e.prototype),n=e.apply(o,n||arguments);return xt(n)?n:o}return e.apply(u,n||arguments)}var e=n[0],r=n[2],u=n[4];return ze(t,n),t}function Y(n,t,e,r,u){if(e){var o=e(n);if(typeof o!=\"undefined\")return o}if(!xt(n))return n;var a=he.call(n);if(!V[a]||!Le.nodeClass&&f(n))return n;\nvar l=Te[a];switch(a){case L:case z:return new l(+n);case W:case M:return new l(n);case J:return o=l(n.source,S.exec(n)),o.lastIndex=n.lastIndex,o}if(a=qe(n),t){var p=!r;r||(r=i()),u||(u=i());for(var g=r.length;g--;)if(r[g]==n)return u[g];o=a?l(n.length):{}}else o=a?s(n):Ye({},n);return a&&(we.call(n,\"index\")&&(o.index=n.index),we.call(n,\"input\")&&(o.input=n.input)),t?(r.push(n),u.push(o),(a?Xe:tr)(n,function(n,a){o[a]=Y(n,t,e,r,u)}),p&&(c(r),c(u)),o):o}function nt(n){return xt(n)?Se(n):{}}function tt(n,t,e){if(typeof n!=\"function\")return Ht;\nif(typeof t==\"undefined\"||!(\"prototype\"in n))return n;var r=n.__bindData__;if(typeof r==\"undefined\"&&(Le.funcNames&&(r=!n.name),r=r||!Le.funcDecomp,!r)){var u=be.call(n);Le.funcNames||(r=!A.test(u)),r||(r=B.test(u),ze(n,r))}if(false===r||true!==r&&1&r[1])return n;switch(e){case 1:return function(e){return n.call(t,e)};case 2:return function(e,r){return n.call(t,e,r)};case 3:return function(e,r,u){return n.call(t,e,r,u)};case 4:return function(e,r,u,o){return n.call(t,e,r,u,o)}}return Mt(n,t)}function et(n){function t(){var n=l?a:this;\nif(u){var h=s(u);je.apply(h,arguments)}return(o||c)&&(h||(h=s(arguments)),o&&je.apply(h,o),c&&h.length<i)?(r|=16,et([e,p?r:-4&r,h,null,a,i])):(h||(h=arguments),f&&(e=n[g]),this instanceof t?(n=nt(e.prototype),h=e.apply(n,h),xt(h)?h:n):e.apply(n,h))}var e=n[0],r=n[1],u=n[2],o=n[3],a=n[4],i=n[5],l=1&r,f=2&r,c=4&r,p=8&r,g=e;return ze(t,n),t}function rt(e,r){var u=-1,a=ht(),i=e?e.length:0,l=i>=_&&a===n,f=[];if(l){var c=o(r);c?(a=t,r=c):l=false}for(;++u<i;)c=e[u],0>a(r,c)&&f.push(c);return l&&p(r),f}function ot(n,t,e,r){r=(r||0)-1;\nfor(var u=n?n.length:0,o=[];++r<u;){var a=n[r];if(a&&typeof a==\"object\"&&typeof a.length==\"number\"&&(qe(a)||dt(a))){t||(a=ot(a,t,e));var i=-1,l=a.length,f=o.length;for(o.length+=l;++i<l;)o[f++]=a[i]}else e||o.push(a)}return o}function at(n,t,e,r,u,o){if(e){var a=e(n,t);if(typeof a!=\"undefined\")return!!a}if(n===t)return 0!==n||1/n==1/t;if(n===n&&!(n&&X[typeof n]||t&&X[typeof t]))return false;if(null==n||null==t)return n===t;var l=he.call(n),p=he.call(t);if(l==T&&(l=G),p==T&&(p=G),l!=p)return false;switch(l){case L:case z:return+n==+t;\ncase W:return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case J:case M:return n==ie(t)}if(p=l==$,!p){var s=we.call(n,\"__wrapped__\"),g=we.call(t,\"__wrapped__\");if(s||g)return at(s?n.__wrapped__:n,g?t.__wrapped__:t,e,r,u,o);if(l!=G||!Le.nodeClass&&(f(n)||f(t)))return false;if(l=!Le.argsObject&&dt(n)?oe:n.constructor,s=!Le.argsObject&&dt(t)?oe:t.constructor,l!=s&&!(jt(l)&&l instanceof l&&jt(s)&&s instanceof s)&&\"constructor\"in n&&\"constructor\"in t)return false}for(l=!u,u||(u=i()),o||(o=i()),s=u.length;s--;)if(u[s]==n)return o[s]==t;\nvar h=0,a=true;if(u.push(n),o.push(t),p){if(s=n.length,h=t.length,(a=h==s)||r)for(;h--;)if(p=s,g=t[h],r)for(;p--&&!(a=at(n[p],g,e,r,u,o)););else if(!(a=at(n[h],g,e,r,u,o)))break}else nr(t,function(t,i,l){return we.call(l,i)?(h++,a=we.call(n,i)&&at(n[i],t,e,r,u,o)):void 0}),a&&!r&&nr(n,function(n,t,e){return we.call(e,t)?a=-1<--h:void 0});return u.pop(),o.pop(),l&&(c(u),c(o)),a}function it(n,t,e,r,u){(qe(t)?Dt:tr)(t,function(t,o){var a,i,l=t,f=n[o];if(t&&((i=qe(t))||er(t))){for(l=r.length;l--;)if(a=r[l]==t){f=u[l];\nbreak}if(!a){var c;e&&(l=e(f,t),c=typeof l!=\"undefined\")&&(f=l),c||(f=i?qe(f)?f:[]:er(f)?f:{}),r.push(t),u.push(f),c||it(f,t,e,r,u)}}else e&&(l=e(f,t),typeof l==\"undefined\"&&(l=t)),typeof l!=\"undefined\"&&(f=l);n[o]=f})}function lt(n,t){return n+de(Fe()*(t-n+1))}function ft(e,r,u){var a=-1,l=ht(),f=e?e.length:0,s=[],g=!r&&f>=_&&l===n,h=u||g?i():s;for(g&&(h=o(h),l=t);++a<f;){var v=e[a],y=u?u(v,a,e):v;(r?!a||h[h.length-1]!==y:0>l(h,y))&&((u||g)&&h.push(y),s.push(v))}return g?(c(h.k),p(h)):u&&c(h),s}function ct(n){return function(t,e,r){var u={};\nif(e=v.createCallback(e,r,3),qe(t)){r=-1;for(var o=t.length;++r<o;){var a=t[r];n(u,a,e(a,r,t),t)}}else Xe(t,function(t,r,o){n(u,t,e(t,r,o),o)});return u}}function pt(n,t,e,r,u,o){var a=1&t,i=4&t,l=16&t,f=32&t;if(!(2&t||jt(n)))throw new le;l&&!e.length&&(t&=-17,l=e=false),f&&!r.length&&(t&=-33,f=r=false);var c=n&&n.__bindData__;return c&&true!==c?(c=s(c),c[2]&&(c[2]=s(c[2])),c[3]&&(c[3]=s(c[3])),!a||1&c[1]||(c[4]=u),!a&&1&c[1]&&(t|=8),!i||4&c[1]||(c[5]=o),l&&je.apply(c[2]||(c[2]=[]),e),f&&Ee.apply(c[3]||(c[3]=[]),r),c[1]|=t,pt.apply(null,c)):(1==t||17===t?w:et)([n,t,e,r,u,o])\n}function st(){Q.h=F,Q.b=Q.c=Q.g=Q.i=\"\",Q.e=\"t\",Q.j=true;for(var n,t=0;n=arguments[t];t++)for(var e in n)Q[e]=n[e];t=Q.a,Q.d=/^[^,]+/.exec(t)[0],n=ee,t=\"return function(\"+t+\"){\",e=Q;var r=\"var n,t=\"+e.d+\",E=\"+e.e+\";if(!t)return E;\"+e.i+\";\";e.b?(r+=\"var u=t.length;n=-1;if(\"+e.b+\"){\",Le.unindexedChars&&(r+=\"if(s(t)){t=t.split('')}\"),r+=\"while(++n<u){\"+e.g+\";}}else{\"):Le.nonEnumArgs&&(r+=\"var u=t.length;n=-1;if(u&&p(t)){while(++n<u){n+='';\"+e.g+\";}}else{\"),Le.enumPrototypes&&(r+=\"var G=typeof t=='function';\"),Le.enumErrorProps&&(r+=\"var F=t===k||t instanceof Error;\");\nvar u=[];if(Le.enumPrototypes&&u.push('!(G&&n==\"prototype\")'),Le.enumErrorProps&&u.push('!(F&&(n==\"message\"||n==\"name\"))'),e.j&&e.f)r+=\"var C=-1,D=B[typeof t]&&v(t),u=D?D.length:0;while(++C<u){n=D[C];\",u.length&&(r+=\"if(\"+u.join(\"&&\")+\"){\"),r+=e.g+\";\",u.length&&(r+=\"}\"),r+=\"}\";else if(r+=\"for(n in t){\",e.j&&u.push(\"m.call(t, n)\"),u.length&&(r+=\"if(\"+u.join(\"&&\")+\"){\"),r+=e.g+\";\",u.length&&(r+=\"}\"),r+=\"}\",Le.nonEnumShadows){for(r+=\"if(t!==A){var i=t.constructor,r=t===(i&&i.prototype),f=t===J?I:t===k?j:L.call(t),x=y[f];\",k=0;7>k;k++)r+=\"n='\"+e.h[k]+\"';if((!(r&&x[n])&&m.call(t,n))\",e.j||(r+=\"||(!x[n]&&t[n]!==A[n])\"),r+=\"){\"+e.g+\"}\";\nr+=\"}\"}return(e.b||Le.nonEnumArgs)&&(r+=\"}\"),r+=e.c+\";return E\",n(\"d,j,k,m,o,p,q,s,v,A,B,y,I,J,L\",t+r+\"}\")(tt,q,ce,we,d,dt,qe,kt,Q.f,pe,X,$e,M,se,he)}function gt(n){return Ve[n]}function ht(){var t=(t=v.indexOf)===zt?n:t;return t}function vt(n){return typeof n==\"function\"&&ve.test(n)}function yt(n){var t,e;return!n||he.call(n)!=G||(t=n.constructor,jt(t)&&!(t instanceof t))||!Le.argsClass&&dt(n)||!Le.nodeClass&&f(n)?false:Le.ownLast?(nr(n,function(n,t,r){return e=we.call(r,t),false}),false!==e):(nr(n,function(n,t){e=t\n}),typeof e==\"undefined\"||we.call(n,e))}function mt(n){return He[n]}function dt(n){return n&&typeof n==\"object\"&&typeof n.length==\"number\"&&he.call(n)==T||false}function bt(n,t,e){var r=We(n),u=r.length;for(t=tt(t,e,3);u--&&(e=r[u],false!==t(n[e],e,n)););return n}function _t(n){var t=[];return nr(n,function(n,e){jt(n)&&t.push(e)}),t.sort()}function wt(n){for(var t=-1,e=We(n),r=e.length,u={};++t<r;){var o=e[t];u[n[o]]=o}return u}function jt(n){return typeof n==\"function\"}function xt(n){return!(!n||!X[typeof n])\n}function Ct(n){return typeof n==\"number\"||n&&typeof n==\"object\"&&he.call(n)==W||false}function kt(n){return typeof n==\"string\"||n&&typeof n==\"object\"&&he.call(n)==M||false}function Et(n){for(var t=-1,e=We(n),r=e.length,u=Zt(r);++t<r;)u[t]=n[e[t]];return u}function Ot(n,t,e){var r=-1,u=ht(),o=n?n.length:0,a=false;return e=(0>e?Be(0,o+e):e)||0,qe(n)?a=-1<u(n,t,e):typeof o==\"number\"?a=-1<(kt(n)?n.indexOf(t,e):u(n,t,e)):Xe(n,function(n){return++r<e?void 0:!(a=n===t)}),a}function St(n,t,e){var r=true;if(t=v.createCallback(t,e,3),qe(n)){e=-1;\nfor(var u=n.length;++e<u&&(r=!!t(n[e],e,n)););}else Xe(n,function(n,e,u){return r=!!t(n,e,u)});return r}function At(n,t,e){var r=[];if(t=v.createCallback(t,e,3),qe(n)){e=-1;for(var u=n.length;++e<u;){var o=n[e];t(o,e,n)&&r.push(o)}}else Xe(n,function(n,e,u){t(n,e,u)&&r.push(n)});return r}function It(n,t,e){if(t=v.createCallback(t,e,3),!qe(n)){var r;return Xe(n,function(n,e,u){return t(n,e,u)?(r=n,false):void 0}),r}e=-1;for(var u=n.length;++e<u;){var o=n[e];if(t(o,e,n))return o}}function Dt(n,t,e){if(t&&typeof e==\"undefined\"&&qe(n)){e=-1;\nfor(var r=n.length;++e<r&&false!==t(n[e],e,n););}else Xe(n,t,e);return n}function Nt(n,t,e){var r=n,u=n?n.length:0;if(t=t&&typeof e==\"undefined\"?t:tt(t,e,3),qe(n))for(;u--&&false!==t(n[u],u,n););else{if(typeof u!=\"number\")var o=We(n),u=o.length;else Le.unindexedChars&&kt(n)&&(r=n.split(\"\"));Xe(n,function(n,e,a){return e=o?o[--u]:--u,t(r[e],e,a)})}return n}function Bt(n,t,e){var r=-1,u=n?n.length:0,o=Zt(typeof u==\"number\"?u:0);if(t=v.createCallback(t,e,3),qe(n))for(;++r<u;)o[r]=t(n[r],r,n);else Xe(n,function(n,e,u){o[++r]=t(n,e,u)\n});return o}function Pt(n,t,e){var u=-1/0,o=u;if(typeof t!=\"function\"&&e&&e[t]===n&&(t=null),null==t&&qe(n)){e=-1;for(var a=n.length;++e<a;){var i=n[e];i>o&&(o=i)}}else t=null==t&&kt(n)?r:v.createCallback(t,e,3),Xe(n,function(n,e,r){e=t(n,e,r),e>u&&(u=e,o=n)});return o}function Rt(n,t,e,r){var u=3>arguments.length;if(t=v.createCallback(t,r,4),qe(n)){var o=-1,a=n.length;for(u&&(e=n[++o]);++o<a;)e=t(e,n[o],o,n)}else Xe(n,function(n,r,o){e=u?(u=false,n):t(e,n,r,o)});return e}function Ft(n,t,e,r){var u=3>arguments.length;\nreturn t=v.createCallback(t,r,4),Nt(n,function(n,r,o){e=u?(u=false,n):t(e,n,r,o)}),e}function Tt(n){var t=-1,e=n?n.length:0,r=Zt(typeof e==\"number\"?e:0);return Dt(n,function(n){var e=lt(0,++t);r[t]=r[e],r[e]=n}),r}function $t(n,t,e){var r;if(t=v.createCallback(t,e,3),qe(n)){e=-1;for(var u=n.length;++e<u&&!(r=t(n[e],e,n)););}else Xe(n,function(n,e,u){return!(r=t(n,e,u))});return!!r}function Lt(n,t,e){var r=0,u=n?n.length:0;if(typeof t!=\"number\"&&null!=t){var o=-1;for(t=v.createCallback(t,e,3);++o<u&&t(n[o],o,n);)r++\n}else if(r=t,null==r||e)return n?n[0]:h;return s(n,0,Pe(Be(0,r),u))}function zt(t,e,r){if(typeof r==\"number\"){var u=t?t.length:0;r=0>r?Be(0,u+r):r||0}else if(r)return r=Kt(t,e),t[r]===e?r:-1;return n(t,e,r)}function qt(n,t,e){if(typeof t!=\"number\"&&null!=t){var r=0,u=-1,o=n?n.length:0;for(t=v.createCallback(t,e,3);++u<o&&t(n[u],u,n);)r++}else r=null==t||e?1:Be(0,t);return s(n,r)}function Kt(n,t,e,r){var u=0,o=n?n.length:u;for(e=e?v.createCallback(e,r,1):Ht,t=e(t);u<o;)r=u+o>>>1,e(n[r])<t?u=r+1:o=r;\nreturn u}function Wt(n,t,e,r){return typeof t!=\"boolean\"&&null!=t&&(r=e,e=typeof t!=\"function\"&&r&&r[t]===n?null:t,t=false),null!=e&&(e=v.createCallback(e,r,3)),ft(n,t,e)}function Gt(){for(var n=1<arguments.length?arguments:arguments[0],t=-1,e=n?Pt(ar(n,\"length\")):0,r=Zt(0>e?0:e);++t<e;)r[t]=ar(n,t);return r}function Jt(n,t){var e=-1,r=n?n.length:0,u={};for(t||!r||qe(n[0])||(t=[]);++e<r;){var o=n[e];t?u[o]=t[e]:o&&(u[o[0]]=o[1])}return u}function Mt(n,t){return 2<arguments.length?pt(n,17,s(arguments,2),null,t):pt(n,1,null,null,t)\n}function Vt(n,t,e){var r,u,o,a,i,l,f,c=0,p=false,s=true;if(!jt(n))throw new le;if(t=Be(0,t)||0,true===e)var g=true,s=false;else xt(e)&&(g=e.leading,p=\"maxWait\"in e&&(Be(t,e.maxWait)||0),s=\"trailing\"in e?e.trailing:s);var v=function(){var e=t-(ir()-a);0<e?l=Ce(v,e):(u&&me(u),e=f,u=l=f=h,e&&(c=ir(),o=n.apply(i,r),l||u||(r=i=null)))},y=function(){l&&me(l),u=l=f=h,(s||p!==t)&&(c=ir(),o=n.apply(i,r),l||u||(r=i=null))};return function(){if(r=arguments,a=ir(),i=this,f=s&&(l||!g),false===p)var e=g&&!l;else{u||g||(c=a);\nvar h=p-(a-c),m=0>=h;m?(u&&(u=me(u)),c=a,o=n.apply(i,r)):u||(u=Ce(y,h))}return m&&l?l=me(l):l||t===p||(l=Ce(v,t)),e&&(m=true,o=n.apply(i,r)),!m||l||u||(r=i=null),o}}function Ht(n){return n}function Ut(n,t,e){var r=true,u=t&&_t(t);t&&(e||u.length)||(null==e&&(e=t),o=y,t=n,n=v,u=_t(t)),false===e?r=false:xt(e)&&\"chain\"in e&&(r=e.chain);var o=n,a=jt(o);Dt(u,function(e){var u=n[e]=t[e];a&&(o.prototype[e]=function(){var t=this.__chain__,e=this.__wrapped__,a=[e];if(je.apply(a,arguments),a=u.apply(n,a),r||t){if(e===a&&xt(a))return this;\na=new o(a),a.__chain__=t}return a})})}function Qt(){}function Xt(n){return function(t){return t[n]}}function Yt(){return this.__wrapped__}e=e?ut.defaults(Z.Object(),e,ut.pick(Z,R)):Z;var Zt=e.Array,ne=e.Boolean,te=e.Date,ee=e.Function,re=e.Math,ue=e.Number,oe=e.Object,ae=e.RegExp,ie=e.String,le=e.TypeError,fe=[],ce=e.Error.prototype,pe=oe.prototype,se=ie.prototype,ge=e._,he=pe.toString,ve=ae(\"^\"+ie(he).replace(/[.*+?^${}()|[\\]\\\\]/g,\"\\\\$&\").replace(/toString| for [^\\]]+/g,\".*?\")+\"$\"),ye=re.ceil,me=e.clearTimeout,de=re.floor,be=ee.prototype.toString,_e=vt(_e=oe.getPrototypeOf)&&_e,we=pe.hasOwnProperty,je=fe.push,xe=pe.propertyIsEnumerable,Ce=e.setTimeout,ke=fe.splice,Ee=fe.unshift,Oe=function(){try{var n={},t=vt(t=oe.defineProperty)&&t,e=t(n,n,n)&&t\n}catch(r){}return e}(),Se=vt(Se=oe.create)&&Se,Ae=vt(Ae=Zt.isArray)&&Ae,Ie=e.isFinite,De=e.isNaN,Ne=vt(Ne=oe.keys)&&Ne,Be=re.max,Pe=re.min,Re=e.parseInt,Fe=re.random,Te={};Te[$]=Zt,Te[L]=ne,Te[z]=te,Te[K]=ee,Te[G]=oe,Te[W]=ue,Te[J]=ae,Te[M]=ie;var $e={};$e[$]=$e[z]=$e[W]={constructor:true,toLocaleString:true,toString:true,valueOf:true},$e[L]=$e[M]={constructor:true,toString:true,valueOf:true},$e[q]=$e[K]=$e[J]={constructor:true,toString:true},$e[G]={constructor:true},function(){for(var n=F.length;n--;){var t,e=F[n];\nfor(t in $e)we.call($e,t)&&!we.call($e[t],e)&&($e[t][e]=false)}}(),y.prototype=v.prototype;var Le=v.support={};!function(){var n=function(){this.x=1},t={0:1,length:1},r=[];n.prototype={valueOf:1,y:1};for(var u in new n)r.push(u);for(u in arguments);Le.argsClass=he.call(arguments)==T,Le.argsObject=arguments.constructor==oe&&!(arguments instanceof Zt),Le.enumErrorProps=xe.call(ce,\"message\")||xe.call(ce,\"name\"),Le.enumPrototypes=xe.call(n,\"prototype\"),Le.funcDecomp=!vt(e.WinRTError)&&B.test(g),Le.funcNames=typeof ee.name==\"string\",Le.nonEnumArgs=0!=u,Le.nonEnumShadows=!/valueOf/.test(r),Le.ownLast=\"x\"!=r[0],Le.spliceObjects=(fe.splice.call(t,0,1),!t[0]),Le.unindexedChars=\"xx\"!=\"x\"[0]+oe(\"x\")[0];\ntry{Le.nodeClass=!(he.call(document)==G&&!({toString:0}+\"\"))}catch(o){Le.nodeClass=true}}(1),v.templateSettings={escape:/<%-([\\s\\S]+?)%>/g,evaluate:/<%([\\s\\S]+?)%>/g,interpolate:I,variable:\"\",imports:{_:v}},Se||(nt=function(){function n(){}return function(t){if(xt(t)){n.prototype=t;var r=new n;n.prototype=null}return r||e.Object()}}());var ze=Oe?function(n,t){U.value=t,Oe(n,\"__bindData__\",U)}:Qt;Le.argsClass||(dt=function(n){return n&&typeof n==\"object\"&&typeof n.length==\"number\"&&we.call(n,\"callee\")&&!xe.call(n,\"callee\")||false\n});var qe=Ae||function(n){return n&&typeof n==\"object\"&&typeof n.length==\"number\"&&he.call(n)==$||false},Ke=st({a:\"z\",e:\"[]\",i:\"if(!(B[typeof z]))return E\",g:\"E.push(n)\"}),We=Ne?function(n){return xt(n)?Le.enumPrototypes&&typeof n==\"function\"||Le.nonEnumArgs&&n.length&&dt(n)?Ke(n):Ne(n):[]}:Ke,Ge={a:\"g,e,K\",i:\"e=e&&typeof K=='undefined'?e:d(e,K,3)\",b:\"typeof u=='number'\",v:We,g:\"if(e(t[n],n,g)===false)return E\"},Je={a:\"z,H,l\",i:\"var a=arguments,b=0,c=typeof l=='number'?2:a.length;while(++b<c){t=a[b];if(t&&B[typeof t]){\",v:We,g:\"if(typeof E[n]=='undefined')E[n]=t[n]\",c:\"}}\"},Me={i:\"if(!B[typeof t])return E;\"+Ge.i,b:false},Ve={\"&\":\"&amp;\",\"<\":\"&lt;\",\">\":\"&gt;\",'\"':\"&quot;\",\"'\":\"&#39;\"},He=wt(Ve),Ue=ae(\"(\"+We(He).join(\"|\")+\")\",\"g\"),Qe=ae(\"[\"+We(Ve).join(\"\")+\"]\",\"g\"),Xe=st(Ge),Ye=st(Je,{i:Je.i.replace(\";\",\";if(c>3&&typeof a[c-2]=='function'){var e=d(a[--c-1],a[c--],2)}else if(c>2&&typeof a[c-1]=='function'){e=a[--c]}\"),g:\"E[n]=e?e(E[n],t[n]):t[n]\"}),Ze=st(Je),nr=st(Ge,Me,{j:false}),tr=st(Ge,Me);\njt(/x/)&&(jt=function(n){return typeof n==\"function\"&&he.call(n)==K});var er=_e?function(n){if(!n||he.call(n)!=G||!Le.argsClass&&dt(n))return false;var t=n.valueOf,e=vt(t)&&(e=_e(t))&&_e(e);return e?n==e||_e(n)==e:yt(n)}:yt,rr=ct(function(n,t,e){we.call(n,e)?n[e]++:n[e]=1}),ur=ct(function(n,t,e){(we.call(n,e)?n[e]:n[e]=[]).push(t)}),or=ct(function(n,t,e){n[e]=t}),ar=Bt,ir=vt(ir=te.now)&&ir||function(){return(new te).getTime()},lr=8==Re(j+\"08\")?Re:function(n,t){return Re(kt(n)?n.replace(D,\"\"):n,t||0)};\nreturn v.after=function(n,t){if(!jt(t))throw new le;return function(){return 1>--n?t.apply(this,arguments):void 0}},v.assign=Ye,v.at=function(n){var t=arguments,e=-1,r=ot(t,true,false,1),t=t[2]&&t[2][t[1]]===n?1:r.length,u=Zt(t);for(Le.unindexedChars&&kt(n)&&(n=n.split(\"\"));++e<t;)u[e]=n[r[e]];return u},v.bind=Mt,v.bindAll=function(n){for(var t=1<arguments.length?ot(arguments,true,false,1):_t(n),e=-1,r=t.length;++e<r;){var u=t[e];n[u]=pt(n[u],1,null,null,n)}return n},v.bindKey=function(n,t){return 2<arguments.length?pt(t,19,s(arguments,2),null,n):pt(t,3,null,null,n)\n},v.chain=function(n){return n=new y(n),n.__chain__=true,n},v.compact=function(n){for(var t=-1,e=n?n.length:0,r=[];++t<e;){var u=n[t];u&&r.push(u)}return r},v.compose=function(){for(var n=arguments,t=n.length;t--;)if(!jt(n[t]))throw new le;return function(){for(var t=arguments,e=n.length;e--;)t=[n[e].apply(this,t)];return t[0]}},v.constant=function(n){return function(){return n}},v.countBy=rr,v.create=function(n,t){var e=nt(n);return t?Ye(e,t):e},v.createCallback=function(n,t,e){var r=typeof n;if(null==n||\"function\"==r)return tt(n,t,e);\nif(\"object\"!=r)return Xt(n);var u=We(n),o=u[0],a=n[o];return 1!=u.length||a!==a||xt(a)?function(t){for(var e=u.length,r=false;e--&&(r=at(t[u[e]],n[u[e]],null,true)););return r}:function(n){return n=n[o],a===n&&(0!==a||1/a==1/n)}},v.curry=function(n,t){return t=typeof t==\"number\"?t:+t||n.length,pt(n,4,null,null,null,t)},v.debounce=Vt,v.defaults=Ze,v.defer=function(n){if(!jt(n))throw new le;var t=s(arguments,1);return Ce(function(){n.apply(h,t)},1)},v.delay=function(n,t){if(!jt(n))throw new le;var e=s(arguments,2);\nreturn Ce(function(){n.apply(h,e)},t)},v.difference=function(n){return rt(n,ot(arguments,true,true,1))},v.filter=At,v.flatten=function(n,t,e,r){return typeof t!=\"boolean\"&&null!=t&&(r=e,e=typeof t!=\"function\"&&r&&r[t]===n?null:t,t=false),null!=e&&(n=Bt(n,e,r)),ot(n,t)},v.forEach=Dt,v.forEachRight=Nt,v.forIn=nr,v.forInRight=function(n,t,e){var r=[];nr(n,function(n,t){r.push(t,n)});var u=r.length;for(t=tt(t,e,3);u--&&false!==t(r[u--],r[u],n););return n},v.forOwn=tr,v.forOwnRight=bt,v.functions=_t,v.groupBy=ur,v.indexBy=or,v.initial=function(n,t,e){var r=0,u=n?n.length:0;\nif(typeof t!=\"number\"&&null!=t){var o=u;for(t=v.createCallback(t,e,3);o--&&t(n[o],o,n);)r++}else r=null==t||e?1:t||r;return s(n,0,Pe(Be(0,u-r),u))},v.intersection=function(){for(var e=[],r=-1,u=arguments.length,a=i(),l=ht(),f=l===n,s=i();++r<u;){var g=arguments[r];(qe(g)||dt(g))&&(e.push(g),a.push(f&&g.length>=_&&o(r?e[r]:s)))}var f=e[0],h=-1,v=f?f.length:0,y=[];n:for(;++h<v;){var m=a[0],g=f[h];if(0>(m?t(m,g):l(s,g))){for(r=u,(m||s).push(g);--r;)if(m=a[r],0>(m?t(m,g):l(e[r],g)))continue n;y.push(g)\n}}for(;u--;)(m=a[u])&&p(m);return c(a),c(s),y},v.invert=wt,v.invoke=function(n,t){var e=s(arguments,2),r=-1,u=typeof t==\"function\",o=n?n.length:0,a=Zt(typeof o==\"number\"?o:0);return Dt(n,function(n){a[++r]=(u?t:n[t]).apply(n,e)}),a},v.keys=We,v.map=Bt,v.mapValues=function(n,t,e){var r={};return t=v.createCallback(t,e,3),tr(n,function(n,e,u){r[e]=t(n,e,u)}),r},v.max=Pt,v.memoize=function(n,t){if(!jt(n))throw new le;var e=function(){var r=e.cache,u=t?t.apply(this,arguments):b+arguments[0];return we.call(r,u)?r[u]:r[u]=n.apply(this,arguments)\n};return e.cache={},e},v.merge=function(n){var t=arguments,e=2;if(!xt(n))return n;if(\"number\"!=typeof t[2]&&(e=t.length),3<e&&\"function\"==typeof t[e-2])var r=tt(t[--e-1],t[e--],2);else 2<e&&\"function\"==typeof t[e-1]&&(r=t[--e]);for(var t=s(arguments,1,e),u=-1,o=i(),a=i();++u<e;)it(n,t[u],r,o,a);return c(o),c(a),n},v.min=function(n,t,e){var u=1/0,o=u;if(typeof t!=\"function\"&&e&&e[t]===n&&(t=null),null==t&&qe(n)){e=-1;for(var a=n.length;++e<a;){var i=n[e];i<o&&(o=i)}}else t=null==t&&kt(n)?r:v.createCallback(t,e,3),Xe(n,function(n,e,r){e=t(n,e,r),e<u&&(u=e,o=n)\n});return o},v.omit=function(n,t,e){var r={};if(typeof t!=\"function\"){var u=[];nr(n,function(n,t){u.push(t)});for(var u=rt(u,ot(arguments,true,false,1)),o=-1,a=u.length;++o<a;){var i=u[o];r[i]=n[i]}}else t=v.createCallback(t,e,3),nr(n,function(n,e,u){t(n,e,u)||(r[e]=n)});return r},v.once=function(n){var t,e;if(!jt(n))throw new le;return function(){return t?e:(t=true,e=n.apply(this,arguments),n=null,e)}},v.pairs=function(n){for(var t=-1,e=We(n),r=e.length,u=Zt(r);++t<r;){var o=e[t];u[t]=[o,n[o]]}return u\n},v.partial=function(n){return pt(n,16,s(arguments,1))},v.partialRight=function(n){return pt(n,32,null,s(arguments,1))},v.pick=function(n,t,e){var r={};if(typeof t!=\"function\")for(var u=-1,o=ot(arguments,true,false,1),a=xt(n)?o.length:0;++u<a;){var i=o[u];i in n&&(r[i]=n[i])}else t=v.createCallback(t,e,3),nr(n,function(n,e,u){t(n,e,u)&&(r[e]=n)});return r},v.pluck=ar,v.property=Xt,v.pull=function(n){for(var t=arguments,e=0,r=t.length,u=n?n.length:0;++e<r;)for(var o=-1,a=t[e];++o<u;)n[o]===a&&(ke.call(n,o--,1),u--);\nreturn n},v.range=function(n,t,e){n=+n||0,e=typeof e==\"number\"?e:+e||1,null==t&&(t=n,n=0);var r=-1;t=Be(0,ye((t-n)/(e||1)));for(var u=Zt(t);++r<t;)u[r]=n,n+=e;return u},v.reject=function(n,t,e){return t=v.createCallback(t,e,3),At(n,function(n,e,r){return!t(n,e,r)})},v.remove=function(n,t,e){var r=-1,u=n?n.length:0,o=[];for(t=v.createCallback(t,e,3);++r<u;)e=n[r],t(e,r,n)&&(o.push(e),ke.call(n,r--,1),u--);return o},v.rest=qt,v.shuffle=Tt,v.sortBy=function(n,t,e){var r=-1,o=qe(t),a=n?n.length:0,f=Zt(typeof a==\"number\"?a:0);\nfor(o||(t=v.createCallback(t,e,3)),Dt(n,function(n,e,u){var a=f[++r]=l();o?a.m=Bt(t,function(t){return n[t]}):(a.m=i())[0]=t(n,e,u),a.n=r,a.o=n}),a=f.length,f.sort(u);a--;)n=f[a],f[a]=n.o,o||c(n.m),p(n);return f},v.tap=function(n,t){return t(n),n},v.throttle=function(n,t,e){var r=true,u=true;if(!jt(n))throw new le;return false===e?r=false:xt(e)&&(r=\"leading\"in e?e.leading:r,u=\"trailing\"in e?e.trailing:u),H.leading=r,H.maxWait=t,H.trailing=u,Vt(n,t,H)},v.times=function(n,t,e){n=-1<(n=+n)?n:0;var r=-1,u=Zt(n);\nfor(t=tt(t,e,1);++r<n;)u[r]=t(r);return u},v.toArray=function(n){return n&&typeof n.length==\"number\"?Le.unindexedChars&&kt(n)?n.split(\"\"):s(n):Et(n)},v.transform=function(n,t,e,r){var u=qe(n);if(null==e)if(u)e=[];else{var o=n&&n.constructor;e=nt(o&&o.prototype)}return t&&(t=v.createCallback(t,r,4),(u?Xe:tr)(n,function(n,r,u){return t(e,n,r,u)})),e},v.union=function(){return ft(ot(arguments,true,true))},v.uniq=Wt,v.values=Et,v.where=At,v.without=function(n){return rt(n,s(arguments,1))},v.wrap=function(n,t){return pt(t,16,[n])\n},v.xor=function(){for(var n=-1,t=arguments.length;++n<t;){var e=arguments[n];if(qe(e)||dt(e))var r=r?ft(rt(r,e).concat(rt(e,r))):e}return r||[]},v.zip=Gt,v.zipObject=Jt,v.collect=Bt,v.drop=qt,v.each=Dt,v.eachRight=Nt,v.extend=Ye,v.methods=_t,v.object=Jt,v.select=At,v.tail=qt,v.unique=Wt,v.unzip=Gt,Ut(v),v.clone=function(n,t,e,r){return typeof t!=\"boolean\"&&null!=t&&(r=e,e=t,t=false),Y(n,t,typeof e==\"function\"&&tt(e,r,1))},v.cloneDeep=function(n,t,e){return Y(n,true,typeof t==\"function\"&&tt(t,e,1))},v.contains=Ot,v.escape=function(n){return null==n?\"\":ie(n).replace(Qe,gt)\n},v.every=St,v.find=It,v.findIndex=function(n,t,e){var r=-1,u=n?n.length:0;for(t=v.createCallback(t,e,3);++r<u;)if(t(n[r],r,n))return r;return-1},v.findKey=function(n,t,e){var r;return t=v.createCallback(t,e,3),tr(n,function(n,e,u){return t(n,e,u)?(r=e,false):void 0}),r},v.findLast=function(n,t,e){var r;return t=v.createCallback(t,e,3),Nt(n,function(n,e,u){return t(n,e,u)?(r=n,false):void 0}),r},v.findLastIndex=function(n,t,e){var r=n?n.length:0;for(t=v.createCallback(t,e,3);r--;)if(t(n[r],r,n))return r;\nreturn-1},v.findLastKey=function(n,t,e){var r;return t=v.createCallback(t,e,3),bt(n,function(n,e,u){return t(n,e,u)?(r=e,false):void 0}),r},v.has=function(n,t){return n?we.call(n,t):false},v.identity=Ht,v.indexOf=zt,v.isArguments=dt,v.isArray=qe,v.isBoolean=function(n){return true===n||false===n||n&&typeof n==\"object\"&&he.call(n)==L||false},v.isDate=function(n){return n&&typeof n==\"object\"&&he.call(n)==z||false},v.isElement=function(n){return n&&1===n.nodeType||false},v.isEmpty=function(n){var t=true;if(!n)return t;var e=he.call(n),r=n.length;\nreturn e==$||e==M||(Le.argsClass?e==T:dt(n))||e==G&&typeof r==\"number\"&&jt(n.splice)?!r:(tr(n,function(){return t=false}),t)},v.isEqual=function(n,t,e,r){return at(n,t,typeof e==\"function\"&&tt(e,r,2))},v.isFinite=function(n){return Ie(n)&&!De(parseFloat(n))},v.isFunction=jt,v.isNaN=function(n){return Ct(n)&&n!=+n},v.isNull=function(n){return null===n},v.isNumber=Ct,v.isObject=xt,v.isPlainObject=er,v.isRegExp=function(n){return n&&X[typeof n]&&he.call(n)==J||false},v.isString=kt,v.isUndefined=function(n){return typeof n==\"undefined\"\n},v.lastIndexOf=function(n,t,e){var r=n?n.length:0;for(typeof e==\"number\"&&(r=(0>e?Be(0,r+e):Pe(e,r-1))+1);r--;)if(n[r]===t)return r;return-1},v.mixin=Ut,v.noConflict=function(){return e._=ge,this},v.noop=Qt,v.now=ir,v.parseInt=lr,v.random=function(n,t,e){var r=null==n,u=null==t;return null==e&&(typeof n==\"boolean\"&&u?(e=n,n=1):u||typeof t!=\"boolean\"||(e=t,u=true)),r&&u&&(t=1),n=+n||0,u?(t=n,n=0):t=+t||0,e||n%1||t%1?(e=Fe(),Pe(n+e*(t-n+parseFloat(\"1e-\"+((e+\"\").length-1))),t)):lt(n,t)},v.reduce=Rt,v.reduceRight=Ft,v.result=function(n,t){if(n){var e=n[t];\nreturn jt(e)?n[t]():e}},v.runInContext=g,v.size=function(n){var t=n?n.length:0;return typeof t==\"number\"?t:We(n).length},v.some=$t,v.sortedIndex=Kt,v.template=function(n,t,e){var r=v.templateSettings;n=ie(n||\"\"),e=Ze({},e,r);var u,o=Ze({},e.imports,r.imports),r=We(o),o=Et(o),i=0,l=e.interpolate||N,f=\"__p+='\",l=ae((e.escape||N).source+\"|\"+l.source+\"|\"+(l===I?O:N).source+\"|\"+(e.evaluate||N).source+\"|$\",\"g\");n.replace(l,function(t,e,r,o,l,c){return r||(r=o),f+=n.slice(i,c).replace(P,a),e&&(f+=\"'+__e(\"+e+\")+'\"),l&&(u=true,f+=\"';\"+l+\";\\n__p+='\"),r&&(f+=\"'+((__t=(\"+r+\"))==null?'':__t)+'\"),i=c+t.length,t\n}),f+=\"';\",l=e=e.variable,l||(e=\"obj\",f=\"with(\"+e+\"){\"+f+\"}\"),f=(u?f.replace(x,\"\"):f).replace(C,\"$1\").replace(E,\"$1;\"),f=\"function(\"+e+\"){\"+(l?\"\":e+\"||(\"+e+\"={});\")+\"var __t,__p='',__e=_.escape\"+(u?\",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}\":\";\")+f+\"return __p}\";try{var c=ee(r,\"return \"+f).apply(h,o)}catch(p){throw p.source=f,p}return t?c(t):(c.source=f,c)},v.unescape=function(n){return null==n?\"\":ie(n).replace(Ue,mt)},v.uniqueId=function(n){var t=++m;return ie(null==n?\"\":n)+t\n},v.all=St,v.any=$t,v.detect=It,v.findWhere=It,v.foldl=Rt,v.foldr=Ft,v.include=Ot,v.inject=Rt,Ut(function(){var n={};return tr(v,function(t,e){v.prototype[e]||(n[e]=t)}),n}(),false),v.first=Lt,v.last=function(n,t,e){var r=0,u=n?n.length:0;if(typeof t!=\"number\"&&null!=t){var o=u;for(t=v.createCallback(t,e,3);o--&&t(n[o],o,n);)r++}else if(r=t,null==r||e)return n?n[u-1]:h;return s(n,Be(0,u-r))},v.sample=function(n,t,e){return n&&typeof n.length!=\"number\"?n=Et(n):Le.unindexedChars&&kt(n)&&(n=n.split(\"\")),null==t||e?n?n[lt(0,n.length-1)]:h:(n=Tt(n),n.length=Pe(Be(0,t),n.length),n)\n},v.take=Lt,v.head=Lt,tr(v,function(n,t){var e=\"sample\"!==t;v.prototype[t]||(v.prototype[t]=function(t,r){var u=this.__chain__,o=n(this.__wrapped__,t,r);return u||null!=t&&(!r||e&&typeof t==\"function\")?new y(o,u):o})}),v.VERSION=\"2.4.1\",v.prototype.chain=function(){return this.__chain__=true,this},v.prototype.toString=function(){return ie(this.__wrapped__)},v.prototype.value=Yt,v.prototype.valueOf=Yt,Xe([\"join\",\"pop\",\"shift\"],function(n){var t=fe[n];v.prototype[n]=function(){var n=this.__chain__,e=t.apply(this.__wrapped__,arguments);\nreturn n?new y(e,n):e}}),Xe([\"push\",\"reverse\",\"sort\",\"unshift\"],function(n){var t=fe[n];v.prototype[n]=function(){return t.apply(this.__wrapped__,arguments),this}}),Xe([\"concat\",\"slice\",\"splice\"],function(n){var t=fe[n];v.prototype[n]=function(){return new y(t.apply(this.__wrapped__,arguments),this.__chain__)}}),Le.spliceObjects||Xe([\"pop\",\"shift\",\"splice\"],function(n){var t=fe[n],e=\"splice\"==n;v.prototype[n]=function(){var n=this.__chain__,r=this.__wrapped__,u=t.apply(r,arguments);return 0===r.length&&delete r[0],n||e?new y(u,n):u\n}}),v}var h,v=[],y=[],m=0,d={},b=+new Date+\"\",_=75,w=40,j=\" \\t\\x0B\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\",x=/\\b__p\\+='';/g,C=/\\b(__p\\+=)''\\+/g,E=/(__e\\(.*?\\)|\\b__t\\))\\+'';/g,O=/\\$\\{([^\\\\}]*(?:\\\\.[^\\\\}]*)*)\\}/g,S=/\\w*$/,A=/^\\s*function[ \\n\\r\\t]+\\w/,I=/<%=([\\s\\S]+?)%>/g,D=RegExp(\"^[\"+j+\"]*0+(?=.$)\"),N=/($^)/,B=/\\bthis\\b/,P=/['\\n\\r\\t\\u2028\\u2029\\\\]/g,R=\"Array Boolean Date Error Function Math Number Object RegExp String _ attachEvent clearTimeout isFinite isNaN parseInt setTimeout\".split(\" \"),F=\"constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf\".split(\" \"),T=\"[object Arguments]\",$=\"[object Array]\",L=\"[object Boolean]\",z=\"[object Date]\",q=\"[object Error]\",K=\"[object Function]\",W=\"[object Number]\",G=\"[object Object]\",J=\"[object RegExp]\",M=\"[object String]\",V={};\nV[K]=false,V[T]=V[$]=V[L]=V[z]=V[W]=V[G]=V[J]=V[M]=true;var H={leading:false,maxWait:0,trailing:false},U={configurable:false,enumerable:false,value:null,writable:false},Q={a:\"\",b:null,c:\"\",d:\"\",e:\"\",v:null,g:\"\",h:null,support:null,i:\"\",j:false},X={\"boolean\":false,\"function\":true,object:true,number:false,string:false,undefined:false},Y={\"\\\\\":\"\\\\\",\"'\":\"'\",\"\\n\":\"n\",\"\\r\":\"r\",\"\\t\":\"t\",\"\\u2028\":\"u2028\",\"\\u2029\":\"u2029\"},Z=X[typeof window]&&window||this,nt=X[typeof exports]&&exports&&!exports.nodeType&&exports,tt=X[typeof module]&&module&&!module.nodeType&&module,et=tt&&tt.exports===nt&&nt,rt=X[typeof global]&&global;\n!rt||rt.global!==rt&&rt.window!==rt||(Z=rt);var ut=g();typeof define==\"function\"&&typeof define.amd==\"object\"&&define.amd?(Z._=ut, define(function(){return ut})):nt&&tt?et?(tt.exports=ut)._=ut:nt._=ut:Z._=ut}).call(this);"

/***/ },
/* 10 */
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6)(__webpack_require__(12))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "/**\n * postal - Pub/Sub library providing wildcard subscriptions, complex message handling, etc.  Works server and client-side.\n * Author: Jim Cowart (http://ifandelse.com)\n * Version: v0.12.3\n * Url: http://github.com/postaljs/postal.js\n * License(s): MIT\n */\n(function(e,t){\"function\"==typeof define&&define.amd?define([\"lodash\"],function(n){return t(n,e)}):\"object\"==typeof module&&module.exports?module.exports=t(require(\"lodash\"),this):e.postal=t(e._,e)})(this,function(e,t,n){function i(e,t){return function(){if(console.warn||console.log){var n=\"Warning, the \"+e+\" method has been deprecated. Please use \"+t+\" instead.\";console.warn?console.warn(n):console.log(n)}return b.prototype[t].apply(this,arguments)}}function r(){for(;E.length;)l.unsubscribe(E.shift())}function c(e,t,n){return function(i,r,c){i===e&&c.splice(r,1),0===c.length&&delete n[t]}}function s(e,t,n,i,r){var c=r&&r.headers||{};return function(r){p.resolver.compare(r.topic,e,c)&&(t.push(r),r.cacheKeys.push(n),i&&i(r))}}function o(e,t){return{channel:p.SYSTEM_CHANNEL,topic:\"subscription.\"+e,data:{event:\"subscription.\"+e,channel:t.channel,topic:t.topic}}}function a(t,n){return\"function\"==typeof t?t:t?function(i){var r=0,c=0;return e.each(t,function(e,s){r+=1,(\"topic\"===s&&n.compare(i.topic,t.topic,{resolverNoCache:!0})||\"context\"===s&&t.context===i._context||i[s]===t[s])&&(c+=1)}),r===c}:function(){return!0}}var u=t.postal,h={DEFAULT_CHANNEL:\"/\",SYSTEM_CHANNEL:\"postal\",enableSystemMessages:!0,cacheKeyDelimiter:\"|\",autoCompactResolver:!1},l={configuration:e.extend({},h)},p=l.configuration,f=function(e,t){this.bus=t,this.channel=e||p.DEFAULT_CHANNEL};f.prototype.subscribe=function(){return this.bus.subscribe({channel:this.channel,topic:1===arguments.length?arguments[0].topic:arguments[0],callback:1===arguments.length?arguments[0].callback:arguments[1]})},f.prototype.publish=function(){var e=1===arguments.length?\"[object String]\"===Object.prototype.toString.call(arguments[0])?{topic:arguments[0]}:arguments[0]:{topic:arguments[0],data:arguments[1]};e.channel=this.channel,this.bus.publish(e)};var b=function(e,t,i){if(3!==arguments.length)throw new Error(\"You must provide a channel, topic and callback when creating a SubscriptionDefinition instance.\");if(0===t.length)throw new Error(\"Topics cannot be empty\");this.channel=e,this.topic=t,this.callback=i,this.pipeline=[],this.cacheKeys=[],this._context=n},d=function(){var t;return function(n){var i=!1;return e.isString(n)?(i=n===t,t=n):(i=e.isEqual(n,t),t=e.clone(n)),!i}},m=function(){var t=[];return function(n){var i=!e.any(t,function(t){return e.isObject(n)||e.isArray(n)?e.isEqual(n,t):n===t});return i&&t.push(n),i}};b.prototype={\"catch\":function(e){var t=this.callback,n=function(){try{t.apply(this,arguments)}catch(n){e(n,arguments[0])}};return this.callback=n,this},defer:function(){return this.delay(0)},disposeAfter:function(t){if(!e.isNumber(t)||0>=t)throw new Error(\"The value provided to disposeAfter (maxCalls) must be a number greater than zero.\");var n=this,i=e.after(t,e.bind(function(){n.unsubscribe()}));return n.pipeline.push(function(e,t,n){n(e,t),i()}),n},distinct:function(){return this.constraint(new m)},distinctUntilChanged:function(){return this.constraint(new d)},invokeSubscriber:function(e,t){if(!this.inactive){var n=this,i=n.pipeline,r=i.length,c=n._context,s=-1;if(r){i=i.concat([n.callback]);var o=function a(e,t){s+=1,r>s?i[s].call(c,e,t,a):n.callback.call(c,e,t)};o(e,t,0)}else n.callback.call(c,e,t)}},logError:function(){if(console){var e;e=console.warn?console.warn:console.log,this[\"catch\"](e)}return this},once:function(){return this.disposeAfter(1)},subscribe:function(e){return this.callback=e,this},unsubscribe:function(){this.inactive||l.unsubscribe(this)},constraint:function(t){if(!e.isFunction(t))throw new Error(\"Predicate constraint must be a function\");return this.pipeline.push(function(e,n,i){t.call(this,e,n)&&i(e,n)}),this},constraints:function(t){var n=this;return e.isArray(t)&&e.each(t,function(e){n.constraint(e)}),n},context:function(e){return this._context=e,this},debounce:function(t,n){if(!e.isNumber(t))throw new Error(\"Milliseconds must be a number\");return this.pipeline.push(e.debounce(function(e,t,n){n(e,t)},t,!!n)),this},delay:function(t){if(!e.isNumber(t))throw new Error(\"Milliseconds must be a number\");var n=this;return n.pipeline.push(function(e,n,i){setTimeout(function(){i(e,n)},t)}),this},throttle:function(t){if(!e.isNumber(t))throw new Error(\"Milliseconds must be a number\");var n=function(e,t,n){n(e,t)};return this.pipeline.push(e.throttle(n,t)),this}};for(var g=[\"withConstraint\",\"withConstraints\",\"withContext\",\"withDebounce\",\"withDelay\",\"withThrottle\"],v=[\"constraint\",\"constraints\",\"context\",\"debounce\",\"delay\",\"throttle\"],y=0;6>y;y++){var w=g[y];b.prototype[w]=i(w,v[y])}var _=(p.resolver={cache:{},regex:{},enableCache:!0,compare:function(t,n,i){var r,c,s,o=n+p.cacheKeyDelimiter+t,a=this.cache[o],u=i||{},h=this.enableCache&&!u.resolverNoCache;return a===!0?a:-1===t.indexOf(\"#\")&&-1===t.indexOf(\"*\")?(a=n===t,h&&(this.cache[o]=a),a):((c=this.regex[t])||(r=\"^\"+e.map(t.split(\".\"),function(e){var t=\"\";return s&&(t=\"#\"!==s?\"\\\\.\\\\b\":\"\\\\b\"),t+=\"#\"===e?\"[\\\\s\\\\S]*\":\"*\"===e?\"[^.]+\":e,s=e,t}).join(\"\")+\"$\",c=this.regex[t]=new RegExp(r)),a=c.test(n),h&&(this.cache[o]=a),a)},reset:function(){this.cache={},this.regex={}},purge:function(t){var n=this,i=p.cacheKeyDelimiter,r=function(e,r){var c=r.split(i),s=c[0],o=c[1];\"undefined\"!=typeof t.topic&&t.topic!==s||\"undefined\"!=typeof t.binding&&t.binding!==o||delete n.cache[r]},c=function(e,t){var r=t.split(i);0===l.getSubscribersFor({topic:r[0]}).length&&delete n.cache[t]};if(\"undefined\"==typeof t)this.reset();else{var s=t.compact===!0?c:r;e.each(this.cache,s)}}},0),E=[],x=0,C=e.bind(o,this,\"created\"),S=e.bind(o,this,\"removed\");if(e.extend(l,{cache:{},subscriptions:{},wireTaps:[],ChannelDefinition:f,SubscriptionDefinition:b,channel:function(e){return new f(e,this)},addWireTap:function(e){var t=this;return t.wireTaps.push(e),function(){var n=t.wireTaps.indexOf(e);-1!==n&&t.wireTaps.splice(n,1)}},noConflict:function(){if(\"undefined\"==typeof window||\"undefined\"!=typeof window&&\"function\"==typeof define&&define.amd)throw new Error(\"noConflict can only be used in browser clients which aren't using AMD modules\");return t.postal=u,this},getSubscribersFor:function(t){var n=[],i=this;return e.each(i.subscriptions,function(i){e.each(i,function(i){n=n.concat(e.filter(i,a(t,p.resolver)))})}),n},publish:function(t){++_;var n=t.channel=t.channel||p.DEFAULT_CHANNEL,i=t.topic;t.timeStamp=new Date,this.wireTaps.length&&e.each(this.wireTaps,function(e){e(t.data,t,_)});var c=n+p.cacheKeyDelimiter+i,o=this.cache[c];if(o)e.each(o,function(e){e.invokeSubscriber(t.data,t)});else{o=this.cache[c]=[];var a=s(i,o,c,function(e){e.invokeSubscriber(t.data,t)},t);e.each(this.subscriptions[n],function(t){e.each(t,a)})}0===--_&&r()},reset:function(){this.unsubscribeFor(),p.resolver.reset(),this.subscriptions={}},subscribe:function(t){var n,i=this.subscriptions,r=new b(t.channel||p.DEFAULT_CHANNEL,t.topic,t.callback),c=i[r.channel],o=r.channel.length;return c||(c=i[r.channel]={}),n=i[r.channel][r.topic],n||(n=i[r.channel][r.topic]=[]),n.push(r),e.each(this.cache,function(e,t){t.substr(0,o)===r.channel&&s(t.split(p.cacheKeyDelimiter)[1],e,t)(r)}),p.enableSystemMessages&&this.publish(C(r)),r},unsubscribe:function(){for(var t,n,i,r,s=arguments.length,o=0;s>o;o++){if(t=arguments[o],t.inactive=!0,_)return E.push(t),void 0;if(n=this.subscriptions[t.channel],i=n&&n[t.topic]){var a=i.length;for(r=0;a>r;){if(i[r]===t){i.splice(r,1);break}r+=1}if(0===i.length&&(delete n[t.topic],e.isEmpty(n)&&delete this.subscriptions[t.channel]),t.cacheKeys&&t.cacheKeys.length)for(var u;u=t.cacheKeys.pop();)e.each(this.cache[u],c(t,u,this.cache));if(\"function\"==typeof p.resolver.purge){var h=p.autoCompactResolver===!0?0:\"number\"==typeof p.autoCompactResolver?p.autoCompactResolver-1:!1;h>=0&&x===h?(p.resolver.purge({compact:!0}),x=0):h>=0&&h>x&&(x+=1)}}p.enableSystemMessages&&this.publish(S(t))}},unsubscribeFor:function(e){var t=[];this.subscriptions&&(t=this.getSubscribersFor(e),this.unsubscribe.apply(this,t))}}),t&&Object.prototype.hasOwnProperty.call(t,\"__postalReady__\")&&e.isArray(t.__postalReady__))for(;t.__postalReady__.length;)t.__postalReady__.shift().onReady(l);return l});"

/***/ },
/* 13 */
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ExpandingTextarea, TextEditor;

	ExpandingTextarea = __webpack_require__(33);

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
/* 15 */
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ExpandingTextarea, HtmlEditor;

	ExpandingTextarea = __webpack_require__(33);

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
/* 17 */
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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ExpandingTextarea, JavascriptEditor;

	ExpandingTextarea = __webpack_require__(33);

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
/* 19 */
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
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var Channel, ExpandingTextarea, MarkdownEditor;

	Channel = postal.channel("makona");

	ExpandingTextarea = __webpack_require__(33);

	MarkdownEditor = React.createClass({

	  /* Construction */
	  displayName: "MarkdownEditor",
	  propTypes: {
	    block: React.PropTypes.object.isRequired
	  },
	  getInitialState: function() {
	    return {
	      selectionPresent: false,
	      setPos: false,
	      pos: 0
	    };
	  },

	  /* Render */
	  render: function() {
	    return (
	      React.createElement("div", {className: "mk-block-content"}, 
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
	    if ((this.textArea() != null) && this.state.setPos) {
	      this.textArea().setSelectionRange(this.state.pos, this.state.pos);
	      return this.setState({
	        setPos: false
	      });
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
	  publishChange: function(text) {
	    var newBlock;
	    newBlock = _.cloneDeep(this.props.block);
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
	    this.publishChange(text);
	    cursorPos = before.length + chars.length;
	    return this.setState({
	      pos: cursorPos,
	      setPos: true
	    });
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
	    this.publishChange(text);
	    return this.setState({
	      pos: cursorPos,
	      setPos: true
	    });
	  },
	  wrapSelectedWith: function(chars, e) {
	    var after, before, cursorPos, ref, selected, text;
	    e.preventDefault();
	    ref = this.textArea().getChunks(), before = ref.before, selected = ref.selected, after = ref.after;
	    if (selected.length > 0 && selected.slice(0, +(chars.length - 1) + 1 || 9e9) !== chars) {
	      text = before + chars + selected + chars + after;
	      this.publishChange(text);
	      cursorPos = before.length + chars.length + selected.length + chars.length;
	      return this.setState({
	        pos: cursorPos,
	        setPos: true
	      });
	    }
	  },
	  textArea: function() {
	    if (this.refs['eta'] != null) {
	      return this.refs['eta'];
	    } else {
	      return false;
	    }
	  }
	});

	module.exports = MarkdownEditor;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var MarkdownPreviewer, marked;

	marked = __webpack_require__(38);

	marked.setOptions({
	  gfm: true,
	  tables: true,
	  breaks: true,
	  pedantic: false,
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
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ExpandingTextarea, QuoteEditor;

	ExpandingTextarea = __webpack_require__(33);

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
/* 23 */
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
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var Channel, CodeEditor, ExpandingTextarea;

	Channel = postal.channel("makona");

	ExpandingTextarea = __webpack_require__(33);

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
	        React.createElement(ExpandingTextarea, React.__spread({},  this.props, {ref: "text"})), 
	        React.createElement("br", null), 
	        React.createElement("label", null, "Language: "), React.createElement("input", {value: this.props.block.data.lang, ref: "lang", onChange: this.handleLangChange})
	      )
	    );
	  },

	  /* Life Cycle */

	  /* Custom Methods */
	  handleLangChange: function(e) {
	    this.refs.text.props.lang = this.refs.lang.props.value;
	    return Channel.publish("block.change", {
	      block: this.props.block
	    });
	  },
	  handleChange: function() {
	    var lang;
	    lang = this.refs.lang.getDOMNode().value;
	    return this.props.handleChange({
	      id: this.props.block.id,
	      data: {
	        lang: lang
	      }
	    });
	  }
	});

	module.exports = CodeEditor;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var Channel, CodePreviewer;

	Channel = postal.channel("makona");

	__webpack_require__(34);

	CodePreviewer = React.createClass({

	  /* Construction */
	  displayName: "CodePreviewer",

	  /* Render */
	  render: function() {
	    var html;
	    html = prettyPrintOne(this.props.block.data.text, this.props.block.data.lang);
	    return (
	      React.createElement("div", {className: "mk-block-content"}, 
	        React.createElement("div", {className: "mk-block-label"}, this.props.block.data.lang), 
	        React.createElement("pre", null, React.createElement("code", {dangerouslySetInnerHTML: {__html: html}}))
	      )
	    );
	  }

	  /* Life Cycle */

	  /* Custom Methods */
	});

	module.exports = CodePreviewer;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var ImageEditor, ImagePreviewer, qqTemplate;

	__webpack_require__(36);

	ImagePreviewer = __webpack_require__(27);

	qqTemplate = "<script type=\"text/template\" id=\"qq-template-image\">\n    <div class=\"qq-uploader-selector qq-uploader\">\n        <div class=\"qq-upload-drop-area-selector qq-upload-drop-area\" qq-hide-dropzone>\n            <span>Drop files here to upload</span>\n        </div>\n        <div class=\"qq-upload-button-selector qq-upload-button\">\n            <div>or choose file</div>\n        </div>\n        <span class=\"qq-drop-processing-selector qq-drop-processing\">\n            <span>Processing dropped files...</span>\n            <span class=\"qq-drop-processing-spinner-selector qq-drop-processing-spinner\"></span>\n        </span>\n        <ul class=\"qq-upload-list-selector qq-upload-list\">\n            <li>\n                <div class=\"qq-progress-bar-container-selector\">\n                    <div class=\"qq-progress-bar-selector qq-progress-bar\"></div>\n                </div>\n                <span class=\"qq-upload-spinner-selector qq-upload-spinner\"></span>\n                <img class=\"qq-thumbnail-selector\" qq-max-size=\"100\" qq-server-scale>\n                <span class=\"qq-edit-filename-icon-selector qq-edit-filename-icon\"></span>\n                <span class=\"qq-upload-file-selector qq-upload-file\"></span>\n                <input class=\"qq-edit-filename-selector qq-edit-filename\" tabindex=\"0\" type=\"text\">\n                <span class=\"qq-upload-size-selector qq-upload-size\"></span>\n                <a class=\"qq-upload-cancel-selector qq-upload-cancel\" href=\"#\">Cancel</a>\n                <a class=\"qq-upload-retry-selector qq-upload-retry\" href=\"#\">Retry</a>\n                <a class=\"qq-upload-delete-selector qq-upload-delete\" href=\"#\">Delete</a>\n                <span class=\"qq-upload-status-text-selector qq-upload-status-text\"></span>\n            </li>\n        </ul>\n    </div>\n</script>";

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
	  componentDidMount: function() {
	    var defaults, node, opts, ref;
	    if ($("#qq-template-image").length === 0) {
	      $("body").append(qqTemplate);
	    }
	    if (((ref = this.refs) != null ? ref.fineuploader : void 0) != null) {
	      node = this.refs.fineuploader.getDOMNode();
	      defaults = {
	        template: "qq-template-image",
	        element: node,
	        debug: false,
	        request: {
	          inputName: 'asset',
	          endpoint: 'http://bsg.mil/upload_image',
	          params: {}
	        },
	        validation: {
	          acceptFiles: ["image/jpeg", "image/png", "image/gif"],
	          allowedExtensions: ["gif", "jpg", "jpeg", "png"],
	          sizeLimit: 5000000
	        },
	        deleteFile: {
	          enabled: false,
	          method: "DELETE",
	          endpoint: "http://bsg.mil/delete_uploaded_image",
	          params: {}
	        },
	        retry: {
	          enableAuto: true
	        },
	        resume: {
	          enabled: false
	        },
	        callbacks: {
	          onComplete: (function(_this) {
	            return function(id, name, response) {
	              if (response.success) {
	                return _this.props.handleChange({
	                  id: _this.props.block.id,
	                  data: {
	                    src: response.url,
	                    id: response.id
	                  }
	                }, true);
	              }
	            };
	          })(this)
	        }
	      };
	      opts = $.extend({}, defaults, this.props.opts.ImageEditor);
	      return this.uploader = new qq.FineUploader(opts);
	    }
	  },
	  shouldComponentUpdate: function() {
	    return false;
	  },
	  componentWillUnmount: function() {
	    var container, results;
	    this.uploader = null;
	    container = this.getDOMNode();
	    results = [];
	    while (container.lastChild) {
	      results.push(container.removeChild(container.lastChild));
	    }
	    return results;
	  }

	  /* Custom Methods */
	});

	module.exports = ImageEditor;


/***/ },
/* 27 */
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
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	
	/** @jsx React.DOM */

	/* Includes and Constants */
	var DocumentEditor, DocumentPreviewer, qqTemplate;

	__webpack_require__(36);

	DocumentPreviewer = __webpack_require__(29);

	qqTemplate = "<script type=\"text/template\" id=\"qq-template-document\">\n    <div class=\"qq-uploader-selector qq-uploader\">\n        <div class=\"qq-upload-drop-area-selector qq-upload-drop-area\" qq-hide-dropzone>\n            <span>Drop files here to upload</span>\n        </div>\n        <div class=\"qq-upload-button-selector qq-upload-button\">\n            <div>or choose file</div>\n        </div>\n        <span class=\"qq-drop-processing-selector qq-drop-processing\">\n            <span>Processing dropped files...</span>\n            <span class=\"qq-drop-processing-spinner-selector qq-drop-processing-spinner\"></span>\n        </span>\n        <ul class=\"qq-upload-list-selector qq-upload-list\">\n            <li>\n                <div class=\"qq-progress-bar-container-selector\">\n                    <div class=\"qq-progress-bar-selector qq-progress-bar\"></div>\n                </div>\n                <span class=\"qq-upload-spinner-selector qq-upload-spinner\"></span>\n                <img class=\"qq-thumbnail-selector\" qq-max-size=\"100\" qq-server-scale>\n                <span class=\"qq-edit-filename-icon-selector qq-edit-filename-icon\"></span>\n                <span class=\"qq-upload-file-selector qq-upload-file\"></span>\n                <input class=\"qq-edit-filename-selector qq-edit-filename\" tabindex=\"0\" type=\"text\">\n                <span class=\"qq-upload-size-selector qq-upload-size\"></span>\n                <a class=\"qq-upload-cancel-selector qq-upload-cancel\" href=\"#\">Cancel</a>\n                <a class=\"qq-upload-retry-selector qq-upload-retry\" href=\"#\">Retry</a>\n                <a class=\"qq-upload-delete-selector qq-upload-delete\" href=\"#\">Delete</a>\n                <span class=\"qq-upload-status-text-selector qq-upload-status-text\"></span>\n            </li>\n        </ul>\n    </div>\n</script>";

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
	  componentDidMount: function() {
	    var defaults, node, opts, ref;
	    if ($("#qq-template-document").length === 0) {
	      $("body").append(qqTemplate);
	    }
	    if (((ref = this.refs) != null ? ref.fineuploader : void 0) != null) {
	      node = this.refs.fineuploader.getDOMNode();
	      defaults = {
	        element: node,
	        template: "qq-template-document",
	        debug: false,
	        request: {
	          inputName: 'asset',
	          endpoint: 'http://bsg.mil/upload_document',
	          params: {}
	        },
	        validation: {
	          acceptFiles: [],
	          allowedExtensions: [],
	          sizeLimit: 5000000
	        },
	        deleteFile: {
	          enabled: false,
	          method: "DELETE",
	          endpoint: "http://bsg.mil/delete_uploaded_document",
	          params: {}
	        },
	        retry: {
	          enableAuto: true
	        },
	        resume: {
	          enabled: false
	        },
	        callbacks: {
	          onComplete: (function(_this) {
	            return function(id, name, response) {
	              if (response.success) {
	                return _this.props.handleChange({
	                  id: _this.props.block.id,
	                  data: {
	                    src: response.url,
	                    id: response.id,
	                    icon_url: response.icon_url,
	                    title: response.title
	                  }
	                }, true);
	              }
	            };
	          })(this)
	        }
	      };
	      opts = $.extend({}, defaults, this.props.opts.DocumentEditor);
	      return this.uploader = new qq.FineUploader(opts);
	    }
	  },
	  shouldComponentUpdate: function() {
	    return false;
	  },
	  componentWillUnmount: function() {
	    var container, results;
	    this.uploader = null;
	    container = this.getDOMNode();
	    results = [];
	    while (container.lastChild) {
	      results.push(container.removeChild(container.lastChild));
	    }
	    return results;
	  }

	  /* Custom Methods */
	});

	module.exports = DocumentEditor;


/***/ },
/* 29 */
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
/* 30 */
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
/* 31 */
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
/* 32 */
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
/* 33 */
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
	        var newBlock;
	        newBlock = _.cloneDeep(this.props.block);
	        if (this.props.block.data.default_text.length && this.props.block.data.text.length) {
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
	    if (this.props.block.data.default_text.length && !this.props.block.data.text.length) {
	      return this.refs.text.getDOMNode().setSelectionRange(0, this.props.block.data.default_text.length);
	    }
	  },

	  /* Custom Methods */
	  content: function() {
	    if (this.props.block.data.default_text.length && !this.props.block.data.text.length) {
	      return this.props.block.data.default_text;
	    } else {
	      return this.props.block.data.text;
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
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6)(__webpack_require__(35))

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "// Copyright (C) 2006 Google Inc.\n//\n// Licensed under the Apache License, Version 2.0 (the \"License\");\n// you may not use this file except in compliance with the License.\n// You may obtain a copy of the License at\n//\n//      http://www.apache.org/licenses/LICENSE-2.0\n//\n// Unless required by applicable law or agreed to in writing, software\n// distributed under the License is distributed on an \"AS IS\" BASIS,\n// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n// See the License for the specific language governing permissions and\n// limitations under the License.\n\n\n/**\n * @fileoverview\n * some functions for browser-side pretty printing of code contained in html.\n *\n * <p>\n * For a fairly comprehensive set of languages see the\n * <a href=\"http://google-code-prettify.googlecode.com/svn/trunk/README.html#langs\">README</a>\n * file that came with this source.  At a minimum, the lexer should work on a\n * number of languages including C and friends, Java, Python, Bash, SQL, HTML,\n * XML, CSS, Javascript, and Makefiles.  It works passably on Ruby, PHP and Awk\n * and a subset of Perl, but, because of commenting conventions, doesn't work on\n * Smalltalk, Lisp-like, or CAML-like languages without an explicit lang class.\n * <p>\n * Usage: <ol>\n * <li> include this source file in an html page via\n *   {@code <script type=\"text/javascript\" src=\"/path/to/prettify.js\"></script>}\n * <li> define style rules.  See the example page for examples.\n * <li> mark the {@code <pre>} and {@code <code>} tags in your source with\n *    {@code class=prettyprint.}\n *    You can also use the (html deprecated) {@code <xmp>} tag, but the pretty\n *    printer needs to do more substantial DOM manipulations to support that, so\n *    some css styles may not be preserved.\n * </ol>\n * That's it.  I wanted to keep the API as simple as possible, so there's no\n * need to specify which language the code is in, but if you wish, you can add\n * another class to the {@code <pre>} or {@code <code>} element to specify the\n * language, as in {@code <pre class=\"prettyprint lang-java\">}.  Any class that\n * starts with \"lang-\" followed by a file extension, specifies the file type.\n * See the \"lang-*.js\" files in this directory for code that implements\n * per-language file handlers.\n * <p>\n * Change log:<br>\n * cbeust, 2006/08/22\n * <blockquote>\n *   Java annotations (start with \"@\") are now captured as literals (\"lit\")\n * </blockquote>\n * @requires console\n */\n\n// JSLint declarations\n/*global console, document, navigator, setTimeout, window, define */\n\n/**\n * Split {@code prettyPrint} into multiple timeouts so as not to interfere with\n * UI events.\n * If set to {@code false}, {@code prettyPrint()} is synchronous.\n */\nwindow['PR_SHOULD_USE_CONTINUATION'] = true;\n\n/**\n * Find all the {@code <pre>} and {@code <code>} tags in the DOM with\n * {@code class=prettyprint} and prettify them.\n *\n * @param {Function?} opt_whenDone if specified, called when the last entry\n *     has been finished.\n */\nvar prettyPrintOne;\n/**\n * Pretty print a chunk of code.\n *\n * @param {string} sourceCodeHtml code as html\n * @return {string} code as html, but prettier\n */\nvar prettyPrint;\n\n\n(function () {\n  var win = window;\n  // Keyword lists for various languages.\n  // We use things that coerce to strings to make them compact when minified\n  // and to defeat aggressive optimizers that fold large string constants.\n  var FLOW_CONTROL_KEYWORDS = [\"break,continue,do,else,for,if,return,while\"];\n  var C_KEYWORDS = [FLOW_CONTROL_KEYWORDS,\"auto,case,char,const,default,\" + \n      \"double,enum,extern,float,goto,int,long,register,short,signed,sizeof,\" +\n      \"static,struct,switch,typedef,union,unsigned,void,volatile\"];\n  var COMMON_KEYWORDS = [C_KEYWORDS,\"catch,class,delete,false,import,\" +\n      \"new,operator,private,protected,public,this,throw,true,try,typeof\"];\n  var CPP_KEYWORDS = [COMMON_KEYWORDS,\"alignof,align_union,asm,axiom,bool,\" +\n      \"concept,concept_map,const_cast,constexpr,decltype,\" +\n      \"dynamic_cast,explicit,export,friend,inline,late_check,\" +\n      \"mutable,namespace,nullptr,reinterpret_cast,static_assert,static_cast,\" +\n      \"template,typeid,typename,using,virtual,where\"];\n  var JAVA_KEYWORDS = [COMMON_KEYWORDS,\n      \"abstract,boolean,byte,extends,final,finally,implements,import,\" +\n      \"instanceof,null,native,package,strictfp,super,synchronized,throws,\" +\n      \"transient\"];\n  var CSHARP_KEYWORDS = [JAVA_KEYWORDS,\n      \"as,base,by,checked,decimal,delegate,descending,dynamic,event,\" +\n      \"fixed,foreach,from,group,implicit,in,interface,internal,into,is,let,\" +\n      \"lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,\" +\n      \"sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,\" +\n      \"var,virtual,where\"];\n  var COFFEE_KEYWORDS = \"all,and,by,catch,class,else,extends,false,finally,\" +\n      \"for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,\" +\n      \"throw,true,try,unless,until,when,while,yes\";\n  var JSCRIPT_KEYWORDS = [COMMON_KEYWORDS,\n      \"debugger,eval,export,function,get,null,set,undefined,var,with,\" +\n      \"Infinity,NaN\"];\n  var PERL_KEYWORDS = \"caller,delete,die,do,dump,elsif,eval,exit,foreach,for,\" +\n      \"goto,if,import,last,local,my,next,no,our,print,package,redo,require,\" +\n      \"sub,undef,unless,until,use,wantarray,while,BEGIN,END\";\n  var PYTHON_KEYWORDS = [FLOW_CONTROL_KEYWORDS, \"and,as,assert,class,def,del,\" +\n      \"elif,except,exec,finally,from,global,import,in,is,lambda,\" +\n      \"nonlocal,not,or,pass,print,raise,try,with,yield,\" +\n      \"False,True,None\"];\n  var RUBY_KEYWORDS = [FLOW_CONTROL_KEYWORDS, \"alias,and,begin,case,class,\" +\n      \"def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,\" +\n      \"rescue,retry,self,super,then,true,undef,unless,until,when,yield,\" +\n      \"BEGIN,END\"];\n  var SH_KEYWORDS = [FLOW_CONTROL_KEYWORDS, \"case,done,elif,esac,eval,fi,\" +\n      \"function,in,local,set,then,until\"];\n  var ALL_KEYWORDS = [\n      CPP_KEYWORDS, CSHARP_KEYWORDS, JSCRIPT_KEYWORDS, PERL_KEYWORDS +\n      PYTHON_KEYWORDS, RUBY_KEYWORDS, SH_KEYWORDS];\n  var C_TYPES = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\\d*)\\b/;\n\n  // token style names.  correspond to css classes\n  /**\n   * token style for a string literal\n   * @const\n   */\n  var PR_STRING = 'str';\n  /**\n   * token style for a keyword\n   * @const\n   */\n  var PR_KEYWORD = 'kwd';\n  /**\n   * token style for a comment\n   * @const\n   */\n  var PR_COMMENT = 'com';\n  /**\n   * token style for a type\n   * @const\n   */\n  var PR_TYPE = 'typ';\n  /**\n   * token style for a literal value.  e.g. 1, null, true.\n   * @const\n   */\n  var PR_LITERAL = 'lit';\n  /**\n   * token style for a punctuation string.\n   * @const\n   */\n  var PR_PUNCTUATION = 'pun';\n  /**\n   * token style for plain text.\n   * @const\n   */\n  var PR_PLAIN = 'pln';\n\n  /**\n   * token style for an sgml tag.\n   * @const\n   */\n  var PR_TAG = 'tag';\n  /**\n   * token style for a markup declaration such as a DOCTYPE.\n   * @const\n   */\n  var PR_DECLARATION = 'dec';\n  /**\n   * token style for embedded source.\n   * @const\n   */\n  var PR_SOURCE = 'src';\n  /**\n   * token style for an sgml attribute name.\n   * @const\n   */\n  var PR_ATTRIB_NAME = 'atn';\n  /**\n   * token style for an sgml attribute value.\n   * @const\n   */\n  var PR_ATTRIB_VALUE = 'atv';\n\n  /**\n   * A class that indicates a section of markup that is not code, e.g. to allow\n   * embedding of line numbers within code listings.\n   * @const\n   */\n  var PR_NOCODE = 'nocode';\n\n\n\n/**\n * A set of tokens that can precede a regular expression literal in\n * javascript\n * http://web.archive.org/web/20070717142515/http://www.mozilla.org/js/language/js20/rationale/syntax.html\n * has the full list, but I've removed ones that might be problematic when\n * seen in languages that don't support regular expression literals.\n *\n * <p>Specifically, I've removed any keywords that can't precede a regexp\n * literal in a syntactically legal javascript program, and I've removed the\n * \"in\" keyword since it's not a keyword in many languages, and might be used\n * as a count of inches.\n *\n * <p>The link above does not accurately describe EcmaScript rules since\n * it fails to distinguish between (a=++/b/i) and (a++/b/i) but it works\n * very well in practice.\n *\n * @private\n * @const\n */\nvar REGEXP_PRECEDER_PATTERN = '(?:^^\\\\.?|[+-]|[!=]=?=?|\\\\#|%=?|&&?=?|\\\\(|\\\\*=?|[+\\\\-]=|->|\\\\/=?|::?|<<?=?|>>?>?=?|,|;|\\\\?|@|\\\\[|~|{|\\\\^\\\\^?=?|\\\\|\\\\|?=?|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\\\s*';\n\n// CAVEAT: this does not properly handle the case where a regular\n// expression immediately follows another since a regular expression may\n// have flags for case-sensitivity and the like.  Having regexp tokens\n// adjacent is not valid in any language I'm aware of, so I'm punting.\n// TODO: maybe style special characters inside a regexp as punctuation.\n\n\n  /**\n   * Given a group of {@link RegExp}s, returns a {@code RegExp} that globally\n   * matches the union of the sets of strings matched by the input RegExp.\n   * Since it matches globally, if the input strings have a start-of-input\n   * anchor (/^.../), it is ignored for the purposes of unioning.\n   * @param {Array.<RegExp>} regexs non multiline, non-global regexs.\n   * @return {RegExp} a global regex.\n   */\n  function combinePrefixPatterns(regexs) {\n    var capturedGroupIndex = 0;\n  \n    var needToFoldCase = false;\n    var ignoreCase = false;\n    for (var i = 0, n = regexs.length; i < n; ++i) {\n      var regex = regexs[i];\n      if (regex.ignoreCase) {\n        ignoreCase = true;\n      } else if (/[a-z]/i.test(regex.source.replace(\n                     /\\\\u[0-9a-f]{4}|\\\\x[0-9a-f]{2}|\\\\[^ux]/gi, ''))) {\n        needToFoldCase = true;\n        ignoreCase = false;\n        break;\n      }\n    }\n  \n    var escapeCharToCodeUnit = {\n      'b': 8,\n      't': 9,\n      'n': 0xa,\n      'v': 0xb,\n      'f': 0xc,\n      'r': 0xd\n    };\n  \n    function decodeEscape(charsetPart) {\n      var cc0 = charsetPart.charCodeAt(0);\n      if (cc0 !== 92 /* \\\\ */) {\n        return cc0;\n      }\n      var c1 = charsetPart.charAt(1);\n      cc0 = escapeCharToCodeUnit[c1];\n      if (cc0) {\n        return cc0;\n      } else if ('0' <= c1 && c1 <= '7') {\n        return parseInt(charsetPart.substring(1), 8);\n      } else if (c1 === 'u' || c1 === 'x') {\n        return parseInt(charsetPart.substring(2), 16);\n      } else {\n        return charsetPart.charCodeAt(1);\n      }\n    }\n  \n    function encodeEscape(charCode) {\n      if (charCode < 0x20) {\n        return (charCode < 0x10 ? '\\\\x0' : '\\\\x') + charCode.toString(16);\n      }\n      var ch = String.fromCharCode(charCode);\n      return (ch === '\\\\' || ch === '-' || ch === ']' || ch === '^')\n          ? \"\\\\\" + ch : ch;\n    }\n  \n    function caseFoldCharset(charSet) {\n      var charsetParts = charSet.substring(1, charSet.length - 1).match(\n          new RegExp(\n              '\\\\\\\\u[0-9A-Fa-f]{4}'\n              + '|\\\\\\\\x[0-9A-Fa-f]{2}'\n              + '|\\\\\\\\[0-3][0-7]{0,2}'\n              + '|\\\\\\\\[0-7]{1,2}'\n              + '|\\\\\\\\[\\\\s\\\\S]'\n              + '|-'\n              + '|[^-\\\\\\\\]',\n              'g'));\n      var ranges = [];\n      var inverse = charsetParts[0] === '^';\n  \n      var out = ['['];\n      if (inverse) { out.push('^'); }\n  \n      for (var i = inverse ? 1 : 0, n = charsetParts.length; i < n; ++i) {\n        var p = charsetParts[i];\n        if (/\\\\[bdsw]/i.test(p)) {  // Don't muck with named groups.\n          out.push(p);\n        } else {\n          var start = decodeEscape(p);\n          var end;\n          if (i + 2 < n && '-' === charsetParts[i + 1]) {\n            end = decodeEscape(charsetParts[i + 2]);\n            i += 2;\n          } else {\n            end = start;\n          }\n          ranges.push([start, end]);\n          // If the range might intersect letters, then expand it.\n          // This case handling is too simplistic.\n          // It does not deal with non-latin case folding.\n          // It works for latin source code identifiers though.\n          if (!(end < 65 || start > 122)) {\n            if (!(end < 65 || start > 90)) {\n              ranges.push([Math.max(65, start) | 32, Math.min(end, 90) | 32]);\n            }\n            if (!(end < 97 || start > 122)) {\n              ranges.push([Math.max(97, start) & ~32, Math.min(end, 122) & ~32]);\n            }\n          }\n        }\n      }\n  \n      // [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]]\n      // -> [[1, 12], [14, 14], [16, 17]]\n      ranges.sort(function (a, b) { return (a[0] - b[0]) || (b[1]  - a[1]); });\n      var consolidatedRanges = [];\n      var lastRange = [];\n      for (var i = 0; i < ranges.length; ++i) {\n        var range = ranges[i];\n        if (range[0] <= lastRange[1] + 1) {\n          lastRange[1] = Math.max(lastRange[1], range[1]);\n        } else {\n          consolidatedRanges.push(lastRange = range);\n        }\n      }\n  \n      for (var i = 0; i < consolidatedRanges.length; ++i) {\n        var range = consolidatedRanges[i];\n        out.push(encodeEscape(range[0]));\n        if (range[1] > range[0]) {\n          if (range[1] + 1 > range[0]) { out.push('-'); }\n          out.push(encodeEscape(range[1]));\n        }\n      }\n      out.push(']');\n      return out.join('');\n    }\n  \n    function allowAnywhereFoldCaseAndRenumberGroups(regex) {\n      // Split into character sets, escape sequences, punctuation strings\n      // like ('(', '(?:', ')', '^'), and runs of characters that do not\n      // include any of the above.\n      var parts = regex.source.match(\n          new RegExp(\n              '(?:'\n              + '\\\\[(?:[^\\\\x5C\\\\x5D]|\\\\\\\\[\\\\s\\\\S])*\\\\]'  // a character set\n              + '|\\\\\\\\u[A-Fa-f0-9]{4}'  // a unicode escape\n              + '|\\\\\\\\x[A-Fa-f0-9]{2}'  // a hex escape\n              + '|\\\\\\\\[0-9]+'  // a back-reference or octal escape\n              + '|\\\\\\\\[^ux0-9]'  // other escape sequence\n              + '|\\\\(\\\\?[:!=]'  // start of a non-capturing group\n              + '|[\\\\(\\\\)\\\\^]'  // start/end of a group, or line start\n              + '|[^\\\\x5B\\\\x5C\\\\(\\\\)\\\\^]+'  // run of other characters\n              + ')',\n              'g'));\n      var n = parts.length;\n  \n      // Maps captured group numbers to the number they will occupy in\n      // the output or to -1 if that has not been determined, or to\n      // undefined if they need not be capturing in the output.\n      var capturedGroups = [];\n  \n      // Walk over and identify back references to build the capturedGroups\n      // mapping.\n      for (var i = 0, groupIndex = 0; i < n; ++i) {\n        var p = parts[i];\n        if (p === '(') {\n          // groups are 1-indexed, so max group index is count of '('\n          ++groupIndex;\n        } else if ('\\\\' === p.charAt(0)) {\n          var decimalValue = +p.substring(1);\n          if (decimalValue) {\n            if (decimalValue <= groupIndex) {\n              capturedGroups[decimalValue] = -1;\n            } else {\n              // Replace with an unambiguous escape sequence so that\n              // an octal escape sequence does not turn into a backreference\n              // to a capturing group from an earlier regex.\n              parts[i] = encodeEscape(decimalValue);\n            }\n          }\n        }\n      }\n  \n      // Renumber groups and reduce capturing groups to non-capturing groups\n      // where possible.\n      for (var i = 1; i < capturedGroups.length; ++i) {\n        if (-1 === capturedGroups[i]) {\n          capturedGroups[i] = ++capturedGroupIndex;\n        }\n      }\n      for (var i = 0, groupIndex = 0; i < n; ++i) {\n        var p = parts[i];\n        if (p === '(') {\n          ++groupIndex;\n          if (!capturedGroups[groupIndex]) {\n            parts[i] = '(?:';\n          }\n        } else if ('\\\\' === p.charAt(0)) {\n          var decimalValue = +p.substring(1);\n          if (decimalValue && decimalValue <= groupIndex) {\n            parts[i] = '\\\\' + capturedGroups[decimalValue];\n          }\n        }\n      }\n  \n      // Remove any prefix anchors so that the output will match anywhere.\n      // ^^ really does mean an anchored match though.\n      for (var i = 0; i < n; ++i) {\n        if ('^' === parts[i] && '^' !== parts[i + 1]) { parts[i] = ''; }\n      }\n  \n      // Expand letters to groups to handle mixing of case-sensitive and\n      // case-insensitive patterns if necessary.\n      if (regex.ignoreCase && needToFoldCase) {\n        for (var i = 0; i < n; ++i) {\n          var p = parts[i];\n          var ch0 = p.charAt(0);\n          if (p.length >= 2 && ch0 === '[') {\n            parts[i] = caseFoldCharset(p);\n          } else if (ch0 !== '\\\\') {\n            // TODO: handle letters in numeric escapes.\n            parts[i] = p.replace(\n                /[a-zA-Z]/g,\n                function (ch) {\n                  var cc = ch.charCodeAt(0);\n                  return '[' + String.fromCharCode(cc & ~32, cc | 32) + ']';\n                });\n          }\n        }\n      }\n  \n      return parts.join('');\n    }\n  \n    var rewritten = [];\n    for (var i = 0, n = regexs.length; i < n; ++i) {\n      var regex = regexs[i];\n      if (regex.global || regex.multiline) { throw new Error('' + regex); }\n      rewritten.push(\n          '(?:' + allowAnywhereFoldCaseAndRenumberGroups(regex) + ')');\n    }\n  \n    return new RegExp(rewritten.join('|'), ignoreCase ? 'gi' : 'g');\n  }\n\n\n  /**\n   * Split markup into a string of source code and an array mapping ranges in\n   * that string to the text nodes in which they appear.\n   *\n   * <p>\n   * The HTML DOM structure:</p>\n   * <pre>\n   * (Element   \"p\"\n   *   (Element \"b\"\n   *     (Text  \"print \"))       ; #1\n   *   (Text    \"'Hello '\")      ; #2\n   *   (Element \"br\")            ; #3\n   *   (Text    \"  + 'World';\")) ; #4\n   * </pre>\n   * <p>\n   * corresponds to the HTML\n   * {@code <p><b>print </b>'Hello '<br>  + 'World';</p>}.</p>\n   *\n   * <p>\n   * It will produce the output:</p>\n   * <pre>\n   * {\n   *   sourceCode: \"print 'Hello '\\n  + 'World';\",\n   *   //                     1          2\n   *   //           012345678901234 5678901234567\n   *   spans: [0, #1, 6, #2, 14, #3, 15, #4]\n   * }\n   * </pre>\n   * <p>\n   * where #1 is a reference to the {@code \"print \"} text node above, and so\n   * on for the other text nodes.\n   * </p>\n   *\n   * <p>\n   * The {@code} spans array is an array of pairs.  Even elements are the start\n   * indices of substrings, and odd elements are the text nodes (or BR elements)\n   * that contain the text for those substrings.\n   * Substrings continue until the next index or the end of the source.\n   * </p>\n   *\n   * @param {Node} node an HTML DOM subtree containing source-code.\n   * @param {boolean} isPreformatted true if white-space in text nodes should\n   *    be considered significant.\n   * @return {Object} source code and the text nodes in which they occur.\n   */\n  function extractSourceSpans(node, isPreformatted) {\n    var nocode = /(?:^|\\s)nocode(?:\\s|$)/;\n  \n    var chunks = [];\n    var length = 0;\n    var spans = [];\n    var k = 0;\n  \n    function walk(node) {\n      switch (node.nodeType) {\n        case 1:  // Element\n          if (nocode.test(node.className)) { return; }\n          for (var child = node.firstChild; child; child = child.nextSibling) {\n            walk(child);\n          }\n          var nodeName = node.nodeName.toLowerCase();\n          if ('br' === nodeName || 'li' === nodeName) {\n            chunks[k] = '\\n';\n            spans[k << 1] = length++;\n            spans[(k++ << 1) | 1] = node;\n          }\n          break;\n        case 3: case 4:  // Text\n          var text = node.nodeValue;\n          if (text.length) {\n            if (!isPreformatted) {\n              text = text.replace(/[ \\t\\r\\n]+/g, ' ');\n            } else {\n              text = text.replace(/\\r\\n?/g, '\\n');  // Normalize newlines.\n            }\n            // TODO: handle tabs here?\n            chunks[k] = text;\n            spans[k << 1] = length;\n            length += text.length;\n            spans[(k++ << 1) | 1] = node;\n          }\n          break;\n      }\n    }\n  \n    walk(node);\n  \n    return {\n      sourceCode: chunks.join('').replace(/\\n$/, ''),\n      spans: spans\n    };\n  }\n\n\n  /**\n   * Apply the given language handler to sourceCode and add the resulting\n   * decorations to out.\n   * @param {number} basePos the index of sourceCode within the chunk of source\n   *    whose decorations are already present on out.\n   */\n  function appendDecorations(basePos, sourceCode, langHandler, out) {\n    if (!sourceCode) { return; }\n    var job = {\n      sourceCode: sourceCode,\n      basePos: basePos\n    };\n    langHandler(job);\n    out.push.apply(out, job.decorations);\n  }\n\n  var notWs = /\\S/;\n\n  /**\n   * Given an element, if it contains only one child element and any text nodes\n   * it contains contain only space characters, return the sole child element.\n   * Otherwise returns undefined.\n   * <p>\n   * This is meant to return the CODE element in {@code <pre><code ...>} when\n   * there is a single child element that contains all the non-space textual\n   * content, but not to return anything where there are multiple child elements\n   * as in {@code <pre><code>...</code><code>...</code></pre>} or when there\n   * is textual content.\n   */\n  function childContentWrapper(element) {\n    var wrapper = undefined;\n    for (var c = element.firstChild; c; c = c.nextSibling) {\n      var type = c.nodeType;\n      wrapper = (type === 1)  // Element Node\n          ? (wrapper ? element : c)\n          : (type === 3)  // Text Node\n          ? (notWs.test(c.nodeValue) ? element : wrapper)\n          : wrapper;\n    }\n    return wrapper === element ? undefined : wrapper;\n  }\n\n  /** Given triples of [style, pattern, context] returns a lexing function,\n    * The lexing function interprets the patterns to find token boundaries and\n    * returns a decoration list of the form\n    * [index_0, style_0, index_1, style_1, ..., index_n, style_n]\n    * where index_n is an index into the sourceCode, and style_n is a style\n    * constant like PR_PLAIN.  index_n-1 <= index_n, and style_n-1 applies to\n    * all characters in sourceCode[index_n-1:index_n].\n    *\n    * The stylePatterns is a list whose elements have the form\n    * [style : string, pattern : RegExp, DEPRECATED, shortcut : string].\n    *\n    * Style is a style constant like PR_PLAIN, or can be a string of the\n    * form 'lang-FOO', where FOO is a language extension describing the\n    * language of the portion of the token in $1 after pattern executes.\n    * E.g., if style is 'lang-lisp', and group 1 contains the text\n    * '(hello (world))', then that portion of the token will be passed to the\n    * registered lisp handler for formatting.\n    * The text before and after group 1 will be restyled using this decorator\n    * so decorators should take care that this doesn't result in infinite\n    * recursion.  For example, the HTML lexer rule for SCRIPT elements looks\n    * something like ['lang-js', /<[s]cript>(.+?)<\\/script>/].  This may match\n    * '<script>foo()<\\/script>', which would cause the current decorator to\n    * be called with '<script>' which would not match the same rule since\n    * group 1 must not be empty, so it would be instead styled as PR_TAG by\n    * the generic tag rule.  The handler registered for the 'js' extension would\n    * then be called with 'foo()', and finally, the current decorator would\n    * be called with '<\\/script>' which would not match the original rule and\n    * so the generic tag rule would identify it as a tag.\n    *\n    * Pattern must only match prefixes, and if it matches a prefix, then that\n    * match is considered a token with the same style.\n    *\n    * Context is applied to the last non-whitespace, non-comment token\n    * recognized.\n    *\n    * Shortcut is an optional string of characters, any of which, if the first\n    * character, gurantee that this pattern and only this pattern matches.\n    *\n    * @param {Array} shortcutStylePatterns patterns that always start with\n    *   a known character.  Must have a shortcut string.\n    * @param {Array} fallthroughStylePatterns patterns that will be tried in\n    *   order if the shortcut ones fail.  May have shortcuts.\n    *\n    * @return {function (Object)} a\n    *   function that takes source code and returns a list of decorations.\n    */\n  function createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns) {\n    var shortcuts = {};\n    var tokenizer;\n    (function () {\n      var allPatterns = shortcutStylePatterns.concat(fallthroughStylePatterns);\n      var allRegexs = [];\n      var regexKeys = {};\n      for (var i = 0, n = allPatterns.length; i < n; ++i) {\n        var patternParts = allPatterns[i];\n        var shortcutChars = patternParts[3];\n        if (shortcutChars) {\n          for (var c = shortcutChars.length; --c >= 0;) {\n            shortcuts[shortcutChars.charAt(c)] = patternParts;\n          }\n        }\n        var regex = patternParts[1];\n        var k = '' + regex;\n        if (!regexKeys.hasOwnProperty(k)) {\n          allRegexs.push(regex);\n          regexKeys[k] = null;\n        }\n      }\n      allRegexs.push(/[\\0-\\uffff]/);\n      tokenizer = combinePrefixPatterns(allRegexs);\n    })();\n\n    var nPatterns = fallthroughStylePatterns.length;\n\n    /**\n     * Lexes job.sourceCode and produces an output array job.decorations of\n     * style classes preceded by the position at which they start in\n     * job.sourceCode in order.\n     *\n     * @param {Object} job an object like <pre>{\n     *    sourceCode: {string} sourceText plain text,\n     *    basePos: {int} position of job.sourceCode in the larger chunk of\n     *        sourceCode.\n     * }</pre>\n     */\n    var decorate = function (job) {\n      var sourceCode = job.sourceCode, basePos = job.basePos;\n      /** Even entries are positions in source in ascending order.  Odd enties\n        * are style markers (e.g., PR_COMMENT) that run from that position until\n        * the end.\n        * @type {Array.<number|string>}\n        */\n      var decorations = [basePos, PR_PLAIN];\n      var pos = 0;  // index into sourceCode\n      var tokens = sourceCode.match(tokenizer) || [];\n      var styleCache = {};\n\n      for (var ti = 0, nTokens = tokens.length; ti < nTokens; ++ti) {\n        var token = tokens[ti];\n        var style = styleCache[token];\n        var match = void 0;\n\n        var isEmbedded;\n        if (typeof style === 'string') {\n          isEmbedded = false;\n        } else {\n          var patternParts = shortcuts[token.charAt(0)];\n          if (patternParts) {\n            match = token.match(patternParts[1]);\n            style = patternParts[0];\n          } else {\n            for (var i = 0; i < nPatterns; ++i) {\n              patternParts = fallthroughStylePatterns[i];\n              match = token.match(patternParts[1]);\n              if (match) {\n                style = patternParts[0];\n                break;\n              }\n            }\n\n            if (!match) {  // make sure that we make progress\n              style = PR_PLAIN;\n            }\n          }\n\n          isEmbedded = style.length >= 5 && 'lang-' === style.substring(0, 5);\n          if (isEmbedded && !(match && typeof match[1] === 'string')) {\n            isEmbedded = false;\n            style = PR_SOURCE;\n          }\n\n          if (!isEmbedded) { styleCache[token] = style; }\n        }\n\n        var tokenStart = pos;\n        pos += token.length;\n\n        if (!isEmbedded) {\n          decorations.push(basePos + tokenStart, style);\n        } else {  // Treat group 1 as an embedded block of source code.\n          var embeddedSource = match[1];\n          var embeddedSourceStart = token.indexOf(embeddedSource);\n          var embeddedSourceEnd = embeddedSourceStart + embeddedSource.length;\n          if (match[2]) {\n            // If embeddedSource can be blank, then it would match at the\n            // beginning which would cause us to infinitely recurse on the\n            // entire token, so we catch the right context in match[2].\n            embeddedSourceEnd = token.length - match[2].length;\n            embeddedSourceStart = embeddedSourceEnd - embeddedSource.length;\n          }\n          var lang = style.substring(5);\n          // Decorate the left of the embedded source\n          appendDecorations(\n              basePos + tokenStart,\n              token.substring(0, embeddedSourceStart),\n              decorate, decorations);\n          // Decorate the embedded source\n          appendDecorations(\n              basePos + tokenStart + embeddedSourceStart,\n              embeddedSource,\n              langHandlerForExtension(lang, embeddedSource),\n              decorations);\n          // Decorate the right of the embedded section\n          appendDecorations(\n              basePos + tokenStart + embeddedSourceEnd,\n              token.substring(embeddedSourceEnd),\n              decorate, decorations);\n        }\n      }\n      job.decorations = decorations;\n    };\n    return decorate;\n  }\n\n  /** returns a function that produces a list of decorations from source text.\n    *\n    * This code treats \", ', and ` as string delimiters, and \\ as a string\n    * escape.  It does not recognize perl's qq() style strings.\n    * It has no special handling for double delimiter escapes as in basic, or\n    * the tripled delimiters used in python, but should work on those regardless\n    * although in those cases a single string literal may be broken up into\n    * multiple adjacent string literals.\n    *\n    * It recognizes C, C++, and shell style comments.\n    *\n    * @param {Object} options a set of optional parameters.\n    * @return {function (Object)} a function that examines the source code\n    *     in the input job and builds the decoration list.\n    */\n  function sourceDecorator(options) {\n    var shortcutStylePatterns = [], fallthroughStylePatterns = [];\n    if (options['tripleQuotedStrings']) {\n      // '''multi-line-string''', 'single-line-string', and double-quoted\n      shortcutStylePatterns.push(\n          [PR_STRING,  /^(?:\\'\\'\\'(?:[^\\'\\\\]|\\\\[\\s\\S]|\\'{1,2}(?=[^\\']))*(?:\\'\\'\\'|$)|\\\"\\\"\\\"(?:[^\\\"\\\\]|\\\\[\\s\\S]|\\\"{1,2}(?=[^\\\"]))*(?:\\\"\\\"\\\"|$)|\\'(?:[^\\\\\\']|\\\\[\\s\\S])*(?:\\'|$)|\\\"(?:[^\\\\\\\"]|\\\\[\\s\\S])*(?:\\\"|$))/,\n           null, '\\'\"']);\n    } else if (options['multiLineStrings']) {\n      // 'multi-line-string', \"multi-line-string\"\n      shortcutStylePatterns.push(\n          [PR_STRING,  /^(?:\\'(?:[^\\\\\\']|\\\\[\\s\\S])*(?:\\'|$)|\\\"(?:[^\\\\\\\"]|\\\\[\\s\\S])*(?:\\\"|$)|\\`(?:[^\\\\\\`]|\\\\[\\s\\S])*(?:\\`|$))/,\n           null, '\\'\"`']);\n    } else {\n      // 'single-line-string', \"single-line-string\"\n      shortcutStylePatterns.push(\n          [PR_STRING,\n           /^(?:\\'(?:[^\\\\\\'\\r\\n]|\\\\.)*(?:\\'|$)|\\\"(?:[^\\\\\\\"\\r\\n]|\\\\.)*(?:\\\"|$))/,\n           null, '\"\\'']);\n    }\n    if (options['verbatimStrings']) {\n      // verbatim-string-literal production from the C# grammar.  See issue 93.\n      fallthroughStylePatterns.push(\n          [PR_STRING, /^@\\\"(?:[^\\\"]|\\\"\\\")*(?:\\\"|$)/, null]);\n    }\n    var hc = options['hashComments'];\n    if (hc) {\n      if (options['cStyleComments']) {\n        if (hc > 1) {  // multiline hash comments\n          shortcutStylePatterns.push(\n              [PR_COMMENT, /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, null, '#']);\n        } else {\n          // Stop C preprocessor declarations at an unclosed open comment\n          shortcutStylePatterns.push(\n              [PR_COMMENT, /^#(?:(?:define|e(?:l|nd)if|else|error|ifn?def|include|line|pragma|undef|warning)\\b|[^\\r\\n]*)/,\n               null, '#']);\n        }\n        // #include <stdio.h>\n        fallthroughStylePatterns.push(\n            [PR_STRING,\n             /^<(?:(?:(?:\\.\\.\\/)*|\\/?)(?:[\\w-]+(?:\\/[\\w-]+)+)?[\\w-]+\\.h(?:h|pp|\\+\\+)?|[a-z]\\w*)>/,\n             null]);\n      } else {\n        shortcutStylePatterns.push([PR_COMMENT, /^#[^\\r\\n]*/, null, '#']);\n      }\n    }\n    if (options['cStyleComments']) {\n      fallthroughStylePatterns.push([PR_COMMENT, /^\\/\\/[^\\r\\n]*/, null]);\n      fallthroughStylePatterns.push(\n          [PR_COMMENT, /^\\/\\*[\\s\\S]*?(?:\\*\\/|$)/, null]);\n    }\n    if (options['regexLiterals']) {\n      /**\n       * @const\n       */\n      var REGEX_LITERAL = (\n          // A regular expression literal starts with a slash that is\n          // not followed by * or / so that it is not confused with\n          // comments.\n          '/(?=[^/*])'\n          // and then contains any number of raw characters,\n          + '(?:[^/\\\\x5B\\\\x5C]'\n          // escape sequences (\\x5C),\n          +    '|\\\\x5C[\\\\s\\\\S]'\n          // or non-nesting character sets (\\x5B\\x5D);\n          +    '|\\\\x5B(?:[^\\\\x5C\\\\x5D]|\\\\x5C[\\\\s\\\\S])*(?:\\\\x5D|$))+'\n          // finally closed by a /.\n          + '/');\n      fallthroughStylePatterns.push(\n          ['lang-regex',\n           new RegExp('^' + REGEXP_PRECEDER_PATTERN + '(' + REGEX_LITERAL + ')')\n           ]);\n    }\n\n    var types = options['types'];\n    if (types) {\n      fallthroughStylePatterns.push([PR_TYPE, types]);\n    }\n\n    var keywords = (\"\" + options['keywords']).replace(/^ | $/g, '');\n    if (keywords.length) {\n      fallthroughStylePatterns.push(\n          [PR_KEYWORD,\n           new RegExp('^(?:' + keywords.replace(/[\\s,]+/g, '|') + ')\\\\b'),\n           null]);\n    }\n\n    shortcutStylePatterns.push([PR_PLAIN,       /^\\s+/, null, ' \\r\\n\\t\\xA0']);\n\n    var punctuation =\n      // The Bash man page says\n\n      // A word is a sequence of characters considered as a single\n      // unit by GRUB. Words are separated by metacharacters,\n      // which are the following plus space, tab, and newline: { }\n      // | & $ ; < >\n      // ...\n      \n      // A word beginning with # causes that word and all remaining\n      // characters on that line to be ignored.\n\n      // which means that only a '#' after /(?:^|[{}|&$;<>\\s])/ starts a\n      // comment but empirically\n      // $ echo {#}\n      // {#}\n      // $ echo \\$#\n      // $#\n      // $ echo }#\n      // }#\n\n      // so /(?:^|[|&;<>\\s])/ is more appropriate.\n\n      // http://gcc.gnu.org/onlinedocs/gcc-2.95.3/cpp_1.html#SEC3\n      // suggests that this definition is compatible with a\n      // default mode that tries to use a single token definition\n      // to recognize both bash/python style comments and C\n      // preprocessor directives.\n\n      // This definition of punctuation does not include # in the list of\n      // follow-on exclusions, so # will not be broken before if preceeded\n      // by a punctuation character.  We could try to exclude # after\n      // [|&;<>] but that doesn't seem to cause many major problems.\n      // If that does turn out to be a problem, we should change the below\n      // when hc is truthy to include # in the run of punctuation characters\n      // only when not followint [|&;<>].\n      /^.[^\\s\\w\\.$@\\'\\\"\\`\\/\\\\]*/;\n\n    fallthroughStylePatterns.push(\n        // TODO(mikesamuel): recognize non-latin letters and numerals in idents\n        [PR_LITERAL,     /^@[a-z_$][a-z_$@0-9]*/i, null],\n        [PR_TYPE,        /^(?:[@_]?[A-Z]+[a-z][A-Za-z_$@0-9]*|\\w+_t\\b)/, null],\n        [PR_PLAIN,       /^[a-z_$][a-z_$@0-9]*/i, null],\n        [PR_LITERAL,\n         new RegExp(\n             '^(?:'\n             // A hex number\n             + '0x[a-f0-9]+'\n             // or an octal or decimal number,\n             + '|(?:\\\\d(?:_\\\\d+)*\\\\d*(?:\\\\.\\\\d*)?|\\\\.\\\\d\\\\+)'\n             // possibly in scientific notation\n             + '(?:e[+\\\\-]?\\\\d+)?'\n             + ')'\n             // with an optional modifier like UL for unsigned long\n             + '[a-z]*', 'i'),\n         null, '0123456789'],\n        // Don't treat escaped quotes in bash as starting strings.  See issue 144.\n        [PR_PLAIN,       /^\\\\[\\s\\S]?/, null],\n        [PR_PUNCTUATION, punctuation, null]);\n\n    return createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns);\n  }\n\n  var decorateSource = sourceDecorator({\n        'keywords': ALL_KEYWORDS,\n        'hashComments': true,\n        'cStyleComments': true,\n        'multiLineStrings': true,\n        'regexLiterals': true\n      });\n\n  /**\n   * Given a DOM subtree, wraps it in a list, and puts each line into its own\n   * list item.\n   *\n   * @param {Node} node modified in place.  Its content is pulled into an\n   *     HTMLOListElement, and each line is moved into a separate list item.\n   *     This requires cloning elements, so the input might not have unique\n   *     IDs after numbering.\n   * @param {boolean} isPreformatted true iff white-space in text nodes should\n   *     be treated as significant.\n   */\n  function numberLines(node, opt_startLineNum, isPreformatted) {\n    var nocode = /(?:^|\\s)nocode(?:\\s|$)/;\n    var lineBreak = /\\r\\n?|\\n/;\n  \n    var document = node.ownerDocument;\n  \n    var li = document.createElement('li');\n    while (node.firstChild) {\n      li.appendChild(node.firstChild);\n    }\n    // An array of lines.  We split below, so this is initialized to one\n    // un-split line.\n    var listItems = [li];\n  \n    function walk(node) {\n      switch (node.nodeType) {\n        case 1:  // Element\n          if (nocode.test(node.className)) { break; }\n          if ('br' === node.nodeName) {\n            breakAfter(node);\n            // Discard the <BR> since it is now flush against a </LI>.\n            if (node.parentNode) {\n              node.parentNode.removeChild(node);\n            }\n          } else {\n            for (var child = node.firstChild; child; child = child.nextSibling) {\n              walk(child);\n            }\n          }\n          break;\n        case 3: case 4:  // Text\n          if (isPreformatted) {\n            var text = node.nodeValue;\n            var match = text.match(lineBreak);\n            if (match) {\n              var firstLine = text.substring(0, match.index);\n              node.nodeValue = firstLine;\n              var tail = text.substring(match.index + match[0].length);\n              if (tail) {\n                var parent = node.parentNode;\n                parent.insertBefore(\n                    document.createTextNode(tail), node.nextSibling);\n              }\n              breakAfter(node);\n              if (!firstLine) {\n                // Don't leave blank text nodes in the DOM.\n                node.parentNode.removeChild(node);\n              }\n            }\n          }\n          break;\n      }\n    }\n  \n    // Split a line after the given node.\n    function breakAfter(lineEndNode) {\n      // If there's nothing to the right, then we can skip ending the line\n      // here, and move root-wards since splitting just before an end-tag\n      // would require us to create a bunch of empty copies.\n      while (!lineEndNode.nextSibling) {\n        lineEndNode = lineEndNode.parentNode;\n        if (!lineEndNode) { return; }\n      }\n  \n      function breakLeftOf(limit, copy) {\n        // Clone shallowly if this node needs to be on both sides of the break.\n        var rightSide = copy ? limit.cloneNode(false) : limit;\n        var parent = limit.parentNode;\n        if (parent) {\n          // We clone the parent chain.\n          // This helps us resurrect important styling elements that cross lines.\n          // E.g. in <i>Foo<br>Bar</i>\n          // should be rewritten to <li><i>Foo</i></li><li><i>Bar</i></li>.\n          var parentClone = breakLeftOf(parent, 1);\n          // Move the clone and everything to the right of the original\n          // onto the cloned parent.\n          var next = limit.nextSibling;\n          parentClone.appendChild(rightSide);\n          for (var sibling = next; sibling; sibling = next) {\n            next = sibling.nextSibling;\n            parentClone.appendChild(sibling);\n          }\n        }\n        return rightSide;\n      }\n  \n      var copiedListItem = breakLeftOf(lineEndNode.nextSibling, 0);\n  \n      // Walk the parent chain until we reach an unattached LI.\n      for (var parent;\n           // Check nodeType since IE invents document fragments.\n           (parent = copiedListItem.parentNode) && parent.nodeType === 1;) {\n        copiedListItem = parent;\n      }\n      // Put it on the list of lines for later processing.\n      listItems.push(copiedListItem);\n    }\n  \n    // Split lines while there are lines left to split.\n    for (var i = 0;  // Number of lines that have been split so far.\n         i < listItems.length;  // length updated by breakAfter calls.\n         ++i) {\n      walk(listItems[i]);\n    }\n  \n    // Make sure numeric indices show correctly.\n    if (opt_startLineNum === (opt_startLineNum|0)) {\n      listItems[0].setAttribute('value', opt_startLineNum);\n    }\n  \n    var ol = document.createElement('ol');\n    ol.className = 'linenums';\n    var offset = Math.max(0, ((opt_startLineNum - 1 /* zero index */)) | 0) || 0;\n    for (var i = 0, n = listItems.length; i < n; ++i) {\n      li = listItems[i];\n      // Stick a class on the LIs so that stylesheets can\n      // color odd/even rows, or any other row pattern that\n      // is co-prime with 10.\n      li.className = 'L' + ((i + offset) % 10);\n      if (!li.firstChild) {\n        li.appendChild(document.createTextNode('\\xA0'));\n      }\n      ol.appendChild(li);\n    }\n  \n    node.appendChild(ol);\n  }\n\n  /**\n   * Breaks {@code job.sourceCode} around style boundaries in\n   * {@code job.decorations} and modifies {@code job.sourceNode} in place.\n   * @param {Object} job like <pre>{\n   *    sourceCode: {string} source as plain text,\n   *    spans: {Array.<number|Node>} alternating span start indices into source\n   *       and the text node or element (e.g. {@code <BR>}) corresponding to that\n   *       span.\n   *    decorations: {Array.<number|string} an array of style classes preceded\n   *       by the position at which they start in job.sourceCode in order\n   * }</pre>\n   * @private\n   */\n  function recombineTagsAndDecorations(job) {\n    var isIE8OrEarlier = /\\bMSIE\\s(\\d+)/.exec(navigator.userAgent);\n    isIE8OrEarlier = isIE8OrEarlier && +isIE8OrEarlier[1] <= 8;\n    var newlineRe = /\\n/g;\n  \n    var source = job.sourceCode;\n    var sourceLength = source.length;\n    // Index into source after the last code-unit recombined.\n    var sourceIndex = 0;\n  \n    var spans = job.spans;\n    var nSpans = spans.length;\n    // Index into spans after the last span which ends at or before sourceIndex.\n    var spanIndex = 0;\n  \n    var decorations = job.decorations;\n    var nDecorations = decorations.length;\n    // Index into decorations after the last decoration which ends at or before\n    // sourceIndex.\n    var decorationIndex = 0;\n  \n    // Remove all zero-length decorations.\n    decorations[nDecorations] = sourceLength;\n    var decPos, i;\n    for (i = decPos = 0; i < nDecorations;) {\n      if (decorations[i] !== decorations[i + 2]) {\n        decorations[decPos++] = decorations[i++];\n        decorations[decPos++] = decorations[i++];\n      } else {\n        i += 2;\n      }\n    }\n    nDecorations = decPos;\n  \n    // Simplify decorations.\n    for (i = decPos = 0; i < nDecorations;) {\n      var startPos = decorations[i];\n      // Conflate all adjacent decorations that use the same style.\n      var startDec = decorations[i + 1];\n      var end = i + 2;\n      while (end + 2 <= nDecorations && decorations[end + 1] === startDec) {\n        end += 2;\n      }\n      decorations[decPos++] = startPos;\n      decorations[decPos++] = startDec;\n      i = end;\n    }\n  \n    nDecorations = decorations.length = decPos;\n  \n    var sourceNode = job.sourceNode;\n    var oldDisplay;\n    if (sourceNode) {\n      oldDisplay = sourceNode.style.display;\n      sourceNode.style.display = 'none';\n    }\n    try {\n      var decoration = null;\n      while (spanIndex < nSpans) {\n        var spanStart = spans[spanIndex];\n        var spanEnd = spans[spanIndex + 2] || sourceLength;\n  \n        var decEnd = decorations[decorationIndex + 2] || sourceLength;\n  \n        var end = Math.min(spanEnd, decEnd);\n  \n        var textNode = spans[spanIndex + 1];\n        var styledText;\n        if (textNode.nodeType !== 1  // Don't muck with <BR>s or <LI>s\n            // Don't introduce spans around empty text nodes.\n            && (styledText = source.substring(sourceIndex, end))) {\n          // This may seem bizarre, and it is.  Emitting LF on IE causes the\n          // code to display with spaces instead of line breaks.\n          // Emitting Windows standard issue linebreaks (CRLF) causes a blank\n          // space to appear at the beginning of every line but the first.\n          // Emitting an old Mac OS 9 line separator makes everything spiffy.\n          if (isIE8OrEarlier) {\n            styledText = styledText.replace(newlineRe, '\\r');\n          }\n          textNode.nodeValue = styledText;\n          var document = textNode.ownerDocument;\n          var span = document.createElement('span');\n          span.className = decorations[decorationIndex + 1];\n          var parentNode = textNode.parentNode;\n          parentNode.replaceChild(span, textNode);\n          span.appendChild(textNode);\n          if (sourceIndex < spanEnd) {  // Split off a text node.\n            spans[spanIndex + 1] = textNode\n                // TODO: Possibly optimize by using '' if there's no flicker.\n                = document.createTextNode(source.substring(end, spanEnd));\n            parentNode.insertBefore(textNode, span.nextSibling);\n          }\n        }\n  \n        sourceIndex = end;\n  \n        if (sourceIndex >= spanEnd) {\n          spanIndex += 2;\n        }\n        if (sourceIndex >= decEnd) {\n          decorationIndex += 2;\n        }\n      }\n    } finally {\n      if (sourceNode) {\n        sourceNode.style.display = oldDisplay;\n      }\n    }\n  }\n\n\n  /** Maps language-specific file extensions to handlers. */\n  var langHandlerRegistry = {};\n  /** Register a language handler for the given file extensions.\n    * @param {function (Object)} handler a function from source code to a list\n    *      of decorations.  Takes a single argument job which describes the\n    *      state of the computation.   The single parameter has the form\n    *      {@code {\n    *        sourceCode: {string} as plain text.\n    *        decorations: {Array.<number|string>} an array of style classes\n    *                     preceded by the position at which they start in\n    *                     job.sourceCode in order.\n    *                     The language handler should assigned this field.\n    *        basePos: {int} the position of source in the larger source chunk.\n    *                 All positions in the output decorations array are relative\n    *                 to the larger source chunk.\n    *      } }\n    * @param {Array.<string>} fileExtensions\n    */\n  function registerLangHandler(handler, fileExtensions) {\n    for (var i = fileExtensions.length; --i >= 0;) {\n      var ext = fileExtensions[i];\n      if (!langHandlerRegistry.hasOwnProperty(ext)) {\n        langHandlerRegistry[ext] = handler;\n      } else if (win['console']) {\n        console['warn']('cannot override language handler %s', ext);\n      }\n    }\n  }\n  function langHandlerForExtension(extension, source) {\n    if (!(extension && langHandlerRegistry.hasOwnProperty(extension))) {\n      // Treat it as markup if the first non whitespace character is a < and\n      // the last non-whitespace character is a >.\n      extension = /^\\s*</.test(source)\n          ? 'default-markup'\n          : 'default-code';\n    }\n    return langHandlerRegistry[extension];\n  }\n  registerLangHandler(decorateSource, ['default-code']);\n  registerLangHandler(\n      createSimpleLexer(\n          [],\n          [\n           [PR_PLAIN,       /^[^<?]+/],\n           [PR_DECLARATION, /^<!\\w[^>]*(?:>|$)/],\n           [PR_COMMENT,     /^<\\!--[\\s\\S]*?(?:-\\->|$)/],\n           // Unescaped content in an unknown language\n           ['lang-',        /^<\\?([\\s\\S]+?)(?:\\?>|$)/],\n           ['lang-',        /^<%([\\s\\S]+?)(?:%>|$)/],\n           [PR_PUNCTUATION, /^(?:<[%?]|[%?]>)/],\n           ['lang-',        /^<xmp\\b[^>]*>([\\s\\S]+?)<\\/xmp\\b[^>]*>/i],\n           // Unescaped content in javascript.  (Or possibly vbscript).\n           ['lang-js',      /^<script\\b[^>]*>([\\s\\S]*?)(<\\/script\\b[^>]*>)/i],\n           // Contains unescaped stylesheet content\n           ['lang-css',     /^<style\\b[^>]*>([\\s\\S]*?)(<\\/style\\b[^>]*>)/i],\n           ['lang-in.tag',  /^(<\\/?[a-z][^<>]*>)/i]\n          ]),\n      ['default-markup', 'htm', 'html', 'mxml', 'xhtml', 'xml', 'xsl']);\n  registerLangHandler(\n      createSimpleLexer(\n          [\n           [PR_PLAIN,        /^[\\s]+/, null, ' \\t\\r\\n'],\n           [PR_ATTRIB_VALUE, /^(?:\\\"[^\\\"]*\\\"?|\\'[^\\']*\\'?)/, null, '\\\"\\'']\n           ],\n          [\n           [PR_TAG,          /^^<\\/?[a-z](?:[\\w.:-]*\\w)?|\\/?>$/i],\n           [PR_ATTRIB_NAME,  /^(?!style[\\s=]|on)[a-z](?:[\\w:-]*\\w)?/i],\n           ['lang-uq.val',   /^=\\s*([^>\\'\\\"\\s]*(?:[^>\\'\\\"\\s\\/]|\\/(?=\\s)))/],\n           [PR_PUNCTUATION,  /^[=<>\\/]+/],\n           ['lang-js',       /^on\\w+\\s*=\\s*\\\"([^\\\"]+)\\\"/i],\n           ['lang-js',       /^on\\w+\\s*=\\s*\\'([^\\']+)\\'/i],\n           ['lang-js',       /^on\\w+\\s*=\\s*([^\\\"\\'>\\s]+)/i],\n           ['lang-css',      /^style\\s*=\\s*\\\"([^\\\"]+)\\\"/i],\n           ['lang-css',      /^style\\s*=\\s*\\'([^\\']+)\\'/i],\n           ['lang-css',      /^style\\s*=\\s*([^\\\"\\'>\\s]+)/i]\n           ]),\n      ['in.tag']);\n  registerLangHandler(\n      createSimpleLexer([], [[PR_ATTRIB_VALUE, /^[\\s\\S]+/]]), ['uq.val']);\n  registerLangHandler(sourceDecorator({\n          'keywords': CPP_KEYWORDS,\n          'hashComments': true,\n          'cStyleComments': true,\n          'types': C_TYPES\n        }), ['c', 'cc', 'cpp', 'cxx', 'cyc', 'm']);\n  registerLangHandler(sourceDecorator({\n          'keywords': 'null,true,false'\n        }), ['json']);\n  registerLangHandler(sourceDecorator({\n          'keywords': CSHARP_KEYWORDS,\n          'hashComments': true,\n          'cStyleComments': true,\n          'verbatimStrings': true,\n          'types': C_TYPES\n        }), ['cs']);\n  registerLangHandler(sourceDecorator({\n          'keywords': JAVA_KEYWORDS,\n          'cStyleComments': true\n        }), ['java']);\n  registerLangHandler(sourceDecorator({\n          'keywords': SH_KEYWORDS,\n          'hashComments': true,\n          'multiLineStrings': true\n        }), ['bsh', 'csh', 'sh']);\n  registerLangHandler(sourceDecorator({\n          'keywords': PYTHON_KEYWORDS,\n          'hashComments': true,\n          'multiLineStrings': true,\n          'tripleQuotedStrings': true\n        }), ['cv', 'py']);\n  registerLangHandler(sourceDecorator({\n          'keywords': PERL_KEYWORDS,\n          'hashComments': true,\n          'multiLineStrings': true,\n          'regexLiterals': true\n        }), ['perl', 'pl', 'pm']);\n  registerLangHandler(sourceDecorator({\n          'keywords': RUBY_KEYWORDS,\n          'hashComments': true,\n          'multiLineStrings': true,\n          'regexLiterals': true\n        }), ['rb']);\n  registerLangHandler(sourceDecorator({\n          'keywords': JSCRIPT_KEYWORDS,\n          'cStyleComments': true,\n          'regexLiterals': true\n        }), ['js']);\n  registerLangHandler(sourceDecorator({\n          'keywords': COFFEE_KEYWORDS,\n          'hashComments': 3,  // ### style block comments\n          'cStyleComments': true,\n          'multilineStrings': true,\n          'tripleQuotedStrings': true,\n          'regexLiterals': true\n        }), ['coffee']);\n  registerLangHandler(\n      createSimpleLexer([], [[PR_STRING, /^[\\s\\S]+/]]), ['regex']);\n\n  function applyDecorator(job) {\n    var opt_langExtension = job.langExtension;\n\n    try {\n      // Extract tags, and convert the source code to plain text.\n      var sourceAndSpans = extractSourceSpans(job.sourceNode, job.pre);\n      /** Plain text. @type {string} */\n      var source = sourceAndSpans.sourceCode;\n      job.sourceCode = source;\n      job.spans = sourceAndSpans.spans;\n      job.basePos = 0;\n\n      // Apply the appropriate language handler\n      langHandlerForExtension(opt_langExtension, source)(job);\n\n      // Integrate the decorations and tags back into the source code,\n      // modifying the sourceNode in place.\n      recombineTagsAndDecorations(job);\n    } catch (e) {\n      if (win['console']) {\n        console['log'](e && e['stack'] ? e['stack'] : e);\n      }\n    }\n  }\n\n  /**\n   * @param sourceCodeHtml {string} The HTML to pretty print.\n   * @param opt_langExtension {string} The language name to use.\n   *     Typically, a filename extension like 'cpp' or 'java'.\n   * @param opt_numberLines {number|boolean} True to number lines,\n   *     or the 1-indexed number of the first line in sourceCodeHtml.\n   */\n  function prettyPrintOne(sourceCodeHtml, opt_langExtension, opt_numberLines) {\n    var container = document.createElement('pre');\n    // This could cause images to load and onload listeners to fire.\n    // E.g. <img onerror=\"alert(1337)\" src=\"nosuchimage.png\">.\n    // We assume that the inner HTML is from a trusted source.\n    container.innerHTML = sourceCodeHtml;\n    if (opt_numberLines) {\n      numberLines(container, opt_numberLines, true);\n    }\n\n    var job = {\n      langExtension: opt_langExtension,\n      numberLines: opt_numberLines,\n      sourceNode: container,\n      pre: 1\n    };\n    applyDecorator(job);\n    return container.innerHTML;\n  }\n\n  function prettyPrint(opt_whenDone) {\n    function byTagName(tn) { return document.getElementsByTagName(tn); }\n    // fetch a list of nodes to rewrite\n    var codeSegments = [byTagName('pre'), byTagName('code'), byTagName('xmp')];\n    var elements = [];\n    for (var i = 0; i < codeSegments.length; ++i) {\n      for (var j = 0, n = codeSegments[i].length; j < n; ++j) {\n        elements.push(codeSegments[i][j]);\n      }\n    }\n    codeSegments = null;\n\n    var clock = Date;\n    if (!clock['now']) {\n      clock = { 'now': function () { return +(new Date); } };\n    }\n\n    // The loop is broken into a series of continuations to make sure that we\n    // don't make the browser unresponsive when rewriting a large page.\n    var k = 0;\n    var prettyPrintingJob;\n\n    var langExtensionRe = /\\blang(?:uage)?-([\\w.]+)(?!\\S)/;\n    var prettyPrintRe = /\\bprettyprint\\b/;\n    var prettyPrintedRe = /\\bprettyprinted\\b/;\n    var preformattedTagNameRe = /pre|xmp/i;\n    var codeRe = /^code$/i;\n    var preCodeXmpRe = /^(?:pre|code|xmp)$/i;\n\n    function doWork() {\n      var endTime = (win['PR_SHOULD_USE_CONTINUATION'] ?\n                     clock['now']() + 250 /* ms */ :\n                     Infinity);\n      for (; k < elements.length && clock['now']() < endTime; k++) {\n        var cs = elements[k];\n        var className = cs.className;\n        if (prettyPrintRe.test(className)\n            // Don't redo this if we've already done it.\n            // This allows recalling pretty print to just prettyprint elements\n            // that have been added to the page since last call.\n            && !prettyPrintedRe.test(className)) {\n\n          // make sure this is not nested in an already prettified element\n          var nested = false;\n          for (var p = cs.parentNode; p; p = p.parentNode) {\n            var tn = p.tagName;\n            if (preCodeXmpRe.test(tn)\n                && p.className && prettyPrintRe.test(p.className)) {\n              nested = true;\n              break;\n            }\n          }\n          if (!nested) {\n            // Mark done.  If we fail to prettyprint for whatever reason,\n            // we shouldn't try again.\n            cs.className += ' prettyprinted';\n\n            // If the classes includes a language extensions, use it.\n            // Language extensions can be specified like\n            //     <pre class=\"prettyprint lang-cpp\">\n            // the language extension \"cpp\" is used to find a language handler\n            // as passed to PR.registerLangHandler.\n            // HTML5 recommends that a language be specified using \"language-\"\n            // as the prefix instead.  Google Code Prettify supports both.\n            // http://dev.w3.org/html5/spec-author-view/the-code-element.html\n            var langExtension = className.match(langExtensionRe);\n            // Support <pre class=\"prettyprint\"><code class=\"language-c\">\n            var wrapper;\n            if (!langExtension && (wrapper = childContentWrapper(cs))\n                && codeRe.test(wrapper.tagName)) {\n              langExtension = wrapper.className.match(langExtensionRe);\n            }\n\n            if (langExtension) { langExtension = langExtension[1]; }\n\n            var preformatted;\n            if (preformattedTagNameRe.test(cs.tagName)) {\n              preformatted = 1;\n            } else {\n              var currentStyle = cs['currentStyle'];\n              var whitespace = (\n                  currentStyle\n                  ? currentStyle['whiteSpace']\n                  : (document.defaultView\n                     && document.defaultView.getComputedStyle)\n                  ? document.defaultView.getComputedStyle(cs, null)\n                  .getPropertyValue('white-space')\n                  : 0);\n              preformatted = whitespace\n                  && 'pre' === whitespace.substring(0, 3);\n            }\n\n            // Look for a class like linenums or linenums:<n> where <n> is the\n            // 1-indexed number of the first line.\n            var lineNums = cs.className.match(/\\blinenums\\b(?::(\\d+))?/);\n            lineNums = lineNums\n                ? lineNums[1] && lineNums[1].length ? +lineNums[1] : true\n                : false;\n            if (lineNums) { numberLines(cs, lineNums, preformatted); }\n\n            // do the pretty printing\n            prettyPrintingJob = {\n              langExtension: langExtension,\n              sourceNode: cs,\n              numberLines: lineNums,\n              pre: preformatted\n            };\n            applyDecorator(prettyPrintingJob);\n          }\n        }\n      }\n      if (k < elements.length) {\n        // finish up in a continuation\n        setTimeout(doWork, 250);\n      } else if (opt_whenDone) {\n        opt_whenDone();\n      }\n    }\n\n    doWork();\n  }\n\n  /**\n   * Contains functions for creating and registering new language handlers.\n   * @type {Object}\n   */\n  var PR = win['PR'] = {\n        'createSimpleLexer': createSimpleLexer,\n        'registerLangHandler': registerLangHandler,\n        'sourceDecorator': sourceDecorator,\n        'PR_ATTRIB_NAME': PR_ATTRIB_NAME,\n        'PR_ATTRIB_VALUE': PR_ATTRIB_VALUE,\n        'PR_COMMENT': PR_COMMENT,\n        'PR_DECLARATION': PR_DECLARATION,\n        'PR_KEYWORD': PR_KEYWORD,\n        'PR_LITERAL': PR_LITERAL,\n        'PR_NOCODE': PR_NOCODE,\n        'PR_PLAIN': PR_PLAIN,\n        'PR_PUNCTUATION': PR_PUNCTUATION,\n        'PR_SOURCE': PR_SOURCE,\n        'PR_STRING': PR_STRING,\n        'PR_TAG': PR_TAG,\n        'PR_TYPE': PR_TYPE,\n        'prettyPrintOne': win['prettyPrintOne'] = prettyPrintOne,\n        'prettyPrint': win['prettyPrint'] = prettyPrint\n      };\n\n  // Make PR available via the Asynchronous Module Definition (AMD) API.\n  // Per https://github.com/amdjs/amdjs-api/wiki/AMD:\n  // The Asynchronous Module Definition (AMD) API specifies a\n  // mechanism for defining modules such that the module and its\n  // dependencies can be asynchronously loaded.\n  // ...\n  // To allow a clear indicator that a global define function (as\n  // needed for script src browser loading) conforms to the AMD API,\n  // any global define function SHOULD have a property called \"amd\"\n  // whose value is an object. This helps avoid conflict with any\n  // other existing JavaScript code that could have defined a define()\n  // function that does not conform to the AMD API.\n  if (typeof define === \"function\" && define['amd']) {\n    define(function () {\n      return PR; \n    });\n  }\n})();\n"

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(6)(__webpack_require__(37))

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "/*!\n* Fine Uploader\n*\n* Copyright 2013, Widen Enterprises, Inc. info@fineuploader.com\n*\n* Version: 4.0.3\n*\n* Homepage: http://fineuploader.com\n*\n* Repository: git://github.com/Widen/fine-uploader.git\n*\n* Licensed under GNU GPL v3, see LICENSE\n*/ \n\n\n/*globals window, navigator, document, FormData, File, HTMLInputElement, XMLHttpRequest, Blob, Storage*/\nvar qq = function(element) {\n    \"use strict\";\n\n    return {\n        hide: function() {\n            element.style.display = 'none';\n            return this;\n        },\n\n        /** Returns the function which detaches attached event */\n        attach: function(type, fn) {\n            if (element.addEventListener){\n                element.addEventListener(type, fn, false);\n            } else if (element.attachEvent){\n                element.attachEvent('on' + type, fn);\n            }\n            return function() {\n                qq(element).detach(type, fn);\n            };\n        },\n\n        detach: function(type, fn) {\n            if (element.removeEventListener){\n                element.removeEventListener(type, fn, false);\n            } else if (element.attachEvent){\n                element.detachEvent('on' + type, fn);\n            }\n            return this;\n        },\n\n        contains: function(descendant) {\n            // The [W3C spec](http://www.w3.org/TR/domcore/#dom-node-contains)\n            // says a `null` (or ostensibly `undefined`) parameter\n            // passed into `Node.contains` should result in a false return value.\n            // IE7 throws an exception if the parameter is `undefined` though.\n            if (!descendant) {\n                return false;\n            }\n\n            // compareposition returns false in this case\n            if (element === descendant) {\n                return true;\n            }\n\n            if (element.contains){\n                return element.contains(descendant);\n            } else {\n                /*jslint bitwise: true*/\n                return !!(descendant.compareDocumentPosition(element) & 8);\n            }\n        },\n\n        /**\n         * Insert this element before elementB.\n         */\n        insertBefore: function(elementB) {\n            elementB.parentNode.insertBefore(element, elementB);\n            return this;\n        },\n\n        remove: function() {\n            element.parentNode.removeChild(element);\n            return this;\n        },\n\n        /**\n         * Sets styles for an element.\n         * Fixes opacity in IE6-8.\n         */\n        css: function(styles) {\n            if (styles.opacity != null){\n                if (typeof element.style.opacity !== 'string' && typeof(element.filters) !== 'undefined'){\n                    styles.filter = 'alpha(opacity=' + Math.round(100 * styles.opacity) + ')';\n                }\n            }\n            qq.extend(element.style, styles);\n\n            return this;\n        },\n\n        hasClass: function(name) {\n            var re = new RegExp('(^| )' + name + '( |$)');\n            return re.test(element.className);\n        },\n\n        addClass: function(name) {\n            if (!qq(element).hasClass(name)){\n                element.className += ' ' + name;\n            }\n            return this;\n        },\n\n        removeClass: function(name) {\n            var re = new RegExp('(^| )' + name + '( |$)');\n            element.className = element.className.replace(re, ' ').replace(/^\\s+|\\s+$/g, \"\");\n            return this;\n        },\n\n        getByClass: function(className) {\n            var candidates,\n                result = [];\n\n            if (element.querySelectorAll){\n                return element.querySelectorAll('.' + className);\n            }\n\n            candidates = element.getElementsByTagName(\"*\");\n\n            qq.each(candidates, function(idx, val) {\n                if (qq(val).hasClass(className)){\n                    result.push(val);\n                }\n            });\n            return result;\n        },\n\n        children: function() {\n            var children = [],\n                child = element.firstChild;\n\n            while (child){\n                if (child.nodeType === 1){\n                    children.push(child);\n                }\n                child = child.nextSibling;\n            }\n\n            return children;\n        },\n\n        setText: function(text) {\n            element.innerText = text;\n            element.textContent = text;\n            return this;\n        },\n\n        clearText: function() {\n            return qq(element).setText(\"\");\n        },\n\n        // Returns true if the attribute exists on the element\n        // AND the value of the attribute is NOT \"false\" (case-insensitive)\n        hasAttribute: function(attrName) {\n            var attrVal;\n\n            if (element.hasAttribute) {\n\n                if (!element.hasAttribute(attrName)) {\n                    return false;\n                }\n\n                return /^false$/i.exec(element.getAttribute(attrName)) == null;\n            }\n            else {\n                attrVal = element[attrName];\n\n                if (attrVal === undefined) {\n                    return false;\n                }\n\n                return /^false$/i.exec(attrVal) == null;\n            }\n        }\n    };\n};\n\nqq.log = function(message, level) {\n    \"use strict\";\n\n    if (window.console) {\n        if (!level || level === 'info') {\n            window.console.log(message);\n        }\n        else\n        {\n            if (window.console[level]) {\n                window.console[level](message);\n            }\n            else {\n                window.console.log('<' + level + '> ' + message);\n            }\n        }\n    }\n};\n\nqq.isObject = function(variable) {\n    \"use strict\";\n    return variable && !variable.nodeType && Object.prototype.toString.call(variable) === '[object Object]';\n};\n\nqq.isFunction = function(variable) {\n    \"use strict\";\n    return typeof(variable) === \"function\";\n};\n\n/**\n * Check the type of a value.  Is it an \"array\"?\n *\n * @param value value to test.\n * @returns true if the value is an array or associated with an `ArrayBuffer`\n */\nqq.isArray = function(value) {\n    \"use strict\";\n    return Object.prototype.toString.call(value) === \"[object Array]\"\n        || (window.ArrayBuffer && value.buffer && value.buffer.constructor === ArrayBuffer);\n};\n\n// Looks for an object on a `DataTransfer` object that is associated with drop events when utilizing the Filesystem API.\nqq.isItemList = function(maybeItemList) {\n    \"use strict\";\n    return Object.prototype.toString.call(maybeItemList) === \"[object DataTransferItemList]\";\n};\n\n// Looks for an object on a `NodeList` or an `HTMLCollection`|`HTMLFormElement`|`HTMLSelectElement`\n// object that is associated with collections of Nodes.\nqq.isNodeList = function(maybeNodeList) {\n    \"use strict\";\n    return Object.prototype.toString.call(maybeNodeList) === \"[object NodeList]\" ||\n        // If `HTMLCollection` is the actual type of the object, we must determine this\n        // by checking for expected properties/methods on the object\n        (maybeNodeList.item && maybeNodeList.namedItem);\n};\n\nqq.isString = function(maybeString) {\n    \"use strict\";\n    return Object.prototype.toString.call(maybeString) === '[object String]';\n};\n\nqq.trimStr = function(string) {\n    if (String.prototype.trim) {\n        return string.trim();\n    }\n\n    return string.replace(/^\\s+|\\s+$/g,'');\n};\n\n\n/**\n * @param str String to format.\n * @returns {string} A string, swapping argument values with the associated occurrence of {} in the passed string.\n */\nqq.format = function(str) {\n    \"use strict\";\n\n    var args =  Array.prototype.slice.call(arguments, 1),\n        newStr = str;\n\n    qq.each(args, function(idx, val) {\n        newStr = newStr.replace(/{}/, val);\n    });\n\n    return newStr;\n};\n\nqq.isFile = function(maybeFile) {\n    \"use strict\";\n\n    return window.File && Object.prototype.toString.call(maybeFile) === '[object File]'\n};\n\nqq.isFileList = function(maybeFileList) {\n    return window.FileList && Object.prototype.toString.call(maybeFileList) === '[object FileList]'\n};\n\nqq.isFileOrInput = function(maybeFileOrInput) {\n    \"use strict\";\n\n    return qq.isFile(maybeFileOrInput) || qq.isInput(maybeFileOrInput);\n};\n\nqq.isInput = function(maybeInput) {\n    if (window.HTMLInputElement) {\n        if (Object.prototype.toString.call(maybeInput) === '[object HTMLInputElement]') {\n            if (maybeInput.type && maybeInput.type.toLowerCase() === 'file') {\n                return true;\n            }\n        }\n    }\n    if (maybeInput.tagName) {\n        if (maybeInput.tagName.toLowerCase() === 'input') {\n            if (maybeInput.type && maybeInput.type.toLowerCase() === 'file') {\n                return true;\n            }\n        }\n    }\n\n    return false;\n};\n\nqq.isBlob = function(maybeBlob) {\n    \"use strict\";\n    return window.Blob && Object.prototype.toString.call(maybeBlob) === '[object Blob]';\n};\n\nqq.isXhrUploadSupported = function() {\n    \"use strict\";\n    var input = document.createElement('input');\n    input.type = 'file';\n\n    return (\n        input.multiple !== undefined &&\n            typeof File !== \"undefined\" &&\n            typeof FormData !== \"undefined\" &&\n            typeof (qq.createXhrInstance()).upload !== \"undefined\" );\n};\n\n// Fall back to ActiveX is native XHR is disabled (possible in any version of IE).\nqq.createXhrInstance = function() {\n    if (window.XMLHttpRequest) {\n        return new XMLHttpRequest();\n    }\n\n    try {\n        return new ActiveXObject(\"MSXML2.XMLHTTP.3.0\");\n    }\n    catch(error) {\n        qq.log(\"Neither XHR or ActiveX are supported!\", \"error\");\n        return null;\n    }\n};\n\nqq.isFolderDropSupported = function(dataTransfer) {\n    \"use strict\";\n    return (dataTransfer.items && dataTransfer.items[0].webkitGetAsEntry);\n};\n\nqq.isFileChunkingSupported = function() {\n    \"use strict\";\n    return !qq.android() && //android's impl of Blob.slice is broken\n        qq.isXhrUploadSupported() &&\n        (File.prototype.slice !== undefined || File.prototype.webkitSlice !== undefined || File.prototype.mozSlice !== undefined);\n};\n\nqq.sliceBlob = function(fileOrBlob, start, end) {\n    var slicer = fileOrBlob.slice || fileOrBlob.mozSlice || fileOrBlob.webkitSlice;\n\n    return slicer.call(fileOrBlob, start, end);\n};\n\nqq.arrayBufferToHex = function(buffer) {\n    var bytesAsHex = \"\",\n        bytes = new Uint8Array(buffer);\n\n\n    qq.each(bytes, function(idx, byte) {\n        var byteAsHexStr = byte.toString(16);\n\n        if (byteAsHexStr.length < 2) {\n            byteAsHexStr = \"0\" + byteAsHexStr;\n        }\n\n        bytesAsHex += byteAsHexStr;\n    });\n\n    return bytesAsHex;\n};\n\nqq.readBlobToHex = function(blob, startOffset, length) {\n    var initialBlob = qq.sliceBlob(blob, startOffset, startOffset + length),\n        fileReader = new FileReader(),\n        promise = new qq.Promise();\n\n    fileReader.onload = function() {\n        promise.success(qq.arrayBufferToHex(fileReader.result));\n    };\n\n    fileReader.readAsArrayBuffer(initialBlob);\n\n    return promise;\n};\n\nqq.extend = function(first, second, extendNested) {\n    \"use strict\";\n\n    qq.each(second, function(prop, val) {\n        if (extendNested && qq.isObject(val)) {\n            if (first[prop] === undefined) {\n                first[prop] = {};\n            }\n            qq.extend(first[prop], val, true);\n        }\n        else {\n            first[prop] = val;\n        }\n    });\n\n    return first;\n};\n\n/**\n * Allow properties in one object to override properties in another,\n * keeping track of the original values from the target object.\n *\n * Note that the pre-overriden properties to be overriden by the source will be passed into the `sourceFn` when it is invoked.\n *\n * @param target Update properties in this object from some source\n * @param sourceFn A function that, when invoked, will return properties that will replace properties with the same name in the target.\n * @returns {object} The target object\n */\nqq.override = function(target, sourceFn) {\n    var super_ = {},\n        source = sourceFn(super_);\n\n    qq.each(source, function(srcPropName, srcPropVal) {\n        if (target[srcPropName] !== undefined) {\n            super_[srcPropName] = target[srcPropName];\n        }\n\n        target[srcPropName] = srcPropVal;\n    });\n\n    return target;\n};\n\n/**\n * Searches for a given element in the array, returns -1 if it is not present.\n * @param {Number} [from] The index at which to begin the search\n */\nqq.indexOf = function(arr, elt, from){\n    \"use strict\";\n\n    if (arr.indexOf) {\n        return arr.indexOf(elt, from);\n    }\n\n    from = from || 0;\n    var len = arr.length;\n\n    if (from < 0) {\n        from += len;\n    }\n\n    for (; from < len; from+=1){\n        if (arr.hasOwnProperty(from) && arr[from] === elt){\n            return from;\n        }\n    }\n    return -1;\n};\n\n//this is a version 4 UUID\nqq.getUniqueId = function(){\n    \"use strict\";\n\n    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {\n        /*jslint eqeq: true, bitwise: true*/\n        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);\n        return v.toString(16);\n    });\n};\n\n//\n// Browsers and platforms detection\n\nqq.ie       = function(){\n    \"use strict\";\n    return navigator.userAgent.indexOf('MSIE') !== -1;\n};\nqq.ie7      = function(){\n    \"use strict\";\n    return navigator.userAgent.indexOf('MSIE 7') !== -1;\n};\nqq.ie10     = function(){\n    \"use strict\";\n    return navigator.userAgent.indexOf('MSIE 10') !== -1;\n};\nqq.safari   = function(){\n    \"use strict\";\n    return navigator.vendor !== undefined && navigator.vendor.indexOf(\"Apple\") !== -1;\n};\nqq.chrome   = function(){\n    \"use strict\";\n    return navigator.vendor !== undefined && navigator.vendor.indexOf('Google') !== -1;\n};\nqq.firefox  = function(){\n    \"use strict\";\n    return (navigator.userAgent.indexOf('Mozilla') !== -1 && navigator.vendor !== undefined && navigator.vendor === '');\n};\nqq.windows  = function(){\n    \"use strict\";\n    return navigator.platform === \"Win32\";\n};\nqq.android = function(){\n    \"use strict\";\n    return navigator.userAgent.toLowerCase().indexOf('android') !== -1;\n};\nqq.ios7 = function() {\n    \"use strict\";\n    return qq.ios() && navigator.userAgent.indexOf(\" OS 7_\") !== -1;\n};\nqq.ios = function() {\n    \"use strict\";\n    return navigator.userAgent.indexOf(\"iPad\") !== -1\n        || navigator.userAgent.indexOf(\"iPod\") !== -1\n        || navigator.userAgent.indexOf(\"iPhone\") !== -1;\n};\n\n//\n// Events\n\nqq.preventDefault = function(e){\n    \"use strict\";\n    if (e.preventDefault){\n        e.preventDefault();\n    } else{\n        e.returnValue = false;\n    }\n};\n\n/**\n * Creates and returns element from html string\n * Uses innerHTML to create an element\n */\nqq.toElement = (function(){\n    \"use strict\";\n    var div = document.createElement('div');\n    return function(html){\n        div.innerHTML = html;\n        var element = div.firstChild;\n        div.removeChild(element);\n        return element;\n    };\n}());\n\n//key and value are passed to callback for each entry in the iterable item\nqq.each = function(iterableItem, callback) {\n    \"use strict\";\n    var keyOrIndex, retVal;\n\n    if (iterableItem) {\n        // Iterate through [`Storage`](http://www.w3.org/TR/webstorage/#the-storage-interface) items\n        if (window.Storage && iterableItem.constructor === window.Storage) {\n            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {\n                retVal = callback(iterableItem.key(keyOrIndex), iterableItem.getItem(iterableItem.key(keyOrIndex)));\n                if (retVal === false) {\n                    break;\n                }\n            }\n        }\n        // `DataTransferItemList` & `NodeList` objects are array-like and should be treated as arrays\n        // when iterating over items inside the object.\n        else if (qq.isArray(iterableItem) || qq.isItemList(iterableItem) || qq.isNodeList(iterableItem)) {\n            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {\n                retVal = callback(keyOrIndex, iterableItem[keyOrIndex]);\n                if (retVal === false) {\n                    break;\n                }\n            }\n        }\n        else if (qq.isString(iterableItem)) {\n            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {\n                retVal = callback(keyOrIndex, iterableItem.charAt(keyOrIndex));\n                if (retVal === false) {\n                    break;\n                }\n            }\n        }\n        else {\n            for (keyOrIndex in iterableItem) {\n                if (Object.prototype.hasOwnProperty.call(iterableItem, keyOrIndex)) {\n                    retVal = callback(keyOrIndex, iterableItem[keyOrIndex]);\n                    if (retVal === false) {\n                        break;\n                    }\n                }\n            }\n        }\n    }\n};\n\n//include any args that should be passed to the new function after the context arg\nqq.bind = function(oldFunc, context) {\n    if (qq.isFunction(oldFunc)) {\n        var args =  Array.prototype.slice.call(arguments, 2);\n\n        return function() {\n            var newArgs = qq.extend([], args);\n            if (arguments.length) {\n                newArgs = newArgs.concat(Array.prototype.slice.call(arguments))\n            }\n            return oldFunc.apply(context, newArgs);\n        };\n    }\n\n    throw new Error(\"first parameter must be a function!\");\n};\n\n/**\n * obj2url() takes a json-object as argument and generates\n * a querystring. pretty much like jQuery.param()\n *\n * how to use:\n *\n *    `qq.obj2url({a:'b',c:'d'},'http://any.url/upload?otherParam=value');`\n *\n * will result in:\n *\n *    `http://any.url/upload?otherParam=value&a=b&c=d`\n *\n * @param  Object JSON-Object\n * @param  String current querystring-part\n * @return String encoded querystring\n */\nqq.obj2url = function(obj, temp, prefixDone){\n    \"use strict\";\n    /*jshint laxbreak: true*/\n     var uristrings = [],\n         prefix = '&',\n         add = function(nextObj, i){\n            var nextTemp = temp\n                ? (/\\[\\]$/.test(temp)) // prevent double-encoding\n                ? temp\n                : temp+'['+i+']'\n                : i;\n            if ((nextTemp !== 'undefined') && (i !== 'undefined')) {\n                uristrings.push(\n                    (typeof nextObj === 'object')\n                        ? qq.obj2url(nextObj, nextTemp, true)\n                        : (Object.prototype.toString.call(nextObj) === '[object Function]')\n                        ? encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj())\n                        : encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj)\n                );\n            }\n        };\n\n    if (!prefixDone && temp) {\n        prefix = (/\\?/.test(temp)) ? (/\\?$/.test(temp)) ? '' : '&' : '?';\n        uristrings.push(temp);\n        uristrings.push(qq.obj2url(obj));\n    } else if ((Object.prototype.toString.call(obj) === '[object Array]') && (typeof obj !== 'undefined') ) {\n        qq.each(obj, function(idx, val) {\n            add(val, idx);\n        });\n    } else if ((typeof obj !== 'undefined') && (obj !== null) && (typeof obj === \"object\")){\n        qq.each(obj, function(prop, val) {\n            add(val, prop);\n        });\n    } else {\n        uristrings.push(encodeURIComponent(temp) + '=' + encodeURIComponent(obj));\n    }\n\n    if (temp) {\n        return uristrings.join(prefix);\n    } else {\n        return uristrings.join(prefix)\n            .replace(/^&/, '')\n            .replace(/%20/g, '+');\n    }\n};\n\nqq.obj2FormData = function(obj, formData, arrayKeyName) {\n    \"use strict\";\n    if (!formData) {\n        formData = new FormData();\n    }\n\n    qq.each(obj, function(key, val) {\n        key = arrayKeyName ? arrayKeyName + '[' + key + ']' : key;\n\n        if (qq.isObject(val)) {\n            qq.obj2FormData(val, formData, key);\n        }\n        else if (qq.isFunction(val)) {\n            formData.append(key, val());\n        }\n        else {\n            formData.append(key, val);\n        }\n    });\n\n    return formData;\n};\n\nqq.obj2Inputs = function(obj, form) {\n    \"use strict\";\n    var input;\n\n    if (!form) {\n        form = document.createElement('form');\n    }\n\n    qq.obj2FormData(obj, {\n        append: function(key, val) {\n            input = document.createElement('input');\n            input.setAttribute('name', key);\n            input.setAttribute('value', val);\n            form.appendChild(input);\n        }\n    });\n\n    return form;\n};\n\nqq.setCookie = function(name, value, days) {\n    var date = new Date(),\n        expires = \"\";\n\n\tif (days) {\n\t\tdate.setTime(date.getTime()+(days*24*60*60*1000));\n\t\texpires = \"; expires=\"+date.toGMTString();\n\t}\n\n\tdocument.cookie = name+\"=\"+value+expires+\"; path=/\";\n};\n\nqq.getCookie = function(name) {\n\tvar nameEQ = name + \"=\",\n        ca = document.cookie.split(';'),\n        cookie;\n\n    qq.each(ca, function(idx, part) {\n        var cookiePart = part;\n        while (cookiePart.charAt(0)==' ') {\n            cookiePart = cookiePart.substring(1, cookiePart.length);\n        }\n\n        if (cookiePart.indexOf(nameEQ) === 0) {\n            cookie = cookiePart.substring(nameEQ.length, cookiePart.length);\n            return false;\n        }\n    });\n\n    return cookie;\n};\n\nqq.getCookieNames = function(regexp) {\n    var cookies = document.cookie.split(';'),\n        cookieNames = [];\n\n    qq.each(cookies, function(idx, cookie) {\n        cookie = qq.trimStr(cookie);\n\n        var equalsIdx = cookie.indexOf(\"=\");\n\n        if (cookie.match(regexp)) {\n            cookieNames.push(cookie.substr(0, equalsIdx));\n        }\n    });\n\n    return cookieNames;\n};\n\nqq.deleteCookie = function(name) {\n\tqq.setCookie(name, \"\", -1);\n};\n\nqq.areCookiesEnabled = function() {\n    var randNum = Math.random() * 100000,\n        name = \"qqCookieTest:\" + randNum;\n    qq.setCookie(name, 1);\n\n    if (qq.getCookie(name)) {\n        qq.deleteCookie(name);\n        return true;\n    }\n    return false;\n};\n\n/**\n * Not recommended for use outside of Fine Uploader since this falls back to an unchecked eval if JSON.parse is not\n * implemented.  For a more secure JSON.parse polyfill, use Douglas Crockford's json2.js.\n */\nqq.parseJson = function(json) {\n    /*jshint evil: true*/\n    if (window.JSON && qq.isFunction(JSON.parse)) {\n        return JSON.parse(json);\n    } else {\n        return eval(\"(\" + json + \")\");\n    }\n};\n\n/**\n * Retrieve the extension of a file, if it exists.\n *\n * @param filename\n * @returns {string || undefined}\n */\nqq.getExtension = function(filename) {\n    var extIdx = filename.lastIndexOf('.') + 1;\n\n    if (extIdx > 0) {\n        return filename.substr(extIdx, filename.length - extIdx);\n    }\n};\n\n/**\n * A generic module which supports object disposing in dispose() method.\n * */\nqq.DisposeSupport = function() {\n    \"use strict\";\n    var disposers = [];\n\n    return {\n        /** Run all registered disposers */\n        dispose: function() {\n            var disposer;\n            do {\n                disposer = disposers.shift();\n                if (disposer) {\n                    disposer();\n                }\n            }\n            while (disposer);\n        },\n\n        /** Attach event handler and register de-attacher as a disposer */\n        attach: function() {\n            var args = arguments;\n            /*jslint undef:true*/\n            this.addDisposer(qq(args[0]).attach.apply(this, Array.prototype.slice.call(arguments, 1)));\n        },\n\n        /** Add disposer to the collection */\n        addDisposer: function(disposeFunction) {\n            disposers.push(disposeFunction);\n        }\n    };\n};\n\nqq.version=\"4.0.3\";\n\nqq.supportedFeatures = (function () {\n    var supportsUploading,\n        supportsAjaxFileUploading,\n        supportsFolderDrop,\n        supportsChunking,\n        supportsResume,\n        supportsUploadViaPaste,\n        supportsUploadCors,\n        supportsDeleteFileXdr,\n        supportsDeleteFileCorsXhr,\n        supportsDeleteFileCors,\n        supportsFolderSelection,\n        supportsImagePreviews;\n\n\n    function testSupportsFileInputElement() {\n        var supported = true,\n            tempInput;\n\n        try {\n            tempInput = document.createElement('input');\n            tempInput.type = 'file';\n            qq(tempInput).hide();\n\n            if (tempInput.disabled) {\n                supported = false;\n            }\n        }\n        catch (ex) {\n            supported = false;\n        }\n\n        return supported;\n    }\n\n    //only way to test for Filesystem API support since webkit does not expose the DataTransfer interface\n    function isChrome21OrHigher() {\n        return qq.chrome() &&\n            navigator.userAgent.match(/Chrome\\/[2][1-9]|Chrome\\/[3-9][0-9]/) !== undefined;\n    }\n\n    //only way to test for complete Clipboard API support at this time\n    function isChrome14OrHigher() {\n        return qq.chrome() &&\n            navigator.userAgent.match(/Chrome\\/[1][4-9]|Chrome\\/[2-9][0-9]/) !== undefined;\n    }\n\n    //Ensure we can send cross-origin `XMLHttpRequest`s\n    function isCrossOriginXhrSupported() {\n        if (window.XMLHttpRequest) {\n            var xhr = qq.createXhrInstance();\n\n            //Commonly accepted test for XHR CORS support.\n            return xhr.withCredentials !== undefined;\n        }\n\n        return false;\n    }\n\n    //Test for (terrible) cross-origin ajax transport fallback for IE9 and IE8\n    function isXdrSupported() {\n        return window.XDomainRequest !== undefined;\n    }\n\n    // CORS Ajax requests are supported if it is either possible to send credentialed `XMLHttpRequest`s,\n    // or if `XDomainRequest` is an available alternative.\n    function isCrossOriginAjaxSupported() {\n        if (isCrossOriginXhrSupported()) {\n            return true;\n        }\n\n        return isXdrSupported();\n    }\n\n    function isFolderSelectionSupported() {\n        // We know that folder selection is only supported in Chrome via this proprietary attribute for now\n        return document.createElement('input').webkitdirectory !== undefined;\n    }\n\n\n    supportsUploading = testSupportsFileInputElement();\n\n    supportsAjaxFileUploading = supportsUploading && qq.isXhrUploadSupported();\n\n    supportsFolderDrop = supportsAjaxFileUploading && isChrome21OrHigher();\n\n    supportsChunking = supportsAjaxFileUploading && qq.isFileChunkingSupported();\n\n    supportsResume = supportsAjaxFileUploading && supportsChunking && qq.areCookiesEnabled();\n\n    supportsUploadViaPaste = supportsAjaxFileUploading && isChrome14OrHigher();\n\n    supportsUploadCors = supportsUploading && (window.postMessage !== undefined || supportsAjaxFileUploading);\n\n    supportsDeleteFileCorsXhr = isCrossOriginXhrSupported();\n\n    supportsDeleteFileXdr = isXdrSupported();\n\n    supportsDeleteFileCors = isCrossOriginAjaxSupported();\n\n    supportsFolderSelection = isFolderSelectionSupported();\n\n    supportsImagePreviews = supportsAjaxFileUploading && window.FileReader !== undefined;\n\n\n    return {\n        uploading: supportsUploading,\n        ajaxUploading: supportsAjaxFileUploading,\n        fileDrop: supportsAjaxFileUploading, //NOTE: will also return true for touch-only devices.  It's not currently possible to accurately test for touch-only devices\n        folderDrop: supportsFolderDrop,\n        chunking: supportsChunking,\n        resume: supportsResume,\n        uploadCustomHeaders: supportsAjaxFileUploading,\n        uploadNonMultipart: supportsAjaxFileUploading,\n        itemSizeValidation: supportsAjaxFileUploading,\n        uploadViaPaste: supportsUploadViaPaste,\n        progressBar: supportsAjaxFileUploading,\n        uploadCors: supportsUploadCors,\n        deleteFileCorsXhr: supportsDeleteFileCorsXhr,\n        deleteFileCorsXdr: supportsDeleteFileXdr, //NOTE: will also return true in IE10, where XDR is also supported\n        deleteFileCors: supportsDeleteFileCors,\n        canDetermineSize: supportsAjaxFileUploading,\n        folderSelection: supportsFolderSelection,\n        imagePreviews: supportsImagePreviews\n    }\n\n}());\n\n/*globals qq*/\nqq.Promise = function() {\n    \"use strict\";\n\n    var successArgs, failureArgs,\n        successCallbacks = [],\n        failureCallbacks = [],\n        doneCallbacks = [],\n        state = 0;\n\n    return {\n        then: function(onSuccess, onFailure) {\n            if (state === 0) {\n                if (onSuccess) {\n                    successCallbacks.push(onSuccess);\n                }\n                if (onFailure) {\n                    failureCallbacks.push(onFailure);\n                }\n            }\n            else if (state === -1 && onFailure) {\n                onFailure.apply(null, failureArgs);\n            }\n            else if (onSuccess) {\n                onSuccess.apply(null,successArgs);\n            }\n\n            return this;\n        },\n\n        done: function(callback) {\n            if (state === 0) {\n                doneCallbacks.push(callback);\n            }\n            else {\n                callback.apply(null, failureArgs === undefined ? successArgs : failureArgs);\n            }\n\n            return this;\n        },\n\n        success: function() {\n            state = 1;\n            successArgs = arguments;\n\n            if (successCallbacks.length) {\n                qq.each(successCallbacks, function(idx, callback) {\n                    callback.apply(null, successArgs)\n                })\n            }\n\n            if(doneCallbacks.length) {\n                qq.each(doneCallbacks, function(idx, callback) {\n                    callback.apply(null, successArgs)\n                })\n            }\n\n            return this;\n        },\n\n        failure: function() {\n            state = -1;\n            failureArgs = arguments;\n\n            if (failureCallbacks.length) {\n                qq.each(failureCallbacks, function(idx, callback) {\n                    callback.apply(null, failureArgs);\n                })\n            }\n\n            if(doneCallbacks.length) {\n                qq.each(doneCallbacks, function(idx, callback) {\n                    callback.apply(null, failureArgs);\n                })\n            }\n\n            return this;\n        }\n    };\n};\n\nqq.isPromise = function(maybePromise) {\n    return maybePromise && maybePromise.then && maybePromise.done;\n};\n\n/*globals qq*/\n\n/**\n * This module represents an upload or \"Select File(s)\" button.  It's job is to embed an opaque `<input type=\"file\">`\n * element as a child of a provided \"container\" element.  This \"container\" element (`options.element`) is used to provide\n * a custom style for the `<input type=\"file\">` element.  The ability to change the style of the container element is also\n * provided here by adding CSS classes to the container on hover/focus.\n *\n * TODO Eliminate the mouseover and mouseout event handlers since the :hover CSS pseudo-class should now be\n * available on all supported browsers.\n *\n * @param o Options to override the default values\n */\nqq.UploadButton = function(o) {\n    \"use strict\";\n\n\n    var disposeSupport = new qq.DisposeSupport(),\n\n        options = {\n            // \"Container\" element\n            element: null,\n\n            // If true adds `multiple` attribute to `<input type=\"file\">`\n            multiple: false,\n\n            // Corresponds to the `accept` attribute on the associated `<input type=\"file\">`\n            acceptFiles: null,\n\n            // A true value allows folders to be selected, if supported by the UA\n            folders: false,\n\n            // `name` attribute of `<input type=\"file\">`\n            name: 'qqfile',\n\n            // Called when the browser invokes the onchange handler on the `<input type=\"file\">`\n            onChange: function(input) {},\n\n            // **This option will be removed** in the future as the :hover CSS pseudo-class is available on all supported browsers\n            hoverClass: 'qq-upload-button-hover',\n\n            focusClass: 'qq-upload-button-focus'\n        },\n        input, buttonId;\n\n    // Overrides any of the default option values with any option values passed in during construction.\n    qq.extend(options, o);\n\n    buttonId = qq.getUniqueId();\n\n    // Embed an opaque `<input type=\"file\">` element as a child of `options.element`.\n    function createInput() {\n        var input = document.createElement(\"input\");\n\n        input.setAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME, buttonId);\n\n        if (options.multiple) {\n            input.setAttribute(\"multiple\", \"\");\n        }\n\n        if (options.folders && qq.supportedFeatures.folderSelection) {\n            // selecting directories is only possible in Chrome now, via a vendor-specific prefixed attribute\n            input.setAttribute(\"webkitdirectory\", \"\");\n        }\n\n        if (options.acceptFiles) {\n            input.setAttribute(\"accept\", options.acceptFiles);\n        }\n\n        input.setAttribute(\"type\", \"file\");\n        input.setAttribute(\"name\", options.name);\n\n        qq(input).css({\n            position: 'absolute',\n            // in Opera only 'browse' button\n            // is clickable and it is located at\n            // the right side of the input\n            right: 0,\n            top: 0,\n            fontFamily: 'Arial',\n            // 4 persons reported this, the max values that worked for them were 243, 236, 236, 118\n            fontSize: '118px',\n            margin: 0,\n            padding: 0,\n            cursor: 'pointer',\n            opacity: 0\n        });\n\n        options.element.appendChild(input);\n\n        disposeSupport.attach(input, 'change', function(){\n            options.onChange(input);\n        });\n\n        // **These event handlers will be removed** in the future as the :hover CSS pseudo-class is available on all supported browsers\n        disposeSupport.attach(input, 'mouseover', function(){\n            qq(options.element).addClass(options.hoverClass);\n        });\n        disposeSupport.attach(input, 'mouseout', function(){\n            qq(options.element).removeClass(options.hoverClass);\n        });\n\n        disposeSupport.attach(input, 'focus', function(){\n            qq(options.element).addClass(options.focusClass);\n        });\n        disposeSupport.attach(input, 'blur', function(){\n            qq(options.element).removeClass(options.focusClass);\n        });\n\n        // IE and Opera, unfortunately have 2 tab stops on file input\n        // which is unacceptable in our case, disable keyboard access\n        if (window.attachEvent) {\n            // it is IE or Opera\n            input.setAttribute('tabIndex', \"-1\");\n        }\n\n        return input;\n    }\n\n    // Make button suitable container for input\n    qq(options.element).css({\n        position: 'relative',\n        overflow: 'hidden',\n        // Make sure browse button is in the right side in Internet Explorer\n        direction: 'ltr'\n    });\n\n    input = createInput();\n\n\n    // Exposed API\n    return {\n        getInput: function() {\n            return input;\n        },\n\n        getButtonId: function() {\n            return buttonId;\n        },\n\n        setMultiple: function(isMultiple) {\n            if (isMultiple !== options.multiple) {\n                if (isMultiple) {\n                    input.setAttribute(\"multiple\", \"\");\n                }\n                else {\n                    input.removeAttribute(\"multiple\");\n                }\n            }\n        },\n\n        setAcceptFiles: function(acceptFiles) {\n            if (acceptFiles !== options.acceptFiles) {\n                input.setAttribute(\"accept\", acceptFiles);\n            }\n        },\n\n        reset: function(){\n            if (input.parentNode){\n                qq(input).remove();\n            }\n\n            qq(options.element).removeClass(options.focusClass);\n            input = createInput();\n        }\n    };\n};\n\nqq.UploadButton.BUTTON_ID_ATTR_NAME = \"qq-button-id\";\n\nqq.UploadData = function(uploaderProxy) {\n    var data = [],\n        byId = {},\n        byUuid = {},\n        byStatus = {},\n        api;\n\n    function getDataByIds(ids) {\n        if (qq.isArray(ids)) {\n            var entries = [];\n\n            qq.each(ids, function(idx, id) {\n                entries.push(data[byId[id]]);\n            });\n\n            return entries;\n        }\n\n        return data[byId[ids]];\n    }\n\n    function getDataByUuids(uuids) {\n        if (qq.isArray(uuids)) {\n            var entries = [];\n\n            qq.each(uuids, function(idx, uuid) {\n                entries.push(data[byUuid[uuid]]);\n            });\n\n            return entries;\n        }\n\n        return data[byUuid[uuids]];\n    }\n\n    function getDataByStatus(status) {\n        var statusResults = [],\n            statuses = [].concat(status);\n\n        qq.each(statuses, function(index, statusEnum) {\n            var statusResultIndexes = byStatus[statusEnum];\n\n            if (statusResultIndexes !== undefined) {\n                qq.each(statusResultIndexes, function(i, dataIndex) {\n                    statusResults.push(data[dataIndex]);\n                });\n            }\n        });\n\n        return statusResults;\n    }\n\n    api = {\n        added: function(id) {\n            var uuid = uploaderProxy.getUuid(id),\n                name = uploaderProxy.getName(id),\n                size = uploaderProxy.getSize(id),\n                status = qq.status.SUBMITTING;\n\n            var index = data.push({\n                id: id,\n                name: name,\n                originalName: name,\n                uuid: uuid,\n                size: size,\n                status: status\n            }) - 1;\n\n            byId[id] = index;\n\n            byUuid[uuid] = index;\n\n            if (byStatus[status] === undefined) {\n                byStatus[status] = [];\n            }\n            byStatus[status].push(index);\n\n            uploaderProxy.onStatusChange(id, undefined, status);\n        },\n\n        retrieve: function(optionalFilter) {\n            if (qq.isObject(optionalFilter) && data.length)  {\n                if (optionalFilter.id !== undefined) {\n                    return getDataByIds(optionalFilter.id);\n                }\n\n                else if (optionalFilter.uuid !== undefined) {\n                    return getDataByUuids(optionalFilter.uuid);\n                }\n\n                else if (optionalFilter.status) {\n                    return getDataByStatus(optionalFilter.status);\n                }\n            }\n            else {\n                return qq.extend([], data, true);\n            }\n        },\n\n        reset: function() {\n            data = [];\n            byId = {};\n            byUuid = {};\n            byStatus = {};\n        },\n\n        setStatus: function(id, newStatus) {\n            var dataIndex = byId[id],\n                oldStatus = data[dataIndex].status,\n                byStatusOldStatusIndex = qq.indexOf(byStatus[oldStatus], dataIndex);\n\n            byStatus[oldStatus].splice(byStatusOldStatusIndex, 1);\n\n            data[dataIndex].status = newStatus;\n\n            if (byStatus[newStatus] === undefined) {\n                byStatus[newStatus] = [];\n            }\n            byStatus[newStatus].push(dataIndex);\n\n            uploaderProxy.onStatusChange(id, oldStatus, newStatus);\n        },\n\n        uuidChanged: function(id, newUuid) {\n            var dataIndex = byId[id],\n                oldUuid = data[dataIndex].uuid;\n\n            data[dataIndex].uuid = newUuid;\n            byUuid[newUuid] = dataIndex;\n            delete byUuid[oldUuid];\n        },\n\n        nameChanged: function(id, newName) {\n            var dataIndex = byId[id];\n\n            data[dataIndex].name = newName;\n        }\n    };\n\n    return api;\n};\n\nqq.status = {\n    SUBMITTING: \"submitting\",\n    SUBMITTED: \"submitted\",\n    REJECTED: \"rejected\",\n    QUEUED: \"queued\",\n    CANCELED: \"canceled\",\n    UPLOADING: \"uploading\",\n    UPLOAD_RETRYING: \"retrying upload\",\n    UPLOAD_SUCCESSFUL: \"upload successful\",\n    UPLOAD_FAILED: \"upload failed\",\n    DELETE_FAILED: \"delete failed\",\n    DELETING: \"deleting\",\n    DELETED: \"deleted\"\n};\n\n/**\n * Defines the public API for FineUploaderBasic mode.\n */\nqq.basePublicApi = {\n    log: function(str, level) {\n        if (this._options.debug && (!level || level === 'info')) {\n            qq.log('[FineUploader ' + qq.version + '] ' + str);\n        }\n        else if (level && level !== 'info') {\n            qq.log('[FineUploader ' + qq.version + '] ' + str, level);\n\n        }\n    },\n\n    setParams: function(params, id) {\n        /*jshint eqeqeq: true, eqnull: true*/\n        if (id == null) {\n            this._options.request.params = params;\n        }\n        else {\n            this._paramsStore.setParams(params, id);\n        }\n    },\n\n    setDeleteFileParams: function(params, id) {\n        /*jshint eqeqeq: true, eqnull: true*/\n        if (id == null) {\n            this._options.deleteFile.params = params;\n        }\n        else {\n            this._deleteFileParamsStore.setParams(params, id);\n        }\n    },\n\n    // Re-sets the default endpoint, an endpoint for a specific file, or an endpoint for a specific button\n    setEndpoint: function(endpoint, id) {\n        /*jshint eqeqeq: true, eqnull: true*/\n        if (id == null) {\n            this._options.request.endpoint = endpoint;\n        }\n        else {\n            this._endpointStore.setEndpoint(endpoint, id);\n        }\n    },\n\n    getInProgress: function() {\n        return this._uploadData.retrieve({\n            status: [\n                qq.status.UPLOADING,\n                qq.status.UPLOAD_RETRYING,\n                qq.status.QUEUED\n            ]\n        }).length;\n    },\n\n    getNetUploads: function() {\n        return this._netUploaded;\n    },\n\n    uploadStoredFiles: function() {\n        var idToUpload;\n\n        if (this._storedIds.length === 0) {\n            this._itemError('noFilesError');\n        }\n        else {\n            while (this._storedIds.length) {\n                idToUpload = this._storedIds.shift();\n                this._handler.upload(idToUpload);\n            }\n        }\n    },\n\n    clearStoredFiles: function(){\n        this._storedIds = [];\n    },\n\n    retry: function(id) {\n        return this._manualRetry(id);\n    },\n\n    cancel: function(id) {\n        this._handler.cancel(id);\n    },\n\n    cancelAll: function() {\n        var storedIdsCopy = [],\n            self = this;\n\n        qq.extend(storedIdsCopy, this._storedIds);\n        qq.each(storedIdsCopy, function(idx, storedFileId) {\n            self.cancel(storedFileId);\n        });\n\n        this._handler.cancelAll();\n    },\n\n    reset: function() {\n        this.log(\"Resetting uploader...\");\n\n        this._handler.reset();\n        this._storedIds = [];\n        this._autoRetries = [];\n        this._retryTimeouts = [];\n        this._preventRetries = [];\n        this._thumbnailUrls = [];\n\n        qq.each(this._buttons, function(idx, button) {\n            button.reset();\n        });\n\n        this._paramsStore.reset();\n        this._endpointStore.reset();\n        this._netUploadedOrQueued = 0;\n        this._netUploaded = 0;\n        this._uploadData.reset();\n        this._buttonIdsForFileIds = [];\n\n        if (this._pasteHandler) {\n            this._pasteHandler.reset();\n        }\n    },\n\n    addFiles: function(filesOrInputs, params, endpoint) {\n        var self = this,\n            verifiedFilesOrInputs = [],\n            fileOrInputIndex, fileOrInput, fileIndex;\n\n        if (filesOrInputs) {\n            if (!qq.isFileList(filesOrInputs)) {\n                filesOrInputs = [].concat(filesOrInputs);\n            }\n\n            for (fileOrInputIndex = 0; fileOrInputIndex < filesOrInputs.length; fileOrInputIndex+=1) {\n                fileOrInput = filesOrInputs[fileOrInputIndex];\n\n                if (qq.isFileOrInput(fileOrInput)) {\n                    if (qq.isInput(fileOrInput) && qq.supportedFeatures.ajaxUploading) {\n                        for (fileIndex = 0; fileIndex < fileOrInput.files.length; fileIndex++) {\n                            verifiedFilesOrInputs.push(fileOrInput.files[fileIndex]);\n                        }\n                    }\n                    else {\n                        verifiedFilesOrInputs.push(fileOrInput);\n                    }\n                }\n                else {\n                    self.log(fileOrInput + ' is not a File or INPUT element!  Ignoring!', 'warn');\n                }\n            }\n\n            this.log('Received ' + verifiedFilesOrInputs.length + ' files or inputs.');\n            this._prepareItemsForUpload(verifiedFilesOrInputs, params, endpoint);\n        }\n    },\n\n    addBlobs: function(blobDataOrArray, params, endpoint) {\n        if (blobDataOrArray) {\n            var blobDataArray = [].concat(blobDataOrArray),\n                verifiedBlobDataList = [],\n                self = this;\n\n            qq.each(blobDataArray, function(idx, blobData) {\n                if (qq.isBlob(blobData) && !qq.isFileOrInput(blobData)) {\n                    verifiedBlobDataList.push({\n                        blob: blobData,\n                        name: self._options.blobs.defaultName\n                    });\n                }\n                else if (qq.isObject(blobData) && blobData.blob && blobData.name) {\n                    verifiedBlobDataList.push(blobData);\n                }\n                else {\n                    self.log(\"addBlobs: entry at index \" + idx + \" is not a Blob or a BlobData object\", \"error\");\n                }\n            });\n\n            this._prepareItemsForUpload(verifiedBlobDataList, params, endpoint);\n        }\n        else {\n            this.log(\"undefined or non-array parameter passed into addBlobs\", \"error\");\n        }\n    },\n\n    getUuid: function(id) {\n        return this._handler.getUuid(id);\n    },\n\n    setUuid: function(id, newUuid) {\n        return this._handler.setUuid(id, newUuid);\n    },\n\n    getResumableFilesData: function() {\n        return this._handler.getResumableFilesData();\n    },\n\n    getSize: function(id) {\n        return this._handler.getSize(id);\n    },\n\n    getName: function(id) {\n        return this._handler.getName(id);\n    },\n\n    setName: function(id, newName) {\n        this._handler.setName(id, newName);\n        this._uploadData.nameChanged(id, newName);\n    },\n\n    getFile: function(fileOrBlobId) {\n        return this._handler.getFile(fileOrBlobId);\n    },\n\n    deleteFile: function(id) {\n        this._onSubmitDelete(id);\n    },\n\n    setDeleteFileEndpoint: function(endpoint, id) {\n        /*jshint eqeqeq: true, eqnull: true*/\n        if (id == null) {\n            this._options.deleteFile.endpoint = endpoint;\n        }\n        else {\n            this._deleteFileEndpointStore.setEndpoint(endpoint, id);\n        }\n    },\n\n    doesExist: function(fileOrBlobId) {\n        return this._handler.isValid(fileOrBlobId);\n    },\n\n    getUploads: function(optionalFilter) {\n        return this._uploadData.retrieve(optionalFilter);\n    },\n\n    getButton: function(fileId) {\n        return this._getButton(this._buttonIdsForFileIds[fileId]);\n    },\n\n    // Generate a variable size thumbnail on an img or canvas,\n    // returning a promise that is fulfilled when the attempt completes.\n    // Thumbnail can either be based off of a URL for an image returned\n    // by the server in the upload response, or the associated `Blob`.\n    drawThumbnail: function(fileId, imgOrCanvas, maxSize, fromServer) {\n        if (this._imageGenerator) {\n            var fileOrUrl = this._thumbnailUrls[fileId],\n                options = {\n                    scale: maxSize > 0,\n                    maxSize: maxSize > 0 ? maxSize : null\n                };\n\n            // If client-side preview generation is possible\n            // and we are not specifically looking for the image URl returned by the server...\n            if (!fromServer && qq.supportedFeatures.imagePreviews) {\n                fileOrUrl = this.getFile(fileId);\n            }\n\n            if (fileOrUrl == null) {\n                return new qq.Promise().failure(imgOrCanvas, \"File or URL not found.\");\n            }\n\n            return this._imageGenerator.generate(fileOrUrl, imgOrCanvas, options);\n        }\n    }\n};\n\n\n\n\n/**\n * Defines the private (internal) API for FineUploaderBasic mode.\n */\nqq.basePrivateApi = {\n    // Creates an internal object that tracks various properties of each extra button,\n    // and then actually creates the extra button.\n    _generateExtraButtonSpecs: function() {\n        var self = this;\n\n        this._extraButtonSpecs = {};\n\n        qq.each(this._options.extraButtons, function(idx, extraButtonOptionEntry) {\n            var multiple = extraButtonOptionEntry.multiple,\n                validation = qq.extend({}, self._options.validation, true),\n                extraButtonSpec = qq.extend({}, extraButtonOptionEntry);\n\n            if (multiple === undefined) {\n                multiple = self._options.multiple;\n            }\n\n            if (extraButtonSpec.validation) {\n                qq.extend(validation, extraButtonOptionEntry.validation, true);\n            }\n\n            qq.extend(extraButtonSpec, {\n                multiple: multiple,\n                validation: validation\n            }, true);\n\n            self._initExtraButton(extraButtonSpec);\n        });\n    },\n\n    // Creates an extra button element\n    _initExtraButton: function(spec) {\n        var button = this._createUploadButton({\n            element: spec.element,\n            multiple: spec.multiple,\n            accept: spec.validation.acceptFiles,\n            folders: spec.folders\n        });\n\n        this._extraButtonSpecs[button.getButtonId()] = spec;\n    },\n\n    /**\n     * Gets the internally used tracking ID for a button.\n     *\n     * @param buttonOrFileInputOrFile `File`, `<input type=\"file\">`, or a button container element\n     * @returns {*} The button's ID, or undefined if no ID is recoverable\n     * @private\n     */\n    _getButtonId: function(buttonOrFileInputOrFile) {\n        var inputs, fileInput;\n\n        // If the item is a `Blob` it will never be associated with a button or drop zone.\n        if (buttonOrFileInputOrFile && !buttonOrFileInputOrFile.blob && !qq.isBlob(buttonOrFileInputOrFile)) {\n            if (qq.isFile(buttonOrFileInputOrFile)) {\n                return buttonOrFileInputOrFile.qqButtonId;\n            }\n            else if (buttonOrFileInputOrFile.tagName.toLowerCase() === \"input\" &&\n                buttonOrFileInputOrFile.type.toLowerCase() === \"file\") {\n\n                return buttonOrFileInputOrFile.getAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME);\n            }\n\n            inputs = buttonOrFileInputOrFile.getElementsByTagName(\"input\");\n\n            qq.each(inputs, function(idx, input) {\n                if (input.getAttribute(\"type\") === \"file\") {\n                    fileInput = input;\n                    return false;\n                }\n            });\n\n            if (fileInput) {\n                return fileInput.getAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME);\n            }\n        }\n    },\n\n    _annotateWithButtonId: function(file, associatedInput) {\n        if (qq.isFile(file)) {\n            file.qqButtonId = this._getButtonId(associatedInput);\n        }\n    },\n\n    _getButton: function(buttonId) {\n        var extraButtonsSpec = this._extraButtonSpecs[buttonId];\n\n        if (extraButtonsSpec) {\n            return extraButtonsSpec.element;\n        }\n        else if (buttonId === this._defaultButtonId) {\n            return this._options.button;\n        }\n    },\n\n    _handleCheckedCallback: function(details) {\n        var self = this,\n            callbackRetVal = details.callback();\n\n        if (qq.isPromise(callbackRetVal)) {\n            this.log(details.name + \" - waiting for \" + details.name + \" promise to be fulfilled for \" + details.identifier);\n            return callbackRetVal.then(\n                function(successParam) {\n                    self.log(details.name + \" promise success for \" + details.identifier);\n                    details.onSuccess(successParam);\n                },\n                function() {\n                    if (details.onFailure) {\n                        self.log(details.name + \" promise failure for \" + details.identifier);\n                        details.onFailure();\n                    }\n                    else {\n                        self.log(details.name + \" promise failure for \" + details.identifier);\n                    }\n                });\n        }\n\n        if (callbackRetVal !== false) {\n            details.onSuccess(callbackRetVal);\n        }\n        else {\n            if (details.onFailure) {\n                this.log(details.name + \" - return value was 'false' for \" + details.identifier + \".  Invoking failure callback.\")\n                details.onFailure();\n            }\n            else {\n                this.log(details.name + \" - return value was 'false' for \" + details.identifier + \".  Will not proceed.\")\n            }\n        }\n\n        return callbackRetVal;\n    },\n\n    /**\n     * Generate a tracked upload button.\n     *\n     * @param spec Object containing a required `element` property\n     * along with optional `multiple`, `accept`, and `folders`.\n     * @returns {qq.UploadButton}\n     * @private\n     */\n    _createUploadButton: function(spec) {\n        var self = this,\n            isMultiple = spec.multiple === undefined ? this._options.multiple : spec.multiple,\n            acceptFiles = spec.accept || this._options.validation.acceptFiles;\n\n        var button = new qq.UploadButton({\n            element: spec.element,\n            folders: spec.folders,\n            name: this._options.request.inputName,\n            multiple: isMultiple && qq.supportedFeatures.ajaxUploading,\n            acceptFiles: acceptFiles,\n            onChange: function(input) {\n                self._onInputChange(input);\n            },\n            hoverClass: this._options.classes.buttonHover,\n            focusClass: this._options.classes.buttonFocus\n        });\n\n        this._disposeSupport.addDisposer(function() {\n            button.dispose();\n        });\n\n        self._buttons.push(button);\n\n        return button;\n    },\n\n    _createUploadHandler: function(additionalOptions, namespace) {\n        var self = this,\n            options = {\n                debug: this._options.debug,\n                maxConnections: this._options.maxConnections,\n                inputName: this._options.request.inputName,\n                cors: this._options.cors,\n                demoMode: this._options.demoMode,\n                paramsStore: this._paramsStore,\n                endpointStore: this._endpointStore,\n                chunking: this._options.chunking,\n                resume: this._options.resume,\n                blobs: this._options.blobs,\n                log: qq.bind(self.log, self),\n                onProgress: function(id, name, loaded, total){\n                    self._onProgress(id, name, loaded, total);\n                    self._options.callbacks.onProgress(id, name, loaded, total);\n                },\n                onComplete: function(id, name, result, xhr){\n                    var retVal = self._onComplete(id, name, result, xhr);\n\n                    // If the internal `_onComplete` handler returns a promise, don't invoke the `onComplete` callback\n                    // until the promise has been fulfilled.\n                    if (qq.isPromise(retVal)) {\n                        retVal.done(function() {\n                            self._options.callbacks.onComplete(id, name, result, xhr);\n                        });\n                    }\n                    else {\n                        self._options.callbacks.onComplete(id, name, result, xhr);\n                    }\n                },\n                onCancel: function(id, name) {\n                    return self._handleCheckedCallback({\n                        name: \"onCancel\",\n                        callback: qq.bind(self._options.callbacks.onCancel, self, id, name),\n                        onSuccess: qq.bind(self._onCancel, self, id, name),\n                        identifier: id\n                    });\n                },\n                onUpload: function(id, name) {\n                    self._onUpload(id, name);\n                    self._options.callbacks.onUpload(id, name);\n                },\n                onUploadChunk: function(id, name, chunkData){\n                    self._options.callbacks.onUploadChunk(id, name, chunkData);\n                },\n                onResume: function(id, name, chunkData) {\n                    return self._options.callbacks.onResume(id, name, chunkData);\n                },\n                onAutoRetry: function(id, name, responseJSON, xhr) {\n                    return self._onAutoRetry.apply(self, arguments);\n                },\n                onUuidChanged: function(id, newUuid) {\n                    self._uploadData.uuidChanged(id, newUuid);\n                }\n            };\n\n        qq.each(this._options.request, function(prop, val) {\n            options[prop] = val;\n        });\n\n        if (additionalOptions) {\n            qq.each(additionalOptions, function(key, val) {\n                options[key] = val;\n            });\n        }\n\n        return new qq.UploadHandler(options, namespace);\n    },\n\n    _createDeleteHandler: function() {\n        var self = this;\n\n        return new qq.DeleteFileAjaxRequestor({\n            method: this._options.deleteFile.method,\n            maxConnections: this._options.maxConnections,\n            uuidParamName: this._options.request.uuidName,\n            customHeaders: this._options.deleteFile.customHeaders,\n            paramsStore: this._deleteFileParamsStore,\n            endpointStore: this._deleteFileEndpointStore,\n            demoMode: this._options.demoMode,\n            cors: this._options.cors,\n            log: qq.bind(self.log, self),\n            onDelete: function(id) {\n                self._onDelete(id);\n                self._options.callbacks.onDelete(id);\n            },\n            onDeleteComplete: function(id, xhrOrXdr, isError) {\n                self._onDeleteComplete(id, xhrOrXdr, isError);\n                self._options.callbacks.onDeleteComplete(id, xhrOrXdr, isError);\n            }\n\n        });\n    },\n\n    _createPasteHandler: function() {\n        var self = this;\n\n        return new qq.PasteSupport({\n            targetElement: this._options.paste.targetElement,\n            callbacks: {\n                log: qq.bind(self.log, self),\n                pasteReceived: function(blob) {\n                    self._handleCheckedCallback({\n                        name: \"onPasteReceived\",\n                        callback: qq.bind(self._options.callbacks.onPasteReceived, self, blob),\n                        onSuccess: qq.bind(self._handlePasteSuccess, self, blob),\n                        identifier: \"pasted image\"\n                    });\n                }\n            }\n        });\n    },\n\n    _createUploadDataTracker: function() {\n        var self = this;\n\n        return new qq.UploadData({\n            getName: function(id) {\n                return self.getName(id);\n            },\n            getUuid: function(id) {\n                return self.getUuid(id);\n            },\n            getSize: function(id) {\n                return self.getSize(id);\n            },\n            onStatusChange: function(id, oldStatus, newStatus) {\n                self._onUploadStatusChange(id, oldStatus, newStatus);\n                self._options.callbacks.onStatusChange(id, oldStatus, newStatus);\n            }\n        });\n    },\n\n    _onUploadStatusChange: function(id, oldStatus, newStatus) {\n        //nothing to do in the basic uploader\n    },\n\n    _handlePasteSuccess: function(blob, extSuppliedName) {\n        var extension = blob.type.split(\"/\")[1],\n            name = extSuppliedName;\n\n        /*jshint eqeqeq: true, eqnull: true*/\n        if (name == null) {\n            name = this._options.paste.defaultName;\n        }\n\n        name += '.' + extension;\n\n        this.addBlobs({\n            name: name,\n            blob: blob\n        });\n    },\n\n    _preventLeaveInProgress: function(){\n        var self = this;\n\n        this._disposeSupport.attach(window, 'beforeunload', function(e){\n            if (self.getInProgress()) {\n                var e = e || window.event;\n                // for ie, ff\n                e.returnValue = self._options.messages.onLeave;\n                // for webkit\n                return self._options.messages.onLeave;\n            }\n        });\n    },\n\n    _onSubmit: function(id, name) {\n        this._netUploadedOrQueued++;\n    },\n\n    _onProgress: function(id, name, loaded, total) {\n        //nothing to do yet in core uploader\n    },\n\n    _onComplete: function(id, name, result, xhr) {\n        if (!result.success) {\n            this._netUploadedOrQueued--;\n            this._uploadData.setStatus(id, qq.status.UPLOAD_FAILED);\n        }\n        else {\n            if (result.thumbnailUrl) {\n                this._thumbnailUrls[id] = result.thumbnailUrl;\n            }\n\n            this._netUploaded++;\n            this._uploadData.setStatus(id, qq.status.UPLOAD_SUCCESSFUL);\n        }\n\n        this._maybeParseAndSendUploadError(id, name, result, xhr);\n\n        return result.success ? true : false;\n    },\n\n    _onCancel: function(id, name) {\n        this._netUploadedOrQueued--;\n\n        clearTimeout(this._retryTimeouts[id]);\n\n        var storedItemIndex = qq.indexOf(this._storedIds, id);\n        if (!this._options.autoUpload && storedItemIndex >= 0) {\n            this._storedIds.splice(storedItemIndex, 1);\n        }\n\n        this._uploadData.setStatus(id, qq.status.CANCELED);\n    },\n\n    _isDeletePossible: function() {\n        if (!qq.DeleteFileAjaxRequestor || !this._options.deleteFile.enabled) {\n            return false;\n        }\n\n        if (this._options.cors.expected) {\n            if (qq.supportedFeatures.deleteFileCorsXhr) {\n                return true;\n            }\n\n            if (qq.supportedFeatures.deleteFileCorsXdr && this._options.cors.allowXdr) {\n                return true;\n            }\n\n            return false;\n        }\n\n        return true;\n    },\n\n    _onSubmitDelete: function(id, onSuccessCallback, additionalMandatedParams) {\n        var uuid = this.getUuid(id),\n            adjustedOnSuccessCallback;\n\n        if (onSuccessCallback) {\n            adjustedOnSuccessCallback = qq.bind(onSuccessCallback, this, id, uuid, additionalMandatedParams);\n        }\n\n        if (this._isDeletePossible()) {\n            return this._handleCheckedCallback({\n                name: \"onSubmitDelete\",\n                callback: qq.bind(this._options.callbacks.onSubmitDelete, this, id),\n                onSuccess: adjustedOnSuccessCallback ||\n                    qq.bind(this._deleteHandler.sendDelete, this, id, uuid, additionalMandatedParams),\n                identifier: id\n            });\n        }\n        else {\n            this.log(\"Delete request ignored for ID \" + id + \", delete feature is disabled or request not possible \" +\n                \"due to CORS on a user agent that does not support pre-flighting.\", \"warn\");\n            return false;\n        }\n    },\n\n    _onDelete: function(id) {\n        this._uploadData.setStatus(id, qq.status.DELETING);\n    },\n\n    _onDeleteComplete: function(id, xhrOrXdr, isError) {\n        var name = this._handler.getName(id);\n\n        if (isError) {\n            this._uploadData.setStatus(id, qq.status.DELETE_FAILED);\n            this.log(\"Delete request for '\" + name + \"' has failed.\", \"error\");\n\n            // For error reporing, we only have accesss to the response status if this is not\n            // an `XDomainRequest`.\n            if (xhrOrXdr.withCredentials === undefined) {\n                this._options.callbacks.onError(id, name, \"Delete request failed\", xhrOrXdr);\n            }\n            else {\n                this._options.callbacks.onError(id, name, \"Delete request failed with response code \" + xhrOrXdr.status, xhrOrXdr);\n            }\n        }\n        else {\n            this._netUploadedOrQueued--;\n            this._netUploaded--;\n            this._handler.expunge(id);\n            this._uploadData.setStatus(id, qq.status.DELETED);\n            this.log(\"Delete request for '\" + name + \"' has succeeded.\");\n        }\n    },\n\n    _onUpload: function(id, name) {\n        this._uploadData.setStatus(id, qq.status.UPLOADING);\n    },\n\n    _onInputChange: function(input) {\n        var fileIndex;\n\n        if (qq.supportedFeatures.ajaxUploading) {\n            for (fileIndex = 0; fileIndex < input.files.length; fileIndex++) {\n                this._annotateWithButtonId(input.files[fileIndex], input);\n            }\n\n            this.addFiles(input.files);\n        }\n        // Android 2.3.x will fire `onchange` even if no file has been selected\n        else if (input.value.length > 0) {\n            this.addFiles(input);\n        }\n\n        qq.each(this._buttons, function(idx, button) {\n            button.reset();\n        });\n    },\n\n    _onBeforeAutoRetry: function(id, name) {\n        this.log(\"Waiting \" + this._options.retry.autoAttemptDelay + \" seconds before retrying \" + name + \"...\");\n    },\n\n    /**\n     * Attempt to automatically retry a failed upload.\n     *\n     * @param id The file ID of the failed upload\n     * @param name The name of the file associated with the failed upload\n     * @param responseJSON Response from the server, parsed into a javascript object\n     * @param xhr Ajax transport used to send the failed request\n     * @param callback Optional callback to be invoked if a retry is prudent.\n     * Invoked in lieu of asking the upload handler to retry.\n     * @returns {boolean} true if an auto-retry will occur\n     * @private\n     */\n    _onAutoRetry: function(id, name, responseJSON, xhr, callback) {\n        var self = this;\n\n        self._preventRetries[id] = responseJSON[self._options.retry.preventRetryResponseProperty];\n\n        if (self._shouldAutoRetry(id, name, responseJSON)) {\n            self._maybeParseAndSendUploadError.apply(self, arguments);\n            self._options.callbacks.onAutoRetry(id, name, self._autoRetries[id] + 1);\n            self._onBeforeAutoRetry(id, name);\n\n            self._retryTimeouts[id] = setTimeout(function() {\n                self.log(\"Retrying \" + name + \"...\");\n                self._autoRetries[id]++;\n                self._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);\n\n                if (callback) {\n                    callback(id);\n                }\n                else {\n                    self._handler.retry(id);\n                }\n            }, self._options.retry.autoAttemptDelay * 1000);\n\n            return true;\n        }\n    },\n\n    _shouldAutoRetry: function(id, name, responseJSON) {\n        if (!this._preventRetries[id] && this._options.retry.enableAuto) {\n            if (this._autoRetries[id] === undefined) {\n                this._autoRetries[id] = 0;\n            }\n\n            return this._autoRetries[id] < this._options.retry.maxAutoAttempts;\n        }\n\n        return false;\n    },\n\n    //return false if we should not attempt the requested retry\n    _onBeforeManualRetry: function(id) {\n        var itemLimit = this._options.validation.itemLimit;\n\n        if (this._preventRetries[id]) {\n            this.log(\"Retries are forbidden for id \" + id, 'warn');\n            return false;\n        }\n        else if (this._handler.isValid(id)) {\n            var fileName = this._handler.getName(id);\n\n            if (this._options.callbacks.onManualRetry(id, fileName) === false) {\n                return false;\n            }\n\n            if (itemLimit > 0 && this._netUploadedOrQueued+1 > itemLimit) {\n                this._itemError(\"retryFailTooManyItems\");\n                return false;\n            }\n\n            this.log(\"Retrying upload for '\" + fileName + \"' (id: \" + id + \")...\");\n            return true;\n        }\n        else {\n            this.log(\"'\" + id + \"' is not a valid file ID\", 'error');\n            return false;\n        }\n    },\n\n    /**\n     * Conditionally orders a manual retry of a failed upload.\n     *\n     * @param id File ID of the failed upload\n     * @param callback Optional callback to invoke if a retry is prudent.\n     * In lieu of asking the upload handler to retry.\n     * @returns {boolean} true if a manual retry will occur\n     * @private\n     */\n    _manualRetry: function(id, callback) {\n        if (this._onBeforeManualRetry(id)) {\n            this._netUploadedOrQueued++;\n            this._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);\n\n            if (callback) {\n                callback(id);\n            }\n            else {\n                this._handler.retry(id);\n            }\n\n            return true;\n        }\n    },\n\n    _maybeParseAndSendUploadError: function(id, name, response, xhr) {\n        // Assuming no one will actually set the response code to something other than 200\n        // and still set 'success' to true...\n        if (!response.success){\n            if (xhr && xhr.status !== 200 && !response.error) {\n                this._options.callbacks.onError(id, name, \"XHR returned response code \" + xhr.status, xhr);\n            }\n            else {\n                var errorReason = response.error ? response.error : this._options.text.defaultResponseError;\n                this._options.callbacks.onError(id, name, errorReason, xhr);\n            }\n        }\n    },\n\n    _prepareItemsForUpload: function(items, params, endpoint) {\n        var validationDescriptors = this._getValidationDescriptors(items),\n            buttonId = this._getButtonId(items[0]),\n            button = this._getButton(buttonId);\n\n        this._handleCheckedCallback({\n            name: \"onValidateBatch\",\n            callback: qq.bind(this._options.callbacks.onValidateBatch, this, validationDescriptors, button),\n            onSuccess: qq.bind(this._onValidateBatchCallbackSuccess, this, validationDescriptors, items, params, endpoint, button),\n            identifier: \"batch validation\"\n        });\n    },\n\n    _upload: function(blobOrFileContainer, params, endpoint) {\n        var id = this._handler.add(blobOrFileContainer),\n            name = this._handler.getName(id);\n\n        this._uploadData.added(id);\n\n        if (params) {\n            this.setParams(params, id);\n        }\n\n        if (endpoint) {\n            this.setEndpoint(endpoint, id);\n        }\n\n        this._handleCheckedCallback({\n            name: \"onSubmit\",\n            callback: qq.bind(this._options.callbacks.onSubmit, this, id, name),\n            onSuccess: qq.bind(this._onSubmitCallbackSuccess, this, id, name),\n            onFailure: qq.bind(this._fileOrBlobRejected, this, id, name),\n            identifier: id\n        });\n    },\n\n    _onSubmitCallbackSuccess: function(id, name) {\n        var buttonId;\n\n        this._uploadData.setStatus(id, qq.status.SUBMITTED);\n\n        if (qq.supportedFeatures.ajaxUploading) {\n            buttonId = this._handler.getFile(id).qqButtonId;\n        }\n        else {\n            buttonId = this._getButtonId(this._handler.getInput(id));\n        }\n\n        if (buttonId) {\n            this._buttonIdsForFileIds[id] = buttonId;\n        }\n\n        this._onSubmit.apply(this, arguments);\n        this._onSubmitted.apply(this, arguments);\n        this._options.callbacks.onSubmitted.apply(this, arguments);\n\n        if (this._options.autoUpload) {\n            if (!this._handler.upload(id)) {\n                this._uploadData.setStatus(id, qq.status.QUEUED);\n            }\n        }\n        else {\n            this._storeForLater(id);\n        }\n    },\n\n    _onSubmitted: function(id) {\n        //nothing to do in the base uploader\n    },\n\n    _storeForLater: function(id) {\n        this._storedIds.push(id);\n    },\n\n    _onValidateBatchCallbackSuccess: function(validationDescriptors, items, params, endpoint, button) {\n        var errorMessage,\n            itemLimit = this._options.validation.itemLimit,\n            proposedNetFilesUploadedOrQueued = this._netUploadedOrQueued + validationDescriptors.length;\n\n        if (itemLimit === 0 || proposedNetFilesUploadedOrQueued <= itemLimit) {\n            if (items.length > 0) {\n                this._handleCheckedCallback({\n                    name: \"onValidate\",\n                    callback: qq.bind(this._options.callbacks.onValidate, this, validationDescriptors[0], button),\n                    onSuccess: qq.bind(this._onValidateCallbackSuccess, this, items, 0, params, endpoint),\n                    onFailure: qq.bind(this._onValidateCallbackFailure, this, items, 0, params, endpoint),\n                    identifier: \"Item '\" + items[0].name + \"', size: \" + items[0].size\n                });\n            }\n            else {\n                this._itemError(\"noFilesError\");\n            }\n        }\n        else {\n            errorMessage = this._options.messages.tooManyItemsError\n                .replace(/\\{netItems\\}/g, proposedNetFilesUploadedOrQueued)\n                .replace(/\\{itemLimit\\}/g, itemLimit);\n            this._batchError(errorMessage);\n        }\n    },\n\n    _onValidateCallbackSuccess: function(items, index, params, endpoint) {\n        var nextIndex = index+1,\n            validationDescriptor = this._getValidationDescriptor(items[index]),\n            validItem = false;\n\n        if (this._validateFileOrBlobData(items[index], validationDescriptor)) {\n            validItem = true;\n            this._upload(items[index], params, endpoint);\n        }\n\n        this._maybeProcessNextItemAfterOnValidateCallback(validItem, items, nextIndex, params, endpoint);\n    },\n\n    _onValidateCallbackFailure: function(items, index, params, endpoint) {\n        var nextIndex = index+ 1;\n\n        this._fileOrBlobRejected(undefined, items[0].name);\n\n        this._maybeProcessNextItemAfterOnValidateCallback(false, items, nextIndex, params, endpoint);\n    },\n\n    _maybeProcessNextItemAfterOnValidateCallback: function(validItem, items, index, params, endpoint) {\n        var self = this;\n\n        if (items.length > index) {\n            if (validItem || !this._options.validation.stopOnFirstInvalidFile) {\n                //use setTimeout to prevent a stack overflow with a large number of files in the batch & non-promissory callbacks\n                setTimeout(function() {\n                    var validationDescriptor = self._getValidationDescriptor(items[index]);\n\n                    self._handleCheckedCallback({\n                        name: \"onValidate\",\n                        callback: qq.bind(self._options.callbacks.onValidate, self, items[index]),\n                        onSuccess: qq.bind(self._onValidateCallbackSuccess, self, items, index, params, endpoint),\n                        onFailure: qq.bind(self._onValidateCallbackFailure, self, items, index, params, endpoint),\n                        identifier: \"Item '\" + validationDescriptor.name + \"', size: \" + validationDescriptor.size\n                    });\n                }, 0);\n            }\n        }\n    },\n\n    /**\n     * Performs some internal validation checks on an item, defined in the `validation` option.\n     *\n     * @param item `File`, `Blob`, or `<input type=\"file\">`\n     * @param validationDescriptor Normalized information about the item (`size`, `name`).\n     * @returns {boolean} true if the item is valid\n     * @private\n     */\n    _validateFileOrBlobData: function(item, validationDescriptor) {\n        var name = validationDescriptor.name,\n            size = validationDescriptor.size,\n            buttonId = this._getButtonId(item),\n            extraButtonSpec = this._extraButtonSpecs[buttonId],\n            validationBase = extraButtonSpec ? extraButtonSpec.validation : this._options.validation,\n\n            valid = true;\n\n        if (qq.isFileOrInput(item) && !this._isAllowedExtension(validationBase.allowedExtensions, name)) {\n            this._itemError('typeError', name, item);\n            valid = false;\n\n        }\n        else if (size === 0) {\n            this._itemError('emptyError', name, item);\n            valid = false;\n\n        }\n        else if (size && validationBase.sizeLimit && size > validationBase.sizeLimit) {\n            this._itemError('sizeError', name, item);\n            valid = false;\n\n        }\n        else if (size && size < validationBase.minSizeLimit) {\n            this._itemError('minSizeError', name, item);\n            valid = false;\n        }\n\n        if (!valid) {\n            this._fileOrBlobRejected(undefined, name);\n        }\n\n        return valid;\n    },\n\n    _fileOrBlobRejected: function(id) {\n        if (id !== undefined) {\n            this._uploadData.setStatus(id, qq.status.REJECTED);\n        }\n    },\n\n    /**\n     * Constructs and returns a message that describes an item/file error.  Also calls `onError` callback.\n     *\n     * @param code REQUIRED - a code that corresponds to a stock message describing this type of error\n     * @param maybeNameOrNames names of the items that have failed, if applicable\n     * @param item `File`, `Blob`, or `<input type=\"file\">`\n     * @private\n     */\n    _itemError: function(code, maybeNameOrNames, item) {\n        var message = this._options.messages[code],\n            allowedExtensions = [],\n            names = [].concat(maybeNameOrNames),\n            name = names[0],\n            buttonId = this._getButtonId(item),\n            extraButtonSpec = this._extraButtonSpecs[buttonId],\n            validationBase = extraButtonSpec ? extraButtonSpec.validation : this._options.validation,\n            extensionsForMessage, placeholderMatch;\n\n        function r(name, replacement){ message = message.replace(name, replacement); }\n\n        qq.each(validationBase.allowedExtensions, function(idx, allowedExtension) {\n                /**\n                 * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the\n                 * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.\n                 */\n                if (qq.isString(allowedExtension)) {\n                    allowedExtensions.push(allowedExtension);\n                }\n        });\n\n        extensionsForMessage = allowedExtensions.join(', ').toLowerCase();\n\n        r('{file}', this._options.formatFileName(name));\n        r('{extensions}', extensionsForMessage);\n        r('{sizeLimit}', this._formatSize(validationBase.sizeLimit));\n        r('{minSizeLimit}', this._formatSize(validationBase.minSizeLimit));\n\n        placeholderMatch = message.match(/(\\{\\w+\\})/g);\n        if (placeholderMatch !== null) {\n            qq.each(placeholderMatch, function(idx, placeholder) {\n                r(placeholder, names[idx]);\n            });\n        }\n\n        this._options.callbacks.onError(null, name, message, undefined);\n\n        return message;\n    },\n\n    _batchError: function(message) {\n        this._options.callbacks.onError(null, null, message, undefined);\n    },\n\n    _isAllowedExtension: function(allowed, fileName) {\n        var valid = false;\n\n        if (!allowed.length) {\n            return true;\n        }\n\n        qq.each(allowed, function(idx, allowedExt) {\n            /**\n             * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the\n             * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.\n             */\n            if (qq.isString(allowedExt)) {\n                /*jshint eqeqeq: true, eqnull: true*/\n                var extRegex = new RegExp('\\\\.' + allowedExt + \"$\", 'i');\n\n                if (fileName.match(extRegex) != null) {\n                    valid = true;\n                    return false;\n                }\n            }\n        });\n\n        return valid;\n    },\n\n    _formatSize: function(bytes){\n        var i = -1;\n        do {\n            bytes = bytes / 1000;\n            i++;\n        } while (bytes > 999);\n\n        return Math.max(bytes, 0.1).toFixed(1) + this._options.text.sizeSymbols[i];\n    },\n\n    _wrapCallbacks: function() {\n        var self, safeCallback;\n\n        self = this;\n\n        safeCallback = function(name, callback, args) {\n            try {\n                return callback.apply(self, args);\n            }\n            catch (exception) {\n                self.log(\"Caught exception in '\" + name + \"' callback - \" + exception.message, 'error');\n            }\n        };\n\n        for (var prop in this._options.callbacks) {\n            (function() {\n                var callbackName, callbackFunc;\n                callbackName = prop;\n                callbackFunc = self._options.callbacks[callbackName];\n                self._options.callbacks[callbackName] = function() {\n                    return safeCallback(callbackName, callbackFunc, arguments);\n                };\n            }());\n        }\n    },\n\n    _parseFileOrBlobDataName: function(fileOrBlobData) {\n        var name;\n\n        if (qq.isFileOrInput(fileOrBlobData)) {\n            if (fileOrBlobData.value) {\n                // it is a file input\n                // get input value and remove path to normalize\n                name = fileOrBlobData.value.replace(/.*(\\/|\\\\)/, \"\");\n            } else {\n                // fix missing properties in Safari 4 and firefox 11.0a2\n                name = (fileOrBlobData.fileName !== null && fileOrBlobData.fileName !== undefined) ? fileOrBlobData.fileName : fileOrBlobData.name;\n            }\n        }\n        else {\n            name = fileOrBlobData.name;\n        }\n\n        return name;\n    },\n\n    _parseFileOrBlobDataSize: function(fileOrBlobData) {\n        var size;\n\n        if (qq.isFileOrInput(fileOrBlobData)) {\n            if (fileOrBlobData.value === undefined) {\n                // fix missing properties in Safari 4 and firefox 11.0a2\n                size = (fileOrBlobData.fileSize !== null && fileOrBlobData.fileSize !== undefined) ? fileOrBlobData.fileSize : fileOrBlobData.size;\n            }\n        }\n        else {\n            size = fileOrBlobData.blob.size;\n        }\n\n        return size;\n    },\n\n    _getValidationDescriptor: function(fileOrBlobData) {\n        var fileDescriptor = {},\n            name = this._parseFileOrBlobDataName(fileOrBlobData),\n            size = this._parseFileOrBlobDataSize(fileOrBlobData);\n\n        fileDescriptor.name = name;\n        if (size !== undefined) {\n            fileDescriptor.size = size;\n        }\n\n        return fileDescriptor;\n    },\n\n    _getValidationDescriptors: function(files) {\n        var self = this,\n            fileDescriptors = [];\n\n        qq.each(files, function(idx, file) {\n            fileDescriptors.push(self._getValidationDescriptor(file));\n        });\n\n        return fileDescriptors;\n    },\n\n    _createParamsStore: function(type) {\n        var paramsStore = {},\n            self = this;\n\n        return {\n            setParams: function(params, id) {\n                var paramsCopy = {};\n                qq.extend(paramsCopy, params);\n                paramsStore[id] = paramsCopy;\n            },\n\n            getParams: function(id) {\n                /*jshint eqeqeq: true, eqnull: true*/\n                var paramsCopy = {};\n\n                if (id != null && paramsStore[id]) {\n                    qq.extend(paramsCopy, paramsStore[id]);\n                }\n                else {\n                    qq.extend(paramsCopy, self._options[type].params);\n                }\n\n                return paramsCopy;\n            },\n\n            remove: function(fileId) {\n                return delete paramsStore[fileId];\n            },\n\n            reset: function() {\n                paramsStore = {};\n            }\n        };\n    },\n\n    _createEndpointStore: function(type) {\n        var endpointStore = {},\n        self = this;\n\n        return {\n            setEndpoint: function(endpoint, id) {\n                endpointStore[id] = endpoint;\n            },\n\n            getEndpoint: function(id) {\n                /*jshint eqeqeq: true, eqnull: true*/\n                if (id != null && endpointStore[id]) {\n                    return endpointStore[id];\n                }\n\n                return self._options[type].endpoint;\n            },\n\n            remove: function(fileId) {\n                return delete endpointStore[fileId];\n            },\n\n            reset: function() {\n                endpointStore = {};\n            }\n        };\n    },\n\n    // Allows camera access on either the default or an extra button for iOS devices.\n    _handleCameraAccess: function() {\n        if (this._options.camera.ios && qq.ios()) {\n            var acceptIosCamera = \"image/*;capture=camera\",\n                button = this._options.camera.button,\n                buttonId = button ? this._getButtonId(button) : this._defaultButtonId,\n                optionRoot = buttonId ? this._extraButtonSpecs[buttonId] : this._options;\n\n            // Camera access won't work in iOS if the `multiple` attribute is present on the file input\n            optionRoot.multiple = false;\n\n            // update the options\n            if (optionRoot.validation.acceptFiles === null) {\n                optionRoot.validation.acceptFiles = acceptIosCamera;\n            }\n            else {\n                optionRoot.validation.acceptFiles += \",\" + acceptIosCamera;\n            }\n\n            // update the already-created button\n            qq.each(this._buttons, function(idx, button) {\n                if (button.getButtonId() === buttonId) {\n                    button.setMultiple(optionRoot.multiple);\n                    button.setAcceptFiles(optionRoot.acceptFiles);\n\n                    return false;\n                }\n            });\n        }\n    }\n};\n\nqq.FineUploaderBasic = function(o) {\n    // These options define FineUploaderBasic mode.\n    this._options = {\n        debug: false,\n        button: null,\n        multiple: true,\n        maxConnections: 3,\n        disableCancelForFormUploads: false,\n        autoUpload: true,\n        request: {\n            endpoint: '/server/upload',\n            params: {},\n            paramsInBody: true,\n            customHeaders: {},\n            forceMultipart: true,\n            inputName: 'qqfile',\n            uuidName: 'qquuid',\n            totalFileSizeName: 'qqtotalfilesize',\n            filenameParam: 'qqfilename'\n        },\n        validation: {\n            allowedExtensions: [],\n            sizeLimit: 0,\n            minSizeLimit: 0,\n            itemLimit: 0,\n            stopOnFirstInvalidFile: true,\n            acceptFiles: null\n        },\n        callbacks: {\n            onSubmit: function(id, name){},\n            onSubmitted: function(id, name){},\n            onComplete: function(id, name, responseJSON, maybeXhr){},\n            onCancel: function(id, name){},\n            onUpload: function(id, name){},\n            onUploadChunk: function(id, name, chunkData){},\n            onResume: function(id, fileName, chunkData){},\n            onProgress: function(id, name, loaded, total){},\n            onError: function(id, name, reason, maybeXhrOrXdr) {},\n            onAutoRetry: function(id, name, attemptNumber) {},\n            onManualRetry: function(id, name) {},\n            onValidateBatch: function(fileOrBlobData) {},\n            onValidate: function(fileOrBlobData) {},\n            onSubmitDelete: function(id) {},\n            onDelete: function(id){},\n            onDeleteComplete: function(id, xhrOrXdr, isError){},\n            onPasteReceived: function(blob) {},\n            onStatusChange: function(id, oldStatus, newStatus) {}\n        },\n        messages: {\n            typeError: \"{file} has an invalid extension. Valid extension(s): {extensions}.\",\n            sizeError: \"{file} is too large, maximum file size is {sizeLimit}.\",\n            minSizeError: \"{file} is too small, minimum file size is {minSizeLimit}.\",\n            emptyError: \"{file} is empty, please select files again without it.\",\n            noFilesError: \"No files to upload.\",\n            tooManyItemsError: \"Too many items ({netItems}) would be uploaded.  Item limit is {itemLimit}.\",\n            retryFailTooManyItems: \"Retry failed - you have reached your file limit.\",\n            onLeave: \"The files are being uploaded, if you leave now the upload will be cancelled.\"\n        },\n        retry: {\n            enableAuto: false,\n            maxAutoAttempts: 3,\n            autoAttemptDelay: 5,\n            preventRetryResponseProperty: 'preventRetry'\n        },\n        classes: {\n            buttonHover: 'qq-upload-button-hover',\n            buttonFocus: 'qq-upload-button-focus'\n        },\n        chunking: {\n            enabled: false,\n            partSize: 2000000,\n            paramNames: {\n                partIndex: 'qqpartindex',\n                partByteOffset: 'qqpartbyteoffset',\n                chunkSize: 'qqchunksize',\n                totalFileSize: 'qqtotalfilesize',\n                totalParts: 'qqtotalparts'\n            }\n        },\n        resume: {\n            enabled: false,\n            id: null,\n            cookiesExpireIn: 7, //days\n            paramNames: {\n                resuming: \"qqresume\"\n            }\n        },\n        formatFileName: function(fileOrBlobName) {\n            if (fileOrBlobName !== undefined && fileOrBlobName.length > 33) {\n                fileOrBlobName = fileOrBlobName.slice(0, 19) + '...' + fileOrBlobName.slice(-14);\n            }\n            return fileOrBlobName;\n        },\n        text: {\n            defaultResponseError: \"Upload failure reason unknown\",\n            sizeSymbols: ['kB', 'MB', 'GB', 'TB', 'PB', 'EB']\n        },\n        deleteFile : {\n            enabled: false,\n            method: \"DELETE\",\n            endpoint: '/server/upload',\n            customHeaders: {},\n            params: {}\n        },\n        cors: {\n            expected: false,\n            sendCredentials: false,\n            allowXdr: false\n        },\n        blobs: {\n            defaultName: 'misc_data'\n        },\n        paste: {\n            targetElement: null,\n            defaultName: 'pasted_image'\n        },\n        camera: {\n            ios: false,\n\n            // if ios is true: button is null means target the default button, otherwise target the button specified\n            button: null\n        },\n\n        // This refers to additional upload buttons to be handled by Fine Uploader.\n        // Each element is an object, containing `element` as the only required\n        // property.  The `element` must be a container that will ultimately\n        // contain an invisible `<input type=\"file\">` created by Fine Uploader.\n        // Optional properties of each object include `multiple`, `validation`,\n        // and `folders`.\n        extraButtons: []\n    };\n\n    // Replace any default options with user defined ones\n    qq.extend(this._options, o, true);\n\n    this._buttons = [];\n    this._extraButtonSpecs = {};\n    this._buttonIdsForFileIds = [];\n\n    this._wrapCallbacks();\n    this._disposeSupport =  new qq.DisposeSupport();\n\n    this._storedIds = [];\n    this._autoRetries = [];\n    this._retryTimeouts = [];\n    this._preventRetries = [];\n    this._thumbnailUrls = [];\n\n    this._netUploadedOrQueued = 0;\n    this._netUploaded = 0;\n    this._uploadData = this._createUploadDataTracker();\n\n    this._paramsStore = this._createParamsStore(\"request\");\n    this._deleteFileParamsStore = this._createParamsStore(\"deleteFile\");\n\n    this._endpointStore = this._createEndpointStore(\"request\");\n    this._deleteFileEndpointStore = this._createEndpointStore(\"deleteFile\");\n\n    this._handler = this._createUploadHandler();\n\n    this._deleteHandler = qq.DeleteFileAjaxRequestor && this._createDeleteHandler();\n\n    if (this._options.button) {\n        this._defaultButtonId = this._createUploadButton({element: this._options.button}).getButtonId();\n    }\n\n    this._generateExtraButtonSpecs();\n\n    this._handleCameraAccess();\n\n    if (this._options.paste.targetElement) {\n        if (qq.PasteSupport) {\n            this._pasteHandler = this._createPasteHandler();\n        }\n        else {\n            qq.log(\"Paste support module not found\", \"info\");\n        }\n    }\n\n    this._preventLeaveInProgress();\n\n    this._imageGenerator = qq.ImageGenerator && new qq.ImageGenerator(qq.bind(this.log, this));\n};\n\n// Define the private & public API methods.\nqq.FineUploaderBasic.prototype = qq.basePublicApi;\nqq.extend(qq.FineUploaderBasic.prototype, qq.basePrivateApi);\n\n/** Generic class for sending non-upload ajax requests and handling the associated responses **/\n/*globals qq, XMLHttpRequest*/\nqq.AjaxRequestor = function (o) {\n    \"use strict\";\n\n    var log, shouldParamsBeInQueryString,\n        queue = [],\n        requestData = [],\n        options = {\n            validMethods: ['POST'],\n            method: 'POST',\n            contentType: \"application/x-www-form-urlencoded\",\n            maxConnections: 3,\n            customHeaders: {},\n            endpointStore: {},\n            paramsStore: {},\n            mandatedParams: {},\n            successfulResponseCodes: {\n                \"DELETE\": [200, 202, 204],\n                \"POST\": [200, 204]\n            },\n            cors: {\n                expected: false,\n                sendCredentials: false\n            },\n            log: function (str, level) {},\n            onSend: function (id) {},\n            onComplete: function (id, xhrOrXdr, isError) {},\n            onCancel: function (id) {}\n        };\n\n    qq.extend(options, o);\n    log = options.log;\n\n        // TODO remove code duplication among all ajax requesters\n    if (qq.indexOf(options.validMethods, getNormalizedMethod()) < 0) {\n        throw new Error(\"'\" + getNormalizedMethod() + \"' is not a supported method for this type of request!\");\n    }\n\n    // TODO remove code duplication among all ajax requesters\n    function getNormalizedMethod() {\n        return options.method.toUpperCase();\n    }\n\n    // [Simple methods](http://www.w3.org/TR/cors/#simple-method)\n    // are defined by the W3C in the CORS spec as a list of methods that, in part,\n    // make a CORS request eligible to be exempt from preflighting.\n    function isSimpleMethod() {\n        return qq.indexOf([\"GET\", \"POST\", \"HEAD\"], getNormalizedMethod()) >= 0;\n    }\n\n    // [Simple headers](http://www.w3.org/TR/cors/#simple-header)\n    // are defined by the W3C in the CORS spec as a list of headers that, in part,\n    // make a CORS request eligible to be exempt from preflighting.\n    function containsNonSimpleHeaders(headers) {\n        var containsNonSimple = false;\n\n        qq.each(containsNonSimple, function(idx, header) {\n            if (qq.indexOf([\"Accept\", \"Accept-Language\", \"Content-Language\", \"Content-Type\"], header) < 0) {\n                containsNonSimple = true;\n                return false;\n            }\n        });\n\n        return containsNonSimple;\n    }\n\n    function isXdr(xhr) {\n        //The `withCredentials` test is a commonly accepted way to determine if XHR supports CORS.\n        return options.cors.expected && xhr.withCredentials === undefined;\n    }\n\n    // Returns either a new `XMLHttpRequest` or `XDomainRequest` instance.\n    function getCorsAjaxTransport() {\n        var xhrOrXdr;\n\n        if (window.XMLHttpRequest || window.ActiveXObject) {\n            xhrOrXdr = qq.createXhrInstance();\n\n            if (xhrOrXdr.withCredentials === undefined) {\n                xhrOrXdr = new XDomainRequest();\n            }\n        }\n\n        return xhrOrXdr;\n    }\n\n    // Returns either a new XHR/XDR instance, or an existing one for the associated `File` or `Blob`.\n    function getXhrOrXdr(id, dontCreateIfNotExist) {\n        var xhrOrXdr = requestData[id].xhr;\n\n        if (!xhrOrXdr && !dontCreateIfNotExist) {\n            if (options.cors.expected) {\n                xhrOrXdr = getCorsAjaxTransport();\n            }\n            else {\n                xhrOrXdr = qq.createXhrInstance();\n            }\n\n            requestData[id].xhr = xhrOrXdr;\n        }\n\n        return xhrOrXdr;\n    }\n\n    // Removes element from queue, sends next request\n    function dequeue(id) {\n        var i = qq.indexOf(queue, id),\n            max = options.maxConnections,\n            nextId;\n\n        delete requestData[id];\n        queue.splice(i, 1);\n\n        if (queue.length >= max && i < max) {\n            nextId = queue[max - 1];\n            sendRequest(nextId);\n        }\n    }\n\n    function onComplete(id, xdrError) {\n        var xhr = getXhrOrXdr(id),\n            method = getNormalizedMethod(),\n            isError = xdrError === true;\n\n        dequeue(id);\n\n        if (isError) {\n            log(method + \" request for \" + id + \" has failed\", \"error\");\n        }\n        else if (!isXdr(xhr) && !isResponseSuccessful(xhr.status)) {\n            isError = true;\n            log(method + \" request for \" + id + \" has failed - response code \" + xhr.status, \"error\");\n        }\n\n        options.onComplete(id, xhr, isError);\n    }\n\n    function getParams(id) {\n        var onDemandParams = requestData[id].onDemandParams,\n            mandatedParams = options.mandatedParams,\n            params;\n\n        if (options.paramsStore.getParams) {\n            params = options.paramsStore.getParams(id);\n        }\n\n        if (onDemandParams) {\n            qq.each(onDemandParams, function (name, val) {\n                params = params || {};\n                params[name] = val;\n            });\n        }\n\n        if (mandatedParams) {\n            qq.each(mandatedParams, function (name, val) {\n                params = params || {};\n                params[name] = val;\n            });\n        }\n\n        return params;\n    }\n\n    function sendRequest(id) {\n        var xhr = getXhrOrXdr(id),\n            method = getNormalizedMethod(),\n            params = getParams(id),\n            body = requestData[id].body,\n            url;\n\n        options.onSend(id);\n\n        url = createUrl(id, params);\n\n        // XDR and XHR status detection APIs differ a bit.\n        if (isXdr(xhr)) {\n            xhr.onload = getXdrLoadHandler(id);\n            xhr.onerror = getXdrErrorHandler(id);\n        }\n        else {\n            xhr.onreadystatechange = getXhrReadyStateChangeHandler(id);\n        }\n\n        // The last parameter is assumed to be ignored if we are actually using `XDomainRequest`.\n        xhr.open(method, url, true);\n\n        // Instruct the transport to send cookies along with the CORS request,\n        // unless we are using `XDomainRequest`, which is not capable of this.\n        if (options.cors.expected && options.cors.sendCredentials && !isXdr(xhr)) {\n            xhr.withCredentials = true;\n        }\n\n        setHeaders(id);\n\n        log('Sending ' + method + \" request for \" + id);\n\n        if (body) {\n            xhr.send(body)\n        }\n        else if (shouldParamsBeInQueryString || !params) {\n            xhr.send();\n        }\n        else if (params && options.contentType.toLowerCase().indexOf(\"application/x-www-form-urlencoded\") >= 0) {\n            xhr.send(qq.obj2url(params, \"\"));\n        }\n        else if (params && options.contentType.toLowerCase().indexOf(\"application/json\") >= 0) {\n            xhr.send(JSON.stringify(params));\n        }\n        else {\n            xhr.send(params);\n        }\n    }\n\n    function createUrl(id, params) {\n        var endpoint = options.endpointStore.getEndpoint(id),\n            addToPath = requestData[id].addToPath;\n\n        if (addToPath != undefined) {\n            endpoint += \"/\" + addToPath;\n        }\n\n        if (shouldParamsBeInQueryString && params) {\n            return qq.obj2url(params, endpoint);\n        }\n        else {\n            return endpoint;\n        }\n    }\n\n    // Invoked by the UA to indicate a number of possible states that describe\n    // a live `XMLHttpRequest` transport.\n    function getXhrReadyStateChangeHandler(id) {\n        return function () {\n            if (getXhrOrXdr(id).readyState === 4) {\n                onComplete(id);\n            }\n        };\n    }\n\n    // This will be called by IE to indicate **success** for an associated\n    // `XDomainRequest` transported request.\n    function getXdrLoadHandler(id) {\n        return function () {\n            onComplete(id);\n        }\n    }\n\n    // This will be called by IE to indicate **failure** for an associated\n    // `XDomainRequest` transported request.\n    function getXdrErrorHandler(id) {\n        return function () {\n            onComplete(id, true);\n        }\n    }\n\n    function setHeaders(id) {\n        var xhr = getXhrOrXdr(id),\n            customHeaders = options.customHeaders,\n            onDemandHeaders = requestData[id].additionalHeaders || {},\n            method = getNormalizedMethod(),\n            allHeaders = {};\n\n        // If this is a CORS request and a simple method with simple headers are used\n        // on an `XMLHttpRequest`, exclude these specific non-simple headers\n        // in an attempt to prevent preflighting.  `XDomainRequest` does not support setting\n        // request headers, so we will take this into account as well.\n        if (isXdr(xhr)) {\n            if (!options.cors.expected || (!isSimpleMethod() || containsNonSimpleHeaders(customHeaders))) {\n                xhr.setRequestHeader(\"X-Requested-With\", \"XMLHttpRequest\");\n                xhr.setRequestHeader(\"Cache-Control\", \"no-cache\");\n            }\n        }\n\n        // Note that we can't set the Content-Type when using this transport XDR, and it is\n        // not relevant unless we will be including the params in the payload.\n        if (options.contentType && (method === \"POST\" || method === \"PUT\") && !isXdr(xhr)) {\n            xhr.setRequestHeader(\"Content-Type\", options.contentType);\n        }\n\n        // `XDomainRequest` doesn't allow you to set any headers.\n        if (!isXdr(xhr)) {\n            qq.extend(allHeaders, customHeaders);\n            qq.extend(allHeaders, onDemandHeaders);\n\n            qq.each(allHeaders, function (name, val) {\n                xhr.setRequestHeader(name, val);\n            });\n        }\n    }\n\n    function cancelRequest(id) {\n        var xhr = getXhrOrXdr(id, true),\n            method = getNormalizedMethod();\n\n        if (xhr) {\n            // The event handlers we remove/unregister is dependant on whether we are\n            // using `XDomainRequest` or `XMLHttpRequest`.\n            if (isXdr(xhr)) {\n                xhr.onerror = null;\n                xhr.onload = null;\n            }\n            else {\n                xhr.onreadystatechange = null;\n            }\n\n            xhr.abort();\n            dequeue(id);\n\n            log('Cancelled ' + method + \" for \" + id);\n            options.onCancel(id);\n\n            return true;\n        }\n\n        return false;\n    }\n\n    function isResponseSuccessful(responseCode) {\n        return qq.indexOf(options.successfulResponseCodes[getNormalizedMethod()], responseCode) >= 0;\n    }\n\n    shouldParamsBeInQueryString = getNormalizedMethod() === 'GET' || getNormalizedMethod() === 'DELETE';\n\n    return {\n        send: function (id, addToPath, onDemandParams, onDemandHeaders, body) {\n            requestData[id] = {\n                addToPath: addToPath,\n                onDemandParams: onDemandParams,\n                additionalHeaders: onDemandHeaders,\n                body: body\n            };\n\n            var len = queue.push(id);\n\n            // if too many active connections, wait...\n            if (len <= options.maxConnections) {\n                sendRequest(id);\n            }\n        },\n\n        cancel: function (id) {\n            return cancelRequest(id);\n        },\n\n        getMethod: function() {\n            return getNormalizedMethod();\n        }\n    };\n};\n\n/*globals qq*/\n/**\n * Base upload handler module.  Delegates to more specific handlers.\n *\n * @param o Options.  Passed along to the specific handler submodule as well.\n * @param namespace [optional] Namespace for the specific handler.\n */\nqq.UploadHandler = function(o, namespace) {\n    \"use strict\";\n\n    var queue = [],\n        options, log, handlerImpl, api;\n\n    // Default options, can be overridden by the user\n    options = {\n        debug: false,\n        forceMultipart: true,\n        paramsInBody: false,\n        paramsStore: {},\n        endpointStore: {},\n        filenameParam: 'qqfilename',\n        cors: {\n            expected: false,\n            sendCredentials: false\n        },\n        maxConnections: 3, // maximum number of concurrent uploads\n        uuidParam: 'qquuid',\n        totalFileSizeParam: 'qqtotalfilesize',\n        chunking: {\n            enabled: false,\n            partSize: 2000000, //bytes\n            paramNames: {\n                partIndex: 'qqpartindex',\n                partByteOffset: 'qqpartbyteoffset',\n                chunkSize: 'qqchunksize',\n                totalParts: 'qqtotalparts',\n                filename: 'qqfilename'\n            }\n        },\n        resume: {\n            enabled: false,\n            id: null,\n            cookiesExpireIn: 7, //days\n            paramNames: {\n                resuming: \"qqresume\"\n            }\n        },\n        log: function(str, level) {},\n        onProgress: function(id, fileName, loaded, total){},\n        onComplete: function(id, fileName, response, xhr){},\n        onCancel: function(id, fileName){},\n        onUpload: function(id, fileName){},\n        onUploadChunk: function(id, fileName, chunkData){},\n        onAutoRetry: function(id, fileName, response, xhr){},\n        onResume: function(id, fileName, chunkData){},\n        onUuidChanged: function(id, newUuid){}\n\n    };\n    qq.extend(options, o);\n\n    log = options.log;\n\n    /**\n     * Removes element from queue, starts upload of next\n     */\n    function dequeue(id) {\n        var i = qq.indexOf(queue, id),\n            max = options.maxConnections,\n            nextId;\n\n        if (i >= 0) {\n            queue.splice(i, 1);\n\n            if (queue.length >= max && i < max){\n                nextId = queue[max-1];\n                handlerImpl.upload(nextId);\n            }\n        }\n    }\n\n    function cancelSuccess(id) {\n        log('Cancelling ' + id);\n        options.paramsStore.remove(id);\n        dequeue(id);\n    }\n\n    function determineHandlerImpl() {\n        var handlerType = namespace ? qq[namespace] : qq,\n            handlerModuleSubtype = qq.supportedFeatures.ajaxUploading ? \"Xhr\" : \"Form\";\n\n        handlerImpl = new handlerType[\"UploadHandler\" + handlerModuleSubtype](options, dequeue, options.onUuidChanged, log);\n    }\n\n\n    api = {\n        /**\n         * Adds file or file input to the queue\n         * @returns id\n         **/\n        add: function(file){\n            return handlerImpl.add(file);\n        },\n        /**\n         * Sends the file identified by id\n         */\n        upload: function(id){\n            var len = queue.push(id);\n\n            // if too many active uploads, wait...\n            if (len <= options.maxConnections){\n                handlerImpl.upload(id);\n                return true;\n            }\n\n            return false;\n        },\n        retry: function(id) {\n            var i = qq.indexOf(queue, id);\n            if (i >= 0) {\n                return handlerImpl.upload(id, true);\n            }\n            else {\n                return this.upload(id);\n            }\n        },\n        /**\n         * Cancels file upload by id\n         */\n        cancel: function(id) {\n            var cancelRetVal = handlerImpl.cancel(id);\n\n            if (qq.isPromise(cancelRetVal)) {\n                cancelRetVal.then(function() {\n                    cancelSuccess(id);\n                });\n            }\n            else if (cancelRetVal !== false) {\n                cancelSuccess(id);\n            }\n        },\n        /**\n         * Cancels all queued or in-progress uploads\n         */\n        cancelAll: function() {\n            var self = this,\n                queueCopy = [];\n\n            qq.extend(queueCopy, queue);\n            qq.each(queueCopy, function(idx, fileId) {\n                self.cancel(fileId);\n            });\n\n            queue = [];\n        },\n        /**\n         * Returns name of the file identified by id\n         */\n        getName: function(id) {\n            return handlerImpl.getName(id);\n        },\n        // Update/change the name of the associated file.\n        // This updated name should be sent as a parameter.\n        setName: function(id, newName) {\n            handlerImpl.setName(id, newName);\n        },\n        /**\n         * Returns size of the file identified by id\n         */\n        getSize: function(id){\n            if (handlerImpl.getSize) {\n                return handlerImpl.getSize(id);\n            }\n        },\n        getFile: function(id) {\n            if (handlerImpl.getFile) {\n                return handlerImpl.getFile(id);\n            }\n        },\n        getInput: function(id) {\n            if (handlerImpl.getInput) {\n                return handlerImpl.getInput(id);\n            }\n        },\n        reset: function() {\n            log('Resetting upload handler');\n            api.cancelAll();\n            queue = [];\n            handlerImpl.reset();\n        },\n        expunge: function(id) {\n            return handlerImpl.expunge(id);\n        },\n        getUuid: function(id) {\n            return handlerImpl.getUuid(id);\n        },\n        setUuid: function(id, newUuid) {\n            return handlerImpl.setUuid(id, newUuid);\n        },\n        /**\n         * Determine if the file exists.\n         */\n        isValid: function(id) {\n            return handlerImpl.isValid(id);\n        },\n        getResumableFilesData: function() {\n            if (handlerImpl.getResumableFilesData) {\n                return handlerImpl.getResumableFilesData();\n            }\n            return [];\n        },\n        /**\n         * This may or may not be implemented, depending on the handler.  For handlers where a third-party ID is\n         * available (such as the \"key\" for Amazon S3), this will return that value.  Otherwise, the return value\n         * will be undefined.\n         *\n         * @param id Internal file ID\n         * @returns {*} Some identifier used by a 3rd-party service involved in the upload process\n         */\n        getThirdPartyFileId: function(id) {\n            if (handlerImpl.getThirdPartyFileId && api.isValid(id)) {\n                return handlerImpl.getThirdPartyFileId(id);\n            }\n        }\n    };\n\n    determineHandlerImpl();\n\n    return api;\n};\n\n/**\n * Common APIs exposed to creators of upload via form/iframe handlers.  This is reused and possibly overridden\n * in some cases by specific form upload handlers.\n *\n * @param internalApi Object that will be filled with internal API methods\n * @param fileState An array containing objects that describe files tracked by the XHR upload handler.\n * @param isCors true if we should expect the response to come from a different origin.\n * @param inputName Name of the file input field/parameter.\n * @param onCancel Invoked when a request is handled to cancel an in-progress upload.  Invoked before the upload is actually cancelled.\n * @param onUuidChanged Callback to be invoked when the internal UUID is altered.\n * @param log Method used to send messages to the log.\n * @returns {} Various methods\n * @constructor\n */\nqq.UploadHandlerFormApi = function(internalApi, fileState, isCors, inputName, onCancel, onUuidChanged, log) {\n    \"use strict\";\n\n    var formHandlerInstanceId = qq.getUniqueId(),\n        corsMessageReceiver = new qq.WindowReceiveMessage({log: log}),\n        onloadCallbacks = {},\n        detachLoadEvents = {},\n        postMessageCallbackTimers = {},\n        publicApi;\n\n\n    /**\n     * Remove any trace of the file from the handler.\n     *\n     * @param id ID of the associated file\n     */\n    function expungeFile(id) {\n        delete detachLoadEvents[id];\n        delete fileState[id];\n\n        // If we are dealing with CORS, we might still be waiting for a response from a loaded iframe.\n        // In that case, terminate the timer waiting for a message from the loaded iframe\n        // and stop listening for any more messages coming from this iframe.\n        if (isCors) {\n            clearTimeout(postMessageCallbackTimers[id]);\n            delete postMessageCallbackTimers[id];\n            corsMessageReceiver.stopReceivingMessages(id);\n        }\n\n        var iframe = document.getElementById(internalApi.getIframeName(id));\n        if (iframe) {\n            // To cancel request set src to something else.  We use src=\"javascript:false;\"\n            // because it doesn't trigger ie6 prompt on https\n            iframe.setAttribute('src', 'java' + String.fromCharCode(115) + 'cript:false;'); //deal with \"JSLint: javascript URL\" warning, which apparently cannot be turned off\n\n            qq(iframe).remove();\n        }\n    }\n\n    /**\n     * If we are in CORS mode, we must listen for messages (containing the server response) from the associated\n     * iframe, since we cannot directly parse the content of the iframe due to cross-origin restrictions.\n     *\n     * @param iframe Listen for messages on this iframe.\n     * @param callback Invoke this callback with the message from the iframe.\n     */\n    function registerPostMessageCallback(iframe, callback) {\n        var iframeName = iframe.id,\n            fileId = getFileIdForIframeName(iframeName),\n            uuid = fileState[fileId].uuid;\n\n        onloadCallbacks[uuid] = callback;\n\n        // When the iframe has loaded (after the server responds to an upload request)\n        // declare the attempt a failure if we don't receive a valid message shortly after the response comes in.\n        detachLoadEvents[fileId] = qq(iframe).attach('load', function() {\n            if (fileState[fileId].input) {\n                log(\"Received iframe load event for CORS upload request (iframe name \" + iframeName + \")\");\n\n                postMessageCallbackTimers[iframeName] = setTimeout(function() {\n                    var errorMessage = \"No valid message received from loaded iframe for iframe name \" + iframeName;\n                    log(errorMessage, \"error\");\n                    callback({\n                        error: errorMessage\n                    });\n                }, 1000);\n            }\n        });\n\n        // Listen for messages coming from this iframe.  When a message has been received, cancel the timer\n        // that declares the upload a failure if a message is not received within a reasonable amount of time.\n        corsMessageReceiver.receiveMessage(iframeName, function(message) {\n            log(\"Received the following window message: '\" + message + \"'\");\n            var fileId = getFileIdForIframeName(iframeName),\n                response = internalApi.parseJsonResponse(fileId, message),\n                uuid = response.uuid,\n                onloadCallback;\n\n            if (uuid && onloadCallbacks[uuid]) {\n                log(\"Handling response for iframe name \" + iframeName);\n                clearTimeout(postMessageCallbackTimers[iframeName]);\n                delete postMessageCallbackTimers[iframeName];\n\n                internalApi.detachLoadEvent(iframeName);\n\n                onloadCallback = onloadCallbacks[uuid];\n\n                delete onloadCallbacks[uuid];\n                corsMessageReceiver.stopReceivingMessages(iframeName);\n                onloadCallback(response);\n            }\n            else if (!uuid) {\n                log(\"'\" + message + \"' does not contain a UUID - ignoring.\");\n            }\n        });\n    }\n\n    /**\n     * Generates an iframe to be used as a target for upload-related form submits.  This also adds the iframe\n     * to the current `document`.  Note that the iframe is hidden from view.\n     *\n     * @param name Name of the iframe.\n     * @returns {HTMLIFrameElement} The created iframe\n     */\n    function initIframeForUpload(name) {\n        var iframe = qq.toElement('<iframe src=\"javascript:false;\" name=\"' + name + '\" />');\n\n        iframe.setAttribute('id', name);\n\n        iframe.style.display = 'none';\n        document.body.appendChild(iframe);\n\n        return iframe;\n    }\n\n    /**\n     * @param iframeName `document`-unique Name of the associated iframe\n     * @returns {*} ID of the associated file\n     */\n    function getFileIdForIframeName(iframeName) {\n        return iframeName.split(\"_\")[0];\n    }\n\n\n// INTERNAL API\n\n    qq.extend(internalApi, {\n        /**\n         * @param fileId ID of the associated file\n         * @returns {string} The `document`-unique name of the iframe\n         */\n        getIframeName: function(fileId) {\n            return fileId + \"_\" + formHandlerInstanceId;\n        },\n\n        /**\n         * Creates an iframe with a specific document-unique name.\n         *\n         * @param id ID of the associated file\n         * @returns {HTMLIFrameElement}\n         */\n        createIframe: function(id) {\n            var iframeName = internalApi.getIframeName(id);\n\n            return initIframeForUpload(iframeName);\n        },\n\n        /**\n         * @param id ID of the associated file\n         * @param innerHtmlOrMessage JSON message\n         * @returns {*} The parsed response, or an empty object if the response could not be parsed\n         */\n        parseJsonResponse: function(id, innerHtmlOrMessage) {\n            var response;\n\n            try {\n                response = qq.parseJson(innerHtmlOrMessage);\n\n                if (response.newUuid !== undefined) {\n                    publicApi.setUuid(id, response.newUuid);\n                }\n            }\n            catch(error) {\n                log('Error when attempting to parse iframe upload response (' + error.message + ')', 'error');\n                response = {};\n            }\n\n            return response;\n        },\n\n        /**\n         * Generates a form element and appends it to the `document`.  When the form is submitted, a specific iframe is targeted.\n         * The name of the iframe is passed in as a property of the spec parameter, and must be unique in the `document`.  Note\n         * that the form is hidden from view.\n         *\n         * @param spec An object containing various properties to be used when constructing the form.  Required properties are\n         * currently: `method`, `endpoint`, `params`, `paramsInBody`, and `targetName`.\n         * @returns {HTMLFormElement} The created form\n         */\n        initFormForUpload: function(spec) {\n            var method = spec.method,\n                endpoint = spec.endpoint,\n                params = spec.params,\n                paramsInBody = spec.paramsInBody,\n                targetName = spec.targetName,\n                form = qq.toElement('<form method=\"' + method + '\" enctype=\"multipart/form-data\"></form>'),\n                url = endpoint;\n\n            if (paramsInBody) {\n                qq.obj2Inputs(params, form);\n            }\n            else {\n                url = qq.obj2url(params, endpoint);\n            }\n\n            form.setAttribute('action', url);\n            form.setAttribute('target', targetName);\n            form.style.display = 'none';\n            document.body.appendChild(form);\n\n            return form;\n        },\n\n        /**\n         * This function either delegates to a more specific message handler if CORS is involved,\n         * or simply registers a callback when the iframe has been loaded that invokes the passed callback\n         * after determining if the content of the iframe is accessible.\n         *\n         * @param iframe Associated iframe\n         * @param callback Callback to invoke after we have determined if the iframe content is accessible.\n         */\n        attachLoadEvent: function(iframe, callback) {\n            /*jslint eqeq: true*/\n            var responseDescriptor;\n\n            if (isCors) {\n                registerPostMessageCallback(iframe, callback);\n            }\n            else {\n                detachLoadEvents[iframe.id] = qq(iframe).attach('load', function(){\n                    log('Received response for ' + iframe.id);\n\n                    // when we remove iframe from dom\n                    // the request stops, but in IE load\n                    // event fires\n                    if (!iframe.parentNode){\n                        return;\n                    }\n\n                    try {\n                        // fixing Opera 10.53\n                        if (iframe.contentDocument &&\n                            iframe.contentDocument.body &&\n                            iframe.contentDocument.body.innerHTML == \"false\"){\n                            // In Opera event is fired second time\n                            // when body.innerHTML changed from false\n                            // to server response approx. after 1 sec\n                            // when we upload file with iframe\n                            return;\n                        }\n                    }\n                    catch (error) {\n                        //IE may throw an \"access is denied\" error when attempting to access contentDocument on the iframe in some cases\n                        log('Error when attempting to access iframe during handling of upload response (' + error.message + \")\", 'error');\n                        responseDescriptor = {success: false};\n                    }\n\n                    callback(responseDescriptor);\n                });\n            }\n        },\n\n        /**\n         * Called when we are no longer interested in being notified when an iframe has loaded.\n         *\n         * @param id Associated file ID\n         */\n        detachLoadEvent: function(id) {\n            if (detachLoadEvents[id] !== undefined) {\n                detachLoadEvents[id]();\n                delete detachLoadEvents[id];\n            }\n        }\n    });\n\n\n// PUBLIC API\n\n    publicApi = {\n        add: function(fileInput) {\n            var id = fileState.push({input: fileInput}) - 1;\n\n            fileInput.setAttribute('name', inputName);\n\n            fileState[id].uuid = qq.getUniqueId();\n\n            // remove file input from DOM\n            if (fileInput.parentNode){\n                qq(fileInput).remove();\n            }\n\n            return id;\n        },\n\n        getName: function(id) {\n            /*jslint regexp: true*/\n\n            if (fileState[id].newName !== undefined) {\n                return fileState[id].newName;\n            }\n            else if (publicApi.isValid(id)) {\n                // get input value and remove path to normalize\n                return fileState[id].input.value.replace(/.*(\\/|\\\\)/, \"\");\n            }\n            else {\n                log(id + \" is not a valid item ID.\", \"error\");\n            }\n        },\n\n        getInput: function(id) {\n            return fileState[id].input;\n        },\n\n        setName: function(id, newName) {\n            fileState[id].newName = newName;\n        },\n\n        isValid: function(id) {\n            return fileState[id] !== undefined\n                && fileState[id].input !== undefined;\n        },\n\n        reset: function() {\n            fileState.length = 0;\n        },\n\n        expunge: function(id) {\n            return expungeFile(id);\n        },\n\n        getUuid: function(id) {\n            return fileState[id].uuid;\n        },\n\n        cancel: function(id) {\n            var onCancelRetVal = onCancel(id, publicApi.getName(id));\n\n            if (qq.isPromise(onCancelRetVal)) {\n                return onCancelRetVal.then(function() {\n                    publicApi.expunge(id);\n                });\n            }\n            else if (onCancelRetVal !== false) {\n                publicApi.expunge(id);\n                return true;\n            }\n\n            return false;\n        },\n\n        upload: function(id) {\n            // implementation-specific\n        },\n\n        setUuid: function(id, newUuid) {\n            log(\"Server requested UUID change from '\" + fileState[id].uuid + \"' to '\" + newUuid + \"'\");\n            fileState[id].uuid = newUuid;\n            onUuidChanged(id, newUuid);\n        }\n    };\n\n    return publicApi;\n};\n\n/**\n * Common API exposed to creators of XHR handlers.  This is reused and possibly overriding in some cases by specific\n * XHR upload handlers.\n *\n * @param internalApi Object that will be filled with internal API methods\n * @param fileState An array containing objects that describe files tracked by the XHR upload handler.\n * @param chunking Properties that describe chunking option values.  Null if chunking is not enabled or possible.\n * @param onUpload Used to call the specific XHR upload handler when an upload has been request.\n * @param onCancel Invoked when a request is handled to cancel an in-progress upload.  Invoked before the upload is actually cancelled.\n * @param onUuidChanged Callback to be invoked when the internal UUID is altered.\n * @param log Method used to send messages to the log.\n * @returns Various methods\n * @constructor\n */\nqq.UploadHandlerXhrApi = function(internalApi, fileState, chunking, onUpload, onCancel, onUuidChanged, log) {\n    \"use strict\";\n\n    var publicApi;\n\n\n    function getChunk(fileOrBlob, startByte, endByte) {\n        if (fileOrBlob.slice) {\n            return fileOrBlob.slice(startByte, endByte);\n        }\n        else if (fileOrBlob.mozSlice) {\n            return fileOrBlob.mozSlice(startByte, endByte);\n        }\n        else if (fileOrBlob.webkitSlice) {\n            return fileOrBlob.webkitSlice(startByte, endByte);\n        }\n    }\n\n    qq.extend(internalApi, {\n        /**\n         * Creates an XHR instance for this file and stores it in the fileState.\n         *\n         * @param id File ID\n         * @returns {XMLHttpRequest}\n         */\n        createXhr: function(id) {\n            var xhr = qq.createXhrInstance();\n\n            fileState[id].xhr = xhr;\n\n            return xhr;\n        },\n\n        /**\n         * @param id ID of the associated file\n         * @returns {number} Number of parts this file can be divided into, or undefined if chunking is not supported in this UA\n         */\n        getTotalChunks: function(id) {\n            if (chunking) {\n                var fileSize = publicApi.getSize(id),\n                    chunkSize = chunking.partSize;\n\n                return Math.ceil(fileSize / chunkSize);\n            }\n        },\n\n        getChunkData: function(id, chunkIndex) {\n            var chunkSize = chunking.partSize,\n                fileSize = publicApi.getSize(id),\n                fileOrBlob = publicApi.getFile(id),\n                startBytes = chunkSize * chunkIndex,\n                endBytes = startBytes+chunkSize >= fileSize ? fileSize : startBytes+chunkSize,\n                totalChunks = internalApi.getTotalChunks(id);\n\n            return {\n                part: chunkIndex,\n                start: startBytes,\n                end: endBytes,\n                count: totalChunks,\n                blob: getChunk(fileOrBlob, startBytes, endBytes),\n                size: endBytes - startBytes\n            };\n        },\n\n        getChunkDataForCallback: function(chunkData) {\n            return {\n                partIndex: chunkData.part,\n                startByte: chunkData.start + 1,\n                endByte: chunkData.end,\n                totalParts: chunkData.count\n            };\n        }\n    });\n\n    publicApi = {\n        /**\n         * Adds File or Blob to the queue\n         * Returns id to use with upload, cancel\n         **/\n        add: function(fileOrBlobData){\n            var id,\n                uuid = qq.getUniqueId();\n\n            if (qq.isFile(fileOrBlobData)) {\n                id = fileState.push({file: fileOrBlobData}) - 1;\n            }\n            else if (qq.isBlob(fileOrBlobData.blob)) {\n                id = fileState.push({blobData: fileOrBlobData}) - 1;\n            }\n            else {\n                throw new Error('Passed obj in not a File or BlobData (in qq.UploadHandlerXhr)');\n            }\n\n            fileState[id].uuid = uuid;\n\n            return id;\n        },\n\n        getName: function(id) {\n            if (publicApi.isValid(id)) {\n                var file = fileState[id].file,\n                    blobData = fileState[id].blobData,\n                    newName = fileState[id].newName;\n\n                if (newName !== undefined) {\n                    return newName;\n                }\n                else if (file) {\n                    // fix missing name in Safari 4\n                    //NOTE: fixed missing name firefox 11.0a2 file.fileName is actually undefined\n                    return (file.fileName !== null && file.fileName !== undefined) ? file.fileName : file.name;\n                }\n                else {\n                    return blobData.name;\n                }\n            }\n            else {\n                log(id + \" is not a valid item ID.\", \"error\");\n            }\n        },\n\n        setName: function(id, newName) {\n            fileState[id].newName = newName;\n        },\n\n        getSize: function(id) {\n            /*jshint eqnull: true*/\n            var fileOrBlob = fileState[id].file || fileState[id].blobData.blob;\n\n            if (qq.isFileOrInput(fileOrBlob)) {\n                return fileOrBlob.fileSize != null ? fileOrBlob.fileSize : fileOrBlob.size;\n            }\n            else {\n                return fileOrBlob.size;\n            }\n        },\n\n        getFile: function(id) {\n            if (fileState[id]) {\n                return fileState[id].file || fileState[id].blobData.blob;\n            }\n        },\n\n        isValid: function(id) {\n            return fileState[id] !== undefined;\n        },\n\n        reset: function() {\n            fileState.length = 0;\n        },\n\n        expunge: function(id) {\n            var xhr = fileState[id].xhr;\n\n            if (xhr) {\n                xhr.onreadystatechange = null;\n                xhr.abort();\n            }\n\n            delete fileState[id];\n        },\n\n        getUuid: function(id) {\n            return fileState[id].uuid;\n        },\n\n        /**\n         * Sends the file identified by id to the server\n         */\n        upload: function(id, retry) {\n            return onUpload(id, retry);\n        },\n\n        cancel: function(id) {\n            var onCancelRetVal = onCancel(id, publicApi.getName(id));\n\n            if (qq.isPromise(onCancelRetVal)) {\n                return onCancelRetVal.then(function() {\n                    publicApi.expunge(id);\n                });\n            }\n            else if (onCancelRetVal !== false) {\n                publicApi.expunge(id);\n                return true;\n            }\n\n            return false;\n        },\n\n        setUuid: function(id, newUuid) {\n            log(\"Server requested UUID change from '\" + fileState[id].uuid + \"' to '\" + newUuid + \"'\");\n            fileState[id].uuid = newUuid;\n            onUuidChanged(id, newUuid);\n        }\n    };\n\n    return publicApi;\n};\n\nqq.WindowReceiveMessage = function(o) {\n    var options = {\n            log: function(message, level) {}\n        },\n        callbackWrapperDetachers = {};\n\n    qq.extend(options, o);\n\n    return {\n        receiveMessage : function(id, callback) {\n            var onMessageCallbackWrapper = function(event) {\n                    callback(event.data);\n                };\n\n            if (window.postMessage) {\n                callbackWrapperDetachers[id] = qq(window).attach(\"message\", onMessageCallbackWrapper);\n            }\n            else {\n                log(\"iframe message passing not supported in this browser!\", \"error\");\n            }\n        },\n\n        stopReceivingMessages : function(id) {\n            if (window.postMessage) {\n                var detacher = callbackWrapperDetachers[id];\n                if (detacher) {\n                    detacher();\n                }\n            }\n        }\n    };\n};\n\n/**\n * Defines the public API for FineUploader mode.\n */\nqq.uiPublicApi = {\n    clearStoredFiles: function() {\n        this._parent.prototype.clearStoredFiles.apply(this, arguments);\n        this._templating.clearFiles();\n    },\n\n    addExtraDropzone: function(element){\n        this._dnd && this._dnd.setupExtraDropzone(element);\n    },\n\n    removeExtraDropzone: function(element){\n        if (this._dnd) {\n            return this._dnd.removeDropzone(element);\n        }\n    },\n\n    getItemByFileId: function(id) {\n        return this._templating.getFileContainer(id);\n    },\n\n    reset: function() {\n        this._parent.prototype.reset.apply(this, arguments);\n        this._templating.reset();\n\n        if (!this._options.button && this._templating.getButton()) {\n            this._defaultButtonId = this._createUploadButton({element: this._templating.getButton()}).getButtonId();\n        }\n\n        if (this._dnd) {\n            this._dnd.dispose();\n            this._dnd = this._setupDragAndDrop();\n        }\n\n        this._totalFilesInBatch = 0;\n        this._filesInBatchAddedToUi = 0;\n\n        this._setupClickAndEditEventHandlers();\n    }\n};\n\n\n\n\n/**\n * Defines the private (internal) API for FineUploader mode.\n */\nqq.uiPrivateApi = {\n    _getButton: function(buttonId) {\n        var button = this._parent.prototype._getButton.apply(this, arguments);\n\n        if (!button) {\n            if (buttonId === this._defaultButtonId) {\n                button = this._templating.getButton();\n            }\n        }\n\n        return button;\n    },\n\n    _removeFileItem: function(fileId) {\n        this._templating.removeFile(fileId);\n    },\n\n    _setupClickAndEditEventHandlers: function() {\n        this._deleteRetryOrCancelClickHandler = qq.DeleteRetryOrCancelClickHandler && this._bindDeleteRetryOrCancelClickEvent();\n\n        // A better approach would be to check specifically for focusin event support by querying the DOM API,\n        // but the DOMFocusIn event is not exposed as a property, so we have to resort to UA string sniffing.\n        this._focusinEventSupported = !qq.firefox();\n\n        if (this._isEditFilenameEnabled())\n        {\n            this._filenameClickHandler = this._bindFilenameClickEvent();\n            this._filenameInputFocusInHandler = this._bindFilenameInputFocusInEvent();\n            this._filenameInputFocusHandler = this._bindFilenameInputFocusEvent();\n        }\n    },\n\n    _setupDragAndDrop: function() {\n        var self = this,\n            dropZoneElements = this._options.dragAndDrop.extraDropzones,\n            templating = this._templating,\n            defaultDropZone = templating.getDropZone();\n\n        defaultDropZone && dropZoneElements.push(defaultDropZone);\n\n        return new qq.DragAndDrop({\n            dropZoneElements: dropZoneElements,\n            allowMultipleItems: this._options.multiple,\n            classes: {\n                dropActive: this._options.classes.dropActive\n            },\n            callbacks: {\n                processingDroppedFiles: function() {\n                    templating.showDropProcessing();\n                },\n                processingDroppedFilesComplete: function(files) {\n                    templating.hideDropProcessing();\n\n                    if (files) {\n                        self.addFiles(files);\n                    }\n                },\n                dropError: function(code, errorData) {\n                    self._itemError(code, errorData);\n                },\n                dropLog: function(message, level) {\n                    self.log(message, level);\n                }\n            }\n        });\n    },\n\n    _bindDeleteRetryOrCancelClickEvent: function() {\n        var self = this;\n\n        return new qq.DeleteRetryOrCancelClickHandler({\n            templating: this._templating,\n            log: function(message, lvl) {\n                self.log(message, lvl);\n            },\n            onDeleteFile: function(fileId) {\n                self.deleteFile(fileId);\n            },\n            onCancel: function(fileId) {\n                self.cancel(fileId);\n            },\n            onRetry: function(fileId) {\n                qq(self._templating.getFileContainer(fileId)).removeClass(self._classes.retryable);\n                self.retry(fileId);\n            },\n            onGetName: function(fileId) {\n                return self.getName(fileId);\n            }\n        });\n    },\n\n    _isEditFilenameEnabled: function() {\n        return this._templating.isEditFilenamePossible()\n            && !this._options.autoUpload\n            && qq.FilenameClickHandler\n            && qq.FilenameInputFocusHandler\n            && qq.FilenameInputFocusHandler;\n    },\n\n    _filenameEditHandler: function() {\n        var self = this,\n            templating = this._templating;\n\n        return {\n            templating: templating,\n            log: function(message, lvl) {\n                self.log(message, lvl);\n            },\n            onGetUploadStatus: function(fileId) {\n                return self.getUploads({id: fileId}).status;\n            },\n            onGetName: function(fileId) {\n                return self.getName(fileId);\n            },\n            onSetName: function(id, newName) {\n                var formattedFilename = self._options.formatFileName(newName);\n\n                templating.updateFilename(id, formattedFilename);\n                self.setName(id, newName);\n            },\n            onEditingStatusChange: function(id, isEditing) {\n                var qqInput = qq(templating.getEditInput(id)),\n                    qqFileContainer = qq(templating.getFileContainer(id));\n\n                if (isEditing) {\n                    qqInput.addClass('qq-editing');\n                    templating.hideFilename(id);\n                    templating.hideEditIcon(id);\n                }\n                else {\n                    qqInput.removeClass('qq-editing');\n                    templating.showFilename(id);\n                    templating.showEditIcon(id);\n                }\n\n                // Force IE8 and older to repaint\n                qqFileContainer.addClass('qq-temp').removeClass('qq-temp');\n            }\n        };\n    },\n\n    _onUploadStatusChange: function(id, oldStatus, newStatus) {\n        if (this._isEditFilenameEnabled()) {\n            // Status for a file exists before it has been added to the DOM, so we must be careful here.\n            if (this._templating.getFileContainer(id) && newStatus !== qq.status.SUBMITTED) {\n                this._templating.markFilenameEditable(id);\n                this._templating.hideEditIcon(id);\n            }\n        }\n    },\n\n    _bindFilenameInputFocusInEvent: function() {\n        var spec = qq.extend({}, this._filenameEditHandler());\n\n        return new qq.FilenameInputFocusInHandler(spec);\n    },\n\n    _bindFilenameInputFocusEvent: function() {\n        var spec = qq.extend({}, this._filenameEditHandler());\n\n        return new qq.FilenameInputFocusHandler(spec);\n    },\n\n    _bindFilenameClickEvent: function() {\n        var spec = qq.extend({}, this._filenameEditHandler());\n\n        return new qq.FilenameClickHandler(spec);\n    },\n\n    _storeForLater: function(id) {\n        this._parent.prototype._storeForLater.apply(this, arguments);\n        this._templating.hideSpinner(id);\n    },\n\n    _onSubmit: function(id, name) {\n        this._parent.prototype._onSubmit.apply(this, arguments);\n        this._addToList(id, name);\n    },\n\n    // The file item has been added to the DOM.\n    _onSubmitted: function(id) {\n        // If the edit filename feature is enabled, mark the filename element as \"editable\" and the associated edit icon\n        if (this._isEditFilenameEnabled()) {\n            this._templating.markFilenameEditable(id);\n            this._templating.showEditIcon(id);\n\n            // If the focusin event is not supported, we must add a focus handler to the newly create edit filename text input\n            if (!this._focusinEventSupported) {\n                this._filenameInputFocusHandler.addHandler(this._templating.getEditInput(id));\n            }\n        }\n    },\n\n    // Update the progress bar & percentage as the file is uploaded\n    _onProgress: function(id, name, loaded, total){\n        this._parent.prototype._onProgress.apply(this, arguments);\n\n        this._templating.updateProgress(id, loaded, total);\n\n        if (loaded === total) {\n            this._templating.hideCancel(id);\n\n            this._templating.setStatusText(id, this._options.text.waitingForResponse);\n\n            // If last byte was sent, display total file size\n            this._displayFileSize(id);\n        }\n        else {\n            // If still uploading, display percentage - total size is actually the total request(s) size\n            this._displayFileSize(id, loaded, total);\n        }\n    },\n\n    _onComplete: function(id, name, result, xhr) {\n        var parentRetVal = this._parent.prototype._onComplete.apply(this, arguments),\n            templating = this._templating,\n            self = this;\n\n        function completeUpload(result) {\n            templating.setStatusText(id);\n\n            qq(templating.getFileContainer(id)).removeClass(self._classes.retrying);\n            templating.hideProgress(id);\n\n            if (!self._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {\n                templating.hideCancel(id);\n            }\n            templating.hideSpinner(id);\n\n            if (result.success) {\n                if (self._isDeletePossible()) {\n                    templating.showDelete(id);\n                }\n\n                qq(templating.getFileContainer(id)).addClass(self._classes.success);\n\n                self._maybeUpdateThumbnail(id);\n            }\n            else {\n                qq(templating.getFileContainer(id)).addClass(self._classes.fail);\n\n                if (self._templating.isRetryPossible() && !self._preventRetries[id]) {\n                    qq(templating.getFileContainer(id)).addClass(self._classes.retryable);\n                }\n                self._controlFailureTextDisplay(id, result);\n            }\n        }\n\n        // The parent may need to perform some async operation before we can accurately determine the status of the upload.\n        if (qq.isPromise(parentRetVal)) {\n            parentRetVal.done(function(newResult) {\n                completeUpload(newResult);\n            });\n\n        }\n        else {\n            completeUpload(result);\n        }\n\n        return parentRetVal;\n    },\n\n    _onUpload: function(id, name){\n        var parentRetVal = this._parent.prototype._onUpload.apply(this, arguments);\n\n        this._templating.showSpinner(id);\n\n        return parentRetVal;\n    },\n\n    _onCancel: function(id, name) {\n        this._parent.prototype._onCancel.apply(this, arguments);\n        this._removeFileItem(id);\n    },\n\n    _onBeforeAutoRetry: function(id) {\n        var retryNumForDisplay, maxAuto, retryNote;\n\n        this._parent.prototype._onBeforeAutoRetry.apply(this, arguments);\n\n        this._showCancelLink(id);\n        this._templating.hideProgress(id);\n\n        if (this._options.retry.showAutoRetryNote) {\n            retryNumForDisplay = this._autoRetries[id] + 1;\n            maxAuto = this._options.retry.maxAutoAttempts;\n\n            retryNote = this._options.retry.autoRetryNote.replace(/\\{retryNum\\}/g, retryNumForDisplay);\n            retryNote = retryNote.replace(/\\{maxAuto\\}/g, maxAuto);\n\n            this._templating.setStatusText(id, retryNote);\n            qq(this._templating.getFileContainer(id)).addClass(this._classes.retrying);\n        }\n    },\n\n    //return false if we should not attempt the requested retry\n    _onBeforeManualRetry: function(id) {\n        if (this._parent.prototype._onBeforeManualRetry.apply(this, arguments)) {\n            this._templating.resetProgress(id);\n            qq(this._templating.getFileContainer(id)).removeClass(this._classes.fail);\n            this._templating.setStatusText(id);\n            this._templating.showSpinner(id);\n            this._showCancelLink(id);\n            return true;\n        }\n        else {\n            qq(this._templating.getFileContainer(id)).addClass(this._classes.retryable);\n            return false;\n        }\n    },\n\n    _onSubmitDelete: function(id) {\n        var onSuccessCallback = qq.bind(this._onSubmitDeleteSuccess, this);\n\n        this._parent.prototype._onSubmitDelete.call(this, id, onSuccessCallback);\n    },\n\n    _onSubmitDeleteSuccess: function(id, uuid, additionalMandatedParams) {\n        if (this._options.deleteFile.forceConfirm) {\n            this._showDeleteConfirm.apply(this, arguments);\n        }\n        else {\n            this._sendDeleteRequest.apply(this, arguments);\n        }\n    },\n\n    _onDeleteComplete: function(id, xhr, isError) {\n        this._parent.prototype._onDeleteComplete.apply(this, arguments);\n\n        this._templating.hideSpinner(id);\n\n        if (isError) {\n            this._templating.setStatusText(id, this._options.deleteFile.deletingFailedText);\n            this._templating.showDelete(id);\n        }\n        else {\n            this._removeFileItem(id);\n        }\n    },\n\n    _sendDeleteRequest: function(id, uuid, additionalMandatedParams) {\n        this._templating.hideDelete(id);\n        this._templating.showSpinner(id);\n        this._templating.setStatusText(id, this._options.deleteFile.deletingStatusText);\n        this._deleteHandler.sendDelete.apply(this, arguments);\n    },\n\n    _showDeleteConfirm: function(id, uuid, mandatedParams) {\n        var fileName = this._handler.getName(id),\n            confirmMessage = this._options.deleteFile.confirmMessage.replace(/\\{filename\\}/g, fileName),\n            uuid = this.getUuid(id),\n            deleteRequestArgs = arguments,\n            self = this,\n            retVal;\n\n        retVal = this._options.showConfirm(confirmMessage);\n\n        if (qq.isPromise(retVal)) {\n            retVal.then(function () {\n                self._sendDeleteRequest.apply(self, deleteRequestArgs);\n            });\n        }\n        else if (retVal !== false) {\n            self._sendDeleteRequest.apply(self, deleteRequestArgs);\n        }\n    },\n\n    _addToList: function(id, name) {\n        var prependData,\n            prependIndex = 0;\n\n        if (this._options.disableCancelForFormUploads && !qq.supportedFeatures.ajaxUploading) {\n            this._templating.disableCancel();\n        }\n\n        if (this._options.display.prependFiles) {\n            if (this._totalFilesInBatch > 1 && this._filesInBatchAddedToUi > 0) {\n                prependIndex = this._filesInBatchAddedToUi - 1;\n            }\n\n            prependData = {\n                index: prependIndex\n            }\n        }\n\n        if (!this._options.multiple) {\n            this._handler.cancelAll();\n            this._clearList();\n        }\n\n        this._templating.addFile(id, this._options.formatFileName(name), prependData);\n        this._templating.generatePreview(id, this.getFile(id));\n\n        this._filesInBatchAddedToUi += 1;\n\n        if (this._options.display.fileSizeOnSubmit && qq.supportedFeatures.ajaxUploading) {\n            this._displayFileSize(id);\n        }\n    },\n\n    _clearList: function(){\n        this._templating.clearFiles();\n        this.clearStoredFiles();\n    },\n\n    _displayFileSize: function(id, loadedSize, totalSize) {\n        var size = this.getSize(id),\n            sizeForDisplay = this._formatSize(size);\n\n        if (loadedSize !== undefined && totalSize !== undefined) {\n            sizeForDisplay = this._formatProgress(loadedSize, totalSize);\n        }\n\n        this._templating.updateSize(id, sizeForDisplay);\n    },\n\n    _formatProgress: function (uploadedSize, totalSize) {\n        var message = this._options.text.formatProgress;\n        function r(name, replacement) { message = message.replace(name, replacement); }\n\n        r('{percent}', Math.round(uploadedSize / totalSize * 100));\n        r('{total_size}', this._formatSize(totalSize));\n        return message;\n    },\n\n    _controlFailureTextDisplay: function(id, response) {\n        var mode, maxChars, responseProperty, failureReason, shortFailureReason;\n\n        mode = this._options.failedUploadTextDisplay.mode;\n        maxChars = this._options.failedUploadTextDisplay.maxChars;\n        responseProperty = this._options.failedUploadTextDisplay.responseProperty;\n\n        if (mode === 'custom') {\n            failureReason = response[responseProperty];\n            if (failureReason) {\n                if (failureReason.length > maxChars) {\n                    shortFailureReason = failureReason.substring(0, maxChars) + '...';\n                }\n            }\n            else {\n                failureReason = this._options.text.failUpload;\n                this.log(\"'\" + responseProperty + \"' is not a valid property on the server response.\", 'warn');\n            }\n\n            this._templating.setStatusText(id, shortFailureReason || failureReason);\n\n            if (this._options.failedUploadTextDisplay.enableTooltip) {\n                this._showTooltip(id, failureReason);\n            }\n        }\n        else if (mode === 'default') {\n            this._templating.setStatusText(id, this._options.text.failUpload);\n        }\n        else if (mode !== 'none') {\n            this.log(\"failedUploadTextDisplay.mode value of '\" + mode + \"' is not valid\", 'warn');\n        }\n    },\n\n    _showTooltip: function(id, text) {\n        this._templating.getFileContainer(id).title = text;\n    },\n\n    _showCancelLink: function(id) {\n        if (!this._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {\n            this._templating.showCancel(id);\n        }\n    },\n\n    _itemError: function(code, name, item) {\n        var message = this._parent.prototype._itemError.apply(this, arguments);\n        this._options.showMessage(message);\n    },\n\n    _batchError: function(message) {\n        this._parent.prototype._batchError.apply(this, arguments);\n        this._options.showMessage(message);\n    },\n\n    _setupPastePrompt: function() {\n        var self = this;\n\n        this._options.callbacks.onPasteReceived = function() {\n            var message = self._options.paste.namePromptMessage,\n                defaultVal = self._options.paste.defaultName;\n\n            return self._options.showPrompt(message, defaultVal);\n        };\n    },\n\n    _fileOrBlobRejected: function(id, name) {\n        this._totalFilesInBatch -= 1;\n        this._parent.prototype._fileOrBlobRejected.apply(this, arguments);\n    },\n\n    _prepareItemsForUpload: function(items, params, endpoint) {\n        this._totalFilesInBatch = items.length;\n        this._filesInBatchAddedToUi = 0;\n        this._parent.prototype._prepareItemsForUpload.apply(this, arguments);\n    },\n\n    _maybeUpdateThumbnail: function(fileId) {\n        var thumbnailUrl = this._thumbnailUrls[fileId];\n\n        this._templating.updateThumbnail(fileId, thumbnailUrl);\n    }\n};\n\n/**\n * This defines FineUploader mode, which is a default UI w/ drag & drop uploading.\n */\nqq.FineUploader = function(o, namespace) {\n    // By default this should inherit instance data from FineUploaderBasic, but this can be overridden\n    // if the (internal) caller defines a different parent.  The parent is also used by\n    // the private and public API functions that need to delegate to a parent function.\n    this._parent = namespace ? qq[namespace].FineUploaderBasic : qq.FineUploaderBasic;\n    this._parent.apply(this, arguments);\n\n    // Options provided by FineUploader mode\n    qq.extend(this._options, {\n        element: null,\n\n        button: null,\n\n        listElement: null,\n\n        dragAndDrop: {\n            extraDropzones: []\n        },\n\n        text: {\n            formatProgress: \"{percent}% of {total_size}\",\n            failUpload: \"Upload failed\",\n            waitingForResponse: \"Processing...\"\n        },\n\n        template: \"qq-template\",\n\n        classes: {\n            retrying: 'qq-upload-retrying',\n            retryable: 'qq-upload-retryable',\n            success: 'qq-upload-success',\n            fail: 'qq-upload-fail',\n            editable: 'qq-editable',\n            hide: \"qq-hide\",\n            dropActive: 'qq-upload-drop-area-active'\n        },\n\n        failedUploadTextDisplay: {\n            mode: 'default', //default, custom, or none\n            maxChars: 50,\n            responseProperty: 'error',\n            enableTooltip: true\n        },\n\n        messages: {\n            tooManyFilesError: \"You may only drop one file\",\n            unsupportedBrowser: \"Unrecoverable error - this browser does not permit file uploading of any kind.\"\n        },\n\n        retry: {\n            showAutoRetryNote: true,\n            autoRetryNote: \"Retrying {retryNum}/{maxAuto}...\"\n        },\n\n        deleteFile: {\n            forceConfirm: false,\n            confirmMessage: \"Are you sure you want to delete {filename}?\",\n            deletingStatusText: \"Deleting...\",\n            deletingFailedText: \"Delete failed\"\n\n        },\n\n        display: {\n            fileSizeOnSubmit: false,\n            prependFiles: false\n        },\n\n        paste: {\n            promptForName: false,\n            namePromptMessage: \"Please name this image\"\n        },\n\n        thumbnails: {\n            placeholders: {\n                waitUntilResponse: false,\n                notAvailablePath: null,\n                waitingPath: null\n            }\n        },\n\n        showMessage: function(message){\n            setTimeout(function() {\n                window.alert(message);\n            }, 0);\n        },\n\n        showConfirm: function(message) {\n            return window.confirm(message);\n        },\n\n        showPrompt: function(message, defaultValue) {\n            return window.prompt(message, defaultValue);\n        }\n    }, true);\n\n    // Replace any default options with user defined ones\n    qq.extend(this._options, o, true);\n\n    this._templating = new qq.Templating({\n        log: qq.bind(this.log, this),\n        templateIdOrEl: this._options.template,\n        containerEl: this._options.element,\n        fileContainerEl: this._options.listElement,\n        button: this._options.button,\n        imageGenerator: this._imageGenerator,\n        classes: {\n            hide: this._options.classes.hide,\n            editable: this._options.classes.editable\n        },\n        placeholders: {\n            waitUntilUpdate: this._options.thumbnails.placeholders.waitUntilResponse,\n            thumbnailNotAvailable: this._options.thumbnails.placeholders.notAvailablePath,\n            waitingForThumbnail: this._options.thumbnails.placeholders.waitingPath\n        }\n    });\n\n    if (!qq.supportedFeatures.uploading || (this._options.cors.expected && !qq.supportedFeatures.uploadCors)) {\n        this._templating.renderFailure(this._options.messages.unsupportedBrowser);\n    }\n    else {\n        this._wrapCallbacks();\n\n        this._templating.render();\n\n        this._classes = this._options.classes;\n\n        if (!this._options.button && this._templating.getButton()) {\n            this._defaultButtonId = this._createUploadButton({element: this._templating.getButton()}).getButtonId();\n        }\n\n        this._setupClickAndEditEventHandlers();\n\n        if (qq.DragAndDrop && qq.supportedFeatures.fileDrop) {\n            this._dnd = this._setupDragAndDrop();\n        }\n\n        if (this._options.paste.targetElement && this._options.paste.promptForName) {\n            if (qq.PasteSupport) {\n                this._setupPastePrompt();\n            }\n            else {\n                qq.log(\"Paste support module not found.\", \"info\");\n            }\n        }\n\n        this._totalFilesInBatch = 0;\n        this._filesInBatchAddedToUi = 0;\n    }\n};\n\n// Inherit the base public & private API methods\nqq.extend(qq.FineUploader.prototype, qq.basePublicApi);\nqq.extend(qq.FineUploader.prototype, qq.basePrivateApi);\n\n// Add the FineUploader/default UI public & private UI methods, which may override some base methods.\nqq.extend(qq.FineUploader.prototype, qq.uiPublicApi);\nqq.extend(qq.FineUploader.prototype, qq.uiPrivateApi);\n\n/**\n * Module responsible for rendering all Fine Uploader UI templates.  This module also asserts at least\n * a limited amount of control over the template elements after they are added to the DOM.\n * Wherever possible, this module asserts total control over template elements present in the DOM.\n *\n * @param spec Specification object used to control various templating behaviors\n * @returns various API methods\n * @constructor\n */\nqq.Templating = function(spec) {\n    \"use strict\";\n\n    var FILE_ID_ATTR = \"qq-file-id\",\n        FILE_CLASS_PREFIX = \"qq-file-id-\",\n        THUMBNAIL_MAX_SIZE_ATTR = \"qq-max-size\",\n        PREVIEW_GENERATED_ATTR = \"qq-preview-generated\",\n        THUMBNAIL_SERVER_SCALE_ATTR = \"qq-server-scale\",\n        // This variable is duplicated in the DnD module since it can function as a standalone as well\n        HIDE_DROPZONE_ATTR = \"qq-hide-dropzone\",\n        isCancelDisabled = false,\n        thumbnailMaxSize = -1,\n        options = {\n            log: null,\n            templateIdOrEl: \"qq-template\",\n            containerEl: null,\n            fileContainerEl: null,\n            button: null,\n            imageGenerator: null,\n            classes: {\n                hide: \"qq-hide\",\n                editable: \"qq-editable\"\n            },\n            placeholders: {\n                waitUntilUpdate: false,\n                thumbnailNotAvailable: null,\n                waitingForThumbnail: null\n            }\n        },\n        selectorClasses = {\n            button: 'qq-upload-button-selector',\n            drop: 'qq-upload-drop-area-selector',\n            list: 'qq-upload-list-selector',\n            progressBarContainer: \"qq-progress-bar-container-selector\",\n            progressBar: 'qq-progress-bar-selector',\n            file: 'qq-upload-file-selector',\n            spinner: 'qq-upload-spinner-selector',\n            size: 'qq-upload-size-selector',\n            cancel: 'qq-upload-cancel-selector',\n            deleteButton: 'qq-upload-delete-selector',\n            retry: 'qq-upload-retry-selector',\n            statusText: 'qq-upload-status-text-selector',\n            editFilenameInput: 'qq-edit-filename-selector',\n            editNameIcon: 'qq-edit-filename-icon-selector',\n            dropProcessing: 'qq-drop-processing-selector',\n            dropProcessingSpinner: 'qq-drop-processing-spinner-selector',\n            thumbnail: 'qq-thumbnail-selector'\n        },\n        log,\n        api,\n        isEditElementsExist,\n        isRetryElementExist,\n        templateHtml,\n        container,\n        fileList,\n        showThumbnails,\n        serverScale,\n        cachedThumbnailNotAvailableImg,\n        cachedWaitingForThumbnailImg;\n\n    /**\n     * Grabs the HTML from the script tag holding the template markup.  This function will also adjust\n     * some internally-tracked state variables based on the contents of the template.\n     * The template is filtered so that irrelevant elements (such as the drop zone if DnD is not supported)\n     * are omitted from the DOM.  Useful errors will be thrown if the template cannot be parsed.\n     *\n     * @returns {{template: *, fileTemplate: *}} HTML for the top-level file items templates\n     */\n    function parseAndGetTemplate() {\n        var scriptEl,\n            scriptHtml,\n            fileListNode,\n            tempTemplateEl,\n            fileListHtml,\n            defaultButton,\n            dropArea,\n            thumbnail,\n            dropProcessing;\n\n        log(\"Parsing template\");\n\n        if (options.templateIdOrEl == null) {\n            throw new Error(\"You MUST specify either a template element or ID!\");\n        }\n\n        // Grab the contents of the script tag holding the template.\n        if (qq.isString(options.templateIdOrEl)) {\n            scriptEl = document.getElementById(options.templateIdOrEl);\n\n            if (scriptEl === null) {\n                throw new Error(qq.format(\"Cannot find template script at ID '{}'!\", options.templateIdOrEl));\n            }\n\n            scriptHtml = scriptEl.innerHTML;\n        }\n        else {\n            if (options.templateIdOrEl.innerHTML === undefined) {\n                throw new Error(\"You have specified an invalid value for the template option!  \" +\n                    \"It must be an ID or an Element.\");\n            }\n\n            scriptHtml = options.templateIdOrEl.innerHTML;\n        }\n\n        scriptHtml = qq.trimStr(scriptHtml);\n        tempTemplateEl = document.createElement(\"div\");\n        tempTemplateEl.appendChild(qq.toElement(scriptHtml));\n\n        // Don't include the default template button in the DOM\n        // if an alternate button container has been specified.\n        if (options.button) {\n            defaultButton = qq(tempTemplateEl).getByClass(selectorClasses.button)[0];\n            if (defaultButton) {\n                qq(defaultButton).remove();\n            }\n        }\n\n        // Omit the drop processing element from the DOM if DnD is not supported by the UA.\n        // NOTE: We are consciously not removing the drop zone if the UA doesn't support DnD\n        // to support layouts where the drop zone is also a container for visible elements,\n        // such as the file list.\n        if (!qq.DragAndDrop || !qq.supportedFeatures.fileDrop) {\n            dropProcessing = qq(tempTemplateEl).getByClass(selectorClasses.dropProcessing)[0];\n            if (dropProcessing) {\n                qq(dropProcessing).remove();\n            }\n\n        }\n\n        dropArea = qq(tempTemplateEl).getByClass(selectorClasses.drop)[0];\n\n        // If DnD is not available then remove\n        // it from the DOM as well.\n        if (dropArea && !qq.DragAndDrop) {\n            qq.log(\"DnD module unavailable.\", \"info\");\n            qq(dropArea).remove();\n        }\n\n        // If there is a drop area defined in the template, and the current UA doesn't support DnD,\n        // and the drop area is marked as \"hide before enter\", ensure it is hidden as the DnD module\n        // will not do this (since we will not be loading the DnD module)\n        if (dropArea\n            && !qq.supportedFeatures.fileDrop\n            && qq(dropArea).hasAttribute(HIDE_DROPZONE_ATTR)) {\n\n            qq(dropArea).css({\n                display: \"none\"\n            });\n        }\n\n        // Ensure the `showThumbnails` flag is only set if the thumbnail element\n        // is present in the template AND the current UA is capable of generating client-side previews.\n        thumbnail = qq(tempTemplateEl).getByClass(selectorClasses.thumbnail)[0];\n        if (!showThumbnails) {\n            thumbnail && qq(thumbnail).remove();\n        }\n        else if (thumbnail) {\n            thumbnailMaxSize = parseInt(thumbnail.getAttribute(THUMBNAIL_MAX_SIZE_ATTR));\n            // Only enforce max size if the attr value is non-zero\n            thumbnailMaxSize = thumbnailMaxSize > 0 ? thumbnailMaxSize : null;\n\n            serverScale = qq(thumbnail).hasAttribute(THUMBNAIL_SERVER_SCALE_ATTR);\n        }\n        showThumbnails = showThumbnails && thumbnail;\n\n        isEditElementsExist = qq(tempTemplateEl).getByClass(selectorClasses.editFilenameInput).length > 0;\n        isRetryElementExist = qq(tempTemplateEl).getByClass(selectorClasses.retry).length > 0;\n\n        fileListNode = qq(tempTemplateEl).getByClass(selectorClasses.list)[0];\n        if (fileListNode == null) {\n            throw new Error(\"Could not find the file list container in the template!\");\n        }\n\n        fileListHtml = fileListNode.innerHTML;\n        fileListNode.innerHTML = \"\";\n\n       log(\"Template parsing complete\");\n\n        return {\n            template: qq.trimStr(tempTemplateEl.innerHTML),\n            fileTemplate: qq.trimStr(fileListHtml)\n        }\n    }\n\n    function getFile(id) {\n        return qq(fileList).getByClass(FILE_CLASS_PREFIX + id)[0];\n    }\n\n    function getTemplateEl(context, cssClass) {\n        return qq(context).getByClass(cssClass)[0];\n    }\n\n    function prependFile(el, index) {\n        var parentEl = fileList,\n            beforeEl = parentEl.firstChild;\n\n        if (index > 0) {\n            beforeEl = qq(parentEl).children()[index].nextSibling;\n\n        }\n\n        parentEl.insertBefore(el, beforeEl);\n    }\n\n    function getCancel(id) {\n        return getTemplateEl(getFile(id), selectorClasses.cancel);\n    }\n\n    function getProgress(id) {\n        return getTemplateEl(getFile(id), selectorClasses.progressBarContainer) ||\n            getTemplateEl(getFile(id), selectorClasses.progressBar);\n    }\n\n    function getSpinner(id) {\n        return getTemplateEl(getFile(id), selectorClasses.spinner);\n    }\n\n    function getEditIcon(id) {\n        return getTemplateEl(getFile(id), selectorClasses.editNameIcon);\n    }\n\n    function getSize(id) {\n        return getTemplateEl(getFile(id), selectorClasses.size);\n    }\n\n    function getDelete(id) {\n        return getTemplateEl(getFile(id), selectorClasses.deleteButton);\n    }\n\n    function getRetry(id) {\n        return getTemplateEl(getFile(id), selectorClasses.retry);\n    }\n\n    function getFilename(id) {\n        return getTemplateEl(getFile(id), selectorClasses.file);\n    }\n\n    function getDropProcessing() {\n        return getTemplateEl(container, selectorClasses.dropProcessing);\n    }\n\n    function getThumbnail(id) {\n        return showThumbnails && getTemplateEl(getFile(id), selectorClasses.thumbnail);\n    }\n\n    function hide(el) {\n        el && qq(el).addClass(options.classes.hide);\n    }\n\n    function show(el) {\n        el && qq(el).removeClass(options.classes.hide);\n    }\n\n    function setProgressBarWidth(id, percent) {\n        var bar = getProgress(id);\n\n        if (bar && !qq(bar).hasClass(selectorClasses.progressBar)) {\n            bar = qq(bar).getByClass(selectorClasses.progressBar)[0];\n        }\n\n        bar && qq(bar).css({width: percent + '%'});\n    }\n\n    // During initialization of the templating module we should cache any\n    // placeholder images so we can quickly swap them into the file list on demand.\n    // Any placeholder images that cannot be loaded/found are simply ignored.\n    function cacheThumbnailPlaceholders() {\n        var notAvailableUrl =  options.placeholders.thumbnailNotAvailable,\n            waitingUrl = options.placeholders.waitingForThumbnail,\n            spec = {\n                maxSize: thumbnailMaxSize,\n                scale: serverScale\n            };\n\n        if (showThumbnails) {\n            if (notAvailableUrl) {\n                options.imageGenerator.generate(notAvailableUrl, new Image(), spec).then(\n                    function(updatedImg) {\n                        cachedThumbnailNotAvailableImg = updatedImg;\n                    },\n                    function() {\n                        log(\"Problem loading 'not available' placeholder image at \" + notAvailableUrl, \"error\");\n                    }\n                );\n            }\n\n            if (waitingUrl) {\n                options.imageGenerator.generate(waitingUrl, new Image(), spec).then(\n                    function(updatedImg) {\n                        cachedWaitingForThumbnailImg = updatedImg;\n                    },\n                    function() {\n                        log(\"Problem loading 'waiting for thumbnail' placeholder image at \" + waitingUrl, \"error\");\n                    }\n                );\n            }\n        }\n    }\n\n    // Displays a \"waiting for thumbnail\" type placeholder image\n    // iff we were able to load it during initialization of the templating module.\n    function displayWaitingImg(thumbnail) {\n        if (cachedWaitingForThumbnailImg) {\n            maybeScalePlaceholderViaCss(cachedWaitingForThumbnailImg, thumbnail);\n            thumbnail.src = cachedWaitingForThumbnailImg.src;\n            show(thumbnail);\n        }\n        // In some browsers (such as IE9 and older) an img w/out a src attribute\n        // are displayed as \"broken\" images, so we sohuld just hide the img tag\n        // if we aren't going to display the \"waiting\" placeholder.\n        else {\n            hide(thumbnail);\n        }\n    }\n\n    // Displays a \"thumbnail not available\" type placeholder image\n    // iff we were able to load this placeholder during initialization\n    // of the templating module AND a valid preview does not already exist in the thumbnail element.\n    function displayNotAvailableImg(thumbnail) {\n        if (cachedThumbnailNotAvailableImg && !hasValidPreview(thumbnail)) {\n            maybeScalePlaceholderViaCss(cachedThumbnailNotAvailableImg, thumbnail);\n            thumbnail.src = cachedThumbnailNotAvailableImg.src;\n            show(thumbnail);\n        }\n    }\n\n    // Ensures a placeholder image does not exceed any max size specified\n    // via `style` attribute properties iff <canvas> was not used to scale\n    // the placeholder AND the target <img> doesn't already have these `style` attribute properties set.\n    function maybeScalePlaceholderViaCss(placeholder, thumbnail) {\n        var maxWidth = placeholder.style.maxWidth,\n            maxHeight = placeholder.style.maxHeight;\n\n        if (maxHeight && maxWidth && !thumbnail.style.maxWidth && !thumbnail.style.maxHeight) {\n            qq(thumbnail).css({\n                maxWidth: maxWidth,\n                maxHeight: maxHeight\n            });\n        }\n    }\n\n    // Allows us to determine if a thumbnail element has already received a valid preview.\n    function hasValidPreview(thumbnail) {\n        return qq(thumbnail).hasAttribute(PREVIEW_GENERATED_ATTR);\n    }\n\n\n    qq.extend(options, spec);\n    log = options.log;\n\n    container = options.containerEl;\n    showThumbnails = options.imageGenerator !== undefined;\n    templateHtml = parseAndGetTemplate();\n\n    cacheThumbnailPlaceholders();\n\n    api = {\n        render: function() {\n            log(\"Rendering template in DOM.\");\n\n            container.innerHTML = templateHtml.template;\n            hide(getDropProcessing());\n            fileList = options.fileContainerEl || getTemplateEl(container, selectorClasses.list)\n\n            log(\"Template rendering complete\");\n        },\n\n        renderFailure: function(message) {\n            var cantRenderEl = qq.toElement(message);\n            container.innerHTML = \"\";\n            container.appendChild(cantRenderEl);\n        },\n\n        reset: function() {\n            api.render();\n        },\n\n        clearFiles: function() {\n            fileList.innerHTML = \"\";\n        },\n\n        disableCancel: function() {\n            isCancelDisabled = true;\n        },\n\n        addFile: function(id, name, prependInfo) {\n            var fileEl = qq.toElement(templateHtml.fileTemplate),\n                fileNameEl = getTemplateEl(fileEl, selectorClasses.file);\n\n            qq(fileEl).addClass(FILE_CLASS_PREFIX + id);\n            fileNameEl && qq(fileNameEl).setText(name);\n            fileEl.setAttribute(FILE_ID_ATTR, id);\n\n            if (prependInfo) {\n                prependFile(fileEl, prependInfo.index);\n            }\n            else {\n                fileList.appendChild(fileEl);\n            }\n\n            hide(getProgress(id));\n            hide(getSize(id));\n            hide(getDelete(id));\n            hide(getRetry(id));\n\n            if (isCancelDisabled) {\n                api.hideCancel(id);\n            }\n        },\n\n        removeFile: function(id) {\n            qq(getFile(id)).remove();\n        },\n\n        getFileId: function(el) {\n            var currentNode = el;\n\n            while (currentNode.getAttribute(FILE_ID_ATTR) == null) {\n                currentNode = currentNode.parentNode;\n            }\n\n            return parseInt(currentNode.getAttribute(FILE_ID_ATTR));\n        },\n\n        getFileList: function() {\n            return fileList;\n        },\n\n        markFilenameEditable: function(id) {\n            var filename = getFilename(id);\n\n            filename && qq(filename).addClass(options.classes.editable);\n        },\n\n        updateFilename: function(id, name) {\n            var filename = getFilename(id);\n\n            filename && qq(filename).setText(name);\n        },\n\n        hideFilename: function(id) {\n            hide(getFilename(id));\n        },\n\n        showFilename: function(id) {\n            show(getFilename(id));\n        },\n\n        isFileName: function(el) {\n            return qq(el).hasClass(selectorClasses.file);\n        },\n\n        getButton: function() {\n            return options.button || getTemplateEl(container, selectorClasses.button);\n        },\n\n        hideDropProcessing: function() {\n            hide(getDropProcessing());\n        },\n\n        showDropProcessing: function() {\n            show(getDropProcessing());\n        },\n\n        getDropZone: function() {\n            return getTemplateEl(container, selectorClasses.drop);\n        },\n\n        isEditFilenamePossible: function() {\n            return isEditElementsExist;\n        },\n\n        isRetryPossible: function() {\n            return isRetryElementExist;\n        },\n\n        getFileContainer: function(id) {\n            return getFile(id);\n        },\n\n        showEditIcon: function(id) {\n            var icon = getEditIcon(id);\n\n            icon && qq(icon).addClass(options.classes.editable);\n        },\n\n        hideEditIcon: function(id) {\n            var icon = getEditIcon(id);\n\n            icon && qq(icon).removeClass(options.classes.editable);\n        },\n\n        isEditIcon: function(el) {\n            return qq(el).hasClass(selectorClasses.editNameIcon);\n        },\n\n        getEditInput: function(id) {\n            return getTemplateEl(getFile(id), selectorClasses.editFilenameInput);\n        },\n\n        isEditInput: function(el) {\n            return qq(el).hasClass(selectorClasses.editFilenameInput);\n        },\n\n        updateProgress: function(id, loaded, total) {\n            var bar = getProgress(id),\n                percent;\n\n            if (bar) {\n                percent = Math.round(loaded / total * 100);\n\n                if (loaded === total) {\n                    hide(bar);\n                }\n                else {\n                    show(bar);\n                }\n\n                setProgressBarWidth(id, percent);\n            }\n        },\n\n        hideProgress: function(id) {\n            var bar = getProgress(id);\n\n            bar && hide(bar);\n        },\n\n        resetProgress: function(id) {\n            setProgressBarWidth(id, 0);\n        },\n\n        showCancel: function(id) {\n            if (!isCancelDisabled) {\n                var cancel = getCancel(id);\n\n                cancel && qq(cancel).removeClass(options.classes.hide);\n            }\n        },\n\n        hideCancel: function(id) {\n            hide(getCancel(id));\n        },\n\n        isCancel: function(el)  {\n            return qq(el).hasClass(selectorClasses.cancel);\n        },\n\n        showDelete: function(id) {\n            show(getDelete(id));\n        },\n\n        hideDelete: function(id) {\n            hide(getDelete(id));\n        },\n\n        isDelete: function(el) {\n            return qq(el).hasClass(selectorClasses.deleteButton);\n        },\n\n        isRetry: function(el) {\n            return qq(el).hasClass(selectorClasses.retry);\n        },\n\n        updateSize: function(id, text) {\n            var size = getSize(id);\n\n            if (size) {\n                show(size);\n                qq(size).setText(text);\n            }\n        },\n\n        setStatusText: function(id, text) {\n            var textEl = getTemplateEl(getFile(id), selectorClasses.statusText);\n\n            if (textEl) {\n                if (text == null) {\n                    qq(textEl).clearText();\n                }\n                else {\n                    qq(textEl).setText(text);\n                }\n            }\n        },\n\n        hideSpinner: function(id) {\n            hide(getSpinner(id));\n        },\n\n        showSpinner: function(id) {\n            show(getSpinner(id));\n        },\n\n        generatePreview: function(id, fileOrBlob) {\n            var thumbnail = getThumbnail(id),\n                spec = {\n                    maxSize: thumbnailMaxSize,\n                    scale: true,\n                    orient: true\n                };\n\n            if (qq.supportedFeatures.imagePreviews) {\n                if (thumbnail) {\n                    displayWaitingImg(thumbnail);\n                    return options.imageGenerator.generate(fileOrBlob, thumbnail, spec).then(\n                        function() {\n                            thumbnail.setAttribute(PREVIEW_GENERATED_ATTR, \"true\");\n                            show(thumbnail);\n                        },\n                        function() {\n                            // Display the \"not available\" placeholder img only if we are\n                            // not expecting a thumbnail at a later point, such as in a server response.\n                            if (!options.placeholders.waitUntilUpdate) {\n                                displayNotAvailableImg(thumbnail);\n                            }\n                        });\n                }\n            }\n            else if (thumbnail) {\n                displayWaitingImg(thumbnail);\n            }\n        },\n\n        updateThumbnail: function(id, thumbnailUrl) {\n            var thumbnail = getThumbnail(id),\n                spec = {\n                    maxSize: thumbnailMaxSize,\n                    scale: serverScale\n                };\n\n            if (thumbnail) {\n                if (thumbnailUrl) {\n                    return options.imageGenerator.generate(thumbnailUrl, thumbnail, spec).then(\n                        function() {\n                            show(thumbnail);\n                        },\n                        function() {\n                            displayNotAvailableImg(thumbnail);\n                        }\n                    );\n                }\n                else {\n                    displayNotAvailableImg(thumbnail);\n                }\n            }\n        }\n    };\n\n    return api;\n};\n\n/*globals qq*/\nqq.UploadHandlerForm = function(options, uploadCompleteCallback, onUuidChanged, logCallback) {\n    \"use strict\";\n\n    var fileState = [],\n        uploadComplete = uploadCompleteCallback,\n        log = logCallback,\n        internalApi = {},\n        publicApi;\n\n\n    /**\n     * Returns json object received by iframe from server.\n     */\n    function getIframeContentJson(id, iframe) {\n        /*jshint evil: true*/\n\n        var response;\n\n        //IE may throw an \"access is denied\" error when attempting to access contentDocument on the iframe in some cases\n        try {\n            // iframe.contentWindow.document - for IE<7\n            var doc = iframe.contentDocument || iframe.contentWindow.document,\n                innerHtml = doc.body.innerHTML;\n\n            log(\"converting iframe's innerHTML to JSON\");\n            log(\"innerHTML = \" + innerHtml);\n            //plain text response may be wrapped in <pre> tag\n            if (innerHtml && innerHtml.match(/^<pre/i)) {\n                innerHtml = doc.body.firstChild.firstChild.nodeValue;\n            }\n\n            response = internalApi.parseJsonResponse(id, innerHtml);\n        }\n        catch(error) {\n            log('Error when attempting to parse form upload response (' + error.message + \")\", 'error');\n            response = {success: false};\n        }\n\n        return response;\n    }\n\n    /**\n     * Creates form, that will be submitted to iframe\n     */\n    function createForm(id, iframe){\n        var params = options.paramsStore.getParams(id),\n            method = options.demoMode ? \"GET\" : \"POST\",\n            endpoint = options.endpointStore.getEndpoint(id),\n            name = fileState[id].newName || publicApi.getName(id);\n\n        params[options.uuidParam] = fileState[id].uuid;\n        params[options.filenameParam] = name;\n\n        return internalApi.initFormForUpload({\n            method: method,\n            endpoint: endpoint,\n            params: params,\n            paramsInBody: options.paramsInBody,\n            targetName: iframe.name\n        });\n    }\n\n    publicApi = new qq.UploadHandlerFormApi(internalApi, fileState, options.cors.expected, options.inputName, options.onCancel, onUuidChanged, log);\n\n    return qq.extend(publicApi, {\n        upload: function(id) {\n            var input = fileState[id].input,\n                fileName = publicApi.getName(id),\n                iframe = internalApi.createIframe(id),\n                form;\n\n            if (!input){\n                throw new Error('file with passed id was not added, or already uploaded or cancelled');\n            }\n\n            options.onUpload(id, publicApi.getName(id));\n\n            form = createForm(id, iframe);\n            form.appendChild(input);\n\n            internalApi.attachLoadEvent(iframe, function(responseFromMessage){\n                log('iframe loaded');\n\n                var response = responseFromMessage ? responseFromMessage : getIframeContentJson(id, iframe);\n\n                internalApi.detachLoadEvent(id);\n\n                //we can't remove an iframe if the iframe doesn't belong to the same domain\n                if (!options.cors.expected) {\n                    qq(iframe).remove();\n                }\n\n                if (!response.success) {\n                    if (options.onAutoRetry(id, fileName, response)) {\n                        return;\n                    }\n                }\n                options.onComplete(id, fileName, response);\n                uploadComplete(id);\n            });\n\n            log('Sending upload request for ' + id);\n            form.submit();\n            qq(form).remove();\n        }\n    });\n};\n\n/*globals qq, File, XMLHttpRequest, FormData, Blob*/\nqq.UploadHandlerXhr = function(options, uploadCompleteCallback, onUuidChanged, logCallback) {\n    \"use strict\";\n    \n    var uploadComplete = uploadCompleteCallback,\n        log = logCallback,\n        fileState = [],\n        cookieItemDelimiter = \"|\",\n        chunkFiles = options.chunking.enabled && qq.supportedFeatures.chunking,\n        resumeEnabled = options.resume.enabled && chunkFiles && qq.supportedFeatures.resume,\n        resumeId = getResumeId(),\n        multipart = options.forceMultipart || options.paramsInBody,\n        internalApi = {},\n        publicApi;\n\n\n     function addChunkingSpecificParams(id, params, chunkData) {\n        var size = publicApi.getSize(id),\n            name = publicApi.getName(id);\n\n        params[options.chunking.paramNames.partIndex] = chunkData.part;\n        params[options.chunking.paramNames.partByteOffset] = chunkData.start;\n        params[options.chunking.paramNames.chunkSize] = chunkData.size;\n        params[options.chunking.paramNames.totalParts] = chunkData.count;\n        params[options.totalFileSizeParam] = size;\n\n        /**\n         * When a Blob is sent in a multipart request, the filename value in the content-disposition header is either \"blob\"\n         * or an empty string.  So, we will need to include the actual file name as a param in this case.\n         */\n        if (multipart) {\n            params[options.filenameParam] = name;\n        }\n    }\n\n    function addResumeSpecificParams(params) {\n        params[options.resume.paramNames.resuming] = true;\n    }\n\n    function getChunk(fileOrBlob, startByte, endByte) {\n        if (fileOrBlob.slice) {\n            return fileOrBlob.slice(startByte, endByte);\n        }\n        else if (fileOrBlob.mozSlice) {\n            return fileOrBlob.mozSlice(startByte, endByte);\n        }\n        else if (fileOrBlob.webkitSlice) {\n            return fileOrBlob.webkitSlice(startByte, endByte);\n        }\n    }\n\n    function setParamsAndGetEntityToSend(params, xhr, fileOrBlob, id) {\n        var formData = new FormData(),\n            method = options.demoMode ? \"GET\" : \"POST\",\n            endpoint = options.endpointStore.getEndpoint(id),\n            url = endpoint,\n            name = fileState[id].newName || publicApi.getName(id),\n            size = publicApi.getSize(id);\n\n        params[options.uuidParam] = fileState[id].uuid;\n        params[options.filenameParam] = name;\n\n\n        if (multipart) {\n            params[options.totalFileSizeParam] = size;\n        }\n\n        //build query string\n        if (!options.paramsInBody) {\n            if (!multipart) {\n                params[options.inputName] = name;\n            }\n            url = qq.obj2url(params, endpoint);\n        }\n\n        xhr.open(method, url, true);\n\n        if (options.cors.expected && options.cors.sendCredentials) {\n            xhr.withCredentials = true;\n        }\n\n        if (multipart) {\n            if (options.paramsInBody) {\n                qq.obj2FormData(params, formData);\n            }\n\n            formData.append(options.inputName, fileOrBlob);\n            return formData;\n        }\n\n        return fileOrBlob;\n    }\n\n    function setHeaders(id, xhr) {\n        var extraHeaders = options.customHeaders,\n            fileOrBlob = fileState[id].file || fileState[id].blobData.blob;\n\n        xhr.setRequestHeader(\"X-Requested-With\", \"XMLHttpRequest\");\n        xhr.setRequestHeader(\"Cache-Control\", \"no-cache\");\n\n        if (!multipart) {\n            xhr.setRequestHeader(\"Content-Type\", \"application/octet-stream\");\n            //NOTE: return mime type in xhr works on chrome 16.0.9 firefox 11.0a2\n            xhr.setRequestHeader(\"X-Mime-Type\", fileOrBlob.type);\n        }\n\n        qq.each(extraHeaders, function(name, val) {\n            xhr.setRequestHeader(name, val);\n        });\n    }\n\n    function handleCompletedItem(id, response, xhr) {\n        var name = publicApi.getName(id),\n            size = publicApi.getSize(id);\n\n        fileState[id].attemptingResume = false;\n\n        options.onProgress(id, name, size, size);\n        options.onComplete(id, name, response, xhr);\n\n        if (fileState[id]) {\n            delete fileState[id].xhr;\n        }\n\n        uploadComplete(id);\n    }\n\n    function uploadNextChunk(id) {\n        var chunkIdx = fileState[id].remainingChunkIdxs[0],\n            chunkData = internalApi.getChunkData(id, chunkIdx),\n            xhr = internalApi.createXhr(id),\n            size = publicApi.getSize(id),\n            name = publicApi.getName(id),\n            toSend, params;\n\n        if (fileState[id].loaded === undefined) {\n            fileState[id].loaded = 0;\n        }\n\n        if (resumeEnabled && fileState[id].file) {\n            persistChunkData(id, chunkData);\n        }\n\n        xhr.onreadystatechange = getReadyStateChangeHandler(id, xhr);\n\n        xhr.upload.onprogress = function(e) {\n            if (e.lengthComputable) {\n                var totalLoaded = e.loaded + fileState[id].loaded,\n                    estTotalRequestsSize = calcAllRequestsSizeForChunkedUpload(id, chunkIdx, e.total);\n\n                options.onProgress(id, name, totalLoaded, estTotalRequestsSize);\n            }\n        };\n\n        options.onUploadChunk(id, name, internalApi.getChunkDataForCallback(chunkData));\n\n        params = options.paramsStore.getParams(id);\n        addChunkingSpecificParams(id, params, chunkData);\n\n        if (fileState[id].attemptingResume) {\n            addResumeSpecificParams(params);\n        }\n\n        toSend = setParamsAndGetEntityToSend(params, xhr, chunkData.blob, id);\n        setHeaders(id, xhr);\n\n        log('Sending chunked upload request for item ' + id + \": bytes \" + (chunkData.start+1) + \"-\" + chunkData.end + \" of \" + size);\n        xhr.send(toSend);\n    }\n\n    function calcAllRequestsSizeForChunkedUpload(id, chunkIdx, requestSize) {\n        var chunkData = internalApi.getChunkData(id, chunkIdx),\n            blobSize = chunkData.size,\n            overhead = requestSize - blobSize,\n            size = publicApi.getSize(id),\n            chunkCount = chunkData.count,\n            initialRequestOverhead = fileState[id].initialRequestOverhead,\n            overheadDiff = overhead - initialRequestOverhead;\n\n        fileState[id].lastRequestOverhead = overhead;\n\n        if (chunkIdx === 0) {\n            fileState[id].lastChunkIdxProgress = 0;\n            fileState[id].initialRequestOverhead = overhead;\n            fileState[id].estTotalRequestsSize = size + (chunkCount * overhead);\n        }\n        else if (fileState[id].lastChunkIdxProgress !== chunkIdx) {\n            fileState[id].lastChunkIdxProgress = chunkIdx;\n            fileState[id].estTotalRequestsSize += overheadDiff;\n        }\n\n        return fileState[id].estTotalRequestsSize;\n    }\n\n    function getLastRequestOverhead(id) {\n        if (multipart) {\n            return fileState[id].lastRequestOverhead;\n        }\n        else {\n            return 0;\n        }\n    }\n\n    function handleSuccessfullyCompletedChunk(id, response, xhr) {\n        var chunkIdx = fileState[id].remainingChunkIdxs.shift(),\n            chunkData = internalApi.getChunkData(id, chunkIdx);\n\n        fileState[id].attemptingResume = false;\n        fileState[id].loaded += chunkData.size + getLastRequestOverhead(id);\n\n        if (fileState[id].remainingChunkIdxs.length > 0) {\n            uploadNextChunk(id);\n        }\n        else {\n            if (resumeEnabled) {\n                deletePersistedChunkData(id);\n            }\n\n            handleCompletedItem(id, response, xhr);\n        }\n    }\n\n    function isErrorResponse(xhr, response) {\n        return xhr.status !== 200 || !response.success || response.reset;\n    }\n\n    function parseResponse(id, xhr) {\n        var response;\n\n        try {\n            log(qq.format(\"Received response status {} with body: {}\", xhr.status, xhr.responseText));\n\n            response = qq.parseJson(xhr.responseText);\n\n            if (response.newUuid !== undefined) {\n                publicApi.setUuid(id, response.newUuid);\n            }\n        }\n        catch(error) {\n            log('Error when attempting to parse xhr response text (' + error.message + ')', 'error');\n            response = {};\n        }\n\n        return response;\n    }\n\n    function handleResetResponse(id) {\n        log('Server has ordered chunking effort to be restarted on next attempt for item ID ' + id, 'error');\n\n        if (resumeEnabled) {\n            deletePersistedChunkData(id);\n            fileState[id].attemptingResume = false;\n        }\n\n        fileState[id].remainingChunkIdxs = [];\n        delete fileState[id].loaded;\n        delete fileState[id].estTotalRequestsSize;\n        delete fileState[id].initialRequestOverhead;\n    }\n\n    function handleResetResponseOnResumeAttempt(id) {\n        fileState[id].attemptingResume = false;\n        log(\"Server has declared that it cannot handle resume for item ID \" + id + \" - starting from the first chunk\", 'error');\n        handleResetResponse(id);\n        publicApi.upload(id, true);\n    }\n\n    function handleNonResetErrorResponse(id, response, xhr) {\n        var name = publicApi.getName(id);\n\n        if (options.onAutoRetry(id, name, response, xhr)) {\n            return;\n        }\n        else {\n            handleCompletedItem(id, response, xhr);\n        }\n    }\n\n    function onComplete(id, xhr) {\n        var response;\n\n        // the request was aborted/cancelled\n        if (!fileState[id]) {\n            return;\n        }\n\n        log(\"xhr - server response received for \" + id);\n        log(\"responseText = \" + xhr.responseText);\n        response = parseResponse(id, xhr);\n\n        if (isErrorResponse(xhr, response)) {\n            if (response.reset) {\n                handleResetResponse(id);\n            }\n\n            if (fileState[id].attemptingResume && response.reset) {\n                handleResetResponseOnResumeAttempt(id);\n            }\n            else {\n                handleNonResetErrorResponse(id, response, xhr);\n            }\n        }\n        else if (chunkFiles) {\n            handleSuccessfullyCompletedChunk(id, response, xhr);\n        }\n        else {\n            handleCompletedItem(id, response, xhr);\n        }\n    }\n\n    function getReadyStateChangeHandler(id, xhr) {\n        return function() {\n            if (xhr.readyState === 4) {\n                onComplete(id, xhr);\n            }\n        };\n    }\n\n    function persistChunkData(id, chunkData) {\n        var fileUuid = publicApi.getUuid(id),\n            lastByteSent = fileState[id].loaded,\n            initialRequestOverhead = fileState[id].initialRequestOverhead,\n            estTotalRequestsSize = fileState[id].estTotalRequestsSize,\n            cookieName = getChunkDataCookieName(id),\n            cookieValue = fileUuid +\n                cookieItemDelimiter + chunkData.part +\n                cookieItemDelimiter + lastByteSent +\n                cookieItemDelimiter + initialRequestOverhead +\n                cookieItemDelimiter + estTotalRequestsSize,\n            cookieExpDays = options.resume.cookiesExpireIn;\n\n        qq.setCookie(cookieName, cookieValue, cookieExpDays);\n    }\n\n    function deletePersistedChunkData(id) {\n        if (fileState[id].file) {\n            var cookieName = getChunkDataCookieName(id);\n            qq.deleteCookie(cookieName);\n        }\n    }\n\n    function getPersistedChunkData(id) {\n        var chunkCookieValue = qq.getCookie(getChunkDataCookieName(id)),\n            filename = publicApi.getName(id),\n            sections, uuid, partIndex, lastByteSent, initialRequestOverhead, estTotalRequestsSize;\n\n        if (chunkCookieValue) {\n            sections = chunkCookieValue.split(cookieItemDelimiter);\n\n            if (sections.length === 5) {\n                uuid = sections[0];\n                partIndex = parseInt(sections[1], 10);\n                lastByteSent = parseInt(sections[2], 10);\n                initialRequestOverhead = parseInt(sections[3], 10);\n                estTotalRequestsSize = parseInt(sections[4], 10);\n\n                return {\n                    uuid: uuid,\n                    part: partIndex,\n                    lastByteSent: lastByteSent,\n                    initialRequestOverhead: initialRequestOverhead,\n                    estTotalRequestsSize: estTotalRequestsSize\n                };\n            }\n            else {\n                log('Ignoring previously stored resume/chunk cookie for ' + filename + \" - old cookie format\", \"warn\");\n            }\n        }\n    }\n\n    function getChunkDataCookieName(id) {\n        var filename = publicApi.getName(id),\n            fileSize = publicApi.getSize(id),\n            maxChunkSize = options.chunking.partSize,\n            cookieName;\n\n        cookieName = \"qqfilechunk\" + cookieItemDelimiter + encodeURIComponent(filename) + cookieItemDelimiter + fileSize + cookieItemDelimiter + maxChunkSize;\n\n        if (resumeId !== undefined) {\n            cookieName += cookieItemDelimiter + resumeId;\n        }\n\n        return cookieName;\n    }\n\n    function getResumeId() {\n        if (options.resume.id !== null &&\n            options.resume.id !== undefined &&\n            !qq.isFunction(options.resume.id) &&\n            !qq.isObject(options.resume.id)) {\n\n            return options.resume.id;\n        }\n    }\n\n    function calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex) {\n        var currentChunkIndex;\n\n        for (currentChunkIndex = internalApi.getTotalChunks(id)-1; currentChunkIndex >= firstChunkIndex; currentChunkIndex-=1) {\n            fileState[id].remainingChunkIdxs.unshift(currentChunkIndex);\n        }\n\n        uploadNextChunk(id);\n    }\n\n    function onResumeSuccess(id, name, firstChunkIndex, persistedChunkInfoForResume) {\n        firstChunkIndex = persistedChunkInfoForResume.part;\n        fileState[id].loaded = persistedChunkInfoForResume.lastByteSent;\n        fileState[id].estTotalRequestsSize = persistedChunkInfoForResume.estTotalRequestsSize;\n        fileState[id].initialRequestOverhead = persistedChunkInfoForResume.initialRequestOverhead;\n        fileState[id].attemptingResume = true;\n        log('Resuming ' + name + \" at partition index \" + firstChunkIndex);\n\n        calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex);\n    }\n\n    function handlePossibleResumeAttempt(id, persistedChunkInfoForResume, firstChunkIndex) {\n        var name = publicApi.getName(id),\n            firstChunkDataForResume = internalApi.getChunkData(id, persistedChunkInfoForResume.part),\n            onResumeRetVal;\n\n        onResumeRetVal = options.onResume(id, name, internalApi.getChunkDataForCallback(firstChunkDataForResume));\n        if (qq.isPromise(onResumeRetVal)) {\n            log(\"Waiting for onResume promise to be fulfilled for \" + id);\n            onResumeRetVal.then(\n                function() {\n                    onResumeSuccess(id, name, firstChunkIndex, persistedChunkInfoForResume);\n                },\n                function() {\n                    log(\"onResume promise fulfilled - failure indicated.  Will not resume.\")\n                    calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex);\n                }\n            );\n        }\n        else if (onResumeRetVal !== false) {\n            onResumeSuccess(id, name, firstChunkIndex, persistedChunkInfoForResume);\n        }\n        else {\n            log(\"onResume callback returned false.  Will not resume.\");\n            calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex);\n        }\n    }\n\n    function handleFileChunkingUpload(id, retry) {\n        var firstChunkIndex = 0,\n            persistedChunkInfoForResume;\n\n        if (!fileState[id].remainingChunkIdxs || fileState[id].remainingChunkIdxs.length === 0) {\n            fileState[id].remainingChunkIdxs = [];\n\n            if (resumeEnabled && !retry && fileState[id].file) {\n                persistedChunkInfoForResume = getPersistedChunkData(id);\n                if (persistedChunkInfoForResume) {\n                    handlePossibleResumeAttempt(id, persistedChunkInfoForResume, firstChunkIndex);\n                }\n                else {\n                    calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex);\n                }\n            }\n            else {\n                calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex);\n            }\n        }\n        else {\n            uploadNextChunk(id);\n        }\n    }\n\n    function handleStandardFileUpload(id) {\n        var fileOrBlob = fileState[id].file || fileState[id].blobData.blob,\n            name = publicApi.getName(id),\n            xhr, params, toSend;\n\n        fileState[id].loaded = 0;\n\n        xhr = internalApi.createXhr(id);\n\n        xhr.upload.onprogress = function(e){\n            if (e.lengthComputable){\n                fileState[id].loaded = e.loaded;\n                options.onProgress(id, name, e.loaded, e.total);\n            }\n        };\n\n        xhr.onreadystatechange = getReadyStateChangeHandler(id, xhr);\n\n        params = options.paramsStore.getParams(id);\n        toSend = setParamsAndGetEntityToSend(params, xhr, fileOrBlob, id);\n        setHeaders(id, xhr);\n\n        log('Sending upload request for ' + id);\n        xhr.send(toSend);\n    }\n\n    function handleUploadSignal(id, retry) {\n        var name = publicApi.getName(id);\n\n        if (publicApi.isValid(id)) {\n            options.onUpload(id, name);\n\n            if (chunkFiles) {\n                handleFileChunkingUpload(id, retry);\n            }\n            else {\n                handleStandardFileUpload(id);\n            }\n        }\n    }\n\n\n    publicApi = new qq.UploadHandlerXhrApi(\n        internalApi,\n        fileState,\n        chunkFiles ? options.chunking : null,\n        handleUploadSignal,\n        options.onCancel,\n        onUuidChanged,\n        log\n    );\n\n    // Base XHR API overrides\n    qq.override(publicApi, function(super_) {\n        return {\n            add: function(fileOrBlobData) {\n                var id = super_.add(fileOrBlobData),\n                    persistedChunkData;\n\n                if (resumeEnabled) {\n                    persistedChunkData = getPersistedChunkData(id);\n\n                    if (persistedChunkData) {\n                        fileState[id].uuid = persistedChunkData.uuid;\n                    }\n                }\n\n                return id;\n            },\n\n            getResumableFilesData: function() {\n                var matchingCookieNames = [],\n                    resumableFilesData = [];\n\n                if (chunkFiles && resumeEnabled) {\n                    if (resumeId === undefined) {\n                        matchingCookieNames = qq.getCookieNames(new RegExp(\"^qqfilechunk\\\\\" + cookieItemDelimiter + \".+\\\\\" +\n                            cookieItemDelimiter + \"\\\\d+\\\\\" + cookieItemDelimiter + options.chunking.partSize + \"=\"));\n                    }\n                    else {\n                        matchingCookieNames = qq.getCookieNames(new RegExp(\"^qqfilechunk\\\\\" + cookieItemDelimiter + \".+\\\\\" +\n                            cookieItemDelimiter + \"\\\\d+\\\\\" + cookieItemDelimiter + options.chunking.partSize + \"\\\\\" +\n                            cookieItemDelimiter + resumeId + \"=\"));\n                    }\n\n                    qq.each(matchingCookieNames, function(idx, cookieName) {\n                        var cookiesNameParts = cookieName.split(cookieItemDelimiter);\n                        var cookieValueParts = qq.getCookie(cookieName).split(cookieItemDelimiter);\n\n                        resumableFilesData.push({\n                            name: decodeURIComponent(cookiesNameParts[1]),\n                            size: cookiesNameParts[2],\n                            uuid: cookieValueParts[0],\n                            partIdx: cookieValueParts[1]\n                        });\n                    });\n\n                    return resumableFilesData;\n                }\n                return [];\n            },\n\n            expunge: function(id) {\n                if (resumeEnabled) {\n                    deletePersistedChunkData(id);\n                }\n\n                super_.expunge(id);\n            }\n        };\n    });\n\n    return publicApi;\n};\n\n/*globals qq*/\nqq.PasteSupport = function(o) {\n    \"use strict\";\n\n    var options, detachPasteHandler;\n\n    options = {\n        targetElement: null,\n        callbacks: {\n            log: function(message, level) {},\n            pasteReceived: function(blob) {}\n        }\n    };\n\n    function isImage(item) {\n        return item.type &&\n            item.type.indexOf(\"image/\") === 0;\n    }\n\n    function registerPasteHandler() {\n        qq(options.targetElement).attach(\"paste\", function(event) {\n            var clipboardData = event.clipboardData;\n\n            if (clipboardData) {\n                qq.each(clipboardData.items, function(idx, item) {\n                    if (isImage(item)) {\n                        var blob = item.getAsFile();\n                        options.callbacks.pasteReceived(blob);\n                    }\n                });\n            }\n        });\n    }\n\n    function unregisterPasteHandler() {\n        if (detachPasteHandler) {\n            detachPasteHandler();\n        }\n    }\n\n    qq.extend(options, o);\n    registerPasteHandler();\n\n    return {\n        reset: function() {\n            unregisterPasteHandler();\n        }\n    };\n};\n/*globals qq, document*/\nqq.DragAndDrop = function(o) {\n    \"use strict\";\n\n    var options,\n        HIDE_BEFORE_ENTER_ATTR = \"qq-hide-dropzone\",\n        uploadDropZones = [],\n        droppedFiles = [],\n        disposeSupport = new qq.DisposeSupport();\n\n     options = {\n        dropZoneElements: [],\n        allowMultipleItems: true,\n        classes: {\n            dropActive: null\n        },\n        callbacks: new qq.DragAndDrop.callbacks()\n    };\n\n    qq.extend(options, o, true);\n\n    setupDragDrop();\n\n    function uploadDroppedFiles(files, uploadDropZone) {\n        options.callbacks.dropLog('Grabbed ' + files.length + \" dropped files.\");\n        uploadDropZone.dropDisabled(false);\n        options.callbacks.processingDroppedFilesComplete(files);\n    }\n\n    function traverseFileTree(entry) {\n        var dirReader,\n            parseEntryPromise = new qq.Promise();\n\n        if (entry.isFile) {\n            entry.file(function(file) {\n                droppedFiles.push(file);\n                parseEntryPromise.success();\n            },\n            function(fileError) {\n                options.callbacks.dropLog(\"Problem parsing '\" + entry.fullPath + \"'.  FileError code \" + fileError.code + \".\", \"error\");\n                parseEntryPromise.failure();\n            });\n        }\n        else if (entry.isDirectory) {\n            dirReader = entry.createReader();\n            dirReader.readEntries(function(entries) {\n                var entriesLeft = entries.length;\n\n                qq.each(entries, function(idx, entry) {\n                    traverseFileTree(entry).done(function() {\n                        entriesLeft-=1;\n\n                        if (entriesLeft === 0) {\n                            parseEntryPromise.success();\n                        }\n                    });\n                });\n\n                if (!entries.length) {\n                    parseEntryPromise.success();\n                }\n            }, function(fileError) {\n                options.callbacks.dropLog(\"Problem parsing '\" + entry.fullPath + \"'.  FileError code \" + fileError.code + \".\", \"error\");\n                parseEntryPromise.failure();\n            });\n        }\n\n        return parseEntryPromise;\n    }\n\n    function handleDataTransfer(dataTransfer, uploadDropZone) {\n        var pendingFolderPromises = [],\n            handleDataTransferPromise = new qq.Promise();\n\n        options.callbacks.processingDroppedFiles();\n        uploadDropZone.dropDisabled(true);\n\n        if (dataTransfer.files.length > 1 && !options.allowMultipleItems) {\n            options.callbacks.processingDroppedFilesComplete([]);\n            options.callbacks.dropError('tooManyFilesError', \"\");\n            uploadDropZone.dropDisabled(false);\n            handleDataTransferPromise.failure();\n        }\n        else {\n            droppedFiles = [];\n\n            if (qq.isFolderDropSupported(dataTransfer)) {\n                qq.each(dataTransfer.items, function(idx, item) {\n                    var entry = item.webkitGetAsEntry();\n\n                    if (entry) {\n                        //due to a bug in Chrome's File System API impl - #149735\n                        if (entry.isFile) {\n                            droppedFiles.push(item.getAsFile());\n                        }\n\n                        else {\n                            pendingFolderPromises.push(traverseFileTree(entry).done(function() {\n                                pendingFolderPromises.pop();\n                                if (pendingFolderPromises.length === 0) {\n                                    handleDataTransferPromise.success();\n                                }\n                            }));\n                        }\n                    }\n                });\n            }\n            else {\n                droppedFiles = dataTransfer.files;\n            }\n\n            if (pendingFolderPromises.length === 0) {\n                handleDataTransferPromise.success();\n            }\n        }\n\n        return handleDataTransferPromise;\n    }\n\n    function setupDropzone(dropArea) {\n        var dropZone = new qq.UploadDropZone({\n            element: dropArea,\n            onEnter: function(e){\n                qq(dropArea).addClass(options.classes.dropActive);\n                e.stopPropagation();\n            },\n            onLeaveNotDescendants: function(e){\n                qq(dropArea).removeClass(options.classes.dropActive);\n            },\n            onDrop: function(e){\n                qq(dropArea).hasAttribute(HIDE_BEFORE_ENTER_ATTR) && qq(dropArea).hide();\n                qq(dropArea).removeClass(options.classes.dropActive);\n\n                handleDataTransfer(e.dataTransfer, dropZone).done(function() {\n                    uploadDroppedFiles(droppedFiles, dropZone);\n                });\n            }\n        });\n\n        disposeSupport.addDisposer(function() {\n            dropZone.dispose();\n        });\n\n        qq(dropArea).hasAttribute(HIDE_BEFORE_ENTER_ATTR) && qq(dropArea).hide();\n\n        uploadDropZones.push(dropZone);\n\n        return dropZone;\n    }\n\n    function isFileDrag(dragEvent) {\n        var fileDrag;\n\n        qq.each(dragEvent.dataTransfer.types, function(key, val) {\n            if (val === 'Files') {\n                fileDrag = true;\n                return false;\n            }\n        });\n\n        return fileDrag;\n    }\n\n    function leavingDocumentOut(e) {\n        return ((qq.chrome() || (qq.safari() && qq.windows())) && e.clientX == 0 && e.clientY == 0) // null coords for Chrome and Safari Windows\n            || (qq.firefox() && !e.relatedTarget); // null e.relatedTarget for Firefox\n    }\n\n    function setupDragDrop() {\n        var dropZones = options.dropZoneElements;\n\n        qq.each(dropZones, function(idx, dropZone) {\n           var uploadDropZone = setupDropzone(dropZone);\n\n            // IE <= 9 does not support the File API used for drag+drop uploads\n            if (dropZones.length && (!qq.ie() || qq.ie10())) {\n                disposeSupport.attach(document, 'dragenter', function(e) {\n                    if (!uploadDropZone.dropDisabled() && isFileDrag(e)) {\n                        qq.each(dropZones, function(idx, dropZone) {\n                            qq(dropZone).css({display: 'block'});\n                        });\n                    }\n                });\n            }\n        });\n\n        disposeSupport.attach(document, 'dragleave', function(e) {\n            if (leavingDocumentOut(e)) {\n                qq.each(dropZones, function(idx, dropZone) {\n                    qq(dropZone).hasAttribute(HIDE_BEFORE_ENTER_ATTR) && qq(dropZone).hide();\n                });\n            }\n        });\n        disposeSupport.attach(document, 'drop', function(e){\n            qq.each(dropZones, function(idx, dropZone) {\n                qq(dropZone).hasAttribute(HIDE_BEFORE_ENTER_ATTR) && qq(dropZone).hide();\n            });\n            e.preventDefault();\n        });\n    }\n\n    return {\n        setupExtraDropzone: function(element) {\n            options.dropZoneElements.push(element);\n            setupDropzone(element);\n        },\n\n        removeDropzone: function(element) {\n            var i,\n                dzs = options.dropZoneElements;\n\n            for(i in dzs) {\n                if (dzs[i] === element) {\n                    return dzs.splice(i, 1);\n                }\n            }\n        },\n\n        dispose: function() {\n            disposeSupport.dispose();\n            qq.each(uploadDropZones, function(idx, dropZone) {\n                dropZone.dispose();\n            });\n        }\n    };\n};\n\nqq.DragAndDrop.callbacks = function() {\n    return {\n        processingDroppedFiles: function() {},\n        processingDroppedFilesComplete: function(files) {},\n        dropError: function(code, errorSpecifics) {\n            qq.log(\"Drag & drop error code '\" + code + \" with these specifics: '\" + errorSpecifics + \"'\", \"error\");\n        },\n        dropLog: function(message, level) {\n            qq.log(message, level);\n        }\n    }\n};\n\nqq.UploadDropZone = function(o){\n    \"use strict\";\n\n    var options, element, preventDrop, dropOutsideDisabled, disposeSupport = new qq.DisposeSupport();\n\n    options = {\n        element: null,\n        onEnter: function(e){},\n        onLeave: function(e){},\n        // is not fired when leaving element by hovering descendants\n        onLeaveNotDescendants: function(e){},\n        onDrop: function(e){}\n    };\n\n    qq.extend(options, o);\n    element = options.element;\n\n    function dragover_should_be_canceled(){\n        return qq.safari() || (qq.firefox() && qq.windows());\n    }\n\n    function disableDropOutside(e){\n        // run only once for all instances\n        if (!dropOutsideDisabled ){\n\n            // for these cases we need to catch onDrop to reset dropArea\n            if (dragover_should_be_canceled){\n               disposeSupport.attach(document, 'dragover', function(e){\n                    e.preventDefault();\n                });\n            } else {\n                disposeSupport.attach(document, 'dragover', function(e){\n                    if (e.dataTransfer){\n                        e.dataTransfer.dropEffect = 'none';\n                        e.preventDefault();\n                    }\n                });\n            }\n\n            dropOutsideDisabled = true;\n        }\n    }\n\n    function isValidFileDrag(e){\n        // e.dataTransfer currently causing IE errors\n        // IE9 does NOT support file API, so drag-and-drop is not possible\n        if (qq.ie() && !qq.ie10()) {\n            return false;\n        }\n\n        var effectTest, dt = e.dataTransfer,\n        // do not check dt.types.contains in webkit, because it crashes safari 4\n        isSafari = qq.safari();\n\n        // dt.effectAllowed is none in Safari 5\n        // dt.types.contains check is for firefox\n        effectTest = qq.ie10() ? true : dt.effectAllowed !== 'none';\n        return dt && effectTest && (dt.files || (!isSafari && dt.types.contains && dt.types.contains('Files')));\n    }\n\n    function isOrSetDropDisabled(isDisabled) {\n        if (isDisabled !== undefined) {\n            preventDrop = isDisabled;\n        }\n        return preventDrop;\n    }\n\n    function attachEvents(){\n        disposeSupport.attach(element, 'dragover', function(e){\n            if (!isValidFileDrag(e)) {\n                return;\n            }\n\n            var effect = qq.ie() ? null : e.dataTransfer.effectAllowed;\n            if (effect === 'move' || effect === 'linkMove'){\n                e.dataTransfer.dropEffect = 'move'; // for FF (only move allowed)\n            } else {\n                e.dataTransfer.dropEffect = 'copy'; // for Chrome\n            }\n\n            e.stopPropagation();\n            e.preventDefault();\n        });\n\n        disposeSupport.attach(element, 'dragenter', function(e){\n            if (!isOrSetDropDisabled()) {\n                if (!isValidFileDrag(e)) {\n                    return;\n                }\n                options.onEnter(e);\n            }\n        });\n\n        disposeSupport.attach(element, 'dragleave', function(e){\n            if (!isValidFileDrag(e)) {\n                return;\n            }\n\n            options.onLeave(e);\n\n            var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);\n            // do not fire when moving a mouse over a descendant\n            if (qq(this).contains(relatedTarget)) {\n                return;\n            }\n\n            options.onLeaveNotDescendants(e);\n        });\n\n        disposeSupport.attach(element, 'drop', function(e){\n            if (!isOrSetDropDisabled()) {\n                if (!isValidFileDrag(e)) {\n                    return;\n                }\n\n                e.preventDefault();\n                options.onDrop(e);\n            }\n        });\n    }\n\n    disableDropOutside();\n    attachEvents();\n\n    return {\n        dropDisabled: function(isDisabled) {\n            return isOrSetDropDisabled(isDisabled);\n        },\n\n        dispose: function() {\n            disposeSupport.dispose();\n        }\n    };\n};\n\n/** Generic class for sending non-upload ajax requests and handling the associated responses **/\n/*globals qq, XMLHttpRequest*/\nqq.DeleteFileAjaxRequestor = function(o) {\n    \"use strict\";\n\n    var requestor,\n        options = {\n            method: \"DELETE\",\n            uuidParamName: \"qquuid\",\n            endpointStore: {},\n            maxConnections: 3,\n            customHeaders: {},\n            paramsStore: {},\n            demoMode: false,\n            cors: {\n                expected: false,\n                sendCredentials: false\n            },\n            log: function(str, level) {},\n            onDelete: function(id) {},\n            onDeleteComplete: function(id, xhrOrXdr, isError) {}\n        };\n\n    qq.extend(options, o);\n\n    function getMandatedParams() {\n        if (options.method.toUpperCase() === \"POST\") {\n            return {\n                \"_method\": \"DELETE\"\n            };\n        }\n\n        return {};\n    }\n\n    requestor = new qq.AjaxRequestor({\n        validMethods: [\"POST\", \"DELETE\"],\n        method: options.method,\n        endpointStore: options.endpointStore,\n        paramsStore: options.paramsStore,\n        mandatedParams: getMandatedParams(),\n        maxConnections: options.maxConnections,\n        customHeaders: options.customHeaders,\n        demoMode: options.demoMode,\n        log: options.log,\n        onSend: options.onDelete,\n        onComplete: options.onDeleteComplete,\n        cors: options.cors\n    });\n\n\n    return {\n        sendDelete: function(id, uuid, additionalMandatedParams) {\n            var additionalOptions = additionalMandatedParams || {};\n\n            options.log(\"Submitting delete file request for \" + id);\n\n            if (requestor.getMethod() === \"DELETE\") {\n                requestor.send(id, uuid, additionalOptions);\n            }\n            else {\n                additionalOptions[options.uuidParamName] = uuid;\n                requestor.send(id, null, additionalOptions);\n            }\n        }\n    };\n};\n\n/**\n * Mega pixel image rendering library for iOS6 Safari\n *\n * Fixes iOS6 Safari's image file rendering issue for large size image (over mega-pixel),\n * which causes unexpected subsampling when drawing it in canvas.\n * By using this library, you can safely render the image with proper stretching.\n *\n * Copyright (c) 2012 Shinichi Tomita <shinichi.tomita@gmail.com>\n * Released under the MIT license\n */\n(function() {\n\n  /**\n   * Detect subsampling in loaded image.\n   * In iOS, larger images than 2M pixels may be subsampled in rendering.\n   */\n  function detectSubsampling(img) {\n    var iw = img.naturalWidth, ih = img.naturalHeight;\n    if (iw * ih > 1024 * 1024) { // subsampling may happen over megapixel image\n      var canvas = document.createElement('canvas');\n      canvas.width = canvas.height = 1;\n      var ctx = canvas.getContext('2d');\n      ctx.drawImage(img, -iw + 1, 0);\n      // subsampled image becomes half smaller in rendering size.\n      // check alpha channel value to confirm image is covering edge pixel or not.\n      // if alpha value is 0 image is not covering, hence subsampled.\n      return ctx.getImageData(0, 0, 1, 1).data[3] === 0;\n    } else {\n      return false;\n    }\n  }\n\n  /**\n   * Detecting vertical squash in loaded image.\n   * Fixes a bug which squash image vertically while drawing into canvas for some images.\n   */\n  function detectVerticalSquash(img, iw, ih) {\n    var canvas = document.createElement('canvas');\n    canvas.width = 1;\n    canvas.height = ih;\n    var ctx = canvas.getContext('2d');\n    ctx.drawImage(img, 0, 0);\n    var data = ctx.getImageData(0, 0, 1, ih).data;\n    // search image edge pixel position in case it is squashed vertically.\n    var sy = 0;\n    var ey = ih;\n    var py = ih;\n    while (py > sy) {\n      var alpha = data[(py - 1) * 4 + 3];\n      if (alpha === 0) {\n        ey = py;\n      } else {\n        sy = py;\n      }\n      py = (ey + sy) >> 1;\n    }\n    var ratio = (py / ih);\n    return (ratio===0)?1:ratio;\n  }\n\n  /**\n   * Rendering image element (with resizing) and get its data URL\n   */\n  function renderImageToDataURL(img, options, doSquash) {\n    var canvas = document.createElement('canvas'),\n        mime = options.mime || \"image/jpeg\";\n\n    renderImageToCanvas(img, canvas, options, doSquash);\n    return canvas.toDataURL(mime, options.quality || 0.8);\n  }\n\n  /**\n   * Rendering image element (with resizing) into the canvas element\n   */\n  function renderImageToCanvas(img, canvas, options, doSquash) {\n    var iw = img.naturalWidth, ih = img.naturalHeight;\n    var width = options.width, height = options.height;\n    var ctx = canvas.getContext('2d');\n    ctx.save();\n    transformCoordinate(canvas, width, height, options.orientation);\n\n    // Fine Uploader specific: Save some CPU cycles if not using iOS\n    // Assumption: This logic is only needed to overcome iOS image sampling issues\n    if (qq.ios()) {\n        var subsampled = detectSubsampling(img);\n        if (subsampled) {\n          iw /= 2;\n          ih /= 2;\n        }\n        var d = 1024; // size of tiling canvas\n        var tmpCanvas = document.createElement('canvas');\n        tmpCanvas.width = tmpCanvas.height = d;\n        var tmpCtx = tmpCanvas.getContext('2d');\n        var vertSquashRatio = doSquash ? detectVerticalSquash(img, iw, ih) : 1;\n        var dw = Math.ceil(d * width / iw);\n        var dh = Math.ceil(d * height / ih / vertSquashRatio);\n        var sy = 0;\n        var dy = 0;\n        while (sy < ih) {\n          var sx = 0;\n          var dx = 0;\n          while (sx < iw) {\n            tmpCtx.clearRect(0, 0, d, d);\n            tmpCtx.drawImage(img, -sx, -sy);\n            ctx.drawImage(tmpCanvas, 0, 0, d, d, dx, dy, dw, dh);\n            sx += d;\n            dx += dw;\n          }\n          sy += d;\n          dy += dh;\n        }\n        ctx.restore();\n        tmpCanvas = tmpCtx = null;\n    }\n    else {\n        ctx.drawImage(img, 0, 0, width, height);\n    }\n  }\n\n  /**\n   * Transform canvas coordination according to specified frame size and orientation\n   * Orientation value is from EXIF tag\n   */\n  function transformCoordinate(canvas, width, height, orientation) {\n    switch (orientation) {\n      case 5:\n      case 6:\n      case 7:\n      case 8:\n        canvas.width = height;\n        canvas.height = width;\n        break;\n      default:\n        canvas.width = width;\n        canvas.height = height;\n    }\n    var ctx = canvas.getContext('2d');\n    switch (orientation) {\n      case 2:\n        // horizontal flip\n        ctx.translate(width, 0);\n        ctx.scale(-1, 1);\n        break;\n      case 3:\n        // 180 rotate left\n        ctx.translate(width, height);\n        ctx.rotate(Math.PI);\n        break;\n      case 4:\n        // vertical flip\n        ctx.translate(0, height);\n        ctx.scale(1, -1);\n        break;\n      case 5:\n        // vertical flip + 90 rotate right\n        ctx.rotate(0.5 * Math.PI);\n        ctx.scale(1, -1);\n        break;\n      case 6:\n        // 90 rotate right\n        ctx.rotate(0.5 * Math.PI);\n        ctx.translate(0, -height);\n        break;\n      case 7:\n        // horizontal flip + 90 rotate right\n        ctx.rotate(0.5 * Math.PI);\n        ctx.translate(width, -height);\n        ctx.scale(-1, 1);\n        break;\n      case 8:\n        // 90 rotate left\n        ctx.rotate(-0.5 * Math.PI);\n        ctx.translate(-width, 0);\n        break;\n      default:\n        break;\n    }\n  }\n\n\n  /**\n   * MegaPixImage class\n   */\n  function MegaPixImage(srcImage, errorCallback) {\n    if (window.Blob && srcImage instanceof Blob) {\n      var img = new Image();\n      var URL = window.URL && window.URL.createObjectURL ? window.URL :\n                window.webkitURL && window.webkitURL.createObjectURL ? window.webkitURL :\n                null;\n      if (!URL) { throw Error(\"No createObjectURL function found to create blob url\"); }\n      img.src = URL.createObjectURL(srcImage);\n      this.blob = srcImage;\n      srcImage = img;\n    }\n    if (!srcImage.naturalWidth && !srcImage.naturalHeight) {\n      var _this = this;\n      srcImage.onload = function() {\n        var listeners = _this.imageLoadListeners;\n        if (listeners) {\n          _this.imageLoadListeners = null;\n          for (var i=0, len=listeners.length; i<len; i++) {\n            listeners[i]();\n          }\n        }\n      };\n      srcImage.onerror = errorCallback;\n      this.imageLoadListeners = [];\n    }\n    this.srcImage = srcImage;\n  }\n\n  /**\n   * Rendering megapix image into specified target element\n   */\n  MegaPixImage.prototype.render = function(target, options) {\n    if (this.imageLoadListeners) {\n      var _this = this;\n      this.imageLoadListeners.push(function() { _this.render(target, options) });\n      return;\n    }\n    options = options || {};\n    var imgWidth = this.srcImage.naturalWidth, imgHeight = this.srcImage.naturalHeight,\n        width = options.width, height = options.height,\n        maxWidth = options.maxWidth, maxHeight = options.maxHeight,\n        doSquash = !this.blob || this.blob.type === 'image/jpeg';\n    if (width && !height) {\n      height = (imgHeight * width / imgWidth) << 0;\n    } else if (height && !width) {\n      width = (imgWidth * height / imgHeight) << 0;\n    } else {\n      width = imgWidth;\n      height = imgHeight;\n    }\n    if (maxWidth && width > maxWidth) {\n      width = maxWidth;\n      height = (imgHeight * width / imgWidth) << 0;\n    }\n    if (maxHeight && height > maxHeight) {\n      height = maxHeight;\n      width = (imgWidth * height / imgHeight) << 0;\n    }\n    var opt = { width : width, height : height };\n    for (var k in options) opt[k] = options[k];\n\n    var tagName = target.tagName.toLowerCase();\n    if (tagName === 'img') {\n      target.src = renderImageToDataURL(this.srcImage, opt, doSquash);\n    } else if (tagName === 'canvas') {\n      renderImageToCanvas(this.srcImage, target, opt, doSquash);\n    }\n    if (typeof this.onrender === 'function') {\n      this.onrender(target);\n    }\n  };\n\n  /**\n   * Export class to global\n   */\n  if (typeof define === 'function' && define.amd) {\n    define([], function() { return MegaPixImage; }); // for AMD loader\n  } else {\n    this.MegaPixImage = MegaPixImage;\n  }\n\n})();\n\n/**\n * Draws a thumbnail of a Blob/File/URL onto an <img> or <canvas>.\n *\n * @returns {{generate: Function}}\n * @constructor\n */\nqq.ImageGenerator = function(log) {\n    \"use strict\";\n    var api;\n\n    function isImg(el) {\n        return el.tagName.toLowerCase() === \"img\";\n    }\n\n    function isCanvas(el) {\n        return el.tagName.toLowerCase() === \"canvas\";\n    }\n\n    function isImgCorsSupported() {\n        return new Image().crossOrigin !== undefined;\n    }\n\n    function isCanvasSupported() {\n        var canvas = document.createElement(\"canvas\");\n\n        return canvas.getContext && canvas.getContext(\"2d\")\n    }\n\n    // This is only meant to determine the MIME type of a renderable image file.\n    // It is used to ensure images drawn from a URL that have transparent backgrounds\n    // are rendered correctly, among other things.\n    function determineMimeOfFileName(nameWithPath) {\n        var pathSegments = nameWithPath.split(\"/\"),\n            name = pathSegments[pathSegments.length - 1],\n            extension = qq.getExtension(name);\n\n        extension = extension && extension.toLowerCase();\n\n        switch(extension) {\n            case \"jpeg\":\n            case \"jpg\":\n                return \"image/jpeg\";\n            case \"png\":\n                return \"image/png\";\n            case \"bmp\":\n                return \"image/bmp\";\n            case \"gif\":\n                return \"image/gif\";\n            case \"tiff\":\n            case \"tif\":\n                return \"image/tiff\";\n        }\n    }\n\n    // This will likely not work correctly in IE8 and older.\n    // It's only used as part of a formula to determine\n    // if a canvas can be used to scale a server-hosted thumbnail.\n    // If canvas isn't supported by the UA (IE8 and older)\n    // this method should not even be called.\n    function isCrossOrigin(url) {\n        var targetAnchor = document.createElement('a'),\n            targetProtocol, targetHostname, targetPort;\n\n        targetAnchor.href = url;\n\n        targetProtocol = targetAnchor.protocol;\n        targetPort = targetAnchor.port;\n        targetHostname = targetAnchor.hostname;\n\n        if (targetProtocol.toLowerCase() !== window.location.protocol.toLowerCase()) {\n            return true;\n        }\n\n        if (targetHostname.toLowerCase() !== window.location.hostname.toLowerCase()) {\n            return true;\n        }\n\n        // IE doesn't take ports into consideration when determining if two endpoints are same origin.\n        if (targetPort !== window.location.port && !qq.ie()) {\n            return true;\n        }\n\n        return false;\n    }\n\n    function registerImgLoadListeners(img, promise) {\n        img.onload = function() {\n            img.onload = null;\n            img.onerror = null;\n            promise.success(img);\n        };\n\n        img.onerror = function() {\n            img.onload = null;\n            img.onerror = null;\n            log(\"Problem drawing preview!\", \"error\");\n            promise.failure(img, \"Problem drawing preview!\");\n        };\n    }\n\n    function registerCanvasDrawImageListener(canvas, promise) {\n        var context = canvas.getContext(\"2d\"),\n            oldDrawImage = context.drawImage;\n\n        // The image is drawn on the canvas by a third-party library,\n        // and we want to know when this happens so we can fulfill the associated promise.\n        context.drawImage = function() {\n            oldDrawImage.apply(this, arguments);\n            promise.success(canvas);\n            context.drawImage = oldDrawImage;\n        }\n    }\n\n    // Fulfills a `qq.Promise` when an image has been drawn onto the target,\n    // whether that is a <canvas> or an <img>.  The attempt is considered a\n    // failure if the target is not an <img> or a <canvas>, or if the drawing\n    // attempt was not successful.\n    function registerThumbnailRenderedListener(imgOrCanvas, promise) {\n        var registered = isImg(imgOrCanvas) || isCanvas(imgOrCanvas);\n\n        if (isImg(imgOrCanvas)) {\n            registerImgLoadListeners(imgOrCanvas, promise);\n        }\n        else if (isCanvas(imgOrCanvas)) {\n            registerCanvasDrawImageListener(imgOrCanvas, promise);\n        }\n        else {\n            promise.failure(imgOrCanvas);\n            log(qq.format(\"Element container of type {} is not supported!\", imgOrCanvas.tagName), \"error\");\n        }\n\n        return registered;\n    }\n\n    // Draw a preview iff the current UA can natively display it.\n    // Also rotate the image if necessary.\n    function draw(fileOrBlob, container, options) {\n        var drawPreview = new qq.Promise(),\n            identifier = new qq.Identify(fileOrBlob, log),\n            maxSize = options.maxSize,\n            megapixErrorHandler = function() {\n                drawPreview.failure(container, \"Browser cannot render image!\");\n            };\n\n        identifier.isPreviewable().then(\n            function(mime) {\n                var exif = new qq.Exif(fileOrBlob, log),\n                    mpImg = new MegaPixImage(fileOrBlob, megapixErrorHandler);\n\n                if (registerThumbnailRenderedListener(container, drawPreview)) {\n                    exif.parse().then(\n                        function(exif) {\n                            var orientation = exif.Orientation;\n\n                            mpImg.render(container, {\n                                maxWidth: maxSize,\n                                maxHeight: maxSize,\n                                orientation: orientation,\n                                mime: mime\n                            });\n                        },\n\n                        function(failureMsg) {\n                            log(qq.format(\"EXIF data could not be parsed ({}).  Assuming orientation = 1.\", failureMsg));\n\n                            mpImg.render(container, {\n                                maxWidth: maxSize,\n                                maxHeight: maxSize,\n                                mime: mime\n                            });\n                        }\n                    );\n                }\n            },\n\n            function() {\n                log(\"Not previewable\");\n                //TODO optionally include placeholder image\n                drawPreview.failure(container, \"Not previewable\");\n            }\n        );\n\n        return drawPreview;\n    }\n\n    function drawOnCanvasOrImgFromUrl(url, canvasOrImg, draw, maxSize) {\n        var tempImg = new Image(),\n            tempImgRender = new qq.Promise();\n\n        registerThumbnailRenderedListener(tempImg, tempImgRender);\n\n        if (isCrossOrigin(url)) {\n            tempImg.crossOrigin = \"anonymous\";\n        }\n\n        tempImg.src = url;\n\n        tempImgRender.then(function() {\n            registerThumbnailRenderedListener(canvasOrImg, draw);\n\n            var mpImg = new MegaPixImage(tempImg);\n            mpImg.render(canvasOrImg, {\n                maxWidth: maxSize,\n                maxHeight: maxSize,\n                mime: determineMimeOfFileName(url)\n            });\n        });\n    }\n\n    function drawOnImgFromUrlWithCssScaling(url, img, draw, maxSize) {\n        registerThumbnailRenderedListener(img, draw);\n        qq(img).css({\n            maxWidth: maxSize + \"px\",\n            maxHeight: maxSize + \"px\"\n        });\n\n        img.src = url;\n    }\n\n    // Draw a (server-hosted) thumbnail given a URL.\n    // This will optionally scale the thumbnail as well.\n    // It attempts to use <canvas> to scale, but will fall back\n    // to max-width and max-height style properties if the UA\n    // doesn't support canvas or if the images is cross-domain and\n    // the UA doesn't support the crossorigin attribute on img tags,\n    // which is required to scale a cross-origin image using <canvas> &\n    // then export it back to an <img>.\n    function drawFromUrl(url, container, options) {\n        var draw = new qq.Promise(),\n            scale = options.scale,\n            maxSize = scale ? options.maxSize : null;\n\n        // container is an img, scaling needed\n        if (scale && isImg(container)) {\n            // Iff canvas is available in this UA, try to use it for scaling.\n            // Otherwise, fall back to CSS scaling\n            if (isCanvasSupported()) {\n                // Attempt to use <canvas> for image scaling,\n                // but we must fall back to scaling via CSS/styles\n                // if this is a cross-origin image and the UA doesn't support <img> CORS.\n                if (isCrossOrigin(url) && !isImgCorsSupported()) {\n                    drawOnImgFromUrlWithCssScaling(url, container, draw, maxSize);\n                }\n                else {\n                    drawOnCanvasOrImgFromUrl(url, container, draw, maxSize);\n                }\n            }\n            else {\n                drawOnImgFromUrlWithCssScaling(url, container, draw, maxSize);\n            }\n        }\n        // container is a canvas, scaling optional\n        else if (isCanvas(container)) {\n            drawOnCanvasOrImgFromUrl(url, container, draw, maxSize);\n        }\n        // container is an img & no scaling: just set the src attr to the passed url\n        else if (registerThumbnailRenderedListener(container, draw)) {\n            container.src = url;\n        }\n\n        return draw;\n    }\n\n\n    api = {\n        /**\n         * Generate a thumbnail.  Depending on the arguments, this may either result in\n         * a client-side rendering of an image (if a `Blob` is supplied) or a server-generated\n         * image that may optionally be scaled client-side using <canvas> or CSS/styles (as a fallback).\n         *\n         * @param fileBlobOrUrl a `File`, `Blob`, or a URL pointing to the image\n         * @param container <img> or <canvas> to contain the preview\n         * @param options possible properties include `maxSize` (int), `orient` (bool), and `resize` (bool)\n         * @returns qq.Promise fulfilled when the preview has been drawn, or the attempt has failed\n         */\n        generate: function(fileBlobOrUrl, container, options) {\n            if (qq.isString(fileBlobOrUrl)) {\n                log(\"Attempting to update thumbnail based on server response.\");\n                return drawFromUrl(fileBlobOrUrl, container, options || {})\n            }\n            else {\n                log(\"Attempting to draw client-side image preview.\");\n                return draw(fileBlobOrUrl, container, options || {});\n            }\n        }\n    };\n\n    /*<testing>*/\n    api._testing = {};\n    api._testing.isImg = isImg;\n    api._testing.isCanvas = isCanvas;\n    api._testing.isCrossOrigin = isCrossOrigin;\n    api._testing.determineMimeOfFileName = determineMimeOfFileName;\n    /*</testing>*/\n\n    return api;\n};\n\n/**\n * EXIF image data parser.  Currently only parses the Orientation tag value,\n * but this may be expanded to other tags in the future.\n *\n * @param fileOrBlob Attempt to parse EXIF data in this `Blob`\n * @returns {{parse: Function}}\n * @constructor\n */\nqq.Exif = function(fileOrBlob, log) {\n    // Orientation is the only tag parsed here at this time.\n    var TAG_IDS = [274],\n        TAG_INFO = {\n            274: {\n                name: \"Orientation\",\n                bytes: 2\n            }\n        },\n        api;\n\n    // Convert a little endian (hex string) to big endian (decimal).\n    function parseLittleEndian(hex) {\n        var result = 0,\n            pow = 0;\n\n        while (hex.length > 0) {\n            result += parseInt(hex.substring(0, 2), 16) * Math.pow(2, pow);\n            hex = hex.substring(2, hex.length);\n            pow += 8;\n        }\n\n        return result;\n    }\n\n    // Find the byte offset, of Application Segment 1 (EXIF).\n    // External callers need not supply any arguments.\n    function seekToApp1(offset, promise) {\n        var theOffset = offset,\n            thePromise = promise;\n        if (theOffset === undefined) {\n            theOffset = 2;\n            thePromise = new qq.Promise();\n        }\n\n        qq.readBlobToHex(fileOrBlob, theOffset, 4).then(function(hex) {\n            var match = /^ffe([0-9])/.exec(hex);\n            if (match) {\n                if (match[1] !== \"1\") {\n                    var segmentLength = parseInt(hex.slice(4, 8), 16);\n                    seekToApp1(theOffset + segmentLength + 2, thePromise);\n                }\n                else {\n                    thePromise.success(theOffset);\n                }\n            }\n            else {\n                thePromise.failure(\"No EXIF header to be found!\");\n            }\n        });\n\n        return thePromise;\n    }\n\n    // Find the byte offset of Application Segment 1 (EXIF) for valid JPEGs only.\n    function getApp1Offset() {\n        var promise = new qq.Promise();\n\n        qq.readBlobToHex(fileOrBlob, 0, 6).then(function(hex) {\n            if (hex.indexOf(\"ffd8\") !== 0) {\n                promise.failure(\"Not a valid JPEG!\");\n            }\n            else {\n                seekToApp1().then(function(offset) {\n                    promise.success(offset);\n                },\n                function(error) {\n                    promise.failure(error);\n                });\n            }\n        });\n\n        return promise;\n    }\n\n    // Determine the byte ordering of the EXIF header.\n    function isLittleEndian(app1Start) {\n        var promise = new qq.Promise();\n\n        qq.readBlobToHex(fileOrBlob, app1Start + 10, 2).then(function(hex) {\n            promise.success(hex === \"4949\");\n        });\n\n        return promise;\n    }\n\n    // Determine the number of directory entries in the EXIF header.\n    function getDirEntryCount(app1Start, littleEndian) {\n        var promise = new qq.Promise();\n\n        qq.readBlobToHex(fileOrBlob, app1Start + 18, 2).then(function(hex) {\n            if (littleEndian) {\n                return promise.success(parseLittleEndian(hex));\n            }\n            else {\n                promise.success(parseInt(hex, 16));\n            }\n        });\n\n        return promise;\n    }\n\n    // Get the IFD portion of the EXIF header as a hex string.\n    function getIfd(app1Start, dirEntries) {\n        var offset = app1Start + 20,\n            bytes = dirEntries * 12;\n\n        return qq.readBlobToHex(fileOrBlob, offset, bytes);\n    }\n\n    // Obtain an array of all directory entries (as hex strings) in the EXIF header.\n    function getDirEntries(ifdHex) {\n        var entries = [],\n            offset = 0;\n\n        while (offset+24 <= ifdHex.length) {\n            entries.push(ifdHex.slice(offset, offset + 24));\n            offset += 24;\n        }\n\n        return entries;\n    }\n\n    // Obtain values for all relevant tags and return them.\n    function getTagValues(littleEndian, dirEntries) {\n        var TAG_VAL_OFFSET = 16,\n            tagsToFind = qq.extend([], TAG_IDS),\n            vals = {};\n\n        qq.each(dirEntries, function(idx, entry) {\n            var idHex = entry.slice(0, 4),\n                id = littleEndian ? parseLittleEndian(idHex) : parseInt(idHex, 16),\n                tagsToFindIdx = tagsToFind.indexOf(id),\n                tagValHex, tagName, tagValLength;\n\n            if (tagsToFindIdx >= 0) {\n                tagName = TAG_INFO[id].name;\n                tagValLength = TAG_INFO[id].bytes;\n                tagValHex = entry.slice(TAG_VAL_OFFSET, TAG_VAL_OFFSET + (tagValLength*2));\n                vals[tagName] = littleEndian ? parseLittleEndian(tagValHex) : parseInt(tagValHex, 16);\n\n                tagsToFind.splice(tagsToFindIdx, 1);\n            }\n\n            if (tagsToFind.length === 0) {\n                return false;\n            }\n        });\n\n        return vals;\n    }\n\n    api = {\n        /**\n         * Attempt to parse the EXIF header for the `Blob` associated with this instance.\n         *\n         * @returns {qq.Promise} To be fulfilled when the parsing is complete.\n         * If successful, the parsed EXIF header as an object will be included.\n         */\n        parse: function() {\n            var parser = new qq.Promise(),\n                onParseFailure = function(message) {\n                    log(qq.format(\"EXIF header parse failed: '{}' \", message));\n                    parser.failure(message);\n                };\n\n            getApp1Offset().then(function(app1Offset) {\n                log(qq.format(\"Moving forward with EXIF header parsing for '{}'\", fileOrBlob.name === undefined ? \"blob\" : fileOrBlob.name));\n\n                isLittleEndian(app1Offset).then(function(littleEndian) {\n\n                    log(qq.format(\"EXIF Byte order is {} endian\", littleEndian ? \"little\" : \"big\"));\n\n                    getDirEntryCount(app1Offset, littleEndian).then(function(dirEntryCount) {\n\n                        log(qq.format(\"Found {} APP1 directory entries\", dirEntryCount));\n\n                        getIfd(app1Offset, dirEntryCount).then(function(ifdHex) {\n                            var dirEntries = getDirEntries(ifdHex),\n                                tagValues = getTagValues(littleEndian, dirEntries);\n\n                            log(\"Successfully parsed some EXIF tags\");\n\n                            parser.success(tagValues);\n                        }, onParseFailure);\n                    }, onParseFailure);\n                }, onParseFailure);\n            }, onParseFailure);\n\n            return parser;\n        }\n    };\n\n    /*<testing>*/\n    api._testing = {};\n    api._testing.parseLittleEndian = parseLittleEndian;\n    /*</testing>*/\n\n    return api;\n};\n\nqq.Identify = function(fileOrBlob, log) {\n    var PREVIEWABLE_MAGIC_BYTES = {\n            \"image/jpeg\": \"ffd8ff\",\n            \"image/gif\": \"474946\",\n            \"image/png\": \"89504e\",\n            \"image/bmp\": \"424d\",\n            \"image/tiff\": [\"49492a00\", \"4d4d002a\"]\n        };\n\n    function isIdentifiable(magicBytes, questionableBytes) {\n        var identifiable = false,\n            magicBytesEntries = [].concat(magicBytes);\n\n        qq.each(magicBytesEntries, function(idx, magicBytesArrayEntry) {\n            if (questionableBytes.indexOf(magicBytesArrayEntry) === 0) {\n                identifiable = true;\n                return false;\n            }\n        });\n\n        return identifiable;\n    }\n\n    return {\n        isPreviewable: function() {\n            var idenitifer = new qq.Promise(),\n                previewable = false,\n                name = fileOrBlob.name === undefined ? \"blob\" : fileOrBlob.name;\n\n            log(qq.format(\"Attempting to determine if {} can be rendered in this browser\", name));\n\n            qq.readBlobToHex(fileOrBlob, 0, 4).then(function(hex) {\n                qq.each(PREVIEWABLE_MAGIC_BYTES, function(mime, bytes) {\n                    if (isIdentifiable(bytes, hex)) {\n                        // Safari is the only supported browser that can deal with TIFFs natively,\n                        // so, if this is a TIFF and the UA isn't Safari, declare this file \"non-previewable\".\n                        if (mime !== \"image/tiff\" || qq.safari()) {\n                            previewable = true;\n                            idenitifer.success(mime);\n                        }\n\n                        return false;\n                    }\n                });\n\n                log(qq.format(\"'{}' is {} able to be rendered in this browser\", name, previewable ? \"\" : \"NOT\"));\n\n                if (!previewable) {\n                    idenitifer.failure();\n                }\n            });\n\n            return idenitifer;\n        }\n    }\n};\n\n// Base handler for UI (FineUploader mode) events.\n// Some more specific handlers inherit from this one.\nqq.UiEventHandler = function(s, protectedApi) {\n    \"use strict\";\n\n    var disposer = new qq.DisposeSupport(),\n        spec = {\n            eventType: 'click',\n            attachTo: null,\n            onHandled: function(target, event) {}\n        },\n        // This makes up the \"public\" API methods that will be accessible\n        // to instances constructing a base or child handler\n        publicApi = {\n            addHandler: function(element) {\n                addHandler(element);\n            },\n\n            dispose: function() {\n                disposer.dispose();\n            }\n        };\n\n\n\n    function addHandler(element) {\n        disposer.attach(element, spec.eventType, function(event) {\n            // Only in IE: the `event` is a property of the `window`.\n            event = event || window.event;\n\n            // On older browsers, we must check the `srcElement` instead of the `target`.\n            var target = event.target || event.srcElement;\n\n            spec.onHandled(target, event);\n        });\n    }\n\n    // These make up the \"protected\" API methods that children of this base handler will utilize.\n    qq.extend(protectedApi, {\n        getFileIdFromItem: function(item) {\n            return item.qqFileId;\n        },\n\n        getDisposeSupport: function() {\n            return disposer;\n        }\n    });\n\n\n    qq.extend(spec, s);\n\n    if (spec.attachTo) {\n        addHandler(spec.attachTo);\n    }\n\n    return publicApi;\n};\n\nqq.DeleteRetryOrCancelClickHandler = function(s) {\n    \"use strict\";\n\n    var inheritedInternalApi = {},\n        spec = {\n            templating: null,\n            log: function(message, lvl) {},\n            classes: {\n                cancel: 'qq-upload-cancel',\n                deleteButton: 'qq-upload-delete',\n                retry: 'qq-upload-retry'\n            },\n            onDeleteFile: function(fileId) {},\n            onCancel: function(fileId) {},\n            onRetry: function(fileId) {},\n            onGetName: function(fileId) {}\n    };\n\n    function examineEvent(target, event) {\n        if (spec.templating.isCancel(target) ||\n            spec.templating.isRetry(target) ||\n            spec.templating.isDelete(target)) {\n\n            var fileId = spec.templating.getFileId(target);\n\n            qq.preventDefault(event);\n\n            spec.log(qq.format(\"Detected valid cancel, retry, or delete click event on file '{}', ID: {}.\", spec.onGetName(fileId), fileId));\n            deleteRetryOrCancel(target, fileId);\n        }\n    }\n\n    function deleteRetryOrCancel(target, fileId) {\n        if (spec.templating.isDelete(target)) {\n            spec.onDeleteFile(fileId);\n        }\n        else if (spec.templating.isCancel(target)) {\n            spec.onCancel(fileId);\n        }\n        else {\n            spec.onRetry(fileId);\n        }\n    }\n\n    qq.extend(spec, s);\n\n    spec.eventType = 'click';\n    spec.onHandled = examineEvent;\n    spec.attachTo = spec.templating.getFileList();\n\n    qq.extend(this, new qq.UiEventHandler(spec, inheritedInternalApi));\n};\n\n// Child of FilenameEditHandler.  Used to detect click events on filename display elements.\nqq.FilenameClickHandler = function(s) {\n    \"use strict\";\n\n    var inheritedInternalApi = {},\n        spec = {\n            templating: null,\n            log: function(message, lvl) {},\n            classes: {\n                file: 'qq-upload-file',\n                editNameIcon: 'qq-edit-filename-icon'\n            },\n            onGetUploadStatus: function(fileId) {},\n            onGetName: function(fileId) {}\n    };\n\n    qq.extend(spec, s);\n\n    // This will be called by the parent handler when a `click` event is received on the list element.\n    function examineEvent(target, event) {\n        if (spec.templating.isFileName(target) || spec.templating.isEditIcon(target)) {\n            var fileId = spec.templating.getFileId(target),\n                status = spec.onGetUploadStatus(fileId);\n\n            // We only allow users to change filenames of files that have been submitted but not yet uploaded.\n            if (status === qq.status.SUBMITTED) {\n                spec.log(qq.format(\"Detected valid filename click event on file '{}', ID: {}.\", spec.onGetName(fileId), fileId));\n                qq.preventDefault(event);\n\n                inheritedInternalApi.handleFilenameEdit(fileId, target, true);\n            }\n        }\n    }\n\n    spec.eventType = 'click';\n    spec.onHandled = examineEvent;\n\n    return qq.extend(this, new qq.FilenameEditHandler(spec, inheritedInternalApi));\n};\n\n// Child of FilenameEditHandler.  Used to detect focusin events on file edit input elements.\nqq.FilenameInputFocusInHandler = function(s, inheritedInternalApi) {\n    \"use strict\";\n\n    var spec = {\n            templating: null,\n            onGetUploadStatus: function(fileId) {},\n            log: function(message, lvl) {}\n    };\n\n    if (!inheritedInternalApi) {\n        inheritedInternalApi = {};\n    }\n\n    // This will be called by the parent handler when a `focusin` event is received on the list element.\n    function handleInputFocus(target, event) {\n        if (spec.templating.isEditInput(target)) {\n            var fileId = spec.templating.getFileId(target),\n                status = spec.onGetUploadStatus(fileId);\n\n            if (status === qq.status.SUBMITTED) {\n                spec.log(qq.format(\"Detected valid filename input focus event on file '{}', ID: {}.\", spec.onGetName(fileId), fileId));\n                inheritedInternalApi.handleFilenameEdit(fileId, target);\n            }\n        }\n    }\n\n    spec.eventType = 'focusin';\n    spec.onHandled = handleInputFocus;\n\n    qq.extend(spec, s);\n\n    return qq.extend(this, new qq.FilenameEditHandler(spec, inheritedInternalApi));\n};\n\n/**\n * Child of FilenameInputFocusInHandler.  Used to detect focus events on file edit input elements.  This child module is only\n * needed for UAs that do not support the focusin event.  Currently, only Firefox lacks this event.\n *\n * @param spec Overrides for default specifications\n */\nqq.FilenameInputFocusHandler = function(spec) {\n    \"use strict\";\n\n    spec.eventType = 'focus';\n    spec.attachTo = null;\n\n    return qq.extend(this, new qq.FilenameInputFocusInHandler(spec, {}));\n};\n\n// Handles edit-related events on a file item (FineUploader mode).  This is meant to be a parent handler.\n// Children will delegate to this handler when specific edit-related actions are detected.\nqq.FilenameEditHandler = function(s, inheritedInternalApi) {\n    \"use strict\";\n\n    var spec = {\n            templating: null,\n            log: function(message, lvl) {},\n            onGetUploadStatus: function(fileId) {},\n            onGetName: function(fileId) {},\n            onSetName: function(fileId, newName) {},\n            onEditingStatusChange: function(fileId, isEditing) {}\n        },\n        publicApi;\n\n    function getFilenameSansExtension(fileId) {\n        var filenameSansExt = spec.onGetName(fileId),\n            extIdx = filenameSansExt.lastIndexOf('.');\n\n        if (extIdx > 0) {\n            filenameSansExt = filenameSansExt.substr(0, extIdx);\n        }\n\n        return filenameSansExt;\n    }\n\n    function getOriginalExtension(fileId) {\n        var origName = spec.onGetName(fileId);\n        return qq.getExtension(origName);\n    }\n\n    // Callback iff the name has been changed\n    function handleNameUpdate(newFilenameInputEl, fileId) {\n        var newName = newFilenameInputEl.value,\n            origExtension;\n\n        if (newName !== undefined && qq.trimStr(newName).length > 0) {\n            origExtension = getOriginalExtension(fileId);\n\n            if (origExtension !== undefined) {\n                newName = newName + \".\" + origExtension;\n            }\n\n            spec.onSetName(fileId, newName);\n        }\n\n        spec.onEditingStatusChange(fileId, false);\n    }\n\n    // The name has been updated if the filename edit input loses focus.\n    function registerInputBlurHandler(inputEl, fileId) {\n        inheritedInternalApi.getDisposeSupport().attach(inputEl, 'blur', function() {\n            handleNameUpdate(inputEl, fileId)\n        });\n    }\n\n    // The name has been updated if the user presses enter.\n    function registerInputEnterKeyHandler(inputEl, fileId) {\n        inheritedInternalApi.getDisposeSupport().attach(inputEl, 'keyup', function(event) {\n\n            var code = event.keyCode || event.which;\n\n            if (code === 13) {\n                handleNameUpdate(inputEl, fileId)\n            }\n        });\n    }\n\n    qq.extend(spec, s);\n\n    spec.attachTo = spec.templating.getFileList();\n\n    publicApi = qq.extend(this, new qq.UiEventHandler(spec, inheritedInternalApi));\n\n    qq.extend(inheritedInternalApi, {\n        handleFilenameEdit: function(id, target, focusInput) {\n            var newFilenameInputEl = spec.templating.getEditInput(id);\n\n            spec.onEditingStatusChange(id, true);\n\n            newFilenameInputEl.value = getFilenameSansExtension(id);\n\n            if (focusInput) {\n                newFilenameInputEl.focus();\n            }\n\n            registerInputBlurHandler(newFilenameInputEl, id);\n            registerInputEnterKeyHandler(newFilenameInputEl, id);\n        }\n    });\n\n    return publicApi;\n};\n\n/*globals jQuery, qq*/\n(function($) {\n    \"use strict\";\n    var $el,\n        pluginOptions = ['uploaderType', 'endpointType'];\n\n    function init(options) {\n        if (options) {\n            var xformedOpts = transformVariables(options),\n                newUploaderInstance = getNewUploaderInstance(xformedOpts);\n\n            uploader(newUploaderInstance);\n            addCallbacks(xformedOpts, newUploaderInstance);\n        }\n\n        return $el;\n    }\n\n    function getNewUploaderInstance(params) {\n        var uploaderType = pluginOption('uploaderType'),\n            namespace = pluginOption('endpointType');\n\n        // If the integrator has defined a specific type of uploader to load, use that, otherwise assume `qq.FineUploader`\n        if (uploaderType) {\n            // We can determine the correct constructor function to invoke by combining \"FineUploader\"\n            // with the upper camel cased `uploaderType` value.\n            uploaderType = uploaderType.charAt(0).toUpperCase() + uploaderType.slice(1).toLowerCase();\n\n            if (namespace) {\n                return new qq[namespace][\"FineUploader\" + uploaderType](params);\n            }\n\n            return new qq[\"FineUploader\" + uploaderType](params);\n        }\n        else {\n            if (namespace) {\n                return new qq[namespace][\"FineUploader\"](params);\n            }\n\n            return new qq.FineUploader(params);\n        }\n    }\n\n    function dataStore(key, val) {\n        var data = $el.data('fineuploader');\n\n        if (val) {\n            if (data === undefined) {\n                data = {};\n            }\n            data[key] = val;\n            $el.data('fineuploader', data);\n        }\n        else {\n            if (data === undefined) {\n                return null;\n            }\n            return data[key];\n        }\n    }\n\n    //the underlying Fine Uploader instance is stored in jQuery's data stored, associated with the element\n    // tied to this instance of the plug-in\n    function uploader(instanceToStore) {\n        return dataStore('uploader', instanceToStore);\n    }\n\n    function pluginOption(option, optionVal) {\n        return dataStore(option, optionVal);\n    }\n\n    // Implement all callbacks defined in Fine Uploader as functions that trigger appropriately names events and\n    // return the result of executing the bound handler back to Fine Uploader\n    function addCallbacks(transformedOpts, newUploaderInstance) {\n        var callbacks = transformedOpts.callbacks = {};\n\n        $.each(newUploaderInstance._options.callbacks, function(prop, nonJqueryCallback) {\n            var name, callbackEventTarget;\n\n            name = /^on(\\w+)/.exec(prop)[1];\n            name = name.substring(0, 1).toLowerCase() + name.substring(1);\n            callbackEventTarget = $el;\n\n            callbacks[prop] = function() {\n                var originalArgs = Array.prototype.slice.call(arguments),\n                    transformedArgs = [],\n                    nonJqueryCallbackRetVal, jqueryEventCallbackRetVal;\n\n                $.each(originalArgs, function(idx, arg) {\n                    transformedArgs.push(maybeWrapInJquery(arg));\n                });\n\n                nonJqueryCallbackRetVal = nonJqueryCallback.apply(this, originalArgs);\n                jqueryEventCallbackRetVal = callbackEventTarget.triggerHandler(name, transformedArgs);\n\n                if (nonJqueryCallbackRetVal != null) {\n                    return nonJqueryCallbackRetVal;\n                }\n                return jqueryEventCallbackRetVal;\n            };\n        });\n\n        newUploaderInstance._options.callbacks = callbacks;\n    }\n\n    //transform jQuery objects into HTMLElements, and pass along all other option properties\n    function transformVariables(source, dest) {\n        var xformed, arrayVals;\n\n        if (dest === undefined) {\n            if (source.uploaderType !== 'basic') {\n                xformed = { element : $el[0] };\n            }\n            else {\n                xformed = {};\n            }\n        }\n        else {\n            xformed = dest;\n        }\n\n        $.each(source, function(prop, val) {\n            if ($.inArray(prop, pluginOptions) >= 0) {\n                pluginOption(prop, val);\n            }\n            else if (val instanceof $) {\n                xformed[prop] = val[0];\n            }\n            else if ($.isPlainObject(val)) {\n                xformed[prop] = {};\n                transformVariables(val, xformed[prop]);\n            }\n            else if ($.isArray(val)) {\n                arrayVals = [];\n                $.each(val, function(idx, arrayVal) {\n                    var arrayObjDest = {};\n\n                    if (arrayVal instanceof $) {\n                        $.merge(arrayVals, arrayVal);\n                    }\n                    else if ($.isPlainObject(arrayVal)) {\n                        transformVariables(arrayVal, arrayObjDest);\n                        arrayVals.push(arrayObjDest);\n                    }\n                    else {\n                        arrayVals.push(arrayVal);\n                    }\n                });\n                xformed[prop] = arrayVals;\n            }\n            else {\n                xformed[prop] = val;\n            }\n        });\n\n        if (dest === undefined) {\n            return xformed;\n        }\n    }\n\n    function isValidCommand(command) {\n        return $.type(command) === \"string\" &&\n            !command.match(/^_/) && //enforce private methods convention\n            uploader()[command] !== undefined;\n    }\n\n    // Assuming we have already verified that this is a valid command, call the associated function in the underlying\n    // Fine Uploader instance (passing along the arguments from the caller) and return the result of the call back to the caller\n    function delegateCommand(command) {\n        var xformedArgs = [],\n            origArgs = Array.prototype.slice.call(arguments, 1),\n            retVal;\n\n        transformVariables(origArgs, xformedArgs);\n\n        retVal = uploader()[command].apply(uploader(), xformedArgs);\n\n        return maybeWrapInJquery(retVal);\n    }\n\n    // If the value is an `HTMLElement` or `HTMLDocument`, wrap it in a `jQuery` object\n    function maybeWrapInJquery(val) {\n        var transformedVal = val;\n\n        // If the command is returning an `HTMLElement` or `HTMLDocument`, wrap it in a `jQuery` object\n        if(val != null && typeof val === \"object\"\n            && (val.nodeType === 1 || val.nodeType === 9)\n            && val.cloneNode) {\n\n            transformedVal = $(val);\n        }\n\n        return transformedVal;\n    }\n\n    $.fn.fineUploader = function(optionsOrCommand) {\n        var self = this, selfArgs = arguments, retVals = [];\n\n        this.each(function(index, el) {\n            $el = $(el);\n\n            if (uploader() && isValidCommand(optionsOrCommand)) {\n                retVals.push(delegateCommand.apply(self, selfArgs));\n\n                if (self.length === 1) {\n                    return false;\n                }\n            }\n            else if (typeof optionsOrCommand === 'object' || !optionsOrCommand) {\n                init.apply(self, selfArgs);\n            }\n            else {\n                $.error('Method ' +  optionsOrCommand + ' does not exist on jQuery.fineUploader');\n            }\n        });\n\n        if (retVals.length === 1) {\n            return retVals[0];\n        }\n        else if (retVals.length > 1) {\n            return retVals;\n        }\n\n        return this;\n    };\n\n}(jQuery));\n\n/*globals jQuery, qq*/\n(function($) {\n    \"use strict\";\n    var rootDataKey = \"fineUploaderDnd\",\n        $el;\n\n    function init (options) {\n        if (!options) {\n            options = {};\n        }\n\n        options.dropZoneElements = [$el];\n        var xformedOpts = transformVariables(options);\n        addCallbacks(xformedOpts);\n        dnd(new qq.DragAndDrop(xformedOpts));\n\n        return $el;\n    };\n\n    function dataStore(key, val) {\n        var data = $el.data(rootDataKey);\n\n        if (val) {\n            if (data === undefined) {\n                data = {};\n            }\n            data[key] = val;\n            $el.data(rootDataKey, data);\n        }\n        else {\n            if (data === undefined) {\n                return null;\n            }\n            return data[key];\n        }\n    };\n\n    function dnd(instanceToStore) {\n        return dataStore('dndInstance', instanceToStore);\n    };\n\n    function addCallbacks(transformedOpts) {\n        var callbacks = transformedOpts.callbacks = {},\n            dndInst = new qq.FineUploaderBasic();\n\n        $.each(new qq.DragAndDrop.callbacks(), function(prop, func) {\n            var name = prop,\n                $callbackEl;\n\n            $callbackEl = $el;\n\n            callbacks[prop] = function() {\n                var args = Array.prototype.slice.call(arguments),\n                    jqueryHandlerResult = $callbackEl.triggerHandler(name, args);\n\n                return jqueryHandlerResult;\n            };\n        });\n    };\n\n    //transform jQuery objects into HTMLElements, and pass along all other option properties\n    function transformVariables(source, dest) {\n        var xformed, arrayVals;\n\n        if (dest === undefined) {\n            xformed = {};\n        }\n        else {\n            xformed = dest;\n        }\n\n        $.each(source, function(prop, val) {\n            if (val instanceof $) {\n                xformed[prop] = val[0];\n            }\n            else if ($.isPlainObject(val)) {\n                xformed[prop] = {};\n                transformVariables(val, xformed[prop]);\n            }\n            else if ($.isArray(val)) {\n                arrayVals = [];\n                $.each(val, function(idx, arrayVal) {\n                    if (arrayVal instanceof $) {\n                        $.merge(arrayVals, arrayVal);\n                    }\n                    else {\n                        arrayVals.push(arrayVal);\n                    }\n                });\n                xformed[prop] = arrayVals;\n            }\n            else {\n                xformed[prop] = val;\n            }\n        });\n\n        if (dest === undefined) {\n            return xformed;\n        }\n    };\n\n    function isValidCommand(command) {\n        return $.type(command) === \"string\" &&\n            command === \"dispose\" &&\n            dnd()[command] !== undefined;\n    };\n\n    function delegateCommand(command) {\n        var xformedArgs = [], origArgs = Array.prototype.slice.call(arguments, 1);\n        transformVariables(origArgs, xformedArgs);\n        return dnd()[command].apply(dnd(), xformedArgs);\n    };\n\n    $.fn.fineUploaderDnd = function(optionsOrCommand) {\n        var self = this, selfArgs = arguments, retVals = [];\n\n        this.each(function(index, el) {\n            $el = $(el);\n\n            if (dnd() && isValidCommand(optionsOrCommand)) {\n                retVals.push(delegateCommand.apply(self, selfArgs));\n\n                if (self.length === 1) {\n                    return false;\n                }\n            }\n            else if (typeof optionsOrCommand === 'object' || !optionsOrCommand) {\n                init.apply(self, selfArgs);\n            }\n            else {\n                $.error(\"Method \" +  optionsOrCommand + \" does not exist in Fine Uploader's DnD module.\");\n            }\n        });\n\n        if (retVals.length === 1) {\n            return retVals[0];\n        }\n        else if (retVals.length > 1) {\n            return retVals;\n        }\n\n        return this;\n    };\n\n}(jQuery));\n\n/*! 2013-11-20 */\n"

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)
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
	  blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
	  list: /^( *)(bull) [\s\S]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
	  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
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
	  ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
	  ();

	block._tag = '(?!(?:'
	  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
	  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
	  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|@)\\b';

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

	Lexer.prototype.token = function(src, top) {
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
	      this.token(cap, top);

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
	        this.token(item, false);

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
	    if (top && (cap = this.rules.def.exec(src))) {
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
	      out += '<a href="'
	        + href
	        + '">'
	        + text
	        + '</a>';
	      continue;
	    }

	    // url (gfm)
	    if (cap = this.rules.url.exec(src)) {
	      src = src.substring(cap[0].length);
	      text = escape(cap[1]);
	      href = text;
	      out += '<a href="'
	        + href
	        + '">'
	        + text
	        + '</a>';
	      continue;
	    }

	    // tag
	    if (cap = this.rules.tag.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.options.sanitize
	        ? escape(cap[0])
	        : cap[0];
	      continue;
	    }

	    // link
	    if (cap = this.rules.link.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.outputLink(cap, {
	        href: cap[2],
	        title: cap[3]
	      });
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
	      out += this.outputLink(cap, link);
	      continue;
	    }

	    // strong
	    if (cap = this.rules.strong.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += '<strong>'
	        + this.output(cap[2] || cap[1])
	        + '</strong>';
	      continue;
	    }

	    // em
	    if (cap = this.rules.em.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += '<em>'
	        + this.output(cap[2] || cap[1])
	        + '</em>';
	      continue;
	    }

	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += '<code>'
	        + escape(cap[2], true)
	        + '</code>';
	      continue;
	    }

	    // br
	    if (cap = this.rules.br.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += '<br>';
	      continue;
	    }

	    // del (gfm)
	    if (cap = this.rules.del.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += '<del>'
	        + this.output(cap[1])
	        + '</del>';
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
	  if (cap[0].charAt(0) !== '!') {
	    return '<a href="'
	      + escape(link.href)
	      + '"'
	      + (link.title
	      ? ' title="'
	      + escape(link.title)
	      + '"'
	      : '')
	      + '>'
	      + this.output(cap[1])
	      + '</a>';
	  } else {
	    return '<img src="'
	      + escape(link.href)
	      + '" alt="'
	      + escape(cap[1])
	      + '"'
	      + (link.title
	      ? ' title="'
	      + escape(link.title)
	      + '"'
	      : '')
	      + '>';
	  }
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
	 * Parsing & Compiling
	 */

	function Parser(options) {
	  this.tokens = [];
	  this.token = null;
	  this.options = options || marked.defaults;
	}

	/**
	 * Static Parse Method
	 */

	Parser.parse = function(src, options) {
	  var parser = new Parser(options);
	  return parser.parse(src);
	};

	/**
	 * Parse Loop
	 */

	Parser.prototype.parse = function(src) {
	  this.inline = new InlineLexer(src.links, this.options);
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
	      return '<hr>\n';
	    }
	    case 'heading': {
	      return '<h'
	        + this.token.depth
	        + ' id="'
	        + this.token.text.toLowerCase().replace(/[^\w]+/g, '-')
	        + '">'
	        + this.inline.output(this.token.text)
	        + '</h'
	        + this.token.depth
	        + '>\n';
	    }
	    case 'code': {
	      if (this.options.highlight) {
	        var code = this.options.highlight(this.token.text, this.token.lang);
	        if (code != null && code !== this.token.text) {
	          this.token.escaped = true;
	          this.token.text = code;
	        }
	      }

	      if (!this.token.escaped) {
	        this.token.text = escape(this.token.text, true);
	      }

	      return '<pre><code'
	        + (this.token.lang
	        ? ' class="'
	        + this.options.langPrefix
	        + this.token.lang
	        + '"'
	        : '')
	        + '>'
	        + this.token.text
	        + '</code></pre>\n';
	    }
	    case 'table': {
	      var body = ''
	        , heading
	        , i
	        , row
	        , cell
	        , j;

	      // header
	      body += '<thead>\n<tr>\n';
	      for (i = 0; i < this.token.header.length; i++) {
	        heading = this.inline.output(this.token.header[i]);
	        body += '<th';
	        if (this.token.align[i]) {
	          body += ' style="text-align:' + this.token.align[i] + '"';
	        }
	        body += '>' + heading + '</th>\n';
	      }
	      body += '</tr>\n</thead>\n';

	      // body
	      body += '<tbody>\n'
	      for (i = 0; i < this.token.cells.length; i++) {
	        row = this.token.cells[i];
	        body += '<tr>\n';
	        for (j = 0; j < row.length; j++) {
	          cell = this.inline.output(row[j]);
	          body += '<td';
	          if (this.token.align[j]) {
	            body += ' style="text-align:' + this.token.align[j] + '"';
	          }
	          body += '>' + cell + '</td>\n';
	        }
	        body += '</tr>\n';
	      }
	      body += '</tbody>\n';

	      return '<table>\n'
	        + body
	        + '</table>\n';
	    }
	    case 'blockquote_start': {
	      var body = '';

	      while (this.next().type !== 'blockquote_end') {
	        body += this.tok();
	      }

	      return '<blockquote>\n'
	        + body
	        + '</blockquote>\n';
	    }
	    case 'list_start': {
	      var type = this.token.ordered ? 'ol' : 'ul'
	        , body = '';

	      while (this.next().type !== 'list_end') {
	        body += this.tok();
	      }

	      return '<'
	        + type
	        + '>\n'
	        + body
	        + '</'
	        + type
	        + '>\n';
	    }
	    case 'list_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.token.type === 'text'
	          ? this.parseText()
	          : this.tok();
	      }

	      return '<li>'
	        + body
	        + '</li>\n';
	    }
	    case 'loose_item_start': {
	      var body = '';

	      while (this.next().type !== 'list_item_end') {
	        body += this.tok();
	      }

	      return '<li>'
	        + body
	        + '</li>\n';
	    }
	    case 'html': {
	      return !this.token.pre && !this.options.pedantic
	        ? this.inline.output(this.token.text)
	        : this.token.text;
	    }
	    case 'paragraph': {
	      return '<p>'
	        + this.inline.output(this.token.text)
	        + '</p>\n';
	    }
	    case 'text': {
	      return '<p>'
	        + this.parseText()
	        + '</p>\n';
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

	    var done = function() {
	      var out, err;

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
	  smartypants: false
	};

	/**
	 * Expose
	 */

	marked.Parser = Parser;
	marked.parser = Parser.parse;

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
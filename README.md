# Makona Block-Style Editor

Makona (Hawaiian for Mason), is a block-style editor for [React JS](http://facebook.github.io/react/index.html).
As opposed to your standard WYSIWYG rich text editor, usually with a raft of little icons for formatting, Makona operates on
a block paradigm, whereby you build up a document with blocks of content, which can be text blocks,
code bocks, markdown blocks, image blocks, etc. The blocks can be reordered by dragging and dropping. Blocks should be
as plain-text as possible, and not blobs of HTML. Editing the text in a block is done with a simple `textarea`, not
a contenteditable `div`.

The final result is a JSON object with the content of each block. The idea is to store this JSON instead of the resulting
HTML, that way you could apply different HTML structures and CSS styles to the content, or reuse it in interesting ways. Another thought is
to store the JSON in a PostgreSQL h-store column, and allow for deep-indexing of the structure.

At any rate, this is currently a very rough spike. The basic mechanics are there, but the visual aspects still need a lot
of work. Are you a creative type looking to contribute to a cool new open-source project? ;)


## Inspiration
[Sir Trevor](http://github.com/madebymany/sir-trevor-js) is another take on a block-style editor.


## Goals
Makona's goals are a bit different from Sir Trevor and others:

* Based on [React JS](http://facebook.github.io/react/index.html) for a solid foundation.
* Work on wider range of platforms, including legacy browsers (IE8+) up to modern tablets
* All editing is done in a `<textarea>` (as opposed to a contenteditable div), so we sacrifice WYSIWYG while actually editing, but we gain universal compatibility.

## Styling
React seems to guide you to use inline styles for your components, and makes it easy to do. Trying to find the right balance between inline styles for structural things, and then allowing for look-and-feel to be adjusted via external stylesheets. Different "themes" should be able to be applied via stylesheets, but the styles that are required for the component to actually *work* will go inline. Blurred lines, baby.

## Dependencies
This requires a lot of JS libs to work, the plan is to slim things down once its all working. The main reason jQuery is used currently is for the drag-and-drop sorting. Once we implement this behavior in native React we can (probably?) ditch the jQuery dependency. Certain block types will each have their own dependencies, so if you dont need the image upload block, then you dont need the fineuploader libs, etc.



### Building Your Copy of Makona

The process to build Makona is haphazard at best. This is a spike, after all.

#### Prerequisites

* You have `node` installed at v0.10.0+
* You are familiar with `npm` and know whether or not you need to use `sudo` when installing packages globally.
* You are familiar with `git`.

#### Build

Once you have the repository cloned, building it is really easy...

```sh
# grunt-cli is needed by grunt; you might have this installed already
npm install -g grunt-cli
npm install -g bower
npm install
bower install
grunt server
```

At this point, you should now have a `dist/` directory populated with all the necessary files, and an index.html to kick things off.

Once your local server is running, [try it out!](http://localhost:9292/dist/index.html)

## TODO
See http://jsfiddle.net/johnthethird/dLc8pt64/ for better sortable technique.
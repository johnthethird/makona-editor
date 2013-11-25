# Makona Block-Style Editor

Makona (Hawaiian for Mason), is a block-style editor for [React JS](http://facebook.github.io/react/index.html).
As opposed to your standard WYSIWYG rich text editor, usually with a raft of little icons for formatting, Makona operates on
a block paradigm, whereby you build up a document with blocks of content, which can be text blocks,
code bocks, markdown blocks, image blocks, etc. The blocks can be reordered by dragging and dropping.

The final result is a JSON object with the content of each block. The idea is to store this JSON instead of the resulting
HTML, that way you could apply different CSS styles to the content, or reuse it in interesting ways. Another thought is
to store the JSON in a PostgreSQL h-store column, and allow for deep-indexing of the structure.

At any rate, this is currently a very rough spike. The basic mechanics are there, but the visual aspects still need a lot
of work. Are you a creative type looking to contribute to a cool new open-source project? ;)


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
npm install
grunt build
```

At this point, you should now have a `dist/` directory populated with all the necessary files, and an index.html to kick things off.


## Inspiration
[Sir Trevor](http://github.com/madebymany/sir-trevor-js) is another take on a block-style editor.

# redactable-markdown

[![Build Status](https://github.com/code-dot-org/redactable-markdown/actions/workflows/continuous-integration-tests.yml/badge.svg?branch=master)](https://github.com/code-dot-org/redactable-markdown/actions/workflows/continuous-integration-tests.yml)
[![npm version](https://img.shields.io/npm/v/@code-dot-org/redactable-markdown.svg)](https://www.npmjs.com/package/@code-dot-org/redactable-markdown)

tools for parsing and translating the modified version of markdown used by code.org

## Overview

The standard operation that can be done on a piece of markdown content is
Rendering; the act of parsing the markdown content into an understandable
structure and compiling that structure out to (usually) HTML.

To facilitate better translation of markdown and extended CDO Markdown, we add
two new operations: Redaction and Restoration

## Redaction

Redaction is the process of parsing markdown content into an understandable
form, then compiling that structure back out to markdown with some values
removed and some syntaxes simplified.

For example, standard markdown links and images:

    [a link](http://example.com)
    ![an image](http://example.com/img.jpg)

Have their url and href values removed in the redaction process, and in the case
of images the special `!` character is also removed; simplifying them to just:

    [a link][0]
    [an image][1]

The result is that translators are exposed to just those parts of the original
content that we actually want them to translate. This means on our end that we
can do much less work to verify that translators are not breaking anything or
introducing malicious content, and on the translator's end it means they need to
worry much less about trying to determine which parts of the string they should
and should not be responsible for changing.

In general, content is always redacted to two sets of square brackets, the first
enclosing whatever english text we want to expose to the translators and the
second enclosing a unique numeric ID we use to associate the redacted content
back with the original data during the restoration process.

### Other examples

#### Divclass

A new syntax introduced by CDO Markdown, divclasses are a great example of
"block" redactions. Divclasses allow us to wrap bits of content in divs with a
given class, and they look like:

    [some-class-name]

    Inner content

    - content can contain
    - *whatever* __syntax__ we generally support
    - Including [things that get redacted](http://example.com)

    [/some-class-name]

That content would get redacted to:

    [][0]

    Inner content

    -   content can contain
    -   _whatever_ **syntax** we generally support
    -   Including [things that get redacted][1]

    [/][0]

#### Vocabulary Definition

A new syntax originally introduced to support CurriculumBuilder (but since
expanded to Dashboard's Markdown Preprocessor), Vocabulary Definitions are a
great example of a simple inline redaction with a slightly more complicated
restoration process.  Vocablinks are used to embed definitions for complex
terms within a paragraph, and they look like:

    In particular we are interested in developing a more robust [v protocol/coursea/2021] for sending a list of numbers over the internet.

That content would get redacted to:

    In particular we are interested in developing a more robust [protocol][0] for sending a list of numbers over the internet.

## Restoration

After redacting content and sending the redacted content out to be translated,
we will get back a translated version of the redacted content. We then combine
that with the original content to create a restored translated version of the
original content.

For example, standard markdown links and images:

    [a link](http://example.com)
    ![an image](http://example.com/img.jpg)

After getting redacted and translated, might come back looking like:

    [un linke][0]
    [une image][1]

And would then be recombined with the original content to produce:

    [un linke](http://example.com)
    ![une image](http://example.com/img.jpg)

Note that the unique identifiers for each piece of redacted content allow us to
handle any reordering that might be introduced by the translation process. For
example,

    A [black](http://example.com/black) [cat](http://example.com/cat)

Would be redacted to

    A [black][0] [cat][1]

Then translated to

    Un [chat][1] [noir][0]

Then restored to

    Un [chat](http://example.com/cat) [noir](http://example.com/black)

## Plugins

To define redaction and restoration functionality for a new or existing piece of
syntax, simply create a plugin. Plugins start as remark-parse plugins of the
form described in [remark-parse Extending the
Parser](https://github.com/remarkjs/remark/tree/master/packages/remark-parse#extending-the-parser),
and examples can be found [in the source tree](/src/plugins/parser/).

### Basic Redaction Example

For example, let's add redaction to the `mention` plugin in the remark-parse
example. We start with `mention.js` from that example:

```javascript
module.exports = mentions;

function mentions() {
  var Parser = this.Parser;
  var tokenizers = Parser.prototype.inlineTokenizers;
  var methods = Parser.prototype.inlineMethods;

  /* Add an inline tokenizer (defined in the following example). */
  tokenizers.mention = tokenizeMention;

  /* Run it just before `text`. */
  methods.splice(methods.indexOf('text'), 0, 'mention');
}

tokenizeMention.notInLink = true;
tokenizeMention.locator = locateMention;

function tokenizeMention(eat, value, silent) {
  var match = /^@(\w+)/.exec(value);

  if (match) {
    if (silent) {
      return true;
    }

    return eat(match[0])({
      type: 'link',
      url: 'https://social-network/' + match[1],
      children: [{type: 'text', value: match[0]}]
    });
  }
}

function locateMention(value, fromIndex) {
  return value.indexOf('@', fromIndex);
}
```

First, isolate the logic that extracts meaningful data from the parsed token
from the logic that builds a node from that extracted data:

```diff
diff --git a/mention.js b/mention.js
index c87085f..12b67ed 100644
--- a/mention.js
+++ b/mention.js
@@ -23,14 +29,19 @@ function tokenizeMention(eat, value, silent) {
       return true;
     }

-    return eat(match[0])({
-      type: 'link',
-      url: 'https://social-network/' + match[1],
-      children: [{type: 'text', value: match[0]}]
-    });
+    var add = eat(match[0]);
+    return createMention(add, match[1], match[0]);
   }
 }

 function locateMention(value, fromIndex) {
   return value.indexOf('@', fromIndex);
 }
+
+function createMention(add, name, text) {
+  return add({
+    type: 'link',
+    url: 'https://social-network/' + name,
+    children: [{type: 'text', value: text}]
+  });
+}
```

Then, conditionally create a `redaction` node instead of the desired regular
node when in redaction mode (see more about the `redaction` node
[here](https://github.com/code-dot-org/redactable-markdown/blob/29c64b3c9e736e28746e6a8627b57c8cc3f0dcc0/src/plugins/process/restorationRegistration.js#L8-L15)):

Note here that all that is required of the redaction node is that it contains a
unique `redactionType` identifier, and any information required to recreate the
node.

```diff
diff --git a/mention.js b/mention.js
index 7a6fc91..08f1bf0 100644
--- a/mention.js
+++ b/mention.js
@@ -1,10 +1,15 @@
 module.exports = mentions;

+var redact;
+
 function mentions() {
   var Parser = this.Parser;
   var tokenizers = Parser.prototype.inlineTokenizers;
   var methods = Parser.prototype.inlineMethods;

+  /* Make the Parser's redact option visible to the tokenizer */
+  redact = Parser.prototype.options.redact;
+
   /* Add an inline tokenizer (defined in the following example). */
   tokenizers.mention = tokenizeMention;

@@ -24,7 +29,19 @@ function tokenizeMention(eat, value, silent) {
     }

     var add = eat(match[0]);
-    return createMention(add, match[1], match[0]);
+    var name = match[1];
+    var text = match[0];
+
+    if (redact) {
+      return add({
+        type: 'redaction',
+        redactionType: 'mention',
+        name: name,
+        text: text
+      });
+    }
+
+    return createMention(add, name, text);
   }
 }
```

Finally, add a restoration method for the specified redaction type, using the
newly-isolated node creation logic.

```diff
diff --git a/mention.js b/mention.js
index 08f1bf0..beb01ca 100644
--- a/mention.js
+++ b/mention.js
@@ -6,6 +6,11 @@ function mentions() {
   var Parser = this.Parser;
   var tokenizers = Parser.prototype.inlineTokenizers;
   var methods = Parser.prototype.inlineMethods;
+  var restorationMethods = Parser.prototype.restorationMethods;
+
+  restorationMethods.mention = function (add, node) {
+    return createMention(add, node.name, node.text);
+  }

   /* Make the Parser's redact option visible to the tokenizer */
   redact = Parser.prototype.options.redact;
```

We can now redact and restore `@` mentions:

```bash
$ echo "Hello @example" > source.md
$ redact source.md -p mention.js | tee redacted.md
Hello [][0]
$ sed 's/Hello/Bonjour/' redacted.md | tee translated.md
Bonjour [][0]
$ restore -s source.md -r translated.md -p mention.js
Bonjour [@example](https://social-network/example)
```

### Advanced Redaction Example

We also have the option of allowing the redaction and restoration process to
change the way the parsed text is processed.

Say we wanted the redacted version of the basic example to expose the `@` name
like:

    Hello [@example][0]

And for changes made to the text in the redaction to be reflected in the
generated link like:

    Bonjour [@exemple][0] > Bonjour [@exemple](https://social-network/example)

To achieve that, we first move the `text` value from a property on the
`redaction` node to a full `text` child node:

```diff
diff --git a/mention.js b/mention.js
index beb01ca..af09cc5 100644
--- a/mention.js
+++ b/mention.js
@@ -42,7 +42,11 @@ function tokenizeMention(eat, value, silent) {
         type: 'redaction',
         redactionType: 'mention',
         name: name,
-        text: text
+        children: [{
+          type: 'text',
+          value: text
+        }]
       });
     }
```

Then, we expand the restoration method to make use of the optional `content`
argument, which will contain the modified version of the text content.

```diff
diff --git a/mention.js b/mention.js
index beb01ca..af09cc5 100644
--- a/mention.js
+++ b/mention.js
@@ -8,8 +8,8 @@ function mentions() {
   var methods = Parser.prototype.inlineMethods;
   var restorationMethods = Parser.prototype.restorationMethods;

-  restorationMethods.mention = function (add, node) {
-    return createMention(add, node.name, node.text);
+  restorationMethods.mention = function (add, node, content) {
+    return createMention(add, node.name, content);
   }

   /* Make the Parser's redact option visible to the tokenizer */
```

The result:

```bash
$ echo "Hello @example" > source.md
$ redact source.md -p mention.js | tee redacted.md
Hello [@example][0]
$ sed -e 's/Hello/Bonjour/' -e 's/example/exemple/' redacted.md | tee translated.md
Bonjour [@exemple][0]
$ restore -s source.md -r translated.md -p mention.js
Bonjour [@exemple](https://social-network/example)
```

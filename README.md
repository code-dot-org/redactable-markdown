# redactable-markdown

[![Travis Build Status](https://img.shields.io/travis/code-dot-org/redactable-markdown/master.svg)](https://travis-ci.org/code-dot-org/redactable-markdown/)
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

#### Vocablink

A new syntax introduced by CDO Markdown to support Curriculum Builder,
vocablinks are a great example of a simple inline redaction with a slightly more
complicated restoration process.  Vocablinks are used by Curriculum Builder to
embed definitions for complex terms within a paragraph, and they look like:

    In particular we are interested in developing a more robust [v protocol] for
    sending a list of numbers over the internet.

That content would get redacted to:

    In particular we are interested in developing a more robust [protocol][0] for
    sending a list of numbers over the internet.

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

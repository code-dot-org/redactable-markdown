### Markdown Restrictions

For things like image and link tags in markdown, we would like translators to be able to translate the link text and image alt text without being able to update the actual image or link url being referenced:

Link example: [translators should be able to translate this](http://example.com/translators-should-not-be-able-to-translate-this)

Image example: ![translators should be able to translate this](http://example.com/translators-should-not-be-able-to-translate-this.jpg)

### Markdown Extensions

We'd also like to add a couple bits of new syntax to markdown.

#### Tables

A basic table in this syntax looks like this

| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |

Translators should be able to edit the headers and cells individually.

Ideally, translators should not be able to change the number of headers or cells or be able to remove any of the `|` characters, but that is definitely a "nice-to-have" and not a requirement

#### Tips

Tips include two bits of syntax; one inline and one block.

The inline version looks like this: tip!!!tip-0

None of the inline version should be editable at all.

The block version looks like this:

!!!tip "this is an optional title, and it should be translatable" <tip-0>

    This is the content of the tip, and it should be translatable
    
Or like this:

!!!tip <tip-0>

    This is the content of the tip, and it should be translatable
    
For the block version, only the optional title and the content should be translatable, but none of other other syntax (the `!!!tip` and `<tip-0>` bits should _not_ be translatable).

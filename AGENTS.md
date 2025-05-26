# Contributor Guide

## Dev Environment Tips
- 

## Testing Instructions
- Run `yarn ci` to run every check.
- From the package root you can just call `yarn ci`. The commit should pass all tests before you merge.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run `yarn lint` to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions
- Use Conventional Commits syntax
  0.  The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).
  1.  Commits MUST be prefixed with a type, which consists of a noun, `feat`, `fix`, etc., followed by the OPTIONAL scope, OPTIONAL `!`, and REQUIRED terminal colon and space.
  2.  The type `feat` MUST be used when a commit adds a new feature to your application or library.
  3.  The type `fix` MUST be used when a commit represents a bug fix for your application.
  4.  A scope MAY be provided after a type. A scope MUST consist of a noun describing a section of the codebase surrounded by parenthesis, e.g., `fix(parser):`
  5.  A description MUST immediately follow the colon and space after the type/scope prefix. The description is a short summary of the code changes, e.g., _fix: array parsing issue when multiple spaces were contained in string_.
  6.  A longer commit body MAY be provided after the short description, providing additional contextual information about the code changes. The body MUST begin one blank line after the description.
  7.  A commit body is free-form and MAY consist of any number of newline separated paragraphs.
  8.  One or more footers MAY be provided one blank line after the body. Each footer MUST consist of a word token, followed by either a `:<space>` or `<space>#` separator, followed by a string value (this is inspired by the [git trailer convention](https://git-scm.com/docs/git-interpret-trailers)).
  9.  A footer’s token MUST use `-` in place of whitespace characters, e.g., `Acked-by` (this helps differentiate the footer section from a multi-paragraph body). An exception is made for `BREAKING CHANGE`, which MAY also be used as a token.
  10.  A footer’s value MAY contain spaces and newlines, and parsing MUST terminate when the next valid footer token/separator pair is observed.
  11.  Breaking changes MUST be indicated in the type/scope prefix of a commit, or as an entry in the footer.
  12.  If included as a footer, a breaking change MUST consist of the uppercase text BREAKING CHANGE, followed by a colon, space, and description, e.g., _BREAKING CHANGE: environment variables now take precedence over config files_.
  13.  If included in the type/scope prefix, breaking changes MUST be indicated by a `!` immediately before the `:`. If `!` is used, `BREAKING CHANGE:` MAY be omitted from the footer section, and the commit description SHALL be used to describe the breaking change.
  14.  Types other than `feat` and `fix` MAY be used in your commit messages, e.g., _docs: update ref docs._
  15.  The units of information that make up Conventional Commits MUST NOT be treated as case sensitive by implementors, with the exception of BREAKING CHANGE which MUST be uppercase.
  16.  BREAKING-CHANGE MUST be synonymous with BREAKING CHANGE, when used as a token in a footer.

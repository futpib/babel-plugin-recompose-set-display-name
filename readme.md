# babel-plugin-recompose-set-display-name

> Automatically add `displayName`s to recompose components

[![Build Status](https://travis-ci.org/futpib/babel-plugin-recompose-set-display-name.svg?branch=master)](https://travis-ci.org/futpib/babel-plugin-recompose-set-display-name) [![Coverage Status](https://coveralls.io/repos/github/futpib/babel-plugin-recompose-set-display-name/badge.svg?branch=master)](https://coveralls.io/github/futpib/babel-plugin-recompose-set-display-name?branch=master)

## Example

```js
const Foo = compose(
	withProps(...),
	withStateHandlers(...),
	setDisplayName('Foo'), // You don't have to write this! It will be added by Babel
)(() => (
	<div>
		foo
	</div>
))
```

## Install

```
yarn add --dev babel-plugin-recompose-set-display-name
```


import test from 'ava';

import { transform } from 'babel-core';

import plugin from '.';

const normalizeCodeString = code => transform(code).code.trim();

const macro = (t, input, output = input) => {
	const { code } = transform(input, {
		plugins: [ plugin ],
	});

	t.is(normalizeCodeString(code), normalizeCodeString(output));
};

test('transforms exported recompose component', macro, `
import { compose } from 'recompose';

export const Foo = compose(
	foo,
	bar,
)(() => 'buz');
`, `
import { compose, setDisplayName } from 'recompose';

export const Foo = compose(foo, bar, setDisplayName('Foo'))(() => 'buz');
`);

test('transforms local recompose component', macro, `
import { compose } from 'recompose';

const Foo = compose(
	foo,
	bar,
)(() => 'buz');
`, `
import { compose, setDisplayName } from 'recompose';

const Foo = compose(foo, bar, setDisplayName('Foo'))(() => 'buz');
`);

test('does not add a second `setDisplayName` import', macro, `
import { compose, setDisplayName } from 'recompose';

const Foo = compose(
	foo,
	setDisplayName('Bar'),
	bar,
)(() => 'buz');
`, `
import { compose, setDisplayName } from 'recompose';

const Foo = compose(foo, setDisplayName('Bar'), bar, setDisplayName('Foo'))(() => 'buz');
`);

test('does not transform any `compose` call', macro, `
import { compose } from 'ramda';

export const Foo = compose(foo, bar)(() => 'buz');
`);

test('does not transform an already set displayName', macro, `
import { compose, setDisplayName } from 'recompose';

export const Foo = compose(foo, bar, setDisplayName('Bar'))(() => 'buz');
`);

test('does not transform when `setDisplayName` identifier name is taken', macro, `
import { compose } from 'recompose';

const setDisplayName = 4;

export const Foo = compose(foo, bar)(() => 'buz');
`);

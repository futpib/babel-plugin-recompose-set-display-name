
const getVariableName = path => {
	while (path.node.type !== 'VariableDeclarator') {
		if ((path.node.type === 'CallExpression' && path.parent.type === 'CallExpression')
			|| (path.node.type === 'CallExpression' && path.parent.type === 'VariableDeclarator')
		) {
			path = path.parentPath;
		} else {
			break;
		}
	}

	if (path.node.type === 'VariableDeclarator') {
		return path.node.id.name;
	}
};

const isRecomposeImportBinding = ({ path }) => (
	path.node.type === 'ImportSpecifier'
		&& path.node.imported.name === path.node.local.name
		&& path.parent.type === 'ImportDeclaration'
		&& path.parent.source.type === 'StringLiteral'
		&& path.parent.source.value === 'recompose'
);

module.exports = ({ types: t }) => ({
	visitor: {
		CallExpression(path) {
			const { node, scope } = path;

			if (node.callee.type !== 'Identifier'
				|| node.callee.name !== 'compose'
				|| node.arguments.length === 0
			) {
				return;
			}

			const lastArgument = node.arguments[node.arguments.length - 1];

			if (lastArgument.type === 'CallExpression'
				&& lastArgument.callee.type === 'Identifier'
				&& lastArgument.callee.name.toLowerCase().includes('displayname')
			) {
				return;
			}

			const composeBinding = scope.getBinding('compose');
			const { path: composeBindingPath } = composeBinding;

			if (!isRecomposeImportBinding(composeBinding)) {
				return;
			}

			const setDisplayNameBinding = scope.getBinding('setDisplayName');

			if (setDisplayNameBinding && !isRecomposeImportBinding(setDisplayNameBinding)) {
				return;
			}

			if (!composeBindingPath.parent.specifiers.some(specifier => (
				specifier.type === 'ImportSpecifier'
					&& specifier.imported.type === 'Identifier'
					&& specifier.imported.name === 'setDisplayName'
					&& specifier.local.type === 'Identifier'
					&& specifier.local.name === 'setDisplayName'
			))) {
				composeBindingPath.parentPath.replaceWith(
					t.importDeclaration(
						[
							...composeBindingPath.parent.specifiers,
							t.importSpecifier(t.identifier('setDisplayName'), t.identifier('setDisplayName')),
						],
						composeBindingPath.parent.source,
					)
				);
			}

			const name = getVariableName(path);

			if (!name) {
				return;
			}

			path.replaceWith(
				t.callExpression(
					node.callee,
					[
						...node.arguments,
						t.callExpression(
							t.identifier('setDisplayName'),
							[
								t.stringLiteral(name),
							],
						),
					],
				),
			);
		},
	},
});

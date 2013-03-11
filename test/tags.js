var tags = require('../lib/tags');
var tree = require('../lib/tags/helpers/tree');
var typer = require('../lib/tags/helpers/typer');
var namer = require('../lib/tags/helpers/namer');

// window.tree = tree;

suite("documentjs/tags/matcher");

test("tree", function () {

	deepEqual(tree("foo"), ["foo"]);
	deepEqual(tree("(foo)"), [
		{type: "(", children: ["foo"], start: 0, end: 5 }
	]);


	deepEqual(tree("bar(foo)"), ["bar", { type: "(", children: ["foo"], start: 3, end: 8 }]);


	deepEqual(tree("(<foo>, {bar})abc", ["([,])"]),
		[
			{type: "(",
				start: 0,
				end: 14,
				children: [
					{type: "<", children: ["foo"], start: 1, end: 6 },
					",",
					" ",
					{type: "{", children: ["bar"], start: 8, end: 13}
				]},
			"abc"
		]);

	deepEqual(tree("foo", null, " "), ["foo"]);


})

test("typer - name", function () {
	deepEqual(typer.type("can.Control"), {
		types: [
			{
				type: "can.Control"
			}
		]
	});
});

test("typer - application", function () {

	deepEqual(typer.type("foo"), {
		types: [
			{type: "foo"}
		]
	}, "basic");

	deepEqual(typer.type("foo.<bar,car>"), {
		types: [
			{
				type: "foo",
				template: [
					{types: [
						{type: "bar"}
					] },
					{types: [
						{type: "car"}
					] }
				]
			}
		]
	}, "application");

});

test("typer - union", function () {
	deepEqual(typer.type("(can.Control|can.Model)"), {
		types: [
			{
				type: "can.Control"
			},
			{
				type: "can.Model"
			}
		]
	});
})

test("typer - record", function () {

	deepEqual(typer.type("{myNum:number,myObject}"), {
		types: [
			{
				type: "Object",
				options: [
					{name: "myNum", types: [
						{type: "number"}
					]},
					{name: "myObject"}
				]
			}
		]
	}, "record type");

});

test("typer - nullable", function () {
	deepEqual(typer.type("?can.Control"), {
		types: [
			{
				type: "can.Control"
			}
		],
		nullable: true
	});

	deepEqual(typer.type("?can.Control"), {
		types: [
			{
				type: "can.Control"
			}
		],
		nullable: true
	});

})


test("typer - nonnullable", function () {
	deepEqual(typer.type("!can.Control"), {
		types: [
			{
				type: "can.Control"
			}
		],
		nonnull: true
	});
});

test("typer - function", function () {

	deepEqual(typer.type("function(this:foo,new:bar,string):number"), {
		types: [
			{
				type: "function",
				context: {types: [
					{type: "foo"}
				] },
				constructs: {types: [
					{type: "bar"}
				] },
				params: [
					{types: [
						{type: "string"}
					] }
				],
				returns: {types: [
					{type: "number"}
				] }
			}
		]
	}, "function");


	deepEqual(typer.type("function( this:foo, new:bar, string ) :number "), {
		types: [
			{
				type: "function",
				context: {types: [
					{type: "foo"}
				] },
				constructs: {types: [
					{type: "bar"}
				] },
				params: [
					{types: [
						{type: "string"}
					] }
				],
				returns: {types: [
					{type: "number"}
				] }
			}
		]
	}, "function with spaces");

});

test("typer - variable params", function () {
	deepEqual(typer.type("...can.Control"), {
		types: [
			{
				type: "can.Control"
			}
		],
		variable: true
	});
})

test("typer - variable params", function () {
	deepEqual(typer.type("...can.Control"), {
		types: [
			{
				type: "can.Control"
			}
		],
		variable: true
	});
});


test("typer - variable params", function () {

	deepEqual(typer.type("function(...can.Observe){}"), {
		types: [
			{
				type: "function",
				constructs: undefined,
				context: undefined,
				returns: {types: [
					{type: "undefined"}
				]},
				params: [
					{types: [
						{type: "can.Observe"}
					], variable: true}
				]
			}
		],
	});

});

// NON-STANDARD types ...
test("typer - optional", function () {
	deepEqual(typer.type("can.Control="), {
		types: [
			{
				type: "can.Control"
			}
		],
		optional: true
	});
});

test("typer - optional / default", function () {
	deepEqual(typer.type("context=foo"), {
		types: [
			{
				type: "context"
			}
		],
		defaultValue: {type: "foo"},
		optional: true
	});
});

test("typer - parenthesis-less union", function () {
	deepEqual(typer.type("can.Control|can.Model"), {
		types: [
			{
				type: "can.Control"
			},
			{
				type: "can.Model"
			}
		]
	});
})

test("typer - parenthesis-less union with function", function () {
	deepEqual(typer.type("function|can.Model"), {
		types: [
			{
				type: "function",
				type: "function",
				constructs: undefined,
				context: undefined,
				returns: {types: [
					{type: "undefined"}
				]},
				params: []
			},
			{
				type: "can.Model"
			}
		]
	});
})

test("namer - name", function () {
	deepEqual(namer.name("foo", {}), {
		name: "foo"
	});
});

test("namer - optional", function () {
	deepEqual(namer.name("[foo]", {}), {
		name: "foo",
		optional: true
	});
});

test("namer - optional / default", function () {
	deepEqual(namer.name("[foo=bar]", {}), {
		name: "foo",
		optional: true,
		defaultValue: "bar",
	});
});

test("namer - function", function () {

	var res = typer.type("function(jQuery.Event,*...)", {})


	deepEqual(namer.name("handler(event,args)", res),
		{
			name: "handler",
			types: [
				{
					type: "function",
					context: undefined,
					constructs: undefined,
					params: [
						{types: [
							{type: "jQuery.Event"}
						], name: "event" },
						{types: [
							{type: "*"}
						], variable: true, name: "args" }
					],
					returns: {types: [
						{type: "undefined"}
					] }
				}
			]
		}

	);
})

test("namer - function without corresponding types", function () {

	var res = typer.type("function", {})


	deepEqual(namer.name("handler(event,args)", res),
		{
			name: "handler",
			types: [
				{
					type: "function",
					context: undefined,
					constructs: undefined,
					params: [
						{ name: "event" },
						{ name: "args" }
					],
					returns: {types: [
						{type: "undefined"}
					] }
				}
			]
		}

	);

})

test("@params - basic", function () {

	var obj = {}
	tags.param.add.call(obj, "@param {boolean} name")
	equal(obj.params[0].types[0].type, "boolean")
	equal(obj.params[0].name, "name")

})

test("@params - function", function () {

	var obj = {}
	tags.param.add.call(obj, "@param {function(jQuery.Event,*...)} handler(event,args) a description");

	deepEqual(obj.params[0],
		{
			name: "handler",
			description: "a description",
			types: [
				{
					type: "function",
					context: undefined,
					constructs: undefined,
					params: [
						{types: [
							{type: "jQuery.Event"}
						], name: "event" },
						{types: [
							{type: "*"}
						], variable: true, name: "args" }
					],
					returns: {types: [
						{type: "undefined"}
					] }
				}
			]
		});
})

test("@params - object", function () {

	var obj = {}
	tags.param.add.call(obj, "@param {{name: String, foo}=} thing a description");

	deepEqual(obj.params[0],
		{
			name: "thing",
			description: "a description",
			types: [
				{
					type: "Object",
					options: [
						{types: [
							{type: "String"}
						], name: "name" },
						{name: "foo" }
					]
				}
			]
		});

});


test("@option", function () {
	var obj = {};
	tags.param.add.call(obj, "@param {{name: String, foo}=} thing a description");
	tags.option.add.call(obj, "@option name name description");
	tags.option.add.call(obj, "@option {Bar} [foo=thing] foo description");
	tags.option.add.call(obj, "@option {Extra} extra extra description");

	deepEqual(obj.params[0],
		{
			name: "thing",
			description: "a description",
			types: [
				{
					type: "Object",
					options: [
						{types: [
							{type: "String"}
						], name: "name", description: "name description" },
						{
							types: [
								{type: "Bar"}
							],
							name: "foo",
							description: "foo description",
							defaultValue: "thing",
							optional: true
						},
						{types: [
							{type: "Extra"}
						], name: "extra", description: "extra description" }
					]
				}
			]
		});

});

test("@option - for function", function () {

	var obj = {};
	tags.param.add.call(obj, "@param {function(String,Bar)} thing(first,second) a description");
	tags.option.add.call(obj, "@option first first description");
	tags.option.add.call(obj, "@option second second description");

	deepEqual(obj.params[0],
		{
			name: "thing",
			description: "a description",
			types: [
				{
					type: "function",
					constructs: undefined,
					context: undefined,
					params: [
						{types: [
							{type: "String"}
						], name: "first", description: "first description" },
						{
							types: [
								{type: "Bar"}
							],
							name: "second",
							description: "second description",
						}
					],
					returns: {types: [
						{type: "undefined"}
					]}
				}
			]
		});

});

test("@return", function () {
	var obj = {};
	tags["return"].add.call(obj, "@return {String} a description");

	deepEqual(obj.returns, {
		description: "a description",
		types: [
			{type: "String"}
		]
	})
})

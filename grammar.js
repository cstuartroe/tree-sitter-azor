module.exports = grammar({
  name: 'azor',

  word: $ => $.identifier,

  extras: $ => [$.comment, /\s/],

  rules: {
    source_file: $ => repeat($.definition),

    definition: $ => seq(
        $.identifier,
        optional($.generics),
        optional(seq(':', $.base_type)),
        optional($.named_arguments),
        '=',
        $.expression,
    ),

    base_type: $ => choice(
        $.identifier,
        $.list_type,
        $.tuple_type,
    ),

    list_type: $ => seq(
        '[',
        $.base_type,
        ']',
    ),

    tuple_type: $ => seq(
        '(',
        optional(seq(
            $.general_type,
            repeat(seq(
                ',',
                $.general_type,
            )),
            optional(','),
        )),
        ')',
    ),

    generics: $ => seq(
        '{',
        $.identifier,
        repeat(seq(
            ',',
            $.identifier,
        )),
        optional(','),
        '}',
    ),

    general_type: $ => prec.left(seq(
        $.base_type,
        optional($.tuple_type),
    )),

    named_arguments: $ => seq(
        '(',
        optional(seq(
            $.named_argument,
            repeat(seq(
                ',',
                 $.named_argument,
             )),
             optional(','),
        )),
        ')',
    ),

    named_argument: $ => seq(
        $.identifier,
        ':',
        $.general_type,
    ),

    expression: $ => choice(
        $.simple,
        $.list,
        $.tuple,

        prec(0, $.if),
        prec(0, $.let),
        $.not,
        $.call,
        $.generic_resolution,

        prec.left(1, seq(
            $.expression,
            '~',
            $.expression,
        )),

        prec.left(1, seq(
            $.expression,
            $.comparator,
            $.expression,
        )),

        prec.left(2, seq(
            $.expression,
            $.logical,
            $.expression,
        )),

        prec.left(2, seq(
            $.expression,
            $.add_sub,
            $.expression,
        )),

        prec.left(3, seq(
            $.expression,
            $.mult_div,
            $.expression,
        )),

        prec.left(4, seq(
            $.expression,
            $.exp,
            $.expression,
        )),
    ),

    simple: $ => choice(
        $.identifier,
        $.numeric,
        $.bool,
        $.string,
    ),

    identifier: $ => /[_a-zA-Z][_a-zA-Z0-9]*/,

    numeric: $ => /-?(0|[1-9][0-9]*)/,

    bool: $ => choice('true', 'false'),

    string: $ => /"([ \t\w0-9!#$%&'()*+,-./:;<=>?@\[\]^_`{|}~]|\\\\|\\t|\\r|\\n|\\")*"/,

    list: $ => choice(
        $.empty_list,
        $.full_list,
    ),

    empty_list: $ => seq(
        '[',
        ']',
        'of',
        $.general_type,
    ),

    full_list: $ => seq(
        '[',
        $.expression,
        repeat(seq(
            ',',
            $.expression,
        )),
        optional(','),
        ']',
    ),

    tuple: $ => seq(
        '(',
        optional(seq(
            $.expression,
            repeat(seq(
                ',',
                $.expression,
            )),
            optional(','),
        )),
        ')',
    ),

    if: $ => seq(
        'if',
        choice(
            $.expression,
            $.list_unpack,
        ),
        'then',
        $.expression,
        'else',
        $.expression,
    ),

    list_unpack: $ => prec(2, seq(
        choice(
            seq(
                $.identifier,
                '~',
                $.identifier,
            ),
            seq(
                '(',
                $.identifier,
                '~',
                $.identifier,
                ')',
            ),
        ),
        '<-',
        $.expression,
    )),

    let: $ => seq(
        'let',
        choice(
            $.identifier,
            $.tuple_of_identifiers,
        ),
        '<-',
        $.expression,
        'in',
        $.expression,
    ),

    tuple_of_identifiers: $ => seq(
        '(',
        $.identifier,
        repeat(seq(
            ',',
            $.identifier,
        )),
        optional(','),
        ')',
    ),

    not: $ => prec(5, seq(
        '!',
        $.expression,
    )),

    call: $ => prec(6, seq(
        $.expression,
        $.tuple,
    )),

    generic_resolution: $ => prec(6, seq(
        $.identifier,
        '{',
        $.general_type,
        repeat(seq(
            ',',
            $.general_type,
        )),
        optional(','),
        '}',
    )),

    comparator: $ => choice('==', '!=', '>', '>=', '<', '<='),
    logical: $ => choice('&', '|', '^', '!^'),
    add_sub: $ => choice('+', '-', '%'),
    mult_div: $ => choice('*', '/'),
    exp: $ => '**',

    comment: $ => seq('#', /.*/),
  }
});

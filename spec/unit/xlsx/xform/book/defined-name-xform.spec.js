const testXformHelper = require('../test-xform-helper');

const DefinedNameXform = verquire('xlsx/xform/book/defined-name-xform');

const expectations = [
  {
    title: 'Defined Names',
    create() {
      return new DefinedNameXform();
    },
    preparedModel: {name: 'foo', ranges: ['bar!$A$1:$C$1']},
    xml: '<definedName name="foo">bar!$A$1:$C$1</definedName>',
    parsedModel: {name: 'foo', ranges: ['bar!$A$1:$C$1']},
    tests: ['render', 'renderIn', 'parse'],
  },
  {
    title: 'Print Area',
    create() {
      return new DefinedNameXform();
    },
    preparedModel: {
      name: '_xlnm.Print_Area',
      localSheetId: 0,
      ranges: ['bar!$A$1:$C$10'],
    },
    xml: '<definedName name="_xlnm.Print_Area" localSheetId="0">bar!$A$1:$C$10</definedName>',
    parsedModel: {
      name: '_xlnm.Print_Area',
      localSheetId: 0,
      ranges: ['bar!$A$1:$C$10'],
    },
    tests: ['render', 'renderIn', 'parse'],
  },
  {
    title: 'String with something that looks like a range',
    create() {
      return new DefinedNameXform();
    },
    preparedModel: {name: 'foo', ranges: []},
    xml: '<definedName name="foo">"OFFSET($A$10;0;0;0;1)"</definedName>',
    parsedModel: {name: 'foo', ranges: [], formula: '"OFFSET($A$10;0;0;0;1)"'},
    tests: ['parse'],
  },
  {
    title: 'Named LAMBDA expression',
    create() {
      return new DefinedNameXform();
    },
    preparedModel: {name: 'MyDouble', ranges: [], formula: 'LAMBDA(x,x*2)'},
    xml: '<definedName name="MyDouble">LAMBDA(x,x*2)</definedName>',
    parsedModel: {name: 'MyDouble', ranges: [], formula: 'LAMBDA(x,x*2)'},
    tests: ['render', 'renderIn', 'parse'],
  },
  {
    title: 'Named LAMBDA with multiple parameters',
    create() {
      return new DefinedNameXform();
    },
    preparedModel: {name: 'MySum', ranges: [], formula: 'LAMBDA(x,y,x+y)'},
    xml: '<definedName name="MySum">LAMBDA(x,y,x+y)</definedName>',
    parsedModel: {name: 'MySum', ranges: [], formula: 'LAMBDA(x,y,x+y)'},
    tests: ['render', 'renderIn', 'parse'],
  },
];

describe('DefinedNameXform', () => {
  testXformHelper(expectations);
});

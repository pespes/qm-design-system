import type { FigmaExport } from '../types.js';

// Create a comprehensive fixture with variety of real token data
export const basicFixture: FigmaExport = {
  exportedAt: '2026-08-21T15:04:12.127Z',
  collections: [
    {
      id: 'VariableCollectionId:7902:2',
      name: 'Primitives',
      modes: [{ modeId: '7902:0', name: 'Value' }],
    },
    {
      id: 'VariableCollectionId:7903:131',
      name: 'Theme',
      modes: [
        { modeId: '7903:1', name: 'Homeowner' },
        { modeId: '7903:2', name: 'Pro' },
      ],
    },
    {
      id: 'VariableCollectionId:10612:8446',
      name: 'Component',
      modes: [{ modeId: '10612:0', name: 'Mode 1' }],
    },
  ],
  variables: [
    // Primitive colors
    {
      id: 'var:white',
      name: 'color/white',
      $type: 'COLOR',
      collectionName: 'Primitives',
      $value: { r: 1, g: 1, b: 1, a: 1 },
    },
    {
      id: 'var:green-transparent',
      name: 'color/green/600',
      $type: 'COLOR',
      collectionName: 'Primitives',
      $value: { r: 0, g: 0.47, b: 0.05, a: 0.5 },
      $description: 'Homeowner green',
    },
    {
      id: 'var:blue',
      name: 'color/blue/600',
      $type: 'COLOR',
      collectionName: 'Primitives',
      $value: { r: 0.13, g: 0.33, b: 0.8, a: 1 },
    },
    // Primitive dimensions
    {
      id: 'var:spacing',
      name: 'spacing/100',
      $type: 'FLOAT',
      collectionName: 'Primitives',
      $value: 4,
    },
    {
      id: 'var:opacity',
      name: 'opacity/100',
      $type: 'FLOAT',
      collectionName: 'Primitives',
      $description: "Matches Tailwind 'sm'",
      $value: 0.2,
    },
    {
      id: 'var:fontSize',
      name: 'fontSize/400',
      $type: 'FLOAT',
      collectionName: 'Primitives',
      $value: 24,
    },
    {
      id: 'var:fontfamily',
      name: 'fontFamily/sans',
      $type: 'STRING',
      collectionName: 'Primitives',
      $value: 'DM Sans',
    },
    // Theme semantic colors - simple alias
    {
      id: 'var:color:page:',
      name: 'surface/page',
      $type: 'COLOR',
      collectionName: 'Theme',
      $description: 'Default page/body background',
      $value: {
        type: 'VARIABLE_ALIAS',
        id: 'var:white',
        aliasName: 'color/white',
      },
    },
    // Theme with mode-specific values
    {
      id: 'var:color:brand:',
      name: 'brand/background',
      $type: 'COLOR',
      collectionName: 'Theme',
      $value: {
        type: 'VARIABLE_ALIAS',
        id: 'var:green',
        aliasName: 'color/green/600',
      },
      $proValue: {
        type: 'VARIABLE_ALIAS',
        id: 'var:blue',
        aliasName: 'color/blue/600',
      },
    },
    // Semantic variable referencing another semantic variable
    {
      id: 'var:double:alias',
      name: 'success/background',
      $type: 'COLOR',
      collectionName: 'Theme',
      $value: {
        type: 'VARIABLE_ALIAS',
        id: 'var:color:brand',
        aliasName: 'brand/background',
      },
    },
    // Component collection
    {
      id: 'var:component:color',
      name: 'rating/filled',
      $type: 'COLOR',
      collectionName: 'Component',
      $value: {
        type: 'VARIABLE_ALIAS',
        id: 'var:green',
        aliasName: 'color/green/600',
      },
    },
    {
      id: 'var:component:font',
      name: 'avatar/small',
      $type: 'FLOAT',
      collectionName: 'Component',
      $value: 10,
    },
  ],
  textVariables: [
    {
      id: 'abcd',
      name: 'text/header/h1',
      fontFamily: {
        type: 'VARIABLE_ALIAS',
        aliasName: 'fontFamily/sans',
      },
      fontWeight: 700,
      fontSize: {
        type: 'VARIABLE_ALIAS',
        aliasName: 'fontSize/400',
      },
      lineHeight: 1.25,
      letterSpacing: 0,
    },
    {
      id: 'efgh',
      name: 'body/regular',
      fontFamily: 'DM Sans',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
  ],
  effectVariables: [
    {
      id: 'effect:shadow:sm',
      name: 'shadow/sm',
      effects: [
        {
          offsetX: 0,
          offsetY: 2,
          radius: 4,
          spread: 0,
          color: { r: 0, g: 0, b: 0, a: 0.25 },
        },
      ],
    },
    {
      id: 'effect:shadow:lg',
      name: 'shadow/lg',
      $description: 'Large elevation shadow',
      effects: [
        {
          offsetX: 0,
          offsetY: 4,
          radius: 8,
          spread: 2,
          color: { r: 0, g: 0, b: 0, a: 0.15 },
        },
        {
          offsetX: 0,
          offsetY: 1,
          radius: 2,
          spread: 0,
          color: { r: 0, g: 0, b: 0, a: 0.3 },
        },
      ],
    },
  ],
};

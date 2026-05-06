import type { Decorator } from '@storybook/react-vite';
import { Title, Description, Primary, Controls, Stories, Source, useOf } from '@storybook/addon-docs/blocks';

export const themeDecorator: Decorator = (Story, context) => {
  const theme = context.globals.brand?.toLowerCase();
  return (
    <div data-theme={theme}>
      <Story />
    </div>
  );
};

export const MarkdownBlock = () => {
  // return the annotated 'meta' exported by the story
  const resolvedOf = useOf('meta', ['meta']);
  const dataArr = resolvedOf.preparedMeta.title.split('/');
  const title = dataArr[dataArr.length - 1];
  return (
    <div>
      <h3 id="sb-import">Import</h3>
      <Source code= {`
        import { ${title} } from @quartermaster/qm-components
        `} 
      />
    </div>
  )
}

export const customBlock = (blockName: string) => {
  const resolvedOf = useOf('meta', ['meta']);
  const data = resolvedOf.preparedMeta.parameters.customBlock;
  const cleanedName = blockName.toLowerCase();
  if (!data || !data[cleanedName]) return null;
  return (
    <div>
      <h2 id={`sb-${cleanedName}`}>{blockName}</h2>
      {typeof data[cleanedName] === 'string' ? (
        <p>{data[cleanedName]}</p>
      ) : (
        data[cleanedName]
      )}
  </div>
  )
}

export const docPageMarkup = () => (
  <div>
    <Title />
    <Description />
    <Primary />
    <MarkdownBlock />
    <h2 id="sb-props">Props</h2>
    <Controls />
    {customBlock('Usage')}
    {customBlock('Accessibility')}
    <Stories />
  </div>
);

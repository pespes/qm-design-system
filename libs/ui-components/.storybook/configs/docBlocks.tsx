import { Source, useOf } from '@storybook/addon-docs/blocks';

export const MarkdownBlock = () => {
  // return the annotated 'meta' exported by the story
  const resolvedOf = useOf('meta', ['meta']);
  const dataArr = resolvedOf.preparedMeta.title.split('/');
  const title = dataArr[dataArr.length - 1];
  return (
    <div>
      <h3 id='sb-import'>Import</h3>
      <Source
        code={`import { ${title} } from '@pespes/ui-components'`}
      />
    </div>
  );
};

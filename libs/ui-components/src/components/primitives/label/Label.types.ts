export interface LabelProps
  extends Omit<React.ComponentProps<'label'>, 'htmlFor'> {
  htmlFor: string;
  type?: 'default' | 'emphasis';
}

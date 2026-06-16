import { useState, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Dialog } from '../Dialog.js';
import { defaultTests, integratedTriggerTests } from '../Dialog.test.js';
import { Button } from '@/components/primitives/button/Button.js';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  args: {
    onOpenChange: fn(),
    onOpenChangeComplete: fn(),
    classes: {
      overlay: '',
      header: '',
      body: '',
      title: '',
      headerActionBtn: '',
      closeBtn: '',
      footer: '',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A Dialog component that renders above the page, rendering content underneath inert',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const overlayRef = createRef<HTMLDivElement>();
export const Default: Story = {
  args: {
    ref: overlayRef,
  },
  render: function DefaultStory(args) {
    const [isOpen, setIsOpen] = useState(args.open ?? false);
    return (
      <div>
        <Button
          data-testid='trigger-btn'
          aria-haspopup='dialog'
          aria-expanded={!!isOpen}
          onClick={() => setIsOpen(true)}
        >
          Open Dialog
        </Button>
        <Dialog
          {...args}
          open={isOpen}
          onOpenChange={(open, event) => {
            args.onOpenChange?.(open, event);
            setIsOpen(open);
          }}
        >
          <div className='text-center type-body-default'>
            <p>
              This is a basic Dialog, with only <b>open</b> and{' '}
              <b>onOpenChange</b> arguments passed in to manually open / close
              the dialog. By default, a close icon renders in the header. To
              remove, set <b>showCloseBtn</b> to false.
            </p>
          </div>
        </Dialog>
      </div>
    );
  },
  play: defaultTests,
};

export const IntegratedTrigger: Story = {
  args: {
    title: 'Dialog with Integrated Trigger',
    showCloseBtn: false,
    triggerBtn: (
      <Button data-testid='integrated-trigger-btn'>Open Dialog</Button>
    ),
    primaryFooterBtn: {
      component: <Button data-testid='primary-clos-btn'>Close</Button>,
      closesDialog: true,
    },
  },
  render: function IntegratedStory(args) {
    return (
      <Dialog {...args}>
        <div className='flex flex-col gap-200 type-body-default'>
          <p>
            This dialog has the <b>triggerBtn</b> prop defined, which allows for
            BaseUI to internally set the open state. The footer button has{' '}
            <b>closesDialog</b> set to true, and will automatically close the
            dialog without an onClick function passed. As you can see, no{' '}
            <b>onOpenChange</b> prop is provided, and BaseUI handles open /
            closed state internally.
          </p>
        </div>
      </Dialog>
    );
  },
  play: integratedTriggerTests,
};

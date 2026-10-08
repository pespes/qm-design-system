import { useState, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ArrowLeftIcon, InfoIcon } from 'lucide-react';
import { Dialog } from '../Dialog.js';
import type { DialogProps } from '../Dialog.types.js';
import {
  defaultTests,
  integratedTriggerTests,
  footerBtnTests,
  headerActionTests,
  lifecycleCallbackTests,
} from '../Dialog.test.js';
import { Button } from '@/components/primitives/button/Button.js';
import { InputField } from '@/components/composed/inputField/InputField.js';
import { Checkbox } from '@/components/composed/checkbox/Checkbox.js';

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
  argTypes: {
    onOpenChangeComplete: {
      description: 'Fires after open / close animation completes',
    },
    triggerBtn: {
      description: 'Button to open dialog, logic handled internally by BaseUI',
    },
    showCloseBtn: {
      description: 'Render an X IconButton in header to close dialog',
    },
    headerActionBtn: {
      description:
        'ghost IconButton rendered with provided icon, label and onClick props',
      control: { type: 'select' },
      options: ['arrow', 'info', 'none'],
      mapping: {
        arrow: {
          label: 'return',
          icon: <ArrowLeftIcon />,
          onClick: () => console.log('clicked'),
        },
        info: {
          label: 'info',
          icon: <InfoIcon />,
          onClick: () => console.log('clicked'),
        },
        none: undefined,
      },
    },
    primaryFooterBtn: {
      control: { type: 'select' },
      options: ['show', 'hide'],
      mapping: {
        hide: undefined,
        show: {
          component: <Button data-testid='primary-btn-control'>Primary</Button>,
          closesDialog: false,
        },
      },
    },
    secondaryFooterBtn: {
      control: { type: 'select' },
      options: ['show', 'hide'],
      mapping: {
        show: {
          component: (
            <Button data-testid='secondary-btn-control' variant='outline'>
              Secondary
            </Button>
          ),
          closesDialog: false,
        },
        hide: undefined,
      },
    },
    initialFocus: {
      description:
        'Determines element to focus when dialog is opened. `true` (default) moves to first tabbable element, `false` does not move focus, and can pass RefObject to focus on instead',
      control: { type: 'boolean' },
    },
    finalFocus: {
      description:
        'Determines element to focus when dialog is closed. `true` (default) to move to previously focused element, `false` to not move focus, and RefObject to focus on instead',
      control: { type: 'boolean' },
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
} as Meta<typeof Dialog>;

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
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to Default doesn't auto-play the test
export const DefaultTest: Story = {
  ...Default,
  tags: ['!dev', '!autodocs'],
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
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to IntegratedTrigger doesn't auto-play the test
export const IntegratedTriggerTest: Story = {
  ...IntegratedTrigger,
  tags: ['!dev', '!autodocs'],
  play: integratedTriggerTests,
};

export const FooterFullWidth: Story = {
  args: {
    showCloseBtn: false,
    triggerBtn: (
      <Button data-testid='integrated-trigger-btn'>Open Dialog</Button>
    ),
    primaryFooterBtn: {
      component: (
        <Button data-testid='submit-btn' onClick={fn(() => alert('clicked'))}>
          Submit
        </Button>
      ),
      closesDialog: false,
    },
    secondaryFooterBtn: {
      component: (
        <Button data-testid='cancel-btn' variant='outline' onClick={fn()}>
          Cancel
        </Button>
      ),
      closesDialog: true,
    },
    footerFullWidth: true,
  },
  render: function FooterSecondaryDefaultCloseStory(args) {
    return (
      <Dialog {...args}>
        <p>Full width footer buttons.</p>
      </Dialog>
    );
  },
};

export const AsyncPrimarySubmission = {
  args: {
    title: 'Async Submission',
    requestDelay: 2000,
    successDelay: 800,
    secondaryFooterBtn: {
      component: (
        <Button
          data-testid='cancel-btn'
          variant='outline'
          onClick={fn(() => console.log('secondary button clicked'))}
        >
          Cancel
        </Button>
      ),
      closesDialog: true,
    },
    primaryFooterBtn: {
      component: (
        <Button data-testid='submit-btn' variant='brand' onClick={fn()}>
          Submit
        </Button>
      ),
      closesDialog: false,
    },
  } as DialogProps & { requestDelay: number; successDelay: number },
  argTypes: {
    requestDelay: {
      control: { type: 'number' },
      description: 'Delay in ms for simulated network request',
    },
    successDelay: {
      control: { type: 'number' },
      description: 'Delay in ms before closing after success',
    },
  } as const,
  render: function AsyncPrimarySubmissionStory(
    args: DialogProps & { requestDelay: number; successDelay: number },
  ) {
    const [isOpen, setIsOpen] = useState(false);
    const [submitState, setSubmitState] = useState('inactive');

    const handleSubmit = () => {
      setSubmitState('submitting');
      // Simulate a network request then close.
      setTimeout(() => {
        setSubmitState('submitted');
        setTimeout(() => {
          setIsOpen(false);
        }, args.requestDelay ?? 2000);
      }, args.successDelay ?? 800);
    };

    const submitClick = (
      args.primaryFooterBtn?.component.props as {
        onClick?: (...args: unknown[]) => void;
      }
    )?.onClick;

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
          onOpenChangeComplete={() => setSubmitState('inactive')}
          primaryFooterBtn={{
            component: (
              <Button
                data-testid='submit-btn'
                onClick={() => {
                  submitClick?.();
                  handleSubmit();
                }}
                loading={{
                  title: 'Submitting…',
                  state: submitState === 'submitting' ? 'loading' : 'active',
                }}
              >
                Submit
              </Button>
            ),
            closesDialog: false,
          }}
        >
          {submitState === 'submitted' ? (
            <p>Submitted! Closing now</p>
          ) : (
            <div className='flex flex-col gap-200'>
              <p>
                Submit triggers a simulated 2-second request, then manually
                closes dialog when the request resolves. Cancel button uses
                BaseUI internal close: check the console logs to view secondary
                button click action.
              </p>
              <InputField label='Full Name' />
              <InputField label='Address?' />
              <Checkbox label='I am over the age of 18' />
            </div>
          )}
        </Dialog>
      </div>
    );
  },
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to AsyncPrimarySubmission doesn't auto-play the test
export const AsyncPrimarySubmissionTest = {
  ...AsyncPrimarySubmission,
  tags: ['!dev', '!autodocs'],
  play: footerBtnTests,
};

export const HeaderActionTrigger: Story = {
  args: {
    triggerBtn: <Button data-testid='trigger-btn'>Open Dialog</Button>,
    headerActionBtn: {
      label: 'Return to prev step',
      icon: <ArrowLeftIcon />,
      onClick: fn(),
    },
  },
  render: function HeaderActionTriggerStory(args) {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const isFirstStep = currentStep === 1;

    return (
      <Dialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        onOpenChangeComplete={() => setCurrentStep(1)}
        title={`Step ${currentStep} of 2`}
        headerActionBtn={
          isFirstStep
            ? undefined
            : {
                label: args.headerActionBtn?.label ?? 'Return to prev step',
                icon: args.headerActionBtn?.icon ?? <ArrowLeftIcon />,
                onClick: () => {
                  args.headerActionBtn?.onClick();
                  setCurrentStep(1);
                },
              }
        }
        primaryFooterBtn={
          isFirstStep
            ? {
                component: (
                  <Button
                    data-testid='continue-btn'
                    onClick={() => setCurrentStep(2)}
                  >
                    Continue
                  </Button>
                ),
                closesDialog: false,
              }
            : {
                component: <Button data-testid='finish-btn'>Finish</Button>,
                closesDialog: true,
              }
        }
      >
        {isFirstStep ? (
          <p>
            First step. Press <b>Continue</b> to advance to step 2 to swap
            content. The X button dismisses the flow entirely.
          </p>
        ) : (
          <p>
            Second step. Press the <b>back arrow</b> in the header to return to
            step 1, or <b>Finish</b> to close the flow.
          </p>
        )}
      </Dialog>
    );
  },
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to HeaderActionTrigger doesn't auto-play the test
export const HeaderActionTriggerTest: Story = {
  ...HeaderActionTrigger,
  tags: ['!dev', '!autodocs'],
  play: headerActionTests,
};

export const LifecycleCallback: Story = {
  args: {
    title: 'Lifecycle callback',
    disablePointerDismissal: true,
  },
  render: function LifecycleCallbackStory(args) {
    const [isOpen, setIsOpen] = useState(false);
    const [closeCount, setCloseCount] = useState(0);

    return (
      <div>
        <Button
          data-testid='trigger-btn'
          aria-haspopup='dialog'
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
        >
          Open Dialog
        </Button>
        <p className='type-body-caption'>
          Number of times closed: {closeCount}{' '}
        </p>
        <Dialog
          {...args}
          open={isOpen}
          onOpenChange={setIsOpen}
          onOpenChangeComplete={(open) => {
            args.onOpenChangeComplete?.(open);
            // Fires once the close animation settles.
            if (!open) {
              setCloseCount((c) => c + 1);
              console.log('Close animation finished');
            }
          }}
        >
          <p>
            The close count advances each time the close animation completes -
            not when the click fires. Great for resetting a form to prevent
            content flicker. The `disablePointerDismissal` is also set to true,
            preventing any outside clicks from closing the Dialog.
          </p>
        </Dialog>
      </div>
    );
  },
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to LifecycleCallback doesn't auto-play the test
export const LifecycleCallbackTest: Story = {
  ...LifecycleCallback,
  tags: ['!dev', '!autodocs'],
  play: lifecycleCallbackTests,
};

export const ScrollingBody: Story = {
  args: {
    title: 'Scrolling body content',
    triggerBtn: (
      <Button data-testid='integrated-trigger-btn'>Open Dialog</Button>
    ),
    headerActionBtn: {
      icon: <ArrowLeftIcon />,
      label: 'Back',
      onClick: fn(),
    },
    primaryFooterBtn: {
      component: (
        <Button data-testid='submit-btn' variant='brand'>
          Close
        </Button>
      ),
      closesDialog: true,
    },
    footerFullWidth: true,
  },
  render: function ScrollingBodyStory(args) {
    return (
      <Dialog {...args}>
        {Array.from({ length: 30 }).map((_, i) => (
          <p key={i} className='mb-400'>
            <strong>Paragraph {i + 1}.</strong> Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat.
          </p>
        ))}
      </Dialog>
    );
  },
};

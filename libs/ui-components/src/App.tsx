import React from 'react'
import './globals.css';

export default function App() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-header-h1">H1 Example for text</h1>
       <h1 className="text-header-5">H1 Example for text</h1>
      <div>
        <p className="rounded-700 border-4 border-accent-background shadow-200">
            Testing border-width-4, radius-700, accent-background color
        </p>
        <p className="my-1200">This should be --spacing-1200(3em) below the previous text</p>
      </div>
      <div className="bg-brand-background">
        <p className="text-brand-foreground">
          This uses brand-background and brand-foreground
        </p>
        <p className="text-brand-foreground opacity-200">
          And this has less opacity
        </p>
      </div>

      <div data-theme="pro" className="bg-brand-background shadow-300">
        <p className="text-brand-foreground">
          This uses pro brand-background and brand-foreground
        </p>
      </div>
    </div>
  );
}

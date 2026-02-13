'use client';

// This is a demo/development page - skip static generation
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useClivinaTheme } from '@/hooks/useClivinaTheme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  H1, H2, H3, H4, H5, H6, 
  Title, Paragraph, Body, Caption, Label,
  ButtonText 
} from '@/components/ui/typography';
import { designSystem } from '@/lib/design-system';

function DesignSystemContent() {
  const { theme, colors } = useClivinaTheme();

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <div className="container mx-auto p-8 space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <H1>Cliniva Design System</H1>
          <ThemeToggle />
        </div>

        {/* Typography Section */}
        <section className="space-y-8">
          <H2>Typography</H2>
          
          {/* Headings */}
          <div className="space-y-4">
            <H3>Headings</H3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <H1>H1 - Main Title</H1>
                <H2>H2 - Section Title</H2>
                <H3>H3 - Subsection</H3>
                <H4>H4 - Component Title</H4>
                <H5>H5 - Small Title</H5>
                <H6>H6 - Micro Title</H6>
              </div>
              <div className="text-text-secondary text-sm font-mono space-y-2">
                <div>32px / 600-700 weight</div>
                <div>28px / 700 weight</div>
                <div>26px / 700 weight</div>
                <div>24px / 700-800 weight</div>
                <div>22px / 700-800 weight</div>
                <div>20px / 700-800 weight</div>
              </div>
            </div>
          </div>

          {/* Titles */}
          <div className="space-y-4">
            <H3>Titles</H3>
            <div className="space-y-2">
              <Title size="18" weight="bold">Title 18px Bold</Title>
              <Title size="16" weight="semibold">Title 16px Semibold</Title>
              <Title size="14" weight="regular">Title 14px Regular</Title>
              <Title size="12" weight="bold">Title 12px Bold</Title>
            </div>
          </div>

          {/* Paragraphs */}
          <div className="space-y-4">
            <H3>Body Text</H3>
            <div className="space-y-4">
              <Paragraph size="16" variant="primary">
                This is a 16px paragraph with primary text color. Perfect for main content and important information.
              </Paragraph>
              <Body variant="secondary">
                This is standard body text (14px) with secondary color. Great for general content and descriptions.
              </Body>
              <Caption variant="tertiary">
                This is caption text (12px) with tertiary color. Useful for metadata and supplementary information.
              </Caption>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-8">
          <H2>Color Palette</H2>
          
          {/* Theme Colors */}
          <div className="space-y-6">
            <H3>Current Theme: {theme}</H3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Background Colors */}
              <div className="space-y-3">
                <H4>Background Colors</H4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded border bg-background-primary border-border-light"></div>
                    <div>
                      <Label>Primary</Label>
                      <Caption>Main background</Caption>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded border bg-background-secondary border-border-light"></div>
                    <div>
                      <Label>Secondary</Label>
                      <Caption>Subtle backgrounds</Caption>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded border bg-background-card border-border-light"></div>
                    <div>
                      <Label>Card</Label>
                      <Caption>Card backgrounds</Caption>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surface Colors */}
              <div className="space-y-3">
                <H4>Surface Colors</H4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded border bg-surface-primary border-border-light"></div>
                    <div>
                      <Label>Primary</Label>
                      <Caption>Default surface</Caption>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded border bg-surface-hover border-border-light"></div>
                    <div>
                      <Label>Hover</Label>
                      <Caption>Hover states</Caption>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded border bg-surface-active border-border-light"></div>
                    <div>
                      <Label>Active</Label>
                      <Caption>Active states</Caption>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="space-y-3">
                <H4>Brand Colors</H4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded" style={{backgroundColor: designSystem.colors.primary[500]}}></div>
                    <div>
                      <Label>Primary</Label>
                      <Caption>Brand primary</Caption>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded" style={{backgroundColor: designSystem.colors.secondary[500]}}></div>
                    <div>
                      <Label>Secondary</Label>
                      <Caption>Brand secondary</Caption>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="space-y-4">
            <H3>Semantic Colors</H3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded" style={{backgroundColor: designSystem.colors.success[500]}}></div>
                <div>
                  <Label>Success</Label>
                  <Caption>Positive actions</Caption>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded" style={{backgroundColor: designSystem.colors.warning[500]}}></div>
                <div>
                  <Label>Warning</Label>
                  <Caption>Caution states</Caption>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded" style={{backgroundColor: designSystem.colors.error[500]}}></div>
                <div>
                  <Label>Error</Label>
                  <Caption>Destructive actions</Caption>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Component Samples */}
        <section className="space-y-8">
          <H2>Component Samples</H2>
          
          {/* Buttons */}
          <div className="space-y-4">
            <H3>Buttons</H3>
            <div className="flex flex-wrap gap-4">
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                <ButtonText weight="semibold">Primary Button</ButtonText>
              </button>
              <button className="px-4 py-2 bg-surface-secondary border border-border-light text-text-primary rounded-lg hover:bg-surface-hover transition-colors">
                <ButtonText weight="semibold">Secondary Button</ButtonText>
              </button>
              <button className="px-4 py-2 text-text-accent hover:text-text-primary transition-colors">
                <ButtonText weight="semibold">Text Button</ButtonText>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            <H3>Cards</H3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-background-card border border-border-light rounded-lg">
                <H4 className="mb-2">Card Title</H4>
                <Body variant="secondary" className="mb-4">
                  This is a sample card component using the design system colors and typography.
                </Body>
                <button className="px-3 py-1.5 bg-primary-500 text-white rounded text-sm font-semibold">
                  Action
                </button>
              </div>
              <div className="p-6 bg-surface-primary border border-border-light rounded-lg hover:bg-surface-hover transition-colors">
                <H4 className="mb-2">Interactive Card</H4>
                <Body variant="secondary">
                  This card has hover effects using surface colors from the design system.
                </Body>
              </div>
            </div>
          </div>

          {/* Form Elements */}
          <div className="space-y-4">
            <H3>Form Elements</H3>
            <div className="max-w-md space-y-4">
              <div>
                <Label className="block mb-2">Input Label</Label>
                <input 
                  type="text" 
                  placeholder="Enter text..."
                  className="w-full px-3 py-2 bg-background-primary border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-border-focus"
                />
              </div>
              <div>
                <Label className="block mb-2">Select</Label>
                <select className="w-full px-3 py-2 bg-background-primary border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-border-focus">
                  <option>Choose an option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing Scale */}
        <section className="space-y-8">
          <H2>Spacing Scale</H2>
          <div className="space-y-4">
            <H3>Common Spacing Values</H3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 6, 8, 12, 16, 20, 24].map((size) => (
                <div key={size} className="flex items-center space-x-4">
                  <div className="w-16 text-right">
                    <Caption>{size}</Caption>
                  </div>
                  <div 
                    className="bg-primary-200 h-4"
                    style={{ width: `${size * 0.25}rem` }}
                  ></div>
                  <Caption className="text-text-muted">{size * 0.25}rem ({size * 4}px)</Caption>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Usage Example */}
        <section className="space-y-8">
          <H2>Usage Examples</H2>
          <div className="space-y-6">
            <div className="bg-surface-secondary p-6 rounded-lg border border-border-light">
              <H3 className="mb-4">Import and Usage</H3>
              <pre className="bg-background-tertiary p-4 rounded text-sm overflow-x-auto">
                <code>{`// Import design system
import designSystem from '@/lib/design-system';
import { useTheme } from '@/providers/theme-provider';
import { H1, Body } from '@/components/ui/typography';

// Use typography components
<H1>Page Title</H1>
<Body variant="secondary">Content text</Body>

// Use theme colors in className
<div className="bg-background-card text-text-primary">
  Theme-aware component
</div>

// Access design tokens programmatically
const primaryColor = designSystem.colors.primary[500];`}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


export default function DesignSystemPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <DesignSystemContent />;
}

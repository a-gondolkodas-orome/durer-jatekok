import { useId, useState, type ReactNode } from 'react';
import { useTranslation, type I18nNode } from '../language';

// A manually controlled collapsible section (rather than Headless UI's
// Disclosure, whose `defaultOpen` is not reactive) so callers can force a
// collapsed section open — e.g. when the category filter has matching results.
export const CollapsibleSection = ({
  title, trailing, defaultOpen, forceOpen = false, dataTestid, children
}: {
  title: I18nNode
  trailing?: ReactNode
  defaultOpen: boolean
  forceOpen?: boolean
  dataTestid?: string
  children: ReactNode
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  const isOpen = open || forceOpen;

  return (
    <section className="mb-2" data-testid={dataTestid}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-center gap-2 my-4 hocus:text-blue-600 dark:hocus:text-blue-400"
      >
        <span
          aria-hidden="true"
          className="inline-block transition-transform"
          style={{ transform: isOpen ? 'rotate(90deg)' : undefined }}
        >▸</span>
        <h2>{t(title)}</h2>
        {trailing}
      </button>
      {isOpen && <div id={panelId}>{children}</div>}
    </section>
  );
};

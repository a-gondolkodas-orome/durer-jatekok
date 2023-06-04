import { Disclosure } from '@headlessui/react';

export const GameRule = ({ ruleDescription }) => {
  return <section className="flex justify-center mb-4 mt-1 max-w-[100ch]">
    <Disclosure>
      {({ open }) => (
        <div className="border-2 rounded grow">
          <Disclosure.Button className="w-full bg-slate-200 text-xl flex justify-center">
            <span className="grow">Játékszabályok</span>
            { !open && <span className="text-right pr-4">⛛</span>}
            { open && <span className="text-right pr-4" style={{ transform: 'scaleY(-1)' }}>⛛</span>}
          </Disclosure.Button>
            <Disclosure.Panel className="w-full p-2">
              <p className="text-justify">
                {ruleDescription}
              </p>
            </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  </section>;
};

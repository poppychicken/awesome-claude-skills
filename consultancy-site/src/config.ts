// Central place for site-wide settings. Edit these first.
export const site = {
  name: 'Pop Consulting',
  tagline: 'Strategy and implementation, with AI at the centre',
  description:
    'A small, senior consultancy led by two former executives. We help leadership teams decide where AI should change their business, then make it happen.',
  email: 'hello@pop.consulting',
  // Paste your Cal.com or Calendly link here, e.g. https://cal.com/you/intro
  // Leave empty to show a placeholder in the Contact section.
  bookingUrl: '',
  // One page: every menu item scrolls to a section id on the home page.
  nav: [
    { label: 'Services', id: 'services' },
    { label: 'Approach', id: 'approach' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ],
  // Placeholder founder details: replace with real names, roles and backgrounds.
  founders: [
    {
      name: 'Founder One',
      role: 'Co-founder',
      bio: 'Former [executive role] at [company]. Add two or three lines on what they led and what they are known for.',
    },
    {
      name: 'Founder Two',
      role: 'Co-founder',
      bio: 'Former [executive role] at [company]. Add two or three lines on what they led and what they are known for.',
    },
  ],
};

/** Works from the home page and from 404, which has no sections to scroll to. */
export const sectionHref = (id: string) => `/#${id}`;

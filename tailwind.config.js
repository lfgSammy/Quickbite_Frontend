/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E1261C',
          'red-dark': '#B81E16',
          black: '#0A0A0A',
          yellow: '#F5A623',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        logo: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // Named type scale — keep class names (text-h1, text-body, ...) in sync
      // with the design guideline table; each entry bundles the matching
      // line-height and font-weight so components don't have to pair them up.
      fontSize: {
        display: ['48px', { lineHeight: '56px', fontWeight: '700' }],
        h1: ['40px', { lineHeight: '48px', fontWeight: '700' }],
        h2: ['32px', { lineHeight: '40px', fontWeight: '600' }],
        h3: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h5: ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'btn-lg': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'btn-sm': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        label: ['14px', { lineHeight: '20px', fontWeight: '500' }],
        input: ['16px', { lineHeight: '24px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}

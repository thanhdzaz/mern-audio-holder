module.exports = {
  // important: true,
  important: '#music-app-root',
  content: [
    './src/*.{html,js,tsx}',
    './src/**/*.{html,js,tsx}',
  ],
  theme: {
    extend: {
      margin: {
        15: '60px',
        23: '94px',
        14: '14px',
        26: '26px',
        21: '21px',
      },
      padding: {
        30: '30px',
        17: '17px',
        19: '19px',
        18: '18px',
        15: '15px',
        37: '37px',
        11: '11px',
      },
      backgroundColor: ['even'],
      height: {
        header: '60px',
      },
      width: {
        315: '315px',
        96: '96px',
        600: '600px',
        68: '68px',
        1230: '1230px',
      },
      maxWidth: {
        68: '68px',
      },
      boxShadow: {
        '3xl': '0px 4px 8px rgba(51, 51, 51, 0.12)',
        'md-custom':
          '0 2px 4px 2px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md-custom-2':
          '0px 0px 4px rgba(51, 51, 51, 0.16)',
        small: '0.2px 0.2px 3px 0.1px rgba(0, 0, 0, 0.079)',
        1: '0px 0px 4px rgba(51, 51, 51, 0.12)',
        'cus-1': '0px 0px 43px -12px rgba(0, 0, 0, 0.75)'
      },
      borderRadius: {
        8: '8px',
        20: '20px',
        full: '50%',
      },
    },
  },
};

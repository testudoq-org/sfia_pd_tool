// Tailwind CSS configuration for csv2json.htm
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        }
      },
      fontFamily: {
        'dyslexic': ['OpenDyslexic', 'Comic Sans MS', 'Arial', 'sans-serif'],
        'readable': ['Inter', 'Lexend', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'base-accessible': ['18px', '1.6'],
        'lg-accessible': ['20px', '1.7'],
        'xl-accessible': ['22px', '1.8']
      },
      spacing: {
        'accessible': '44px'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-down': 'slideDown 0.2s ease-out'
      }
    }
  }
};
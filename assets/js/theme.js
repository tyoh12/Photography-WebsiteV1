/**
 * Emma Frost Photography
 * Theme Toggle Functionality
 * Handles light/dark mode based on system preferences with manual toggle
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    
    // Set initial theme based on saved preference or system preference
    if (savedTheme) {
      htmlElement.classList.add(savedTheme + '-mode');
      setThemeIcon(savedTheme);
    } else {
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        htmlElement.classList.add('dark-mode');
        setThemeIcon('dark');
      } else {
        htmlElement.classList.add('light-mode');
        setThemeIcon('light');
      }
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
      // Check current theme
      const isDarkMode = htmlElement.classList.contains('dark-mode');
      
      // Toggle theme
      if (isDarkMode) {
        htmlElement.classList.remove('dark-mode');
        htmlElement.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
        setThemeIcon('light');
      } else {
        htmlElement.classList.remove('light-mode');
        htmlElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        setThemeIcon('dark');
      }
      
      // Announce theme change to screen readers
      announceThemeChange(!isDarkMode);
    });
    
    // Watch for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        // Only apply system preference if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
          if (e.matches) {
            htmlElement.classList.remove('light-mode');
            htmlElement.classList.add('dark-mode');
            setThemeIcon('dark');
          } else {
            htmlElement.classList.remove('dark-mode');
            htmlElement.classList.add('light-mode');
            setThemeIcon('light');
          }
        }
      });
    }
    
    // Function to set the theme icon based on the current theme
    function setThemeIcon(theme) {
      const sunIcon = themeToggle.querySelector('.sun-icon');
      const moonIcon = themeToggle.querySelector('.moon-icon');
      
      if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        themeToggle.setAttribute('aria-label', 'Switch to light theme');
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        themeToggle.setAttribute('aria-label', 'Switch to dark theme');
      }
    }
    
    // Function to announce theme change to screen readers
    function announceThemeChange(isDark) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.classList.add('visually-hidden');
      announcement.textContent = `Theme switched to ${isDark ? 'dark' : 'light'} mode.`;
      document.body.appendChild(announcement);
      
      // Remove announcement after it's been read
      setTimeout(function() {
        document.body.removeChild(announcement);
      }, 3000);
    }
  });
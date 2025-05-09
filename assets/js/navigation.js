/**
 * Emma Frost Photography
 * Navigation Functionality
 * Handles mobile menu, dropdown navigation, and scroll effects
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const header = document.getElementById('site-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Add skip to content link
    addSkipToContentLink();
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      
      // Update ARIA attributes
      const expanded = menuToggle.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', expanded);
      
      // Lock/unlock body scroll when menu is open/closed
      if (expanded) {
        document.body.style.overflow = 'hidden';
        // Trap focus within mobile menu
        trapFocus(navLinks);
      } else {
        document.body.style.overflow = '';
        // Release focus trap
        releaseFocusTrap();
      }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      const isClickInsideNav = navLinks.contains(event.target);
      const isClickOnToggle = menuToggle.contains(event.target);
      
      if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
        releaseFocusTrap();
      }
    });
    
    // Mobile dropdown toggles
    if (window.innerWidth <= 768) {
      dropdowns.forEach(dropdown => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        
        dropdownToggle.addEventListener('click', function(e) {
          e.preventDefault();
          dropdown.classList.toggle('active');
          
          // Update ARIA attributes
          const expanded = dropdown.classList.contains('active');
          dropdownToggle.setAttribute('aria-expanded', expanded);
        });
      });
    }
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
    
    // Set active link based on current page
    setActiveNavLink();
    
    // Handle ESC key for closing mobile menu
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
        releaseFocusTrap();
        menuToggle.focus(); // Return focus to the toggle button
      }
    });
    
    // Add resize listener to reset mobile menu state on window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
        releaseFocusTrap();
      }
    });
    
    // Function to set active navigation link based on current URL
    function setActiveNavLink() {
      const currentPath = window.location.pathname;
      const navItems = document.querySelectorAll('.nav-links a');
      
      navItems.forEach(item => {
        const href = item.getAttribute('href');
        
        // Check if the link href matches the current path
        if (href === currentPath || 
            (currentPath.includes(href) && href !== 'index.html' && href !== '/')) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
    
    // Function to add skip to content link
    function addSkipToContentLink() {
      const skipLink = document.createElement('a');
      skipLink.textContent = 'Skip to content';
      skipLink.className = 'skip-link';
      skipLink.href = '#main-content';
      
      document.body.insertBefore(skipLink, document.body.firstChild);
      
      // Add id to main content if it doesn't exist
      const main = document.querySelector('main');
      if (main && !main.id) {
        main.id = 'main-content';
      }
    }
    
    // Focus trap for mobile menu
    let previouslyFocusedElement;
    
    function trapFocus(element) {
      previouslyFocusedElement = document.activeElement;
      
      // Find all focusable elements
      const focusableElements = element.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Focus first element
      firstElement.focus();
      
      // Trap focus within the element
      element.addEventListener('keydown', handleTabKey);
      
      function handleTabKey(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
    
    function releaseFocusTrap() {
      navLinks.removeEventListener('keydown', handleTabKey);
      
      // Return focus to previously focused element
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
    }
    
    // Initialize dropdown ARIA attributes
    initializeDropdownARIA();
    
    // Function to initialize ARIA attributes for dropdowns
    function initializeDropdownARIA() {
      dropdowns.forEach((dropdown, index) => {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        const menuId = `dropdown-menu-${index}`;
        
        // Set ARIA attributes for dropdown toggle
        dropdownToggle.setAttribute('aria-haspopup', 'true');
        dropdownToggle.setAttribute('aria-expanded', 'false');
        dropdownToggle.setAttribute('aria-controls', menuId);
        
        // Set id and role for dropdown menu
        dropdownMenu.id = menuId;
        dropdownMenu.setAttribute('role', 'menu');
        
        // Add appropriate roles to menu items
        const menuItems = dropdownMenu.querySelectorAll('a');
        menuItems.forEach(item => {
          item.setAttribute('role', 'menuitem');
        });
      });
    }
  });
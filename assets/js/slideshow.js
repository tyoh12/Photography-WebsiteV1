/**
 * Emma Frost Photography
 * Slideshow Functionality
 * Handles hero slideshow with automatic and manual controls
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize slideshow variables
    let slideIndex = 1;
    let slideshowInterval;
    const slideDuration = 5000; // 5 seconds per slide
    const slides = document.getElementsByClassName('slide');
    const indicators = document.getElementsByClassName('indicator');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    
    // Exit if slideshow elements don't exist on this page
    if (!slides.length) return;
    
    // Initialize slideshow
    showSlides(slideIndex);
    startSlideshow();
    
    // Add ARIA attributes to slideshow
    initializeSlideshowARIA();
    
    // Add event listeners to navigation buttons
    if (prevButton && nextButton) {
      prevButton.addEventListener('click', function() {
        plusSlides(-1);
      });
      
      nextButton.addEventListener('click', function() {
        plusSlides(1);
      });
    }
    
    // Add event listeners to indicators
    if (indicators.length) {
      for (let i = 0; i < indicators.length; i++) {
        indicators[i].addEventListener('click', function() {
          currentSlide(i + 1);
        });
      }
    }
    
    // Add keyboard navigation for slideshow
    document.addEventListener('keydown', function(e) {
      // Only respond to keyboard events when slideshow is in viewport
      const slideshow = document.getElementById('hero-slideshow');
      if (!slideshow) return;
      
      const rect = slideshow.getBoundingClientRect();
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
      
      if (isInViewport) {
        if (e.key === 'ArrowLeft') {
          plusSlides(-1);
        } else if (e.key === 'ArrowRight') {
          plusSlides(1);
        }
      }
    });
    
    // Pause slideshow on hover or focus
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
      slideshowContainer.addEventListener('mouseenter', pauseSlideshow);
      slideshowContainer.addEventListener('mouseleave', startSlideshow);
      slideshowContainer.addEventListener('focusin', pauseSlideshow);
      slideshowContainer.addEventListener('focusout', startSlideshow);
    }
    
    // Function to show slides
    function showSlides(n) {
      // Reset slideIndex if out of bounds
      if (n > slides.length) {
        slideIndex = 1;
      } else if (n < 1) {
        slideIndex = slides.length;
      } else {
        slideIndex = n;
      }
      
      // Hide all slides
      for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
        slides[i].setAttribute('aria-hidden', 'true');
        
        if (indicators.length) {
          indicators[i].classList.remove('active');
          indicators[i].setAttribute('aria-selected', 'false');
        }
      }
      
      // Show current slide
      slides[slideIndex - 1].style.display = 'block';
      slides[slideIndex - 1].setAttribute('aria-hidden', 'false');
      
      if (indicators.length) {
        indicators[slideIndex - 1].classList.add('active');
        indicators[slideIndex - 1].setAttribute('aria-selected', 'true');
      }
      
      // Announce slide change to screen readers
      announceSlideChange(slideIndex);
    }
    
    // Function to change slides
    function plusSlides(n) {
      showSlides(slideIndex += n);
      resetSlideshowInterval();
    }
    
    // Function to set current slide
    function currentSlide(n) {
      showSlides(slideIndex = n);
      resetSlideshowInterval();
    }
    
    // Function to start automatic slideshow
    function startSlideshow() {
      // Clear any existing interval
      clearInterval(slideshowInterval);
      
      // Set new interval
      slideshowInterval = setInterval(function() {
        plusSlides(1);
      }, slideDuration);
    }
    
    // Function to pause slideshow
    function pauseSlideshow() {
      clearInterval(slideshowInterval);
    }
    
    // Function to reset slideshow interval
    function resetSlideshowInterval() {
      pauseSlideshow();
      startSlideshow();
    }
    
    // Function to announce slide change to screen readers
    function announceSlideChange(index) {
      const slideTitle = slides[index - 1].querySelector('h1').textContent;
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.classList.add('visually-hidden');
      announcement.textContent = `Showing slide ${index} of ${slides.length}: ${slideTitle}`;
      document.body.appendChild(announcement);
      
      // Remove announcement after it's been read
      setTimeout(function() {
        document.body.removeChild(announcement);
      }, 3000);
    }
    
    // Function to initialize ARIA attributes for slideshow
    function initializeSlideshowARIA() {
      const slideshow = document.querySelector('.slideshow-container');
      slideshow.setAttribute('aria-roledescription', 'carousel');
      slideshow.setAttribute('aria-label', 'Featured photography slideshow');
      
      // Add roles to slides
      for (let i = 0; i < slides.length; i++) {
        slides[i].setAttribute('role', 'group');
        slides[i].setAttribute('aria-roledescription', 'slide');
        slides[i].setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
      }
      
      // Add roles to indicators
      if (indicators.length) {
        const indicatorsContainer = document.querySelector('.slideshow-indicators');
        indicatorsContainer.setAttribute('role', 'tablist');
        indicatorsContainer.setAttribute('aria-label', 'Slideshow navigation');
        
        for (let i = 0; i < indicators.length; i++) {
          indicators[i].setAttribute('role', 'tab');
          indicators[i].setAttribute('tabindex', '0');
          indicators[i].setAttribute('aria-controls', `slide-${i + 1}`);
          indicators[i].setAttribute('aria-label', `Go to slide ${i + 1}`);
        }
      }
      
      // Add roles to navigation buttons
      if (prevButton && nextButton) {
        prevButton.setAttribute('aria-label', 'Previous slide');
        nextButton.setAttribute('aria-label', 'Next slide');
      }
    }
    
    // Add touch swipe support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (slideshowContainer) {
      slideshowContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      slideshowContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }
    
    function handleSwipe() {
      const threshold = 50; // Minimum distance to be considered a swipe
      
      if (touchEndX < touchStartX - threshold) {
        // Swipe left - go to next slide
        plusSlides(1);
      } else if (touchEndX > touchStartX + threshold) {
        // Swipe right - go to previous slide
        plusSlides(-1);
      }
    }
    
    // Add preloading for adjacent slides to improve performance
    function preloadAdjacentSlides() {
      const totalSlides = slides.length;
      if (totalSlides <= 1) return;
      
      // Get indices of adjacent slides (accounting for wrapping)
      const prevIndex = (slideIndex - 2 + totalSlides) % totalSlides;
      const nextIndex = slideIndex % totalSlides;
      
      // Preload images
      const prevSlideImg = slides[prevIndex].querySelector('img');
      const nextSlideImg = slides[nextIndex].querySelector('img');
      
      if (prevSlideImg) {
        const prevImg = new Image();
        prevImg.src = prevSlideImg.src;
      }
      
      if (nextSlideImg) {
        const nextImg = new Image();
        nextImg.src = nextSlideImg.src;
      }
    }
    
    // Call preload function after showing slides
    const originalShowSlides = showSlides;
    showSlides = function(n) {
      originalShowSlides(n);
      preloadAdjacentSlides();
    };
    
    // Handle visibility change to pause/resume slideshow when page is not visible
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        pauseSlideshow();
      } else {
        startSlideshow();
      }
    });
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Disable automatic slideshow
      pauseSlideshow();
      
      // Remove animations
      const slideContent = document.querySelectorAll('.slide-content');
      slideContent.forEach(content => {
        content.style.transition = 'none';
      });
    }
  });
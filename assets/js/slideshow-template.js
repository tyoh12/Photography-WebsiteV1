/**
 * Simple Photo Slideshow
 * Displays all images in a directory as a slideshow without any text
 */
document.addEventListener('DOMContentLoaded', function() {
    const slideshowContainer = document.querySelector('.slideshow-container');
    
    // Exit if slideshow container doesn't exist on this page
    if (!slideshowContainer) return;
    
    // Simple configuration - updated automatically by build script
    const config = {
        imagePath: 'assets/images/slideshow/',
        imageList: [
            // IMAGE_LIST_PLACEHOLDER
        ],
        slideDuration: 5000 // Time in milliseconds between transitions
    };
    
    // Generate slideshow HTML
    generateSimpleSlideshow(config);
    
    // Initialize slideshow functionality
    initializeSlideshow(config.slideDuration);
});

/**
 * Generate simple slideshow HTML from image list
 */
function generateSimpleSlideshow(config) {
    const slideshowContainer = document.querySelector('.slideshow-container');
    slideshowContainer.innerHTML = '';
    
    // Create slides
    config.imageList.forEach((image) => {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide fade';
        
        // Create simple image slide with no text
        slideElement.innerHTML = `
            <img src="${config.imagePath}${image}" alt="Slideshow image">
        `;
        
        // Add to container
        slideshowContainer.appendChild(slideElement);
    });
    
    // Create navigation controls
    const prevButton = document.createElement('a');
    prevButton.className = 'prev';
    prevButton.innerHTML = '&#10094;';
    prevButton.setAttribute('aria-label', 'Previous slide');
    
    const nextButton = document.createElement('a');
    nextButton.className = 'next';
    nextButton.innerHTML = '&#10095;';
    nextButton.setAttribute('aria-label', 'Next slide');
    
    slideshowContainer.appendChild(prevButton);
    slideshowContainer.appendChild(nextButton);
    
    // Create slideshow indicators
    const indicators = document.createElement('div');
    indicators.className = 'slideshow-indicators';
    
    config.imageList.forEach((_, index) => {
        const indicator = document.createElement('span');
        indicator.className = 'indicator';
        indicator.setAttribute('data-index', index + 1);
        indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
        indicators.appendChild(indicator);
    });
    
    slideshowContainer.appendChild(indicators);
}

/**
 * Initialize slideshow functionality
 */
function initializeSlideshow(slideDuration) {
    let slideIndex = 1;
    let slideshowInterval;
    
    const slides = document.getElementsByClassName('slide');
    const indicators = document.getElementsByClassName('indicator');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    
    // Exit if no slides found
    if (slides.length === 0) return;
    
    // Show first slide
    showSlides(slideIndex);
    
    // Start automatic slideshow
    startSlideshow();
    
    // Add event listeners to navigation buttons
    prevButton.addEventListener('click', () => plusSlides(-1));
    nextButton.addEventListener('click', () => plusSlides(1));
    
    // Add event listeners to indicators
    for (let i = 0; i < indicators.length; i++) {
        indicators[i].addEventListener('click', () => currentSlide(i + 1));
    }
    
    // Add pause/resume on hover
    const slideshowContainer = document.querySelector('.slideshow-container');
    slideshowContainer.addEventListener('mouseenter', pauseSlideshow);
    slideshowContainer.addEventListener('mouseleave', startSlideshow);
    
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
        slideshowInterval = setInterval(() => {
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
    
    // Add touch swipe support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    slideshowContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slideshowContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
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
}
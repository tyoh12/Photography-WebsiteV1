/**
 * Simple Photo Slideshow
 * This is a standalone solution that doesn't rely on generate-image-arrays.js
 * It will find images in the slideshow directory directly
 */
document.addEventListener('DOMContentLoaded', function() {
    const slideshowContainer = document.querySelector('.slideshow-container');
    
    // Exit if slideshow container doesn't exist on this page
    if (!slideshowContainer) return;
    
    // Default images to use if no images are found in the slideshow directory
    const fallbackImages = [
        'placeholder-1.jpg',
        'placeholder-2.jpg',
        'placeholder-3.jpg'
    ];
    
    // Configuration
    const config = {
        imagePath: 'assets/images/slideshow/',
        // We'll populate this dynamically
        imageList: [],
        slideDuration: 5000 // Time in milliseconds between transitions
    };
    
    // Function to scan the slideshow directory for images
    function findSlideshowImages() {
        // In the real world, this would be done server-side
        // For now, we'll check for common file extensions
        const commonFileNames = [
            'hero-1.jpg', 'hero-2.jpg', 'hero-3.jpg', 'hero-4.jpg', 'hero-5.jpg',
            'slide-1.jpg', 'slide-2.jpg', 'slide-3.jpg', 'slide-4.jpg', 'slide-5.jpg',
            'slideshow-1.jpg', 'slideshow-2.jpg', 'slideshow-3.jpg', 'slideshow-4.jpg',
            'image-1.jpg', 'image-2.jpg', 'image-3.jpg', 'image-4.jpg',
            'photo-1.jpg', 'photo-2.jpg', 'photo-3.jpg', 'photo-4.jpg',
            'landscape-1.jpg', 'landscape-2.jpg', 'landscape-3.jpg',
            'portrait-1.jpg', 'portrait-2.jpg', 'portrait-3.jpg'
        ];
        
        // Also check with different extensions
        const extensionsToCheck = ['.jpg', '.jpeg', '.png', '.webp'];
        
        // Create a promises array to check image existence
        const checkPromises = [];
        
        // Check each possible image name
        commonFileNames.forEach(fileName => {
            // Also check different extensions for each file name
            extensionsToCheck.forEach(ext => {
                const baseFileName = fileName.split('.')[0];
                const fullFileName = baseFileName + ext;
                
                const promise = new Promise((resolve) => {
                    const img = new Image();
                    img.onload = function() {
                        resolve(fullFileName);
                    };
                    img.onerror = function() {
                        resolve(null);
                    };
                    img.src = config.imagePath + fullFileName;
                });
                
                checkPromises.push(promise);
            });
        });
        
        // Wait for all checks to complete
        return Promise.all(checkPromises).then(results => {
            // Filter out null results (images that don't exist)
            const foundImages = results.filter(result => result !== null);
            
            // Use found images or fallback
            config.imageList = foundImages.length > 0 ? foundImages : fallbackImages;
            
            // Generate the slideshow
            generateSimpleSlideshow(config);
            
            // Initialize slideshow functionality
            initializeSlideshow(config.slideDuration);
            
            // Hide loading container once we're done
            const loadingContainer = document.querySelector('.loading-container');
            if (loadingContainer) {
                loadingContainer.style.display = 'none';
            }
            
            // Dispatch an event to indicate slideshow is ready
            document.dispatchEvent(new Event('slideshowInitialized'));
            
            console.log('Slideshow initialized with images:', config.imageList);
        });
    }
    
    // Start the process
    findSlideshowImages();
});

/**
 * Generate simple slideshow HTML from image list
 */
function generateSimpleSlideshow(config) {
    const slideshowContainer = document.querySelector('.slideshow-container');
    
    // Keep loading container if it exists
    const loadingContainer = slideshowContainer.querySelector('.loading-container');
    
    // Clear other content
    slideshowContainer.innerHTML = '';
    
    // Add back loading container
    if (loadingContainer) {
        slideshowContainer.appendChild(loadingContainer);
    }
    
    // Create slides
    config.imageList.forEach((image, index) => {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide';
        if (index === 0) {
            slideElement.style.display = 'block'; // Make first slide visible
        }
        
        // Create simple image slide with no text
        slideElement.innerHTML = `
            <img src="${config.imagePath}${image}" alt="Slideshow image ${index + 1}">
            <div class="slide-content">
                <h1>Capturing Life's Beautiful Moments</h1>
                <p>Modern farmhouse-inspired photography in Maine</p>
            </div>
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
        if (index === 0) {
            indicator.classList.add('active');
        }
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
    if (slides.length === 0) {
        console.error('No slides found!');
        return;
    }
    
    // Show first slide
    showSlides(slideIndex);
    
    // Start automatic slideshow
    startSlideshow();
    
    // Add event listeners to navigation buttons
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => plusSlides(-1));
        nextButton.addEventListener('click', () => plusSlides(1));
    }
    
    // Add event listeners to indicators
    for (let i = 0; i < indicators.length; i++) {
        indicators[i].addEventListener('click', function() {
            currentSlide(i + 1);
        });
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
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Only handle keyboard navigation when slideshow is in view
        const rect = slideshowContainer.getBoundingClientRect();
        const isInView = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        if (isInView) {
            if (e.key === 'ArrowLeft') {
                plusSlides(-1);
            } else if (e.key === 'ArrowRight') {
                plusSlides(1);
            }
        }
    });
}
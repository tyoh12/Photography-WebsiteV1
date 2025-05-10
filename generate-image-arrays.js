/**
 * Generate Image Arrays Script
 * 
 * This script automatically scans image directories and generates JavaScript files
 * with image arrays for the slideshow and gallery pages.
 * 
 * Usage: node generate-image-arrays.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    // Base directories
    baseDir: path.join(__dirname),
    outputDir: path.join(__dirname, 'assets', 'js'),
    
    // Slideshow configuration
    slideshow: {
        imageDir: path.join(__dirname, 'assets', 'images', 'slideshow'),
        outputFile: path.join(__dirname, 'assets', 'js', 'simple-slideshow.js'),
        templateFile: path.join(__dirname, 'assets', 'js', 'templates', 'slideshow-template.js')
    },
    
    // Gallery configuration
    gallery: {
        baseImageDir: path.join(__dirname, 'assets', 'images', 'galleries'),
        outputFile: path.join(__dirname, 'assets', 'js', 'simple-gallery.js'),
        templateFile: path.join(__dirname, 'assets', 'js', 'templates', 'gallery-template.js'),
        // List of gallery directories to scan
        galleries: [
            'landscapes',
            'wildlife',
            'nature',
            'portraits/maternity',
            'portraits/engagement',
            'portraits/families',
            'portraits/newborns',
            'portraits/seniors',
            'portraits/headshots'
        ]
    }
};

/**
 * Ensures all required directories exist
 */
function ensureDirectories() {
    const dirs = [
        path.join(__dirname, 'assets', 'js'),
        path.join(__dirname, 'assets', 'js', 'templates'),
        config.slideshow.imageDir,
        config.gallery.baseImageDir
    ];
    
    // Add gallery subdirectories
    config.gallery.galleries.forEach(gallery => {
        dirs.push(path.join(config.gallery.baseImageDir, gallery));
    });
    
    // Ensure each directory exists
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`Creating directory: ${dir}`);
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

/**
 * Scans a directory for image files
 * @param {string} directory - Directory to scan
 * @returns {string[]} - Array of image filenames
 */
function scanDirectory(directory) {
    try {
        if (!fs.existsSync(directory)) {
            console.warn(`Directory does not exist: ${directory}`);
            return [];
        }
        
        const files = fs.readdirSync(directory);
        
        // Filter for image files only
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        }).sort();
    } catch (err) {
        console.error(`Error scanning directory ${directory}:`, err);
        return [];
    }
}

/**
 * Creates template files if they don't exist
 */
function createTemplateFiles() {
    // Create templates directory if it doesn't exist
    const templatesDir = path.join(__dirname, 'assets', 'js', 'templates');
    if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
    }
    
    // Create slideshow template
    if (!fs.existsSync(config.slideshow.templateFile)) {
        const slideshowTemplate = `/**
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
    
    // Dispatch event indicating slideshow is initialized
    document.dispatchEvent(new Event('slideshowInitialized'));
});

/**
 * Generate simple slideshow HTML from image list
 */
function generateSimpleSlideshow(config) {
    const slideshowContainer = document.querySelector('.slideshow-container');
    
    // Clear existing content except loading screen
    const loadingScreen = slideshowContainer.querySelector('.loading-container');
    slideshowContainer.innerHTML = '';
    if (loadingScreen) {
        slideshowContainer.appendChild(loadingScreen);
    }
    
    // Create slides
    config.imageList.forEach((image, index) => {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide';
        if (index === 0) {
            slideElement.classList.add('active');
        }
        
        // Create simple image slide with minimal text
        slideElement.innerHTML = \`
            <img src="\${config.imagePath}\${image}" alt="Slideshow image" 
                 onerror="this.src='assets/images/ui/placeholder.jpg'">
            <div class="slide-content">
                <h1>Capturing Life's Beautiful Moments</h1>
                <p>Modern farmhouse-inspired photography in Maine</p>
            </div>
        \`;
        
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
        indicator.setAttribute('aria-label', \`Go to slide \${index + 1}\`);
        indicators.appendChild(indicator);
    });
    
    slideshowContainer.appendChild(indicators);
}

/**
 * Initialize slideshow functionality
 */
function initializeSlideshow(slideDuration) {
    let slideIndex = 0;
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
        indicators[i].addEventListener('click', () => currentSlide(i));
    }
    
    // Add pause/resume on hover
    const slideshowContainer = document.querySelector('.slideshow-container');
    slideshowContainer.addEventListener('mouseenter', pauseSlideshow);
    slideshowContainer.addEventListener('mouseleave', startSlideshow);
    
    // Function to show slides
    function showSlides(n) {
        // Reset slideIndex if out of bounds
        if (n >= slides.length) {
            slideIndex = 0;
        } else if (n < 0) {
            slideIndex = slides.length - 1;
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
        slides[slideIndex].style.display = 'block';
        slides[slideIndex].setAttribute('aria-hidden', 'false');
        
        if (indicators.length) {
            indicators[slideIndex].classList.add('active');
            indicators[slideIndex].setAttribute('aria-selected', 'true');
        }
    }
    
    // Function to change slides
    function plusSlides(n) {
        showSlides(slideIndex + n);
        resetSlideshowInterval();
    }
    
    // Function to set current slide
    function currentSlide(n) {
        showSlides(n);
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
}`;
        
        fs.writeFileSync(config.slideshow.templateFile, slideshowTemplate);
        console.log('Created slideshow template file');
    }
    
    // Create gallery template
    if (!fs.existsSync(config.gallery.templateFile)) {
        const galleryTemplate = `/**
 * Simple Photo Gallery
 * Displays all images in a directory without filtering or captions
 */
document.addEventListener('DOMContentLoaded', function() {
    const galleryContainer = document.querySelector('.masonry-grid');
    
    // Exit if gallery container doesn't exist on this page
    if (!galleryContainer) return;
    
    // Get gallery type from path
    const galleryType = getGalleryTypeFromPath();
    
    // Simple configuration for each gallery
    const config = {
        basePath: getBasePath(galleryType),
        imageList: getImageListForGallery(galleryType)
    };
    
    // Generate gallery items
    generateSimpleGalleryItems(config);
    
    // Initialize lightbox
    initializeLightbox();
    
    // Dispatch event indicating gallery is initialized
    document.dispatchEvent(new Event('galleryInitialized'));
});

/**
 * Determine gallery type from current URL path
 */
function getGalleryTypeFromPath() {
    const path = window.location.pathname;
    
    // Check for main gallery types
    if (path.includes('/landscapes')) return 'landscapes';
    if (path.includes('/wildlife')) return 'wildlife';
    if (path.includes('/nature')) return 'nature';
    
    // Check for portrait gallery types
    if (path.includes('/portraits/maternity')) return 'portraits/maternity';
    if (path.includes('/portraits/engagement')) return 'portraits/engagement';
    if (path.includes('/portraits/families')) return 'portraits/families';
    if (path.includes('/portraits/newborns')) return 'portraits/newborns';
    if (path.includes('/portraits/seniors')) return 'portraits/seniors';
    if (path.includes('/portraits/headshots')) return 'portraits/headshots';
    
    // Default fallback
    return 'landscapes';
}

/**
 * Get base path for gallery images based on gallery type
 */
function getBasePath(galleryType) {
    // Handle the different depth levels in the URL structure
    if (galleryType.includes('/')) {
        return '../../assets/images/galleries/' + galleryType + '/';
    } else {
        return '../assets/images/galleries/' + galleryType + '/';
    }
}

/**
 * Get image list based on gallery type
 * This function is auto-generated by the build script
 */
function getImageListForGallery(galleryType) {
    // These arrays are automatically updated by the build script
    const galleryImages = {
        // GALLERY_IMAGES_PLACEHOLDER
    };
    
    return galleryImages[galleryType] || [];
}

/**
 * Generate simple gallery items
 */
function generateSimpleGalleryItems(config) {
    const galleryContainer = document.querySelector('.masonry-grid');
    
    // Clear existing content except loading screen
    const loadingScreen = document.querySelector('.loading-container');
    galleryContainer.innerHTML = '';
    
    // Create gallery items
    if (config.imageList.length === 0) {
        const noImagesMessage = document.createElement('p');
        noImagesMessage.textContent = 'No images found in this gallery.';
        noImagesMessage.style.textAlign = 'center';
        noImagesMessage.style.padding = '2rem';
        galleryContainer.appendChild(noImagesMessage);
    } else {
        config.imageList.forEach(image => {
            // Create gallery item element
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            // Create simple gallery item HTML without categories or captions
            // Use appropriate error placeholder path based on depth level
            const errorImagePath = config.basePath.includes('../../') ? 
                '../../assets/images/ui/placeholder.jpg' : 
                '../assets/images/ui/placeholder.jpg';
                
            galleryItem.innerHTML = \`
                <a href="\${config.basePath}\${image}" class="lightbox-trigger">
                    <img src="\${config.basePath}\${image}" alt="Gallery image" loading="lazy"
                         onerror="this.src='\${errorImagePath}'">
                </a>
            \`;
            
            // Add to gallery
            galleryContainer.appendChild(galleryItem);
        });
    }
    
    // Hide loading screen if it exists
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

/**
 * Initialize simple lightbox functionality
 */
function initializeLightbox() {
    // Ensure lightbox container exists
    let lightbox = document.getElementById('lightbox');
    
    // Create lightbox if it doesn't exist
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = \`
            <div class="lightbox-content">
                <span class="close-lightbox">&times;</span>
                <img id="lightbox-image" src="" alt="Gallery image in lightbox">
                <div class="lightbox-controls">
                    <button class="lightbox-prev" aria-label="Previous image">&#10094;</button>
                    <button class="lightbox-next" aria-label="Next image">&#10095;</button>
                </div>
            </div>
        \`;
        document.body.appendChild(lightbox);
    }
    
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.querySelector('.close-lightbox');
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    const prevButton = document.querySelector('.lightbox-prev');
    const nextButton = document.querySelector('.lightbox-next');
    
    // Exit if no triggers found
    if (lightboxTriggers.length === 0) return;
    
    let currentIndex = 0;
    const lightboxItems = [];
    
    // Populate lightbox items array with image URLs
    lightboxTriggers.forEach((trigger, index) => {
        const imageUrl = trigger.getAttribute('href');
        
        lightboxItems.push({
            url: imageUrl
        });
        
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            openLightbox(index);
        });
    });
    
    function openLightbox(index) {
        currentIndex = index;
        updateLightboxContent();
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    function updateLightboxContent() {
        const item = lightboxItems[currentIndex];
        lightboxImage.src = item.url;
        lightboxImage.alt = "Gallery image";
    }
    
    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Add event listeners
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            currentIndex = (currentIndex - 1 + lightboxItems.length) % lightboxItems.length;
            updateLightboxContent();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            currentIndex = (currentIndex + 1) % lightboxItems.length;
            updateLightboxContent();
        });
    }
    
    // Keyboard navigation for lightbox
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + lightboxItems.length) % lightboxItems.length;
                updateLightboxContent();
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % lightboxItems.length;
                updateLightboxContent();
            }
        }
    });
}`;
        
        fs.writeFileSync(config.gallery.templateFile, galleryTemplate);
        console.log('Created gallery template file');
    }
}

/**
 * Creates output files in the assets/js directory
 */
function createOutputFiles() {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Create simple-slideshow.js if it doesn't exist
    if (!fs.existsSync(config.slideshow.outputFile)) {
        // Read template
        const template = fs.readFileSync(config.slideshow.templateFile, 'utf8');
        
        // Create output file with placeholder image array
        const outputContent = template.replace('            // IMAGE_LIST_PLACEHOLDER', "            'placeholder.jpg'");
        fs.writeFileSync(config.slideshow.outputFile, outputContent);
        console.log('Created slideshow JavaScript file');
    }
    
    // Create simple-gallery.js if it doesn't exist
    if (!fs.existsSync(config.gallery.outputFile)) {
        // Read template
        const template = fs.readFileSync(config.gallery.templateFile, 'utf8');
        
        // Create a placeholder entry for each gallery
        let galleryArrays = '';
        config.gallery.galleries.forEach((galleryType, index) => {
            galleryArrays += `        '${galleryType}': [\n            'placeholder.jpg'\n        ]`;
            
            // Add comma unless this is the last entry
            if (index < config.gallery.galleries.length - 1) {
                galleryArrays += ',\n';
            }
        });
        
        // Replace placeholder
        const outputContent = template.replace('        // GALLERY_IMAGES_PLACEHOLDER', galleryArrays);
        
        fs.writeFileSync(config.gallery.outputFile, outputContent);
        console.log('Created gallery JavaScript file');
    }
}

/**
 * Generates the slideshow JavaScript file
 */
function generateSlideshowJS() {
    // Scan slideshow directory
    const slideshowImages = scanDirectory(config.slideshow.imageDir);
    console.log(`Found ${slideshowImages.length} slideshow images`);
    
    // Use placeholder if no images found
    const imagesToUse = slideshowImages.length > 0 ? slideshowImages : ['placeholder.jpg'];
    
    // Read template file
    let template = '';
    try {
        template = fs.readFileSync(config.slideshow.templateFile, 'utf8');
    } catch (err) {
        console.error('Error reading slideshow template:', err);
        return;
    }
    
    // Generate array content
    const arrayContent = imagesToUse.map(img => `            '${img}'`).join(',\n');
    
    // Replace placeholder
    const outputContent = template.replace('            // IMAGE_LIST_PLACEHOLDER', arrayContent);
    
    // Write output file
    try {
        fs.writeFileSync(config.slideshow.outputFile, outputContent);
        console.log(`Updated slideshow JavaScript with ${imagesToUse.length} images`);
    } catch (err) {
        console.error('Error writing slideshow output file:', err);
    }
}

/**
 * Generates the gallery JavaScript file
 */
function generateGalleryJS() {
    // Scan all gallery directories
    const galleryData = {};
    
    config.gallery.galleries.forEach(galleryType => {
        const galleryPath = path.join(config.gallery.baseImageDir, galleryType);
        const images = scanDirectory(galleryPath);
        galleryData[galleryType] = images;
        console.log(`Found ${images.length} images in ${galleryType} gallery`);
    });
    
    // Read template file
    let template = '';
    try {
        template = fs.readFileSync(config.gallery.templateFile, 'utf8');
    } catch (err) {
        console.error('Error reading gallery template:', err);
        return;
    }
    
    // Generate gallery objects
    let galleryArrays = '';
    
    Object.entries(galleryData).forEach(([galleryType, images], index) => {
        galleryArrays += `        '${galleryType}': [\n`;
        
        if (images.length > 0) {
            galleryArrays += images.map(img => `            '${img}'`).join(',\n');
        } else {
            galleryArrays += `            'placeholder.jpg'`;
        }
        
        galleryArrays += '\n        ]';
        
        // Add comma unless this is the last entry
        if (index < Object.entries(galleryData).length - 1) {
            galleryArrays += ',\n';
        }
    });
    
    // Replace placeholder
    const outputContent = template.replace('        // GALLERY_IMAGES_PLACEHOLDER', galleryArrays);
    
    // Write output file
    try {
        fs.writeFileSync(config.gallery.outputFile, outputContent);
        console.log(`Updated gallery JavaScript with ${Object.keys(galleryData).length} galleries`);
    } catch (err) {
        console.error('Error writing gallery output file:', err);
    }
}

/**
 * Creates placeholder images if directories are empty
 */
function createPlaceholderImages() {
    // Create UI directory for placeholders
    const uiDir = path.join(__dirname, 'assets', 'images', 'ui');
    if (!fs.existsSync(uiDir)) {
        fs.mkdirSync(uiDir, { recursive: true });
    }
    
    // Create placeholder image if it doesn't exist
    const placeholderPath = path.join(uiDir, 'placeholder.jpg');
    if (!fs.existsSync(placeholderPath)) {
        // Create a simple 1x1 pixel placeholder (minimal JPG)
        const placeholder = Buffer.from([
            0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
            0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xc2, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00,
            0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0xff, 0xda, 0x00, 0x08, 0x01,
            0x01, 0x00, 0x00, 0x3f, 0x00, 0x37, 0xff, 0xd9
        ]);
        fs.writeFileSync(placeholderPath, placeholder);
        console.log('Created placeholder image at', placeholderPath);
    }
    
    // Create slideshow directory if it doesn't exist
    if (!fs.existsSync(config.slideshow.imageDir)) {
        fs.mkdirSync(config.slideshow.imageDir, { recursive: true });
        console.log('Created slideshow directory');
    }
    
    // Check each gallery directory and create if it doesn't exist
    config.gallery.galleries.forEach(galleryType => {
        const galleryPath = path.join(config.gallery.baseImageDir, galleryType);
        
        if (!fs.existsSync(galleryPath)) {
            fs.mkdirSync(galleryPath, { recursive: true });
            console.log(`Created gallery directory: ${galleryType}`);
        }
    });
}

/**
 * Main execution function
 */
function main() {
    try {
        console.log('Starting image array generation...');
        
        // Ensure directories exist
        ensureDirectories();
        
        // Create template files if needed
        createTemplateFiles();
        
        // Create placeholder images if needed
        createPlaceholderImages();
        
        // Create output files if they don't exist
        createOutputFiles();
        
        // Generate JS files
        generateSlideshowJS();
        generateGalleryJS();
        
        console.log('Image array generation completed successfully!');
    } catch (err) {
        console.error('Error generating image arrays:', err);
        process.exit(1);
    }
}

// Run the script
main();
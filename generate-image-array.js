/**
 * Generate Image Arrays Script
 * 
 * This script automatically scans image directories and generates JavaScript arrays
 * for the slideshow and gallery pages of the photography website.
 * 
 * Usage: node generate-image-arrays.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    // Base directory for assets
    baseDir: path.join(__dirname, 'assets'),
    
    // Slideshow configuration
    slideshow: {
        imageDir: path.join(__dirname, 'assets/images/slideshow'),
        outputFile: path.join(__dirname, 'assets/js/simple-slideshow.js'),
        templateFile: path.join(__dirname, 'assets/js/templates/slideshow-template.js')
    },
    
    // Gallery configuration
    gallery: {
        baseImageDir: path.join(__dirname, 'assets/images/galleries'),
        outputFile: path.join(__dirname, 'assets/js/simple-gallery.js'),
        templateFile: path.join(__dirname, 'assets/js/templates/gallery-template.js'),
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

// Make sure the templates directory exists
try {
    if (!fs.existsSync(path.join(__dirname, 'assets/js/templates'))) {
        fs.mkdirSync(path.join(__dirname, 'assets/js/templates'), { recursive: true });
    }
} catch (err) {
    console.error('Error creating templates directory:', err);
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
        }).sort(); // Sort alphabetically
    } catch (err) {
        console.error(`Error scanning directory ${directory}:`, err);
        return [];
    }
}

/**
 * Generates the slideshow JavaScript file
 */
function generateSlideshowJS() {
    // Create template file if it doesn't exist
    if (!fs.existsSync(config.slideshow.templateFile)) {
        const templateContent = `/**
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

// Rest of the slideshow JS functions...
`;
        fs.writeFileSync(config.slideshow.templateFile, templateContent);
        console.log('Created slideshow template file');
    }
    
    // Scan slideshow directory
    const slideshowImages = scanDirectory(config.slideshow.imageDir);
    console.log(`Found ${slideshowImages.length} slideshow images`);
    
    // Read template file
    let template = fs.readFileSync(config.slideshow.templateFile, 'utf8');
    
    // Generate array content
    const arrayContent = slideshowImages.map(img => `            '${img}'`).join(',\n');
    
    // Replace placeholder
    const outputContent = template.replace('            // IMAGE_LIST_PLACEHOLDER', arrayContent);
    
    // Write output file
    fs.writeFileSync(config.slideshow.outputFile, outputContent);
    console.log(`Updated slideshow JavaScript with ${slideshowImages.length} images`);
}

/**
 * Generates the gallery JavaScript file
 */
function generateGalleryJS() {
    // Create template file if it doesn't exist
    if (!fs.existsSync(config.gallery.templateFile)) {
        const templateContent = `/**
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

// Rest of the gallery JS functions...
`;
        fs.writeFileSync(config.gallery.templateFile, templateContent);
        console.log('Created gallery template file');
    }
    
    // Scan all gallery directories
    const galleryData = {};
    
    config.gallery.galleries.forEach(galleryType => {
        const galleryPath = path.join(config.gallery.baseImageDir, galleryType);
        const images = scanDirectory(galleryPath);
        galleryData[galleryType] = images;
        console.log(`Found ${images.length} images in ${galleryType} gallery`);
    });
    
    // Read template file
    let template = fs.readFileSync(config.gallery.templateFile, 'utf8');
    
    // Generate gallery objects
    let galleryArrays = '';
    
    Object.entries(galleryData).forEach(([galleryType, images], index) => {
        galleryArrays += `        '${galleryType}': [\n`;
        galleryArrays += images.map(img => `            '${img}'`).join(',\n');
        galleryArrays += '\n        ]';
        
        // Add comma unless this is the last entry
        if (index < Object.entries(galleryData).length - 1) {
            galleryArrays += ',\n';
        }
    });
    
    // Replace placeholder
    const outputContent = template.replace('        // GALLERY_IMAGES_PLACEHOLDER', galleryArrays);
    
    // Write output file
    fs.writeFileSync(config.gallery.outputFile, outputContent);
    console.log(`Updated gallery JavaScript with ${Object.keys(galleryData).length} galleries`);
}

// Main execution
try {
    console.log('Starting image array generation...');
    generateSlideshowJS();
    generateGalleryJS();
    console.log('Image array generation completed successfully!');
} catch (err) {
    console.error('Error generating image arrays:', err);
    process.exit(1);
}
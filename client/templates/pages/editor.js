import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Designs } from '../../../lib/collections';
import './editor.html';

// Add Stripe initialization at the top of the file
let stripe;
if (Meteor.settings.public?.stripe?.publicKey) {
  stripe = window.Stripe(Meteor.settings.public.stripe.publicKey);
}

// Add this constant at the top of the file, after the imports
const SYMBOL_CATEGORIES = [
  {
    name: 'Flags',
    images: [
      '/images/symbols/flags/algeria.png',
      '/images/symbols/flags/argentina.png',
      '/images/symbols/flags/australia.png',
      '/images/symbols/flags/austria.png',
      '/images/symbols/flags/bangladesh.png',
      '/images/symbols/flags/belgium.png',
      '/images/symbols/flags/brazil.png',
      '/images/symbols/flags/canada.png',
      '/images/symbols/flags/chile.png',
      '/images/symbols/flags/china.png',
      '/images/symbols/flags/colombia.png',
      '/images/symbols/flags/czechrepublic.png',
      '/images/symbols/flags/denmark.png',
      '/images/symbols/flags/egypt.png',
      '/images/symbols/flags/finland.png',
      '/images/symbols/flags/france.png',
      '/images/symbols/flags/gb-eng.png',
      '/images/symbols/flags/gb-nir.png',
      '/images/symbols/flags/gb-sct.png',
      '/images/symbols/flags/gb-wls.png',
      '/images/symbols/flags/germany.png',
      '/images/symbols/flags/greece.png',
      '/images/symbols/flags/hungary.png',
      '/images/symbols/flags/india.png',
      '/images/symbols/flags/indonesia.png',
      '/images/symbols/flags/ireland.png',
      '/images/symbols/flags/israel.png',
      '/images/symbols/flags/italy.png',
      '/images/symbols/flags/japan.png',
      '/images/symbols/flags/malaysia.png',
      '/images/symbols/flags/mexico.png',
      '/images/symbols/flags/morocco.png',
      '/images/symbols/flags/netherlands.png',
      '/images/symbols/flags/newzealand.png',
      '/images/symbols/flags/norway.png',
      '/images/symbols/flags/pakistan.png',
      '/images/symbols/flags/philippines.png',
      '/images/symbols/flags/poland.png',
      '/images/symbols/flags/portugal.png',
      '/images/symbols/flags/romania.png',
      '/images/symbols/flags/russia.png',
      '/images/symbols/flags/saudiarabia.png',
      '/images/symbols/flags/slovakia.png',
      '/images/symbols/flags/south_africa.png',
      '/images/symbols/flags/southafrica.png',
      '/images/symbols/flags/southkorea.png',
      '/images/symbols/flags/spain.png',
      '/images/symbols/flags/sweden.png',
      '/images/symbols/flags/switzerland.png',
      '/images/symbols/flags/thailand.png',
      '/images/symbols/flags/turkey.png',
      '/images/symbols/flags/unitedarabemirates.png',
      '/images/symbols/flags/unitedkingdom.png',
      '/images/symbols/flags/unitedstates.png',
      '/images/symbols/flags/vietnam.png'
    ]
  },
  {
    name: 'Symbols',
    images: [
      '/images/symbols/symbols/arrow.png',
      '/images/symbols/symbols/boat.png',
      '/images/symbols/symbols/book.png',
      '/images/symbols/symbols/caduceus.png',
      '/images/symbols/symbols/chessknight.png',
      '/images/symbols/symbols/chevron.png',
      '/images/symbols/symbols/cobra.png',
      '/images/symbols/symbols/cogs.png',
      '/images/symbols/symbols/compass.png',
      '/images/symbols/symbols/cross.png',
      '/images/symbols/symbols/davidstart.png',
      '/images/symbols/symbols/dove.png',
      '/images/symbols/symbols/gorgon.png',
      '/images/symbols/symbols/hammer.png',
      '/images/symbols/symbols/harp.png',
      '/images/symbols/symbols/key.png',
      '/images/symbols/symbols/knight3.png',
      '/images/symbols/symbols/moon.png',
      '/images/symbols/symbols/muslimmoon.png',
      '/images/symbols/symbols/oaktree.png',
      '/images/symbols/symbols/penfeather.png',
      '/images/symbols/symbols/rooster.png',
      '/images/symbols/symbols/rose.png',
      '/images/symbols/symbols/skull.png',
      '/images/symbols/symbols/sun.png',
      '/images/symbols/symbols/sword.png',
      '/images/symbols/symbols/trebuchet.png',
      '/images/symbols/symbols/trefle.png'
    ]
  }
];

// Add this helper function after the imports
const addGlossEffect = (ctx, x, y, width, height) => {
  ctx.save();
  
  // Add highlight at the top
  const highlightGradient = ctx.createLinearGradient(
    x, y, x, y + height * 0.6
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = highlightGradient;
  ctx.fillRect(x, y, width, height * 0.6);
  
  // Add bottom shadow
  const shadowGradient = ctx.createLinearGradient(
    x, y + height * 0.6, x, y + height
  );
  shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
  shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = shadowGradient;
  ctx.fillRect(x, y + height * 0.6, width, height * 0.4);
  
  // Add border
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, width, height);
  
  // Add inner glow
  ctx.globalCompositeOperation = 'overlay';
  const glowGradient = ctx.createRadialGradient(
    x + width/2, y + height/2, 0,
    x + width/2, y + height/2, width/2
  );
  glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(x, y, width, height);
  
  ctx.restore();
};

// Add this function after the imports
const addWatermark = (ctx, width, height) => {
  const user = Meteor.user();
  if (!user?.profile?.credits) {
    ctx.save();
    
    // Set watermark style with higher opacity
    ctx.globalAlpha = 0.3;  // Increased from 0.15
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';  // Dark color for better visibility
    ctx.font = 'bold 24px Arial';  // Made text bold and slightly larger
    
    // Create diagonal repeating pattern
    const text = 'Buy credits to remove watermark';
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const gap = 150;  // Increased gap between watermarks
    
    // Rotate canvas for diagonal text
    ctx.translate(width/2, height/2);
    ctx.rotate(-Math.PI / 4);
    ctx.translate(-width/2, -height/2);
    
    // Draw multiple lines of watermark
    for (let y = -height; y < height*2; y += gap) {
      for (let x = -width; x < width*2; x += textWidth + gap) {
        ctx.fillText(text, x, y);
      }
    }
    
    ctx.restore();
  }
};

Template.editor.onCreated(function() {
  this.selectedCategory = new ReactiveVar(null);
  this.selectedElement = new ReactiveVar(null);
  // Set initial design state with both frame files
  const initialDesign = {
    frame: '/images/frames/frame1.png',
    frameNoBg: '/images/frames/frame1-nbg.png',
    leftAnimal: null,
    rightAnimal: null,
    crown: null,
    banner: null,
    laurel: null
  };
  this.design = new ReactiveVar(initialDesign);
  this.selectedLayout = new ReactiveVar('1');
  this.backgroundImages = new ReactiveVar({
    area1: null,
    area2: null,
    area3: null,
    area4: null
  });
  this.activeImageArea = new ReactiveVar(null);
  this.bannerText = new ReactiveVar('');
  this.selectedSymbolCategory = new ReactiveVar('Flags'); // Default to Flags
  
  // Subscribe to user's design
  this.autorun(() => {
    this.subscribe('userDesign', () => {
      const savedDesign = Designs.findOne({ userId: Meteor.userId() });
      if (savedDesign?.design) {
        const design = savedDesign.design;
        if (design.frame && !design.frameNoBg) {
          design.frameNoBg = design.frame.replace('.png', '-nbg.png');
        }
        this.design.set(design);
        this.redrawCanvas();
      }
    });
  });
});

Template.editor.onRendered(function() {
  const instance = this;
  instance.canvas = instance.find('#coatCanvas');
  instance.ctx = instance.canvas.getContext('2d');
  
  instance.drawElement = function(src, position = null) {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate dimensions based on element type
      let width, height, x, y;
      
      if (src.includes('frame')) {
        // Frame takes up most of the canvas
        width = canvas.width * 0.8;
        height = canvas.height * 0.8;
        x = (canvas.width - width) / 2;
        y = (canvas.height - height) / 2;
      } else if (position === 'leftAnimal') {
        // Left animal positioning
        width = canvas.width * 0.3;
        height = canvas.height * 0.3;
        x = canvas.width * 0.15;
        y = canvas.height * 0.35;
      } else if (position === 'rightAnimal') {
        // Right animal positioning
        width = canvas.width * 0.3;
        height = canvas.height * 0.3;
        x = canvas.width * 0.55;
        y = canvas.height * 0.35;
      } else if (src.includes('crown')) {
        // Crown positioning
        width = canvas.width * 0.25;
        height = width * 0.8;
        x = (canvas.width - width) / 2;
        y = canvas.height * 0.1;
      } else if (src.includes('banner')) {
        // Banner positioning
        width = canvas.width * 0.7;
        height = canvas.height * 0.2;
        x = (canvas.width - width) / 2;
        y = canvas.height * 0.65;
      } else if (src.includes('laurel')) {
        // Laurel positioning - slightly smaller
        width = canvas.width * 0.85;  // Decreased from 0.95
        height = canvas.height * 0.85; // Decreased from 0.95
        x = (canvas.width - width) / 2;
        y = (canvas.height - height) / 2;
      }
      
      ctx.drawImage(img, x, y, width, height);
    };
    
    img.src = src;
  };
  
  instance.drawBackgroundImages = async () => {
    const ctx = instance.ctx;
    const layout = instance.selectedLayout.get();
    const images = instance.backgroundImages.get();
    
    // The "inner area" is the 55% zone in the middle where flags/symbols go
    const innerWidth = instance.canvas.width * 0.55;
    const innerHeight = instance.canvas.height * 0.55;
    const innerX = (instance.canvas.width - innerWidth) / 2;
    const innerY = (instance.canvas.height - innerHeight) / 2;

    // For each area, compute x,y,w,h depending on layout
    let areaCoordinates = [];

    if (layout === '1') {
      areaCoordinates = [
        { area: 'area1', x: innerX, y: innerY, w: innerWidth, h: innerHeight }
      ];
    } else if (layout === '2') {
      const halfW = innerWidth / 2;
      areaCoordinates = [
        { area: 'area1', x: innerX, y: innerY, w: halfW, h: innerHeight },
        { area: 'area2', x: innerX + halfW, y: innerY, w: halfW, h: innerHeight }
      ];
    } else if (layout === '4') {
      const halfW = innerWidth / 2;
      const halfH = innerHeight / 2;
      areaCoordinates = [
        { area: 'area1', x: innerX, y: innerY, w: halfW, h: halfH },
        { area: 'area2', x: innerX + halfW, y: innerY, w: halfW, h: halfH },
        { area: 'area3', x: innerX, y: innerY + halfH, w: halfW, h: halfH },
        { area: 'area4', x: innerX + halfW, y: innerY + halfH, w: halfW, h: halfH }
      ];
    }

    // For each area, draw the image if it exists
    for (const areaInfo of areaCoordinates) {
      const src = images[areaInfo.area];
      if (!src || src === 'none') continue;

      // If it's a symbol (in /symbols/symbols/) and not a flag, do half-size & corner anchoring
      const isSymbol = src.includes('/symbols/symbols/');
      
      if (isSymbol) {
        // Symbol logic
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => { resolve(); };
          img.onerror = () => { resolve(); };
          img.src = src;
        });

        if (img.naturalWidth && img.naturalHeight) {
          let targetW = areaInfo.w * 0.5;
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          let targetH = targetW * aspectRatio;
          let cornerX = 0;
          let cornerY = 0;
          
          if (layout === '1') {
            // Single mode: 50% size and centered
            targetW = areaInfo.w * 0.5;
            targetH = targetW * aspectRatio;
            cornerX = areaInfo.x + (areaInfo.w - targetW) / 2;
            cornerY = areaInfo.y + (areaInfo.h - targetH) / 2;
          } else if (layout === '2') {
            // Split mode: maintain aspect ratio and align to middle divider
            targetW = areaInfo.w * 0.5;  // Base width at 50%
            targetH = targetW * aspectRatio; // Keep aspect ratio
            cornerY = areaInfo.y + (areaInfo.h - targetH) / 2; // Center vertically
            
            if (areaInfo.area === 'area1') {
              cornerX = areaInfo.x + areaInfo.w - targetW; // Right align for left area
            } else {
              cornerX = areaInfo.x; // Left align for right area
            }
          } else if (layout === '4') {
            // Quad mode remains unchanged
            switch (areaInfo.area) {
              case 'area1':
                cornerX = areaInfo.x + areaInfo.w - targetW;
                cornerY = areaInfo.y + areaInfo.h - targetH;
                break;
              case 'area2':
                cornerX = areaInfo.x;
                cornerY = areaInfo.y + areaInfo.h - targetH;
                break;
              case 'area3':
                cornerX = areaInfo.x + areaInfo.w - targetW;
                cornerY = areaInfo.y;
                break;
              case 'area4':
                cornerX = areaInfo.x;
                cornerY = areaInfo.y;
                break;
            }
          }

          ctx.drawImage(img, cornerX, cornerY, targetW, targetH);
        }
      } else {
        // Flag logic
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => {
            let flagWidth, flagHeight, flagX, flagY;
            
            if (layout === '1') {
              // Single mode: Fixed height, width adjusts to maintain aspect ratio
              flagHeight = areaInfo.h * 0.9;  // Increased from 0.75
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              flagWidth = flagHeight * aspectRatio;
              flagX = areaInfo.x + (areaInfo.w - flagWidth) / 2;
              flagY = areaInfo.y + (areaInfo.h - flagHeight) / 2;
            } else if (layout === '2') {
              // Split mode: Show cropped middle section of flag
              flagHeight = areaInfo.h * 0.95;  // Increased from 0.8
              flagWidth = areaInfo.w;
              flagY = areaInfo.y + (areaInfo.h - flagHeight) / 2;
              
              // Position exactly at the center line with no gap
              if (areaInfo.area === 'area1') {
                flagX = areaInfo.x + areaInfo.w - flagWidth;
              } else {
                flagX = areaInfo.x;
              }
              
              let skipRegularDraw = false;
              if (!src.includes('/symbols/symbols/')) {  // Only for flags, not symbols
                // Calculate source coordinates to crop middle section
                const sourceHeight = img.naturalHeight;
                const sourceWidth = sourceHeight * (flagWidth / flagHeight); // Keep aspect ratio
                const sourceX = (img.naturalWidth - sourceWidth) / 2; // Center the crop
                const sourceY = 0;
                
                // Draw cropped section
                ctx.drawImage(
                  img,
                  sourceX, sourceY, sourceWidth, sourceHeight, // Source (crop) coordinates
                  flagX, flagY, flagWidth, flagHeight // Destination coordinates
                );
                
                // Add gloss effects
                addGlossEffect(ctx, flagX, flagY, flagWidth, flagHeight);
                
                skipRegularDraw = true;
              }
              
              if (skipRegularDraw) {
                resolve();
                return;
              }
            } else if (layout === '4') {
              // Quad mode
              flagWidth = areaInfo.w * 0.95;  // Increased from 0.75
              flagHeight = areaInfo.h * 0.95;  // Increased from 0.75
              switch (areaInfo.area) {
                case 'area1':
                  flagX = areaInfo.x + areaInfo.w - flagWidth;
                  flagY = areaInfo.y + areaInfo.h - flagHeight;
                  break;
                case 'area2':
                  flagX = areaInfo.x;
                  flagY = areaInfo.y + areaInfo.h - flagHeight;
                  break;
                case 'area3':
                  flagX = areaInfo.x + areaInfo.w - flagWidth;
                  flagY = areaInfo.y;
                  break;
                case 'area4':
                  flagX = areaInfo.x;
                  flagY = areaInfo.y;
                  break;
              }
            }
            
            if (!src.includes('/symbols/symbols/')) {  // Only for flags, not symbols
              // Draw the base flag
              ctx.drawImage(img, flagX, flagY, flagWidth, flagHeight);
              
              // Add glossy effect
              ctx.save();
              
              // Add stronger white highlight at the top
              const highlightGradient = ctx.createLinearGradient(
                flagX,
                flagY,
                flagX,
                flagY + flagHeight * 0.6  // Extended highlight area
              );
              highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');  // Increased opacity
              highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');  // Added middle stop
              highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
              
              ctx.globalCompositeOperation = 'overlay';
              ctx.fillStyle = highlightGradient;
              ctx.fillRect(flagX, flagY, flagWidth, flagHeight * 0.6);
              
              // Add stronger bottom shadow
              const shadowGradient = ctx.createLinearGradient(
                flagX,
                flagY + flagHeight * 0.6,
                flagX,
                flagY + flagHeight
              );
              shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
              shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');  // Added middle stop
              shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');    // Increased opacity
              
              ctx.globalCompositeOperation = 'multiply';
              ctx.fillStyle = shadowGradient;
              ctx.fillRect(flagX, flagY + flagHeight * 0.6, flagWidth, flagHeight * 0.4);
              
              // Add stronger border and inner shadow
              ctx.globalCompositeOperation = 'source-over';
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';  // Darker border
              ctx.lineWidth = 1.5;  // Slightly thicker
              ctx.strokeRect(flagX, flagY, flagWidth, flagHeight);
              
              // Add subtle inner glow
              ctx.globalCompositeOperation = 'overlay';
              const glowGradient = ctx.createRadialGradient(
                flagX + flagWidth/2, flagY + flagHeight/2, 0,
                flagX + flagWidth/2, flagY + flagHeight/2, flagWidth/2
              );
              glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
              glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx.fillStyle = glowGradient;
              ctx.fillRect(flagX, flagY, flagWidth, flagHeight);
              
              ctx.restore();
            } else {
              // Original symbol drawing logic
              ctx.drawImage(img, flagX, flagY, flagWidth, flagHeight);
            }
            resolve();
          };
          img.onerror = () => { resolve(); };
          img.src = src;
        });
      }
    }
  };

  const drawImageInArea = (ctx, src, x, y, width, height) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, x, y, width, height);
        resolve();
      };
      img.src = src;
    });
  };

  instance.drawBannerText = async () => {
    const ctx = instance.canvas.getContext('2d');
    const design = instance.design.get();
    const text = instance.bannerText.get()?.toUpperCase();

    if (design.banner && design.banner !== 'none' && text) {
      await new Promise((resolve) => {
        const bannerImg = new Image();
        bannerImg.onload = () => {
          const width = instance.canvas.width * 0.7;
          const height = instance.canvas.height * 0.2;
          const x = (instance.canvas.width - width) / 2;
          const y = instance.canvas.height * 0.65;

          // Draw banner first
          ctx.drawImage(bannerImg, x, y, width, height);

          // Setup text style with gold gradient
          ctx.font = 'bold 35px MedievalSharp';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Create gold gradient for text
          const gradient = ctx.createLinearGradient(
            instance.canvas.width / 2 - 100,
            0,
            instance.canvas.width / 2 + 100,
            0
          );
          gradient.addColorStop(0, '#b8860b');    // Darker gold
          gradient.addColorStop(0.5, '#ffd700');  // Bright gold
          gradient.addColorStop(1, '#b8860b');    // Darker gold
          
          // Apply gradient fill and add text shadow
          ctx.fillStyle = gradient;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          // Draw text slightly lower in the banner
          const textX = instance.canvas.width / 2;
          const textY = y + (height * 0.7); // Move text down to 60% of banner height
          ctx.fillText(text, textX, textY);

          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          resolve();
        };
        bannerImg.src = design.banner;
      });
    }
  };

  // Add this function inside Template.editor.onRendered before redrawCanvas
    const loadAndDrawElement = (src, position) => {
      return new Promise((resolve) => {
        if (!src || src === 'none') {
          resolve();
          return;
        }
      
      console.log(`Loading element: ${src} for position: ${position}`);
        
        const img = new Image();
        img.onload = () => {
          let width, height, x, y;
        const ctx = instance.canvas.getContext('2d');
        const layout = instance.selectedLayout.get(); // Get current layout
        
        if (position === 'symbol') {
          // Adjust symbol size based on layout and category
          const baseWidth = instance.canvas.width * 0.08;
          const isSymbolCategory = src.includes('/symbols/symbols/'); // Check if it's from symbols category
          const scaleFactor = isSymbolCategory ? 0.1 : 1; // 10% size for symbols, full size for flags
          
          width = layout === '1' ? 
            (baseWidth / 2) * scaleFactor : // Single mode
            baseWidth * scaleFactor;        // Split/Quad mode
            
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          height = width * aspectRatio;
          
          // Calculate center of the active grid area (55% of canvas is the inner area)
          const innerWidth = instance.canvas.width * 0.55;
          const innerHeight = instance.canvas.height * 0.55;
          const innerX = (instance.canvas.width - innerWidth) / 2;
          const innerY = (instance.canvas.height - innerHeight) / 2;
          
          // Center in the active grid area
          x = innerX + (innerWidth - width) / 2;
          y = innerY + (innerHeight - height) / 2;
          
          ctx.drawImage(img, x, y, width, height);
        } else if (position === 'frame') {
          width = instance.canvas.width * 0.85;
          height = instance.canvas.height * 0.85;
          x = (instance.canvas.width - width) / 2;
          y = (instance.canvas.height - height) / 2;
          ctx.drawImage(img, x, y, width, height);
        } else if (position === 'leftAnimal') {
          // Left animal positioning - 20% bigger
          width = instance.canvas.width * 0.36;  // Changed from 0.3 to 0.36
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          height = width * aspectRatio;
          x = instance.canvas.width * 0.1;
          y = instance.canvas.height * 0.35;
          ctx.drawImage(img, x, y, width, height);
        } else if (position === 'rightAnimal') {
          // Right animal positioning - 20% bigger
          width = instance.canvas.width * 0.36;  // Changed from 0.3 to 0.36
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          height = width * aspectRatio;
          x = instance.canvas.width * 0.6;
          y = instance.canvas.height * 0.35;
          
          ctx.save();
          ctx.translate(x + width, y);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, width, height);
          ctx.restore();
        } else if (position === 'crown') {
          width = instance.canvas.width * 0.25;
          const aspectRatio = img.naturalHeight / img.naturalWidth;
          height = width * aspectRatio;
          x = (instance.canvas.width - width) / 2;
          y = instance.canvas.height * 0.1;
          ctx.drawImage(img, x, y, width, height);
        } else if (position === 'banner') {
          width = instance.canvas.width * 0.7;
          height = instance.canvas.height * 0.2;
          x = (instance.canvas.width - width) / 2;
          y = instance.canvas.height * 0.65;
          ctx.drawImage(img, x, y, width, height);
        } else if (position === 'laurel') {
          width = instance.canvas.width * 0.85;
          height = instance.canvas.height * 0.85;
          x = (instance.canvas.width - width) / 2;
          y = (instance.canvas.height - height) / 2;
          
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.drawImage(img, x, y, width, height);
          ctx.restore();
        }
          resolve();
        };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        resolve();
      };
        img.src = src;
      });
    };
    
  // Then modify redrawCanvas to use this function
  instance.redrawCanvas = async (skipWatermark = false) => {
    const ctx = instance.canvas.getContext('2d');
    const design = instance.design.get();
    const layout = instance.selectedLayout.get();
    
    console.log('Current design state:', design); // Debug log
    
    // Clear canvas first
    ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);
    
    // Draw beige background for the inner area where symbols go
    const innerWidth = instance.canvas.width * 0.55;
    const innerHeight = instance.canvas.height * 0.55;
    const innerX = (instance.canvas.width - innerWidth) / 2;
    const innerY = (instance.canvas.height - innerHeight) / 2;
    
    ctx.save();
    
    // Base beige color
    ctx.fillStyle = '#e8d5b5';
    ctx.fillRect(innerX, innerY, innerWidth, innerHeight);
    
    // Add glossy highlight at the top
    const highlightGradient = ctx.createLinearGradient(
      innerX,
      innerY,
      innerX,
      innerY + innerHeight * 0.6
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(innerX, innerY, innerWidth, innerHeight * 0.6);
    
    // Add shadow at the bottom
    const shadowGradient = ctx.createLinearGradient(
      innerX,
      innerY + innerHeight * 0.6,
      innerX,
      innerY + innerHeight
    );
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = shadowGradient;
    ctx.fillRect(innerX, innerY + innerHeight * 0.6, innerWidth, innerHeight * 0.4);
    
    // Add subtle border
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(innerX, innerY, innerWidth, innerHeight);
    
    ctx.restore();
    
    // Draw background flags/symbols
    await instance.drawBackgroundImages();
    
    // Draw golden divider lines for split and quad modes
    if (layout !== '1') {
      const innerWidth = instance.canvas.width * 0.55;
      const innerHeight = instance.canvas.height * 0.55;
      const innerX = (instance.canvas.width - innerWidth) / 2;
      const innerY = (instance.canvas.height - innerHeight) / 2;
      
      ctx.save();
      ctx.strokeStyle = '#D4AF37'; // Golden color
      ctx.lineWidth = 2;
      
      // Vertical line for split mode
      if (layout === '2') {
        ctx.beginPath();
        ctx.moveTo(innerX + innerWidth/2, innerY);
        ctx.lineTo(innerX + innerWidth/2, innerY + innerHeight);
        ctx.stroke();
      }
      
      // Both lines for quad mode
      if (layout === '4') {
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(innerX + innerWidth/2, innerY);
        ctx.lineTo(innerX + innerWidth/2, innerY + innerHeight);
        ctx.stroke();
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(innerX, innerY + innerHeight/2);
        ctx.lineTo(innerX + innerWidth, innerY + innerHeight/2);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    // Draw elements sequentially
    await instance.drawBackgroundImages();
    await loadAndDrawElement(design.frame, 'frame');
    await loadAndDrawElement(design.laurel, 'laurel');
    
    if (design.frame && !design.frameNoBg) {
      design.frameNoBg = design.frame.replace('.png', '-nbg.png');
      instance.design.set(design);
    }
    await loadAndDrawElement(design.frameNoBg, 'frame');
    await loadAndDrawElement(design.crown, 'crown');
    await loadAndDrawElement(design.leftAnimal, 'leftAnimal');
    await loadAndDrawElement(design.rightAnimal, 'rightAnimal');
    await loadAndDrawElement(design.banner, 'banner');
    await instance.drawBannerText();
    
    // Only draw watermark if not skipping
    if (!skipWatermark) {
      // Draw watermark last, with proper settings
      ctx.save();
      ctx.resetTransform();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      
      const watermarkCtx = ctx;
      watermarkCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      watermarkCtx.font = 'bold 28px Arial';
      
      const text = 'Watermark will be removed on export';
      const metrics = watermarkCtx.measureText(text);
      const textWidth = metrics.width;
      const gap = 120;
      
      watermarkCtx.translate(instance.canvas.width/2, instance.canvas.height/2);
      watermarkCtx.rotate(-Math.PI / 4);
      watermarkCtx.translate(-instance.canvas.width/2, -instance.canvas.height/2);
      
      for (let y = -instance.canvas.height; y < instance.canvas.height*2; y += gap) {
        for (let x = -instance.canvas.width; x < instance.canvas.width*2; x += textWidth + gap) {
          watermarkCtx.fillText(text, x, y);
        }
      }
      
      ctx.restore();
    }
  };
  
  instance.redrawCanvas();
});

Template.editor.helpers({
  isActiveCategory(category) {
    return Template.instance().selectedCategory.get() === category;
  },
  
  isCharCategory() {
    return Template.instance().selectedCategory.get() === 'char';
  },
  
  isActiveType(type) {
    return Template.instance().selectedElement.get() === type;
  },
  
  selectedElement() {
    return Template.instance().selectedElement.get();
  },
  
  elementOptions() {
    const type = Template.instance().selectedElement.get();
    if (!type) return [];
    
    // Common animal options for both left and right
    const charOptions = [
      'none',
      // Bears
      '/images/bears/bear1.png',
      '/images/bears/bear3.png',
      '/images/bears/bear4.png',
      '/images/bears/bear5.png',
      // Boars
      '/images/boars/boar1.png',
      // Bulls & Bison
      '/images/bulls/bull1.png',
      '/images/bulls/bull2.png',
      '/images/bulls/bison.png',
      // Deers
      '/images/dears/dear1.png',
      '/images/dears/dear2.png',
      // Dolphins
      '/images/dolphins/dolphin.png',
      // Dragons
      '/images/dragons/dragon1.png',
      // Eagles
      '/images/eagles/eagle1.png',
      '/images/eagles/eagle2.png',
      // Griffins
      '/images/griffins/griffin1.png',
      '/images/griffins/griffin2.png',
      // Horses
      '/images/horses/horse1.png',
      '/images/horses/horse2.png',
      // Lions
      '/images/lions/lion1.png',
      '/images/lions/lion2.png',
      '/images/lions/lion3.png',
      '/images/lions/lion4.png',
      // People
      
      '/images/people/knight1.png',
      '/images/people/knight2.png',
      '/images/people/knight3.png',
      '/images/people/knight4.png',
      '/images/people/mermaid.png',
      '/images/people/roman.png',
      '/images/people/viking.png',
     
      // Unicorns
      '/images/unicorns/unicorn1.png',
      '/images/unicorns/unicorn2.png',
      // Wolves
      '/images/wolves/wolf1.png',
      '/images/wolves/wolf2.png'
    ];
    
    // Update flag paths
    const flagImages = [
      'none',
      '/images/symbols/flags/algeria.png',
      '/images/symbols/flags/argentina.png',
      '/images/symbols/flags/australia.png',
      '/images/symbols/flags/austria.png',
      '/images/symbols/flags/bangladesh.png',
      '/images/symbols/flags/belgium.png',
      '/images/symbols/flags/brazil.png',
      '/images/symbols/flags/canada.png',
      '/images/symbols/flags/chile.png',
      '/images/symbols/flags/china.png',
      '/images/symbols/flags/colombia.png',
      '/images/symbols/flags/czechrepublic.png',
      '/images/symbols/flags/denmark.png',
      '/images/symbols/flags/egypt.png',
      '/images/symbols/flags/finland.png',
      '/images/symbols/flags/france.png',
      '/images/symbols/flags/gb-eng.png',
      '/images/symbols/flags/gb-nir.png',
      '/images/symbols/flags/gb-sct.png',
      '/images/symbols/flags/gb-wls.png',
      '/images/symbols/flags/germany.png',
      '/images/symbols/flags/greece.png',
      '/images/symbols/flags/hungary.png',
      '/images/symbols/flags/india.png',
      '/images/symbols/flags/indonesia.png',
      '/images/symbols/flags/ireland.png',
      '/images/symbols/flags/israel.png',
      '/images/symbols/flags/italy.png',
      '/images/symbols/flags/japan.png',
      '/images/symbols/flags/malaysia.png',
      '/images/symbols/flags/mexico.png',
      '/images/symbols/flags/morocco.png',
      '/images/symbols/flags/netherlands.png',
      '/images/symbols/flags/newzealand.png',
      '/images/symbols/flags/norway.png',
      '/images/symbols/flags/pakistan.png',
      '/images/symbols/flags/philippines.png',
      '/images/symbols/flags/poland.png',
      '/images/symbols/flags/portugal.png',
      '/images/symbols/flags/romania.png',
      '/images/symbols/flags/russia.png',
      '/images/symbols/flags/saudiarabia.png',
      '/images/symbols/flags/slovakia.png',
      '/images/symbols/flags/south_africa.png',
      '/images/symbols/flags/southafrica.png',
      '/images/symbols/flags/southkorea.png',
      '/images/symbols/flags/spain.png',
      '/images/symbols/flags/sweden.png',
      '/images/symbols/flags/switzerland.png',
      '/images/symbols/flags/thailand.png',
      '/images/symbols/flags/turkey.png',
      '/images/symbols/flags/unitedarabemirates.png',
      '/images/symbols/flags/unitedkingdom.png',
      '/images/symbols/flags/unitedstates.png',
      '/images/symbols/flags/vietnam.png'
    ];

    // Add symbols options
    const symbolOptions = [
      'none',
      '/images/symbols/symbols/arrow.png',
      '/images/symbols/symbols/boat.png',
      '/images/symbols/symbols/book.png',
      '/images/symbols/symbols/caduceus.png',
      '/images/symbols/symbols/chessknight.png',
      '/images/symbols/symbols/chevron.png',
      '/images/symbols/symbols/cobra.png',
      '/images/symbols/symbols/cogq.png',
      '/images/symbols/symbols/compass.png',
      '/images/symbols/symbols/cross.png',
      '/images/symbols/symbols/davidstart.png',
      '/images/symbols/symbols/dove.png',
      '/images/symbols/symbols/gorgon.png',
      '/images/symbols/symbols/hammer.png',
      '/images/symbols/symbols/harp.png',
      '/images/symbols/symbols/key.png',
      '/images/symbols/symbols/knight3.png',
      '/images/symbols/symbols/moon.png',
      '/images/symbols/symbols/muslimmoon.png',
      '/images/symbols/symbols/oaktree.png',
      '/images/symbols/symbols/penfeather.png',
      '/images/symbols/symbols/rooster.png',
      '/images/symbols/symbols/rose.png',
      '/images/symbols/symbols/skull.png',
      '/images/symbols/symbols/sun.png',
      '/images/symbols/symbols/sword.png',
      '/images/symbols/symbols/trebuchet.png',
      '/images/symbols/symbols/trefle.png'
    ];
    
    // Return array of image URLs based on type
    const options = {
      frame: [
        'none', 
        '/images/frames/frame1.png',
        '/images/frames/frame2.png',
        '/images/frames/frame3.png'
      
      ],
      leftAnimal: charOptions,
      rightAnimal: charOptions,
      crown: [
        'none',
        '/images/crowns/crown1.png',
        '/images/crowns/crown2.png',
        '/images/crowns/crown3.png',
        '/images/crowns/feather1.png',
        '/images/crowns/feather2.png',
        '/images/crowns/helmet1.png',
        '/images/crowns/helmet2.png',
        '/images/crowns/shield.png',
        '/images/crowns/star1.png',
        '/images/crowns/star2.png',
        '/images/crowns/viking.png'
      ],
      banner: [
        'none', 
        '/images/banners/redbanner.png',
        '/images/banners/blackbanner.png',
        '/images/banners/bluebanner.png',
        '/images/banners/brownbanner.png',
        '/images/banners/greenbanner.png'
      ],
      laurel: [
        'none', 
        '/images/laurels/laurels.png', 
        '/images/laurels/laurels2.png',
        '/images/laurels/goldlaurels.png',
        '/images/laurels/reallaurels.png',
        '/images/laurels/silverlaurels.png'
      ],
      flags: flagImages,
      symbols: symbolOptions
    };
    
    return options[type] || [];
  },
  
  getElementName(url) {
    if (url === 'none') return 'None';
    const match = url.match(/\/([^\/]+)\/([^\/]+)\.png$/);
    if (match) {
      const folder = match[1];
      const filename = match[2];
      
      // Special handling for crowns
      if (folder === 'crowns') {
        switch (filename) {
          case 'crown1': return 'Crown 1';
          case 'crown2': return 'Crown 2';
          case 'crown3': return 'Crown 3';
          case 'feather1': return 'Feather 1';
          case 'feather2': return 'Feather 2';
          case 'helmet1': return 'Helmet 1';
          case 'helmet2': return 'Helmet 2';
          case 'shield': return 'Shield';
          case 'star1': return 'Star 1';
          case 'star2': return 'Star 2';
          case 'viking': return 'Viking';
        }
      }
      
      // Default behavior for other elements
      return filename.charAt(0).toUpperCase() + filename.slice(1);
    }
    return '';
  },
  
  isNoneOption(url) {
    return url === 'none';
  },
  
  isRightAnimal() {
    return Template.instance().selectedElement.get() === 'rightAnimal';
  },
  
  credits() {
    const user = Meteor.user();
    return user?.profile?.credits || 0;
  },
  
  isActiveLayout(layout) {
    return Template.instance().selectedLayout.get() === layout;
  },
  
  availableImages() {
    return [
      '/images/flags/flag1.png',
      '/images/flags/flag2.png',
      // Add more image options
    ];
  },
  
  selectedLayout() {
    return Template.instance().selectedLayout.get();
  },
  
  isLayout(layout) {
    return Template.instance().selectedLayout.get() === layout;
  },
  
  flagImages() {
    return [
      '/images/symbols/flags/algeria.png',
      '/images/symbols/flags/argentina.png',
      '/images/symbols/flags/australia.png',
      '/images/symbols/flags/austria.png',
      '/images/symbols/flags/bangladesh.png',
      '/images/symbols/flags/belgium.png',
      '/images/symbols/flags/brazil.png',
      '/images/symbols/flags/canada.png',
      '/images/symbols/flags/chile.png',
      '/images/symbols/flags/china.png',
      '/images/symbols/flags/colombia.png',
      '/images/symbols/flags/czechrepublic.png',
      '/images/symbols/flags/denmark.png',
      '/images/symbols/flags/egypt.png',
      '/images/symbols/flags/finland.png',
      '/images/symbols/flags/france.png',
      '/images/symbols/flags/gb-eng.png',
      '/images/symbols/flags/gb-nir.png',
      '/images/symbols/flags/gb-sct.png',
      '/images/symbols/flags/gb-wls.png',
      '/images/symbols/flags/germany.png',
      '/images/symbols/flags/greece.png',
      '/images/symbols/flags/hungary.png',
      '/images/symbols/flags/india.png',
      '/images/symbols/flags/indonesia.png',
      '/images/symbols/flags/ireland.png',
      '/images/symbols/flags/israel.png',
      '/images/symbols/flags/italy.png',
      '/images/symbols/flags/japan.png',
      '/images/symbols/flags/malaysia.png',
      '/images/symbols/flags/mexico.png',
      '/images/symbols/flags/morocco.png',
      '/images/symbols/flags/netherlands.png',
      '/images/symbols/flags/newzealand.png',
      '/images/symbols/flags/norway.png',
      '/images/symbols/flags/pakistan.png',
      '/images/symbols/flags/philippines.png',
      '/images/symbols/flags/poland.png',
      '/images/symbols/flags/portugal.png',
      '/images/symbols/flags/romania.png',
      '/images/symbols/flags/russia.png',
      '/images/symbols/flags/saudiarabia.png',
      '/images/symbols/flags/slovakia.png',
      '/images/symbols/flags/south_africa.png',
      '/images/symbols/flags/southafrica.png',
      '/images/symbols/flags/southkorea.png',
      '/images/symbols/flags/spain.png',
      '/images/symbols/flags/sweden.png',
      '/images/symbols/flags/switzerland.png',
      '/images/symbols/flags/thailand.png',
      '/images/symbols/flags/turkey.png',
      '/images/symbols/flags/unitedarabemirates.png',
      '/images/symbols/flags/unitedkingdom.png',
      '/images/symbols/flags/unitedstates.png',
      '/images/symbols/flags/vietnam.png'
    ];
  },
  
  getFlagName(url) {
    const match = url.match(/flags\/([^\/]+)\.png$/);
    if (match) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
    return '';
  },
  
  isFrameCategory() {
    return Template.instance().selectedCategory.get() === 'frame';
  },
  
  isBannerCategory() {
    return Template.instance().selectedCategory.get() === 'banner';
  },
  
  bannerText() {
    return Template.instance().bannerText.get();
  },
  
  symbolCategories() {
    return SYMBOL_CATEGORIES;
  },
  
  symbolCategoryNames() {
    return SYMBOL_CATEGORIES.map(cat => cat.name);
  },
  
  currentCategoryImages() {
    const currentCategory = Template.instance().selectedSymbolCategory.get();
    const category = SYMBOL_CATEGORIES.find(cat => cat.name === currentCategory);
    return category ? category.images : [];
  },
  
  getSymbolName(url) {
    const match = url.match(/\/([^\/]+)\/([^\/]+)\.png$/);
    if (match) {
      return match[2].charAt(0).toUpperCase() + match[2].slice(1);
    }
    return '';
  },
  
  selectedSymbolCategory() {
    return Template.instance().selectedSymbolCategory.get();
  },
  
  isSelectedCategory(name) {
    return Template.instance().selectedSymbolCategory.get() === name;
  },
  
  isAnimalCategory() {
    return Template.instance().selectedCategory.get() === 'char';
  }
});

Template.editor.events({
  'click .element-category'(event, instance) {
    const category = event.currentTarget.dataset.category;
    instance.selectedCategory.set(category);
    
    // Set default element type based on category
    switch(category) {
      case 'frame':
        instance.selectedElement.set('frame');
        break;
      case 'char':
        instance.selectedElement.set('leftAnimal');
        break;
      case 'crown':
        instance.selectedElement.set('crown');
        break;
      case 'banner':
        instance.selectedElement.set('banner');
        break;
      case 'laurel':
        instance.selectedElement.set('laurel');
        break;
    }
  },
  
  'click .element-btn'(event, instance) {
    const type = event.currentTarget.dataset.type;
    instance.selectedElement.set(type);
  },
  
  'click .element-option, click .none-icon'(event, instance) {
    const type = instance.selectedElement.get();
    const url = event.currentTarget.dataset.url;
    const design = instance.design.get();
    
    if (type === 'frame') {
      if (url === 'none') {
        design.frame = null;
        design.frameNoBg = null;
      } else {
        design.frame = url;
        design.frameNoBg = url.replace('.png', '-nbg.png');
      }
    } else {
      design[type] = url === 'none' ? null : url;
    }
    
    if (design.frame && !design.frameNoBg) {
      design.frameNoBg = design.frame.replace('.png', '-nbg.png');
    }
    
    instance.design.set(design);
    instance.redrawCanvas();
  },
  
  'click #resetBtn'(event, instance) {
    // Show confirmation modal instead of resetting directly
    const modal = new bootstrap.Modal(document.getElementById('resetModal'));
    modal.show();
  },
  
  'click #confirmReset'(event, instance) {
    const emptyDesign = {
      frame: '/images/frames/frame1.png',
      frameNoBg: '/images/frames/frame1-nbg.png',
      leftAnimal: null,
      rightAnimal: null,
      crown: null,
      banner: null,
      laurel: null
    };
    
    // Reset design
    instance.design.set(emptyDesign);
    
    // Reset background images
    instance.backgroundImages.set({
      area1: null,
      area2: null,
      area3: null,
      area4: null
    });
    
    // Reset layout to single
    instance.selectedLayout.set('1');
    
    // Reset banner text
    instance.bannerText.set('');
    
    // Redraw canvas
    instance.redrawCanvas();
    
    // Hide the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('resetModal'));
    modal.hide();
  },
  
  'click #saveBtn'(event, instance) {
    const design = instance.design.get();
    
    // Ensure all values are either strings or null
    const cleanDesign = {
      frame: design.frame || null,
      frameNoBg: design.frameNoBg || null,
      leftAnimal: design.leftAnimal || null,
      rightAnimal: design.rightAnimal || null,
      crown: design.crown || null,
      banner: design.banner || null,
      laurel: design.laurel || null
    };
    
    Meteor.call('saveDesign', cleanDesign, (error) => {
      if (error) {
        console.error('Save error:', error);
        alert('Error saving design: ' + error.reason);
      } else {
        // Show modal instead of alert
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
      }
    });
  },
  
  'click #exportBtn'(event, instance) {
    const user = Meteor.user();
    if (!user?.profile?.credits) {
      const modal = new bootstrap.Modal(document.getElementById('creditsModal'));
      modal.show();
      return;
    }
    
    // Store current canvas
    const tempCanvas = instance.canvas.cloneNode();
    tempCanvas.getContext('2d').drawImage(instance.canvas, 0, 0);
    
    // Create clean export
    (async () => {
      // Clear canvas
      const ctx = instance.canvas.getContext('2d');
      ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);
      
      // Wait for redraw without watermark
      await instance.redrawCanvas(true);
      
      // Get clean image data
      const dataUrl = instance.canvas.toDataURL('image/png');
      
      // Restore original canvas with watermark
      ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'coat-of-arms.png';
      link.href = dataUrl;
      link.click();
      
      Meteor.call('useCredit', (error) => {
        if (error) {
          alert('Error using credit: ' + error.reason);
        }
      });
    })();
  },
  
  'click #purchaseCredits'(event, instance) {
    if (!stripe) {
      alert('Stripe is not properly configured');
      return;
    }

    // Hide the credits modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('creditsModal'));
    modal.hide();
    
    // Use the same Stripe checkout as payment page
    Meteor.call('createStripeCheckout', (error, sessionId) => {
      if (error) {
        alert('Error creating checkout session: ' + error.reason);
        return;
      }
      
      stripe.redirectToCheckout({
        sessionId: sessionId
      }).then((result) => {
        if (result.error) {
          alert(result.error.message);
        }
      });
    });
  },
  
  'click .layout-btn'(event, instance) {
    const layout = event.currentTarget.dataset.layout;
    instance.selectedLayout.set(layout);
    
    // Clear background images and has-image classes
    instance.backgroundImages.set({
      area1: null,
      area2: null,
      area3: null,
      area4: null
    });
    
    // Remove has-image class from all grid areas
    document.querySelectorAll('.grid-area').forEach(area => {
      area.classList.remove('has-image');
    });
    
    instance.redrawCanvas();
  },
  
  'click .image-area'(event, instance) {
    const area = event.currentTarget.dataset.area;
    instance.activeImageArea.set(area);
    const modal = new bootstrap.Modal(document.getElementById('imagePickerModal'));
    modal.show();
  },
  
  'click .image-option'(event, instance) {
    const url = event.currentTarget.dataset.url;
    const area = instance.activeImageArea.get();
    const images = instance.backgroundImages.get();
    images[area] = url;
    instance.backgroundImages.set(images);
    
    // Add has-image class to the clicked grid area
    const gridArea = document.querySelector(`.grid-area[data-area="${area}"]`);
    if (gridArea) {
      gridArea.classList.add('has-image');
    }
    
    instance.redrawCanvas();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('imagePickerModal'));
    modal.hide();
  },
  
  'click .grid-area'(event, instance) {
    const area = event.currentTarget.dataset.area;
    instance.activeImageArea.set(area);
    const modal = new bootstrap.Modal(document.getElementById('imagePickerModal'));
    modal.show();
  },
  
  'input #bannerText'(event, instance) {
    const input = event.target;
    if (input.value.length > 12) {
      input.value = input.value.slice(0, 12).toUpperCase();
    } else {
      input.value = input.value.toUpperCase();
    }
    instance.bannerText.set(input.value);
    instance.redrawCanvas();
  },
  
  'click .category-selector button'(event, instance) {
    const category = event.currentTarget.dataset.category;
    instance.selectedSymbolCategory.set(category);
  }
});

Template.registerHelper('eq', function(a, b) {
  return a === b;
});
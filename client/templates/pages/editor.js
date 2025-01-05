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
    
    // Set watermark style with more transparency
    ctx.globalAlpha = 0.15;  /* Reduced from 0.3 */
    ctx.fillStyle = 'rgba(44, 24, 16, 0.5)';  /* Using wood color with transparency */
    ctx.font = 'bold 24px Arial';
    
    // Create diagonal repeating pattern
    const text = 'Buy credits to remove watermark';
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const gap = 150;
    
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

// Add this constant at the top of the file
const CHAR_OPTIONS = {
  bears: [
    '/images/bears/bear1.png',
    '/images/bears/bear2.png',
    '/images/bears/bear3.png',
    '/images/bears/bear4.png'
  ],
  boars: [
    '/images/boars/boar1.png',
  ],
  bulls: [
    '/images/bulls/bull1.png',
    '/images/bulls/bull2.png',
    '/images/bulls/bison.png'
  ],
  deers: [
    '/images/deers/deer1.png',
    '/images/deers/deer2.png'
  ],
  dolphins: [
    '/images/dolphins/dolphin.png'
  ],
  dragons: [
    '/images/dragons/dragon1.png'
  ],
  eagles: [
    '/images/eagles/eagle1.png',
    '/images/eagles/eagle2.png',
  ],
  griffins: [
    '/images/griffins/griffin1.png',
    '/images/griffins/griffin2.png'
  ],
  horses: [
    '/images/horses/horse1.png'
  ],
  lions: [
    '/images/lions/lion1.png',
    '/images/lions/lion2.png',
    '/images/lions/lion3.png',
    '/images/lions/lion4.png'
  ],
  people: [
    '/images/people/knight1.png',
    '/images/people/knight2.png',
    '/images/people/knight3.png',
    '/images/people/knight4.png',
    '/images/people/mermaid.png',
    '/images/people/roman.png',
    '/images/people/viking.png'
  ],
  unicorns: [
    '/images/unicorns/unicorn1.png',
    '/images/unicorns/unicorn2.png'
  ],
  wolves: [
    '/images/wolves/wolf1.png',
    '/images/wolves/wolf2.png'
  ]
};

// Add this function at the top level, after the imports and before Template.editor
const getElementName = (url) => {
  if (!url) return 'None';
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
};

Template.editor.onCreated(function() {
  if (!Meteor.userId()) {
    Router.go('/');
    return;
  }

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
    laurel: null,
    layout: '1',
    bannerText: '',
    backgroundImages: {
      area1: null,
      area2: null,
      area3: null,
      area4: null
    }
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
  this.currentElementType = new ReactiveVar(null);
  this.currentAnimalCategory = new ReactiveVar(null);
  
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
        if (design.layout) {
          this.selectedLayout.set(design.layout);
        }
        if (design.backgroundImages) {
          this.backgroundImages.set(design.backgroundImages);
        }
        if (design.bannerText) {  // Load saved banner text
          this.bannerText.set(design.bannerText);
        }
        this.redrawCanvas();
      }
    });
  });
});

Template.editor.onRendered(function() {
  this.autorun(() => {
    if (!Meteor.userId()) {
      Router.go('/');
    }
  });
  
  const instance = this;
  instance.canvas = instance.find('#coatCanvas');
  instance.ctx = instance.canvas.getContext('2d');
  
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

      const isSymbol = src.includes('/symbols/symbols/');
      const isFlag = src.includes('/flags/');
      
      if (isSymbol) {
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
          let cornerX, cornerY;

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
            // Quad mode corner positioning
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
      } else if (isFlag && layout === '2') {
        // Draw rotated flag in split mode
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => { resolve(); };
          img.onerror = () => { resolve(); };
          img.src = src;
        });

        if (img.naturalWidth && img.naturalHeight) {
          ctx.save();
          
          // Calculate dimensions for rotated flag
          const areaWidth = areaInfo.w;
          const areaHeight = areaInfo.h;
          
          // Set rotation point to center of area
          ctx.translate(
            areaInfo.x + areaWidth/2,
            areaInfo.y + areaHeight/2
          );
          
          // Rotate 90 degrees clockwise
          ctx.rotate(Math.PI / 2);
          
          // Draw the rotated image
          ctx.drawImage(
            img,
            -areaHeight/2,  // Swap width/height due to rotation
            -areaWidth/2,
            areaHeight,
            areaWidth
          );
          
          ctx.restore();
        }
      } else {
        // Regular flag/image drawing (existing code)
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => { resolve(); };
          img.onerror = () => { resolve(); };
          img.src = src;
        });

        if (img.naturalWidth && img.naturalHeight) {
          ctx.drawImage(img, areaInfo.x, areaInfo.y, areaInfo.w, areaInfo.h);
        }
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

    if (design.banner && design.banner !== 'none') {
        await new Promise((resolve) => {
            const bannerImg = new Image();
            bannerImg.onload = () => {
                const width = instance.canvas.width * 0.7;
                const height = instance.canvas.height * 0.2;
                const x = (instance.canvas.width - width) / 2;
                const y = instance.canvas.height * 0.65;

                // Draw banner image
                ctx.drawImage(bannerImg, x, y, width, height);

                // Only add text if it exists
                if (text) {
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
                    gradient.addColorStop(0, '#b8860b');
                    gradient.addColorStop(0.5, '#ffd700');
                    gradient.addColorStop(1, '#b8860b');

                    ctx.fillStyle = gradient;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;

                    const textX = instance.canvas.width / 2;
                    const textY = y + (height * 0.7);
                    ctx.fillText(text, textX, textY);

                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }

                resolve();
            };
            bannerImg.src = design.banner;
        });
    }
  };

  // Update loadAndDrawElement to be the only drawing function
  const loadAndDrawElement = (src, position) => {
    return new Promise((resolve) => {
        if (!src) {
            resolve();
            return;
        }
        
        console.log('Loading element:', src, 'for position:', position);
        const img = new Image();
        img.src = src;
        
        img.onload = () => {
            const ctx = instance.canvas.getContext('2d');
            let width, height, x, y;
            
            // Save the current context state
            ctx.save();
            
            // Set transparency for laurels
            if (position === 'laurel') {
                ctx.globalAlpha = 0.7; // 30% transparency
            }
            
            if (position === 'frame') {
                width = instance.canvas.width;
                height = instance.canvas.height;
                x = 0;
                y = 0;
                ctx.drawImage(img, x, y, width, height);
            } else if (position === 'leftAnimal') {
                width = instance.canvas.width * 0.42;
                height = instance.canvas.height * 0.42;
                x = instance.canvas.width * 0.00;
                y = instance.canvas.height * 0.3;
                ctx.drawImage(img, x, y, width, height);
            } else if (position === 'rightAnimal') {
                width = instance.canvas.width * 0.42;
                height = instance.canvas.height * 0.42;
                x = instance.canvas.width * 0.58;
                y = instance.canvas.height * 0.3;
                
                // Save context state
                ctx.save();
                
                // Set up the transform for flipping
                ctx.translate(x + width, y);
                ctx.scale(-1, 1);
                
                // Draw the image at 0,0 since we've translated the context
                ctx.drawImage(img, 0, 0, width, height);
                
                // Restore context state
                ctx.restore();
            } else if (position === 'crown') {
                const crownImg = new Image();
                crownImg.src = img.src;
                const aspectRatio = crownImg.naturalWidth / crownImg.naturalHeight;
                width = instance.canvas.width * 0.35;
                height = width / aspectRatio;
                x = (instance.canvas.width - width) / 2;
                y = instance.canvas.height * 0.05;
                ctx.drawImage(img, x, y, width, height);
            } else if (position === 'banner') {
                width = instance.canvas.width * 0.8;
                height = instance.canvas.height * 0.25;
                x = (instance.canvas.width - width) / 2;
                y = instance.canvas.height * 0.7;
                ctx.drawImage(img, x, y, width, height);
            } else if (position === 'laurel') {
                width = instance.canvas.width;
                height = instance.canvas.height;
                x = 0;
                y = 0;
                ctx.drawImage(img, x, y, width, height);
            }
            
            // Restore the context state
            ctx.restore();
            resolve();
        };
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
    await loadAndDrawElement(design.frameNoBg, 'frame');
    await loadAndDrawElement(design.crown, 'crown');
    await loadAndDrawElement(design.leftAnimal, 'leftAnimal');
    await loadAndDrawElement(design.rightAnimal, 'rightAnimal');
    
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
  
  getCategoryPreviewImage(category) {
    return CHAR_OPTIONS[category]?.[0] || '';
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
    const type = Template.instance().currentElementType.get();
    const animalCategory = Template.instance().currentAnimalCategory.get();
    
    if (!type) return [];

    // Filter animals by category if it's an animal type
    if ((type === 'leftAnimal' || type === 'rightAnimal') && animalCategory) {
      return CHAR_OPTIONS[animalCategory] || [];
    }

    // Return regular options for other types
    return {
      frame: [
        '/images/frames/frame1.png',
        '/images/frames/frame2.png',
        '/images/frames/frame3.png'
      ],
      crown: [
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
        '/images/banners/redbanner.png',
        '/images/banners/blackbanner.png',
        '/images/banners/bluebanner.png',
        '/images/banners/brownbanner.png',
        '/images/banners/greenbanner.png'
      ],
      laurel: [
        '/images/laurels/laurels.png', 
        '/images/laurels/laurels2.png',
        '/images/laurels/goldlaurels.png',
        '/images/laurels/reallaurels.png',
        '/images/laurels/silverlaurels.png'
      ]
    }[type] || [];
  },
  
  getElementName(url) {
    return getElementName(url);
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
  },
  
  elementPickerTitle() {
    const type = Template.instance().currentElementType.get();
    switch(type) {
      case 'frame': return 'Choose Frame';
      case 'leftAnimal': return 'Choose Left Character';
      case 'rightAnimal': return 'Choose Right Character';
      case 'crown': return 'Choose Crown';
      case 'banner': return 'Choose Banner';
      case 'laurel': return 'Choose Laurel';
      default: return 'Choose Element';
    }
  },

  showAnimalCategories() {
    const type = Template.instance().currentElementType.get();
    return type === 'leftAnimal' || type === 'rightAnimal';
  },

  isActiveAnimalTab(category) {
    return Template.instance().currentAnimalCategory.get() === category ? 'active' : '';
  },

  animalCategories() {
    return [
      'bears',
      'boars',
      'bulls',
      'deers',
      'dolphins',
      'dragons',
      'eagles',
      'griffins',
      'horses',
      'lions',
      'people',
      'unicorns',
      'wolves'
    ];
  },

  formatAnimalCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  },

  isRightAnimalType() {
    return Template.instance().currentElementType.get() === 'rightAnimal';
  },

  analyzeDisabled() {
    const credits = Meteor.user()?.profile?.credits;
    return !credits || credits <= 0;
  }
});

Template.editor.events({
  'click .element-category'(event, instance) {
    const category = event.currentTarget.dataset.category;
    instance.selectedCategory.set(category);
    
    // Only show modal for non-char categories
    if (category !== 'char') {
      let elementType = category;
      instance.currentElementType.set(elementType);
      const modal = new bootstrap.Modal(document.getElementById('elementPickerModal'));
      modal.show();
    }
  },
  
  'click .element-btn'(event, instance) {
    const type = event.currentTarget.dataset.type;
    instance.currentElementType.set(type);
    const modal = new bootstrap.Modal(document.getElementById('elementPickerModal'));
    modal.show();
  },
  
  'click .element-picker-modal .image-option'(event, instance) {
    const url = event.currentTarget.dataset.url;
    const type = instance.currentElementType.get();
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
    
    instance.design.set(design);
    instance.redrawCanvas();
    
    // Return focus to the triggering button before closing modal
    const triggerButton = document.querySelector('.category-tab.active, .image-option.active');
    if (triggerButton) {
      triggerButton.focus();
    }
    
    // Close modal
    $('.element-picker-modal').modal('hide');
  },
  
  'click #imagePickerModal .image-option'(event, instance) {
    const url = event.currentTarget.dataset.url;
    const area = instance.activeImageArea.get();
    const images = instance.backgroundImages.get();
    images[area] = url;
    instance.backgroundImages.set(images);
    
    // Add has-image class to the clicked grid area
    const gridArea = document.querySelector(`.grid-area[data-area="${area}"]`);
    if (gridArea) {
      gridArea.classList.add('has-image');
      gridArea.focus();
    }
    
    instance.redrawCanvas();
    
    // Close modal
    $('#imagePickerModal').modal('hide');
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
    const layout = instance.selectedLayout.get();
    const backgroundImages = instance.backgroundImages.get();
    const bannerText = instance.bannerText.get();

    // Create complete design object
    const completeDesign = {
      ...design,
      layout: layout,
      backgroundImages: backgroundImages,
      bannerText: bannerText  // Add banner text to saved design
    };
    
    console.log('Saving complete design:', completeDesign);
    
    Meteor.call('saveDesign', completeDesign, (error) => {
      if (error) {
        console.error('Save error:', error);
        alert('Error saving design: ' + error.reason);
      } else {
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
      
      // Save to server
      Meteor.call('saveExportedImage', dataUrl, (error) => {
        if (error) {
          console.error('Error saving exported image:', error);
        }
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'coat-of-arms.png';
      link.href = dataUrl;
      link.click();
      
      // Restore original canvas with watermark
      ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
      
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
  
  'click .grid-area'(event, instance) {
    const area = event.currentTarget.dataset.area;
    instance.activeImageArea.set(area);
    const modal = new bootstrap.Modal(document.getElementById('imagePickerModal'));
    modal.show();
  },
  
  'input #bannerText'(event, instance) {
    const input = event.target;
    if (input.value.length > 14) {
      input.value = input.value.slice(0, 14).toUpperCase();
    } else {
      input.value = input.value.toUpperCase();
    }
    instance.bannerText.set(input.value);
    instance.redrawCanvas();
  },
  
  'click .category-selector button'(event, instance) {
    const category = event.currentTarget.dataset.category;
    instance.selectedSymbolCategory.set(category);
  },
  
  'click .category-tab'(event, instance) {
    const category = event.currentTarget.dataset.category;
    instance.currentAnimalCategory.set(category);
  },
  
  'click .animal-option'(event, instance) {
    event.preventDefault();
    const category = event.currentTarget.dataset.category;
    instance.currentAnimalCategory.set(category);
  },
  
  // Add modal show handlers to manage focus
  'show.bs.modal #elementPickerModal'(event, instance) {
    // Set initial focus to first interactive element
    setTimeout(() => {
      const firstButton = event.target.querySelector('.category-tab, .image-option');
      if (firstButton) firstButton.focus();
    }, 150);
  },
  
  'show.bs.modal #imagePickerModal'(event, instance) {
    setTimeout(() => {
      const firstButton = event.target.querySelector('.btn-medieval-secondary');
      if (firstButton) firstButton.focus();
    }, 150);
  },
  
  'click #analyzeBtn'(event, instance) {
    const user = Meteor.user();
    if (!user?.profile?.credits) {
      return;
    }

    const design = instance.design.get();
    const elements = {
      leftAnimal: design.leftAnimal ? getElementName(design.leftAnimal) : null,
      rightAnimal: design.rightAnimal ? getElementName(design.rightAnimal) : null,
      crown: design.crown ? getElementName(design.crown) : null,
      banner: design.banner ? getElementName(design.banner) : null,
      laurel: design.laurel ? getElementName(design.laurel) : null,
      bannerText: instance.bannerText.get()
    };

    const modal = new bootstrap.Modal(document.getElementById('analysisModal'));
    modal.show();

    const loadingSpinner = document.querySelector('.loading-spinner');
    const analysisText = document.querySelector('.analysis-text');
    const copyButton = document.querySelector('#copyAnalysis');
    
    // Hide copy button and text, show spinner
    copyButton.style.display = 'none';
    loadingSpinner.classList.remove('d-none');
    analysisText.textContent = '';

    Meteor.call('analyzeComposition', elements, (error, result) => {
      loadingSpinner.classList.add('d-none');
      if (error) {
        analysisText.textContent = 'Failed to analyze composition: ' + error.reason;
      } else {
        // Format the text - replace **text** with <strong>text</strong>
        const formattedText = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Add line breaks between paragraphs
        const withLineBreaks = formattedText.replace(/\n\n/g, '<br><br>');
        analysisText.innerHTML = withLineBreaks;
        // Show copy button
        copyButton.style.display = 'block';
      }
    });
  },
  
  'click #copyAnalysis'(event, instance) {
    const analysisText = document.querySelector('.analysis-text').textContent;
    if (analysisText) {
      navigator.clipboard.writeText(analysisText).then(() => {
        // Temporarily change button text to show success
        const btn = event.currentTarget;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  }
});

Template.registerHelper('eq', function(a, b) {
  return a === b;
});

Template.registerHelper('gt', function(a, b) {
  return a > b;
});

// Inside redrawCanvas function, where background images are drawn
const drawBackgroundImage = async (ctx, image, area) => {
  const layout = instance.selectedLayout.get();
  const isFlag = image.includes('/flags/');
  
  // Get area dimensions and position
  let x, y, width, height;
  
  if (layout === '2' && isFlag) {
    // For split mode flags, rotate 90 degrees
    ctx.save();
    
    // Calculate dimensions for rotated flag
    if (area === 'area1') {
      x = 0;
      y = 0;
      width = canvas.width / 2;
      height = canvas.height;
      // Set rotation point to center of left half
      ctx.translate(width/2, height/2);
    } else {
      x = canvas.width / 2;
      y = 0;
      width = canvas.width / 2;
      height = canvas.height;
      // Set rotation point to center of right half
      ctx.translate(canvas.width * 3/4, height/2);
    }
    
    // Rotate 90 degrees clockwise
    ctx.rotate(Math.PI / 2);
    
    // Draw the rotated image
    const img = await loadImage(image);
    // Adjust drawing position for rotation
    ctx.drawImage(img, -height/2, -width/2, height, width);
    
    ctx.restore();
  } else {
    // Original drawing code for non-split mode or non-flag images
    if (layout === '1') {
      // ... existing single layout code
    } else if (layout === '2') {
      // ... existing split layout code for non-flag images
    } else if (layout === '4') {
      // ... existing quad layout code
    }
  }
};
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Designs } from '../../../lib/collections';
import './editor.html';

// Add Stripe initialization at the top of the file
let stripe;
if (Meteor.settings.public?.stripe?.publicKey) {
  stripe = window.Stripe(Meteor.settings.public.stripe.publicKey);
}

Template.editor.onCreated(function() {
  this.selectedCategory = new ReactiveVar(null);
  this.selectedElement = new ReactiveVar(null);
  this.design = new ReactiveVar({
    frame: null,
    leftAnimal: null,
    rightAnimal: null,
    crown: null,
    banner: null
  });
  this.selectedLayout = new ReactiveVar('1');
  this.backgroundImages = new ReactiveVar({
    area1: null,
    area2: null,
    area3: null,
    area4: null
  });
  this.activeImageArea = new ReactiveVar(null);
  
  // Subscribe to user's design
  this.autorun(() => {
    this.subscribe('userDesign', () => {
      // Load saved design when subscription is ready
      const savedDesign = Designs.findOne({ userId: Meteor.userId() });
      if (savedDesign?.design) {
        this.design.set(savedDesign.design);
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
      }
      
      ctx.drawImage(img, x, y, width, height);
    };
    
    img.src = src;
  };
  
  instance.drawBackgroundImages = async () => {
    const ctx = instance.canvas.getContext('2d');
    const layout = instance.selectedLayout.get();
    const images = instance.backgroundImages.get();
    const design = instance.design.get();
    
    // Direct 55% of canvas for inner area
    const innerWidth = instance.canvas.width * 0.55;
    const innerHeight = instance.canvas.height * 0.55;
    const innerX = (instance.canvas.width - innerWidth) / 2;
    const innerY = (instance.canvas.height - innerHeight) / 2;

    // Calculate flag sizes based on layout
    let flagWidth, flagHeight;
    if (layout === '1') {
      flagWidth = innerWidth;
      flagHeight = innerHeight;
    } else if (layout === '2') {
      flagWidth = innerWidth / 2;
      flagHeight = innerHeight;
    } else { // layout === '4'
      flagWidth = innerWidth / 2;
      flagHeight = innerHeight / 2;
    }

    // Draw flags based on layout
    if (layout === '1' && images.area1) {
      await drawImageInArea(ctx, images.area1, 
        innerX, 
        innerY, 
        flagWidth, 
        flagHeight);
    } 
    else if (layout === '2') {
      if (images.area1) {
        await drawImageInArea(ctx, images.area1, 
          innerX, 
          innerY, 
          flagWidth, 
          flagHeight);
      }
      if (images.area2) {
        await drawImageInArea(ctx, images.area2, 
          innerX + flagWidth, 
          innerY, 
          flagWidth, 
          flagHeight);
      }
    } 
    else if (layout === '4') {
      if (images.area1) {
        await drawImageInArea(ctx, images.area1, 
          innerX, 
          innerY, 
          flagWidth, 
          flagHeight);
      }
      if (images.area2) {
        await drawImageInArea(ctx, images.area2, 
          innerX + flagWidth, 
          innerY, 
          flagWidth, 
          flagHeight);
      }
      if (images.area3) {
        await drawImageInArea(ctx, images.area3, 
          innerX, 
          innerY + flagHeight, 
          flagWidth, 
          flagHeight);
      }
      if (images.area4) {
        await drawImageInArea(ctx, images.area4, 
          innerX + flagWidth, 
          innerY + flagHeight, 
          flagWidth, 
          flagHeight);
      }
    }

    // Draw crown if selected
    if (design.crown && design.crown !== 'none') {
      await new Promise((resolve) => {
        const crownImg = new Image();
        crownImg.onload = () => {
          const crownWidth = instance.canvas.width * 0.3;
          const crownHeight = instance.canvas.height * 0.2;
          const crownX = (instance.canvas.width - crownWidth) / 2;
          const crownY = instance.canvas.height * 0.1; // Position at top
          ctx.drawImage(crownImg, crownX, crownY, crownWidth, crownHeight);
          resolve();
        };
        crownImg.src = design.crown;
      });
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

  // Modify existing redrawCanvas to include background images
  instance.redrawCanvas = async () => {
    const ctx = instance.canvas.getContext('2d');
    const design = instance.design.get();
    
    // Clear canvas first
    ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);
    
    // Draw background images first
    await instance.drawBackgroundImages();
    
    // Load and draw frame
    if (design.frame && design.frame !== 'none') {
      await new Promise((resolve) => {
        const frameImg = new Image();
        frameImg.onload = () => {
          const width = instance.canvas.width * 0.85;
          const height = instance.canvas.height * 0.85;
          const x = (instance.canvas.width - width) / 2;
          const y = (instance.canvas.height - height) / 2;
          ctx.drawImage(frameImg, x, y, width, height);
          resolve();
        };
        frameImg.src = design.frame;
      });
    }
    
    // Draw other elements (animals, crown, banner)
    const loadAndDrawElement = (src, position) => {
      return new Promise((resolve) => {
        if (!src || src === 'none') {
          resolve();
          return;
        }
        
        const img = new Image();
        img.onload = () => {
          let width, height, x, y;
          
          if (position === 'leftAnimal') {
            width = instance.canvas.width * 0.3;
            height = instance.canvas.height * 0.3;
            x = instance.canvas.width * 0.1;
            y = instance.canvas.height * 0.35;
            ctx.drawImage(img, x, y, width, height);
          } else if (position === 'rightAnimal') {
            width = instance.canvas.width * 0.3;
            height = instance.canvas.height * 0.3;
            x = instance.canvas.width * 0.6;
            y = instance.canvas.height * 0.35;
            
            ctx.save();
            ctx.translate(x + width, y);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, width, height);
            ctx.restore();
          } else if (position === 'crown') {
            width = instance.canvas.width * 0.25;
            height = width * 0.8;
            x = (instance.canvas.width - width) / 2;
            y = instance.canvas.height * 0.1;
            ctx.drawImage(img, x, y, width, height);
          } else if (position === 'banner') {
            width = instance.canvas.width * 0.7;
            height = instance.canvas.height * 0.2;
            x = (instance.canvas.width - width) / 2;
            y = instance.canvas.height * 0.65;
            ctx.drawImage(img, x, y, width, height);
          }
          resolve();
        };
        img.src = src;
      });
    };
    
    // Draw all elements in order
    await Promise.all([
      loadAndDrawElement(design.leftAnimal, 'leftAnimal'),
      loadAndDrawElement(design.rightAnimal, 'rightAnimal'),
      loadAndDrawElement(design.crown, 'crown'),
      loadAndDrawElement(design.banner, 'banner')
    ]);
  };
  
  instance.redrawCanvas();
});

Template.editor.helpers({
  isActiveCategory(category) {
    return Template.instance().selectedCategory.get() === category;
  },
  
  isAnimalCategory() {
    return Template.instance().selectedCategory.get() === 'animal';
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
    const animalOptions = [
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
      // Unicorns
      '/images/unicorns/unicorn1.png',
      '/images/unicorns/unicorn2.png',
      // Wolves
      '/images/wolves/wolf1.png',
      '/images/wolves/wolf2.png'
    ];
    
    // Return array of image URLs based on type
    const options = {
      frame: ['none', '/images/frames/frame1.png', '/images/frames/frame2.png'],
      leftAnimal: animalOptions,
      rightAnimal: animalOptions,
      crown: ['none', '/images/crowns/crown1.png', '/images/crowns/crown2.png'],
      banner: ['none', '/images/banners/redbanner.png']
    };
    
    return options[type] || [];
  },
  
  getElementName(url) {
    if (url === 'none') return 'None';
    const match = url.match(/\/([^\/]+)\/[^\/]+\.png$/);
    if (match) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1, -1);
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
      '/images/flags/france.png',
      '/images/flags/italy.png',
      '/images/flags/russia.png',
      '/images/flags/sweden.png',
      '/images/flags/belarus.png',
      '/images/flags/monaco.png'
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
      case 'animal':
        instance.selectedElement.set('leftAnimal');
        break;
      case 'crown':
        instance.selectedElement.set('crown');
        break;
      case 'banner':
        instance.selectedElement.set('banner');
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
    design[type] = url;
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
      frame: null,
      leftAnimal: null,
      rightAnimal: null,
      crown: null,
      banner: null
    };
    instance.design.set(emptyDesign);
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
      leftAnimal: design.leftAnimal || null,
      rightAnimal: design.rightAnimal || null,
      crown: design.crown || null,
      banner: design.banner || null
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
      // Show modal instead of alert
      const modal = new bootstrap.Modal(document.getElementById('creditsModal'));
      modal.show();
      return;
    }
    
    const dataUrl = instance.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'coat-of-arms.png';
    link.href = dataUrl;
    link.click();
    
    Meteor.call('useCredit', (error) => {
      if (error) {
        alert('Error using credit: ' + error.reason);
      }
    });
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
  }
});
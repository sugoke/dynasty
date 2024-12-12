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
    crown: null
  });
  
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
        width = canvas.width * 0.3;
        height = canvas.height * 0.2;
        x = (canvas.width - width) / 2;
        y = canvas.height * 0.1;
      }
      
      ctx.drawImage(img, x, y, width, height);
    };
    
    img.src = src;
  };
  
  instance.redrawCanvas = () => {
    const canvas = instance.canvas;
    const ctx = canvas.getContext('2d');
    const design = instance.design.get();
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create an array of promises for loading images
    const loadImages = () => {
      const images = {};
      const promises = [];
      
      // Load all images first
      if (design.frame) {
        promises.push(new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            images.frame = img;
            resolve();
          };
          img.src = design.frame;
        }));
      }
      
      if (design.leftAnimal) {
        promises.push(new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            images.leftAnimal = img;
            resolve();
          };
          img.src = design.leftAnimal;
        }));
      }
      
      if (design.rightAnimal) {
        promises.push(new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            images.rightAnimal = img;
            resolve();
          };
          img.src = design.rightAnimal;
        }));
      }
      
      if (design.crown) {
        promises.push(new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            images.crown = img;
            resolve();
          };
          img.src = design.crown;
        }));
      }
      
      return Promise.all(promises).then(() => images);
    };
    
    // Draw elements in correct order after all images are loaded
    loadImages().then((images) => {
      // Clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw frame first (background)
      if (images.frame) {
        const width = canvas.width * 0.85;
        const height = canvas.height * 0.85;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(images.frame, x, y, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }
      
      // Draw left animal
      if (images.leftAnimal) {
        const width = canvas.width * 0.3;
        const height = canvas.height * 0.3;
        const x = canvas.width * 0.1;
        const y = canvas.height * 0.35;
        ctx.drawImage(images.leftAnimal, x, y, width, height);
      }
      
      // Draw right animal (mirrored)
      if (images.rightAnimal) {
        const width = canvas.width * 0.3;
        const height = canvas.height * 0.3;
        const x = canvas.width * 0.6;
        const y = canvas.height * 0.35;
        
        // Save context state
        ctx.save();
        
        // Set up the mirror effect
        ctx.translate(x + width, y);
        ctx.scale(-1, 1);
        ctx.drawImage(images.rightAnimal, 0, 0, width, height);
        
        // Restore context state
        ctx.restore();
      }
      
      // Draw crown last
      if (images.crown) {
        const width = canvas.width * 0.3;
        const height = canvas.height * 0.2;
        const x = (canvas.width - width) / 2;
        const y = canvas.height * 0.1;
        ctx.drawImage(images.crown, x, y, width, height);
      }
    });
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
      '/images/lions/lion1.png',
      '/images/dragons/dragon1.png',
      '/images/eagles/eagle1.png',
      '/images/unicorns/unicorn1.png',
      '/images/wolves/wolf1.png',
      '/images/griffins/griffin1.png',
      '/images/bears/bear1.png',
      '/images/boars/boar1.png',
      '/images/bulls/bull1.png',
      '/images/dears/dear1.png',
      '/images/dolphins/dolphin1.png',
      '/images/horses/horse1.png'
    ];
    
    // Return array of image URLs based on type
    const options = {
      frame: ['none', '/images/frames/frame1.png', '/images/frames/frame2.png'],
      leftAnimal: animalOptions,
      rightAnimal: animalOptions,
      crown: ['none', '/images/crowns/crown1.png', '/images/crowns/crown2.png']
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
      crown: null
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
      crown: design.crown || null
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
  }
});
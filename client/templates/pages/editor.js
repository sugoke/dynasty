import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Designs } from '../../../lib/collections';
import './editor.html';

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
  
  instance.redrawCanvas = () => {
    const ctx = instance.ctx;
    const design = instance.design.get();
    
    // Clear canvas
    ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);
    
    // Draw each element
    Object.entries(design).forEach(([type, url]) => {
      if (url && url !== 'none') {
        const img = new Image();
        img.onload = () => {
          // Position and size based on element type
          switch(type) {
            case 'frame':
              ctx.drawImage(img, 0, 0, instance.canvas.width, instance.canvas.height);
              break;
            case 'leftAnimal':
              ctx.save();
              ctx.drawImage(img, 50, 200, 200, 300);
              ctx.restore();
              break;
            case 'rightAnimal':
              ctx.save();
              ctx.translate(instance.canvas.width, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(img, 50, 200, 200, 300);
              ctx.restore();
              break;
            case 'crown':
              ctx.drawImage(img, 200, 50, 400, 200);
              break;
          }
        };
        img.src = url;
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
    const emptyDesign = {
      frame: null,
      leftAnimal: null,
      rightAnimal: null,
      crown: null
    };
    instance.design.set(emptyDesign);
    instance.redrawCanvas();
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
        alert('Design saved successfully!');
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
  }
});
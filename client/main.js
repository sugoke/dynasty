import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import CircleType from 'circletype';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Meteor } from 'meteor/meteor';
//Òimport { Projects } from '/imports/api/projects.js';
import './main.html';
import FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import * as THREE from 'three';


//import '/imports/api/projects.js';
let currentProjectId = new ReactiveVar(null);

 Projects = new Mongo.Collection('projects');

 Meteor.startup(() => {
   Meteor.subscribe('userProjects');
 });




Template.responsiveInterface.onRendered(function () {
  $('#modalOverlay').on('click', function() {
    $("#slideOut").removeClass('showSlideOut');
    $(this).fadeOut("fast"); // Hide the overlay
  });


  // Close sidebar when clicking anywhere
    document.addEventListener('click', function(event) {
      const sidebar = document.getElementById('sidebar');
      const toggleButton = document.getElementById('menuToggle');
      const clickedToggleButton = toggleButton.contains(event.target);

      if (!clickedToggleButton) {
        sidebar.style.width = '0';
      }
    });

  // Set default to 1 "+"
    const symbolCountElement = document.getElementById('symbolCount');
    if (symbolCountElement) {
      symbolCountElement.value = '1';
      const event = new Event('change', {
        'bubbles': true,
        'cancelable': true
      });
      symbolCountElement.dispatchEvent(event);
    }


  let scrollContainer = document.getElementById("scroll-container");

  let isMouseDown = false;
  let startX, scrollLeft;

  scrollContainer.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
  });

  scrollContainer.addEventListener('mouseleave', () => {
    isMouseDown = false;
  });

  scrollContainer.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  scrollContainer.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX);
    scrollContainer.scrollLeft = scrollLeft - walk;
  });
});



Template.responsiveInterface.onCreated(function () {
  this['animal-left'] = [

    // Adding the specified .png files
    'animals/lion4.png',
    'animals/bear2.png',
    'animals/pegase2.png',
    'animals/licorne.png',
    'animals/loup.png',
    'animals/phoenix.png',
    'animals/cheval.png',
    'animals/deer.png', // Assuming you meant 'deer.png' instead of 'deerpeacock.png'
    'animals/peacock.png',
    'animals/dolphin.png', // Fixed the spelling from 'dolphine' to 'dolphin'
    'animals/crow.png',
    'animals/swan.png',
    'animals/fox.png',
    'animals/pegasus2.png',
    'animals/sphinx.png'
  ];
 this['animal-right'] = this['animal-left'];  // Same animals, just mirrored
  this.frame = ['frames/frame1.png','frames/frame2.png','frames/frame3.png','frames/frame4.png','frames/frame5.png','frames/frame6.png','frames/frame7.png','frames/frame8.png','frames/frame9.png','frames/frame10.png',];

  this.symbol = ['symbols/symbol1.png', 'symbols/symbol2.png', 'symbols/symbol3.png', 'symbols/symbol4.png', 'symbols/symbol5.png'];
  this.flag = ['flags/french.png', 'flags/us.png'];
  this.crown = ['crowns/crown.png','crowns/crown2.png','crowns/crown3.png'];
  this.banner = ['banners/banner.png','banners/banner2.png'];
});

const animalSymbolMeanings = {
  'lion4.png': 'The lion, often referred to as the "king of beasts," symbolizes strength, bravery, and royalty. Historically, lions have been featured in art and mythology across various cultures, representing authority and protection. In ancient Egypt, the lioness goddess Sekhmet was worshiped as a warrior goddess and protector, embodying the fierce aspect of the solar deity.',
  'bear2.png': 'The bear is a symbol of strength, courage, and endurance. Native American tribes revered the bear as a spiritual guide, embodying physical strength and leadership. In Norse mythology, warriors called Berserkers believed they could take on the bear’s might by wearing its skin, granting them ferocity in battle.',
  'pegase2.png': 'Pegasus, the winged horse in Greek mythology, symbolizes freedom, inspiration, and the pursuit of knowledge. Born from the blood of Medusa, Pegasus was tamed by Bellerophon to defeat the Chimera. The image of Pegasus has been used to represent poetic inspiration and the immortality of the soul.',
  'licorne.png': 'The unicorn, a legendary creature of purity and grace, symbolizes magic, miracles, and enchantment. Throughout history, unicorns have been depicted as gentle and shy animals, only able to be captured by a virgin. Its horn was said to have the power to neutralize poison, making it a symbol of protection and purity.',
  'loup.png': 'The wolf symbolizes sharp intelligence, deep connections, and freedom. In Roman mythology, the she-wolf Lupa nurtured Romulus and Remus, the founders of Rome, showcasing the wolf’s role as a protector and guide. Wolves are often portrayed as loyal creatures, emphasizing the importance of family and community.',
  'phoenix.png': 'The phoenix, a mythical bird that regenerates from its ashes, represents immortality, resurrection, and renewal. This symbol of rebirth was celebrated in ancient Egypt and later adopted by early Christians as a symbol of Christ’s resurrection, embodying the idea of eternal life.',
  'cheval.png': 'The horse symbolizes mobility, stamina, and freedom. Throughout history, horses have played vital roles in societies, from warfare to transportation and agriculture. In many cultures, the horse is also seen as a symbol of nobility and grace, embodying the spirit of conquest and liberation.',
  'deer.png': 'The deer, known for its gentle and serene demeanor, symbolizes sensitivity, intuition, and grace. In Celtic mythology, the deer was a messenger of the otherworld, offering guidance and protection. The stag, with its magnificent antlers, represents regeneration, as it sheds and regrows its antlers annually.',
  'peacock.png': 'The peacock, with its brilliant plumage, symbolizes nobility, immortality, and renewal. Associated with the goddess Hera in Greek mythology, the peacock’s tail was said to possess the "eyes" of the stars. In Christianity, the peacock symbolizes the resurrection and the immortality of the soul due to the ancient belief that its flesh does not decay.',
  'dolphin.png': 'Dolphins, regarded as friends to humans, symbolize guidance, protection, and good luck. In Greek mythology, dolphins were considered sacred to Apollo and Poseidon, often depicted as rescuers of shipwrecked sailors and guides to the Isles of the Blessed.',
  'crow.png': 'The crow symbolizes transformation and adaptability. In many cultures, crows are seen as oracles of destiny, carrying messages from the spirit world. Their ability to eat anything and thrive anywhere embodies survival and resourcefulness.',
  'swan.png': 'The swan symbolizes grace, beauty, and love. In Greek mythology, Zeus transformed into a swan to win Leda’s love, leading to the birth of Helen of Troy. Swans are often associated with poetic inspiration and the transition between the physical and mystical worlds.',
  'fox.png': 'The fox, known for its cunning, symbolizes wisdom, adaptability, and cleverness. In folklore, the fox is often depicted as a trickster with the ability to outsmart others, embodying the complex balance between wisdom and mischief.',
  'pegasus2.png': 'Similar to Pegase, Pegasus represents the same blend of freedom, inspiration, and the quest for knowledge. This mythical creature’s ability to fly symbolizes the ascension to the divine and the capacity to achieve the impossible.',
  'sphinx.png': 'The sphinx, with its lion’s body and human head, symbolizes mystery, wisdom, and guardianship. In Egyptian mythology, the Great Sphinx is seen as a guardian of the Giza plateau, posing riddles to travelers to protect the sacred tombs. The sphinx’s enigmatic nature invites seekers to look beyond the obvious and explore deeper truths.'
};





Template.responsiveInterface.events({

  'click .slideOutTab': function(event, template) {

    $("#slideOut").toggleClass('showSlideOut');
     $("#modalOverlay").fadeToggle("fast"); // Toggle the overlay visibility



    // Prepare the container by clearing it first
    const list = $("#animalMeaningsList");
    list.empty(); // Clear any existing content

    // Assuming your animalSymbolMeanings is already defined and available
    const elements = $('.coat-of-arms-container img.coat-of-arms-element');

    elements.each(function() {
      const src = $(this).attr('src'); // Source path of the image
      const fileName = src.split('/').pop(); // Extract the filename to match with meanings

      if (animalSymbolMeanings[fileName]) {
        // Adjust here: thumbnail above the text, and hr for a line separator
        const listItem = $(`
          <li style="margin-bottom: 10px;">
            <img src="${src}" style="width: 100px; height: auto; display: block; margin: 0 auto 10px auto;">
            <p style="text-align: center;">${animalSymbolMeanings[fileName]}</p>
            <hr style="border-top: 1px solid #ccc;">
          </li>
        `);
        list.append(listItem);
      }
    });

    // If no relevant elements were found, append a message
    if (list.children().length === 0) {
      list.append('<li>No animal symbols have been added.</li>');
    } else {
      // Remove the last line separator from the last item for a cleaner look
      list.children().last().find('hr').remove();
    }

    // Remove the last line separator from the last item for a cleaner look, if applicable
if ($("#animalMeaningsList").children().length) {
  $("#animalMeaningsList").children().last().find('hr').remove();
}
  },

  'click #sidebar ul li': function(event, templateInstance) {
  // Add a background color for the click effect
  event.target.style.backgroundColor = "grey";

  // Remove the background color after a brief moment
  setTimeout(() => {
    event.target.style.backgroundColor = "";
  }, 200);

  // Your existing code for each specific menu item can go here
  const clickedItemId = event.target.id;
  if (clickedItemId === 'generateImage') {
    // Generate Image code
  } else if (clickedItemId === 'saveProject') {
    // Save Project code
  } // ... and so on for other menu items
},


'click #menuToggle': function(event, instance) {
  const sidebar = document.getElementById('sidebar');
  if (sidebar.style.width === '250px') {
    sidebar.style.width = '0';
  } else {
    sidebar.style.width = '250px';
  }
},


  'click #showProjects': async function(event, templateInstance) {
    // Fetch projects from server
    Meteor.call('getUserProjects', (error, projects) => {
      if (error) {
        console.log('Error fetching projects:', error);
        return;
      }

      // Populate the modal
      const projectList = document.getElementById('projectList');
      projectList.innerHTML = '';
      projects.forEach(project => {
        const listItem = document.createElement('li');
        const projectName = project.name ? project.name : "Untitled Project";
        const lastModified = project.lastModified ? new Date(project.lastModified).toLocaleString() : "Unknown date";
        listItem.textContent = `${projectName} - Last Modified: ${lastModified}`;
        listItem.dataset.projectId = project._id;
        projectList.appendChild(listItem);
      });

      // Show the modal
      $('#projectsModal').modal('show');
    });
  }
,

   // ... (other event handlers)
   'click #projectList li': function(event) {
     const projectId = event.target.dataset.projectId;
     const project = Projects.findOne({ _id: projectId });

     if (project && project.project) {
       // Update elements by directly setting the src attribute
       project.project.elements.forEach(el => {
         const element = document.querySelector(`#${el.id}`);
         if (element) {
           element.src = el.src;
         }
       });

       // Update symbol count
       const symbolCountElement = document.querySelector('#symbolCount');
       if (symbolCountElement) {
         symbolCountElement.value = project.project.symbolCount;
       }

       // Show/hide the correct number of symbols based on the saved symbol count
       const allSymbols = Array.from(document.querySelectorAll('.symbol-section'));
       allSymbols.forEach(symbol => {
         symbol.style.display = 'none';  // Initially hide all
       });

       let relevantSymbols;
       if (project.project.symbolCount === '1') {
         relevantSymbols = document.querySelectorAll('.single-symbol');
       } else if (project.project.symbolCount === '2') {
         relevantSymbols = document.querySelectorAll('.double-symbol');
       } else if (project.project.symbolCount === '4') {
         relevantSymbols = document.querySelectorAll('.quadrant-symbol');
       }

       if (relevantSymbols) {
         relevantSymbols.forEach(symbol => {
           symbol.style.display = 'block';  // Show only the relevant ones
         });
       }

       // Update symbols by directly setting the src attribute
       if (Array.isArray(project.project.symbols)) {
         project.project.symbols.forEach(sym => {
           const symbolElement = document.querySelector(`.symbols-container [data-position="${sym.position}"] img`);
           if (symbolElement) {
             symbolElement.src = sym.src;
           }
         });
       }

       // Update text on the banner
       const bannerTextElement = document.querySelector('#bannerText');
       if (bannerTextElement && project.project.text !== null && project.project.text !== undefined) {
         bannerTextElement.textContent = project.project.text;
       }

       console.log(`Project ${projectId} loaded successfully.`);
     } else {
       console.log(`Project ${projectId} could not be found.`);
     }
   },


  'click #saveToDevice': function(event, templateInstance) {
    const img = document.getElementById('generatedImage');
    fetch(img.src)
      .then(response => response.blob())
      .then(blob => {
        FileSaver.saveAs(blob, 'MyCoatOfArms.png');
      })
      .catch(error => {
        console.log("Couldn't save to device:", error);
      });
  },


  'click #generateImage': async function(event, templateInstance) {
  const container = document.querySelector('.coat-of-arms-container');

  try {
    const canvas = await html2canvas(container, {
      scale: 2,  // Increase the scale for higher quality
    });
    const imgData = canvas.toDataURL();

    document.getElementById('generatedImage').src = imgData;

    // Open the modal
    $('#imageModal').modal('show');
  } catch (error) {
    console.log("Couldn't generate image:", error);
  }
},


// Original event handler
'click .icon-box': function (event, templateInstance) {
const dataType = event.currentTarget.getAttribute("data-type");
let scrollContainerDiv = document.getElementById('scroll-container');
scrollContainerDiv.innerHTML = ''; // Clear existing images

if (dataType === 'text') {
  let textBox = document.createElement('input');
  textBox.type = 'text';
  textBox.id = 'banner-text-input';
  textBox.maxLength = 10;
  textBox.className = 'fade-in'; // Add fade-in effect
  scrollContainerDiv.appendChild(textBox);

  // Add an input event listener to curve the text
  textBox.addEventListener('input', function() {
    let bannerTextContent = document.getElementById('banner-text-content');
    bannerTextContent.innerHTML = this.value;
    new CircleType(bannerTextContent).dir(-1).radius(180);
    console.log("Text curved");
  });

  return;
}

if (dataType && templateInstance[dataType]) {
  templateInstance[dataType].forEach((imgSrc) => {
    let imgElement = document.createElement('img');
    imgElement.src = imgSrc;
    imgElement.className = 'scrollable-image fade-in';  // Add fade-in effect
    imgElement.draggable = false;  // Disable dragging

    if (dataType === 'animal-right') {
      imgElement.style.transform = 'scaleX(-1)';
    }

    // Function to apply a manual bounce effect
    function applyBounceEffect(element) {
      const originalTop = element.offsetTop;
      let startTime;

      function animate(time) {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;

        // Apply a temporary position change
        const newPosition = originalTop - Math.abs(5 * Math.sin(elapsed / 100));
        element.style.top = newPosition + 'px';

        // Stop the animation after 300 milliseconds
        if (elapsed < 300) requestAnimationFrame(animate);
        else element.style.top = originalTop + 'px';  // Reset to original position
      }

      requestAnimationFrame(animate);
    }

    // Your existing click event handler
    imgElement.addEventListener('click', function() {
      const idToUse = `selected-${dataType}`;
      const existingImageElement = document.getElementById(idToUse);

      if (existingImageElement) {
        existingImageElement.src = imgSrc;  // Update the image source
        applyBounceEffect(existingImageElement);  // Apply the manual bounce effect

        console.log(`Image of type ${dataType} replaced in the coat-of-arms-container`);
      } else {
        console.log(`No existing image of type ${dataType} found`);
      }
    });


    scrollContainerDiv.appendChild(imgElement);
  });
}
},

  'change #symbolCount': function(event) {
     const selectedCount = event.target.value;
     const symbolsContainer = document.querySelector('.symbols-container');
     if (!symbolsContainer) return;

     // Clear the container
     symbolsContainer.innerHTML = '';

     // Create elements based on selected count
     let elementsToAdd = [];
     switch(selectedCount) {
       case '1':
         elementsToAdd.push('<div class="symbol-section single-symbol" data-position="single"><i class="fas fa-plus"></i></div>');
         break;
       case '2':
         elementsToAdd.push('<div class="symbol-section double-symbol left" data-position="double-left"><i class="fas fa-plus"></i></div>');
         elementsToAdd.push('<div class="symbol-section double-symbol right" data-position="double-right"><i class="fas fa-plus"></i></div>');
         break;
       case '4':
         elementsToAdd.push('<div class="symbol-section quadrant-symbol top-left" data-position="top-left"><i class="fas fa-plus"></i></div>');
         elementsToAdd.push('<div class="symbol-section quadrant-symbol top-right" data-position="top-right"><i class="fas fa-plus"></i></div>');
         elementsToAdd.push('<div class="symbol-section quadrant-symbol bottom-left" data-position="bottom-left"><i class="fas fa-plus"></i></div>');
         elementsToAdd.push('<div class="symbol-section quadrant-symbol bottom-right" data-position="bottom-right"><i class="fas fa-plus"></i></div>');
         break;
     }

     // Append new elements to the container
     symbolsContainer.innerHTML = elementsToAdd.join('');
   },

   'click .symbol-section': function(event, templateInstance) {
     const position = event.currentTarget.getAttribute('data-position');
     $("#symbolModal").attr('data-position', position);
     $("#symbolModal").modal('show');
   },

   'click .modal-symbol-preview': function(event) {
     const position = $("#symbolModal").attr('data-position');
     const imgSrc = event.target.src;

     // Prepare the new image element
     const imgElement = document.createElement('img');
     imgElement.src = imgSrc;

     // Find the corresponding symbol section based on 'data-position'
     const targetSection = document.querySelector(`.symbol-section[data-position="${position}"]`);

     if (targetSection) {
       // Clear existing content
       targetSection.innerHTML = '';

       // Set the image dimensions to match its container
       imgElement.style.width = '100%';
       imgElement.style.height = '100%';

       // Append the new image
       targetSection.appendChild(imgElement);
     }

     $("#symbolModal").modal('hide');
   },

   'click #saveProject': function(event, templateInstance) {
       console.log("Save Project button clicked");


       // Gather all the necessary data from your interface
       const container = document.querySelector('.coat-of-arms-container');

       // Gather general elements
       const elements = Array.from(container.querySelectorAll('.coat-of-arms-element')).map(el => {
         return {
           id: el.id,
           src: el.src,
           // Add any other attributes you want to save
         };
       });

       // Gather symbol data
       const symbolCount = document.querySelector('#symbolCount').value;
       const symbols = Array.from(container.querySelectorAll('.symbol-section')).map(el => {
         return {
           position: el.dataset.position,
           src: el.querySelector('img') ? el.querySelector('img').src : '',
           id: el.id
           // Add any other attributes related to symbols you want to save
         };
       });

       console.log("Gathered elements:", elements);
       console.log("Gathered symbols:", symbols);

       const projectData = {
         name: 'My Project',
         elements,
         symbols,
         symbolCount,
         text: 'My Text',
         // Add more fields as needed
       };

       console.log("Preparing to save project with data:", projectData);

       // If there is a current project ID, pass it to the Meteor method
        const currentProjectId = Session.get('currentProjectId');
        Meteor.call('saveProject', projectData, currentProjectId, (error, result) => {
          if (error) {
            console.log("Couldn't save the project, error:", error);
          } else {
            Session.set('currentProjectId', result);
            console.log('Project saved successfully, ID:', result);
          }
        });
     },
     'click #newProject': function(event, templateInstance) {
     Swal.fire({
       title: 'Are you sure?',
       text: "You will lose all your current work!",
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#3085d6',
       cancelButtonColor: '#d33',
       confirmButtonText: 'Yes, start a new project!'
     }).then((result) => {
       if (result.isConfirmed) {
         Session.set('currentProjectId', null);
         console.log('Starting a new project');

         // ... (other code for resetting the container, elements, and symbols)

         // Reset the symbol count to its default value (e.g., 1)
         const symbolCountSelector = document.querySelector('#symbolCount');
         symbolCountSelector.value = '1';

         // Clear text content on the banner
         const bannerTextContentElement = document.querySelector('#banner-text-content');
         if (bannerTextContentElement) {
           bannerTextContentElement.textContent = '';
         }

         // Reset symbols based on the symbol count
         const symbolsContainer = document.querySelector('.symbols-container');
         const symbolSections = Array.from(symbolsContainer.querySelectorAll('.symbol-section'));

         // Remove extra symbols
         symbolSections.forEach(symbol => symbol.remove());

         // Create a new symbol element with the 'single-symbol' class
         const newSymbol = document.createElement('div');
         newSymbol.classList.add('symbol-section', 'single-symbol');
         newSymbol.dataset.position = "single";
         newSymbol.innerHTML = '<i class="fas fa-plus"></i>';

         // Append this new symbol to the symbols container
         symbolsContainer.appendChild(newSymbol);

         // You can add more resets here as needed

         Swal.fire(
           'New Project!',
           'Your current work has been cleared and a new project has started.',
           'success'
         );
       }
     });
   },




});
function attachPlusSignClickEvent() {
  const symbolsContainer = document.querySelector('.symbols-container');
  const plusSigns = symbolsContainer.querySelectorAll('.fas.fa-plus');
  plusSigns.forEach(sign => {
    sign.addEventListener('click', function() {
      const position = this.getAttribute('data-position');
      $("#symbolModal").attr('data-position', position);
      $("#symbolModal").modal('show');
    });
  });
}

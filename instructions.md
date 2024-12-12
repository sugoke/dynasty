Detailed Requirements

User Management & Authentication

Utilize Meteor's user accounts system to handle signup, login, and logout.
Provide a top navigation menu with links to "Login" and "Logout". If a user is logged in, show their username.
Leverage meteor-useraccounts to simplify the account UI and flow.
Routing

Use FlowRouter to define multiple routes:
Home Page: Introduction, instructions on how to create a coat of arms.
Editor Page: The main canvas page where the user can design their coat of arms.
Payments/Subscription Page: A page where the user can purchase export credits.
Access to the Editor Page is allowed only if the user is logged in. If not, redirect them to the login page.
Canvas Editor Functionality

Include a main canvas area (e.g., using <canvas> or <div> with a background image if using a more complex library) to display the user's current coat of arms.
The user can add elements to the canvas: a frame (like a shield), a left animal, a right animal, a crown, and a banner.
Each element type is selected using buttons at the bottom of the editor. Clicking one will open a Bootstrap carousel of available images for that element type right above the buttons.
When an element is chosen from the carousel, it will be rendered on the canvas. The user can move elements around if desired (initial version can be static positioning; future enhancements can include drag-and-drop).
The user can reset their current design with a "Reset" button, removing all elements from the canvas.
Element Libraries

Maintain a small set of pre-defined images for each element category (e.g., multiple shield designs, various animal images, crowns, banners). Store these images in public/ or define their URLs.
The Bootstrap carousel should dynamically load images from these sets.
Saving & Loading

Allow the user to save their work-in-progress coat of arms to a Meteor collection (e.g., CoatOfArms collection) associated with their user ID. This includes which elements are selected and their positions on the canvas.
When the user returns to the Editor Page, load their latest saved version if it exists.
Exporting the Design

The user can click an "Export" button to download their coat of arms as an image (e.g., PNG).
Before exporting, check if the user has export credits remaining. If not, prompt them to go to the payment/subscription page to purchase.
Each purchase (20 USD through Stripe) grants 5 export credits.
Deduct one credit each time the user exports.
Payments & Stripe Integration

Implement a Payments Page where the user can purchase additional export credits.
Integrate Stripe checkout to handle a 20 USD payment, which updates the user's export credits by +5.
Store the number of remaining credits in the user's profile or a dedicated collection.
UI Layout & Styling

Include a top navigation bar with:
The app's name (e.g., "Coat of Arms Creator").
Links: Home, Editor (if logged in), Payments (if logged in), and Logout/Login.
The Editor Page layout:
A main canvas area in the center.
Below the canvas, a row of buttons: "Frame", "Left Animal", "Right Animal", "Crown", "Banner", and "Reset".
Above the buttons, when an element type is selected, display a Bootstrap carousel with image thumbnails. Clicking a thumbnail selects that element.
Use Bootstrap for responsive layout and styling.
Data & Collections

Users: standard Meteor users collection, extended with a field for exportCredits (Number).
CoatOfArms: a collection storing documents with userId, elements (array of chosen element objects: type, imageURL, position), lastUpdated timestamp.
On the server, publish the user’s coat of arms data and on the client subscribe to it when on the Editor Page.
Error Handling & Edge Cases

If a non-logged-in user tries to access the Editor Page, redirect to login.
If a user attempts to export with 0 credits, show a modal or alert directing them to the Payments Page.
If payment fails, show an error message on the Payments Page.
If there are no saved coats of arms, start with a blank canvas.
Full Meteor Code Example (Basic Skeleton)

Folder Structure (example):

css
Copier le code
project/
  .meteor/
  client/
    main.html
    main.js
    styles.css
    imports/
      ui/
        layouts/
          MainLayout.html
          MainLayout.js
        pages/
          HomePage.html
          HomePage.js
          EditorPage.html
          EditorPage.js
          PaymentPage.html
          PaymentPage.js
        components/
          Navbar.html
          Navbar.js
          ElementCarousel.html
          ElementCarousel.js
        templates/
          LoginTemplates.html
    startup/
      client/
        index.js
      server/
        index.js
  server/
    main.js
    methods.js
    publications.js
  imports/
    api/
      CoatOfArms/
        collection.js
  public/
    img/
      frames/
      animals/
      crowns/
      banners/
  package.json
package.json

json
Copier le code
{
  "name": "coat-of-arms-creator",
  "private": true,
  "scripts": {
    "start": "meteor run"
  },
  "dependencies": {
    "@babel/runtime": "^7.0.0",
    "meteor-node-stubs": "^1.0.0"
  }
}
.meteor/packages

makefile
Copier le code
meteor-base
accounts-base
accounts-password
jquery
session
tracker
reactive-var
standard-minifier-css
standard-minifier-js
dynamic-import
es5-shim
insecure
browser-policy
kadira:flow-router
kadira:blaze-layout
useraccounts:core
useraccounts:bootstrap
twbs:bootstrap
client/main.html

html
Copier le code
<head>
  <title>Coat of Arms Creator</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body>
  {{> MainLayout}}
</body>
client/main.js

js
Copier le code
import '../imports/startup/client';
client/styles.css

css
Copier le code
body {
  padding-top: 60px;
}
.canvas-container {
  text-align: center;
  margin: 20px auto;
}
.element-buttons {
  margin-top: 20px;
}
.carousel-container {
  margin-bottom: 20px;
}
client/imports/ui/layouts/MainLayout.html

html
Copier le code
<template name="MainLayout">
  {{> Navbar}}
  <div class="container">
    <div class="main-content">
      {{> Template.dynamic template=main}}
    </div>
  </div>
</template>
client/imports/ui/layouts/MainLayout.js

js
Copier le code
import { Template } from 'meteor/templating';
import './MainLayout.html';
import '../components/Navbar.js';
client/imports/ui/components/Navbar.html

html
Copier le code
<template name="Navbar">
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <a class="navbar-brand" href="/">Coat of Arms Creator</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
      aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
  
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
        {{#if currentUser}}
          <li class="nav-item"><a class="nav-link" href="/editor">Editor</a></li>
          <li class="nav-item"><a class="nav-link" href="/payment">Payments</a></li>
        {{/if}}
      </ul>
      <ul class="navbar-nav ml-auto">
        {{#if currentUser}}
          <li class="nav-item">
            <a class="nav-link" href="#">{{currentUser.username}}</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" id="logoutBtn">Logout</a>
          </li>
        {{else}}
          <li class="nav-item">
            <a class="nav-link" href="/login">Login</a>
          </li>
        {{/if}}
      </ul>
    </div>
  </nav>
</template>
client/imports/ui/components/Navbar.js

js
Copier le code
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './Navbar.html';

Template.Navbar.events({
  'click #logoutBtn'(event) {
    event.preventDefault();
    Meteor.logout((err) => {
      console.log('User logged out');
    });
  }
});
client/imports/ui/pages/HomePage.html

html
Copier le code
<template name="HomePage">
  <h1>Welcome to the Coat of Arms Creator</h1>
  <p>Create your personal coat of arms. Sign up or login, then head to the Editor to start designing your own masterpiece.</p>
</template>
client/imports/ui/pages/HomePage.js

js
Copier le code
import { Template } from 'meteor/templating';
import './HomePage.html';
client/imports/ui/pages/EditorPage.html

html
Copier le code
<template name="EditorPage">
  <h2>Coat of Arms Editor</h2>
  <div class="canvas-container">
    <canvas id="coatCanvas" width="400" height="400" style="border:1px solid #ccc;"></canvas>
  </div>
  
  <div class="carousel-container">
    {{#if selectedElementType}}
      {{> ElementCarousel type=selectedElementType}}
    {{/if}}
  </div>
  
  <div class="element-buttons">
    <button class="btn btn-primary element-btn" data-type="frame">Frame</button>
    <button class="btn btn-primary element-btn" data-type="leftAnimal">Left Animal</button>
    <button class="btn btn-primary element-btn" data-type="rightAnimal">Right Animal</button>
    <button class="btn btn-primary element-btn" data-type="crown">Crown</button>
    <button class="btn btn-primary element-btn" data-type="banner">Banner</button>
    <button class="btn btn-danger" id="resetCanvas">Reset</button>
  </div>
  
  <hr>
  <div>
    <button class="btn btn-success" id="saveDesign">Save</button>
    <button class="btn btn-info" id="exportDesign">Export</button>
    <p>Exports left: {{exportsLeft}}</p>
  </div>
</template>
client/imports/ui/pages/EditorPage.js

js
Copier le code
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { CoatOfArms } from '/imports/api/CoatOfArms/collection';
import './EditorPage.html';
import '../components/ElementCarousel.js';

Template.EditorPage.onCreated(function() {
  this.selectedElementType = new ReactiveVar(null);
  this.autorun(() => {
    this.subscribe('myCoatOfArms');
  });
});

Template.EditorPage.helpers({
  selectedElementType() {
    return Template.instance().selectedElementType.get();
  },
  exportsLeft() {
    const user = Meteor.user();
    return user && user.exportCredits || 0;
  }
});

Template.EditorPage.events({
  'click .element-btn'(event, instance) {
    const type = event.currentTarget.getAttribute('data-type');
    instance.selectedElementType.set(type);
  },
  'click #resetCanvas'(event, instance) {
    // Reset the design logic here
    console.log('Resetting canvas');
  },
  'click #saveDesign'(event, instance) {
    // Save current design to collection
    console.log('Saving design');
  },
  'click #exportDesign'(event, instance) {
    const user = Meteor.user();
    if (!user || user.exportCredits <= 0) {
      alert('No export credits left. Please purchase more.');
      return;
    }
    // Export logic (convert canvas to dataURL and trigger download)
    console.log('Exporting design');
  }
});
client/imports/ui/pages/PaymentPage.html

html
Copier le code
<template name="PaymentPage">
  <h2>Purchase Export Credits</h2>
  <p>Each purchase of $20 grants you 5 export credits.</p>
  <button class="btn btn-primary" id="purchaseBtn">Purchase via Stripe</button>
</template>
client/imports/ui/pages/PaymentPage.js

js
Copier le code
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import './PaymentPage.html';

Template.PaymentPage.events({
  'click #purchaseBtn'(event, instance) {
    console.log('Initiating payment process...');
    // Integrate Stripe Checkout here
  }
});
client/imports/ui/components/ElementCarousel.html

html
Copier le code
<template name="ElementCarousel">
  <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
    <ol class="carousel-indicators">
      {{#each elements}}
        <li data-target="#carouselExampleIndicators" data-slide-to="{{@index}}" class="{{#if @first}}active{{/if}}"></li>
      {{/each}}
    </ol>
    <div class="carousel-inner">
      {{#each elements}}
        <div class="carousel-item {{#if @first}}active{{/if}}">
          <img class="d-block w-100 element-img" src="{{this}}" alt="element image">
        </div>
      {{/each}}
    </div>
    <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    </a>
    <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
    </a>
  </div>
</template>
client/imports/ui/components/ElementCarousel.js

js
Copier le code
import { Template } from 'meteor/templating';
import './ElementCarousel.html';

Template.ElementCarousel.helpers({
  elements() {
    const type = Template.currentData().type;
    // Return an array of image URLs for the given type
    // Placeholder URLs:
    if (type === 'frame') {
      return ['/img/frames/frame1.png', '/img/frames/frame2.png'];
    }
    if (type === 'leftAnimal') {
      return ['/img/animals/lion.png', '/img/animals/dragon.png'];
    }
    if (type === 'rightAnimal') {
      return ['/img/animals/lion2.png', '/img/animals/horse.png'];
    }
    if (type === 'crown') {
      return ['/img/crowns/crown1.png', '/img/crowns/crown2.png'];
    }
    if (type === 'banner') {
      return ['/img/banners/banner1.png', '/img/banners/banner2.png'];
    }
    return [];
  }
});

Template.ElementCarousel.events({
  'click .element-img'(event, instance) {
    const selectedImage = event.currentTarget.src;
    console.log('Selected element:', selectedImage);
    // Add logic to put this element onto the canvas
  }
});
client/imports/ui/templates/LoginTemplates.html

html
Copier le code
<!-- useraccounts templates -->
<template name="atForm">
  {{> atForm}}
</template>

<template name="atNavButton">
  {{> atNavButton}}
</template>

<template name="atPwdForm">
  {{> atPwdForm}}
</template>

<template name="atPwdFormBtn">
  {{> atPwdFormBtn}}
</template>

<template name="atSocial">
  {{> atSocial}}
</template>

<template name="atTitle">
  {{> atTitle}}
</template>

<!-- Additional templates for useraccounts if needed -->
imports/startup/client/index.js

js
Copier le code
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import '../../ui/layouts/MainLayout.js';
import '../../ui/pages/HomePage.js';
import '../../ui/pages/EditorPage.js';
import '../../ui/pages/PaymentPage.js';
import '../../ui/templates/LoginTemplates.html';

AccountsTemplates.configure({
  defaultLayout: 'MainLayout',
  defaultLayoutRegions: {},
  defaultContentRegion: 'main'
});

FlowRouter.route('/', {
  name: 'home',
  action() {
    BlazeLayout.render('MainLayout', { main: 'HomePage' });
  }
});

FlowRouter.route('/login', {
  name: 'login',
  action() {
    BlazeLayout.render('MainLayout', { main: 'atForm' });
  }
});

FlowRouter.route('/editor', {
  name: 'editor',
  triggersEnter: [function(context, redirect) {
    if(!Meteor.userId()) {
      redirect('/login');
    }
  }],
  action() {
    BlazeLayout.render('MainLayout', { main: 'EditorPage' });
  }
});

FlowRouter.route('/payment', {
  name: 'payment',
  triggersEnter: [function(context, redirect) {
    if(!Meteor.userId()) {
      redirect('/login');
    }
  }],
  action() {
    BlazeLayout.render('MainLayout', { main: 'PaymentPage' });
  }
});
imports/startup/server/index.js

js
Copier le code
import '/imports/api/CoatOfArms/collection';
import '/server/publications';
import '/server/methods';
imports/api/CoatOfArms/collection.js

js
Copier le code
import { Mongo } from 'meteor/mongo';

export const CoatOfArms = new Mongo.Collection('coatOfArms');
server/main.js

js
Copier le code
import '../imports/startup/server';
server/methods.js

js
Copier le code
import { Meteor } from 'meteor/meteor';
import { CoatOfArms } from '/imports/api/CoatOfArms/collection';

Meteor.methods({
  saveCoatDesign(design) {
    if(!this.userId) return;
    CoatOfArms.upsert({ userId: this.userId }, { $set: { elements: design.elements, lastUpdated: new Date() }});
  },
  purchaseCredits() {
    if(!this.userId) return;
    Meteor.users.update(this.userId, { $inc: { exportCredits: 5 } });
  },
  useExportCredit() {
    if(!this.userId) return;
    const user = Meteor.users.findOne(this.userId);
    if(user.exportCredits > 0) {
      Meteor.users.update(this.userId, { $inc: { exportCredits: -1 } });
    } else {
      throw new Meteor.Error('no-credits', 'No export credits left');
    }
  }
});
server/publications.js

js
Copier le code
import { Meteor } from 'meteor/meteor';
import { CoatOfArms } from '/imports/api/CoatOfArms/collection';

Meteor.publish('myCoatOfArms', function() {
  if(!this.userId) return this.ready();
  return CoatOfArms.find({ userId: this.userId });
});
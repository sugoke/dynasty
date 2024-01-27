// server/main.js
import { Meteor } from 'meteor/meteor';
import { Projects } from '/imports/api/projects.js';  // Make sure this import is correct

Meteor.publish('userProjects', function() {
  return Projects.find({ userId: this.userId });
});

Meteor.methods({
  'getUserProjects': function() {
   if (!this.userId) {
     throw new Meteor.Error('not-authorized');
   }
   return Projects.find({ userId: this.userId }).fetch();
 },

 'saveProject': function(projectData, currentProjectId) {
   console.log("saveProject called with:", projectData, currentProjectId);

   if (!this.userId) {
     throw new Meteor.Error('not-authorized');
   }

   let nextSerial = 1;
   const lastProject = Projects.findOne({userId: this.userId}, {sort: {serial: -1}});

   if (lastProject) {
     nextSerial = lastProject.serial + 1;
   }

   const projectCount = Projects.find({ userId: this.userId }).count();
   const projectName = `Composition ${projectCount + 1}`;
   const lastModified = new Date();

   if (currentProjectId) {
     Projects.update(currentProjectId, {
       $set: {
         project: projectData,
         updatedAt: lastModified,
       }
     });
     console.log(`Project updated successfully, ID: ${currentProjectId}`);
     return currentProjectId;
   } else {
     const projectId = Projects.insert({
       name: projectName,
       project: projectData,
       userId: this.userId,
       serial: nextSerial,
       createdAt: new Date(),
       lastModified: lastModified
     });
     console.log(`Project saved successfully, ID: ${projectId}`);
     return projectId;
   }
 }



});

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { HTTP } from 'meteor/http';
import Stripe from 'stripe';
import { Designs } from '../lib/collections';
import fs from 'fs';
import path from 'path';

console.log('Meteor settings:', Meteor.settings);
console.log('Stripe key:', Meteor.settings?.private?.stripe?.secretKey);

let stripe;
try {
  if (Meteor.settings?.private?.stripe?.secretKey) {
    stripe = new Stripe(Meteor.settings.private.stripe.secretKey, {
      apiVersion: '2023-10-16'
    });
    console.log('Stripe initialized successfully');
  } else {
    console.log('No Stripe secret key found in settings');
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

Meteor.methods({
  async saveDesign(design) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    // Log the design object to help debug
    console.log('Saving design:', design);
    
    try {
      // Define a pattern that matches either null or a string
      const StringOrNull = Match.OneOf(String, null);
      
      check(design, {
        frame: StringOrNull,
        frameNoBg: StringOrNull,
        leftAnimal: StringOrNull,
        rightAnimal: StringOrNull,
        crown: StringOrNull,
        banner: StringOrNull,
        laurel: StringOrNull
      });
      
      const selector = { userId: this.userId };
      const modifier = {
        $set: {
          userId: this.userId,
          design,
          updatedAt: new Date()
        }
      };
      
      const result = await Designs.updateAsync(
        selector,
        modifier,
        { upsert: true }
      );
      
      return result;
    } catch (error) {
      console.error('Design validation error:', error);
      throw new Meteor.Error('validation-error', error.message);
    }
  },
  
  async useCredit() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user?.profile?.credits) {
      throw new Meteor.Error('no-credits', 'No export credits available');
    }
    
    return Meteor.users.updateAsync(this.userId, {
      $inc: {
        'profile.credits': -1
      }
    });
  },
  
  async addCredits(amount) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    check(amount, Number);
    
    return Meteor.users.updateAsync(this.userId, {
      $inc: {
        'profile.credits': amount
      }
    });
  },
  
  async createStripeCheckout() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    if (!stripe) {
      throw new Meteor.Error('stripe-not-configured', 'Stripe is not configured');
    }
    
    // Get user's email
    const user = await Meteor.users.findOneAsync(this.userId);
    const email = user.emails?.[0]?.address;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: '5 Export Credits',
          },
          unit_amount: 2000, // $20.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: Meteor.absoluteUrl('payment/success'),
      cancel_url: Meteor.absoluteUrl('payment/cancel')
    });
    
    return session.id;
  },
  
  async saveExportedImage(dataUrl) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    try {
      // Remove the data URL prefix to get just the base64 data
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      
      // Get the project root directory by removing .meteor/local/build/programs/server
      const projectRoot = process.cwd().split('.meteor')[0];
      console.log('Project root:', projectRoot); // Debug log
      
      // Create savedCompositions directory in private folder
      const dir = path.join(projectRoot, 'private', 'savedCompositions');
      console.log('Saving to directory:', dir); // Debug log
      
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Save the file
      const filePath = path.join(dir, `${this.userId}.png`);
      fs.writeFileSync(filePath, base64Data, 'base64');
      
      console.log(`Saved composition for user ${this.userId} at ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error saving exported image:', error);
      throw new Meteor.Error('save-failed', 'Failed to save exported image');
    }
  },
  
  async analyzeComposition(elements) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user?.profile?.credits) {
      throw new Meteor.Error('no-credits', 'No credits available');
    }

    try {
      const prompt = `Analyze this coat of arms composition and create a symbolic interpretation:
      Left Character: ${elements.leftAnimal || 'None'}
      Right Character: ${elements.rightAnimal || 'None'}
      Crown Type: ${elements.crown || 'None'}
      Banner Style: ${elements.banner || 'None'}
      Banner Text: ${elements.bannerText || 'None'}
      Laurel Type: ${elements.laurel || 'None'}

      Please provide a detailed paragraph about the symbolic meaning of these elements together, their historical significance, and what they might represent for the bearer of this coat of arms. Use a formal, medieval-style tone.`;

      const result = await HTTP.post('https://api.openai.com/v1/chat/completions', {
        headers: {
          'Authorization': `Bearer ${Meteor.settings.private.openai.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert heraldry interpreter with deep knowledge of medieval symbolism and coat of arms traditions."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        }
      });

      // Use credit
      await Meteor.users.updateAsync(this.userId, {
        $inc: {
          'profile.credits': -1
        }
      });

      return result.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Meteor.Error('analysis-failed', 'Failed to analyze composition');
    }
  }
}); 
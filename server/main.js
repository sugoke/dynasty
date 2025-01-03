import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Accounts } from 'meteor/accounts-base';
import '../lib/collections';
import './publications';
import './methods';

// Add email sending function
const sendEmailViaSmtp2Go = async (options) => {
  console.log('Starting sendEmailViaSmtp2Go with options:', {
    to: options.to,
    subject: options.subject,
    hasHtml: !!options.html,
    hasText: !!options.text
  });
  
  const apiKey = Meteor.settings.smtp.apiKey;
  console.log('Using SMTP2GO API key:', apiKey?.substring(0, 10) + '...');
  
  try {
    const requestData = {
      sender: Meteor.settings.smtp.username,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html_body: options.html,
      text_body: options.text
    };
    
    console.log('Sending request to SMTP2GO:', {
      url: 'https://api.smtp2go.com/v3/email/send',
      sender: requestData.sender,
      to: requestData.to,
      subject: requestData.subject
    });

    const result = await HTTP.call('POST', 'https://api.smtp2go.com/v3/email/send', {
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': apiKey
      },
      data: requestData
    });
    
    console.log('SMTP2GO API Response:', result.data);
    return result.data;
  } catch (error) {
    console.error('SMTP2GO API Error:', {
      error: error.message,
      response: error.response?.content,
      statusCode: error.response?.statusCode
    });
    throw new Meteor.Error('email-failed', 'Failed to send email via SMTP2GO', error.response?.content);
  }
};

Meteor.startup(() => {
  console.log('Server starting...');
  
  if (!Meteor.settings) {
    throw new Error('Settings not loaded. Please run with --settings settings.json');
  }
  
  if (!Meteor.settings.private?.stripe?.secretKey) {
    throw new Error('Stripe secret key not found in settings');
  }

  // Configure email templates and override Accounts email sending
  Accounts.emailTemplates.from = Meteor.settings.smtp.username;
  Accounts.emailTemplates.resetPassword = {
    subject() {
      return 'Reset Your Password';
    },
    html(user, url) {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>To reset your password, please click the link below:</p>
          <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #DD772A; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>The link will expire in 24 hours.</p>
        </div>
      `;
    },
    text(user, url) {
      return `Hello,\n\nTo reset your password, please click the link below:\n\n${url}\n\nIf you didn't request this, please ignore this email.\n\nThe link will expire in 24 hours.`;
    }
  };

  // Override Accounts.sendResetPasswordEmail
  const originalSendResetPassword = Accounts.sendResetPasswordEmail;
  Accounts.sendResetPasswordEmail = async (userId, email) => {
    const user = await Meteor.users.findOneAsync(userId);
    const url = Accounts.urls.resetPassword(user.services.password.reset.token);
    
    return sendEmailViaSmtp2Go({
      to: email,
      from: Accounts.emailTemplates.from,
      subject: Accounts.emailTemplates.resetPassword.subject(),
      text: Accounts.emailTemplates.resetPassword.text(user, url),
      html: Accounts.emailTemplates.resetPassword.html(user, url)
    });
  };

  // Test email configuration on startup
  try {
    console.log('Testing email configuration...');
    sendEmailViaSmtp2Go({
      to: 'test@example.com',
      from: Meteor.settings.smtp.username,
      subject: 'Email System Test',
      text: 'This is a test email to verify the email system is working.',
      html: '<p>This is a test email to verify the email system is working.</p>'
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Failed to send test email:', error);
  }

  console.log('Server started successfully');
});

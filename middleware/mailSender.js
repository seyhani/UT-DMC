'use strict';
const User = require('./../models/user');
const nodemailer = require('nodemailer');

const mailOptions = {
    from: '', // Your email id
    subject: 'DM Contest'
};

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: '', // Your email id
        pass: '' // Your password
    }
});

const FUNCS = {
    sendTemplateToAll: (pathToTemplate, params, callback) => {
    },

    sendTemplateTo: (pathToTemplate, params, email, callback) => {
    },

    sendHtmlToAll: (html, callback) => {
        User.find({}, 'email', (err, docs) => {
            if(err)
                return callback(err);
            if(!docs)
                return callback(null);
            let options = Object.assign({}, mailOptions, {to: docs.map(x => x.email).join(', '), html: html});
            return transporter.sendMail(options, callback);
        });
    },

    sendHtmlTo: (html, email, callback) => {
        let options = Object.assign({}, mailOptions, {to: email, html: html});
        return transporter.sendMail(options, callback);
    }
};

module.exports = FUNCS;

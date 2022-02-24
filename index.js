const express = require('express');
const crypto = require('crypto');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
//const substring = require("substring")
const urlencoded = require('body-parser').urlencoded;

var valid = require("card-validator");
const { creditCardType } = require('card-validator');
//const request = require('sync-request');

var CardTYPE = "";
const app = express();
let Qccnum = "";
let Qcvv = "";
let QDate = "";
let cc_lastfourdigit = "1111";
let account = "";//'AC2ded79841f9fbf7c421a32aa16b18d9b';
let flow = "";//'FWe2edf781f86ad40cd6e14d78e952e091';
var key = "XNopKZ@$TiMBf64tZ9eg~RiaQSZ#Pw%*";
//var encrypted = encrypt(collectData, key);
const port = process.env.PORT || 5001;

app.use(urlencoded({ extended: false }));
let counter_c = 0;
let NameSpace = "";
let phonenumber = "";
app.post('/TwiMl_Gather_Node', async (req, res) => {
    const response = new VoiceResponse();

    try {
        if (!(req.query.NameSpace === undefined && req.query.phonenumber === undefined)) {
            console.log('********************************************START ' + req.query.phonenumber + ' ******************************************************');
            counter_c = 0
            NameSpace = req.query.NameSpace;
            account = req.query.account;
            phonenumber = req.query.phonenumber;
            flow = req.query.flow;
            console.log('account Log: ' + account);
            console.log('flow Log: ' + flow);
            console.log('NameSpace Log: ' + NameSpace);

        }
    }
    catch { }
    const gather = response.gather({
        action: '/TwiMl_Gather_Node/response',
        method: 'GET',
        timeout: 3,
        numDigits: 16
    });
    gather.say({ voice: 'Polly.Joanna-Neural' }, 'We will need your credit card information,,Enter the Credit Card number followed by pound sign , when ready.');

    gather.pause({
        length: 5
    });

    if (counter_c <= 2) {
        counter_c = counter_c + 1;
        console.log('Counter Log: ' + counter_c);
        response.redirect('/TwiMl_Gather_Node');
    }
    else
        response.redirect('https://webhooks.twilio.com/v1/Accounts/' + account + '/Flows/' + flow + '?FlowEvent=return&agent_transfer=true&widgetsName=creditcardgather');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})

app.get('/TwiMl_Gather_Node/response', async (req, res) => {
    console.log('Credit Card Colletion');
    const response = new VoiceResponse();
    let digits = req.query.Digits;
    var numberValidation = valid.number(digits);
    console.log(numberValidation);

    if (numberValidation.isValid) {
        cc_lastfourdigit = digits.slice(digits.length - 4);
        console.log('CardLast4 Digit: ' + digits.slice(digits.length - 4));
        CardTYPE = numberValidation.card.type.toLowerCase();
        console.log('CCartType: ' + CardTYPE);

        if (NameSpace == "EBO" || NameSpace == "CBA") {
            if (!(CardTYPE === "discover" || CardTYPE === "mastercard" || CardTYPE === "visa" || CardTYPE === "american-express")) {
                response.say({ voice: 'Polly.Joanna-Neural' }, `This card is ${CardTYPE} , we only accept discover, mastercard, american express or visa,,.`);
                response.redirect('/TwiMl_Gather_Node');
            }
            if (CardTYPE == "american-express")
                CardTYPE = "AE";
        }
        else if (!(CardTYPE === "discover" || CardTYPE === "mastercard" || CardTYPE === "visa")) {
            response.say({ voice: 'Polly.Joanna-Neural' }, `This card is ${CardTYPE} , we only accept discover mastercard or visa,,`);
            response.redirect('/TwiMl_Gather_Node');

        }

        counter_c = 0;
        console.log('Credit card Authenticated');
        Qccnum = encrypt(digits, key);
        response.redirect('/TwiMl_Gather_Node/DateValidate');

    }
    else {
        response.say({ voice: 'Polly.Joanna-Neural' }, `The card number you have entered is not correct,`);
        console.log('The card number you have entered is not correct,');
        response.redirect('/TwiMl_Gather_Node');
    }
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})

app.post('/TwiMl_Gather_Node/DateValidate', async (req, res) => {
    console.log("DateValidate");
    const response = new VoiceResponse();
    const gather = response.gather({
        action: '/TwiMl_Gather_Node/DateValidate_Response',
        method: 'GET',
        timeout: 3,
        numDigits: 4
    });
    gather.say({ voice: 'Polly.Joanna-Neural' }, 'enter your card expiration date,  , ,Two digits for the month and two digits for the year, , ,Example, a date of March 2026 should be entered as 03, for the month and  2 6 for the year');

    gather.pause({
        length: 5
    });

    if (counter_c <= 2) {
        counter_c = counter_c + 1;
        response.redirect('/TwiMl_Gather_Node/DateValidate');
    }
    else
        response.redirect('https://webhooks.twilio.com/v1/Accounts/' + account + '/Flows/' + flow + '?FlowEvent=return&agent_transfer=true&widgetsName=DateValidate');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})

app.get('/TwiMl_Gather_Node/DateValidate_Response', async (req, res) => {
    console.log("DateValidate_Response");

    const response = new VoiceResponse();
    let CC_Date = req.query.Digits;
    //if (CC_Date.length === 4) {
    var dtValid = valid.expirationDate(CC_Date);
    if (dtValid.isValid) {
        counter_c = 0;
        console.log('Date Authenticated');
        QDate = CC_Date;//encrypt(CC_Date, key);
        response.redirect('/TwiMl_Gather_Node/CVV');
    }
    else {
        response.say({ voice: 'Polly.Joanna-Neural' }, `The date you have entered is not valid, `);
        console.log('Date is not correct.');
        response.redirect('/TwiMl_Gather_Node/DateValidate');
        //response.result = -1; //error
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})

app.post('/TwiMl_Gather_Node/CVV', async (req, res) => {
    console.log("cvv collection");
    const response = new VoiceResponse();

    const gather = response.gather({
        action: '/TwiMl_Gather_Node/cvvresponse',
        method: 'GET',
        timeout: 3
    });
    gather.say({ voice: 'Polly.Joanna-Neural' }, 'Enter you C V V number located at the back of your card.');

    gather.pause({
        length: 3
    });
    if (counter_c <= 2) {
        counter_c = counter_c + 1;
        response.redirect('/TwiMl_Gather_Node/CVV');
    }
    else
        response.redirect('https://webhooks.twilio.com/v1/Accounts/' + account + '/Flows/' + flow + '?FlowEvent=return&agent_transfer=true&widgetsName=CVV');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})

app.get('/TwiMl_Gather_Node/cvvresponse', async (req, res) => {
    console.log("cvv");
    const response = new VoiceResponse();
    let CC_CVV = req.query.Digits;

    if (CardTYPE === "AE" & CC_CVV.length === 4) {
        //response.say('CVV Processing');
        console.log('AE CVV Authenticated');
        counter_c = 0;
        Qcvv = encrypt(CC_CVV, key);
        response.redirect('https://webhooks.twilio.com/v1/Accounts/' + account + '/Flows/' + flow + '?FlowEvent=return&agent_transfer=false&card_number=' + Qccnum + '&card_cvv=' + Qcvv + '&Card_Date=' + QDate + '&card_type=' + CardTYPE + '&cc_lastfourdigit=' + cc_lastfourdigit + '');
    }
    else if (CC_CVV.length === 3) {
        //response.say('Processing');
        console.log('cvv Authenticated');
        counter_c = 0;
        Qcvv = encrypt(CC_CVV, key);
        response.redirect('https://webhooks.twilio.com/v1/Accounts/' + account + '/Flows/' + flow + '?FlowEvent=return&agent_transfer=false&card_number=' + Qccnum + '&card_cvv=' + Qcvv + '&Card_Date=' + QDate + '&card_type=' + CardTYPE + '&cc_lastfourdigit=' + cc_lastfourdigit + '');
    }
    else {
        console.log('The cvv you have entered is not valid,');
        response.say({ voice: 'Polly.Joanna-Neural' }, `The cvv you have entered is not valid, `);
        response.redirect('/TwiMl_Gather_Node/CVV');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})

app.post('/timeout', (req, res) => {

    console.log('Timed out.');

    res.sendStatus(200);

})

app.listen(port, () => {

    console.log(`Example app listening at http://localhost:${port}`);

})

function encrypt(text, key) {
    try {
        const IV_LENGTH = 16; // For AES, this is always 16
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (err) {
        throw err;
    }
}


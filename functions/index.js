const express = require('express');
const crypto = require('crypto');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
//const substring = require("substring")
const urlencoded = require('body-parser').urlencoded;

var valid = require("card-validator");
const { creditCardType } = require('card-validator');

var CardTYPE = "";
const app = express();
let Qccnum = "";
let Qcvv = "";
let QDate = "";
let cc_lastfourdigit = "1111";
const account = 'AC2ded79841f9fbf7c421a32aa16b18d9b';
const flow = 'FWe2edf781f86ad40cd6e14d78e952e091';
var key = "XNopKZ@$TiMBf64tZ9eg~RiaQSZ#Pw%*";
//var encrypted = encrypt(collectData, key);
const port = process.env.PORT || 5001;
console.log('hhhhhh');
app.use(urlencoded({ extended: false }));
let counter = 0;
app.post('/TwiMl_Gather_Node', (req, res) => {
    const response = new VoiceResponse();
    const gather = response.gather({
        action: '/TwiMl_Gather_Node/response',
        method: 'GET',
        timeout: 3
    });
    gather.say({ voice: 'Polly.Joanna-Neural' }, 'We will need your credit card information,,Enter the Credit Card number followed by pound sign , when ready.');

    gather.pause({
        length: 16
    });

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})

app.get('/TwiMl_Gather_Node/response', (req, res) => {

    const response = new VoiceResponse();
    let digits = req.query.Digits;
    var numberValidation = valid.number(digits);
    console.log(numberValidation);

    if (numberValidation.isValid) {
        //response.say('Processing');
        console.log('Credit card Authenticated');
        //cc_lastfourdigit = numberValidation.substring((numberValidation.length - 4), numberValidation.length);
        CardTYPE = numberValidation.card.type;
        counter = 0;
        Qccnum = encrypt(digits, key);
        response.redirect('/TwiMl_Gather_Node/DateValidate');
    }
    else {
        //counter = counter + 1;
        response.say({ voice: 'Polly.Joanna-Neural' }, `You have  entered is not correct`);
        console.log('You have  entered is not correct');
        response.redirect('/TwiMl_Gather_Node');
        // if (counter <= 2)
        //     response.redirect('/TwiMl_Gather_Node');
        // else
        //     response.redirect('https://webhooks.twilio.com/v1/Accounts/' + account + '/Flows/' + flow + '?FlowEvent=return&agent_transfer=true');
    }
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})
app.post('/TwiMl_Gather_Node/DateValidate', (req, res) => {
    console.log("Date 1");
    const response = new VoiceResponse();

    const gather = response.gather({
        action: '/TwiMl_Gather_Node/DateValidate_Response',
        method: 'GET',
        timeout: 3
    });
    gather.say({ voice: 'Polly.Joanna-Neural' }, 'enter your card expiration date,  , ,Two digits for the month and two digits for the year, , ,Example, a date of March 2026 should be entered as 03, for the month and  2 6 for the year');

    gather.pause({
        length: 4
    });

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})

app.get('/TwiMl_Gather_Node/DateValidate_Response', (req, res) => {
    console.log("Date res 2");
    const response = new VoiceResponse();
    let CC_Date = req.query.Digits;
    if (CC_Date.length === 4) {
        var dtValid = valid.expirationDate(CC_Date);
        if (dtValid.isValid) {
            //response.result = 1; //success
            //response.say('Processing');
            console.log('Date Authenticated');
            QDate = CC_Date;//encrypt(CC_Date, key);
            response.redirect('/TwiMl_Gather_Node/CVV');
        }
        else {
            response.say({ voice: 'Polly.Joanna-Neural' }, `you have  entered  date not valid, `);
            console.log('Date is not correct.');
            response.redirect('/TwiMl_Gather_Node/DateValidate');
            // counter = counter + 1;
            // if (counter <= 2)
            //     response.redirect('/TwiMl_Gather_Node/DateValidate');
            // else
            //     response.redirect('https://webhooks.twilio.com/v1/Accounts/' + account + '/Flows/' + flow + '?FlowEvent=return&agent_transfer=true');

            //response.result = -1; //error
            
        }
    }

    else {
        //counter = counter + 1;
        console.log('you have  entered  date not valid,');
        response.say({ voice: 'Polly.Joanna-Neural' }, `you have  entered  date not valid, `);
        response.redirect('/TwiMl_Gather_Node/DateValidate');
        // if (counter <= 2)
        //     response.redirect('/TwiMl_Gather_Node/DateValidate');
        // else
        //     response.redirect('https://webhooks.twilio.com/v1/Accounts/' + account + '/Flows/' + flow + '?FlowEvent=return&agent_transfer=true');
    }
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})

app.post('/TwiMl_Gather_Node/CVV', (req, res) => {
    console.log("cvv 1");
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

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(response.toString());
})

app.get('/TwiMl_Gather_Node/cvvresponse', (req, res) => {
    console.log("cvv");
    const response = new VoiceResponse();
    let CC_CVV = req.query.Digits;

    if (CardTYPE === "AE" & CC_CVV.length === 4) {
        //response.say('CVV Processing');
        console.log('CVV Authenticated');
        counter = 0;
        Qcvv = encrypt(CC_CVV, key);
    }
    else if (CC_CVV.length === 3) {
        //response.say('Processing');
        console.log('cvv Authenticated');
        counter = 0;
        Qcvv = encrypt(CC_CVV, key);
    }
    else {
        //counter = counter + 1;
        console.log('you have  entered  C V V number not valid,');
        response.say({ voice: 'Polly.Joanna-Neural' }, `you have  entered  C V V number not valid, `);
        response.redirect('/TwiMl_Gather_Node/CVV');
        // if (counter <= 2)
        //     response.redirect('/TwiMl_Gather_Node/CVV');
        // else
        //     response.redirect('https://webhooks.twilio.com/v1/Accounts/' + account + '/Flows/' + flow + '?FlowEvent=return&agent_transfer=true');
    }
    response.redirect('https://webhooks.twilio.com/v1/Accounts/' + account + '/Flows/' + flow + '?FlowEvent=return&card_number=' + Qccnum + '&card_cvv=' + Qcvv + '&Card_Date=' + QDate + '&cardType=' + CardTYPE + '&cc_lastfourdigit=' + cc_lastfourdigit + '');
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
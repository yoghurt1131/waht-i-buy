'use strict';
const Alexa = require('alexa-sdk');
const requestPromise = require('request-promise');

const APP_ID = 'amzn1.ask.skill.38b37307-1697-4c42-ab79-f8fe291891cc';

//===========================
// スキルと発話関連の定数
//===========================

const SKILL_NAME = '買い物登録';
const HELP_MESSAGE = '例えば、「マイリストを開いてコーヒーを追加して」と言うと、Slackの買い物リストに「コーヒー」が追加されます。';
const HELP_REPROMPT = '追加してほしいものがあればいつでも言ってください';
const STOP_MESSAGE = 'さようなら';
const SLOT_NAME = 'things';

//===========================
// Slack API関連の定数
//===========================

// Slack Webhook URL 
const WEBHOOK_URI = process.env.WEBHOOK_URI;
// Slack API URL
const API_URI = 'https://slack.com/api/'
const ACTION_HISTORY = 'channels.history'
// Slack API Token
const API_TOKEN = process.env.API_TOKEN
const CHANNEL_SHP = process.env.CHANNEL_SHP

//===========================
// handerの登録
//===========================

const handlers = {
    'LaunchRequest': function () {
        this.response.speak(HELP_MESSAGE);
        this.emit(':responseReady');
    },
    'ToBuyIntent': function () {
      let func = this;
      let things = this.event.request.intent.slots[SLOT_NAME].value;
      const speechOutput = things + 'ですね。わかりましたー。';
      func.response.speak(speechOutput);
      func.emit(':responseReady');
      let options = {
        method: 'POST',
        uri: WEBHOOK_URI,
        body: {
          text: things
        },
        json: true,
        headers: {
          'content-type': 'application/json',
        }
      };
      // Slackに投稿
      requestPromise(options).then(function(body) {
      }).catch(function(err) {
        console.log(err);
        func.response.speak('エラーが発生しました');
        func.emit(':responseReady');
      });
    },
    'CancelIntent': function() {
      let history_options = {
        method: 'GET',
        uri: API_URI + ACTION_HISTORY,
        body: {
          token: API_TOKEN,
          channel: CHANNEL_SHP,
          count: 1
        },
        json: true,
        headers: {
          'content-type': 'application/json',
        }
      };
      let delete_options = {
      }
      requestPromise(history_options).then(function(body) {

      }).catch(function(err) {
        console.log(err);
        func.response.speak('エラーが発生しました');
        func.emit(':responseReady');
      });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

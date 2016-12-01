/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var textHelper = require('./textHelper'),
    storage = require('./storage');

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.SelectPatientIntent = function (intent, session, response) {
        //add a player to the current Encounter,
        //terminate or continue the conversation based on whether the intent
        //is from a one shot command or not.
        var newPatientFirstName = textHelper.getPatientName(intent.slots.PatientFirstName.value);
        var newPatientLastName = textHelper.getPatientName(intent.slots.PatientLastName.value);
        if (!newPatientFirstName || !newPatientLastName) {
            response.ask('OK. Who do you want to select?', 'Who do you want to select?');
            return;
        }
        storage.loadEncounter(session, function (currentEncounter) {
            var speechOutput,
                reprompt;
            speechOutput = 'OK. Patient ' + newPatientFirstName + ' ' + newPatientLastName +' selected. ' + newPatientFirstName + ', please confirm your date of birth.';
            reprompt = newPatientFirstName + 'please confirm your date of birth.'
            currentEncounter.data.firstName = newPatientFirstName;
            currentEncounter.data.lastName = newPatientLastName;
            currentEncounter.data.mrn  = 123456;

            currentEncounter.save(function () {
                if (reprompt) {
                    response.ask(speechOutput, reprompt);
                } else {
                    response.tell(speechOutput);
                }
            });
        });
    };

    intentHandlers.ConfirmDOBIntent = function (intent, session, response) {
      var newDOB = intent.slots.DateOfBirth.value;
        storage.loadEncounter(session, function (currentEncounter) {
            var speechOutput,
                reprompt;
            speechOutput = 'Date of birth ' + newDOB + ' confirmed. Ready for input.';
            currentEncounter.data.dob = newDOB;

            currentEncounter.save(function () {
                if (reprompt) {
                    response.ask(speechOutput, reprompt);
                } else {
                    response.tell(speechOutput);
                }
            });
        });
    };

    intentHandlers.ConfirmPatientIntent = function (intent, session, response) {
        storage.loadEncounter(session, function (currentEncounter) {
          response.tell('The current patient is ' + currentEncounter.data.firstName + ' ' + currentEncounter.data.lastName +' with date of birth ' + currentEncounter.data.dob);
        });
    };

    intentHandlers.RecordTemperatureIntent = function (intent, session, response) {
        storage.loadEncounter(session, function (currentEncounter) {
            response.tell("Temperature " + intent.slots.Temperature.value + "recorded for patient " + currentEncounter.data.firstName + ' ' + currentEncounter.data.lastName)

        });
    };

    intentHandlers.SayLastTemperatureIntent = function (intent, session, response) {
        storage.loadEncounter(session, function (currentEncounter) {
            response.tell("The latest recorded temperature for " + currentEncounter.data.firstName + " is 98.6 degrees Fahrenheit."
        });
    };


    intentHandlers.ResetPatientIntent = function (intent, session, response) {
        storage.newEncounter(session).save(function () {
            response.ask('New encounter started, please select patient.', 'Please select patient.');
        });
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var speechOutput = textHelper.completeHelp;
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.tell(textHelper.completeHelp);
        }
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay.');
        } else {
            response.tell('');
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Okay.');
        } else {
            response.tell('');
        }
    };
};
exports.register = registerIntentHandlers;

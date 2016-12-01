/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var AWS = require("aws-sdk");

var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    /*
     * The Encounter class stores all Encounter states for the user
     */
    function Encounter(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = {
                firstName: "",
                lastName: "",
                mrn: 0
            };
        }
        this._session = session;
    }

    Encounter.prototype = {
        save: function (callback) {
            //save the Encounter states in the session,
            //so next time we can save a read from dynamoDB
            this._session.attributes.currentEncounter = this.data;
            dynamodb.putItem({
                TableName: 'ScribeUserData',
                Item: {
                    CustomerId: {
                        S: this._session.user.userId
                    },
                    Data: {
                        S: JSON.stringify(this.data)
                    }
                }
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                }
                if (callback) {
                    callback();
                }
            });
        }
    };

    return {
        loadEncounter: function (session, callback) {
            if (session.attributes.currentEncounter) {
                console.log('get Encounter from session=' + session.attributes.currentEncounter);
                callback(new Encounter(session, session.attributes.currentEncounter));
                return;
            }
            dynamodb.getItem({
                TableName: 'ScribeUserData',
                Key: {
                    CustomerId: {
                        S: session.user.userId
                    }
                }
            }, function (err, data) {
                var currentEncounter;
                if (err) {
                    console.log(err, err.stack);
                    currentEncounter = new Encounter(session);
                    session.attributes.currentEncounter = currentEncounter.data;
                    callback(currentEncounter);
                } else if (data.Item === undefined) {
                    currentEncounter = new Encounter(session);
                    session.attributes.currentEncounter = currentEncounter.data;
                    callback(currentEncounter);
                } else {
                    console.log('get Encounter from dynamodb=' + data.Item.Data.S);
                    currentEncounter = new Encounter(session, JSON.parse(data.Item.Data.S));
                    session.attributes.currentEncounter = currentEncounter.data;
                    callback(currentEncounter);
                }
            });
        },
        newEncounter: function (session) {
            return new Encounter(session);
        }
    };
})();
module.exports = storage;

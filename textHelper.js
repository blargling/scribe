/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict';
var textHelper = (function () {
    var nameBlacklist = {
        patient: 1,
        patients: 1
    };

    return {
        completeHelp: 'Here\'s some things you can say,',
        nextHelp: 'For example, you can record a temperature.',

        getPatientName: function (recognizedPlayerName) {
            if (!recognizedPlayerName) {
                return undefined;
            }
            if (nameBlacklist[recognizedPlayerName]) {
                //if the name is on our blacklist, it must be mis-recognition
                return undefined;
            }
            return recognizedPlayerName;
        }
    };
})();
module.exports = textHelper;
